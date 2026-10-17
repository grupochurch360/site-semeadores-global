import type { EvangelismEvent, BimonthlyReport, ConsolidationContact, RegionalFrequency } from '../types/index.ts';

/**
 * Checks regional compliance with the evangelism frequency established in the strategy meeting:
 * - Weekly frequency requires >= 7 evangelisms in a 2-month period
 * - Biweekly frequency requires >= 3 evangelisms in a 2-month period
 */
export function checkFrequencyCompliance(
  frequency: RegionalFrequency,
  completedEvangelismsCount: number
): { isCompliant: boolean; expectedMin: number; difference: number; message: string } {
  const expectedMin = frequency === 'weekly' ? 8 : 4;
  const isCompliant = completedEvangelismsCount >= expectedMin;
  const difference = completedEvangelismsCount - expectedMin;

  let message = '';
  if (isCompliant) {
    message = `Meta cumprida (${completedEvangelismsCount}/${expectedMin} evangelismos)`;
  } else {
    message = `Abaixo da frequência prevista (faltam ${Math.abs(difference)} ações no bimestre)`;
  }

  return { isCompliant, expectedMin, difference, message };
}

/**
 * Aggregates summary figures from completed evangelisms for pre-filling Bimonthly Reports
 */
export function aggregateEvangelismsForReport(events: EvangelismEvent[]): {
  evangelismsCount: number;
  totalParticipantsSum: number;
  totalSoulsReached: number;
  authorizedContactsCount: number;
  locationsReached: string[];
} {
  const completed = events.filter(e => e.status === 'completed');
  
  const locationsSet = new Set<string>();
  let totalParticipantsSum = 0;
  let totalSoulsReached = 0;
  let authorizedContactsCount = 0;

  for (const ev of completed) {
    if (ev.location) locationsSet.add(ev.location);
    totalParticipantsSum += ev.actualParticipants || 0;
    totalSoulsReached += ev.soulsReached || 0;
    authorizedContactsCount += ev.authorizedContacts || 0;
  }

  return {
    evangelismsCount: completed.length,
    totalParticipantsSum,
    totalSoulsReached,
    authorizedContactsCount,
    locationsReached: Array.from(locationsSet),
  };
}

/**
 * Validates whether a Bimonthly Report meets all criteria before submission to Global Leadership
 */
export function validateReportSubmission(report: Partial<BimonthlyReport>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!report.regionId) errors.push('Regional é obrigatória');
  if (!report.coordinatorName) errors.push('Nome do coordenador é obrigatório');
  if (!report.period) errors.push('Bimestre de referência é obrigatório');
  if (!report.activitiesDescription || report.activitiesDescription.trim().length < 20) {
    errors.push('Descrição das atividades deve ter pelo menos 20 caracteres');
  }
  if (!report.strengths || report.strengths.trim().length < 10) {
    errors.push('Pontos fortes devem ser descritos');
  }
  if (!report.challenges || report.challenges.trim().length < 10) {
    errors.push('Dificuldades encontradas devem ser descritas');
  }
  if (!report.regionalNeeds || report.regionalNeeds.trim().length < 5) {
    errors.push('Necessidades da regional devem ser informadas');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates LGPD Compliance for evangelized people contacts
 * Sensitive religious conviction data requires explicit consent under Brazilian LGPD
 */
export function validateLGPDConsent(contact: Partial<ConsolidationContact>): {
  isValid: boolean;
  reason?: string;
} {
  if (!contact.fullName || contact.fullName.trim().length < 3) {
    return { isValid: false, reason: 'Nome completo deve ter pelo menos 3 caracteres' };
  }
  if (!contact.phone || contact.phone.replace(/\D/g, '').length < 8) {
    return { isValid: false, reason: 'Telefone de contato inválido' };
  }
  if (!contact.consentGranted) {
    return { isValid: false, reason: 'Consentimento de contato (LGPD) é obrigatório' };
  }
  if (!contact.sensitiveReligiousConsentGranted) {
    return { isValid: false, reason: 'Consentimento expresso para acolhimento espiritual (Dado Sensível LGPD) é obrigatório' };
  }
  return { isValid: true };
}

/**
 * Calculates conversion rates and consolidation performance
 */
export function calculateConsolidationMetrics(contacts: ConsolidationContact[]): {
  total: number;
  inFollowUp: number;
  referredToChurch: number;
  completed: number;
  pending: number;
  disinterested: number;
  churchReferredRate: number; // in percentage
} {
  const total = contacts.length;
  if (total === 0) {
    return {
      total: 0,
      inFollowUp: 0,
      referredToChurch: 0,
      completed: 0,
      pending: 0,
      disinterested: 0,
      churchReferredRate: 0,
    };
  }

  let inFollowUp = 0;
  let referredToChurch = 0;
  let completed = 0;
  let pending = 0;
  let disinterested = 0;

  for (const c of contacts) {
    switch (c.status) {
      case 'em_acompanhamento':
        inFollowUp++;
        break;
      case 'encaminhado_igreja':
        referredToChurch++;
        break;
      case 'concluido':
        completed++;
        break;
      case 'aguardando_contato':
      case 'novo':
        pending++;
        break;
      case 'sem_interesse':
        disinterested++;
        break;
    }
  }

  const churchReferredRate = Math.round(((referredToChurch + completed) / total) * 100);

  return {
    total,
    inFollowUp,
    referredToChurch,
    completed,
    pending,
    disinterested,
    churchReferredRate,
  };
}
