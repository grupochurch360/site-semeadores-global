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
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <div
        className={`${emblemSizes[size]} rounded-xl flex items-center justify-center relative shrink-0 overflow-hidden ${
          isLight
            ? 'bg-red-700 text-white border border-red-500/40'
            : 'bg-[#141210] text-white border border-stone-800'
        }`}
        title="Semeadores de Fogo Global"
      >
        <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
      </div>

      <div className="flex flex-col min-w-0 leading-tight">
        <span
          className={`font-extrabold tracking-tight whitespace-nowrap ${titleSizes[size]} ${
            isLight ? 'text-white' : 'text-[#141210]'
          }`}
        >
          Semeadores de Fogo
        </span>
        {showSubtitle && (
          <span
            className={`text-[10px] tracking-[0.16em] font-semibold uppercase whitespace-nowrap ${
              isLight ? 'text-red-300' : 'text-red-700'
            }`}
          >
            Plataforma Global
          </span>
        )}
      </div>
    </div>
  );
};
