import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  MapPin,
  Flame,
  Users2,
  CalendarCheck2,
  GraduationCap,
  Award,
  FileSpreadsheet,
  Briefcase,
  Users,
  Film,
  Coins,
  ShieldCheck,
  History,
  X,
  Sparkles,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenAIModal: () => void;
  onOpenAuditModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  onClose,
  onOpenAIModal,
  onOpenAuditModal,
}) => {
  const { currentUser, isAdmin, canAccessConsolidation, switchUser, allUsers } = useAuth();

  const navSections = [
    {
      title: 'VISÃO GERAL',
      items: [
        { id: 'dashboard', label: 'Dashboard Global', icon: LayoutDashboard },
        { id: 'indicators', label: 'Indicadores & Metas', icon: BarChart3 },
      ],
    },
    {
      title: 'OPERAÇÃO MINISTERIAL',
      items: [
        { id: 'regions', label: 'Regionais', icon: MapPin },
        { id: 'evangelisms', label: 'Evangelismos', icon: Flame },
        ...(canAccessConsolidation
          ? [{ id: 'consolidation', label: 'Consolidação (LGPD)', icon: Users2 }]
          : []),
        { id: 'crusades', label: 'Cruzadas & Eventos', icon: CalendarCheck2 },
      ],
    },
    {
      title: 'FORMAÇÃO',
      items: [
        { id: 'courses', label: 'Cursos & Ensino', icon: GraduationCap },
        { id: 'certificates', label: 'Alunos & Certificados', icon: Award },
      ],
    },
    {
      title: 'GESTÃO',
      items: [
        { id: 'reports', label: 'Relatórios Bimestrais', icon: FileSpreadsheet, badge: 'Crucial' },
        { id: 'departments', label: 'Departamentos & Tarefas', icon: Briefcase },
        { id: 'meetings', label: 'Reuniões de Alinhamento', icon: Users },
      ],
    },
    {
      title: 'COMUNICAÇÃO',
      items: [
        { id: 'media', label: 'Mídia & Identidade Oficial', icon: Film },
      ],
    },
    {
      title: 'ADMINISTRAÇÃO',
      items: [
        { id: 'financial_legal', label: 'Financeiro & Jurídico', icon: Coins },
        ...(isAdmin
          ? [{ id: 'audit_logs', label: 'Logs de Auditoria', icon: History }]
          : []),
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    if (id === 'audit_logs') {
      onOpenAuditModal();
    } else {
      setCurrentTab(id);
    }
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-stone-900 text-stone-300 border-r border-stone-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-stone-800/80 bg-stone-950/40">
          <BrandLogo variant="white" size="sm" />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Strategic Intelligence Trigger Button */}
        {isAdmin && (
          <div className="p-3 mx-3 mt-3 bg-gradient-to-r from-red-950/80 to-stone-900 rounded-lg border border-red-900/40 shadow-xs">
            <div className="flex items-center gap-2 mb-1.5 text-red-300 font-semibold text-xs tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Inteligência dos Relatórios</span>
            </div>
            <p className="text-[11px] text-stone-400 mb-2 leading-relaxed">
              Diagnóstico bimestral automatizado com Gemini AI para a Direção Global.
            </p>
            <button
              onClick={onOpenAIModal}
              className="w-full py-1.5 px-2.5 text-xs font-semibold bg-red-800 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Gerar Diagnóstico IA</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                {sec.title}
              </h3>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        isActive
                          ? 'bg-red-900/60 text-white font-semibold shadow-xs border-l-3 border-red-500 pl-2.5'
                          : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-red-300' : 'text-stone-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800/50">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Authenticated User Switcher Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              Alternador de Perfil
            </span>
            <span className="text-[10px] font-medium text-red-300 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-900/30">
              {currentUser?.role === 'global_admin'
                ? 'Direção Global'
                : currentUser?.role === 'regional_coordinator'
                ? 'Coord. Regional'
                : currentUser?.role}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={currentUser?.id || ''}
              onChange={(e) => switchUser(e.target.value)}
              className="flex-1 bg-stone-800 text-stone-200 text-xs rounded-md border border-stone-700 py-1.5 px-2 focus:outline-hidden focus:ring-1 focus:ring-red-500"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between">
            <span className="truncate">{currentUser?.name}</span>
            <span className="text-[9px] text-stone-400 font-mono">16/10/2026</span>
          </div>
        </div>
      </aside>
    </>
  );
};
