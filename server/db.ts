import fs from 'fs';
import path from 'path';
import type {
  User, Region, Member, EvangelismEvent, BimonthlyReport,
  ConsolidationContact, Course, Enrollment, CrusadeEvent,
  Department, DepartmentTask, LeadershipMeeting, MediaAsset,
  LegalFinancialRecord, AuditLog
} from '../src/types/index.ts';

export interface DatabaseSchema {
  users: User[];
  regions: Region[];
  members: Member[];
  evangelism_events: EvangelismEvent[];
  bimonthly_reports: BimonthlyReport[];
  consolidation_contacts: ConsolidationContact[];
  courses: Course[];
  enrollments: Enrollment[];
  crusades: CrusadeEvent[];
  departments: Department[];
  tasks: DepartmentTask[];
  meetings: LeadershipMeeting[];
  media_assets: MediaAsset[];
  legal_records: LegalFinancialRecord[];
  audit_logs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_DATA: DatabaseSchema = {
  users: [
    {
      id: 'usr-lucas',
      name: 'Lucas Moreira',
      email: 'lucas@semeadoresdefogo.org',
      role: 'global_admin',
      phone: '(11) 98765-4321',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-arthur',
      name: 'Arthur',
      email: 'arthur@semeadoresdefogo.org',
      role: 'global_admin',
      phone: '(11) 97654-3210',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-eduardo',
      name: 'Eduardo Felyx',
      email: 'eduardo@semeadoresdefogo.org',
      role: 'global_admin',
      phone: '(11) 96543-2109',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-marcos-sp',
      name: 'Pr. Marcos Oliveira',
      email: 'marcos.sp@semeadoresdefogo.org',
      role: 'regional_coordinator',
      regionId: 'reg-sp',
      phone: '(11) 99123-4567',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-samuel-mg',
      name: 'Pr. Samuel Couto',
      email: 'samuel.mg@semeadoresdefogo.org',
      role: 'regional_coordinator',
      regionId: 'reg-mg',
      phone: '(31) 98234-5678',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-debora-rj',
      name: 'Pra. Débora Santos',
      email: 'debora.rj@semeadoresdefogo.org',
      role: 'regional_coordinator',
      regionId: 'reg-rj',
      phone: '(21) 97345-6789',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-gabriel-evang',
      name: 'Gabriel Martins',
      email: 'gabriel.evang@semeadoresdefogo.org',
      role: 'evangelism_leader',
      regionId: 'reg-sp',
      phone: '(11) 98456-7890'
    },
    {
      id: 'usr-sarah-consol',
      name: 'Sarah Lima',
      email: 'sarah.consol@semeadoresdefogo.org',
      role: 'consolidation_team',
      regionId: 'reg-sp',
      phone: '(11) 99567-8901'
    },
    {
      id: 'usr-mateus-ensino',
      name: 'Mateus Rocha',
      email: 'mateus.ensino@semeadoresdefogo.org',
      role: 'teaching_team',
      phone: '(11) 99678-9012'
    },
    {
      id: 'usr-clara-midia',
      name: 'Clara Nogueira',
      email: 'clara.midia@semeadoresdefogo.org',
      role: 'media_team',
      phone: '(11) 99789-0123'
    }
  ],
  regions: [
    {
      id: 'reg-sp',
      name: 'Regional São Paulo (Capital & Metrópole)',
      state: 'SP',
      city: 'São Paulo',
      churchName: 'Igreja Central da Fé & Missões',
      pastorResponsible: 'Pr. Marcos Oliveira',
      coordinatorName: 'Pr. Marcos Oliveira',
      coordinatorEmail: 'marcos.sp@semeadoresdefogo.org',
      coordinatorPhone: '(11) 99123-4567',
      membersCount: 85,
      implantDate: '2025-03-10',
      evangelismFrequency: 'weekly',
      status: 'active',
      notes: 'Regional de grande porte; evangelismos semanais nos sábados e domingos.'
    },
    {
      id: 'reg-mg',
      name: 'Regional Minas Gerais (Belo Horizonte)',
      state: 'MG',
      city: 'Belo Horizonte',
      churchName: 'Comunidade da Graça Central',
      pastorResponsible: 'Pr. Samuel Couto',
      coordinatorName: 'Pr. Samuel Couto',
      coordinatorEmail: 'samuel.mg@semeadoresdefogo.org',
      coordinatorPhone: '(31) 98234-5678',
      membersCount: 42,
      implantDate: '2025-06-15',
      evangelismFrequency: 'biweekly',
      status: 'active',
      notes: 'Igreja em estruturação; evangelismos quinzenais conforme diretriz ministerial.'
    },
    {
      id: 'reg-rj',
      name: 'Regional Rio de Janeiro (Baixada & Centro)',
      state: 'RJ',
      city: 'Rio de Janeiro',
      churchName: 'Igreja Vida Nova em Cristo',
      pastorResponsible: 'Pra. Débora Santos',
      coordinatorName: 'Pra. Débora Santos',
      coordinatorEmail: 'debora.rj@semeadoresdefogo.org',
      coordinatorPhone: '(21) 97345-6789',
      membersCount: 60,
      implantDate: '2025-08-20',
      evangelismFrequency: 'weekly',
      status: 'active',
      notes: 'Forte presença em praças públicas e orla.'
    },
    {
      id: 'reg-pr',
      name: 'Regional Paraná (Curitiba)',
      state: 'PR',
      city: 'Curitiba',
      churchName: 'Igreja Manancial de Vida',
      pastorResponsible: 'Pr. André Silveira',
      coordinatorName: 'Pr. André Silveira',
      coordinatorEmail: 'andre.pr@semeadoresdefogo.org',
      coordinatorPhone: '(41) 98456-1122',
      membersCount: 34,
      implantDate: '2025-11-05',
      evangelismFrequency: 'biweekly',
      status: 'active',
      notes: 'Equipe jovem atuante em parques e centros universitários.'
    },
    {
      id: 'reg-go',
      name: 'Regional Centro-Oeste (Goiânia)',
      state: 'GO',
      city: 'Goiânia',
      churchName: 'Igreja Renovação Apostólica',
      pastorResponsible: 'Pr. Thiago Viana',
      coordinatorName: 'Pr. Thiago Viana',
      coordinatorEmail: 'thiago.go@semeadoresdefogo.org',
      coordinatorPhone: '(62) 99876-5432',
      membersCount: 28,
      implantDate: '2026-02-12',
      evangelismFrequency: 'biweekly',
      status: 'in_implantation',
      notes: 'Em processo de formação dos primeiros 4 módulos de ensino.'
    }
  ],
  members: [
    {
      id: 'mem-1',
      name: 'Gabriel Martins',
      email: 'gabriel.m@gmail.com',
      phone: '(11) 98456-7890',
      role: 'Líder de Ação de Rua',
      regionId: 'reg-sp',
      departmentId: 'dept-2',
      joinedDate: '2025-04-10',
      active: true
    },
    {
      id: 'mem-2',
      name: 'Sarah Lima',
      email: 'sarah.l@gmail.com',
      phone: '(11) 99567-8901',
      role: 'Coordenadora de Consolidação',
      regionId: 'reg-sp',
      departmentId: 'dept-4',
      joinedDate: '2025-04-15',
      active: true
    },
    {
      id: 'mem-3',
      name: 'Daniel Figueiredo',
      email: 'daniel.f@gmail.com',
      phone: '(31) 98765-1234',
      role: 'Líder de Louvor no Evangelismo',
      regionId: 'reg-mg',
      departmentId: 'dept-2',
      joinedDate: '2025-07-01',
      active: true
    },
    {
      id: 'mem-4',
      name: 'Rebeca Alencar',
      email: 'rebeca.a@gmail.com',
      phone: '(21) 97890-2345',
      role: 'Equipe de Intercessão',
      regionId: 'reg-rj',
      departmentId: 'dept-10',
      joinedDate: '2025-09-10',
      active: true
    }
  ],
  evangelism_events: [
    {
      id: 'ev-sp-01',
      regionId: 'reg-sp',
      title: 'Impacto Evangelístico Praça da Sé & Centro Histórico',
      scheduledDate: '2026-09-13T14:30:00Z',
      location: 'Praça da Sé, São Paulo',
      address: 'Praça da Sé, s/n - Centro, São Paulo - SP',
      leaderId: 'usr-gabriel-evang',
      leaderName: 'Gabriel Martins',
      actionType: 'praca',
      plannedParticipants: 25,
      confirmedParticipants: 28,
      status: 'completed',
      actualParticipants: 28,
      soulsReached: 84,
      authorizedContacts: 29,
      generalReport: 'Ação sobrenatural na praça central. Tivemos oração por curas, pregação pública e entrega de panfletos oficiais.',
      positives: 'Forte presença do Espírito Santo, jovens engajados e acolhimento caloroso das pessoas.',
      challenges: 'Chuva leve no final da tarde; necessidade de capas impermeáveis e baterias sobressalentes para o som.',
      testimonies: [
        'Senhor João (54 anos) recebeu oração por dores crônicas na coluna e relatou alívio instantâneo, aceitando Jesus.',
        'Jovem universitário parou para ouvir a adoração e aceitou o convite para o discipulado de consolidação.'
      ],
      photos: [
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=600'
      ],
      suggestions: 'Providenciar banner com QR Code direto para o portal institucional.',
      completedAt: '2026-09-13T18:00:00Z'
    },
    {
      id: 'ev-sp-02',
      regionId: 'reg-sp',
      title: 'Evangelismo Sobrenatural Av. Paulista (MASP & Ciclovia)',
      scheduledDate: '2026-09-27T15:00:00Z',
      location: 'Vão Livre do MASP',
      address: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
      leaderId: 'usr-gabriel-evang',
      leaderName: 'Gabriel Martins',
      actionType: 'rua',
      plannedParticipants: 20,
      confirmedParticipants: 22,
      status: 'completed',
      actualParticipants: 24,
      soulsReached: 65,
      authorizedContacts: 21,
      generalReport: 'Evangelismo pessoa a pessoa na Paulista aberta de domingo. Abordagens focadas em palavras proféticas e oração com amor.',
      positives: 'Muitos jovens universitários e artistas de rua ouviram a mensagem com respeito e lágrimas.',
      challenges: 'Ruído urbano alto em alguns trechos.',
      testimonies: [
        'Moça em crise de ansiedade relatou profunda paz durante a oração e deixou contato para visita pastoral.'
      ],
      completedAt: '2026-09-27T18:30:00Z'
    },
    {
      id: 'ev-sp-03',
      regionId: 'reg-sp',
      title: 'Evangelismo Hospitalar & Apoio às Famílias',
      scheduledDate: '2026-10-10T09:00:00Z',
      location: 'Hospital das Clínicas (Área Externa & Salas de Espera)',
      address: 'Cerqueira César, São Paulo - SP',
      leaderId: 'usr-marcos-sp',
      leaderName: 'Pr. Marcos Oliveira',
      actionType: 'hospital',
      plannedParticipants: 12,
      confirmedParticipants: 12,
      status: 'completed',
      actualParticipants: 12,
      soulsReached: 42,
      authorizedContacts: 18,
      generalReport: 'Distribuição de kits de conforto, oração com acompanhantes de doentes graves e conforto espiritual.',
      positives: 'Abertura total da direção hospitalar e receptividade tocante.',
      challenges: 'Protocolos de assepsia e silêncio exigem treinamento prévio dos semeadores.',
      completedAt: '2026-10-10T12:00:00Z'
    },
    {
      id: 'ev-sp-04',
      regionId: 'reg-sp',
      title: 'Próxima Mobilização: Parque do Ibirapuera & Jovens',
      scheduledDate: '2026-10-24T15:00:00Z',
      location: 'Parque Ibirapuera - Portão 3',
      address: 'Av. Pedro Álvares Cabral - Vila Mariana, São Paulo - SP',
      leaderId: 'usr-gabriel-evang',
      leaderName: 'Gabriel Martins',
      actionType: 'praca',
      plannedParticipants: 35,
      confirmedParticipants: 26,
      status: 'planned',
      observations: 'Treinamento prático de abordagem após aula do Módulo 1 (Evangelismo Sobrenatural).'
    },
    {
      id: 'ev-mg-01',
      regionId: 'reg-mg',
      title: 'Ação Evangelística Praça da Estação BH',
      scheduledDate: '2026-09-19T16:00:00Z',
      location: 'Praça da Estação, Centro',
      address: 'Praça Rui Barbosa - Centro, Belo Horizonte - MG',
      leaderId: 'usr-samuel-mg',
      leaderName: 'Pr. Samuel Couto',
      actionType: 'praca',
      plannedParticipants: 15,
      confirmedParticipants: 16,
      status: 'completed',
      actualParticipants: 17,
      soulsReached: 51,
      authorizedContacts: 19,
      generalReport: 'Ação quinzenal com grupo de teatro evangelístico e louvor acústico.',
      positives: 'Unidade pastoral e participação expressiva de novos convertidos.',
      challenges: 'Falta de panfletos com logotipo institucional oficial.',
      completedAt: '2026-09-19T19:00:00Z'
    },
    {
      id: 'ev-mg-02',
      regionId: 'reg-mg',
      title: 'Evangelismo Universitário UFMG - Campus Pampulha',
      scheduledDate: '2026-10-03T11:30:00Z',
      location: 'Campus Universitário UFMG',
      address: 'Av. Pres. Antônio Carlos, 6627 - Pampulha, Belo Horizonte - MG',
      leaderId: 'usr-samuel-mg',
      leaderName: 'Pr. Samuel Couto',
      actionType: 'escola_universidade',
      plannedParticipants: 14,
      confirmedParticipants: 14,
      status: 'completed',
      actualParticipants: 15,
      soulsReached: 38,
      authorizedContacts: 14,
      generalReport: 'Conversas no gramado da biblioteca e intervalos de aulas sobre o propósito de vida e Cristo.',
      positives: 'Grandes debates sinceros e quebra de preconceitos.',
      completedAt: '2026-10-03T14:00:00Z'
    },
    {
      id: 'ev-rj-01',
      regionId: 'reg-rj',
      title: 'Impacto Noturno Orla & Praça em Copacabana',
      scheduledDate: '2026-09-20T20:00:00Z',
      location: 'Orla de Copacabana / Posto 4',
      address: 'Av. Atlântica - Copacabana, Rio de Janeiro - RJ',
      leaderId: 'usr-debora-rj',
      leaderName: 'Pra. Débora Santos',
      actionType: 'impacto_noturno',
      plannedParticipants: 22,
      confirmedParticipants: 20,
      status: 'completed',
      actualParticipants: 22,
      soulsReached: 72,
      authorizedContacts: 24,
      generalReport: 'Ação voltada a pessoas em situação de vulnerabilidade e turistas.',
      positives: 'Libertação e testemunhos marcantes de acolhimento.',
      completedAt: '2026-09-21T00:30:00Z'
    }
  ],
  bimonthly_reports: [
    {
      id: 'rep-sp-04-2026',
      regionId: 'reg-sp',
      coordinatorId: 'usr-marcos-sp',
      coordinatorName: 'Pr. Marcos Oliveira',
      period: '4º Bimestre (Jul/Ago 2026)',
      year: 2026,
      status: 'approved',
      submissionDate: '2026-09-02T10:00:00Z',
      updatedAt: '2026-09-05T14:30:00Z',
      churchResponsible: 'Igreja Central da Fé & Missões',
      pastorResponsible: 'Pr. Marcos Oliveira',
      evangelismsCount: 8,
      evangelismFrequencyActual: 'Semanal (8 ações concluídas)',
      locationsReached: ['Praça da Sé', 'Av. Paulista', 'Metrô Santa Cruz', 'Hospital São Paulo'],
      totalParticipantsSum: 172,
      activitiesDescription: 'Evangelismos semanais mantidos com regularidade e excelência. Mobilizamos jovens, adultos e intercessores.',
      totalSoulsReached: 340,
      authorizedContactsCount: 98,
      referredToConsolidationCount: 98,
      activeFollowUpsCount: 74,
      testimoniesSummary: 'Diversas curas testemunhadas e 14 novos membros batizados na igreja local após consolidação.',
      strengths: 'Equipe de intercessão alinhada, pontualidade e liderança jovem madura.',
      challenges: 'Custos com deslocamento de jovens de bairros periféricos.',
      regionalNeeds: 'Subvenção para transporte coletivo e nova remessa de camisetas oficiais.',
      proposedImprovements: 'Organizar escalas de carona solidária e treinamento prévio aos domingos de manhã.',
      nextPeriodPlanning: 'Alcançar hospitais e realizar vigília prévia aos evangelismos de rua.',
      attachments: ['relatorio_presenca_jul_ago.pdf'],
      reviews: [
        {
          id: 'rev-1',
          authorId: 'usr-lucas',
          authorName: 'Lucas Moreira (Direção Global)',
          comment: 'Excelente relatório! Frequência semanal rigorosamente honrada. As ações hospitalares foram inspiradoras.',
          timestamp: '2026-09-05T14:30:00Z',
          statusChange: 'approved'
        }
      ]
    },
    {
      id: 'rep-sp-05-2026',
      regionId: 'reg-sp',
      coordinatorId: 'usr-marcos-sp',
      coordinatorName: 'Pr. Marcos Oliveira',
      period: '5º Bimestre (Set/Out 2026)',
      year: 2026,
      status: 'submitted',
      submissionDate: '2026-10-15T18:00:00Z',
      updatedAt: '2026-10-15T18:00:00Z',
      churchResponsible: 'Igreja Central da Fé & Missões',
      pastorResponsible: 'Pr. Marcos Oliveira',
      evangelismsCount: 3,
      evangelismFrequencyActual: 'Semanal (em andamento)',
      locationsReached: ['Praça da Sé', 'Av. Paulista (MASP)', 'Hospital das Clínicas'],
      totalParticipantsSum: 64,
      activitiesDescription: 'Realizamos ações de impacto profético e evangelismo pessoal nas maiores artérias da cidade.',
      totalSoulsReached: 191,
      authorizedContactsCount: 68,
      referredToConsolidationCount: 68,
      activeFollowUpsCount: 52,
      testimoniesSummary: 'Testemunhos fortes de restauração emocional e pessoas em crise aceitando Cristo.',
      strengths: 'Comprometimento e ousadia espiritual dos evangelistas.',
      challenges: 'Necessidade de mais caixas de som portáteis e material impresso padronizado.',
      regionalNeeds: 'Envio urgente dos 4 módulos físicos de estudo para a nova turma de 30 alunos.',
      proposedImprovements: 'Intensificar o alinhamento com a equipe de consolidação pós-ação.',
      nextPeriodPlanning: 'Preparar a grande Cruzada Metropolitana prevista para o fim do ano.',
      attachments: [],
      reviews: []
    },
    {
      id: 'rep-mg-05-2026',
      regionId: 'reg-mg',
      coordinatorId: 'usr-samuel-mg',
      coordinatorName: 'Pr. Samuel Couto',
      period: '5º Bimestre (Set/Out 2026)',
      year: 2026,
      status: 'submitted',
      submissionDate: '2026-10-14T20:00:00Z',
      updatedAt: '2026-10-14T20:00:00Z',
      churchResponsible: 'Comunidade da Graça Central',
      pastorResponsible: 'Pr. Samuel Couto',
      evangelismsCount: 2,
      evangelismFrequencyActual: 'Quinzenal (2 ações concluídas até o momento)',
      locationsReached: ['Praça da Estação', 'Campus UFMG Pampulha'],
      totalParticipantsSum: 32,
      activitiesDescription: 'Ações quinzenais voltadas a centros de grande circulação e polo universitário mineiro.',
      totalSoulsReached: 89,
      authorizedContactsCount: 33,
      referredToConsolidationCount: 33,
      activeFollowUpsCount: 26,
      testimoniesSummary: 'Reaproximação de 5 jovens desviados e atendimento de estudantes em crise vocacional.',
      strengths: 'Comunhão pastoral e apoio incondicional da igreja local.',
      challenges: 'Falta de camisetas oficiais dos Semeadores para identificação visual nas ruas.',
      regionalNeeds: 'Acesso aos arquivos vetoriais para confecção local ou remessa da liderança global.',
      proposedImprovements: 'Implementar triagem rápida com formulário digital no celular.',
      nextPeriodPlanning: 'Expandir para a Região Metropolitana (Contagem e Betim).',
      attachments: [],
      reviews: []
    }
  ],
  consolidation_contacts: [
    {
      id: 'cnt-1',
      regionId: 'reg-sp',
      evangelismId: 'ev-sp-01',
      fullName: 'João Carlos Ferreira',
      phone: '(11) 98111-2233',
      email: 'joao.carlos@email.com',
      neighborhood: 'Mooca, São Paulo',
      consentGranted: true,
      consentDate: '2026-09-13T16:00:00Z',
      sensitiveReligiousConsentGranted: true,
      status: 'encaminhado_igreja',
      assignedLeaderId: 'usr-sarah-consol',
      assignedLeaderName: 'Sarah Lima',
      prayerRequests: 'Saúde física e restauração familiar com os filhos.',
      referredChurchName: 'Igreja Central da Fé & Missões',
      interactions: [
        {
          id: 'int-1',
          date: '2026-09-15T10:00:00Z',
          type: 'ligacao',
          notes: 'Primeiro contato realizado. Sr. João estava grato e aceitou receber mensagem semanal de oração.',
          attendantName: 'Sarah Lima'
        },
        {
          id: 'int-2',
          date: '2026-09-20T19:00:00Z',
          type: 'culto',
          notes: 'Compareceu ao culto de celebração com sua esposa. Foi apresentado ao Pr. Marcos.',
          attendantName: 'Sarah Lima'
        }
      ],
      createdAt: '2026-09-13T16:30:00Z',
      updatedAt: '2026-09-20T21:00:00Z'
    },
    {
      id: 'cnt-2',
      regionId: 'reg-sp',
      evangelismId: 'ev-sp-02',
      fullName: 'Larissa Albuquerque',
      phone: '(11) 97222-3344',
      email: 'larissa.a@usp.br',
      neighborhood: 'Pinheiros, São Paulo',
      consentGranted: true,
      consentDate: '2026-09-27T17:00:00Z',
      sensitiveReligiousConsentGranted: true,
      status: 'em_acompanhamento',
      assignedLeaderId: 'usr-sarah-consol',
      assignedLeaderName: 'Sarah Lima',
      prayerRequests: 'Paz interior, direção na carreira e superação de crises de ansiedade.',
      interactions: [
        {
          id: 'int-3',
          date: '2026-09-29T14:00:00Z',
          type: 'whatsapp',
          notes: 'Envio de devocional sobre esperança em Cristo. Larissa respondeu prontamente.',
          attendantName: 'Sarah Lima'
        }
      ],
      createdAt: '2026-09-27T17:30:00Z',
      updatedAt: '2026-09-29T14:30:00Z'
    },
    {
      id: 'cnt-3',
      regionId: 'reg-mg',
      evangelismId: 'ev-mg-01',
      fullName: 'Marcio Henrique Valadares',
      phone: '(31) 99333-4455',
      neighborhood: 'Santa Tereza, BH',
      consentGranted: true,
      consentDate: '2026-09-19T18:00:00Z',
      sensitiveReligiousConsentGranted: true,
      status: 'aguardando_contato',
      assignedLeaderId: 'usr-samuel-mg',
      assignedLeaderName: 'Pr. Samuel Couto',
      prayerRequests: 'Libertação de vícios e oportunidade de trabalho.',
      interactions: [],
      createdAt: '2026-09-19T18:30:00Z',
      updatedAt: '2026-09-19T18:30:00Z'
    }
  ],
  courses: [
    {
      id: 'crs-formacao-semeadores',
      title: 'Escola de Formação de Semeadores de Fogo',
      description: 'Curso trimestral intensivo para capacitação evangelística e ministerial prática, ministrado via Zoom mensal com suporte dos 4 livros físicos de estudo.',
      durationMonths: 3,
      isFreeForYouth: true,
      zoomMeetingUrl: 'https://zoom.us/j/84920268899?pwd=SemeadoresGlobal',
      nextBatchDate: '2026-11-05',
      modules: [
        {
          id: 'mod-1',
          order: 1,
          title: 'Módulo 1: Evangelismo Sobrenatural',
          description: 'Fundamentos bíblicos da proclamação do Evangelho com poder, curas, milagres e palavras proféticas nas ruas.',
          physicalBookRequired: true,
          durationWeeks: 3
        },
        {
          id: 'mod-2',
          order: 2,
          title: 'Módulo 2: Unção do Espírito',
          description: 'Compreensão e consagração ao Espírito Santo, santidade e autoridade espiritual em campo.',
          physicalBookRequired: true,
          durationWeeks: 3
        },
        {
          id: 'mod-3',
          order: 3,
          title: 'Módulo 3: Dons do Espírito',
          description: 'Operação dos dons carismáticos aplicados à evangelização e discernimento na abordagem pessoal.',
          physicalBookRequired: true,
          durationWeeks: 3
        },
        {
          id: 'mod-4',
          order: 4,
          title: 'Módulo 4: Paternidade Espiritual',
          description: 'Cuidado pastoral, consolidação, discipulado de novos convertidos e maturidade ministerial.',
          physicalBookRequired: true,
          durationWeeks: 3
        }
      ]
    }
  ],
  enrollments: [
    {
      id: 'enr-1',
      courseId: 'crs-formacao-semeadores',
      courseTitle: 'Escola de Formação de Semeadores de Fogo',
      studentName: 'Felipe Santana',
      studentEmail: 'felipe.s@gmail.com',
      studentPhone: '(11) 98877-6655',
      regionId: 'reg-sp',
      status: 'in_progress',
      progressPercent: 75,
      completedModules: ['mod-1', 'mod-2', 'mod-3'],
      hasPhysicalBooks: true,
      enrollmentDate: '2026-08-01'
    },
    {
      id: 'enr-2',
      courseId: 'crs-formacao-semeadores',
      courseTitle: 'Escola de Formação de Semeadores de Fogo',
      studentName: 'Beatriz Vasconcelos',
      studentEmail: 'beatriz.v@gmail.com',
      studentPhone: '(31) 97766-5544',
      regionId: 'reg-mg',
      status: 'completed',
      progressPercent: 100,
      completedModules: ['mod-1', 'mod-2', 'mod-3', 'mod-4'],
      hasPhysicalBooks: true,
      enrollmentDate: '2026-07-10',
      certifiedAt: '2026-10-10',
      certificateCode: 'SFG-CERT-2026-7892'
    },
    {
      id: 'enr-3',
      courseId: 'crs-formacao-semeadores',
      courseTitle: 'Escola de Formação de Semeadores de Fogo',
      studentName: 'Lucas Barreto',
      studentEmail: 'lucas.barreto@gmail.com',
      studentPhone: '(21) 96655-4433',
      regionId: 'reg-rj',
      status: 'in_progress',
      progressPercent: 50,
      completedModules: ['mod-1', 'mod-2'],
      hasPhysicalBooks: true,
      enrollmentDate: '2026-08-15'
    }
  ],
  crusades: [
    {
      id: 'cru-01',
      title: 'Grande Cruzada de Fogo & Avivamento 2026',
      regionId: 'reg-sp',
      city: 'São Paulo',
      state: 'SP',
      venue: 'Arena Multicultural & Praça da República',
      startDate: '2026-12-11',
      endDate: '2026-12-13',
      coordinator: 'Lucas Moreira / Arthur',
      status: 'planning',
      budgetEstimate: 45000,
      intercessionTeamCount: 40,
      worshipTeamCount: 25,
      evangelismTeamCount: 120,
      checklist: [
        { id: 'chk-1', category: 'Logística', task: 'Alvará municipal e permissão para uso de espaço público', completed: true, assignee: 'Arthur' },
        { id: 'chk-2', category: 'Logística', task: 'Contratação de palco, som de alta potência e iluminação', completed: false, assignee: 'Eduardo Felyx' },
        { id: 'chk-3', category: 'Intercessão', task: 'Relógio de 24h de oração durante os 7 dias antecedentes', completed: true, assignee: 'Rebeca Alencar' },
        { id: 'chk-4', category: 'Adoração', task: 'Ensaio geral dos músicos e escala de ministros de louvor', completed: false, assignee: 'Daniel Figueiredo' },
        { id: 'chk-5', category: 'Evangelismo', task: 'Divisão de setores da cidade e equipes de abordagem', completed: true, assignee: 'Gabriel Martins' },
        { id: 'chk-6', category: 'Divulgação', task: 'Distribuição de 10.000 convites impressos padronizados', completed: false, assignee: 'Clara Nogueira' },
        { id: 'chk-7', category: 'Hospedagem', task: 'Mapeamento de alojamento e alimentação para caravanas de MG e RJ', completed: false, assignee: 'Pr. Marcos Oliveira' }
      ]
    }
  ],
  departments: [
    {
      id: 'dept-1',
      number: 1,
      name: 'Direção Global e Coordenação Regional',
      coordinator: 'Lucas Moreira',
      description: 'Supervisão ministerial geral, alinhamento com pastores e diretrizes espirituais dos Semeadores.',
      members: ['Lucas Moreira', 'Arthur', 'Eduardo Felyx', 'Pr. Marcos Oliveira', 'Pr. Samuel Couto', 'Pra. Débora Santos'],
      objectives: ['Manter unidade doutrinária e zelo ministerial', 'Supervisionar a implantação de novas regionais']
    },
    {
      id: 'dept-2',
      number: 2,
      name: 'Evangelismo e Expansão',
      coordinator: 'Gabriel Martins',
      description: 'Planejamento das mobilizações de rua, evangelismo sobrenatural e estratégias em locais públicos.',
      members: ['Gabriel Martins', 'Pr. Marcos Oliveira', 'Daniel Figueiredo'],
      objectives: ['Garantir frequência mínima quinzenal/semanal', 'Capacitar líderes de campo']
    },
    {
      id: 'dept-3',
      number: 3,
      name: 'Ensino e Formação',
      coordinator: 'Mateus Rocha',
      description: 'Coordenação das aulas via Zoom, material dos 4 módulos e certificação digital dos formandos.',
      members: ['Mateus Rocha', 'Arthur'],
      objectives: ['Treinar todos os novos semeadores antes do campo', 'Supervisionar aquisição dos livros de estudo']
    },
    {
      id: 'dept-4',
      number: 4,
      name: 'Consolidação',
      coordinator: 'Sarah Lima',
      description: 'Ministério dedicado ao acolhimento, oração, telefonemas e encaminhamento de pessoas alcançadas às igrejas.',
      members: ['Sarah Lima', 'Equipe de Voluntários'],
      objectives: ['Zerar perda de contatos evangelizados', 'Garantir conformidade rigorosa com a LGPD']
    },
    {
      id: 'dept-5',
      number: 5,
      name: 'Mídia e Comunicação',
      coordinator: 'Clara Nogueira',
      description: 'Preservação da identidade visual oficial, produção de vídeos, templates e apoio às regionais.',
      members: ['Clara Nogueira', 'Eduardo Felyx'],
      objectives: ['Padronizar uniformes e panfletos', 'Registrar testemunhos audiovisuais autorizados']
    },
    {
      id: 'dept-6',
      number: 6,
      name: 'Tecnologia e Dados',
      coordinator: 'Arthur',
      description: 'Desenvolvimento e manutenção da plataforma de gestão ministerial, segurança e inteligência de relatórios.',
      members: ['Arthur', 'Eduardo Felyx'],
      objectives: ['Centralizar indicadores operacionais', 'Disponibilizar IA analítica para a direção global']
    },
    {
      id: 'dept-7',
      number: 7,
      name: 'Eventos e Cruzadas',
      coordinator: 'Arthur',
      description: 'Planejamento de grandes cruzadas evangelísticas, logística de caravanas e infraestrutura de palco.',
      members: ['Arthur', 'Lucas Moreira', 'Coordenadores Regionais'],
      objectives: ['Executar checklist padronizado em cruzadas', 'Organizar intercâmbios entre regionais']
    },
    {
      id: 'dept-8',
      number: 8,
      name: 'Financeiro e Logística',
      coordinator: 'Eduardo Felyx',
      description: 'Orçamento de eventos, políticas de custeio de viagens de implantação e controle administrativo.',
      members: ['Eduardo Felyx', 'Lucas Moreira'],
      objectives: ['Transparência e conformidade com diretrizes da liderança', 'Controle prévio de custos logísticos']
    },
    {
      id: 'dept-9',
      number: 9,
      name: 'Jurídico e Patrimônio Digital',
      coordinator: 'Eduardo Felyx',
      description: 'Pesquisa e acompanhamento do registro da marca Semeadores de Fogo no INPI, domínios e proteção de dados LGPD.',
      members: ['Eduardo Felyx', 'Arthur'],
      objectives: ['Acompanhar depósito de registro de marca', 'Assegurar termos de consentimento e privacidade']
    },
    {
      id: 'dept-10',
      number: 10,
      name: 'Intercessão e Apoio Espiritual',
      coordinator: 'Rebeca Alencar',
      description: 'Cobertura em oração, jejuns programados e sustentação espiritual para todos os evangelismos e cruzadas.',
      members: ['Rebeca Alencar', 'Intercessores Regionais'],
      objectives: ['Manter intercessão contínua durante as ações de rua', 'Apoio em casos de ministração e libertação']
    }
  ],
  tasks: [
    {
      id: 'tsk-1',
      departmentId: 'dept-9',
      title: 'Acompanhar status da pesquisa de anterioridade da marca no INPI',
      description: 'Verificação com assessoria jurídica especializada sobre a classe do registro ministerial e evangelístico.',
      assignee: 'Eduardo Felyx',
      priority: 'alta',
      status: 'em_andamento',
      dueDate: '2026-11-01'
    },
    {
      id: 'tsk-2',
      departmentId: 'dept-3',
      title: 'Revisar estoque e distribuição física dos 4 Módulos de Estudo',
      description: 'Garantir que a remessa chegue aos coordenadores de MG, RJ e PR antes do início da próxima turma Zoom.',
      assignee: 'Mateus Rocha',
      priority: 'urgente',
      status: 'em_andamento',
      dueDate: '2026-10-28'
    },
    {
      id: 'tsk-3',
      departmentId: 'dept-5',
      title: 'Disponibilizar gabarito vetorial para camisetas e bonés oficiais',
      description: 'Publicar no portal administrativo os arquivos prontos para estamparia local.',
      assignee: 'Clara Nogueira',
      priority: 'alta',
      status: 'concluido',
      dueDate: '2026-10-18'
    },
    {
      id: 'tsk-4',
      departmentId: 'dept-1',
      title: 'Conduzir reunião bimestral de alinhamento com líderes regionais',
      description: 'Avaliar relatórios do 5º bimestre e alinhar data da Cruzada de fim de ano.',
      assignee: 'Lucas Moreira',
      priority: 'urgente',
      status: 'pendente',
      dueDate: '2026-10-25'
    }
  ],
  meetings: [
    {
      id: 'mtg-01',
      title: 'Reunião Bimestral de Alinhamento Global — Outubro 2026',
      scheduledAt: '2026-10-25T19:30:00Z',
      isBimonthlyAlignment: true,
      coordinator: 'Lucas Moreira',
      agenda: [
        '1. Avaliação dos relatórios bimestrais enviados pelas regionais de SP, MG e RJ',
        '2. Padrão de frequência: Igrejas menores (quinzenal) vs Regionais maiores (semanal)',
        '3. Status dos 4 módulos de estudo e início das novas turmas Zoom',
        '4. Organização e logística da Cruzada Global de Dezembro',
        '5. Atualização sobre registro da marca e ativos digitais (Eduardo Felyx)'
      ],
      attendees: [
        'Lucas Moreira', 'Arthur', 'Eduardo Felyx',
        'Pr. Marcos Oliveira (SP)', 'Pr. Samuel Couto (MG)',
        'Pra. Débora Santos (RJ)', 'Pr. André Silveira (PR)'
      ],
      decisions: [],
      minutesText: 'Pauta convocada para alinhamento após consolidação dos relatórios bimestrais.',
      actionItems: [
        {
          id: 'act-1',
          task: 'Consolidar feedbacks administrativos nos relatórios de SP e MG',
          assignee: 'Arthur',
          deadline: '2026-10-24',
          completed: false
        }
      ]
    }
  ],
  media_assets: [
    {
      id: 'med-01',
      title: 'Logotipo Oficial e Símbolo (Espaço Reservado & Vetorial)',
      category: 'identidade',
      fileFormat: 'SVG / PDF Vetor',
      fileSize: '4.2 MB',
      previewUrl: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=300',
      description: 'Símbolo oficial da pomba/fogo conforme identidade ministerial estabelecida na reunião. Não substituir nem redesenhar.',
      downloadUrl: '#'
    },
    {
      id: 'med-02',
      title: 'Manual de Identidade Visual e Tipografia (Montserrat)',
      category: 'identidade',
      fileFormat: 'PDF',
      fileSize: '12.8 MB',
      previewUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=300',
      description: 'Guia de aplicação de cores (Vermelho Profundo, Preto, Branco), paleta e fontes para todas as regionais.',
      downloadUrl: '#'
    },
    {
      id: 'med-03',
      title: 'Gabarito Oficial para Camisetas dos Semeadores',
      category: 'vestuario',
      fileFormat: 'AI / PDF / PNG',
      fileSize: '18.5 MB',
      previewUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=300',
      description: 'Modelos frente e verso para confecção de camisetas oficiais das equipes de campo.',
      downloadUrl: '#'
    },
    {
      id: 'med-04',
      title: 'Modelo para Bonés dos Semeadores de Fogo',
      category: 'vestuario',
      fileFormat: 'PDF / CDR',
      fileSize: '6.1 MB',
      previewUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=300',
      description: 'Gabarito de bordado frontal para bonés oficiais de evangelismo.',
      downloadUrl: '#'
    },
    {
      id: 'med-05',
      title: 'Panfleto Evangelístico Padronizado (Frente e Verso)',
      category: 'panfletos',
      fileFormat: 'PDF Alta Resolução',
      fileSize: '8.4 MB',
      previewUrl: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=300',
      description: 'Material impresso oficial para distribuição em praças, hospitais e ações de rua.',
      downloadUrl: '#'
    }
  ],
  legal_records: [
    {
      id: 'leg-01',
      category: 'patrimonio_marca',
      title: 'Pesquisa e Registro da Marca Semeadores de Fogo Global',
      details: 'Pesquisa prévia conduzida por Eduardo Felyx no Instituto Nacional da Propriedade Industrial (INPI). Classe 45 (serviços religiosos e espirituais) e Classe 41 (ensino e formação).',
      responsiblePerson: 'Eduardo Felyx',
      updatedAt: '2026-10-16',
      status: 'Em pesquisa e preparação de documentação'
    },
    {
      id: 'leg-02',
      category: 'ativo_digital',
      title: 'Domínios e Presença Digital Oficial',
      details: 'Controle centralizado dos domínios oficiais semeadoresdefogo.org / .com.br e canais institucionais.',
      responsiblePerson: 'Eduardo Felyx / Arthur',
      updatedAt: '2026-10-16',
      status: 'Ativo e sob custódia ministerial'
    },
    {
      id: 'leg-03',
      category: 'politica_custeio',
      title: 'Diretriz de Custeio de Viagens de Implantação e Intercâmbios',
      details: 'Conforme decisão da liderança: viagens de implantação e intercâmbio de equipes seguem tabela de reembolso aprovada pela Direção Global.',
      responsiblePerson: 'Lucas Moreira / Arthur',
      updatedAt: '2026-10-16',
      status: 'Vigente'
    }
  ],
  audit_logs: [
    {
      id: 'log-1',
      timestamp: '2026-10-16T19:00:00Z',
      userId: 'usr-arthur',
      userName: 'Arthur',
      action: 'INITIALIZE_PLATFORM',
      targetEntity: 'system',
      targetId: 'root',
      details: 'Inicialização da arquitetura oficial Semeadores de Fogo Global após reunião estratégica de 16/10/2026.'
    }
  ]
};

export class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Erro ao ler database.json, restaurando initial:', err);
      }
    }
    this.saveDatabase(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  public saveDatabase(newData?: DatabaseSchema) {
    if (newData) this.data = newData;
    this.ensureDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public set<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]) {
    this.data[key] = value;
    this.saveDatabase();
  }

  public logAudit(userId: string, userName: string, action: string, targetEntity: string, targetId: string, details: string, regionId?: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      action,
      targetEntity,
      targetId,
      details,
      regionId
    };
    this.data.audit_logs.unshift(log);
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 500);
    }
    this.saveDatabase();
  }
}

export const db = new DatabaseManager();
