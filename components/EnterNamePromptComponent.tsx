
import React, { useState } from 'react';

interface EnterNamePromptProps {
  onSubmitName: (name: string) => void;
  onCancel: () => void; // Or just submit with a default name like "Anônimo"
}

const EnterNamePromptComponent: React.FC<EnterNamePromptProps> = ({ onSubmitName, onCancel }) => {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitName(playerName.trim() || "Anônimo");
  };

  return (
    <div className="absolute inset-0 bg-sky-900/70 backdrop-blur-lg flex items-center justify-center z-[80] p-4">
      <form 
        onSubmit={handleSubmit}
        className="frutiger-glass p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-md text-slate-800 dark:text-sky-100 border-2 border-sky-400/60"
      >
        <h2 className="text-2xl md:text-3xl font-light mb-5 text-sky-700 dark:text-neon-cyan text-center">
          Fim da Execução
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-1 text-center">
          Sua jornada chegou a um ponto crucial.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 text-center">
          Insira seu nome para o Quadro de Honra:
        </p>
        
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Seraph"
          maxLength={20}
          className="w-full p-3 mb-6 bg-sky-50/80 dark:bg-slate-700/80 border border-sky-300 dark:border-slate-600 rounded-lg text-sky-700 dark:text-sky-100 placeholder-sky-400/70 dark:placeholder-slate-400/70 focus:ring-2 focus:ring-neon-cyan focus:border-transparent outline-none shadow-inner"
          aria-label="Nome do Jogador"
        />
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            type="submit" 
            className="frutiger-button-neon text-md w-full py-2.5"
          >
            Confirmar Nome
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="frutiger-button text-md w-full py-2.5 bg-slate-400 hover:bg-slate-500 dark:bg-slate-600 dark:hover:bg-slate-700 opacity-80 hover:opacity-100"
          >
            Pular (Anônimo)
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnterNamePromptComponent;