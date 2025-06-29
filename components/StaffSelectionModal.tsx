
import React from 'react';
import { StaffDefinition } from '../types';

interface StaffSelectionModalProps {
  availableStaves: StaffDefinition[];
  onSelectStaff: (staffId: string) => void;
  onCancel: () => void; 
}

const StaffSelectionModalComponent: React.FC<StaffSelectionModalProps> = ({ availableStaves, onSelectStaff, onCancel }) => {
  return (
    <div className="absolute inset-0 bg-sky-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4">
      <div className="frutiger-glass p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-xl text-slate-800 dark:text-sky-100 max-h-[90vh] flex flex-col">
        <h2 className="text-3xl font-light mb-6 text-sky-700 dark:text-neon-cyan text-center">Selecionar Equipamento Inicial</h2>
        
        <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar-dark pr-2">
          {availableStaves.map((staff) => (
            <button
              key={staff.id}
              onClick={() => onSelectStaff(staff.id)}
              className="w-full frutiger-glass hover:bg-sky-100/70 dark:hover:bg-slate-700/70 p-4 rounded-lg border border-sky-300 dark:border-slate-600 transition-all duration-150 text-left group focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-opacity-75"
            >
              <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-200 group-hover:text-neon-cyan">{staff.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{staff.description}</p>
            </button>
          ))}
           {availableStaves.length === 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum cajado desbloqueado além do inicial.</p>
          )}
        </div>

        <button onClick={onCancel} className="frutiger-button-neon border-red-500/70 text-red-400/90 hover:border-red-500 hover:text-red-400 hover:bg-red-500/20 hover:text-white mt-6 w-full md:w-auto mx-auto px-8 py-2.5 opacity-90 hover:opacity-100">
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default StaffSelectionModalComponent;
