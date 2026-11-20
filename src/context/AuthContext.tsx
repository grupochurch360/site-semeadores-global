import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  activeRegionFilter: string;
  setActiveRegionFilter: (regionId: string) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  // Role checks
  isAdmin: boolean;
  isCoordinator: boolean;
  isEvangelismLeader: boolean;
  isConsolidationTeam: boolean;
  isTeachingTeam: boolean;
  isMediaTeam: boolean;

  // Permission helpers
  canManageRegions: boolean;
  canApproveReports: boolean;
  canEditEvangelism: (regionId?: string) => boolean;
  canSubmitReports: (regionId?: string) => boolean;
  canAccessConsolidation: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRegionFilter, setActiveRegionFilter] = useState<string>('all');

  useEffect(() => {
    async function loadAuth() {
      const token = api.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const meData = await api.getCurrentUser();
        setCurrentUser(meData.user);
        if (meData.user.role !== 'global_admin' && meData.user.regionId) {
          setActiveRegionFilter(meData.user.regionId);
        } else {
          setActiveRegionFilter('all');
        }
      } catch {
        api.setToken(null);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setCurrentUser(res.user);
    if (res.user.role !== 'global_admin' && res.user.regionId) {
      setActiveRegionFilter(res.user.regionId);
    } else {
      setActiveRegionFilter('all');
    }
  };

  const logout = async () => {
    await api.logout();
    setCurrentUser(null);
    setActiveRegionFilter('all');
  };

  const isAdmin = currentUser?.role === 'global_admin';
  const isCoordinator = currentUser?.role === 'regional_coordinator';
  const isEvangelismLeader = currentUser?.role === 'evangelism_leader';
  const isConsolidationTeam = currentUser?.role === 'consolidation_team';
  const isTeachingTeam = currentUser?.role === 'teaching_team';
  const isMediaTeam = currentUser?.role === 'media_team';

  const canManageRegions = isAdmin;
  const canApproveReports = isAdmin;

  const canEditEvangelism = (regionId?: string) => {
    if (isAdmin) return true;
    if (!regionId) return false;
    return currentUser?.regionId === regionId;
  };

  const canSubmitReports = (regionId?: string) => {
    if (isAdmin) return true;
    if (isCoordinator && (!regionId || currentUser?.regionId === regionId)) return true;
    return false;
  };

  const canAccessConsolidation = isAdmin || isCoordinator || isConsolidationTeam;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        activeRegionFilter,
        setActiveRegionFilter,
        login,
        logout,
        isAdmin,
        isCoordinator,
        isEvangelismLeader,
        isConsolidationTeam,
        isTeachingTeam,
        isMediaTeam,
        canManageRegions,
        canApproveReports,
        canEditEvangelism,
        canSubmitReports,
        canAccessConsolidation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
