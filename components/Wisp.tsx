
import React from 'react';
import { WispState } from '../types';

const WispComponent: React.FC<WispState> = ({ x, y, width, height, isHungeringShadow, wispType, currentShieldHp }) => {
  let wispBaseClasses = "absolute rounded-full border-2 border-white/50";
  let wispColorClasses = "";
  let wispShadowClasses = "";
  let animationClass = "animate-pulseWisp";

  let wispStyles: React.CSSProperties = {
    left: x,
    top: y,
    width: width,
    height: height,
    // transition: 'left 0.1s linear, top 0.1s linear', // Removed for responsiveness
  };

  let coreClasses = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-white/80 rounded-full blur-xs";
  let additionalElements = null;

  if (wispType === 'aegis_shield_orb') {
    wispColorClasses = "bg-sky-400/50"; // Semi-transparent blue
    wispShadowClasses = "shadow-[0_0_10px_2px_#00e5ff,inset_0_0_4px_#00e5ff70]"; // Neon cyan shadow
    coreClasses = ""; // No inner core, it's a shield
    wispBaseClasses += " border-sky-300 opacity-80";
    animationClass = "animate-pulseAegisWisp";
    additionalElements = (
      <>
        {/* Outer ring */}
        <div className="absolute inset-[-2px] rounded-full border-2 border-sky-200 opacity-60"></div>
        {/* Inner slight gloss */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
        {/* Optional: Simple damage indicator if currentShieldHp is low, though maxShieldHp is 1 here.
            For more complex shields, this could show cracks or reduced opacity.
            For now, its existence implies it's active.
        */}
      </>
    );

  } else if (isHungeringShadow) { // Handles wispType === 'hungering_shadow' implicitly too
    wispColorClasses = "bg-gradient-to-br from-indigo-700 to-slate-900";
    wispShadowClasses = "shadow-[0_0_15px_3px_#a5b4fc,inset_0_0_8px_#a5b4fc70]"; // Indigo shadow
    coreClasses = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 bg-red-500/90 rounded-sm animate-pingOnceWispCore";
    animationClass = "animate-pulseWispShadow";
  } else { // Default wisp (standard)
    wispColorClasses = "bg-gradient-to-br from-purple-500 to-pink-500";
    wispShadowClasses = "shadow-[0_0_12px_2px_#ec4899,inset_0_0_6px_#ec489970]"; // Pink/Purple shadow
  }

  return (
    <>
      <div style={wispStyles} className={`${wispBaseClasses} ${wispColorClasses} ${wispShadowClasses} ${animationClass}`}>
        {coreClasses && <div className={coreClasses}></div>}
        {additionalElements}
      </div>
      <style>{`
        @keyframes pulseWispAnim {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        .animate-pulseWisp {
          animation: pulseWispAnim 1.8s infinite ease-in-out;
        }
        @keyframes pulseWispShadowAnim {
          0%, 100% { transform: scale(0.95); opacity: 0.7; filter: brightness(0.9); }
          50% { transform: scale(1.05); opacity: 0.9; filter: brightness(1.1); }
        }
        .animate-pulseWispShadow {
          animation: pulseWispShadowAnim 1.5s infinite ease-in-out;
        }
         @keyframes pulseAegisWispAnim {
          0%, 100% { opacity: 0.7; transform: rotate(0deg) scale(0.95); }
          50% { opacity: 0.9; transform: rotate(10deg) scale(1.05); }
        }
        .animate-pulseAegisWisp {
          animation: pulseAegisWispAnim 2.2s infinite ease-in-out;
        }
        @keyframes pingOnceWispCoreAnim {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.7; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.7; }
        }
        .animate-pingOnceWispCore {
          animation: pingOnceWispCoreAnim 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
};

export default WispComponent;
