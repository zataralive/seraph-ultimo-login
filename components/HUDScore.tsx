import React from 'react';

interface HUDScoreProps {
  score: number;
  isObscured: boolean;
}

const HUDScore: React.FC<HUDScoreProps> = ({ score, isObscured }) => {
  return (
    <div className={`hud-element top-4 left-auto right-4 text-right min-w-[90px] p-2 ${isObscured ? 'obscured' : ''}`}> {/* Padding e min-width ajustados */}
      <div className="text-[9px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-0.5">PONTUAÇÃO</div>
      <div className="text-lg font-bold text-sky-600 dark:text-neon-cyan">{score}</div> {/* Tamanho da fonte ajustado */}
    </div>
  );
};

export default HUDScore;