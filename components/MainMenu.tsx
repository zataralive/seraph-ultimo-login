
import React from 'react';

interface MainMenuProps {
  onStartNewRun: () => void;
  onShowTrophies: () => void;
  onShowHallOfFame: () => void;
  onShowCompendium: () => void; 
  // onShowGeminiConsole: () => void; // Prop removed
}

const MainMenuComponent: React.FC<MainMenuProps> = ({ onStartNewRun, onShowTrophies, onShowHallOfFame, onShowCompendium }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-cyan-100 to-blue-200 dark:from-slate-800 dark:via-slate-900 dark:to-black p-8 text-slate-700 dark:text-slate-200">
      <div className="text-center mb-10 md:mb-12">
        <h1 className="text-6xl md:text-7xl font-light text-sky-600 dark:text-neon-cyan mb-2 tracking-tight filter drop-shadow-[0_0_8px_var(--neon-cyan)]">
          Seraph
        </h1>
        <p className="text-xl md:text-2xl text-sky-500 dark:text-sky-300 font-semibold">O Último Login</p>
      </div>

      <div className="frutiger-glass p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-xs md:max-w-sm space-y-4 md:space-y-5">
        <button onClick={onStartNewRun} className="frutiger-button-neon text-lg w-full py-3 md:py-3.5">
          Nova Execução
        </button>
        <button onClick={onShowTrophies} className="frutiger-button-neon text-lg w-full py-3 md:py-3.5 opacity-90 hover:opacity-100">
          Sala de Troféus
        </button>
        <button onClick={onShowHallOfFame} className="frutiger-button-neon text-lg w-full py-3 md:py-3.5 opacity-90 hover:opacity-100">
          Quadro de Honra
        </button>
        {onShowCompendium && (
          <button onClick={onShowCompendium} className="frutiger-button-neon text-lg w-full py-3 md:py-3.5 opacity-90 hover:opacity-100">
            Compêndio Narrativo
          </button>
        )}
        {/* Button for Gemini Console removed */}
      </div>

      <p className="mt-10 md:mt-12 text-xs text-slate-500 dark:text-slate-400">
        Versão 1.0.1 - Iteração Estável
      </p>
    </div>
  );
};

export default MainMenuComponent;