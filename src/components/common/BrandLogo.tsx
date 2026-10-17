import React from 'react';
import { Flame } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  variant?: 'dark' | 'light' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
}) => {
  const isLight = variant === 'light' || variant === 'white';

  const emblemSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const titleSizes = {
    sm: 'text-xs',
    md: 'text-sm font-bold',
    lg: 'text-lg font-bold',
    xl: 'text-2xl font-black tracking-tight',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Símbolo / Pomba & Fogo Reserved Container */}
      <div
        className={`${emblemSizes[size]} rounded-lg flex items-center justify-center font-bold tracking-wider relative transition-transform shadow-xs overflow-hidden ${
          isLight
            ? 'bg-red-600 text-white border border-red-500/40'
            : 'bg-red-800 text-white border border-red-900/20'
        }`}
        title="Espaço reservado para o Símbolo Oficial (Pomba / Fogo)"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
        <Flame className="w-5 h-5 text-amber-200 fill-amber-300 drop-shadow-xs" />
      </div>

      <div className="flex flex-col">
        <span
          className={`tracking-wider uppercase font-extrabold ${titleSizes[size]} ${
            isLight ? 'text-white' : 'text-stone-900'
          }`}
        >
          Semeadores de Fogo
        </span>
        {showSubtitle && (
          <span
            className={`text-[10px] tracking-[0.2em] font-semibold uppercase ${
              isLight ? 'text-red-200' : 'text-red-700'
            }`}
          >
            Plataforma Global
          </span>
        )}
      </div>
    </div>
  );
};
