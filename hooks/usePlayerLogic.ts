
import React, { useRef } from 'react';
import { PlayerState, EnemyState, ProjectileState, TerrainPlatform, VisualEffectState, GamePhase, WispState, SoundTriggerState, MinionState } from '../types'; 
import { GRAVITY, PLAYER_PROJECTILE_SPEED, THUNDERBOLT_COOLDOWN_DEFAULT, WILL_O_WISP_ORBIT_RADIUS, MINION_DEFAULT_HP, MINION_DEFAULT_SPEED, MINION_DEFAULT_DAMAGE, MINION_DEFAULT_ATTACK_COOLDOWN, CARNE_LIFE_DEGEN_GRACE_PERIOD, THUNDER_STAFF_ID, GAME_WIDTH, GAME_HEIGHT, INITIAL_INVULNERABILITY_ON_HIT, GILDED_AEGIS_STAFF_ID, MAX_AEGIS_ORBS, AEGIS_ORB_BASE_SHIELD_HP, THEMATIC_ENEMY_DATA } from '../constants'; 
import { checkCollision } from '../App'; 

export interface UsePlayerLogicProps {
  playerRef: React.MutableRefObject<PlayerState>;
  enemiesRef: React.MutableRefObject<EnemyState[]>;
  projectilesRef: React.MutableRefObject<ProjectileState[]>; 
  visualEffectsRef: React.MutableRefObject<VisualEffectState[]>; 
  currentScenePlatformsRef: React.MutableRefObject<TerrainPlatform[]>;
  keysPressedRef: React.MutableRefObject<Record<string, boolean>>;
  isMouseDownRef: React.MutableRefObject<boolean>;
  mousePositionRef: React.MutableRefObject<{ x: number; y: number }>;
  gamePhaseRef: React.MutableRefObject<GamePhase>;
  shotRequestedRef: React.MutableRefObject<boolean>; // Added this to the interface for clarity, though it's part of GameInputRefs
  setSoundTriggers: React.Dispatch<React.SetStateAction<SoundTriggerState>>; 
  
  onShowNarrativeMessage: (message: string, duration?: number) => void;
  onSpawnThunderbolts: (playerForDamage: PlayerState, count: number, isTelegraphed?: boolean) => void;
  onSpawnFrictionProjectileSpark: (player: PlayerState) => void;
  onSetPlayerHP: (newHP: number) => void; 
  onSetPlayerInvulnerableUntil: (timestamp: number) => void;
  onSetPlayerLastDamageDealtTime: (timestamp: number) => void;
  onSetPlayerHasDivineIntervention: (value: boolean) => void;
  onSetPlayerHasBarrierShield: (value: boolean) => void;
  onSetPlayerLastBarrierActivationTime: (timestamp: number) => void;
}

const JUMP_KEYS = ['space', 'keyw', 'arrowup'];

export const usePlayerLogic = (props: UsePlayerLogicProps) => {
  const {
    playerRef, enemiesRef, projectilesRef, visualEffectsRef, currentScenePlatformsRef,
    keysPressedRef, isMouseDownRef, mousePositionRef, gamePhaseRef, shotRequestedRef, 
    setSoundTriggers, 
    onShowNarrativeMessage, onSpawnThunderbolts, onSpawnFrictionProjectileSpark,
    onSetPlayerHP, onSetPlayerInvulnerableUntil, onSetPlayerLastDamageDealtTime,
    onSetPlayerHasDivineIntervention, onSetPlayerHasBarrierShield, onSetPlayerLastBarrierActivationTime
  } = props;

  const previousJumpKeysStateRef = useRef<Record<string, boolean>>({});
  const landedSinceLastJumpRef = useRef<boolean>(true);

  const updatePlayer = (deltaTimeArg: number, nowArg: number): PlayerState => {
    let updatedPlayerState = { ...playerRef.current };
    const K_REF = keysPressedRef.current; 
    const dtFactor = deltaTimeArg * 60;
    let distanceMoved = 0;

    // Movement
    let currentSpeed = updatedPlayerState.speed;
    if (updatedPlayerState.unpredictablePlayerSpeedActive && Math.random() < 0.03 * dtFactor) {
      currentSpeed = updatedPlayerState.speed * (0.5 + Math.random() * 1.0);
    }

    if (K_REF['keya'] || K_REF['arrowleft']) {
      updatedPlayerState.x -= currentSpeed * dtFactor;
      distanceMoved += currentSpeed * dtFactor;
      updatedPlayerState.direction = 'left';
    }
    if (K_REF['keyd'] || K_REF['arrowright']) {
      updatedPlayerState.x += currentSpeed * dtFactor;
      distanceMoved += currentSpeed * dtFactor;
      updatedPlayerState.direction = 'right';
    }

    // Jump Logic - Edge Detection
    let jumpRequestedThisFrame = false;
    for (const key of JUMP_KEYS) {
      if (K_REF[key] && !previousJumpKeysStateRef.current[key]) {
        jumpRequestedThisFrame = true;
        break;
      }
    }

    if (jumpRequestedThisFrame && updatedPlayerState.jumpsLeft > 0) {
      updatedPlayerState.velocityY = -updatedPlayerState.jumpForce;
      updatedPlayerState.isJumping = true;
      updatedPlayerState.jumpsLeft -= 1;
      landedSinceLastJumpRef.current = false;
      setSoundTriggers(prev => ({ ...prev, playerJump: Date.now() })); 
      if (updatedPlayerState.etherealOnJump && updatedPlayerState.etherealDuration) {
        updatedPlayerState.etherealUntil = nowArg + updatedPlayerState.etherealDuration;
      }
    }
    
    for (const key of JUMP_KEYS) {
        previousJumpKeysStateRef.current[key] = K_REF[key] === true;
    }

    updatedPlayerState.velocityY += GRAVITY * dtFactor;
    const tentativeY = updatedPlayerState.y + updatedPlayerState.velocityY * dtFactor;

    let onPlatform = false;
    currentScenePlatformsRef.current.forEach(platform => {
      if (updatedPlayerState.x + updatedPlayerState.width > platform.x &&
          updatedPlayerState.x < platform.x + platform.width) {
        if (updatedPlayerState.velocityY >= 0) {
          const playerPreviousBottomY = playerRef.current.y + playerRef.current.height;
          const playerCurrentBottomY = tentativeY + updatedPlayerState.height;
          if (playerPreviousBottomY <= platform.y + 1 && playerCurrentBottomY >= platform.y) {
            updatedPlayerState.y = platform.y - updatedPlayerState.height;
            updatedPlayerState.velocityY = 0;
            if (updatedPlayerState.isJumping && !landedSinceLastJumpRef.current) {
                setSoundTriggers(prev => ({ ...prev, playerLand: Date.now() })); 
                landedSinceLastJumpRef.current = true;
            }
            updatedPlayerState.isJumping = false;
            updatedPlayerState.jumpsLeft = updatedPlayerState.maxJumps;
            onPlatform = true;
          }
        } else if (updatedPlayerState.velocityY < 0) {
          const playerPreviousTopY = playerRef.current.y;
          const playerCurrentTopY = tentativeY;
          const platformBottomEdge = platform.y + platform.height;
          if (playerPreviousTopY >= platformBottomEdge - 1 && playerCurrentTopY <= platformBottomEdge) {
            updatedPlayerState.y = platform.y + platform.height;
            updatedPlayerState.velocityY = 0;
          }
        }
      }
    });
    if (!onPlatform) updatedPlayerState.y = tentativeY;

    updatedPlayerState.x = Math.max(0, Math.min(updatedPlayerState.x, GAME_WIDTH - updatedPlayerState.width));
    const groundPlatform = currentScenePlatformsRef.current.find(p => p.id === 'ground');
    if (updatedPlayerState.y >= GAME_HEIGHT - updatedPlayerState.height && !onPlatform) { 
        if (groundPlatform && updatedPlayerState.y >= groundPlatform.y - updatedPlayerState.height) {
             updatedPlayerState.y = groundPlatform.y - updatedPlayerState.height;
        } else if (!groundPlatform && updatedPlayerState.y >= GAME_HEIGHT - updatedPlayerState.height) {
             updatedPlayerState.y = GAME_HEIGHT - updatedPlayerState.height;
        }
         if (updatedPlayerState.velocityY > 0) {
            updatedPlayerState.velocityY = 0;
            if (updatedPlayerState.isJumping && !landedSinceLastJumpRef.current) {
                 setSoundTriggers(prev => ({ ...prev, playerLand: Date.now() })); 
                 landedSinceLastJumpRef.current = true;
            }
         }
         updatedPlayerState.isJumping = false;
         updatedPlayerState.jumpsLeft = updatedPlayerState.maxJumps;
    }
    updatedPlayerState.y = Math.max(0, updatedPlayerState.y);

    // Shooting
    if (isMouseDownRef.current && shotRequestedRef.current) { 
      let actualAttackSpeed = updatedPlayerState.attackSpeed;
      if (nowArg - updatedPlayerState.lastShotTime > actualAttackSpeed) {
        setSoundTriggers(prev => ({ ...prev, playerShoot: { staffId: updatedPlayerState.currentStaff.id, timestamp: nowArg } }));
        
        let newProjectiles = updatedPlayerState.currentStaff.shoot(
          updatedPlayerState,
          GAME_WIDTH, GAME_HEIGHT,
          mousePositionRef.current.x, mousePositionRef.current.y
        );

        if (updatedPlayerState.chanceToDuplicateProjectiles && Math.random() < updatedPlayerState.chanceToDuplicateProjectiles) {
            const duplicatedProjectiles = updatedPlayerState.currentStaff.shoot(
                { ...updatedPlayerState, x: updatedPlayerState.x + (Math.random()-0.5)*5, y: updatedPlayerState.y + (Math.random()-0.5)*5 }, 
                GAME_WIDTH, GAME_HEIGHT,
                mousePositionRef.current.x + (Math.random()-0.5)*10, mousePositionRef.current.y + (Math.random()-0.5)*10 
            );
            newProjectiles = [...newProjectiles, ...duplicatedProjectiles.map(p => ({...p, id: `dup-${p.id}`}))];
            onShowNarrativeMessage("Projétil Duplicado!", 1000);
        }
        
        projectilesRef.current.push(...newProjectiles);
        updatedPlayerState.lastShotTime = nowArg;
        onSetPlayerLastDamageDealtTime(nowArg); 

        if (updatedPlayerState.currentStaff.id === THUNDER_STAFF_ID && updatedPlayerState.thunderboltsPerActivation) {
            onSpawnThunderbolts(updatedPlayerState, 1, false); 
        }

        if (updatedPlayerState.currentStaff.id === GILDED_AEGIS_STAFF_ID) {
            const existingAegisOrbs = updatedPlayerState.activeWisps.filter(w => w.wispType === 'aegis_shield_orb').length;
            if (existingAegisOrbs < MAX_AEGIS_ORBS) {
                const newAegisWisp: WispState = {
                    id: `aegis-wisp-${nowArg}`,
                    ownerId: updatedPlayerState.id,
                    x: updatedPlayerState.x, y: updatedPlayerState.y,
                    width: 20, height: 20,
                    orbitAngle: (existingAegisOrbs / MAX_AEGIS_ORBS) * Math.PI * 2,
                    lastAttackTime: 0, attackSpeed: 0, damage: 0, 
                    wispType: 'aegis_shield_orb',
                    maxShieldHp: AEGIS_ORB_BASE_SHIELD_HP,
                    currentShieldHp: AEGIS_ORB_BASE_SHIELD_HP,
                };
                updatedPlayerState.activeWisps.push(newAegisWisp);
                setSoundTriggers(prev => ({...prev, barrierShieldActivate: Date.now()}));
            }
        }
        // shotRequestedRef.current = false; // Removed this line to allow continuous fire
      }
    }
    
    // Automatic effects
    if (updatedPlayerState.lastThunderboltTime !== undefined && updatedPlayerState.thunderboltCooldown && updatedPlayerState.thunderboltsPerActivation &&
        nowArg - updatedPlayerState.lastThunderboltTime > updatedPlayerState.thunderboltCooldown) {
      onSpawnThunderbolts(updatedPlayerState, updatedPlayerState.thunderboltsPerActivation, true);
      updatedPlayerState.lastThunderboltTime = nowArg;
      if (updatedPlayerState.chanceToResetCooldownOnUse && Math.random() < updatedPlayerState.chanceToResetCooldownOnUse) {
        updatedPlayerState.lastThunderboltTime = nowArg - (updatedPlayerState.thunderboltCooldown * 0.8); // Effectively reduce cooldown significantly
        onShowNarrativeMessage("Recarga de Raio Resetada!", 1500);
      }
    }

    if(updatedPlayerState.distanceRanSinceLastFrictionProjectile !== undefined && updatedPlayerState.frictionProjectileThreshold && updatedPlayerState.frictionProjectilesToLaunch) {
        updatedPlayerState.distanceRanSinceLastFrictionProjectile += distanceMoved;
        if(updatedPlayerState.distanceRanSinceLastFrictionProjectile >= updatedPlayerState.frictionProjectileThreshold) {
            onSpawnFrictionProjectileSpark(updatedPlayerState);
            updatedPlayerState.distanceRanSinceLastFrictionProjectile = 0;
        }
    }
    
    // Wisp Logic
    updatedPlayerState.activeWisps.forEach(wisp => {
        wisp.orbitAngle += 0.03 * dtFactor;
        wisp.x = updatedPlayerState.x + updatedPlayerState.width / 2 - wisp.width / 2 + Math.cos(wisp.orbitAngle) * WILL_O_WISP_ORBIT_RADIUS;
        wisp.y = updatedPlayerState.y + updatedPlayerState.height / 2 - wisp.height / 2 + Math.sin(wisp.orbitAngle) * WILL_O_WISP_ORBIT_RADIUS;

        if ((wisp.wispType === 'standard' || wisp.isHungeringShadow) && nowArg - wisp.lastAttackTime > wisp.attackSpeed) {
            const closestEnemy = enemiesRef.current.reduce<{ enemy: EnemyState | null; dist: number }>((closest, enemy) => {
                const dist = Math.hypot(wisp.x - enemy.x, wisp.y - enemy.y);
                if (dist < closest.dist) return { enemy, dist };
                return closest;
            }, { enemy: null, dist: Infinity });

            if (closestEnemy.enemy && closestEnemy.dist < 250) {
                 const angle = Math.atan2(closestEnemy.enemy.y - wisp.y, closestEnemy.enemy.x - wisp.x);
                 projectilesRef.current.push({
                    id: `wisp-proj-${Date.now()}-${Math.random()}`, owner: 'player_minion', type: 'wisp_shot',
                    x: wisp.x + wisp.width / 2 - 3, y: wisp.y + wisp.height / 2 - 3,
                    width: 6, height: 6, damage: wisp.damage,
                    vx: Math.cos(angle) * PLAYER_PROJECTILE_SPEED * 0.7, vy: Math.sin(angle) * PLAYER_PROJECTILE_SPEED * 0.7,
                    color: wisp.isHungeringShadow ? 'bg-indigo-400' : 'bg-pink-400', isNeon: true, size: 'small', duration: 1500, spawnTime: nowArg, piercing: 0
                 });
                wisp.lastAttackTime = nowArg;
            }
        }
    });
    updatedPlayerState.activeWisps = updatedPlayerState.activeWisps.filter(w => !(w.wispType === 'aegis_shield_orb' && w.currentShieldHp && w.currentShieldHp <=0));


    // Minion Logic
    if (updatedPlayerState.periodicallySpawnsMinions && updatedPlayerState.minionTypeToSpawn && updatedPlayerState.minionSpawnInterval && updatedPlayerState.maxMinionsAllowed) {
        if (updatedPlayerState.activeMinions.length < updatedPlayerState.maxMinionsAllowed &&
            nowArg - (updatedPlayerState.lastMinionSpawnTime || 0) > updatedPlayerState.minionSpawnInterval) {
            
            const minionData = THEMATIC_ENEMY_DATA[updatedPlayerState.minionTypeToSpawn as keyof typeof THEMATIC_ENEMY_DATA];
            
            const newMinion: MinionState = {
                id: `minion-${nowArg}-${Math.random()}`,
                ownerId: updatedPlayerState.id,
                x: updatedPlayerState.x + (Math.random() - 0.5) * 50,
                y: updatedPlayerState.y + (Math.random() - 0.5) * 50,
                width: minionData?.width || 20, 
                height: minionData?.height || 20,
                hp: MINION_DEFAULT_HP, maxHp: MINION_DEFAULT_HP,
                speed: MINION_DEFAULT_SPEED,
                damage: MINION_DEFAULT_DAMAGE,
                lastAttackTime: 0,
                attackCooldown: MINION_DEFAULT_ATTACK_COOLDOWN,
                minionType: updatedPlayerState.minionTypeToSpawn,
                behaviorProps: { orbitsPlayer: true, orbitDistance: 80, canAttack: true } 
            };
            updatedPlayerState.activeMinions.push(newMinion);
            updatedPlayerState.lastMinionSpawnTime = nowArg;
        }
    }

    updatedPlayerState.activeMinions.forEach(minion => {
        if (minion.behaviorProps?.orbitsPlayer) {
            minion.orbitAngle = (minion.orbitAngle || Math.random() * Math.PI * 2) + 0.02 * dtFactor;
            const orbitDist = minion.behaviorProps.orbitDistance || 80;
            minion.x = updatedPlayerState.x + updatedPlayerState.width / 2 - minion.width / 2 + Math.cos(minion.orbitAngle) * orbitDist;
            minion.y = updatedPlayerState.y + updatedPlayerState.height / 2 - minion.height / 2 + Math.sin(minion.orbitAngle) * orbitDist;
        }

        if (minion.behaviorProps?.canAttack && nowArg - minion.lastAttackTime > minion.attackCooldown) {
             const closestEnemy = enemiesRef.current.reduce<{ enemy: EnemyState | null; dist: number }>((closest, enemy) => {
                const dist = Math.hypot(minion.x - enemy.x, minion.y - enemy.y);
                if (dist < closest.dist) return { enemy, dist };
                return closest;
            }, { enemy: null, dist: Infinity });

            if (closestEnemy.enemy && closestEnemy.dist < 200) { 
                 const angle = Math.atan2(closestEnemy.enemy.y - minion.y, closestEnemy.enemy.x - minion.x);
                 projectilesRef.current.push({
                    id: `minion-proj-${Date.now()}-${Math.random()}`, owner: 'player_minion', type: 'minion_shot',
                    x: minion.x + minion.width / 2 - 3, y: minion.y + minion.height / 2 - 3,
                    width: 6, height: 6, damage: minion.damage,
                    vx: Math.cos(angle) * PLAYER_PROJECTILE_SPEED * 0.6, vy: Math.sin(angle) * PLAYER_PROJECTILE_SPEED * 0.6,
                    color: 'bg-lime-500', isNeon: false, size: 'small', duration: 1200, spawnTime: nowArg, piercing: 0,
                 });
                minion.lastAttackTime = nowArg;
            }
        }
    });

    // Passive Regen / Degen
    if (updatedPlayerState.passiveHpRegenAmount && updatedPlayerState.passiveHpRegenAmount > 0) {
        onSetPlayerHP(Math.min(updatedPlayerState.maxHp, updatedPlayerState.hp + updatedPlayerState.passiveHpRegenAmount * deltaTimeArg));
    }
    if (updatedPlayerState.hasLifeDegeneration && updatedPlayerState.lifeDegenerationRate) {
        if (nowArg - (updatedPlayerState.lastDamageDealtTime || 0) > CARNE_LIFE_DEGEN_GRACE_PERIOD) {
            onSetPlayerHP(updatedPlayerState.hp - updatedPlayerState.lifeDegenerationRate * deltaTimeArg);
        }
    }
     if (updatedPlayerState.regrowthRatePerEnemy && enemiesRef.current.length > 0) {
        const regrowthAmount = updatedPlayerState.hp + (updatedPlayerState.regrowthRatePerEnemy * enemiesRef.current.length * updatedPlayerState.maxHp * deltaTimeArg);
        onSetPlayerHP(Math.min(updatedPlayerState.maxHp, regrowthAmount));
    }

    // Barrier Shield Cooldown
    if (updatedPlayerState.hasBarrierShield === false && updatedPlayerState.barrierCooldown && updatedPlayerState.lastBarrierActivationTime) {
      if (nowArg - updatedPlayerState.lastBarrierActivationTime > updatedPlayerState.barrierCooldown) {
        onSetPlayerHasBarrierShield(true);
        setSoundTriggers(prev => ({...prev, barrierShieldActivate: Date.now()}));
      }
    }

    // Rage
    if (updatedPlayerState.canTriggerRage) {
        const healthRatio = updatedPlayerState.hp / updatedPlayerState.maxHp;
        if (healthRatio < 0.5) {
            const damageBoost = (0.5 - healthRatio) * 2 * 0.5; 
            updatedPlayerState.projectileDamage = updatedPlayerState.currentStaff.baseDamage * (1 + damageBoost);
        } else {
            updatedPlayerState.projectileDamage = updatedPlayerState.currentStaff.baseDamage;
        }
    } else if (updatedPlayerState.projectileDamage !== updatedPlayerState.currentStaff.baseDamage) {
        updatedPlayerState.projectileDamage = updatedPlayerState.currentStaff.baseDamage;
    }

    // Contact Damage (Carne_asc1)
    if (updatedPlayerState.contactDamageBonus && updatedPlayerState.contactDamageBonus > 0 && nowArg > updatedPlayerState.invulnerableUntil) {
      enemiesRef.current.forEach(enemy => {
        if (checkCollision(updatedPlayerState, enemy)) {
          enemy.hp -= updatedPlayerState.contactDamageBonus! * deltaTimeArg * 60; // Apply damage over time of contact
          setSoundTriggers(prev => ({ ...prev, enemyHit: { enemyType: enemy.type, timestamp: Date.now() } }));
          // Potentially trigger player invulnerability for a very short time to avoid instant death from multiple contacts
          onSetPlayerInvulnerableUntil(nowArg + 100); // Brief contact invulnerability
          onSetPlayerLastDamageDealtTime(nowArg); // For carne degen

          if (enemy.hp <= 0) {
            setSoundTriggers(prev => ({ ...prev, enemyDeath: { enemyType: enemy.type, maxHp: enemy.maxHp, timestamp: Date.now() } }));
            enemiesRef.current = enemiesRef.current.filter(e => e.id !== enemy.id);
          }
        }
      });
    }
    
    return updatedPlayerState;
  };
  
  return { updatePlayer };
};
