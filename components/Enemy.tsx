
import React from 'react';
import { EnemyState } from '../types';
import { THEMATIC_ENEMY_DATA } from '../constants'; 

const EnemyComponent: React.FC<EnemyState> = (props) => {
  const { x, y, width, height, hp, maxHp, type, isPreparingDash, isDashing, behaviorProps, isFearedUntil, isConfusedUntil, vulnerabilityStacks, armorWeakenedFactor, bleedTicksLeft } = props;
  const healthPercentage = (hp / maxHp) * 100;
  const now = Date.now();

  const enemyData = THEMATIC_ENEMY_DATA[type] || THEMATIC_ENEMY_DATA['basic_flyer']; 
  const visuals = enemyData.visuals;

  let dynamicStyles: React.CSSProperties = {
    left: x,
    top: y,
    width: width,
    height: height,
    transition: 'transform 0.1s ease-out, box-shadow 0.2s linear, opacity 0.2s linear, filter 0.1s linear',
    background: `linear-gradient(to bottom right, ${visuals.gradientFrom}, ${visuals.gradientTo})`,
    boxShadow: `0 0 10px 2px ${visuals.neonShadowColor}, inset 0 0 5px ${visuals.neonShadowColor.replace('0.7', '0.4').replace('0.6', '0.3').replace('0.8', '0.5')}`,
  };

  let statusEffectsClass = "";

  if (isDashing) {
    dynamicStyles.transform = 'scale(1.1, 0.8)';
    dynamicStyles.boxShadow = `0 0 20px 5px rgba(255, 255, 100, 0.9), inset 0 0 10px rgba(255, 255, 100, 0.9)`; 
  } else if (isPreparingDash || behaviorProps?.isChargingBeam) {
    dynamicStyles.animation = `pulse-warning-${type} 0.5s infinite alternate`;
    dynamicStyles.boxShadow = `0 0 20px 5px ${visuals.neonShadowColor}, inset 0 0 10px ${visuals.neonShadowColor}`;
  }

  if (isFearedUntil && now < isFearedUntil) {
    statusEffectsClass += ` animate-shake`;
    dynamicStyles.filter = `hue-rotate(180deg) saturate(2)`;
  }
  if (isConfusedUntil && now < isConfusedUntil) {
    statusEffectsClass += ` animate-color-glitch`;
    dynamicStyles.filter = `contrast(1.5) brightness(0.8)`;
  }
  if (armorWeakenedFactor && armorWeakenedFactor > 0) {
    dynamicStyles.filter = (dynamicStyles.filter || "") + ` grayscale(${armorWeakenedFactor * 200}%)`; 
  }

  const shapeClassString = visuals.shapeClass || 'rounded-md'; 
  const coreClassString = visuals.coreClass || 'w-1/3 h-1/3 bg-white/70 rounded-full blur-xs'; 


  let coreElement = <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${coreClassString}`}></div>;
  if (type === 'abismo_olho') {
    coreElement = <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 rounded-full ${behaviorProps?.isChargingBeam ? 'bg-red-400 animate-ping' : 'bg-red-600'} border-2 border-black`}></div>;
  }

  const bleedParticles = bleedTicksLeft && bleedTicksLeft > 0 
    ? Array.from({ length: 3 }).map((_, i) => (
        <div 
          key={`bleed-${i}`}
          className="absolute bg-red-600 rounded-full"
          style={{
            width: '3px',
            height: '5px',
            left: `${Math.random() * 80 + 10}%`, // Random horizontal position
            animation: `bleed-drip ${1 + Math.random() * 0.5}s ${i * 0.2}s infinite linear`,
            opacity: 0.7,
          }}
        />
      ))
    : null;


  return (
    <>
      <div
        style={dynamicStyles}
        className={`absolute ${shapeClassString} ${statusEffectsClass} border-2 border-white/30`}
      >
        {coreElement}
        {bleedParticles}
        <div className="absolute -top-2 -right-2 flex flex-col space-y-0.5">
            {vulnerabilityStacks && vulnerabilityStacks > 0 && (
                <span className="text-xs px-1 py-0.5 bg-purple-600 text-white rounded-full shadow-md" title={`Vulnerável (${vulnerabilityStacks}x)`}>🔮{vulnerabilityStacks}</span>
            )}
            {armorWeakenedFactor && armorWeakenedFactor > 0 && (
                <span className="text-xs px-1 py-0.5 bg-gray-500 text-white rounded-full shadow-md" title={`Armadura Fraca (Dano +${(armorWeakenedFactor*100).toFixed(0)}%)`}>🛡️!</span>
            )}
             {props.bleedTicksLeft && props.bleedTicksLeft > 0 && (
                <span className="text-xs px-1 py-0.5 bg-red-700 text-white rounded-full shadow-md" title={`Sangrando`}>🩸</span>
            )}
        </div>
      </div>
       <div 
        style={{
            left: x + width / 2 - (width * 0.4), 
            top: y - 12,
            width: width * 0.8,
            height: 5,
        }}
        className="absolute bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden border border-white/20"
      >
        <div 
            style={{ width: `${healthPercentage}%`}} 
            className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300 ease-out rounded-full"
        ></div>
      </div>
      <style>{`
        @keyframes pulse-warning-${type} {
          from { opacity: 0.7; transform: scale(1); filter: brightness(1); }
          to { opacity: 1; transform: scale(1.05); filter: brightness(1.2); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px) rotate(-1deg); }
          50% { transform: translateX(2px) rotate(1deg); }
          75% { transform: translateX(-1px) rotate(0.5deg); }
        }
        .animate-shake { animation: shake 0.3s infinite; }

        @keyframes color-glitch {
          0%   { filter: hue-rotate(0deg) saturate(1); }
          25%  { filter: hue-rotate(90deg) saturate(1.5); }
          50%  { filter: hue-rotate(180deg) saturate(0.8); }
          75%  { filter: hue-rotate(270deg) saturate(1.2); }
          100% { filter: hue-rotate(360deg) saturate(1); }
        }
        .animate-color-glitch { animation: color-glitch 0.5s infinite linear; }
        
        @keyframes bleed-drip {
          0% { transform: translateY(-5px); opacity: 0.7; }
          100% { transform: translateY(${height * 0.8}px); opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default EnemyComponent;
