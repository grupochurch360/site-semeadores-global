import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkFrequencyCompliance,
  aggregateEvangelismsForReport,
  validateReportSubmission,
  validateLGPDConsent,
  calculateConsolidationMetrics
} from './metrics.ts';
import type { EvangelismEvent, ConsolidationContact } from '../types/index.ts';

test('checkFrequencyCompliance: validates weekly and biweekly regional targets', () => {
  const weeklyPass = checkFrequencyCompliance('weekly', 8);
  assert.equal(weeklyPass.isCompliant, true);
  assert.equal(weeklyPass.expectedMin, 8);

  const weeklyFail = checkFrequencyCompliance('weekly', 6);
  assert.equal(weeklyFail.isCompliant, false);
  assert.equal(weeklyFail.difference, -2);

  const biweeklyPass = checkFrequencyCompliance('biweekly', 4);
  assert.equal(biweeklyPass.isCompliant, true);

  const biweeklyFail = checkFrequencyCompliance('biweekly', 2);
  assert.equal(biweeklyFail.isCompliant, false);
});

test('aggregateEvangelismsForReport: correctly sums completed evangelism statistics', () => {
  const dummyEvents: EvangelismEvent[] = [
    {
      id: '1',
      regionId: 'reg-sp',
      title: 'Ação Praça da Sé',
      scheduledDate: '2026-09-12T14:00:00Z',
      location: 'Praça da Sé, São Paulo',
      address: 'Centro Histórico',
      leaderId: 'usr-1',
      leaderName: 'Pr. Marcos',
      actionType: 'praca',
      plannedParticipants: 20,
      confirmedParticipants: 18,
      status: 'completed',
      actualParticipants: 22,
      soulsReached: 45,
      authorizedContacts: 14,
    },
    {
      id: '2',
      regionId: 'reg-sp',
      title: 'Ação Av. Paulista',
      scheduledDate: '2026-09-26T15:00:00Z',
      location: 'Av. Paulista',
      address: 'Masp',
      leaderId: 'usr-1',
      leaderName: 'Pr. Marcos',
      actionType: 'rua',
      plannedParticipants: 15,
      confirmedParticipants: 15,
      status: 'completed',
      actualParticipants: 16,
      soulsReached: 30,
      authorizedContacts: 10,
    },
    {
      id: '3',
      regionId: 'reg-sp',
      title: 'Ação Futura',
      scheduledDate: '2026-10-30T15:00:00Z',
      location: 'Parque do Ibirapuera',
      address: 'Portão 3',
      leaderId: 'usr-1',
      leaderName: 'Pr. Marcos',
      actionType: 'praca',
      plannedParticipants: 30,
      confirmedParticipants: 10,
      status: 'planned', // not completed, shouldn't be counted
      actualParticipants: 0,
      soulsReached: 0,
      authorizedContacts: 0,
    }
  ];

  const result = aggregateEvangelismsForReport(dummyEvents);
  assert.equal(result.evangelismsCount, 2);
  assert.equal(result.totalParticipantsSum, 38);
  assert.equal(result.totalSoulsReached, 75);
  assert.equal(result.authorizedContactsCount, 24);
  assert.equal(result.locationsReached.length, 2);
});

test('validateReportSubmission: enforces required sections and minimum detail', () => {
  const invalid = validateReportSubmission({
    regionId: 'reg-sp',
    coordinatorName: '',
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.length > 0);

  const valid = validateReportSubmission({
    regionId: 'reg-sp',
    coordinatorName: 'Pr. Marcos Oliveira',
    period: '5º Bimestre (Set/Out 2026)',
    activitiesDescription: 'Realizamos evangelismos com alta mobilização de jovens em 4 regiões centrais.',
    strengths: 'Comunhão forte da juventude e excelente acolhimento do público.',
    challenges: 'Necessidade de mais caixas de som e novos panfletos oficiais impressos.',
    regionalNeeds: 'Envio de 500 exemplares dos módulos de estudo físicos.',
  });
  assert.equal(valid.isValid, true);
  assert.equal(valid.errors.length, 0);
});

test('validateLGPDConsent: ensures explicit consent and religious sensitive data acceptance', () => {
  const withoutConsent = validateLGPDConsent({
    fullName: 'Carlos Eduardo',
    phone: '11999887766',
    consentGranted: false,
    sensitiveReligiousConsentGranted: false,
  });
  assert.equal(withoutConsent.isValid, false);

  const fullConsent = validateLGPDConsent({
    fullName: 'Carlos Eduardo',
    phone: '11999887766',
    consentGranted: true,
    sensitiveReligiousConsentGranted: true,
  });
  assert.equal(fullConsent.isValid, true);
});

test('calculateConsolidationMetrics: accurately computes conversion and referral percentages', () => {
  const contacts: ConsolidationContact[] = [
    {
      id: 'c1',
      regionId: 'reg-sp',
      fullName: 'Ana Beatriz',
      phone: '11988887777',
      consentGranted: true,
      consentDate: '2026-10-01',
      sensitiveReligiousConsentGranted: true,
      status: 'encaminhado_igreja',
      assignedLeaderId: 'usr-2',
      assignedLeaderName: 'Sarah Lima',
      interactions: [],
      createdAt: '2026-10-01',
      updatedAt: '2026-10-01',
    },
    {
      id: 'c2',
      regionId: 'reg-sp',
      fullName: 'Lucas Rocha',
      phone: '11988887778',
      consentGranted: true,
      consentDate: '2026-10-02',
      sensitiveReligiousConsentGranted: true,
      status: 'em_acompanhamento',
      assignedLeaderId: 'usr-2',
      assignedLeaderName: 'Sarah Lima',
      interactions: [],
      createdAt: '2026-10-02',
      updatedAt: '2026-10-02',
    },
    {
      id: 'c3',
      regionId: 'reg-sp',
      fullName: 'Roberto Silva',
      phone: '11988887779',
      consentGranted: true,
      consentDate: '2026-10-03',
      sensitiveReligiousConsentGranted: true,
      status: 'concluido',
      assignedLeaderId: 'usr-2',
      assignedLeaderName: 'Sarah Lima',
      interactions: [],
      createdAt: '2026-10-03',
      updatedAt: '2026-10-03',
    },
    {
      id: 'c4',
      regionId: 'reg-sp',
      fullName: 'Juliana Costa',
      phone: '11988887780',
      consentGranted: true,
      consentDate: '2026-10-04',
      sensitiveReligiousConsentGranted: true,
      status: 'sem_interesse',
      assignedLeaderId: 'usr-2',
      assignedLeaderName: 'Sarah Lima',
      interactions: [],
      createdAt: '2026-10-04',
      updatedAt: '2026-10-04',
    }
  ];

  const metrics = calculateConsolidationMetrics(contacts);
  assert.equal(metrics.total, 4);
  assert.equal(metrics.referredToChurch, 1);
  assert.equal(metrics.completed, 1);
  assert.equal(metrics.inFollowUp, 1);
  assert.equal(metrics.disinterested, 1);
  // (1 referred + 1 completed) / 4 = 50%
  assert.equal(metrics.churchReferredRate, 50);
});
