
import React from 'react';
import { ProjectileState } from '../types';

const ProjectileComponent: React.FC<ProjectileState> = (props) => {
  const { x, y, width, height, color, owner, isNeon, size, type, isChaotic, chaoticBehavior, chaoticColor, isPsychicExplosion } = props;

  let baseSizeW = width; 
  let baseSizeH = height; 

  if (!baseSizeW || !baseSizeH) {
    baseSizeW = 10;
    baseSizeH = 10;
    if (size === 'small') { baseSizeW = 8; baseSizeH = 8; }
    if (size === 'large') { baseSizeW = 14; baseSizeH = 14; }
  }


  const projectileStyle: React.CSSProperties = {
    left: x,
    top: y,
    width: baseSizeW,
    height: baseSizeH,
    transition: 'transform 0.1s ease-out, width 0.1s ease-out, height 0.1s ease-out', // Added width/height transition for chaos
  };

  let specificClasses = `${chaoticColor || color || 'bg-gray-500'} shadow-md`; 
  let neonColor = 'var(--neon-cyan)'; 
  let borderRadius = '50%'; 
  let additionalInnerDiv = <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-white/70 rounded-full"></div>;

  // --- Existing Projectile Type Visuals ---
  if (type === 'thunderbolt') {
    specificClasses = 'bg-yellow-300'; 
    neonColor = '#fff700'; 
    borderRadius = '2px'; 
    projectileStyle.boxShadow = `0 0 10px 3px ${neonColor}, inset 0 0 5px ${neonColor}, 0 0 15px 5px rgba(255,231,0,0.5)`;
    projectileStyle.filter = 'brightness(1.3)';
    additionalInnerDiv = null;
  } else if (isPsychicExplosion || type === 'cosmic_echo_aoe') { // Combined for similar AoE visuals
    specificClasses = `${color || 'bg-purple-500'} opacity-70`;
    neonColor = type === 'cosmic_echo_aoe' ? '#a78bfa' : '#c084fc'; // Slightly different purple for echo
    borderRadius = '50%';
    projectileStyle.boxShadow = `0 0 15px 5px ${neonColor}, 0 0 25px 10px ${type === 'cosmic_echo_aoe' ? 'rgba(167,139,250,0.4)' :'rgba(192, 132, 252, 0.4)'}`;
    projectileStyle.animation = 'pulsePsychicExplosion 0.3s forwards';
    additionalInnerDiv = <div className="absolute inset-0 bg-white/50 rounded-full animate-pingOnce"></div>
  } else if (type === 'black_hole_effect') {
    specificClasses = `${color || 'bg-black'} opacity-80`;
    borderRadius = '50%';
    projectileStyle.boxShadow = `0 0 20px 10px rgba(50,0,100,0.5), inset 0 0 15px rgba(0,0,0,0.8)`;
    projectileStyle.animation = `spinAndPull 3s linear infinite, pulseBlackHole 1.5s infinite alternate`;
    additionalInnerDiv = <div className="absolute w-1/4 h-1/4 bg-purple-900 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>;
  }
   else if (isNeon) {
    if (owner === 'enemy') {
      neonColor = '#ff69b4'; 
      if (!color && !chaoticColor) specificClasses = `bg-pink-500`; 
    } else {
       if (!color && !chaoticColor) specificClasses = `bg-cyan-400`;
    }
    projectileStyle.boxShadow = `0 0 8px 2px ${neonColor}, inset 0 0 4px ${neonColor}`;
  }

  // --- New Reward Staff Projectile Visuals ---
  if (type === 'cosmic_orb') {
    specificClasses = `bg-gradient-to-br from-indigo-400 to-purple-500`;
    neonColor = '#a5b4fc'; // Indigo
    projectileStyle.boxShadow = `0 0 10px 3px ${neonColor}, inset 0 0 6px rgba(255,255,255,0.3)`;
    additionalInnerDiv = <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-indigo-200 rounded-full animate-pingOnce opacity-70"></div>;
  } else if (type === 'reality_bender_orb') {
    specificClasses = `bg-purple-600/70`; // opacity in class
    neonColor = '#c084fc';
    projectileStyle.boxShadow = `0 0 12px 4px ${neonColor}, inset 0 0 7px rgba(0,0,0,0.3)`;
    projectileStyle.animation = `pulseRealityBender 2s infinite ease-in-out`;
    additionalInnerDiv = <div className="absolute inset-1 rounded-full border-2 border-purple-400/50 animate-spin-slow"></div>;
  } else if (type === 'flesh_tentacle_segment') {
    specificClasses = `bg-red-700`;
    neonColor = '#ef4444';
    borderRadius = '4px'; // Less round
    projectileStyle.boxShadow = `0 0 6px 1px ${neonColor}, inset 0 0 3px rgba(0,0,0,0.4)`;
    additionalInnerDiv = <div className="absolute inset-0 bg-red-900/30 opacity-50"></div>;
  } else if (type === 'nexus_portal') {
    specificClasses = `bg-cyan-700/80`;
    neonColor = '#22d3ee';
    borderRadius = '8px'; 
    projectileStyle.boxShadow = `0 0 15px 5px ${neonColor}, inset 0 0 10px rgba(0,0,0,0.5)`;
    projectileStyle.animation = `pulseNexusPortal 1.5s infinite alternate`;
    additionalInnerDiv = <div className="absolute inset-2 rounded-md border-2 border-cyan-300/70 animate-pulse" style={{animationDuration:'1s'}}></div>;
  } else if (type === 'nexus_energy_burst') {
    specificClasses = `bg-teal-400`;
    neonColor = '#5eead4';
    projectileStyle.boxShadow = `0 0 8px 2px ${neonColor}`;
    additionalInnerDiv = <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-white/90 rounded-full"></div>;
  }
  
  if (isChaotic) {
    if (chaoticBehavior === 'random_size_pulse') {
      projectileStyle.animation = `chaoticPulse ${0.2 + Math.random() * 0.3}s infinite alternate`;
    } else if (chaoticBehavior === 'color_shift') {
       projectileStyle.animation = `chaoticColorShift ${0.5 + Math.random() * 0.5}s infinite linear`;
    } else if (chaoticBehavior === 'erratic_move'){
        projectileStyle.animation = `chaoticJitter 0.1s infinite linear`;
    }
  }
  
  projectileStyle.borderRadius = borderRadius;


  return (
    <>
    <div
      style={projectileStyle}
      className={`absolute ${specificClasses}`}
    >
      {additionalInnerDiv}
    </div>
    <style>{`
        @keyframes chaoticPulse {
            from { transform: scale(0.8); opacity: 0.7; }
            to { transform: scale(1.2); opacity: 1; }
        }
        @keyframes chaoticColorShift {
            0%   { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
        @keyframes chaoticJitter {
            0%, 100% { transform: translate(0,0); }
            25% { transform: translate(1px, -1px); }
            50% { transform: translate(-1px, 1px); }
            75% { transform: translate(0.5px, 0.5px); }
        }
        @keyframes pulsePsychicExplosion {
            from { transform: scale(0.2); opacity: 1; }
            to { transform: scale(1); opacity: 0; }
        }
        @keyframes pingOnce { 
            75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes spinAndPull {
            from { transform: rotate(0deg) scale(1); }
            to   { transform: rotate(360deg) scale(1.05); } 
        }
         @keyframes pulseBlackHole {
            from { opacity: 0.7; box-shadow: 0 0 15px 8px rgba(50,0,100,0.4), inset 0 0 10px rgba(0,0,0,0.7); }
            to   { opacity: 0.9; box-shadow: 0 0 25px 12px rgba(50,0,100,0.6), inset 0 0 20px rgba(0,0,0,0.9); }
        }
        @keyframes pulseRealityBender {
            0%, 100% { filter: brightness(0.8) saturate(0.8) blur(0.5px); transform: scale(0.95); }
            50% { filter: brightness(1.2) saturate(1.2) blur(0px); transform: scale(1.05); }
        }
        @keyframes pulseNexusPortal {
            0%, 100% { opacity: 0.7; filter: brightness(0.9); transform: scale(1); }
            50% { opacity: 1; filter: brightness(1.1); transform: scale(1.03); }
        }
      `}</style>
    </>
  );
};

export default ProjectileComponent;
