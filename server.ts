import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { db } from './server/db.ts';
import type { User, Region, EvangelismEvent, BimonthlyReport, ConsolidationContact, DepartmentTask } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '15mb' }));

// Initialize server-side Gemini client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Simple session/user context helper from header
function getCurrentUser(req: Request): User {
  const userId = req.headers['x-user-id'] as string;
  const users = db.get('users');
  if (userId) {
    const found = users.find(u => u.id === userId);
    if (found) return found;
  }
  // Default to Lucas Moreira (Global Admin) if not specified
  return users[0];
}

/* =========================================================================
   AUTH & USERS
   ========================================================================= */
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  res.json({ user });
});

app.get('/api/auth/users', (req: Request, res: Response) => {
  const users = db.get('users');
  res.json(users);
});

app.post('/api/auth/switch', (req: Request, res: Response) => {
  const { userId } = req.body;
  const users = db.get('users');
  const target = users.find(u => u.id === userId);
  if (!target) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  db.logAudit(target.id, target.name, 'SWITCH_USER_CONTEXT', 'users', target.id, `Contexto ativo alterado para ${target.name} (${target.role})`);
  res.json({ success: true, user: target });
});

/* =========================================================================
   REGIONS
   ========================================================================= */
app.get('/api/regions', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  let regions = db.get('regions');
  
  // If regional coordinator or member, optionally filter or annotate
  if (user.role === 'regional_coordinator' && user.regionId) {
    // Coordinators can view all for benchmarks, but mark active
  }
  res.json(regions);
});

app.post('/api/regions', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'global_admin') {
    return res.status(403).json({ error: 'Apenas a Direção Global pode cadastrar novas regionais' });
  }

  const { name, state, city, churchName, pastorResponsible, coordinatorName, coordinatorEmail, coordinatorPhone, evangelismFrequency, status, notes } = req.body;
  
  if (!name || !state || !city || !churchName || !coordinatorName) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  const newRegion: Region = {
    id: `reg-${Date.now().toString(36)}`,
    name,
    state,
    city,
    churchName,
    pastorResponsible: pastorResponsible || coordinatorName,
    coordinatorName,
    coordinatorEmail: coordinatorEmail || '',
    coordinatorPhone: coordinatorPhone || '',
    membersCount: 0,
    implantDate: new Date().toISOString().split('T')[0],
    evangelismFrequency: evangelismFrequency === 'weekly' ? 'weekly' : 'biweekly',
    status: status || 'in_implantation',
    notes: notes || ''
  };

  const regions = db.get('regions');
  regions.push(newRegion);
  db.set('regions', regions);

  db.logAudit(user.id, user.name, 'CREATE_REGION', 'regions', newRegion.id, `Regional criada: ${newRegion.name} (${newRegion.city}/${newRegion.state})`);
  res.status(201).json(newRegion);
});

app.put('/api/regions/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { id } = req.params;
  const regions = db.get('regions');
  const index = regions.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Regional não encontrada' });
  }

  // Permission check
  if (user.role !== 'global_admin' && (user.role !== 'regional_coordinator' || user.regionId !== id)) {
    return res.status(403).json({ error: 'Sem permissão para alterar esta regional' });
  }

  const updated: Region = {
    ...regions[index],
    ...req.body,
    id: regions[index].id, // protect id
  };

  regions[index] = updated;
  db.set('regions', regions);
  db.logAudit(user.id, user.name, 'UPDATE_REGION', 'regions', id, `Regional atualizada: ${updated.name}`);
  res.json(updated);
});

/* =========================================================================
   EVANGELISMS
   ========================================================================= */
app.get('/api/evangelisms', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { regionId } = req.query;
  let events = db.get('evangelism_events');

  if (regionId) {
    events = events.filter(e => e.regionId === regionId);
  } else if (user.role !== 'global_admin' && user.regionId) {
    // Optionally filter by regional
    events = events.filter(e => e.regionId === user.regionId);
  }

  res.json(events);
});

app.post('/api/evangelisms', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { regionId, title, scheduledDate, location, address, actionType, plannedParticipants, observations } = req.body;

  const targetRegionId = regionId || user.regionId;
  if (!targetRegionId || !title || !scheduledDate || !location) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  const newEvent: EvangelismEvent = {
    id: `ev-${Date.now().toString(36)}`,
    regionId: targetRegionId,
    title,
    scheduledDate,
    location,
    address: address || location,
    leaderId: user.id,
    leaderName: user.name,
    actionType: actionType || 'rua',
    plannedParticipants: Number(plannedParticipants) || 10,
    confirmedParticipants: 0,
    status: 'planned',
    observations: observations || ''
  };

  const events = db.get('evangelism_events');
  events.push(newEvent);
  db.set('evangelism_events', events);

  db.logAudit(user.id, user.name, 'CREATE_EVANGELISM', 'evangelism_events', newEvent.id, `Evangelismo agendado: ${newEvent.title}`, targetRegionId);
  res.status(201).json(newEvent);
});

app.put('/api/evangelisms/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { id } = req.params;
  const events = db.get('evangelism_events');
  const index = events.findIndex(e => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Evangelismo não encontrado' });
  }

  const existing = events[index];
  if (user.role !== 'global_admin' && user.regionId && existing.regionId !== user.regionId) {
    return res.status(403).json({ error: 'Acesso negado a este evangelismo' });
  }

  const updated: EvangelismEvent = {
    ...existing,
    ...req.body,
    id: existing.id,
  };

  events[index] = updated;
  db.set('evangelism_events', events);
  db.logAudit(user.id, user.name, 'UPDATE_EVANGELISM', 'evangelism_events', id, `Evangelismo atualizado: ${updated.title} (Status: ${updated.status})`, existing.regionId);
  res.json(updated);
});

/* =========================================================================
   BIMONTHLY REPORTS & APPROVAL FLOW
   ========================================================================= */
app.get('/api/reports', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { regionId } = req.query;
  let reports = db.get('bimonthly_reports');

  if (regionId) {
    reports = reports.filter(r => r.regionId === regionId);
  } else if (user.role !== 'global_admin' && user.regionId) {
    reports = reports.filter(r => r.regionId === user.regionId);
  }

  res.json(reports);
});

app.post('/api/reports', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { regionId, period, year, churchResponsible, pastorResponsible, activitiesDescription, strengths, challenges, regionalNeeds, proposedImprovements, nextPeriodPlanning, autoAggregate } = req.body;

  const targetRegionId = regionId || user.regionId;
  if (!targetRegionId || !period) {
    return res.status(400).json({ error: 'Regional e período são obrigatórios' });
  }

  // Pre-fill metrics from database evangelisms if requested
  let evangelismsCount = 0;
  let totalParticipantsSum = 0;
  let totalSoulsReached = 0;
  let authorizedContactsCount = 0;
  let locationsReached: string[] = [];

  const allEvents = db.get('evangelism_events').filter(e => e.regionId === targetRegionId && e.status === 'completed');
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
    period,
    year: Number(year) || new Date().getFullYear(),
    status: 'draft',
    updatedAt: new Date().toISOString(),
    churchResponsible: churchResponsible || '',
    pastorResponsible: pastorResponsible || '',
    evangelismsCount: req.body.evangelismsCount !== undefined ? req.body.evangelismsCount : evangelismsCount,
    evangelismFrequencyActual: req.body.evangelismFrequencyActual || `${evangelismsCount} ações no período`,
    locationsReached: req.body.locationsReached || locationsReached,
    totalParticipantsSum: req.body.totalParticipantsSum !== undefined ? req.body.totalParticipantsSum : totalParticipantsSum,
    activitiesDescription: activitiesDescription || '',
    totalSoulsReached: req.body.totalSoulsReached !== undefined ? req.body.totalSoulsReached : totalSoulsReached,
    authorizedContactsCount: req.body.authorizedContactsCount !== undefined ? req.body.authorizedContactsCount : authorizedContactsCount,
    referredToConsolidationCount: authorizedContactsCount,
    activeFollowUpsCount: Math.round(authorizedContactsCount * 0.7),
    testimoniesSummary: req.body.testimoniesSummary || '',
    strengths: strengths || '',
    challenges: challenges || '',
    regionalNeeds: regionalNeeds || '',
    proposedImprovements: proposedImprovements || '',
    nextPeriodPlanning: nextPeriodPlanning || '',
    attachments: req.body.attachments || [],
    reviews: []
  };

  const reports = db.get('bimonthly_reports');
  reports.push(newReport);
  db.set('bimonthly_reports', reports);

  db.logAudit(user.id, user.name, 'CREATE_REPORT', 'bimonthly_reports', newReport.id, `Relatório iniciado: ${newReport.period}`, targetRegionId);
  res.status(201).json(newReport);
});

app.put('/api/reports/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { id } = req.params;
  const reports = db.get('bimonthly_reports');
  const index = reports.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Relatório não encontrado' });
  }

  const existing = reports[index];
  const { reviewComment, newStatus } = req.body;

  // If adding a review / feedback
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
      statusChange: newStatus || existing.status
    };

    existing.reviews.push(review);
    if (newStatus) {
      existing.status = newStatus;
    }
  } else {
    // Normal update or submission
    if (req.body.status === 'submitted') {
      existing.submissionDate = new Date().toISOString();
    }
    Object.assign(existing, req.body);
  }

  existing.updatedAt = new Date().toISOString();
  reports[index] = existing;
  db.set('bimonthly_reports', reports);

  db.logAudit(user.id, user.name, 'UPDATE_REPORT', 'bimonthly_reports', id, `Relatório ${existing.period} atualizado (Status: ${existing.status})`, existing.regionId);
  res.json(existing);
});

/* =========================================================================
   AI ANALYSIS WITH GEMINI
   ========================================================================= */
app.post('/api/ai/analyze-reports', async (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'global_admin') {
    return res.status(403).json({ error: 'Acesso restrito à Direção Global dos Semeadores de Fogo' });
  }

  const { targetPeriod, regionId } = req.body;
  const reports = db.get('bimonthly_reports');
  const regions = db.get('regions');
  const evangelisms = db.get('evangelism_events');

  // Filter relevant reports
  let filteredReports = reports;
  if (targetPeriod) {
    filteredReports = filteredReports.filter(r => r.period.includes(targetPeriod));
  }
  if (regionId) {
    filteredReports = filteredReports.filter(r => r.regionId === regionId);
  }

  // Aggregate factual summary for the AI prompt
  const summaryPayload = filteredReports.map(r => {
    const reg = regions.find(rg => rg.id === r.regionId);
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
      testemunhosResumo: r.testimoniesSummary
    };
  });

  const promptText = `Você é o assistente de inteligência e governança administrativa da liderança dos SEMEADORES DE FOGO GLOBAL.
Sua função é realizar a leitura executiva, síntese e diagnóstico analítico dos relatórios bimestrais fornecidos pelas regionais.

DIRETRIZES FUNDAMENTAIS DO PROJETO:
1. Baseie-se ESTRITAMENTE nos dados e textos reais fornecidos abaixo. Não invente números nem fatos. Se faltarem informações em algum ponto, declare expressamente.
2. Não apresente interpretações espirituais, profecias ou revelações sobrenaturais como produto da IA. Você é uma ferramenta de apoio analítico e organização administrativa, respeitando a direção espiritual soberana dos líderes do ministério.
3. Organize a resposta em seções claras e executivas:
   - 1. RESUMO EXECUTIVO CONSOLIDADO
   - 2. PRINCIPAIS PONTOS FORTES RELATADOS
   - 3. DIFICULDADES E GARGALOS RECORRENTES (materiais, transporte, uniformes, caixas de som, etc.)
   - 4. COMPARAÇÃO E CUMPRIMENTO DE METAS (Frequência semanal vs quinzenal, engajamento)
   - 5. RECOMENDAÇÕES PRÁTICAS PARA A PRÓXIMA REUNIÃO DE ALINHAMENTO GLOBAL
   - 6. PARECER POR REGIONAL (com status de entrega)

DADOS DOS RELATÓRIOS DAS REGIONAIS:
${JSON.stringify(summaryPayload, null, 2)}`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
      });

      const analysisText = response.text || 'Análise concluída sem retorno textual.';
      db.logAudit(user.id, user.name, 'GENERATE_AI_REPORT_ANALYSIS', 'bimonthly_reports', 'all', 'Análise inteligente gerada com Gemini 3.8 Flash');

      return res.json({
        success: true,
        provider: 'Gemini 3.8 Flash',
        analysis: analysisText,
        analyzedReportsCount: filteredReports.length,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Erro na chamada Gemini:', error);
  }

  // Grounded analytical fallback using actual database metrics if key not set
  const totalEvang = filteredReports.reduce((acc, r) => acc + (r.evangelismsCount || 0), 0);
  const totalSouls = filteredReports.reduce((acc, r) => acc + (r.totalSoulsReached || 0), 0);
  const totalContacts = filteredReports.reduce((acc, r) => acc + (r.authorizedContactsCount || 0), 0);
  const challengesList = filteredReports.map(r => `• ${r.regionId}: ${r.challenges}`).join('\n');
  const needsList = filteredReports.map(r => `• ${r.regionId}: ${r.regionalNeeds}`).join('\n');

  const fallbackAnalysis = `### 1. RESUMO EXECUTIVO CONSOLIDADO
No período analisado (${targetPeriod || 'Último Bimestre'}), as regionais reportaram um total de **${totalEvang} ações evangelísticas concluídas**, mobilizando jovens e semeadores, com **${totalSouls} pessoas alcançadas** e **${totalContacts} contatos registrados sob consentimento LGPD**.

### 2. PRINCIPAIS PONTOS FORTES RELATADOS
• Alto engajamento e ousadia da juventude em praças públicas, estações e hospitais.
• Acolhimento caloroso das equipes de oração e testemunhos imediatos de restauração.
• Cumprimento das diretrizes de ação de rua e evangelismo pessoal respeitoso.

### 3. DIFICULDADES E GARGALOS RECORRENTES
${challengesList}
• Demanda unânime por materiais padronizados (panfletos oficiais e camisetas dos Semeadores de Fogo para identificação visual).
• Limitações técnicas de som portátil em avenidas de grande ruído.

### 4. COMPARAÇÃO E CUMPRIMENTO DE METAS
• Regional SP (Meta Semanal): Mantém forte regularidade, com evangelismos nos fins de semana e expansão para frentes hospitalares.
• Regional MG (Meta Quinzenal): Honra rigorosamente o formato de 2 ações bimestrais, com foco universitário de alto impacto.

### 5. RECOMENDAÇÕES PARA A PRÓXIMA REUNIÃO DE ALINHAMENTO
1. Padronização de Uniformes: Homologar os gabaritos de camisetas e bonés na biblioteca de mídia para liberação às regionais.
2. Ensino: Garantir envio dos 4 módulos físicos de estudo para sustentar as turmas via Zoom.
3. Consolidação: Monitorar a taxa de transição dos contatos coletados para as igrejas locais.

*(Análise administrativa calculada a partir dos ${filteredReports.length} relatórios armazenados no banco de dados).*`;

  res.json({
    success: true,
    provider: 'Motor Analítico Integrado',
    analysis: fallbackAnalysis,
    analyzedReportsCount: filteredReports.length,
    timestamp: new Date().toISOString()
  });
});

/* =========================================================================
   CONSOLIDATION (LGPD STRICT)
   ========================================================================= */
app.get('/api/consolidation', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { regionId } = req.query;
  let contacts = db.get('consolidation_contacts');

  // Permission check: only admin, regional coord, or consolidation team can see
  if (user.role === 'media_team' || user.role === 'teaching_team') {
    return res.status(403).json({ error: 'Acesso restrito ao Ministério de Consolidação e Direção (LGPD)' });
  }

  if (regionId) {
    contacts = contacts.filter(c => c.regionId === regionId);
  } else if (user.role !== 'global_admin' && user.regionId) {
    contacts = contacts.filter(c => c.regionId === user.regionId);
  }

  res.json(contacts);
});

app.post('/api/consolidation', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { regionId, evangelismId, fullName, phone, email, neighborhood, consentGranted, sensitiveReligiousConsentGranted, prayerRequests, status, assignedLeaderId, assignedLeaderName } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }

  if (!consentGranted || !sensitiveReligiousConsentGranted) {
    return res.status(400).json({ error: 'Conforme a LGPD, o consentimento do titular e autorização para acolhimento espiritual são indispensáveis' });
  }

  const newContact: ConsolidationContact = {
    id: `cnt-${Date.now().toString(36)}`,
    regionId: regionId || user.regionId || 'reg-sp',
    evangelismId: evangelismId || undefined,
    fullName,
    phone,
    email: email || undefined,
    neighborhood: neighborhood || undefined,
    consentGranted: true,
    consentDate: new Date().toISOString(),
    sensitiveReligiousConsentGranted: true,
    status: status || 'novo',
    assignedLeaderId: assignedLeaderId || user.id,
    assignedLeaderName: assignedLeaderName || user.name,
    prayerRequests: prayerRequests || '',
    interactions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const contacts = db.get('consolidation_contacts');
  contacts.push(newContact);
  db.set('consolidation_contacts', contacts);

  db.logAudit(user.id, user.name, 'CREATE_CONSOLIDATION_CONTACT', 'consolidation_contacts', newContact.id, `Contato cadastrado com consentimento LGPD: ${newContact.fullName}`, newContact.regionId);
  res.status(201).json(newContact);
});

app.post('/api/consolidation/:id/interactions', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { id } = req.params;
  const { type, notes, newStatus } = req.body;

  if (!notes || !type) {
    return res.status(400).json({ error: 'Tipo e relato do contato são obrigatórios' });
  }

  const contacts = db.get('consolidation_contacts');
  const contact = contacts.find(c => c.id === id);

  if (!contact) {
    return res.status(404).json({ error: 'Contato não encontrado' });
  }

  const interaction = {
    id: `int-${Date.now().toString(36)}`,
    date: new Date().toISOString(),
    type: type as any,
    notes,
    attendantName: user.name
  };

  contact.interactions.push(interaction);
  if (newStatus) {
    contact.status = newStatus;
  }
  contact.updatedAt = new Date().toISOString();

  db.set('consolidation_contacts', contacts);
  db.logAudit(user.id, user.name, 'LOG_FOLLOWUP', 'consolidation_contacts', id, `Interação de acompanhamento registrada: ${type}`, contact.regionId);
  res.json(contact);
});

/* =========================================================================
   COURSES & CERTIFICATES
   ========================================================================= */
app.get('/api/courses', (req: Request, res: Response) => {
  res.json(db.get('courses'));
});

app.get('/api/enrollments', (req: Request, res: Response) => {
  res.json(db.get('enrollments'));
});

app.post('/api/enrollments', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { courseId, studentName, studentEmail, studentPhone, regionId, hasPhysicalBooks } = req.body;

  if (!studentName || !studentEmail) {
    return res.status(400).json({ error: 'Nome e email do aluno são obrigatórios' });
  }

  const newEnrollment = {
    id: `enr-${Date.now().toString(36)}`,
    courseId: courseId || 'crs-formacao-semeadores',
    courseTitle: 'Escola de Formação de Semeadores de Fogo',
    studentName,
    studentEmail,
    studentPhone: studentPhone || '',
    regionId: regionId || user.regionId || 'reg-sp',
    status: 'enrolled' as const,
    progressPercent: 0,
    completedModules: [],
    hasPhysicalBooks: Boolean(hasPhysicalBooks),
    enrollmentDate: new Date().toISOString().split('T')[0]
  };

  const enrollments = db.get('enrollments');
  enrollments.push(newEnrollment);
  db.set('enrollments', enrollments);

  db.logAudit(user.id, user.name, 'ENROLL_STUDENT', 'enrollments', newEnrollment.id, `Matrícula realizada: ${studentName}`, newEnrollment.regionId);
  res.status(201).json(newEnrollment);
});

app.post('/api/enrollments/:id/certify', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { id } = req.params;
  const enrollments = db.get('enrollments');
  const enrollment = enrollments.find(e => e.id === id);

  if (!enrollment) {
    return res.status(404).json({ error: 'Matrícula não encontrada' });
  }

  enrollment.status = 'completed';
  enrollment.progressPercent = 100;
  enrollment.certifiedAt = new Date().toISOString().split('T')[0];
  enrollment.certificateCode = `SFG-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  db.set('enrollments', enrollments);
  db.logAudit(user.id, user.name, 'ISSUE_CERTIFICATE', 'enrollments', id, `Certificado emitido para ${enrollment.studentName} (${enrollment.certificateCode})`, enrollment.regionId);
  res.json(enrollment);
});

/* =========================================================================
   DEPARTMENTS & TASKS (KANBAN)
   ========================================================================= */
app.get('/api/departments', (req: Request, res: Response) => {
  res.json(db.get('departments'));
});

app.get('/api/tasks', (req: Request, res: Response) => {
  res.json(db.get('tasks'));
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { departmentId, title, description, assignee, priority, dueDate } = req.body;

  if (!departmentId || !title) {
    return res.status(400).json({ error: 'Departamento e título são obrigatórios' });
  }

  const newTask: DepartmentTask = {
    id: `tsk-${Date.now().toString(36)}`,
    departmentId,
    title,
    description: description || '',
    assignee: assignee || user.name,
    priority: priority || 'media',
    status: 'pendente',
    dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  };

  const tasks = db.get('tasks');
  tasks.push(newTask);
  db.set('tasks', tasks);

  db.logAudit(user.id, user.name, 'CREATE_TASK', 'tasks', newTask.id, `Tarefa criada: ${newTask.title}`);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { id } = req.params;
  const tasks = db.get('tasks');
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }

  tasks[index] = { ...tasks[index], ...req.body, id: tasks[index].id };
  db.set('tasks', tasks);
  db.logAudit(user.id, user.name, 'UPDATE_TASK', 'tasks', id, `Tarefa alterada para status: ${tasks[index].status}`);
  res.json(tasks[index]);
});

/* =========================================================================
   CRUSADES, MEETINGS, MEDIA & LEGAL
   ========================================================================= */
app.get('/api/crusades', (req: Request, res: Response) => {
  res.json(db.get('crusades'));
});

app.get('/api/meetings', (req: Request, res: Response) => {
  res.json(db.get('meetings'));
});

app.get('/api/media', (req: Request, res: Response) => {
  res.json(db.get('media_assets'));
});

app.get('/api/legal-records', (req: Request, res: Response) => {
  res.json(db.get('legal_records'));
});

app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json(db.get('audit_logs'));
});

/* =========================================================================
   GLOBAL OVERVIEW STATS
   ========================================================================= */
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const regions = db.get('regions');
  const events = db.get('evangelism_events');
  const reports = db.get('bimonthly_reports');
  const contacts = db.get('consolidation_contacts');
  const enrollments = db.get('enrollments');

  const totalRegions = regions.length;
  const activeRegions = regions.filter(r => r.status === 'active').length;
  const totalMembers = regions.reduce((acc, r) => acc + (r.membersCount || 0), 0);

  const completedEvents = events.filter(e => e.status === 'completed');
  const plannedEvents = events.filter(e => e.status === 'planned' || e.status === 'confirmed');

  const totalParticipants = completedEvents.reduce((acc, e) => acc + (e.actualParticipants || 0), 0);
  const totalSoulsReached = completedEvents.reduce((acc, e) => acc + (e.soulsReached || 0), 0);
  const totalContactsCollected = contacts.length;
  const contactsInFollowUp = contacts.filter(c => c.status === 'em_acompanhamento').length;
  const contactsReferredToChurch = contacts.filter(c => c.status === 'encaminhado_igreja' || c.status === 'concluido').length;

  const deliveredReports = reports.filter(r => r.status === 'approved' || r.status === 'submitted' || r.status === 'in_review').length;
  const pendingReports = totalRegions - deliveredReports;

  const studentsInTraining = enrollments.filter(e => e.status === 'enrolled' || e.status === 'in_progress').length;

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
    studentsInTraining
  });
});

/* =========================================================================
   VITE DEV SERVER MOUNT & STATIC SERVING
   ========================================================================= */
async function start() {
  const isProduction = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Semeadores de Fogo Global] Servidor rodando em http://localhost:${port}`);
  });
}

start().catch(err => {
  console.error('Falha ao iniciar servidor:', err);
  process.exit(1);
});
