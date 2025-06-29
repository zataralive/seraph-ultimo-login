import React from 'react';

interface HUDHealthProps {
  hp: number;
  maxHp: number;
  isObscured: boolean;
}

const HUDHealth: React.FC<HUDHealthProps> = ({ hp, maxHp, isObscured }) => {
  const healthPercentage = Math.max(0, (hp / maxHp) * 100);

  return (
    <div
      className={`hud-element top-4 left-4 min-w-[150px] max-w-[180px] p-2 ${isObscured ? 'obscured' : ''}`} // Largura reduzida
      role="meter"
      aria-valuenow={hp}
      aria-valuemin={0}
      aria-valuemax={maxHp}
      aria-label="Barra de Integridade"
    >
      <div className="relative mb-0.5"> {/* Margem reduzida */}
        <span className="absolute -top-1 left-0 text-[9px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">INTEGRIDADE</span>
        <span className="absolute -top-0.5 right-0 text-[10px] font-bold text-sky-600 dark:text-neon-cyan">{Math.round(hp)}<span className="opacity-70 text-[8px]">/{maxHp}</span></span>
      </div>
      <div className="w-full h-2.5 bg-sky-100/30 dark:bg-slate-700/50 rounded-full overflow-hidden border border-sky-300/50 dark:border-slate-500/50 shadow-inner mt-2 relative flex items-center"> {/* Altura e margem reduzidas */}
        <div
          style={{ width: `${healthPercentage}%` }}
          className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 transition-all duration-300 ease-out rounded-full relative"
        >
          {/* Orb removido para design compacto */}
        </div>
      </div>
       <div className="absolute top-full left-1 mt-1 w-5 h-5 bg-slate-400/20 dark:bg-slate-600/40 rounded-sm transform flex items-center justify-center border border-slate-400/40 dark:border-slate-500/40 p-0.5 shadow-sm"> {/* Tamanho e margem do escudo ajustados */}
        <span className="text-xs text-sky-100 dark:text-sky-200 opacity-80 filter drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]">🛡️</span>
      </div>
    </div>
  );
};

export default HUDHealth;