import { z } from 'zod';

export const RoleEnum = z.enum([
  'global_admin',
  'regional_coordinator',
  'evangelism_leader',
  'consolidation_team',
  'teaching_team',
  'media_team',
]);

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres'),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Nome é obrigatório'),
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: RoleEnum,
  regionId: z.string().optional(),
  departmentId: z.string().optional(),
  phone: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
  password: z.string().min(6).optional(),
  role: RoleEnum.optional(),
  regionId: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  phone: z.string().optional(),
  active: z.boolean().optional(),
});

export const createRegionSchema = z.object({
  name: z.string().trim().min(2),
  state: z.string().trim().min(2).max(4),
  city: z.string().trim().min(2),
  churchName: z.string().trim().min(2),
  pastorResponsible: z.string().optional(),
  coordinatorName: z.string().trim().min(2),
  coordinatorEmail: z.string().optional(),
  coordinatorPhone: z.string().optional(),
  evangelismFrequency: z.enum(['weekly', 'biweekly']).optional(),
  status: z.enum(['active', 'in_implantation', 'paused']).optional(),
  notes: z.string().optional(),
});

export const updateRegionSchema = createRegionSchema.partial().extend({
  membersCount: z.number().int().min(0).optional(),
});

export const createMemberSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6),
  role: z.string().trim().min(2),
  regionId: z.string().optional(),
  departmentId: z.string().optional(),
  active: z.boolean().optional(),
});

export const updateMemberSchema = createMemberSchema.partial();

export const createEvangelismSchema = z.object({
  regionId: z.string().optional(),
  title: z.string().trim().min(2),
  scheduledDate: z.string().min(4),
  location: z.string().trim().min(2),
  address: z.string().optional(),
  actionType: z
    .enum(['rua', 'praca', 'hospital', 'escola_universidade', 'presidio', 'impacto_noturno', 'casa_em_casa'])
    .optional(),
  plannedParticipants: z.coerce.number().int().min(1).optional(),
  observations: z.string().optional(),
});

export const updateEvangelismSchema = createEvangelismSchema.partial().extend({
  status: z.enum(['planned', 'confirmed', 'completed', 'cancelled']).optional(),
  confirmedParticipants: z.coerce.number().int().min(0).optional(),
  actualParticipants: z.coerce.number().int().min(0).optional(),
  soulsReached: z.coerce.number().int().min(0).optional(),
  authorizedContacts: z.coerce.number().int().min(0).optional(),
  generalReport: z.string().optional(),
  positives: z.string().optional(),
  challenges: z.string().optional(),
  testimonies: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  suggestions: z.string().optional(),
  completedAt: z.string().optional(),
});

export const createReportSchema = z.object({
  regionId: z.string().optional(),
  period: z.string().trim().min(3),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  churchResponsible: z.string().optional(),
  pastorResponsible: z.string().optional(),
  evangelismsCount: z.coerce.number().int().min(0).optional(),
  evangelismFrequencyActual: z.string().optional(),
  locationsReached: z.array(z.string()).optional(),
  totalParticipantsSum: z.coerce.number().int().min(0).optional(),
  activitiesDescription: z.string().optional(),
  totalSoulsReached: z.coerce.number().int().min(0).optional(),
  authorizedContactsCount: z.coerce.number().int().min(0).optional(),
  referredToConsolidationCount: z.coerce.number().int().min(0).optional(),
  activeFollowUpsCount: z.coerce.number().int().min(0).optional(),
  testimoniesSummary: z.string().optional(),
  strengths: z.string().optional(),
  challenges: z.string().optional(),
  regionalNeeds: z.string().optional(),
  proposedImprovements: z.string().optional(),
  nextPeriodPlanning: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export const updateReportSchema = createReportSchema.partial().extend({
  status: z.enum(['draft', 'submitted', 'in_review', 'approved', 'returned']).optional(),
  reviewComment: z.string().optional(),
  newStatus: z.enum(['draft', 'submitted', 'in_review', 'approved', 'returned']).optional(),
});

export const createConsolidationSchema = z.object({
  regionId: z.string().optional(),
  evangelismId: z.string().optional(),
  fullName: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  email: z.string().email().optional().or(z.literal('')),
  neighborhood: z.string().optional(),
  consentGranted: z.boolean(),
  sensitiveReligiousConsentGranted: z.boolean(),
  prayerRequests: z.string().optional(),
  referredChurchName: z.string().optional(),
  status: z
    .enum(['novo', 'aguardando_contato', 'em_acompanhamento', 'encaminhado_igreja', 'concluido', 'sem_interesse'])
    .optional(),
  assignedLeaderId: z.string().optional(),
  assignedLeaderName: z.string().optional(),
});

export const updateConsolidationSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(6).optional(),
  email: z.string().email().optional().or(z.literal('')),
  neighborhood: z.string().optional(),
  prayerRequests: z.string().optional(),
  referredChurchName: z.string().optional(),
  status: z
    .enum(['novo', 'aguardando_contato', 'em_acompanhamento', 'encaminhado_igreja', 'concluido', 'sem_interesse'])
    .optional(),
  consentGranted: z.boolean().optional(),
  sensitiveReligiousConsentGranted: z.boolean().optional(),
});

export const createInteractionSchema = z.object({
  type: z.enum(['ligacao', 'whatsapp', 'visita', 'culto', 'estudo']),
  notes: z.string().trim().min(2),
  newStatus: z
    .enum(['novo', 'aguardando_contato', 'em_acompanhamento', 'encaminhado_igreja', 'concluido', 'sem_interesse'])
    .optional(),
});

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2),
  coordinator: z.string().trim().min(2).optional(),
  leaderName: z.string().trim().min(2).optional(),
  description: z.string().optional(),
  members: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createTaskSchema = z.object({
  departmentId: z.string().min(1),
  title: z.string().trim().min(2),
  description: z.string().optional(),
  assignee: z.string().optional(),
  priority: z.enum(['baixa', 'media', 'alta', 'urgente']).optional(),
  dueDate: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['pendente', 'em_andamento', 'em_revisao', 'concluido']).optional(),
});

export const createCrusadeSchema = z.object({
  title: z.string().trim().min(2),
  regionId: z.string().optional(),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2).max(4),
  venue: z.string().trim().min(2),
  startDate: z.string().min(4),
  endDate: z.string().min(4),
  coordinator: z.string().trim().min(2),
  status: z.enum(['planning', 'confirmed', 'ongoing', 'concluded']).optional(),
  budgetEstimate: z.coerce.number().min(0).optional(),
  intercessionTeamCount: z.coerce.number().int().min(0).optional(),
  worshipTeamCount: z.coerce.number().int().min(0).optional(),
  evangelismTeamCount: z.coerce.number().int().min(0).optional(),
});

export const updateCrusadeSchema = createCrusadeSchema.partial();

export const createMeetingSchema = z.object({
  title: z.string().trim().min(2),
  scheduledAt: z.string().min(4),
  isBimonthlyAlignment: z.boolean().optional(),
  coordinator: z.string().trim().min(2).optional(),
  agenda: z.array(z.string()).optional(),
  attendees: z.array(z.string()).optional(),
  decisions: z.array(z.string()).optional(),
  minutesText: z.string().optional(),
});

export const updateMeetingSchema = createMeetingSchema.partial();

export const createMediaSchema = z.object({
  title: z.string().trim().min(2),
  category: z.enum(['identidade', 'vestuario', 'panfletos', 'redes_sociais', 'documentos']),
  description: z.string().optional(),
  fileFormat: z.string().trim().min(1).optional(),
  fileSize: z.string().trim().min(1).optional(),
  previewUrl: z.string().trim().min(1).optional(),
  downloadUrl: z.string().trim().min(1),
});

export const createLegalRecordSchema = z.object({
  title: z.string().trim().min(2),
  category: z.enum(['orcamento_evento', 'viagem_implantacao', 'patrimonio_marca', 'politica_custeio', 'ativo_digital']),
  details: z.string().trim().min(2),
  responsiblePerson: z.string().trim().min(2),
  status: z.string().trim().min(2).optional(),
  value: z.coerce.number().min(0).optional(),
});

export const updateLegalRecordSchema = createLegalRecordSchema.partial();

export const createCourseSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().optional(),
  durationMonths: z.coerce.number().int().min(1).optional(),
  isFreeForYouth: z.boolean().optional(),
  zoomMeetingUrl: z.string().optional(),
  nextBatchDate: z.string().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const uploadUrlSchema = z.object({
  bucket: z.enum(['evangelism-photos', 'report-attachments', 'media-assets']),
  fileName: z.string().trim().min(1),
});
