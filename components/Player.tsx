
import React from 'react';
import { PlayerState, AffinityName, AscensionLevel } from '../types';

interface PlayerComponentProps extends PlayerState {
  // ascensionAffinity and currentAscensionLevel are already in PlayerState
}

const PlayerComponent: React.FC<PlayerComponentProps> = (props) => {
  const { x, y, width, height, hp, maxHp, invulnerableUntil, direction, hasBarrierShield, ascensionAffinity, currentAscensionLevel, etherealUntil } = props;
  const now = Date.now();
  const isInvulnerable = now < invulnerableUntil;
  const isEthereal = etherealUntil && now < etherealUntil;

  const healthPercentage = Math.max(0, (hp / maxHp) * 100);

  const invulnerableStyle = isInvulnerable 
    ? { opacity: Math.floor(now / 100) % 2 === 0 ? 0.4 : 0.9 }
    : { opacity: 1 };
  
  const etherealStyle = isEthereal ? { opacity: 0.5, filter: 'brightness(1.5) contrast(1.2)' } : {};

  let ascensionClass = '';
  let ascensionPseudoElementStyle = '';

  if (ascensionAffinity && currentAscensionLevel) {
    const baseAffinityClass = `asc-${ascensionAffinity.toLowerCase().replace('ê', 'e').replace('ç', 'c').replace('ã', 'a')}`;
    ascensionClass = `${baseAffinityClass} asc-level-${currentAscensionLevel}`;

    // Define pseudo-element styles for auras/effects based on affinity and level
    // These would be more complex and ideally handled with more sophisticated CSS or SVG
    switch (ascensionAffinity) {
      case 'Vingança':
        ascensionPseudoElementStyle = `
          .${ascensionClass}::before { content: ""; position: absolute; inset: -5px; border-radius: 0.5rem; 
            border: 2px solid #ef4444; 
            animation: pulse-aura-red 1.5s infinite;
            opacity: ${0.4 + currentAscensionLevel * 0.2}; }
        `;
        break;
      case 'Intelecto':
        ascensionPseudoElementStyle = `
          .${ascensionClass}::before { content: ""; position: absolute; inset: -3px; border-radius: 0.3rem; 
            background-image: linear-gradient(45deg, rgba(59, 130, 246, 0.3) 25%, transparent 25%, transparent 50%, rgba(59, 130, 246, 0.3) 50%, rgba(59, 130, 246, 0.3) 75%, transparent 75%, transparent);
            background-size: 8px 8px; animation: shimmer-blue 3s infinite linear;
            opacity: ${0.3 + currentAscensionLevel * 0.15}; }
        `;
        break;
      case 'Abismo':
         ascensionPseudoElementStyle = `
          .${ascensionClass}::after { content: ""; position: absolute; left: 50%; top: 100%; transform: translateX(-50%); width: ${width * 1.2}px; height: ${height * 0.3}px; 
            background: radial-gradient(ellipse at center, rgba(76, 29, 149, ${0.2 + currentAscensionLevel * 0.1}) 0%, transparent 70%); 
            border-radius: 50%; animation: pulse-aura-purple 2s infinite ease-in-out; }
        `;
        break;
      case 'Carne':
        ascensionPseudoElementStyle = `
          .${ascensionClass} { filter: saturate(${1 + currentAscensionLevel * 0.15}); }
          .${ascensionClass}::before { content: ""; position: absolute; inset: 0; border-radius: 0.4rem; 
            background-image: repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(249, 115, 22, ${0.05 * currentAscensionLevel}) 3px, rgba(249, 115, 22, ${0.05 * currentAscensionLevel}) 6px);
            animation: scroll-veins 5s infinite linear; }
        `;
        break;
      case 'Esperança':
        ascensionPseudoElementStyle = `
          .${ascensionClass}::before { content: ""; position: absolute; inset: -6px; border-radius: 0.6rem; 
            border: 3px solid #fde047; box-shadow: 0 0 ${5 + currentAscensionLevel * 3}px #fde047;
            animation: pulse-aura-gold 2s infinite; opacity: ${0.5 + currentAscensionLevel * 0.15}; }
        `;
        break;
      case 'Absurdo':
        ascensionPseudoElementStyle = `
          .${ascensionClass} { animation: glitch-effect ${2 - currentAscensionLevel * 0.5}s infinite steps(5, end); }
        `;
        break;
      case 'Transcendência':
        ascensionPseudoElementStyle = `
          .${ascensionClass} { opacity: ${0.8 - currentAscensionLevel * 0.1}; filter: drop-shadow(0 0 ${3 + currentAscensionLevel*2}px #22d3ee); }
          .${ascensionClass}::before { content: ""; position: absolute; inset: -4px; border-radius: 0.5rem; 
            border: 1px solid rgba(34, 211, 238, 0.7); 
            animation: shimmer-cyan 2.5s infinite ease-in-out; opacity: ${0.3 + currentAscensionLevel * 0.2}; }
        `;
        break;
    }
  }

  return (
    <>
      <style>{`
        @keyframes pulse-aura-red { 0%, 100% { box-shadow: 0 0 5px #ef4444, 0 0 10px #ef4444; opacity: 0.6; } 50% { box-shadow: 0 0 15px #f87171, 0 0 25px #f87171; opacity: 1; } }
        @keyframes shimmer-blue { 0% { background-position: 0 0; } 100% { background-position: 16px 16px; } }
        @keyframes pulse-aura-purple { 0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.5; } 50% { transform: translateX(-50%) scale(1.1); opacity: 0.8; } }
        @keyframes scroll-veins { 0% { background-position: 0 0; } 100% { background-position: 12px 0; } }
        @keyframes pulse-aura-gold { 0%, 100% { box-shadow: 0 0 8px #fde047; opacity: 0.7; } 50% { box-shadow: 0 0 18px #fef08a, 0 0 28px #fef08a; opacity: 1; } }
        @keyframes glitch-effect { 
          0%, 100% { filter: hue-rotate(0deg) saturate(1); } 
          10% { transform: translateX(2px) skewX(-3deg); filter: hue-rotate(20deg) saturate(1.2); } 
          20% { transform: translateX(-2px) ; filter: hue-rotate(-10deg) saturate(0.8); }
          30%, 50%, 70%, 90% { transform: translateX(0) skewX(0); filter: hue-rotate(0deg) saturate(1); }
          40% { filter: contrast(1.5) brightness(0.9); }
          60% { clip-path: inset(${Math.random()*10}% 0 ${Math.random()*10}% 0); }
          80% { filter: saturate(0.5) blur(0.5px); }
        }
        @keyframes shimmer-cyan { 
          0%, 100% { border-color: rgba(34, 211, 238, 0.7); box-shadow: 0 0 5px rgba(34,211,238,0.5); } 
          50% { border-color: rgba(103, 232, 249, 1); box-shadow: 0 0 12px rgba(103,232,249,0.8); } 
        }
        ${ascensionPseudoElementStyle}
      `}</style>
      <div
        style={{
          left: x,
          top: y,
          width: width,
          height: height,
          transition: 'opacity 0.05s linear, box-shadow 0.2s linear, filter 0.2s linear',
          ...invulnerableStyle,
          ...etherealStyle,
          boxShadow: `0 0 15px 2px var(--neon-cyan), inset 0 0 8px var(--neon-cyan) ${hasBarrierShield ? ', 0 0 20px 5px rgba(0, 229, 255, 0.5)' : ''}`,
        }}
        className={`absolute bg-gradient-to-br from-sky-300 to-cyan-500 rounded-md border-2 border-white/70 ${ascensionClass}`}
      >
        <div 
          className="absolute top-1/3 w-3 h-4 bg-white rounded-sm"
          style={{ 
            left: direction === 'right' ? '60%' : '20%', 
            transform: 'translateY(-50%)',
            boxShadow: '0 0 5px white',
          }}
        ></div>
        {hasBarrierShield && (
          <div 
            className="absolute inset-[-5px] border-2 border-sky-300 rounded-xl animate-pulseBarrier"
            style={{animationDuration: '2s'}}
            ></div>
        )}
      </div>
      
      <div 
        style={{
            left: x + width / 2 - 25, 
            top: y - 18, 
            width: 50, 
            height: 8,
        }}
        className="absolute frutiger-glass !py-0 !px-0 !bg-white/50 !border-white/30 rounded-full overflow-hidden"
      >
        <div 
            style={{ width: `${healthPercentage}%`}} 
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 ease-out rounded-full"
        ></div>
      </div>
      <style>{`
        @keyframes pulseBarrier {
          0%, 100% { opacity: 0.5; box-shadow: 0 0 5px 0px rgba(0, 229, 255, 0.4); }
          50% { opacity: 1; box-shadow: 0 0 15px 3px rgba(0, 229, 255, 0.7); }
        }
        .animate-pulseBarrier { animation: pulseBarrier 2s infinite ease-in-out; }
      `}</style>
    </>
  );
};

export default PlayerComponent;
