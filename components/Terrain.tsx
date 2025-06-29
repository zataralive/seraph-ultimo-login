
import React from 'react';
import { TerrainPlatform } from '../types';

interface TerrainProps {
  platforms: TerrainPlatform[];
}

const TerrainComponent: React.FC<TerrainProps> = ({ platforms }) => {
  return (
    <>
      {platforms.map(platform => (
        <div
          key={platform.id}
          style={{
            left: platform.x,
            top: platform.y,
            width: platform.width,
            height: platform.height,
            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 2px 3px rgba(0,0,0,0.1)',
          }}
          className={`absolute rounded-md ${
            platform.id === 'ground' 
              ? 'bg-gradient-to-b from-sky-200/95 to-sky-400/95 dark:from-slate-600 dark:to-slate-700 border-t-2 border-white/60' 
              : 'bg-gradient-to-b from-cyan-300/90 to-sky-500/90 dark:from-sky-700 dark:to-sky-800 border-t-2 border-white/50'
          } shadow-md`}
        >
           <div className="absolute inset-0 opacity-15 rounded-md" style={{backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.08) 75%, transparent 75%, transparent)` , backgroundSize: '10px 10px'}}></div>
        </div>
      ))}
    </>
  );
};

export default TerrainComponent;
