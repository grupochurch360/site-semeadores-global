import type {
  User, Region, Member, EvangelismEvent, BimonthlyReport,
  ConsolidationContact, Course, Enrollment, CrusadeEvent,
  Department, DepartmentTask, LeadershipMeeting, MediaAsset,
  LegalFinancialRecord, AuditLog
} from '../types/index.ts';

class ApiService {
  private tokenKey = 'sfg_auth_token';

  public setToken(token: string | null) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!res.ok) {
      if (res.status === 401) {
        this.setToken(null);
      }
      const errData = await res.json().catch(() => ({}));
      const rawError = errData?.error;
      const errorMessage =
        typeof rawError === 'string'
          ? rawError
          : rawError?.message || errData?.message || `Erro ${res.status}: Falha na requisição`;
      throw new Error(errorMessage);
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async logout(): Promise<void> {
    try {
      if (this.getToken()) {
        await this.request('/api/auth/logout', { method: 'POST' });
      }
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request('/api/auth/me');
  }

  async getUsers(): Promise<User[]> {
    return this.request('/api/users');
  }

  async createUser(data: Partial<User> & { password: string }): Promise<User> {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: Partial<User> & { password?: string }): Promise<User> {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Dashboard Stats
  async getDashboardStats(regionId?: string): Promise<any> {
    const url = regionId ? `/api/dashboard/stats?regionId=${encodeURIComponent(regionId)}` : '/api/dashboard/stats';
    return this.request(url);
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
    id: string;
    provider: string;
    reportData: any;
    html: string;
    analysis: string;
    analyzedReportsCount: number;
    dataFingerprint: string;
    fallbackAttempts?: Array<{ model: string; reason: string }>;
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

  async createDepartment(data: Partial<Department>): Promise<Department> {
    return this.request('/api/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    return this.request(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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
