
import React from 'react';
import { ALL_STAVES_MAP } from '../constants'; 

interface TrophyRoomProps {
  achievedEndings: string[]; 
  endingStaffUnlockMap: Record<string, string>; 
  allStavesMap: Record<string, {name: string, description: string}>; 
  onClose: () => void;
}

const TrophyRoomComponent: React.FC<TrophyRoomProps> = ({ achievedEndings, endingStaffUnlockMap, allStavesMap, onClose }) => {
  return (
    <div className="absolute inset-0 bg-sky-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4">
      <div className="frutiger-glass p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-2xl text-slate-800 dark:text-sky-100 max-h-[90vh] flex flex-col">
        <h2 className="text-3xl font-light mb-6 text-sky-700 dark:text-neon-cyan text-center">Sala de Troféus</h2>
        
        <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar-dark pr-2">
          {achievedEndings.length === 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum ciclo finalizado ainda. O sistema aguarda suas escolhas.</p>
          )}
          {achievedEndings.map((endingTitle, index) => {
            const unlockedStaffId = endingStaffUnlockMap[endingTitle];
            const staffDetails = unlockedStaffId ? allStavesMap[unlockedStaffId] : null;
            return (
              <div key={index} className="frutiger-glass bg-sky-50/60 dark:bg-slate-700/60 p-3 md:p-4 rounded-lg border border-sky-200 dark:border-slate-600">
                <h3 className="text-md md:text-lg font-semibold text-sky-700 dark:text-sky-200">{endingTitle}</h3>
                {staffDetails && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    Recompensa: <span className="font-medium">{staffDetails.name}</span> desbloqueado!
                  </p>
                )}
                 {!staffDetails && unlockedStaffId && (
                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Recompensa: Cajado ID '{unlockedStaffId}' (Definição não encontrada)
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={onClose} className="frutiger-button-neon mt-6 w-full md:w-auto mx-auto px-8 py-2.5">
          Voltar ao Menu
        </button>
      </div>
    </div>
  );
};

export default TrophyRoomComponent;
