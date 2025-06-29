import React from 'react';
import { EffectDefinition } from '../types';

interface HUDAbilitiesProps {
  chosenEffects: EffectDefinition[];
  isObscured: boolean;
}

const HUDAbilities: React.FC<HUDAbilitiesProps> = ({ chosenEffects, isObscured }) => {
  const displayedEffects = chosenEffects.slice(-5); // Show last 5

  return (
    <div
      className={`hud-element p-2 ${isObscured ? 'obscured' : ''}`}
      style={{ position: 'absolute', bottom: '1rem', left: '1rem' }} // Explicit positioning
    >
      {/* Label for "Habilidades" could be added if desired, but keeping it icon-focused for now */}
      {displayedEffects.length > 0 ? (
        <div className="flex flex-row space-x-2"> {/* Increased spacing slightly */}
          {displayedEffects.map(effect => (
            <div
              key={effect.id}
              title={effect.name}
              className="w-8 h-8 bg-sky-100/70 dark:bg-slate-600/70 rounded-lg flex items-center justify-center text-lg shadow-md border border-sky-200/50 dark:border-slate-500/50 hover:scale-110 transition-transform"
            >
              {effect.icon}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic px-1">Build Vazia</p>
      )}
    </div>
  );
};

export default HUDAbilities;