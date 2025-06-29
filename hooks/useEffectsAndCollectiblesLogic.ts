
import React from 'react';
import { CollectibleState, PlayerState, VisualEffectState, ProjectileState, TerrainPlatform, SoundTriggerState } from '../types';
import { checkCollision } from '../App'; 
import { PLAYER_PROJECTILE_SPEED, GAME_WIDTH, GAME_HEIGHT, COLLECTIBLE_GRAVITY, GRAVITY } from '../constants';

export interface UseEffectsAndCollectiblesLogicProps {
  collectiblesRef: React.MutableRefObject<CollectibleState[]>;
  visualEffectsRef: React.MutableRefObject<VisualEffectState[]>;
  projectilesRef: React.MutableRefObject<ProjectileState[]>; 
  playerRef: React.MutableRefObject<PlayerState>;
  currentScenePlatformsRef: React.MutableRefObject<TerrainPlatform[]>;
  setSoundTriggers: React.Dispatch<React.SetStateAction<SoundTriggerState>>;

  onSetPlayerHP: (newHP: number) => void;
  onSetScore: React.Dispatch<React.SetStateAction<number>>;
}

export interface UpdateCollectiblesResult {
  updatedCollectibles: CollectibleState[];
}
export interface UpdateVisualEffectsResult {
  updatedVisualEffects: VisualEffectState[];
}

export const useEffectsAndCollectiblesLogic = (props: UseEffectsAndCollectiblesLogicProps) => {
  const {
    collectiblesRef, visualEffectsRef, projectilesRef, playerRef, currentScenePlatformsRef, setSoundTriggers,
    onSetPlayerHP, onSetScore
  } = props;

  const updateCollectibles = (deltaTimeArg: number, nowArg: number): UpdateCollectiblesResult => {
    const playerForCollision = playerRef.current;
    const stillExistingCollectibles: CollectibleState[] = [];
    const dtFactor = deltaTimeArg * 60;

    for (const collect of collectiblesRef.current) {
      let updatedCollectible = { ...collect };

      if (updatedCollectible.isFalling) {
        updatedCollectible.velocityY += COLLECTIBLE_GRAVITY * dtFactor;
      }

      let tentativeY = updatedCollectible.y + updatedCollectible.velocityY * dtFactor;
      let landedThisFrame = false;

      // Check collision with platforms
      for (const platform of currentScenePlatformsRef.current) {
        if (
          updatedCollectible.x + updatedCollectible.width > platform.x &&
          updatedCollectible.x < platform.x + platform.width &&
          updatedCollectible.y + updatedCollectible.height <= platform.y + 1 && // was above or at platform top edge
          tentativeY + updatedCollectible.height >= platform.y // will be at or below platform top edge
        ) {
          if (updatedCollectible.velocityY >= 0) { // Only land if falling or still
            updatedCollectible.y = platform.y - updatedCollectible.height;
            updatedCollectible.velocityY = 0;
            updatedCollectible.isFalling = false;
            landedThisFrame = true;
            break; 
          }
        }
      }
      
      // If not landed on a specific platform, update y and check game ground
      if (!landedThisFrame) {
        updatedCollectible.y = tentativeY;
        // Check collision with game ground (absolute bottom)
        const groundY = GAME_HEIGHT - (currentScenePlatformsRef.current.find(p => p.id === 'ground')?.height || 30);
        if (updatedCollectible.y + updatedCollectible.height >= groundY) {
          updatedCollectible.y = groundY - updatedCollectible.height;
          updatedCollectible.velocityY = 0;
          updatedCollectible.isFalling = false;
        }
      }
       // Prevent falling through top
       if (updatedCollectible.y < 0) {
          updatedCollectible.y = 0;
          if (updatedCollectible.velocityY < 0) updatedCollectible.velocityY = 0;
       }


      // Player pickup logic: only if player collides AND collectible is NOT falling
      if (!updatedCollectible.isFalling && checkCollision(playerForCollision, updatedCollectible)) {
        if (updatedCollectible.type === 'healing_orb') {
          let healValue = updatedCollectible.value || 15;
          if (updatedCollectible.isPotent && playerForCollision.healingOrbsArePotent) healValue *= 1.5;
          onSetPlayerHP(Math.min(playerForCollision.maxHp, playerForCollision.hp + healValue));
          setSoundTriggers(prev => ({ ...prev, collectiblePickup: { type: 'healing_orb', timestamp: Date.now() } }));
        } else if (updatedCollectible.type === 'soul_orb') {
          onSetScore(s => s + (updatedCollectible.value || 50));
          setSoundTriggers(prev => ({ ...prev, collectiblePickup: { type: 'soul_orb', timestamp: Date.now() } }));
        }
        // Do not add to stillExistingCollectibles, effectively removing it
      } else {
        stillExistingCollectibles.push(updatedCollectible);
      }
    }
    return { updatedCollectibles: stillExistingCollectibles };
  };

  const spawnThunderbolts = (playerForDamage: PlayerState, count: number, isTelegraphed: boolean = false) => {
    const currentNow = Date.now(); 
    if (isTelegraphed) {
      const newTelegraphs: VisualEffectState[] = [];
      for (let i = 0; i < count; i++) {
        const targetX = Math.random() * (GAME_WIDTH - 30) + 15;
        let telegraphY = GAME_HEIGHT - 30 - 10;
        const groundPlatforms = currentScenePlatformsRef.current.filter(p => p.y > GAME_HEIGHT / 2);
        if (groundPlatforms.length > 0) {
          const lowestPlatform = groundPlatforms.sort((a, b) => b.y - a.y)[0];
          telegraphY = lowestPlatform.y - 10;
        }
        newTelegraphs.push({
          id: `thunder_telegraph-${currentNow}-${i}`, effectType: 'thunder_telegraph',
          x: targetX - 15, y: telegraphY, width: 30, height: 10,
          creationTime: currentNow, duration: 500,
          data: { actualBoltTargetX: targetX, damage: playerForDamage.projectileDamage * 1.5 }
        });
      }
      visualEffectsRef.current = [...visualEffectsRef.current, ...newTelegraphs];
    } else { // Direct spawn, not telegraphed (e.g., from Thunder Staff direct proc)
      const newThunderbolts: ProjectileState[] = [];
      for (let i = 0; i < count; i++) {
        const targetX = Math.random() * (GAME_WIDTH - 20) + 10;
        newThunderbolts.push({
          id: `thunder-${currentNow}-${i}`, owner: 'player', type: 'thunderbolt',
          x: targetX - 5, y: 0, width: 10, height: 40,
          damage: playerForDamage.projectileDamage * 1.5,
          vx: 0, vy: PLAYER_PROJECTILE_SPEED * 1.3,
          color: 'bg-yellow-300', isNeon: true, size: 'medium',
          duration: 1200, spawnTime: currentNow, piercing: 0,
        });
      }
      projectilesRef.current = [...projectilesRef.current, ...newThunderbolts];
    }
    setSoundTriggers(prev => ({...prev, thunderboltCast: Date.now()}));
  };

  const spawnFrictionProjectileSpark = (player: PlayerState) => {
    if (!player.frictionProjectilesToLaunch) return;
    const currentNow = Date.now();
    for(let i = 0; i < player.frictionProjectilesToLaunch; i++) {
        projectilesRef.current.push({
            id: `friction-${currentNow}-${i}`, owner: 'neutral', type: 'friction_explosive',
            x: player.x + player.width/2 - 5, y: player.y - 10, width: 10, height: 10,
            damage: player.projectileDamage * 0.5, 
            vx: (Math.random() - 0.5) * 2, vy: - PLAYER_PROJECTILE_SPEED * 0.7,
            color: 'bg-orange-500', isNeon: true, size: 'medium', duration: 2000, spawnTime: currentNow,
            piercing: 0, 
        });
        visualEffectsRef.current.push({
            id: `friction_spark-${currentNow}-${i}`,
            effectType: 'player_spark_burst',
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            width: 20, height: 20, 
            creationTime: currentNow,
            duration: 300, 
            color: 'orange'
        });
    }
  };


  const updateVisualEffects = (nowArg: number): UpdateVisualEffectsResult => {
    const activeFx: VisualEffectState[] = [];
    visualEffectsRef.current.forEach(effect => {
      if (nowArg < effect.creationTime + effect.duration) {
        activeFx.push(effect);
      } else {
        // Handle effects that trigger something on completion
        if (effect.effectType === 'thunder_telegraph' && effect.data) {
          const { actualBoltTargetX, damage } = effect.data;
          projectilesRef.current.push({
            id: `thunder-${nowArg}-${Math.random()}`, owner: 'player', type: 'thunderbolt',
            x: actualBoltTargetX - 5, y: 0, width: 10, height: 40,
            damage: damage,
            vx: 0, vy: PLAYER_PROJECTILE_SPEED * 1.3,
            color: 'bg-yellow-300', isNeon: true, size: 'medium',
            duration: 1200, spawnTime: nowArg, piercing: 0,
          });
          // Thunderbolt sound is triggered by spawnThunderbolts, no need to double trigger here
        }
      }
    });
    return { updatedVisualEffects: activeFx };
  };

  return { 
    updateCollectibles, 
    updateVisualEffects, 
    spawnThunderbolts, 
    spawnFrictionProjectileSpark 
  };
};
