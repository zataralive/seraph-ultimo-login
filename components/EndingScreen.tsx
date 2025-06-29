
import React from 'react';

interface EndingScreenProps {
  title: string;
  description: string;
  onReturnToMenu: () => void; 
}

const EndingScreen: React.FC<EndingScreenProps> = ({ title, description, onReturnToMenu }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-600 via-cyan-700 to-blue-800 p-8 text-white text-center custom-scrollbar overflow-y-auto">
      <div className="frutiger-glass bg-sky-700/70 border-sky-400/60 p-8 md:p-12 rounded-3xl shadow-2xl max-w-xl">
        <h1 className="text-4xl font-light text-neon-cyan mb-2 filter drop-shadow-[0_0_5px_var(--neon-cyan)]">Ciclo Completo</h1>
        <h2 className="text-2xl font-semibold text-white mb-6">{title}</h2>
        <p className="text-md leading-relaxed mb-10 whitespace-pre-line text-sky-100 opacity-90">{description}</p>
        <button
          onClick={onReturnToMenu} 
          className="frutiger-button-neon text-lg px-8 py-3"
        >
          Retornar ao Menu Principal
        </button>
      </div>
    </div>
  );
};

export default EndingScreen;
