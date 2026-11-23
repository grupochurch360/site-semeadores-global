import express, { type Request, type Response, type NextFunction } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { ZodType } from 'zod';
import { storage } from './storage.ts';
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
  sanitizeUser,
} from './auth.ts';
import { LoginRateLimiter } from './rateLimit.ts';
import { getSupabaseAdmin } from './supabase.ts';
import {
  StructuredReportSchema,
  buildStructuredReportPrompt,
  buildFallbackStructuredReport,
  extractJsonFromModelText,
  renderOfficialReportHtml,
  computeDataFingerprint,
  parsePeriodMetadata,
  reconcileStructuredReportWithDb,
  formatPlainSummary,
  type StructuredReportData,
} from './reportTemplate.ts';
import {
  loginSchema,
  changePasswordSchema,
  createUserSchema,
  updateUserSchema,
  createRegionSchema,
  updateRegionSchema,
  createMemberSchema,
  updateMemberSchema,
  createEvangelismSchema,
  updateEvangelismSchema,
  createReportSchema,
  updateReportSchema,
  createConsolidationSchema,
  updateConsolidationSchema,
  createInteractionSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  createTaskSchema,
  updateTaskSchema,
  createCrusadeSchema,
  updateCrusadeSchema,
  createMeetingSchema,
  updateMeetingSchema,
  createMediaSchema,
  createLegalRecordSchema,
  updateLegalRecordSchema,
  createCourseSchema,
  updateCourseSchema,
  uploadUrlSchema,
} from './schemas.ts';
import type {
  User,
  RoleType,
  Region,
  Member,
  Department,
  EvangelismEvent,
  BimonthlyReport,
  ConsolidationContact,
  DepartmentTask,
  CrusadeEvent,
  LeadershipMeeting,
  MediaAsset,
  LegalFinancialRecord,
  Course,
  AIAnalysisRecord,
} from '../src/types/index.ts';

dotenv.config();

export interface AuthenticatedRequest extends Request {
  user?: User;
}

function parseBody<T>(schema: ZodType<T>, body: unknown, res: Response): T | null {
  const result = schema.safeParse(body ?? {});
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    res.status(400).json({
      error: firstIssue ? `${firstIssue.path.join('.') || 'dados'}: ${firstIssue.message}` : 'Dados inválidos',
      issues: result.error.issues,
    });
    return null;
  }
  return result.data;
}

export function getBimesterDateRange(
  period: string,
  year: number,
  explicitStart?: string,
  explicitEnd?: string
): { start: Date; end: Date } | null {
  if (explicitStart && explicitEnd) {
    const start = new Date(explicitStart);
    const end = new Date(explicitEnd);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      return { start, end };
    }
  }
  const match = period.match(/([1-6])\s*[º°o]?/i);
  if (!match) return null;
  const bimester = Number(match[1]);
  const startMonth = (bimester - 1) * 2; // 0-indexed: 1º -> Jan (0), 5º -> Set (8)
  const start = new Date(Date.UTC(year, startMonth, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, startMonth + 2, 0, 23, 59, 59, 999));
  return { start, end };
}

async function ensureSeededPasswords() {
  const defaultPassword = process.env.DEFAULT_DEV_PASSWORD || 'Semeadores@2026';
  const users = await storage.getAll('users');
  let changed = false;
  for (const u of users) {
    if (!u.passwordHash) {
      u.passwordHash = hashPassword(defaultPassword);
      changed = true;
    }
    if (u.active === undefined) {
      u.active = true;
      changed = true;
    }
  }
  if (changed) {
    await storage.saveAll('users', users);
  }
}

export function createApp(options?: { loginMaxAttempts?: number; useLiveAI?: boolean }) {
  void ensureSeededPasswords();

  const app = express();
  const loginLimiter = new LoginRateLimiter(options?.loginMaxAttempts ?? 10, 15 * 60 * 1000);

  app.use(express.json({ limit: '15mb' }));

  // Basic security headers & CORS
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    const allowedOrigin = process.env.APP_URL;
    if (allowedOrigin && req.headers.origin === allowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  let ai: GoogleGenAI | null = null;
  if (options?.useLiveAI !== false && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'semeadores-global-app',
        },
      },
    });
  }

  async function resolveUserFromToken(token: string): Promise<User | null> {
    const payload = verifySessionToken(token);
    if (payload) {
      const users = await storage.getAll('users');
      const found = users.find((u) => u.id === payload.sub);
      return found && found.active !== false ? found : null;
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user?.email) {
        const users = await storage.getAll('users');
        const found = users.find((u) => u.email.toLowerCase() === data.user!.email!.toLowerCase());
        return found && found.active !== false ? found : null;
      }
    }
    return null;
  }

  async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Autenticação obrigatória. Faça login para continuar.' });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const user = await resolveUserFromToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Sessão inválida, expirada ou conta desativada.' });
    }

    req.user = user;
    next();
  }

  function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (req.user?.role !== 'global_admin') {
      return res.status(403).json({ error: 'Acesso restrito à Direção Global' });
    }
    next();
  }

  function enforceRegionScope(
    user: User,
    requestedRegionId?: string
  ): { ok: true; regionId?: string } | { ok: false; status: number; error: string } {
    if (user.role === 'global_admin') {
      return { ok: true, regionId: requestedRegionId || undefined };
    }
    if (!user.regionId) {
      return { ok: false, status: 403, error: 'Usuário sem regional vinculada para esta operação' };
    }
    if (requestedRegionId && requestedRegionId !== user.regionId) {
      return { ok: false, status: 403, error: 'Acesso negado aos dados de outra regional/igreja' };
    }
    return { ok: true, regionId: user.regionId };
  }

  /* =========================================================================
     HEALTH CHECK (PUBLIC)
     ========================================================================= */
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      service: 'semeadores-global-api',
      storage: storage.isUsingSupabase() ? 'supabase' : 'local_json',
    });
  });

  /* =========================================================================
     AUTH & SESSION
     ========================================================================= */
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const data = parseBody(loginSchema, req.body, res);
    if (!data) return;

    const emailKey = data.email.trim().toLowerCase();
    const rateKey = `${req.ip || 'local'}:${emailKey}`;
    const rateCheck = loginLimiter.check(rateKey);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `Muitas tentativas de login. Tente novamente em ${rateCheck.retryAfterSeconds}s.`,
      });
    }

    await ensureSeededPasswords();
    const users = await storage.getAll('users');
    const target = users.find((u) => u.email.toLowerCase() === emailKey);

    if (!target || target.active === false || !target.passwordHash || !verifyPassword(data.password, target.passwordHash)) {
      loginLimiter.recordFailure(rateKey);
      return res.status(401).json({ error: 'Email ou senha inválidos, ou conta desativada' });
    }

    loginLimiter.clear(rateKey);
    const token = signSessionToken(target);
    await storage.logAudit(
      target.id,
      target.name,
      'LOGIN',
      'users',
      target.id,
      `Login realizado: ${target.name} (${target.role})`,
      target.regionId
    );

    res.json({
      success: true,
      token,
      user: sanitizeUser(target),
    });
  });

  app.post('/api/auth/logout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    await storage.logAudit(user.id, user.name, 'LOGOUT', 'users', user.id, `Logout realizado: ${user.name}`, user.regionId);
    res.json({ success: true });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: sanitizeUser(req.user!) });
  });

  app.put('/api/auth/password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const data = parseBody(changePasswordSchema, req.body, res);
    if (!data) return;

    const user = req.user!;
    if (!user.passwordHash || !verifyPassword(data.currentPassword, user.passwordHash)) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    const users = await storage.getAll('users');
    const index = users.findIndex((u) => u.id === user.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    users[index].passwordHash = hashPassword(data.newPassword);
    await storage.saveAll('users', users);
    await storage.logAudit(user.id, user.name, 'CHANGE_PASSWORD', 'users', user.id, 'Senha alterada pelo próprio usuário', user.regionId);
    res.json({ success: true });
  });

  /* =========================================================================
     USERS MANAGEMENT
     ========================================================================= */
  app.get('/api/users', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const users = await storage.getAll('users');

    if (user.role === 'global_admin') {
      return res.json(users.map(sanitizeUser));
    }

    if (user.role === 'regional_coordinator' && user.regionId) {
      return res.json(users.filter((u) => u.regionId === user.regionId).map(sanitizeUser));
    }

    return res.status(403).json({ error: 'Sem permissão para listar usuários' });
  });

  app.post('/api/users', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const admin = req.user!;
    const data = parseBody(createUserSchema, req.body, res);
    if (!data) return;

    if (data.role !== 'global_admin' && data.role !== 'teaching_team' && data.role !== 'media_team' && !data.regionId) {
      return res.status(400).json({ error: 'Selecione uma regional para este perfil' });
    }

    const users = await storage.getAll('users');
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return res.status(409).json({ error: 'Já existe um usuário cadastrado com este email' });
    }

    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: data.name,
      email: data.email.toLowerCase(),
      role: data.role,
      regionId: data.role === 'global_admin' ? undefined : data.regionId || undefined,
      departmentId: data.departmentId || undefined,
      phone: data.phone || undefined,
      active: true,
      passwordHash: hashPassword(data.password),
    };

    users.push(newUser);
    await storage.saveAll('users', users);
    await storage.logAudit(
      admin.id,
      admin.name,
      'CREATE_USER',
      'users',
      newUser.id,
      `Usuário criado: ${newUser.name} (${newUser.role})`,
      newUser.regionId
    );
    res.status(201).json(sanitizeUser(newUser));
  });

  app.put('/api/users/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const admin = req.user!;
    const data = parseBody(updateUserSchema, req.body, res);
    if (!data) return;

    const { id } = req.params;
    const users = await storage.getAll('users');
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const existing = users[index];
    const updatedRole: RoleType = data.role || existing.role;
    const updated: User = {
      ...existing,
      name: data.name !== undefined ? data.name : existing.name,
      email: data.email !== undefined ? data.email.toLowerCase() : existing.email,
      role: updatedRole,
      regionId:
        updatedRole === 'global_admin'
          ? undefined
          : data.regionId !== undefined
          ? data.regionId || undefined
          : existing.regionId,
      departmentId: data.departmentId !== undefined ? data.departmentId || undefined : existing.departmentId,
      phone: data.phone !== undefined ? data.phone : existing.phone,
      active: data.active !== undefined ? data.active : existing.active,
      passwordHash: data.password ? hashPassword(data.password) : existing.passwordHash,
      id: existing.id,
    };

    users[index] = updated;
    await storage.saveAll('users', users);
    await storage.logAudit(
      admin.id,
      admin.name,
      'UPDATE_USER',
      'users',
      id,
      `Usuário atualizado: ${updated.name} (ativo: ${updated.active !== false})`,
      updated.regionId
    );
    res.json(sanitizeUser(updated));
  });

  app.delete('/api/users/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const admin = req.user!;
    const { id } = req.params;
    if (id === admin.id) {
      return res.status(400).json({ error: 'Não é possível desativar a própria conta' });
    }

    const users = await storage.getAll('users');
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    users[index].active = false;
    await storage.saveAll('users', users);
    await storage.logAudit(
      admin.id,
      admin.name,
      'DEACTIVATE_USER',
      'users',
      id,
      `Conta desativada: ${users[index].name}`,
      users[index].regionId
    );
    res.json({ success: true, user: sanitizeUser(users[index]) });
  });

  /* =========================================================================
     REGIONS
     ========================================================================= */
  app.get('/api/regions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const regions = await storage.getAll('regions');

    if (user.role === 'global_admin' || !user.regionId) {
      return res.json(regions);
    }

    return res.json(regions.filter((r) => r.id === user.regionId));
  });

  app.post('/api/regions', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const data = parseBody(createRegionSchema, req.body, res);
    if (!data) return;

    const newRegion: Region = {
      id: `reg-${Date.now().toString(36)}`,
      name: data.name,
      state: data.state,
      city: data.city,
      churchName: data.churchName,
      pastorResponsible: data.pastorResponsible || data.coordinatorName,
      coordinatorName: data.coordinatorName,
      coordinatorEmail: data.coordinatorEmail || '',
      coordinatorPhone: data.coordinatorPhone || '',
      membersCount: 0,
      implantDate: new Date().toISOString().split('T')[0],
      evangelismFrequency: data.evangelismFrequency === 'weekly' ? 'weekly' : 'biweekly',
      status: data.status || 'in_implantation',
      notes: data.notes || '',
    };

    const regions = await storage.getAll('regions');
    regions.push(newRegion);
    await storage.saveAll('regions', regions);

    await storage.logAudit(
      user.id,
      user.name,
      'CREATE_REGION',
      'regions',
      newRegion.id,
      `Regional criada: ${newRegion.name} (${newRegion.city}/${newRegion.state})`,
      newRegion.id
    );
    res.status(201).json(newRegion);
  });

  app.put('/api/regions/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const data = parseBody(updateRegionSchema, req.body, res);
    if (!data) return;

    const { id } = req.params;
    const regions = await storage.getAll('regions');
    const index = regions.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Regional não encontrada' });
    }

    if (user.role !== 'global_admin' && (user.role !== 'regional_coordinator' || user.regionId !== id)) {
      return res.status(403).json({ error: 'Sem permissão para alterar esta regional' });
    }

    const updated: Region = {
      ...regions[index],
      ...data,
      id: regions[index].id,
    };

    regions[index] = updated;
    await storage.saveAll('regions', regions);
    await storage.logAudit(user.id, user.name, 'UPDATE_REGION', 'regions', id, `Regional atualizada: ${updated.name}`, id);
    res.json(updated);
  });

  /* =========================================================================
     MEMBERS (REGION-ISOLATED CRUD)
     ========================================================================= */
  app.get('/api/members', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const scope = enforceRegionScope(user, req.query.regionId as string | undefined);
    if (!scope.ok) return res.status(scope.status).json({ error: scope.error });

    let members = await storage.getAll('members');
    if (scope.regionId) {
      members = members.filter((m) => m.regionId === scope.regionId);
    }
    res.json(members);
  });

  app.post('/api/members', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'regional_coordinator', 'evangelism_leader'].includes(user.role)) {
      return res.status(403).json({ error: 'Sem permissão para cadastrar membros' });
    }
    const data = parseBody(createMemberSchema, req.body, res);
    if (!data) return;

    const scope = enforceRegionScope(user, data.regionId);
    if (!scope.ok) return res.status(scope.status).json({ error: scope.error });
    if (!scope.regionId) return res.status(400).json({ error: 'Regional é obrigatória' });

    const newMember: Member = {
      id: `mem-${Date.now().toString(36)}`,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      role: data.role,
      regionId: scope.regionId,
      departmentId: data.departmentId,
      joinedDate: new Date().toISOString().split('T')[0],
      active: data.active ?? true,
    };

    const members = await storage.getAll('members');
    members.push(newMember);
    await storage.saveAll('members', members);
    await storage.logAudit(user.id, user.name, 'CREATE_MEMBER', 'members', newMember.id, `Membro cadastrado: ${newMember.name}`, newMember.regionId);
    res.status(201).json(newMember);
  });

  app.put('/api/members/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'regional_coordinator', 'evangelism_leader'].includes(user.role)) {
      return res.status(403).json({ error: 'Sem permissão para editar membros' });
    }
    const data = parseBody(updateMemberSchema, req.body, res);
    if (!data) return;

    const { id } = req.params;
    const members = await storage.getAll('members');
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) return res.status(404).json({ error: 'Membro não encontrado' });

    const existing = members[index];
    if (user.role !== 'global_admin' && existing.regionId !== user.regionId) {
      return res.status(403).json({ error: 'Acesso negado a membro de outra regional' });
    }

    const updated: Member = {
      ...existing,
      ...data,
      id: existing.id,
      regionId: existing.regionId,
    };
    members[index] = updated;
    await storage.saveAll('members', members);
    await storage.logAudit(user.id, user.name, 'UPDATE_MEMBER', 'members', id, `Membro atualizado: ${updated.name}`, existing.regionId);
    res.json(updated);
  });

  app.delete('/api/members/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'regional_coordinator'].includes(user.role)) {
      return res.status(403).json({ error: 'Sem permissão para remover membros' });
    }
    const { id } = req.params;
    const members = await storage.getAll('members');
    const existing = members.find((m) => m.id === id);
    if (!existing) return res.status(404).json({ error: 'Membro não encontrado' });

    if (user.role !== 'global_admin' && existing.regionId !== user.regionId) {
      return res.status(403).json({ error: 'Acesso negado a membro de outra regional' });
    }

    await storage.deleteById('members', id);
    await storage.logAudit(user.id, user.name, 'DELETE_MEMBER', 'members', id, `Membro removido: ${existing.name}`, existing.regionId);
    res.json({ success: true });
  });

  /* =========================================================================
     EVANGELISMS
     ========================================================================= */
  app.get('/api/evangelisms', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const scope = enforceRegionScope(user, req.query.regionId as string | undefined);
    if (!scope.ok) return res.status(scope.status).json({ error: scope.error });

    let events = await storage.getAll('evangelism_events');
    if (scope.regionId) {
      events = events.filter((e) => e.regionId === scope.regionId);
    }
    res.json(events);
  });

  app.post('/api/evangelisms', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const data = parseBody(createEvangelismSchema, req.body, res);
    if (!data) return;

    const scope = enforceRegionScope(user, data.regionId);
    if (!scope.ok) return res.status(scope.status).json({ error: scope.error });

    const targetRegionId = scope.regionId;
    if (!targetRegionId) return res.status(400).json({ error: 'Regional é obrigatória' });

    const newEvent: EvangelismEvent = {
      id: `ev-${Date.now().toString(36)}`,
      regionId: targetRegionId,
      title: data.title,
      scheduledDate: data.scheduledDate,
      location: data.location,
      address: data.address || data.location,
      leaderId: user.id,
      leaderName: user.name,
      actionType: data.actionType || 'rua',
      plannedParticipants: data.plannedParticipants || 10,
      confirmedParticipants: 0,
      status: 'planned',
      observations: data.observations || '',
    };

    const events = await storage.getAll('evangelism_events');
    events.push(newEvent);
    await storage.saveAll('evangelism_events', events);

    await storage.logAudit(
      user.id,
      user.name,
      'CREATE_EVANGELISM',
      'evangelism_events',
      newEvent.id,
      `Evangelismo agendado: ${newEvent.title}`,
      targetRegionId
    );
    res.status(201).json(newEvent);
  });

  app.put('/api/evangelisms/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const data = parseBody(updateEvangelismSchema, req.body, res);
    if (!data) return;

    const { id } = req.params;
    const events = await storage.getAll('evangelism_events');
    const index = events.findIndex((e) => e.id === id);

    if (index === -1) return res.status(404).json({ error: 'Evangelismo não encontrado' });

    const existing = events[index];
    if (user.role !== 'global_admin' && existing.regionId !== user.regionId) {
      return res.status(403).json({ error: 'Acesso negado a este evangelismo' });
    }

    const updated: EvangelismEvent = {
      ...existing,
      ...data,
      id: existing.id,
      regionId: existing.regionId,
    };

    events[index] = updated;
    await storage.saveAll('evangelism_events', events);
    await storage.logAudit(
      user.id,
      user.name,
      'UPDATE_EVANGELISM',
      'evangelism_events',
      id,
      `Evangelismo atualizado: ${updated.title} (Status: ${updated.status})`,
      existing.regionId
    );
    res.json(updated);
  });

  /* =========================================================================
     BIMONTHLY REPORTS & APPROVAL FLOW (WITH BIMESTER DATE FILTERING)
     ========================================================================= */
  app.get('/api/reports', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const scope = enforceRegionScope(user, req.query.regionId as string | undefined);
    if (!scope.ok) return res.status(scope.status).json({ error: scope.error });

    let reports = await storage.getAll('bimonthly_reports');
    if (scope.regionId) {
      reports = reports.filter((r) => r.regionId === scope.regionId);
    }
    res.json(reports);
  });

  app.post('/api/reports', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (user.role !== 'global_admin' && user.role !== 'regional_coordinator') {
      return res.status(403).json({ error: 'Apenas Coordenação Regional ou Direção Global podem criar relatórios' });
    }

    const data = parseBody(createReportSchema, req.body, res);
    if (!data) return;

    const scope = enforceRegionScope(user, data.regionId);
    if (!scope.ok) return res.status(scope.status).json({ error: scope.error });

    const targetRegionId = scope.regionId;
    if (!targetRegionId) return res.status(400).json({ error: 'Regional é obrigatória' });

    const reportYear = data.year || new Date().getFullYear();
    const dateRange = getBimesterDateRange(data.period, reportYear, data.startDate, data.endDate);

    let evangelismsCount = 0;
    let totalParticipantsSum = 0;
    let totalSoulsReached = 0;
    let authorizedContactsCount = 0;
    const locationsReached: string[] = [];

    const allEvents = (await storage.getAll('evangelism_events')).filter((e) => {
      if (e.regionId !== targetRegionId || e.status !== 'completed') return false;
      if (!dateRange) return true;
      const evDate = new Date(e.completedAt || e.scheduledDate);
      return evDate >= dateRange.start && evDate <= dateRange.end;
    });

    for (const ev of allEvents) {
      evangelismsCount++;
      totalParticipantsSum += ev.actualParticipants || 0;
      totalSoulsReached += ev.soulsReached || 0;
      authorizedContactsCount += ev.authorizedContacts || 0;
      if (ev.location && !locationsReached.includes(ev.location)) {
        locationsReached.push(ev.location);
      }
    }

    const newReport: BimonthlyReport = {
      id: `rep-${targetRegionId}-${Date.now().toString(36)}`,
      regionId: targetRegionId,
      coordinatorId: user.id,
      coordinatorName: user.name,
      period: data.period,
      year: reportYear,
      status: 'draft',
      updatedAt: new Date().toISOString(),
      churchResponsible: data.churchResponsible || '',
      pastorResponsible: data.pastorResponsible || '',
      evangelismsCount: data.evangelismsCount !== undefined ? data.evangelismsCount : evangelismsCount,
      evangelismFrequencyActual: data.evangelismFrequencyActual || `${evangelismsCount} ações no período`,
      locationsReached: data.locationsReached || locationsReached,
      totalParticipantsSum: data.totalParticipantsSum !== undefined ? data.totalParticipantsSum : totalParticipantsSum,
      activitiesDescription: data.activitiesDescription || '',
      totalSoulsReached: data.totalSoulsReached !== undefined ? data.totalSoulsReached : totalSoulsReached,
      authorizedContactsCount:
        data.authorizedContactsCount !== undefined ? data.authorizedContactsCount : authorizedContactsCount,
      referredToConsolidationCount: authorizedContactsCount,
      activeFollowUpsCount: Math.round(authorizedContactsCount * 0.7),
      testimoniesSummary: data.testimoniesSummary || '',
      strengths: data.strengths || '',
      challenges: data.challenges || '',
      regionalNeeds: data.regionalNeeds || '',
      proposedImprovements: data.proposedImprovements || '',
      nextPeriodPlanning: data.nextPeriodPlanning || '',
      attachments: data.attachments || [],
      reviews: [],
    };

    const reports = await storage.getAll('bimonthly_reports');
    reports.push(newReport);
    await storage.saveAll('bimonthly_reports', reports);

    await storage.logAudit(
      user.id,
      user.name,
      'CREATE_REPORT',
      'bimonthly_reports',
      newReport.id,
      `Relatório iniciado: ${newReport.period}`,
      targetRegionId
    );
    res.status(201).json(newReport);
  });

  app.put('/api/reports/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const data = parseBody(updateReportSchema, req.body, res);
    if (!data) return;

    const { id } = req.params;
    const reports = await storage.getAll('bimonthly_reports');
    const index = reports.findIndex((r) => r.id === id);

    if (index === -1) return res.status(404).json({ error: 'Relatório não encontrado' });

    const existing = reports[index];
    if (user.role !== 'global_admin' && (user.role !== 'regional_coordinator' || existing.regionId !== user.regionId)) {
      return res.status(403).json({ error: 'Sem permissão para alterar este relatório' });
    }

    const { reviewComment, newStatus, ...rest } = data;

    if (reviewComment) {
      if (user.role !== 'global_admin') {
        return res.status(403).json({ error: 'Apenas a liderança global pode emitir pareceres e aprovações formais' });
      }

      const review = {
        id: `rev-${Date.now().toString(36)}`,
        authorId: user.id,
        authorName: user.name,
        comment: reviewComment,
        timestamp: new Date().toISOString(),
        statusChange: newStatus || existing.status,
      };

      existing.reviews.push(review);
      if (newStatus) {
        existing.status = newStatus;
      }
    } else {
      if (user.role !== 'global_admin' && rest.status && rest.status !== 'draft' && rest.status !== 'submitted') {
        return res.status(403).json({ error: 'Apenas a Direção Global pode aprovar ou devolver relatórios' });
      }
      if (rest.status === 'submitted') {
        existing.submissionDate = new Date().toISOString();
      }
      Object.assign(existing, rest, { id: existing.id, regionId: existing.regionId });
    }

    existing.updatedAt = new Date().toISOString();
    reports[index] = existing;
    await storage.saveAll('bimonthly_reports', reports);

    await storage.logAudit(
      user.id,
      user.name,
      'UPDATE_REPORT',
      'bimonthly_reports',
      id,
      `Relatório ${existing.period} atualizado (Status: ${existing.status})`,
      existing.regionId
    );
    res.json(existing);
  });

  /* =========================================================================
     AI ANALYSIS WITH GEMINI + OFFICIAL REPORT TEMPLATE (ALWAYS FRESH)
     ========================================================================= */
  app.get('/api/ai/analyses', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
    const analyses = await storage.getAll('ai_analyses');
    res.json(analyses);
  });

  app.get('/api/ai/analyses/:id/html', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const analyses = await storage.getAll('ai_analyses');
    const found = analyses.find((a) => a.id === req.params.id);
    if (!found || !found.reportData) {
      return res.status(404).json({ error: 'Relatório oficial não encontrado' });
    }
    const html = renderOfficialReportHtml(found.reportData as StructuredReportData);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  app.post('/api/ai/analyze-reports', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
    const { targetPeriod, regionId } = req.body || {};

    // Always read live data from storage so every new report/region/evangelism updates the output
    const reports = await storage.getAll('bimonthly_reports');
    const regions = await storage.getAll('regions');
    const evangelisms = await storage.getAll('evangelism_events');

    let filteredReports = reports;
    if (targetPeriod) {
      filteredReports = filteredReports.filter((r) => r.period.includes(targetPeriod));
    }
    if (regionId) {
      filteredReports = filteredReports.filter((r) => r.regionId === regionId);
    }

    const periodMeta = parsePeriodMetadata(targetPeriod);
    const periodYear = Number(periodMeta.ano) || new Date().getFullYear();
    const dateRange = targetPeriod ? getBimesterDateRange(targetPeriod, periodYear) : null;
    const filteredEvangelisms = evangelisms.filter((ev) => {
      if (ev.status !== 'completed') return false;
      if (regionId && ev.regionId !== regionId) return false;
      if (!dateRange) return true;
      const evDate = new Date(ev.completedAt || ev.scheduledDate);
      return evDate >= dateRange.start && evDate <= dateRange.end;
    });

    const reportedRegionIds = new Set(filteredReports.map((r) => r.regionId));
    const missingRegions = regions
      .filter((rg) => !reportedRegionIds.has(rg.id) && (!regionId || rg.id === regionId))
      .map((rg) => rg.name);

    const dataFingerprint = computeDataFingerprint(filteredReports, regions, filteredEvangelisms);

    const summaryPayload = filteredReports.map((r) => {
      const reg = regions.find((rg) => rg.id === r.regionId);
      return {
        regional: reg ? reg.name : r.regionId,
        cidade: reg ? `${reg.city}/${reg.state}` : '',
        frequenciaMeta: reg?.evangelismFrequency,
        bimestre: r.period,
        statusRelatorio: r.status,
        coordenador: r.coordinatorName,
        evangelismosRealizados: r.evangelismsCount,
        participantesSoma: r.totalParticipantsSum,
        almasAlcancadas: r.totalSoulsReached,
        contatosAutorizados: r.authorizedContactsCount,
        locaisAlcancados: r.locationsReached,
        atividadesRelatadas: r.activitiesDescription,
        pontosFortes: r.strengths,
        dificuldades: r.challenges,
        necessidadesRegionais: r.regionalNeeds,
        melhoriasPropostas: r.proposedImprovements,
        planejamentoProximo: r.nextPeriodPlanning,
        testemunhosResumo: r.testimoniesSummary,
      };
    });

    const promptText = buildStructuredReportPrompt(summaryPayload, missingRegions, periodMeta);

    const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const rawThinkingLevel = (process.env.GEMINI_THINKING_LEVEL || 'HIGH').toUpperCase();
    const thinkingLevelMap: Record<string, ThinkingLevel> = {
      HIGH: ThinkingLevel.HIGH,
      MEDIUM: ThinkingLevel.MEDIUM,
      LOW: ThinkingLevel.LOW,
      MINIMAL: ThinkingLevel.MINIMAL,
    };
    const configuredThinkingLevel = thinkingLevelMap[rawThinkingLevel] || ThinkingLevel.HIGH;
    const fallbackModels = (process.env.GEMINI_FALLBACK_MODELS || 'gemini-3.7-flash,gemini-3.5-flash,gemini-3.5-flash-lite')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const modelRoute: Array<{ model: string; thinkingLevel?: ThinkingLevel; label: string }> = [
      { model: primaryModel, thinkingLevel: configuredThinkingLevel, label: `${primaryModel} (${rawThinkingLevel})` },
      ...fallbackModels.map((m) => ({
        model: m,
        thinkingLevel: m.startsWith('gemini-3.7') || m.startsWith('gemini-3.8') ? configuredThinkingLevel : undefined,
        label: `${m} (fallback)`,
      })),
    ];

    let provider = 'Motor Analítico Integrado';
    let structuredReport: StructuredReportData | null = null;
    const failedAttempts: Array<{ model: string; reason: string }> = [];

    if (ai) {
      for (const route of modelRoute) {
        try {
          const response = await ai.models.generateContent({
            model: route.model,
            contents: promptText,
            config: {
              responseMimeType: 'application/json',
              ...(route.thinkingLevel ? { thinkingConfig: { thinkingLevel: route.thinkingLevel } } : {}),
            },
          });
          if (response.text && response.text.trim()) {
            const parsedJson = extractJsonFromModelText(response.text);
            structuredReport = StructuredReportSchema.parse(parsedJson);
            provider = route.label;
            break;
          }
          failedAttempts.push({ model: route.label, reason: 'Retorno vazio' });
        } catch (error: any) {
          const reason = error?.status ? `HTTP ${error.status}` : (error?.message || 'Erro desconhecido').slice(0, 120);
          failedAttempts.push({ model: route.label, reason });
          console.warn(`[Gemini Fallback] ${route.label} falhou (${reason}), tentando próxima rota...`);
        }
      }
    }

    if (!structuredReport) {
      structuredReport = buildFallbackStructuredReport(filteredReports, regions, periodMeta);
    } else {
      structuredReport = reconcileStructuredReportWithDb(structuredReport, filteredReports, regions);
    }

    const html = renderOfficialReportHtml(structuredReport);
    const analysisText = formatPlainSummary(structuredReport);

    const record: AIAnalysisRecord = {
      id: `ai-${Date.now().toString(36)}`,
      targetPeriod: targetPeriod || 'Todos os Bimestres',
      regionId: regionId || undefined,
      provider,
      analysis: analysisText,
      reportData: structuredReport,
      dataFingerprint,
      analyzedReportsCount: filteredReports.length,
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
    };

    const analyses = await storage.getAll('ai_analyses');
    analyses.unshift(record);
    await storage.saveAll('ai_analyses', analyses.slice(0, 100));

    await storage.logAudit(
      user.id,
      user.name,
      'GENERATE_AI_REPORT_ANALYSIS',
      'ai_analyses',
      record.id,
      `Relatório oficial gerado com ${provider} (${filteredReports.length} relatórios, fingerprint ${dataFingerprint})`
    );

    res.json({
      success: true,
      id: record.id,
      provider: record.provider,
      reportData: structuredReport,
      html,
      analysis: record.analysis,
      analyzedReportsCount: record.analyzedReportsCount,
      dataFingerprint,
      fallbackAttempts: failedAttempts,
      timestamp: record.createdAt,
    });
    } catch (err: any) {
      console.error('[AI Analyze Error]:', err);
      res.status(500).json({
        error: typeof err?.message === 'string' ? err.message : 'Erro interno ao gerar relatório oficial',
      });
    }
  });

  /* =========================================================================
     CONSOLIDATION (LGPD STRICT + EDIT + ERASURE/ANONYMIZATION)
     ========================================================================= */
  app.get('/api/consolidation', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'regional_coordinator', 'consolidation_team'].includes(user.role)) {
      return res.status(403).json({ error: 'Acesso restrito ao Ministério de Consolidação e Direção (LGPD)' });
    }

    const scope = enforceRegionScope(user, req.query.regionId as string | undefined);
    if (!scope.ok) return res.status(scope.status).json({ error: scope.error });

    let contacts = await storage.getAll('consolidation_contacts');
    if (scope.regionId) {
      contacts = contacts.filter((c) => c.regionId === scope.regionId);
    }
    res.json(contacts);
  });

  app.post('/api/consolidation', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'regional_coordinator', 'consolidation_team'].includes(user.role)) {
      return res.status(403).json({ error: 'Acesso restrito ao Ministério de Consolidação e Direção (LGPD)' });
    }

    const data = parseBody(createConsolidationSchema, req.body, res);
    if (!data) return;

    const scope = enforceRegionScope(user, data.regionId);
    if (!scope.ok) return res.status(scope.status).json({ error: scope.error });

    if (!data.consentGranted || !data.sensitiveReligiousConsentGranted) {
      return res.status(400).json({
        error: 'Conforme a LGPD, o consentimento do titular e autorização para acolhimento espiritual são indispensáveis',
      });
    }

    const targetRegionId = scope.regionId || 'reg-sp';
    const newContact: ConsolidationContact = {
      id: `cnt-${Date.now().toString(36)}`,
      regionId: targetRegionId,
      evangelismId: data.evangelismId || undefined,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || undefined,
      neighborhood: data.neighborhood || undefined,
      consentGranted: true,
      consentDate: new Date().toISOString(),
      sensitiveReligiousConsentGranted: true,
      status: data.status || 'novo',
      assignedLeaderId: data.assignedLeaderId || user.id,
      assignedLeaderName: data.assignedLeaderName || user.name,
      prayerRequests: data.prayerRequests || '',
      referredChurchName: data.referredChurchName || undefined,
      interactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const contacts = await storage.getAll('consolidation_contacts');
    contacts.push(newContact);
    await storage.saveAll('consolidation_contacts', contacts);

    await storage.logAudit(
      user.id,
      user.name,
      'CREATE_CONSOLIDATION_CONTACT',
      'consolidation_contacts',
      newContact.id,
      `Contato cadastrado com consentimento LGPD: ${newContact.fullName}`,
      newContact.regionId
    );
    res.status(201).json(newContact);
  });

  app.put('/api/consolidation/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'regional_coordinator', 'consolidation_team'].includes(user.role)) {
      return res.status(403).json({ error: 'Acesso restrito ao Ministério de Consolidação e Direção (LGPD)' });
    }

    const data = parseBody(updateConsolidationSchema, req.body, res);
    if (!data) return;

    const { id } = req.params;
    const contacts = await storage.getAll('consolidation_contacts');
    const index = contacts.findIndex((c) => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Contato não encontrado' });

    const existing = contacts[index];
    if (user.role !== 'global_admin' && existing.regionId !== user.regionId) {
      return res.status(403).json({ error: 'Acesso negado a contato de outra regional' });
    }

    const updated: ConsolidationContact = {
      ...existing,
      ...data,
      email: data.email === '' ? undefined : data.email ?? existing.email,
      id: existing.id,
      regionId: existing.regionId,
      updatedAt: new Date().toISOString(),
    };

    contacts[index] = updated;
    await storage.saveAll('consolidation_contacts', contacts);
    await storage.logAudit(
      user.id,
      user.name,
      'UPDATE_CONSOLIDATION_CONTACT',
      'consolidation_contacts',
      id,
      `Contato atualizado (LGPD): ${updated.fullName}`,
      existing.regionId
    );
    res.json(updated);
  });

  app.delete('/api/consolidation/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'regional_coordinator'].includes(user.role)) {
      return res.status(403).json({ error: 'Apenas Coordenação Regional ou Direção Global podem excluir dados sob LGPD' });
    }

    const { id } = req.params;
    const contacts = await storage.getAll('consolidation_contacts');
    const existing = contacts.find((c) => c.id === id);
    if (!existing) return res.status(404).json({ error: 'Contato não encontrado' });

    if (user.role !== 'global_admin' && existing.regionId !== user.regionId) {
      return res.status(403).json({ error: 'Acesso negado a contato de outra regional' });
    }

    await storage.deleteById('consolidation_contacts', id);
    await storage.logAudit(
      user.id,
      user.name,
      'LGPD_ERASE_CONTACT',
      'consolidation_contacts',
      id,
      `Dados pessoais excluídos sob solicitação LGPD (registro ${id})`,
      existing.regionId
    );
    res.json({ success: true, erasedId: id });
  });

  app.post('/api/consolidation/:id/interactions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'regional_coordinator', 'consolidation_team'].includes(user.role)) {
      return res.status(403).json({ error: 'Acesso restrito ao Ministério de Consolidação e Direção (LGPD)' });
    }

    const data = parseBody(createInteractionSchema, req.body, res);
    if (!data) return;

    const { id } = req.params;
    const contacts = await storage.getAll('consolidation_contacts');
    const contact = contacts.find((c) => c.id === id);

    if (!contact) return res.status(404).json({ error: 'Contato não encontrado' });
    if (user.role !== 'global_admin' && contact.regionId !== user.regionId) {
      return res.status(403).json({ error: 'Acesso negado a contato de outra regional' });
    }

    contact.interactions.push({
      id: `int-${Date.now().toString(36)}`,
      date: new Date().toISOString(),
      type: data.type,
      notes: data.notes,
      attendantName: user.name,
    });
    if (data.newStatus) {
      contact.status = data.newStatus;
    }
    contact.updatedAt = new Date().toISOString();

    await storage.saveAll('consolidation_contacts', contacts);
    await storage.logAudit(
      user.id,
      user.name,
      'LOG_FOLLOWUP',
      'consolidation_contacts',
      id,
      `Interação de acompanhamento registrada: ${data.type}`,
      contact.regionId
    );
    res.json(contact);
  });

  /* =========================================================================
     COURSES & ENROLLMENTS
     ========================================================================= */
  app.get('/api/courses', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
    res.json(await storage.getAll('courses'));
  });

  app.post('/api/courses', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'teaching_team'].includes(user.role)) {
      return res.status(403).json({ error: 'Apenas Direção Global ou Equipe de Ensino podem criar cursos' });
    }
    const data = parseBody(createCourseSchema, req.body, res);
    if (!data) return;

    const newCourse: Course = {
      id: `crs-${Date.now().toString(36)}`,
      title: data.title,
      description: data.description || '',
      durationMonths: data.durationMonths || 3,
      isFreeForYouth: data.isFreeForYouth ?? true,
      zoomMeetingUrl: data.zoomMeetingUrl || '',
      nextBatchDate: data.nextBatchDate || new Date().toISOString().split('T')[0],
      modules: [],
    };

    const courses = await storage.getAll('courses');
    courses.push(newCourse);
    await storage.saveAll('courses', courses);
    await storage.logAudit(user.id, user.name, 'CREATE_COURSE', 'courses', newCourse.id, `Curso criado: ${newCourse.title}`);
    res.status(201).json(newCourse);
  });

  app.put('/api/courses/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'teaching_team'].includes(user.role)) {
      return res.status(403).json({ error: 'Apenas Direção Global ou Equipe de Ensino podem editar cursos' });
    }
    const data = parseBody(updateCourseSchema, req.body, res);
    if (!data) return;

    const { id } = req.params;
    const courses = await storage.getAll('courses');
    const index = courses.findIndex((c) => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Curso não encontrado' });

    courses[index] = { ...courses[index], ...data, id: courses[index].id };
    await storage.saveAll('courses', courses);
    await storage.logAudit(user.id, user.name, 'UPDATE_COURSE', 'courses', id, `Curso atualizado: ${courses[index].title}`);
    res.json(courses[index]);
  });

  app.get('/api/enrollments', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    let enrollments = await storage.getAll('enrollments');
    if (user.role !== 'global_admin' && user.role !== 'teaching_team' && user.regionId) {
      enrollments = enrollments.filter((e) => e.regionId === user.regionId);
    }
    res.json(enrollments);
  });

  app.post('/api/enrollments', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const { courseId, studentName, studentEmail, studentPhone, regionId, hasPhysicalBooks } = req.body || {};

    if (!studentName || !studentEmail) {
      return res.status(400).json({ error: 'Nome e email do aluno são obrigatórios' });
    }

    const targetRegionId =
      user.role === 'global_admin' || user.role === 'teaching_team'
        ? regionId || user.regionId || 'reg-sp'
        : user.regionId || 'reg-sp';

    const newEnrollment = {
      id: `enr-${Date.now().toString(36)}`,
      courseId: courseId || 'crs-formacao-semeadores',
      courseTitle: 'Escola de Formação de Semeadores de Fogo',
      studentName,
      studentEmail,
      studentPhone: studentPhone || '',
      regionId: targetRegionId,
      status: 'enrolled' as const,
      progressPercent: 0,
      completedModules: [],
      hasPhysicalBooks: Boolean(hasPhysicalBooks),
      enrollmentDate: new Date().toISOString().split('T')[0],
    };

    const enrollments = await storage.getAll('enrollments');
    enrollments.push(newEnrollment);
    await storage.saveAll('enrollments', enrollments);

    await storage.logAudit(
      user.id,
      user.name,
      'ENROLL_STUDENT',
      'enrollments',
      newEnrollment.id,
      `Matrícula realizada: ${studentName}`,
      newEnrollment.regionId
    );
    res.status(201).json(newEnrollment);
  });

  app.post('/api/enrollments/:id/certify', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (user.role !== 'global_admin' && user.role !== 'teaching_team') {
      return res.status(403).json({ error: 'Apenas Direção Global ou Equipe de Ensino podem emitir certificados' });
    }

    const { id } = req.params;
    const enrollments = await storage.getAll('enrollments');
    const enrollment = enrollments.find((e) => e.id === id);

    if (!enrollment) return res.status(404).json({ error: 'Matrícula não encontrada' });

    enrollment.status = 'completed';
    enrollment.progressPercent = 100;
    enrollment.certifiedAt = new Date().toISOString().split('T')[0];
    enrollment.certificateCode = `SFG-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    await storage.saveAll('enrollments', enrollments);
    await storage.logAudit(
      user.id,
      user.name,
      'ISSUE_CERTIFICATE',
      'enrollments',
      id,
      `Certificado emitido para ${enrollment.studentName} (${enrollment.certificateCode})`,
      enrollment.regionId
    );
    res.json(enrollment);
  });

  /* =========================================================================
     DEPARTMENTS & TASKS (SCOPED BY DEPARTMENT FOR NON-ADMINS)
     ========================================================================= */
  app.get('/api/departments', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
    res.json(await storage.getAll('departments'));
  });

  app.post('/api/departments', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const data = parseBody(createDepartmentSchema, req.body, res);
    if (!data) return;

    const coord = data.coordinator || data.leaderName;
    if (!coord) {
      return res.status(400).json({ error: 'Coordenador responsável é obrigatório' });
    }

    const departments = await storage.getAll('departments');
    const nextNumber = departments.reduce((max, d) => Math.max(max, d.number || 0), 0) + 1;

    const newDept: Department = {
      id: `dept-${Date.now().toString(36)}`,
      number: nextNumber,
      name: data.name,
      coordinator: coord,
      description: data.description || '',
      members: data.members || [coord],
      objectives: data.objectives || [],
    };

    departments.push(newDept);
    await storage.saveAll('departments', departments);
    await storage.logAudit(user.id, user.name, 'CREATE_DEPARTMENT', 'departments', newDept.id, `Departamento criado: ${newDept.name}`);
    res.status(201).json(newDept);
  });

  app.put('/api/departments/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const data = parseBody(updateDepartmentSchema, req.body, res);
    if (!data) return;

    const { id } = req.params;
    const departments = await storage.getAll('departments');
    const index = departments.findIndex((d) => d.id === id);
    if (index === -1) return res.status(404).json({ error: 'Departamento não encontrado' });

    const { leaderName, ...rest } = data;
    const updated: Department = {
      ...departments[index],
      ...rest,
      ...(leaderName ? { coordinator: leaderName } : {}),
      id: departments[index].id,
    };
    departments[index] = updated;
    await storage.saveAll('departments', departments);
    await storage.logAudit(user.id, user.name, 'UPDATE_DEPARTMENT', 'departments', id, `Departamento atualizado: ${updated.name}`);
    res.json(updated);
  });

  app.get('/api/tasks', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    let tasks = await storage.getAll('tasks');
    if (user.role !== 'global_admin' && user.departmentId) {
      tasks = tasks.filter((t) => t.departmentId === user.departmentId);
    }
    res.json(tasks);
  });

  app.post('/api/tasks', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const data = parseBody(createTaskSchema, req.body, res);
    if (!data) return;

    if (user.role !== 'global_admin' && user.departmentId && data.departmentId !== user.departmentId) {
      return res.status(403).json({ error: 'Sem permissão para criar tarefa em outro departamento' });
    }

    const newTask: DepartmentTask = {
      id: `tsk-${Date.now().toString(36)}`,
      departmentId: data.departmentId,
      title: data.title,
      description: data.description || '',
      assignee: data.assignee || user.name,
      priority: data.priority || 'media',
      status: 'pendente',
      dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    };

    const tasks = await storage.getAll('tasks');
    tasks.push(newTask);
    await storage.saveAll('tasks', tasks);

    await storage.logAudit(user.id, user.name, 'CREATE_TASK', 'tasks', newTask.id, `Tarefa criada: ${newTask.title}`);
    res.status(201).json(newTask);
  });

  app.put('/api/tasks/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const data = parseBody(updateTaskSchema, req.body, res);
    if (!data) return;

    const { id } = req.params;
    const tasks = await storage.getAll('tasks');
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Tarefa não encontrada' });

    if (user.role !== 'global_admin' && user.departmentId && tasks[index].departmentId !== user.departmentId) {
      return res.status(403).json({ error: 'Sem permissão para alterar tarefa de outro departamento' });
    }

    tasks[index] = { ...tasks[index], ...data, id: tasks[index].id };
    await storage.saveAll('tasks', tasks);
    await storage.logAudit(user.id, user.name, 'UPDATE_TASK', 'tasks', id, `Tarefa alterada para status: ${tasks[index].status}`);
    res.json(tasks[index]);
  });

  /* =========================================================================
     CRUSADES (REGION-ISOLATED CRUD)
     ========================================================================= */
  app.get('/api/crusades', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const scope = enforceRegionScope(user, req.query.regionId as string | undefined);
    if (!scope.ok) return res.status(scope.status).json({ error: scope.error });

    let crusades = await storage.getAll('crusades');
    if (scope.regionId) {
      crusades = crusades.filter((c) => c.regionId === scope.regionId);
    }
    res.json(crusades);
  });

  app.post('/api/crusades', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'regional_coordinator'].includes(user.role)) {
      return res.status(403).json({ error: 'Apenas Coordenação Regional ou Direção Global podem criar cruzadas' });
    }
    const data = parseBody(createCrusadeSchema, req.body, res);
    if (!data) return;

    const scope = enforceRegionScope(user, data.regionId);
    if (!scope.ok) return res.status(scope.status).json({ error: scope.error });
    if (!scope.regionId) return res.status(400).json({ error: 'Regional é obrigatória' });

    const newCrusade: CrusadeEvent = {
      id: `cru-${Date.now().toString(36)}`,
      title: data.title,
      regionId: scope.regionId,
      city: data.city,
      state: data.state,
      venue: data.venue,
      startDate: data.startDate,
      endDate: data.endDate,
      coordinator: data.coordinator,
      status: data.status || 'planning',
      budgetEstimate: data.budgetEstimate || 0,
      checklist: [],
      intercessionTeamCount: data.intercessionTeamCount || 0,
      worshipTeamCount: data.worshipTeamCount || 0,
      evangelismTeamCount: data.evangelismTeamCount || 0,
    };

    const crusades = await storage.getAll('crusades');
    crusades.push(newCrusade);
    await storage.saveAll('crusades', crusades);
    await storage.logAudit(user.id, user.name, 'CREATE_CRUSADE', 'crusades', newCrusade.id, `Cruzada criada: ${newCrusade.title}`, newCrusade.regionId);
    res.status(201).json(newCrusade);
  });

  app.put('/api/crusades/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'regional_coordinator'].includes(user.role)) {
      return res.status(403).json({ error: 'Sem permissão para editar cruzadas' });
    }
    const data = parseBody(updateCrusadeSchema, req.body, res);
    if (!data) return;

    const { id } = req.params;
    const crusades = await storage.getAll('crusades');
    const index = crusades.findIndex((c) => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Cruzada não encontrada' });

    if (user.role !== 'global_admin' && crusades[index].regionId !== user.regionId) {
      return res.status(403).json({ error: 'Acesso negado a cruzada de outra regional' });
    }

    crusades[index] = { ...crusades[index], ...data, id: crusades[index].id, regionId: crusades[index].regionId };
    await storage.saveAll('crusades', crusades);
    await storage.logAudit(user.id, user.name, 'UPDATE_CRUSADE', 'crusades', id, `Cruzada atualizada: ${crusades[index].title}`, crusades[index].regionId);
    res.json(crusades[index]);
  });

  /* =========================================================================
     MEETINGS, MEDIA, LEGAL & STORAGE UPLOAD URL
     ========================================================================= */
  app.get('/api/meetings', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
    res.json(await storage.getAll('meetings'));
  });

  app.post('/api/meetings', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'regional_coordinator'].includes(user.role)) {
      return res.status(403).json({ error: 'Sem permissão para criar reuniões' });
    }
    const data = parseBody(createMeetingSchema, req.body, res);
    if (!data) return;

    const newMeeting: LeadershipMeeting = {
      id: `mtg-${Date.now().toString(36)}`,
      title: data.title,
      scheduledAt: data.scheduledAt,
      isBimonthlyAlignment: data.isBimonthlyAlignment ?? false,
      coordinator: data.coordinator || user.name,
      agenda: data.agenda || [],
      attendees: data.attendees || [],
      decisions: data.decisions || [],
      minutesText: data.minutesText || '',
      actionItems: [],
    };

    const meetings = await storage.getAll('meetings');
    meetings.push(newMeeting);
    await storage.saveAll('meetings', meetings);
    await storage.logAudit(user.id, user.name, 'CREATE_MEETING', 'meetings', newMeeting.id, `Reunião criada: ${newMeeting.title}`);
    res.status(201).json(newMeeting);
  });

  app.put('/api/meetings/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'regional_coordinator'].includes(user.role)) {
      return res.status(403).json({ error: 'Sem permissão para editar reuniões' });
    }
    const data = parseBody(updateMeetingSchema, req.body, res);
    if (!data) return;

    const { id } = req.params;
    const meetings = await storage.getAll('meetings');
    const index = meetings.findIndex((m) => m.id === id);
    if (index === -1) return res.status(404).json({ error: 'Reunião não encontrada' });

    meetings[index] = { ...meetings[index], ...data, id: meetings[index].id };
    await storage.saveAll('meetings', meetings);
    await storage.logAudit(user.id, user.name, 'UPDATE_MEETING', 'meetings', id, `Reunião atualizada: ${meetings[index].title}`);
    res.json(meetings[index]);
  });

  app.get('/api/media', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
    res.json(await storage.getAll('media_assets'));
  });

  app.post('/api/media', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'media_team'].includes(user.role)) {
      return res.status(403).json({ error: 'Apenas Direção Global ou Equipe de Mídia podem publicar materiais' });
    }
    const data = parseBody(createMediaSchema, req.body, res);
    if (!data) return;

    const newAsset: MediaAsset = {
      id: `med-${Date.now().toString(36)}`,
      title: data.title,
      category: data.category,
      description: data.description || '',
      fileFormat: data.fileFormat || 'PDF',
      fileSize: data.fileSize || 'N/A',
      previewUrl: data.previewUrl || data.downloadUrl,
      downloadUrl: data.downloadUrl,
    };

    const assets = await storage.getAll('media_assets');
    assets.push(newAsset);
    await storage.saveAll('media_assets', assets);
    await storage.logAudit(user.id, user.name, 'CREATE_MEDIA', 'media_assets', newAsset.id, `Material publicado: ${newAsset.title}`);
    res.status(201).json(newAsset);
  });

  app.delete('/api/media/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    if (!['global_admin', 'media_team'].includes(user.role)) {
      return res.status(403).json({ error: 'Sem permissão para remover materiais' });
    }
    const { id } = req.params;
    const assets = await storage.getAll('media_assets');
    if (!assets.some((a) => a.id === id)) return res.status(404).json({ error: 'Material não encontrado' });

    await storage.deleteById('media_assets', id);
    await storage.logAudit(user.id, user.name, 'DELETE_MEDIA', 'media_assets', id, `Material removido: ${id}`);
    res.json({ success: true });
  });

  app.get('/api/legal-records', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
    res.json(await storage.getAll('legal_records'));
  });

  app.post('/api/legal-records', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const data = parseBody(createLegalRecordSchema, req.body, res);
    if (!data) return;

    const newRecord: LegalFinancialRecord = {
      id: `leg-${Date.now().toString(36)}`,
      title: data.title,
      category: data.category,
      details: data.details,
      responsiblePerson: data.responsiblePerson,
      status: data.status || 'pendente',
      value: data.value,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const records = await storage.getAll('legal_records');
    records.push(newRecord);
    await storage.saveAll('legal_records', records);
    await storage.logAudit(user.id, user.name, 'CREATE_LEGAL_RECORD', 'legal_records', newRecord.id, `Registro jurídico/financeiro criado: ${newRecord.title}`);
    res.status(201).json(newRecord);
  });

  app.put('/api/legal-records/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const data = parseBody(updateLegalRecordSchema, req.body, res);
    if (!data) return;

    const { id } = req.params;
    const records = await storage.getAll('legal_records');
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'Registro não encontrado' });

    records[index] = {
      ...records[index],
      ...data,
      id: records[index].id,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    await storage.saveAll('legal_records', records);
    await storage.logAudit(user.id, user.name, 'UPDATE_LEGAL_RECORD', 'legal_records', id, `Registro jurídico/financeiro atualizado: ${records[index].title}`);
    res.json(records[index]);
  });

  app.post('/api/storage/upload-url', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const data = parseBody(uploadUrlSchema, req.body, res);
    if (!data) return;

    const safeName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const prefix = user.regionId || 'global';
    const filePath = `${prefix}/${Date.now()}-${safeName}`;

    try {
      const signed = await storage.createSignedUploadUrl(data.bucket, filePath);
      if (!signed) {
        return res.status(503).json({
          error: 'Supabase Storage não configurado neste ambiente. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.',
        });
      }
      res.json(signed);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao gerar URL de upload' });
    }
  });

  app.get('/api/audit-logs', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const logs = await storage.getAll('audit_logs');
    if (user.role === 'global_admin') {
      return res.json(logs);
    }
    if (user.role === 'regional_coordinator' && user.regionId) {
      return res.json(logs.filter((l) => l.regionId === user.regionId));
    }
    return res.status(403).json({ error: 'Acesso restrito aos logs de auditoria' });
  });

  /* =========================================================================
     DASHBOARD STATS (SCOPED BY ROLE/REGION)
     ========================================================================= */
  app.get('/api/dashboard/stats', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const scope = enforceRegionScope(user, req.query.regionId as string | undefined);
    if (!scope.ok) return res.status(scope.status).json({ error: scope.error });

    const regionFilter = scope.regionId;
    const regions = regionFilter
      ? (await storage.getAll('regions')).filter((r) => r.id === regionFilter)
      : await storage.getAll('regions');
    const events = regionFilter
      ? (await storage.getAll('evangelism_events')).filter((e) => e.regionId === regionFilter)
      : await storage.getAll('evangelism_events');
    const reports = regionFilter
      ? (await storage.getAll('bimonthly_reports')).filter((r) => r.regionId === regionFilter)
      : await storage.getAll('bimonthly_reports');
    const contacts = regionFilter
      ? (await storage.getAll('consolidation_contacts')).filter((c) => c.regionId === regionFilter)
      : await storage.getAll('consolidation_contacts');
    const enrollments = regionFilter
      ? (await storage.getAll('enrollments')).filter((e) => e.regionId === regionFilter)
      : await storage.getAll('enrollments');

    const totalRegions = regions.length;
    const activeRegions = regions.filter((r) => r.status === 'active').length;
    const totalMembers = regions.reduce((acc, r) => acc + (r.membersCount || 0), 0);

    const completedEvents = events.filter((e) => e.status === 'completed');
    const plannedEvents = events.filter((e) => e.status === 'planned' || e.status === 'confirmed');

    const totalParticipants = completedEvents.reduce((acc, e) => acc + (e.actualParticipants || 0), 0);
    const totalSoulsReached = completedEvents.reduce((acc, e) => acc + (e.soulsReached || 0), 0);
    const totalContactsCollected = contacts.length;
    const contactsInFollowUp = contacts.filter((c) => c.status === 'em_acompanhamento').length;
    const contactsReferredToChurch = contacts.filter(
      (c) => c.status === 'encaminhado_igreja' || c.status === 'concluido'
    ).length;

    const deliveredReports = reports.filter(
      (r) => r.status === 'approved' || r.status === 'submitted' || r.status === 'in_review'
    ).length;
    const pendingReports = totalRegions - deliveredReports;

    const studentsInTraining = enrollments.filter((e) => e.status === 'enrolled' || e.status === 'in_progress').length;

    res.json({
      totalRegions,
      activeRegions,
      totalMembers,
      completedEvents: completedEvents.length,
      plannedEvents: plannedEvents.length,
      totalParticipants,
      totalSoulsReached,
      totalContactsCollected,
      contactsInFollowUp,
      contactsReferredToChurch,
      deliveredReports,
      pendingReports: Math.max(0, pendingReports),
      studentsInTraining,
    });
  });

  return app;
}
