import React, { useEffect, useState } from 'react';
import {
  Menu,
  Bell,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  Shield,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { Region } from '../../types/index.ts';

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
  subtitle?: string;
  onGoToPublicSite: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  title,
  subtitle,
  onGoToPublicSite,
}) => {
  const { currentUser, isAdmin, activeRegionFilter, setActiveRegionFilter } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    api.getRegions().then(setRegions).catch(console.error);
  }, []);

  return (
    <header className="h-16 bg-white/85 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 lg:hidden cursor-pointer"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#141210] tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-stone-500 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Regional Filter Selector (If Global Admin, can view all or filter by regional) */}
        <div className="flex items-center bg-[#FAF8F5] rounded-lg px-2 py-1 border border-stone-200/90">
          <MapPin className="w-3.5 h-3.5 text-red-700 ml-1 hidden sm:block shrink-0" />
          <select
            value={activeRegionFilter}
            onChange={(e) => setActiveRegionFilter(e.target.value)}
            className="bg-transparent text-xs font-semibold text-stone-800 py-1 px-1.5 focus:outline-hidden cursor-pointer"
            aria-label="Filtrar por regional"
          >
            {isAdmin && <option value="all">Todas as Regionais (Global)</option>}
            {regions.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.name.split('(')[0]} ({reg.state})
              </option>
            ))}
          </select>
        </div>

        {/* Public Site Switcher */}
        <button
          onClick={onGoToPublicSite}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:text-red-700 hover:border-red-200 hover:bg-red-50/50 text-xs font-semibold transition-all shadow-2xs"
          title="Ver o site institucional público dos Semeadores de Fogo"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Site Público</span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-xs shadow-2xs">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-stone-900 truncate max-w-[130px]">
              {currentUser?.name}
            </span>
            <span className="text-[10px] text-stone-500 truncate max-w-[130px]">
              {currentUser?.role === 'global_admin' ? 'Direção Global' : 'Coordenação'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
