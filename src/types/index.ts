export type RoleType = 
  | 'global_admin'
  | 'regional_coordinator'
  | 'evangelism_leader'
  | 'consolidation_team'
  | 'teaching_team'
  | 'media_team';

export interface User {
  authUserId?: string;
  id: string;
  name: string;
  email: string;
  role: RoleType;
  regionId?: string; // Empty if global_admin
  departmentId?: string;
  avatar?: string;
  phone?: string;
  active?: boolean;
  passwordHash?: string; // Stored server-side only, never returned to client
}

export interface AIAnalysisRecord {
  id: string;
  targetPeriod: string;
  regionId?: string;
  provider: string;
  analysis: string;
  reportData?: unknown;
  dataFingerprint?: string;
  analyzedReportsCount: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export type RegionalStatus = 'active' | 'in_implantation' | 'paused';
export type RegionalFrequency = 'weekly' | 'biweekly';

export interface Region {
  id: string;
  name: string;
  state: string;
  city: string;
  churchName: string;
  pastorResponsible: string;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  membersCount: number;
  implantDate: string;
  evangelismFrequency: RegionalFrequency;
  status: RegionalStatus;
  notes?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  regionId: string;
  departmentId?: string;
  joinedDate: string;
  active: boolean;
}

export type EvangelismStatus = 'planned' | 'confirmed' | 'completed' | 'cancelled';
export type EvangelismType = 'rua' | 'praca' | 'hospital' | 'escola_universidade' | 'presidio' | 'impacto_noturno' | 'casa_em_casa';

export interface EvangelismEvent {
  id: string;
  regionId: string;
  title: string;
  scheduledDate: string; // ISO date-time
  location: string;
  address: string;
  leaderId: string;
  leaderName: string;
  actionType: EvangelismType;
  plannedParticipants: number;
  confirmedParticipants: number;
  status: EvangelismStatus;
  observations?: string;
  // Post execution fields
  actualParticipants?: number;
  soulsReached?: number;
  authorizedContacts?: number;
  generalReport?: string;
  positives?: string;
  challenges?: string;
  testimonies?: string[];
  photos?: string[];
  suggestions?: string;
  completedAt?: string;
}

export type ReportStatus = 'draft' | 'submitted' | 'in_review' | 'approved' | 'returned';

export interface ReportReview {
  id: string;
  authorId: string;
  authorName: string;
  comment: string;
  timestamp: string;
  statusChange?: ReportStatus;
}

export interface BimonthlyReport {
  id: string;
  regionId: string;
  coordinatorId: string;
  coordinatorName: string;
  period: string; // e.g. "5º Bimestre (Set/Out 2026)"
  year: number;
  status: ReportStatus;
  submissionDate?: string;
  updatedAt: string;
  
  // Section 1: Identification
  churchResponsible: string;
  pastorResponsible: string;
  
  // Section 2: Activities
  evangelismsCount: number;
  evangelismFrequencyActual: string;
  locationsReached: string[];
  totalParticipantsSum: number;
  activitiesDescription: string;
  
  // Section 3: Results
  totalSoulsReached: number;
  authorizedContactsCount: number;
  referredToConsolidationCount: number;
  activeFollowUpsCount: number;
  testimoniesSummary: string;
  
  // Section 4: Evaluation
  strengths: string;
  challenges: string;
  regionalNeeds: string;
  proposedImprovements: string;
  nextPeriodPlanning: string;
  
  // Section 5: Attachments
  attachments: string[];
  
  // Reviews & Global Feedback
  reviews: ReportReview[];
}

export type ConsolidationStatus = 
  | 'novo'
  | 'aguardando_contato'
  | 'em_acompanhamento'
  | 'encaminhado_igreja'
  | 'concluido'
  | 'sem_interesse';

export interface FollowUpInteraction {
  id: string;
  date: string;
  type: 'ligacao' | 'whatsapp' | 'visita' | 'culto' | 'estudo';
  notes: string;
  attendantName: string;
}

export interface ConsolidationContact {
  id: string;
  regionId: string;
  evangelismId?: string;
  fullName: string;
  phone: string;
  email?: string;
  neighborhood?: string;
  consentGranted: boolean;
  consentDate: string;
  sensitiveReligiousConsentGranted: boolean; // LGPD sensitive data consent
  status: ConsolidationStatus;
  assignedLeaderId: string;
  assignedLeaderName: string;
  prayerRequests?: string;
  referredChurchName?: string;
  interactions: FollowUpInteraction[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  order: number;
  title: string;
  description: string;
  physicalBookRequired: boolean;
  durationWeeks: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  durationMonths: number;
  isFreeForYouth: boolean;
  zoomMeetingUrl: string;
  nextBatchDate: string;
  modules: CourseModule[];
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  regionId: string;
  status: 'enrolled' | 'in_progress' | 'completed';
  progressPercent: number;
  completedModules: string[];
  hasPhysicalBooks: boolean;
  enrollmentDate: string;
  certifiedAt?: string;
  certificateCode?: string;
}

export interface CrusadeChecklistItem {
  id: string;
  category: 'Logística' | 'Intercessão' | 'Adoração' | 'Evangelismo' | 'Divulgação' | 'Hospedagem';
  task: string;
  completed: boolean;
  assignee: string;
}

export interface CrusadeEvent {
  id: string;
  title: string;
  regionId: string;
  city: string;
  state: string;
  venue: string;
  startDate: string;
  endDate: string;
  coordinator: string;
  status: 'planning' | 'confirmed' | 'ongoing' | 'concluded';
  budgetEstimate: number;
  checklist: CrusadeChecklistItem[];
  intercessionTeamCount: number;
  worshipTeamCount: number;
  evangelismTeamCount: number;
  results?: {
    estimatedAttendance: number;
    decisionsReached: number;
    contactsCollected: number;
    notes: string;
  };
}

export interface DepartmentTask {
  id: string;
  departmentId: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'pendente' | 'em_andamento' | 'em_revisao' | 'concluido';
  dueDate: string;
}

export interface Department {
  id: string;
  number: number;
  name: string;
  coordinator: string;
  description: string;
  members: string[];
  objectives: string[];
}

export interface LeadershipMeeting {
  id: string;
  title: string;
  scheduledAt: string;
  isBimonthlyAlignment: boolean;
  coordinator: string;
  agenda: string[];
  attendees: string[];
  decisions: string[];
  minutesText: string;
  actionItems: Array<{
    id: string;
    task: string;
    assignee: string;
    deadline: string;
    completed: boolean;
  }>;
}

export interface MediaAsset {
  id: string;
  title: string;
  category: 'identidade' | 'vestuario' | 'panfletos' | 'redes_sociais' | 'documentos';
  fileFormat: string;
  fileSize: string;
  previewUrl: string;
  description: string;
  downloadUrl: string;
}

export interface LegalFinancialRecord {
  id: string;
  category: 'orcamento_evento' | 'viagem_implantacao' | 'patrimonio_marca' | 'politica_custeio' | 'ativo_digital';
  title: string;
  details: string;
  responsiblePerson: string;
  updatedAt: string;
  status: string;
  value?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
  regionId?: string;
}
