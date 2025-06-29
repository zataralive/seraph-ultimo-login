
import React from 'react';
import { HighScoreEntry } from '../types';

interface HallOfFameProps {
  highScores: HighScoreEntry[];
  onClose: () => void;
}

const HallOfFameComponent: React.FC<HallOfFameProps> = ({ highScores, onClose }) => {
  return (
    <div className="absolute inset-0 bg-sky-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4">
      <div className="frutiger-glass p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-lg text-slate-800 dark:text-sky-100 max-h-[90vh] flex flex-col">
        <h2 className="text-3xl font-light mb-6 text-sky-700 dark:text-neon-cyan text-center">Quadro de Honra</h2>
        
        <div className="flex-grow overflow-y-auto space-y-2.5 custom-scrollbar-dark pr-2">
          {highScores.length === 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum registro de alta performance ainda. Desafie o sistema!</p>
          )}
          {highScores.map((entry, index) => (
            <div key={index} className="frutiger-glass bg-sky-50/60 dark:bg-slate-700/60 p-3 rounded-lg border border-sky-200 dark:border-slate-600 flex justify-between items-center">
              <div className="flex-grow flex items-center">
                <span className="font-semibold text-sky-700 dark:text-sky-200 mr-2 min-w-[20px] text-right">{index + 1}.</span>
                <div className="flex flex-col">
                  <span className="text-md font-medium text-sky-600 dark:text-sky-100">{entry.name || "Anônimo"}</span>
                  <span className="text-sm text-neon-cyan font-bold">{entry.score} pts</span>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0 ml-2">
                {entry.endingTitle && <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[100px]" title={entry.endingTitle}>({entry.endingTitle})</p>}
                <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(entry.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="frutiger-button-neon mt-6 w-full md:w-auto mx-auto px-8 py-2.5">
          Voltar ao Menu
        </button>
      </div>
    </div>
  );
};

export default HallOfFameComponent;
