
import React from 'react';

interface GameOverScreenProps {
  score: number;
  onReturnToMenu: () => void; 
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onReturnToMenu }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-8 text-white text-center">
      <div className="frutiger-glass bg-slate-800/80 border-red-600/70 p-8 md:p-12 rounded-2xl shadow-xl max-w-lg">
        <h1 className="text-5xl font-semibold mb-3">
          <span className="text-red-400 filter drop-shadow-[0_0_6px_#ef4444]">ERRO_CRÍTICO</span>
        </h1>
        <p className="text-xl text-red-300 mb-8">Contenção da anomalia falhou. Instância corrompida.</p>
        
        <div className="text-lg mb-2">Pontuação Final do Sistema: <span className="text-neon-cyan font-bold">{score}</span></div>
        <p className="text-sm mb-10 text-slate-400">Integridade dos dados comprometida. Um reset completo do sistema é aconselhado.</p>
        
        <button
          onClick={onReturnToMenu} 
          className="frutiger-button-neon border-sky-400 text-sky-300 shadow-[0_0_10px_var(--neon-cyan),inset_0_0_5px_var(--neon-cyan)] hover:bg-sky-500 hover:text-white text-lg px-8 py-3"
        >
          Retornar ao Menu Principal
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
