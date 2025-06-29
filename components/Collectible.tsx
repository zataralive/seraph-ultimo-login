
import React from 'react';
import { CollectibleState } from '../types';

const CollectibleComponent: React.FC<CollectibleState> = ({ x, y, width = 16, height = 16, type, isPotent }) => { // Slightly increased default size
  let styleClasses = "rounded-full shadow-lg";
  let coreStyleClasses = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 rounded-full opacity-80";
  let glowAnimation = "animate-pulseOrb";
  let outerColor = "";
  let coreColor = "";
  let shadowColor = "";

  if (type === 'healing_orb') {
    outerColor = isPotent ? "bg-emerald-400" : "bg-green-500";
    coreColor = isPotent ? "bg-emerald-100" : "bg-green-200";
    shadowColor = isPotent ? "shadow-emerald-400/70" : "shadow-green-500/70";
    styleClasses += ` ${outerColor} border-2 ${isPotent ? 'border-emerald-200' : 'border-green-300'}`;
    coreStyleClasses += ` ${coreColor}`;
  } else if (type === 'soul_orb') {
    outerColor = "bg-purple-600";
    coreColor = "bg-purple-300";
    shadowColor = "shadow-purple-600/70";
    styleClasses += ` ${outerColor} border-2 border-purple-400`;
    coreStyleClasses += ` ${coreColor}`;
  }

  return (
    <div
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        transition: 'all 0.1s ease-out',
        filter: 'brightness(1.15)', 
      }}
      className={`absolute ${styleClasses} ${glowAnimation} shadow-lg ${shadowColor}`}
      aria-label={`${type === 'healing_orb' ? 'Orbe de Cura' : 'Orbe de Alma'}${isPotent ? ' Potente' : ''}`}
    >
      <div className={coreStyleClasses} style={{ boxShadow: `0 0 8px 2px ${coreColor}` }}></div>
      <div className="absolute inset-0 rounded-full opacity-30" style={{backgroundImage: `radial-gradient(circle, white 20%, transparent 80%)`}}></div>
      <style>{`
        @keyframes pulseOrbAnim {
          0%, 100% { transform: scale(0.95); opacity: 0.75; box-shadow: 0 0 8px 2px var(--shadow-color-var, transparent); }
          50% { transform: scale(1.05); opacity: 1; box-shadow: 0 0 16px 5px var(--shadow-color-var, transparent); }
        }
        .animate-pulseOrb {
          animation: pulseOrbAnim 1.8s infinite ease-in-out;
          --shadow-color-var: ${type === 'healing_orb' ? (isPotent ? 'rgba(52, 211, 153, 0.7)' : 'rgba(34, 197, 94, 0.7)') : 'rgba(147, 51, 234, 0.7)'};
        }
      `}</style>
    </div>
  );
};

export default CollectibleComponent;
