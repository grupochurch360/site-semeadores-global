import type {
  User, Region, Member, EvangelismEvent, BimonthlyReport,
  ConsolidationContact, Course, Enrollment, CrusadeEvent,
  Department, DepartmentTask, LeadershipMeeting, MediaAsset,
  LegalFinancialRecord, AuditLog
} from '../types/index.ts';

class ApiService {
  private currentUserId: string = 'usr-lucas';

  public setUserId(id: string) {
    this.currentUserId = id;
    localStorage.setItem('sfg_user_id', id);
  }

  public getUserId(): string {
    const saved = localStorage.getItem('sfg_user_id');
    if (saved) {
      this.currentUserId = saved;
    }
    return this.currentUserId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-id': this.getUserId(),
      ...(options.headers as Record<string, string> || {}),
    };

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Erro ${res.status}: Falha na requisição`);
    }

    return res.json();
  }

  // Auth
  async getCurrentUser(): Promise<{ user: User }> {
    return this.request('/api/auth/me');
  }

  async getAllUsers(): Promise<User[]> {
    return this.request('/api/auth/users');
  }

  async switchUser(userId: string): Promise<{ success: boolean; user: User }> {
    this.setUserId(userId);
    return this.request('/api/auth/switch', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<any> {
    return this.request('/api/dashboard/stats');
  }

  // Regions
  async getRegions(): Promise<Region[]> {
    return this.request('/api/regions');
  }

  async createRegion(data: Partial<Region>): Promise<Region> {
    return this.request('/api/regions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRegion(id: string, data: Partial<Region>): Promise<Region> {
    return this.request(`/api/regions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Evangelisms
  async getEvangelisms(regionId?: string): Promise<EvangelismEvent[]> {
    const url = regionId ? `/api/evangelisms?regionId=${encodeURIComponent(regionId)}` : '/api/evangelisms';
    return this.request(url);
  }

  async createEvangelism(data: Partial<EvangelismEvent>): Promise<EvangelismEvent> {
    return this.request('/api/evangelisms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvangelism(id: string, data: Partial<EvangelismEvent>): Promise<EvangelismEvent> {
    return this.request(`/api/evangelisms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Reports
  async getReports(regionId?: string): Promise<BimonthlyReport[]> {
    const url = regionId ? `/api/reports?regionId=${encodeURIComponent(regionId)}` : '/api/reports';
    return this.request(url);
  }

  async createReport(data: Partial<BimonthlyReport>): Promise<BimonthlyReport> {
    return this.request('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReport(id: string, data: Partial<BimonthlyReport> & { reviewComment?: string; newStatus?: string }): Promise<BimonthlyReport> {
    return this.request(`/api/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // AI Analysis
  async analyzeReports(targetPeriod?: string, regionId?: string): Promise<{
    success: boolean;
    provider: string;
    analysis: string;
    analyzedReportsCount: number;
    timestamp: string;
  }> {
    return this.request('/api/ai/analyze-reports', {
      method: 'POST',
      body: JSON.stringify({ targetPeriod, regionId }),
    });
  }

  // Consolidation
  async getConsolidationContacts(regionId?: string): Promise<ConsolidationContact[]> {
    const url = regionId ? `/api/consolidation?regionId=${encodeURIComponent(regionId)}` : '/api/consolidation';
    return this.request(url);
  }

  async createConsolidationContact(data: Partial<ConsolidationContact>): Promise<ConsolidationContact> {
    return this.request('/api/consolidation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logFollowUp(contactId: string, type: string, notes: string, newStatus?: string): Promise<ConsolidationContact> {
    return this.request(`/api/consolidation/${contactId}/interactions`, {
      method: 'POST',
      body: JSON.stringify({ type, notes, newStatus }),
    });
  }

  // Courses & Enrollments
  async getCourses(): Promise<Course[]> {
    return this.request('/api/courses');
  }

  async getEnrollments(): Promise<Enrollment[]> {
    return this.request('/api/enrollments');
  }

  async enrollStudent(data: { studentName: string; studentEmail: string; studentPhone?: string; regionId?: string; hasPhysicalBooks?: boolean }): Promise<Enrollment> {
    return this.request('/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async certifyStudent(enrollmentId: string): Promise<Enrollment> {
    return this.request(`/api/enrollments/${enrollmentId}/certify`, {
      method: 'POST',
    });
  }

  // Crusades
  async getCrusades(): Promise<CrusadeEvent[]> {
    return this.request('/api/crusades');
  }

  // Departments & Tasks
  async getDepartments(): Promise<Department[]> {
    return this.request('/api/departments');
  }

  async getTasks(): Promise<DepartmentTask[]> {
    return this.request('/api/tasks');
  }

  async createTask(data: Partial<DepartmentTask>): Promise<DepartmentTask> {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: Partial<DepartmentTask>): Promise<DepartmentTask> {
    return this.request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Meetings
  async getMeetings(): Promise<LeadershipMeeting[]> {
    return this.request('/api/meetings');
  }

  // Media
  async getMediaAssets(): Promise<MediaAsset[]> {
    return this.request('/api/media');
  }

  // Legal & Financial
  async getLegalRecords(): Promise<LegalFinancialRecord[]> {
    return this.request('/api/legal-records');
  }

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    return this.request('/api/audit-logs');
  }
}

export const api = new ApiService();
