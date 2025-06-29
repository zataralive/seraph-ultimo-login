import React from 'react';

interface HUDLocationProps {
  sceneName: string;
  isObscured: boolean;
}

const HUDLocation: React.FC<HUDLocationProps> = ({ sceneName, isObscured }) => {
  return (
    <div
      className={`hud-element text-right min-w-[120px] p-2 ${isObscured ? 'obscured' : ''}`}
      style={{ position: 'absolute', bottom: '1rem', right: '1rem' }} // Explicit positioning
    >
      <div className="text-[9px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-0.5">LOCALIZAÇÃO</div>
      <div className="text-xs font-semibold text-sky-600 dark:text-neon-cyan truncate" title={sceneName}> {/* Tamanho da fonte ajustado */}
        {sceneName}
      </div>
    </div>
  );
};

export default HUDLocation;