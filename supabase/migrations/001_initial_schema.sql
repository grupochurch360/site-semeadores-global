-- =============================================================================
-- Semeadores de Fogo Global — Initial PostgreSQL / Supabase Schema + RLS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Regions (Churches / Regional Hubs)
CREATE TABLE IF NOT EXISTS regions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  church_name TEXT NOT NULL,
  pastor_responsible TEXT NOT NULL,
  coordinator_name TEXT NOT NULL,
  coordinator_email TEXT DEFAULT '',
  coordinator_phone TEXT DEFAULT '',
  members_count INTEGER DEFAULT 0,
  implant_date DATE NOT NULL DEFAULT CURRENT_DATE,
  evangelism_frequency TEXT NOT NULL CHECK (evangelism_frequency IN ('weekly', 'biweekly')),
  status TEXT NOT NULL CHECK (status IN ('active', 'in_implantation', 'paused')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Departments
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT 'Briefcase',
  members_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Users (Linked to Supabase Auth UID when using Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  auth_user_id UUID UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN (
    'global_admin',
    'regional_coordinator',
    'evangelism_leader',
    'consolidation_team',
    'teaching_team',
    'media_team'
  )),
  region_id TEXT REFERENCES regions(id) ON DELETE SET NULL,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  avatar TEXT,
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Members
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,
  region_id TEXT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  joined_date DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5. Evangelism Events
CREATE TABLE IF NOT EXISTS evangelism_events (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  leader_id TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  planned_participants INTEGER NOT NULL DEFAULT 0,
  confirmed_participants INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled')),
  observations TEXT DEFAULT '',
  actual_participants INTEGER,
  souls_reached INTEGER,
  authorized_contacts INTEGER,
  general_report TEXT,
  positives TEXT,
  challenges TEXT,
  testimonies JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  suggestions TEXT,
  completed_at TIMESTAMPTZ
);

-- 6. Bimonthly Reports
CREATE TABLE IF NOT EXISTS bimonthly_reports (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  coordinator_id TEXT NOT NULL,
  coordinator_name TEXT NOT NULL,
  period TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'returned')),
  submission_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  church_responsible TEXT DEFAULT '',
  pastor_responsible TEXT DEFAULT '',
  evangelisms_count INTEGER NOT NULL DEFAULT 0,
  evangelism_frequency_actual TEXT DEFAULT '',
  locations_reached JSONB DEFAULT '[]'::jsonb,
  total_participants_sum INTEGER NOT NULL DEFAULT 0,
  activities_description TEXT DEFAULT '',
  total_souls_reached INTEGER NOT NULL DEFAULT 0,
  authorized_contacts_count INTEGER NOT NULL DEFAULT 0,
  referred_to_consolidation_count INTEGER NOT NULL DEFAULT 0,
  active_follow_ups_count INTEGER NOT NULL DEFAULT 0,
  testimonies_summary TEXT DEFAULT '',
  strengths TEXT DEFAULT '',
  challenges TEXT DEFAULT '',
  regional_needs TEXT DEFAULT '',
  proposed_improvements TEXT DEFAULT '',
  next_period_planning TEXT DEFAULT '',
  attachments JSONB DEFAULT '[]'::jsonb,
  reviews JSONB DEFAULT '[]'::jsonb
);

-- 7. Consolidation Contacts (LGPD Sensitive Religious Data)
CREATE TABLE IF NOT EXISTS consolidation_contacts (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  evangelism_id TEXT REFERENCES evangelism_events(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  neighborhood TEXT,
  consent_granted BOOLEAN NOT NULL CHECK (consent_granted = TRUE),
  consent_date TIMESTAMPTZ NOT NULL,
  sensitive_religious_consent_granted BOOLEAN NOT NULL CHECK (sensitive_religious_consent_granted = TRUE),
  status TEXT NOT NULL,
  assigned_leader_id TEXT NOT NULL,
  assigned_leader_name TEXT NOT NULL,
  prayer_requests TEXT,
  referred_church_name TEXT,
  interactions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Courses & Enrollments
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  duration_months INTEGER NOT NULL DEFAULT 3,
  is_free_for_youth BOOLEAN NOT NULL DEFAULT TRUE,
  zoom_meeting_url TEXT DEFAULT '',
  next_batch_date DATE,
  modules JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  course_title TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_phone TEXT DEFAULT '',
  region_id TEXT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('enrolled', 'in_progress', 'completed')),
  progress_percent INTEGER NOT NULL DEFAULT 0,
  completed_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  has_physical_books BOOLEAN NOT NULL DEFAULT FALSE,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  certified_at DATE,
  certificate_code TEXT
);

-- 9. Crusades, Tasks, Meetings, Media, Legal & Audit
CREATE TABLE IF NOT EXISTS crusades (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  region_id TEXT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  venue TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  coordinator TEXT NOT NULL,
  status TEXT NOT NULL,
  budget_estimate NUMERIC(12,2) NOT NULL DEFAULT 0,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  intercession_team_count INTEGER NOT NULL DEFAULT 0,
  worship_team_count INTEGER NOT NULL DEFAULT 0,
  evangelism_team_count INTEGER NOT NULL DEFAULT 0,
  results JSONB
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assignee TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  status TEXT NOT NULL CHECK (status IN ('pendente', 'em_andamento', 'em_revisao', 'concluido')),
  due_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  type TEXT NOT NULL,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  agenda JSONB NOT NULL DEFAULT '[]'::jsonb,
  decisions JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  file_url TEXT NOT NULL,
  format TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  updated_at DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS legal_records (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  amount NUMERIC(12,2),
  status TEXT NOT NULL,
  due_date DATE,
  responsible TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT NOT NULL,
  region_id TEXT
);

-- 10. AI Analyses History (Gemini)
CREATE TABLE IF NOT EXISTS ai_analyses (
  id TEXT PRIMARY KEY,
  target_period TEXT NOT NULL,
  region_id TEXT REFERENCES regions(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  analysis TEXT NOT NULL,
  analyzed_reports_count INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) — Multi-Tenancy Isolation per Church/Region
-- =============================================================================
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE evangelism_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bimonthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crusades ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS policies
CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_app_region_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT region_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- Regions: global_admin sees all; regional users see their own region
CREATE POLICY regions_isolation_select ON regions
  FOR SELECT USING (
    public.current_app_role() = 'global_admin'
    OR id = public.current_app_region_id()
  );

-- Evangelism events: strictly isolated by region_id
CREATE POLICY evangelisms_isolation_all ON evangelism_events
  FOR ALL USING (
    public.current_app_role() = 'global_admin'
    OR region_id = public.current_app_region_id()
  );

-- Bimonthly reports: strictly isolated by region_id
CREATE POLICY reports_isolation_all ON bimonthly_reports
  FOR ALL USING (
    public.current_app_role() = 'global_admin'
    OR region_id = public.current_app_region_id()
  );

-- Consolidation contacts (LGPD): only global_admin, regional_coordinator, consolidation_team of same region
CREATE POLICY consolidation_lgpd_isolation ON consolidation_contacts
  FOR ALL USING (
    public.current_app_role() = 'global_admin'
    OR (
      public.current_app_role() IN ('regional_coordinator', 'consolidation_team')
      AND region_id = public.current_app_region_id()
    )
  );

-- Enrollments: global_admin & teaching_team see all; others only their region
CREATE POLICY enrollments_isolation_select ON enrollments
  FOR SELECT USING (
    public.current_app_role() IN ('global_admin', 'teaching_team')
    OR region_id = public.current_app_region_id()
  );

-- Audit logs: global_admin sees all; regional_coordinator sees own region
CREATE POLICY audit_logs_isolation_select ON audit_logs
  FOR SELECT USING (
    public.current_app_role() = 'global_admin'
    OR (
      public.current_app_role() = 'regional_coordinator'
      AND region_id = public.current_app_region_id()
    )
  );

-- Members: isolated by region_id
CREATE POLICY members_isolation_all ON members
  FOR ALL USING (
    public.current_app_role() = 'global_admin'
    OR region_id = public.current_app_region_id()
  );

-- Crusades: isolated by region_id
CREATE POLICY crusades_isolation_all ON crusades
  FOR ALL USING (
    public.current_app_role() = 'global_admin'
    OR region_id = public.current_app_region_id()
  );

-- AI Analyses: restricted to global_admin
CREATE POLICY ai_analyses_admin_only ON ai_analyses
  FOR ALL USING (public.current_app_role() = 'global_admin');

-- Storage Buckets (run in Supabase SQL editor if Storage is enabled)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('evangelism-photos', 'evangelism-photos', FALSE),
  ('report-attachments', 'report-attachments', FALSE),
  ('media-assets', 'media-assets', FALSE)
ON CONFLICT (id) DO NOTHING;
