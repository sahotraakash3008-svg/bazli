import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../utils/translations';

interface LanguageToggleProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  variant = 'compact'
}) => {
  const { language, toggleLanguage } = useLanguage();

  if (variant === 'full') {
    return (
      <button
        id="language-toggle-btn-full"
        onClick={toggleLanguage}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${
          language === 'hi'
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
            : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700/80'
        } ${className}`}
        title="Switch language between English & Hindi"
      >
        <Globe className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-extrabold">{language === 'en' ? 'EN • English' : 'हिं • हिंदी'}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 uppercase font-mono">
          {language === 'en' ? 'Switch to हिं' : 'English'}
        </span>
      </button>
    );
  }

  return (
    <button
      id="language-toggle-btn"
      onClick={toggleLanguage}
      className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${
        language === 'hi'
          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
          : 'bg-slate-800/80 border-slate-700/70 text-slate-200 hover:bg-slate-700/70'
      } ${className}`}
      title={language === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
    >
      <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span className="font-extrabold tracking-wide">
        {language === 'en' ? 'EN' : 'हिन्दी'}
      </span>
      <span className="text-[10px] opacity-60 font-mono">|</span>
      <span className="text-[10.5px] opacity-80 font-medium">
        {language === 'en' ? 'हिं' : 'EN'}
      </span>
    </button>
  );
};
