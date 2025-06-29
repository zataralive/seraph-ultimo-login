
import React from 'react';
import { EffectDefinition } from '../types'; // Renamed from CardDefinition

interface EffectDisplayProps { // Renamed from CardDisplayProps
  effect: EffectDefinition; // Renamed from card
  onSelect?: () => void; // onSelect might not be needed if this is just for display
  isSelected?: boolean; // Optional: for HUD display if needed
}

// Simplified base styles as rarity is removed
const baseStyles = {
  border: 'border-sky-300 dark:border-sky-600',
  bg: 'bg-white/80 dark:bg-slate-700/80',
  hoverBg: 'hover:bg-sky-100/90 dark:hover:bg-slate-600/90', // Only if selectable
  nameText: 'text-sky-700 dark:text-sky-200',
  descriptionText: 'text-slate-600 dark:text-slate-300',
  iconBg: 'bg-sky-100 dark:bg-slate-600',
};

const EffectDisplay: React.FC<EffectDisplayProps> = ({ effect, onSelect, isSelected }) => {
  const styles = baseStyles;
  const Tag = onSelect ? 'button' : 'div';

  return (
    <Tag
      onClick={onSelect}
      className={`p-3 md:p-4 rounded-xl border-2 text-left flex flex-col h-full transition-all duration-200 ease-in-out backdrop-blur-sm ${styles.border} ${styles.bg} ${onSelect ? styles.hoverBg : ''} ${onSelect ? 'transform hover:scale-105 focus:scale-105 hover:shadow-lg focus:shadow-lg cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-neon-cyan shadow-lg' : ''}`}
      disabled={!onSelect}
      aria-label={effect.name}
    >
      <div className="flex-grow">
        {effect.icon && (
          <div className={`mb-2 w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-lg md:text-xl ${styles.iconBg}`}>
            {effect.icon}
          </div>
        )}
        <h3 className={`text-md md:text-lg font-semibold mb-1 ${styles.nameText}`}>{effect.name}</h3>
        {/* Rarity text removed */}
        <p className={`text-xs md:text-sm leading-snug ${styles.descriptionText}`}>{effect.description}</p>
      </div>
      {onSelect && (
         <div className="mt-3 md:mt-4 text-center">
            <span className="frutiger-button-neon text-xs md:text-sm py-1.5 px-3 md:px-4 inline-block w-full">Escolher</span>
        </div>
      )}
    </Tag>
  );
};

export default EffectDisplay;
