import React, { useEffect, useState } from 'react';
import { Menu, Globe, MapPin } from 'lucide-react';
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
    <header className="h-16 bg-white/92 backdrop-blur-md border-b border-[#DCE5ED] px-3 sm:px-6 flex items-center justify-between gap-2 sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-[#0B2946] hover:bg-[#EDF4F9] lg:hidden cursor-pointer shrink-0"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg font-extrabold text-[#0B2946] tracking-tight leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#586E84] hidden sm:block truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Regional Filter Selector */}
        <div className="flex items-center bg-[#EDF4F9] rounded-lg px-1.5 sm:px-2.5 py-1 border border-[#DCE5ED] max-w-[130px] sm:max-w-none">
          <MapPin className="w-3.5 h-3.5 text-[#ED801F] ml-0.5 hidden sm:block shrink-0" />
          <select
            value={activeRegionFilter}
            onChange={(e) => setActiveRegionFilter(e.target.value)}
            className="bg-transparent text-[11px] sm:text-xs font-bold text-[#0B2946] py-1 px-1 sm:px-1.5 focus:outline-hidden cursor-pointer w-full truncate"
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
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#DCE5ED] text-[#0B2946] hover:border-[#0A3D69] hover:bg-[#EDF4F9] text-xs font-semibold transition-all cursor-pointer"
          title="Ver o site institucional público dos Semeadores de Fogo"
        >
          <Globe className="w-3.5 h-3.5 text-[#0A3D69]" />
          <span className="hidden md:inline">Site Público</span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#DCE5ED]">
          <div className="w-8 h-8 rounded-full bg-[#061A2D] text-[#FFBD58] flex items-center justify-center font-extrabold text-xs">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-[#0B2946] truncate max-w-[130px]">
              {currentUser?.name}
            </span>
            <span className="text-[10px] text-[#586E84] truncate max-w-[130px]">
              {currentUser?.role === 'global_admin' ? 'Direção Global' : 'Coordenação'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
