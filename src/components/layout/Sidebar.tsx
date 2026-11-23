import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Flame,
  FileSpreadsheet,
  X,
  Sparkles,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenAIModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  onClose,
  onOpenAIModal,
}) => {
  const { currentUser, isAdmin, logout } = useAuth();

  const navSections: Array<{
    title: string;
    items: Array<{
      id: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string;
    }>;
  }> = [
    {
      title: 'VISÃO GERAL',
      items: [{ id: 'dashboard', label: 'Dashboard Global', icon: LayoutDashboard }],
    },
    {
      title: 'OPERAÇÃO MINISTERIAL',
      items: [
        { id: 'regions', label: 'Regionais', icon: MapPin },
        { id: 'evangelisms', label: 'Evangelismos', icon: Flame },
      ],
    },
    {
      title: 'GOVERNANÇA',
      items: [
        { id: 'reports', label: 'Relatórios Bimestrais', icon: FileSpreadsheet, badge: 'Oficial' },
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    setCurrentTab(id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#061A2D] text-[#DAE4ED] border-r border-[#16324F] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#16324F] bg-[#041220]">
          <BrandLogo variant="white" size="sm" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#B7C8D9] hover:text-white hover:bg-[#0B2946] lg:hidden cursor-pointer"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Official Report Trigger */}
        {isAdmin && (
          <div className="p-3.5 mx-3 mt-4 bg-[#0B2946] rounded-xl border border-[#234567] border-l-3 border-l-[#ED801F]">
            <div className="flex items-center gap-2 mb-1 text-[#FFBD58] font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FFBD58]" />
              <span>Relatório Consolidado IA</span>
            </div>
            <p className="text-[11px] text-[#B7C8D9] mb-2.5 leading-relaxed">
              Documento oficial A4 gerado com dados reais das regionais.
            </p>
            <button
              onClick={onOpenAIModal}
              className="w-full py-2 px-3 text-xs font-extrabold bg-[#FFBD58] hover:bg-[#f5b042] text-[#061A2D] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
              <h3 className="px-3 text-[10px] font-bold text-[#849BB3] uppercase tracking-wider">
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
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0A3D69] text-white font-bold border-l-3 border-[#FFBD58] pl-2.5'
                          : 'text-[#DAE4ED] hover:bg-[#0B2946] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${isActive ? 'text-[#FFBD58]' : 'text-[#849BB3]'}`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#041220] text-[#FFBD58] border border-[#234567]">
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

        {/* Authenticated User Footer */}
        <div className="p-3.5 border-t border-[#16324F] bg-[#041220]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-[#849BB3] tracking-wider">
              Sessão Autenticada
            </span>
            <span className="text-[10px] font-bold text-[#FFBD58] bg-[#0B2946] px-2 py-0.5 rounded border border-[#234567]">
              {currentUser?.role === 'global_admin'
                ? 'Direção Global'
                : currentUser?.role === 'regional_coordinator'
                ? 'Coord. Regional'
                : currentUser?.role}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-[#849BB3] truncate">{currentUser?.email}</p>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 rounded-lg bg-[#0B2946] hover:bg-[#ED801F] text-[#DAE4ED] hover:text-white border border-[#234567] transition-colors cursor-pointer shrink-0"
              title="Sair da conta"
              aria-label="Sair da conta"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
