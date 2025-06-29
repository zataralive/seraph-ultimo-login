import React from 'react';
import { NarrativeNodeDefinition, NarrativeChoiceDefinition } from '../types';
import { ALL_EFFECTS_MAP } from '../constants'; 

interface NarrativeDecisionModalProps {
  node: NarrativeNodeDefinition;
  onSelectChoice: (choice: NarrativeChoiceDefinition) => void;
}

const NarrativeDecisionModal: React.FC<NarrativeDecisionModalProps> = ({ node, onSelectChoice }) => {
  if (!node || !node.choices || node.choices.length === 0) {
    console.warn("NarrativeDecisionModal: Nó inválido ou sem escolhas.", node);
    return null; 
  }

  const getSpeakerDisplayName = (speakerKey?: string): string => {
    if (!speakerKey) return "Narrador";
    switch (speakerKey) {
      case "Seraph": return "Seraph (Pensamentos)";
      case "System": return "Entidade do Sistema";
      case "AlliedAI": return "Fragmento de IA Aliada";
      case "CorruptedEcho": return "Eco Corrompido";
      case "Concept": return "Voz da Afinidade";
      default: return speakerKey;
    }
  };

  return (
    <div className="absolute inset-0 bg-sky-900/50 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div 
        className="frutiger-glass p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-3xl text-slate-800 dark:text-sky-100 border-2 border-sky-400/60 flex flex-col max-h-[90vh] overflow-y-hidden" 
      >
        <h2 className="text-xl md:text-2xl font-light mb-1.5 text-sky-700 dark:text-neon-cyan text-center border-b border-sky-300/30 dark:border-sky-600/40 pb-1.5 flex-shrink-0">
          {node.title}
        </h2>
        
        <div className="flex-grow"> 
          {node.dialoguePreamble && node.dialoguePreamble.length > 0 && (
            <div className="mb-2 p-1.5 bg-sky-50/60 dark:bg-slate-700/50 rounded-lg border border-sky-200 dark:border-slate-600">
              {node.speaker && <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-0.5">{getSpeakerDisplayName(node.speaker)}:</p>}
              {node.dialoguePreamble.map((line, index) => (
                <p key={index} className="text-xs text-slate-700 dark:text-sky-200 mb-0.5 last:mb-0 italic">
                  "{line}"
                </p>
              ))}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
            {node.choices.map(choice => {
              const grantedEffect = choice.grantsEffectId ? ALL_EFFECTS_MAP[choice.grantsEffectId] : null;
              return (
                <button
                  key={choice.id}
                  onClick={() => onSelectChoice(choice)}
                  className="w-full frutiger-glass hover:bg-sky-100/70 dark:hover:bg-slate-700/70 p-1.5 md:p-2 rounded-xl border border-sky-300 dark:border-slate-600 transition-all duration-150 text-left group focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-opacity-75 flex flex-col h-full"
                >
                  <div className="flex-grow">
                    <p className="text-sm font-semibold text-sky-700 dark:text-sky-200 group-hover:text-neon-cyan">{choice.choiceText}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{choice.fullDescription}</p>
                    
                    {grantedEffect && (
                      <div className="mt-1 p-1 bg-sky-100/40 dark:bg-slate-600/40 rounded-md border border-sky-200 dark:border-slate-500">
                        <p className="text-xs font-semibold text-teal-600 dark:text-teal-300">
                          <span className="mr-1">{grantedEffect.icon}</span>
                          Efeito: {grantedEffect.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{grantedEffect.description}</p>
                      </div>
                    )}

                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{choice.effectDescription}</p>
                    {choice.affinityBoost && Object.keys(choice.affinityBoost).length > 0 && (
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                        Afinidade: {Object.entries(choice.affinityBoost).map(([aff, val]) => `${aff} ${val > 0 ? '+' : ''}${val}`).join(', ')}
                      </p>
                    )}
                    {choice.dialogueResponse && choice.dialogueResponse.length > 0 && (
                      <div className="mt-1 pl-1 border-l-2 border-sky-300 dark:border-sky-500">
                        {choice.dialogueResponse.map((line, index) => (
                          <p key={index} className="text-xs text-slate-500 dark:text-slate-400 italic">
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        <p className="mt-2 text-xs text-sky-500 dark:text-sky-400 opacity-70 text-center flex-shrink-0">
          Sua diretriz primária reescreverá o fluxo do sistema.
        </p>
      </div>
    </div>
  );
};

export default NarrativeDecisionModal;