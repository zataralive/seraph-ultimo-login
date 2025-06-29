
import React from 'react';
import { PlayerState, EffectDefinition } from '../types';

interface PauseMenuProps {
  playerState: PlayerState;
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

const StatDisplay: React.FC<{ label: string; value: string | number; unit?: string; neonValue?: boolean; small?: boolean }> = ({ label, value, unit, neonValue, small }) => (
  <div className={`flex justify-between items-center ${small ? 'text-xs mb-0.5' : 'text-sm mb-1'}`}>
    <span className="text-slate-500 dark:text-slate-400">{label}:</span>
    <span className={`${neonValue ? 'text-neon-cyan' : 'text-sky-600 dark:text-sky-200'} font-medium`}>
      {value}{unit && <span className="text-slate-400 dark:text-slate-500 text-xxs ml-0.5">{unit}</span>}
    </span>
  </div>
);

const PauseMenu: React.FC<PauseMenuProps> = ({ playerState, onResume, onRestart, onMainMenu }) => {
  const {
    hp, maxHp, projectileDamage, attackSpeed, critChance, critDamageMultiplier, defense, speed, jumpForce,
    projectilesCanPierce, projectileSizeMultiplier, lifeStealPercentage, contactDamageBonus, chosenEffects
  } = playerState;

  const attackSpeedPerSecond = attackSpeed > 0 ? (1000 / attackSpeed).toFixed(2) : 'N/A';

  return (
    <div className="absolute inset-0 bg-sky-800/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-40 p-4">
      <div className="frutiger-panel p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <h2 className="text-3xl md:text-4xl font-light mb-6 text-sky-700 dark:text-neon-cyan text-center border-b border-sky-200/50 dark:border-slate-600/50 pb-3">
          Sistema Pausado
        </h2>

        <div className="flex-grow flex flex-col md:flex-row gap-4 md:gap-6 overflow-y-auto custom-scrollbar-dark pr-2 -mr-2 mb-6">
          {/* Coluna de Atributos e Ações */}
          <div className="w-full md:w-2/5 flex-shrink-0 flex flex-col space-y-4">
            <div className="frutiger-card p-3">
              <h3 className="text-md font-semibold text-sky-700 dark:text-sky-300 mb-2 text-center">Atributos Primários</h3>
              <StatDisplay label="Vida Máx." value={maxHp.toFixed(0)} small />
              <StatDisplay label="Dano Base" value={projectileDamage.toFixed(1)} neonValue small />
              <StatDisplay label="Ataques/s" value={attackSpeedPerSecond} unit="aps" small />
              <StatDisplay label="Chance Crít." value={(critChance * 100).toFixed(0)} unit="%" neonValue small />
              <StatDisplay label="Multi Crít." value={critDamageMultiplier?.toFixed(2) || '1.50'} unit="x" small />
              <StatDisplay label="Defesa" value={(defense * 100).toFixed(0)} unit="%" small />
              <StatDisplay label="Velocidade" value={speed.toFixed(1)} small />
              <StatDisplay label="Força Pulo" value={jumpForce.toFixed(1)} small />
              {projectilesCanPierce > 0 && <StatDisplay label="Perfurar" value={projectilesCanPierce} small />}
              {(projectileSizeMultiplier || 1) !== 1 && <StatDisplay label="Tam. Projétil" value={(projectileSizeMultiplier || 1).toFixed(1)} unit="x" small />}
              {(lifeStealPercentage || 0) > 0 && <StatDisplay label="Roubo Vida" value={((lifeStealPercentage || 0) * 100).toFixed(0)} unit="%" small />}
              {(contactDamageBonus || 0) > 0 && <StatDisplay label="Dano Contato" value={(contactDamageBonus || 0).toFixed(0)} small />}
            </div>
            <div className="space-y-3 mt-auto"> {/* Push buttons to bottom of this column */}
              <button onClick={onResume} className="frutiger-button-neon text-md w-full py-2.5">
                Retomar Processo
              </button>
              <button onClick={onRestart} className="frutiger-button-neon text-md w-full py-2.5 opacity-90 hover:opacity-100">
                Reinicializar Execução
              </button>
              <button onClick={onMainMenu} className="frutiger-button-neon text-md w-full py-2.5 opacity-80 hover:opacity-100 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white">
                Menu Principal
              </button>
            </div>
          </div>

          {/* Coluna de Habilidades */}
          <div className="w-full md:w-3/5 frutiger-card p-3 flex flex-col">
            <h3 className="text-md font-semibold text-sky-700 dark:text-sky-300 mb-2 text-center">Habilidades Ativas</h3>
            {chosenEffects.length > 0 ? (
              <div className="space-y-2 overflow-y-auto custom-scrollbar-dark pr-1 flex-grow">
                {chosenEffects.map(effect => (
                  <div key={effect.id} className="frutiger-card bg-sky-100/50 dark:bg-slate-700/50 p-2 rounded-md text-xs">
                    <div className="flex items-center">
                      {effect.icon && <span className="frutiger-card-icon text-sky-700 dark:text-sky-300">{effect.icon}</span>}
                      <span className="font-semibold text-sky-700 dark:text-sky-200">{effect.name}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-xxs leading-tight">{effect.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center italic mt-4 flex-grow flex items-center justify-center">Nenhuma habilidade adquirida.</p>
            )}
          </div>
        </div>
      </div>
       <style>{`.text-xxs { font-size: 0.7rem; }`}</style>
    </div>
  );
};

export default PauseMenu;
