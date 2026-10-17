import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, RoleType } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isLoading: boolean;
  activeRegionFilter: string;
  setActiveRegionFilter: (regionId: string) => void;
  switchUser: (userId: string) => Promise<void>;
  
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
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRegionFilter, setActiveRegionFilter] = useState<string>('all');

  useEffect(() => {
    async function loadAuth() {
      try {
        const [meData, usersData] = await Promise.all([
          api.getCurrentUser(),
          api.getAllUsers(),
        ]);
        setCurrentUser(meData.user);
        setAllUsers(usersData);
      } catch (err) {
        console.error('Falha ao carregar usuário atual:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const switchUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await api.switchUser(userId);
      setCurrentUser(res.user);
      if (res.user.role === 'regional_coordinator' && res.user.regionId) {
        setActiveRegionFilter(res.user.regionId);
      } else {
        setActiveRegionFilter('all');
      }
    } catch (err) {
      console.error('Erro ao alternar usuário:', err);
    } finally {
      setIsLoading(false);
    }
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
        allUsers,
        isLoading,
        activeRegionFilter,
        setActiveRegionFilter,
        switchUser,
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
