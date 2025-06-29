
import React, { useEffect, useState } from 'react';
import { VisualEffectState } from '../types';

const VisualEffectComponent: React.FC<VisualEffectState> = (props) => {
  const { x, y, width, height, effectType, creationTime, duration, color } = props;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Date.now() - creationTime);
    }, 50);
    return () => clearInterval(timer);
  }, [creationTime]);

  const progress = Math.min(1, elapsed / duration);

  if (effectType === 'thunder_telegraph') {
    const intensity = Math.sin(progress * Math.PI); // Pulse in and out
    const circleSize = width * (0.5 + progress * 0.5); // Grow
    return (
      <div
        style={{
          left: x + width/2 - circleSize/2,
          top: y + height/2 - circleSize/2,
          width: circleSize,
          height: circleSize,
          borderRadius: '50%',
          border: `${2 + intensity * 2}px solid rgba(255, 255, 100, ${0.5 + intensity * 0.5})`,
          boxShadow: `0 0 ${10 + intensity * 10}px rgba(255, 255, 100, ${0.3 + intensity * 0.4})`,
          opacity: 1 - progress * 0.3, // Fade out slightly towards end before vanishing
          position: 'absolute',
          transition: 'opacity 0.1s linear',
          background: `radial-gradient(circle, rgba(255, 255, 224, ${0.1 * intensity}) 20%, transparent 70%)`
        }}
        className="animate-pulseTelegraph"
      >
        <style>{`
          @keyframes pulseTelegraphAnim {
            0%, 100% { filter: brightness(0.8) }
            50% { filter: brightness(1.2) }
          }
          .animate-pulseTelegraph { animation: pulseTelegraphAnim 0.5s infinite ease-in-out; }
        `}</style>
      </div>
    );
  }

  if (effectType === 'player_spark_burst') {
    if (progress >= 1) return null; // Remove when done

    return (
      <>
        {Array.from({ length: 5 + Math.floor(Math.random() * 3) }).map((_, i) => {
          const angle = Math.random() * Math.PI * 2;
          const distance = progress * (20 + Math.random() * 15); // Sparks fly further out
          const particleX = x + Math.cos(angle) * distance;
          const particleY = y + Math.sin(angle) * distance;
          const particleSize = 2 + Math.random() * 2;
          return (
            <div
              key={i}
              style={{
                left: particleX - particleSize/2,
                top: particleY - particleSize/2,
                width: particleSize,
                height: particleSize,
                backgroundColor: color === 'orange' ? '#fb923c' : '#facc15', // Default yellow, allow orange
                borderRadius: '50%',
                position: 'absolute',
                opacity: 1 - progress, // Fade out
                transform: `scale(${1-progress})`,
              }}
            />
          );
        })}
      </>
    );
  }

  return null;
};

export default VisualEffectComponent;
