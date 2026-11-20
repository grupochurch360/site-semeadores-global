import dotenv from 'dotenv';
import { db } from '../server/db.ts';
import { getSupabaseAdmin, isSupabaseConfigured } from '../server/supabase.ts';

dotenv.config();

async function seedSupabase() {
  if (!isSupabaseConfigured()) {
    console.error('Erro: Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env antes de executar este script.');
    process.exit(1);
  }

  const supabase = getSupabaseAdmin()!;
  console.log('Iniciando migração completa de dados locais (15 tabelas) para o Supabase...');

  const upsertTable = async (table: string, rows: Record<string, unknown>[]) => {
    if (rows.length === 0) return;
    const { error } = await supabase.from(table).upsert(rows);
    if (error) {
      throw new Error(`Erro na tabela ${table}: ${error.message}`);
    }
    console.log(`✔ ${table}: ${rows.length} registros sincronizados`);
  };

  await upsertTable(
    'regions',
    db.get('regions').map((r) => ({
      id: r.id,
      name: r.name,
      state: r.state,
      city: r.city,
      church_name: r.churchName,
      pastor_responsible: r.pastorResponsible,
      coordinator_name: r.coordinatorName,
      coordinator_email: r.coordinatorEmail,
      coordinator_phone: r.coordinatorPhone,
      members_count: r.membersCount,
      implant_date: r.implantDate,
      evangelism_frequency: r.evangelismFrequency,
      status: r.status,
      notes: r.notes || '',
    }))
  );

  await upsertTable(
    'departments',
    db.get('departments').map((d) => ({
      id: d.id,
      name: d.name,
      leader_name: d.coordinator,
      description: d.description,
      icon: 'Briefcase',
      members_count: d.members.length,
    }))
  );

  await upsertTable(
    'users',
    db.get('users').map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      region_id: u.regionId || null,
      department_id: u.departmentId || null,
      avatar: u.avatar || null,
      phone: u.phone || null,
      active: u.active !== false,
    }))
  );

  await upsertTable(
    'members',
    db.get('members').map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      role: m.role,
      region_id: m.regionId,
      department_id: m.departmentId || null,
      joined_date: m.joinedDate,
      active: m.active,
    }))
  );

  await upsertTable(
    'evangelism_events',
    db.get('evangelism_events').map((e) => ({
      id: e.id,
      region_id: e.regionId,
      title: e.title,
      scheduled_date: e.scheduledDate,
      location: e.location,
      address: e.address,
      leader_id: e.leaderId,
      leader_name: e.leaderName,
      action_type: e.actionType,
      planned_participants: e.plannedParticipants,
      confirmed_participants: e.confirmedParticipants,
      status: e.status,
      observations: e.observations || '',
      actual_participants: e.actualParticipants ?? null,
      souls_reached: e.soulsReached ?? null,
      authorized_contacts: e.authorizedContacts ?? null,
      general_report: e.generalReport ?? null,
      positives: e.positives ?? null,
      challenges: e.challenges ?? null,
      testimonies: e.testimonies || [],
      photos: e.photos || [],
      suggestions: e.suggestions ?? null,
      completed_at: e.completedAt ?? null,
    }))
  );

  await upsertTable(
    'bimonthly_reports',
    db.get('bimonthly_reports').map((r) => ({
      id: r.id,
      region_id: r.regionId,
      coordinator_id: r.coordinatorId,
      coordinator_name: r.coordinatorName,
      period: r.period,
      year: r.year,
      status: r.status,
      submission_date: r.submissionDate ?? null,
      updated_at: r.updatedAt,
      church_responsible: r.churchResponsible,
      pastor_responsible: r.pastorResponsible,
      evangelisms_count: r.evangelismsCount,
      evangelism_frequency_actual: r.evangelismFrequencyActual,
      locations_reached: r.locationsReached,
      total_participants_sum: r.totalParticipantsSum,
      activities_description: r.activitiesDescription,
      total_souls_reached: r.totalSoulsReached,
      authorized_contacts_count: r.authorizedContactsCount,
      referred_to_consolidation_count: r.referredToConsolidationCount,
      active_follow_ups_count: r.activeFollowUpsCount,
      testimonies_summary: r.testimoniesSummary,
      strengths: r.strengths,
      challenges: r.challenges,
      regional_needs: r.regionalNeeds,
      proposed_improvements: r.proposedImprovements,
      next_period_planning: r.nextPeriodPlanning,
      attachments: r.attachments,
      reviews: r.reviews,
    }))
  );

  await upsertTable(
    'consolidation_contacts',
    db.get('consolidation_contacts').map((c) => ({
      id: c.id,
      region_id: c.regionId,
      evangelism_id: c.evangelismId || null,
      full_name: c.fullName,
      phone: c.phone,
      email: c.email || null,
      neighborhood: c.neighborhood || null,
      consent_granted: c.consentGranted,
      consent_date: c.consentDate,
      sensitive_religious_consent_granted: c.sensitiveReligiousConsentGranted,
      status: c.status,
      assigned_leader_id: c.assignedLeaderId,
      assigned_leader_name: c.assignedLeaderName,
      prayer_requests: c.prayerRequests || null,
      referred_church_name: c.referredChurchName || null,
      interactions: c.interactions,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }))
  );

  await upsertTable(
    'courses',
    db.get('courses').map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      duration_months: c.durationMonths,
      is_free_for_youth: c.isFreeForYouth,
      zoom_meeting_url: c.zoomMeetingUrl,
      next_batch_date: c.nextBatchDate || null,
      modules: c.modules,
    }))
  );

  await upsertTable(
    'enrollments',
    db.get('enrollments').map((e) => ({
      id: e.id,
      course_id: e.courseId,
      course_title: e.courseTitle,
      student_name: e.studentName,
      student_email: e.studentEmail,
      student_phone: e.studentPhone,
      region_id: e.regionId,
      status: e.status,
      progress_percent: e.progressPercent,
      completed_modules: e.completedModules,
      has_physical_books: e.hasPhysicalBooks,
      enrollment_date: e.enrollmentDate,
      certified_at: e.certifiedAt || null,
      certificate_code: e.certificateCode || null,
    }))
  );

  await upsertTable(
    'crusades',
    db.get('crusades').map((c) => ({
      id: c.id,
      title: c.title,
      region_id: c.regionId,
      city: c.city,
      state: c.state,
      venue: c.venue,
      start_date: c.startDate,
      end_date: c.endDate,
      coordinator: c.coordinator,
      status: c.status,
      budget_estimate: c.budgetEstimate,
      checklist: c.checklist,
      intercession_team_count: c.intercessionTeamCount,
      worship_team_count: c.worshipTeamCount,
      evangelism_team_count: c.evangelismTeamCount,
      results: c.results || null,
    }))
  );

  await upsertTable(
    'tasks',
    db.get('tasks').map((t) => ({
      id: t.id,
      department_id: t.departmentId,
      title: t.title,
      description: t.description,
      assignee: t.assignee,
      priority: t.priority,
      status: t.status,
      due_date: t.dueDate,
    }))
  );

  await upsertTable(
    'meetings',
    db.get('meetings').map((m) => ({
      id: m.id,
      title: m.title,
      meeting_date: m.scheduledAt.split('T')[0],
      type: m.isBimonthlyAlignment ? 'bimonthly_alignment' : 'general',
      participants: m.attendees,
      agenda: m.agenda,
      decisions: m.decisions,
      next_steps: m.actionItems,
      status: 'scheduled',
    }))
  );

  await upsertTable(
    'media_assets',
    db.get('media_assets').map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      description: a.description,
      file_url: a.downloadUrl,
      format: a.fileFormat,
      uploaded_by: 'global_admin',
      updated_at: new Date().toISOString().split('T')[0],
    }))
  );

  await upsertTable(
    'legal_records',
    db.get('legal_records').map((l) => ({
      id: l.id,
      title: l.title,
      category: l.category,
      description: l.details,
      amount: l.value ?? null,
      status: l.status,
      due_date: null,
      responsible: l.responsiblePerson,
      notes: null,
    }))
  );

  await upsertTable(
    'audit_logs',
    db.get('audit_logs').map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      user_id: log.userId,
      user_name: log.userName,
      action: log.action,
      target_entity: log.targetEntity,
      target_id: log.targetId,
      details: log.details,
      region_id: log.regionId || null,
    }))
  );

  console.log('Migração completa finalizada com sucesso!');
}

seedSupabase().catch((err) => {
  console.error('Falha na migração para Supabase:', err);
  process.exit(1);
});
