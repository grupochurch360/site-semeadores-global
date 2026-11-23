import React from 'react';

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
    sm: 'w-9 h-9',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <img
        src="/logo-semeadores-sm.png"
        alt="Brasão Semeadores de Fogo Global"
        width={40}
        height={37}
        className={`${emblemSizes[size]} object-contain shrink-0 select-none`}
      />

      <div className="flex flex-col min-w-0 leading-tight">
        <span
          className={`font-extrabold tracking-tight whitespace-nowrap ${titleSizes[size]} ${
            isLight ? 'text-white' : 'text-[#061A2D]'
          }`}
        >
          Semeadores de Fogo
        </span>
        {showSubtitle && (
          <span
            className={`text-[10px] tracking-[0.16em] font-bold uppercase whitespace-nowrap ${
              isLight ? 'text-[#FFBD58]' : 'text-[#ED801F]'
            }`}
          >
            Governança Global
          </span>
        )}
      </div>
    </div>
  );
};
