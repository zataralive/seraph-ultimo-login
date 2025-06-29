
import React from 'react';
import { ProjectileState, PlayerState, EnemyState, CollectibleState, EnemyTypeKey, WispState, SoundTriggerState } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_PROJECTILE_SPEED, FRAGMENTATION_DAMAGE_MULTIPLIER, THEMATIC_ENEMY_DATA, INITIAL_INVULNERABILITY_ON_HIT, COSMIC_ECHO_STAFF_ID, BASE_HEALING_ORB_DROP_CHANCE } from '../constants';
import { checkCollision } from '../App'; 

export interface UseProjectileLogicProps {
  projectilesRef: React.MutableRefObject<ProjectileState[]>;
  playerRef: React.MutableRefObject<PlayerState>;
  enemiesRef: React.MutableRefObject<EnemyState[]>; 
  collectiblesRef: React.MutableRefObject<CollectibleState[]>; 
  setSoundTriggers: React.Dispatch<React.SetStateAction<SoundTriggerState>>;
  
  onSetScore: React.Dispatch<React.SetStateAction<number>>;
  onSetPlayerHP: (newHP: number) => void;
  onSetPlayerInvulnerableUntil: (timestamp: number) => void;
  onSetPlayerHasBarrierShield: (value: boolean) => void;
  onSetPlayerLastBarrierActivationTime: (timestamp: number) => void;
  onSetPlayerPosition: (x: number, y: number) => void;
  onSetPlayerLastDamageDealtTime: (timestamp: number) => void; 
  onShowNarrativeMessage: (message: string, duration?: number) => void;
  completedCombatScenesRef: React.MutableRefObject<number>; 
}

export interface UpdateProjectilesResult {
  updatedProjectiles: ProjectileState[];
}

export const useProjectileLogic = (props: UseProjectileLogicProps) => {
  const {
    projectilesRef, playerRef, enemiesRef, collectiblesRef, setSoundTriggers,
    onSetScore, onSetPlayerHP, onSetPlayerInvulnerableUntil, onSetPlayerHasBarrierShield,
    onSetPlayerLastBarrierActivationTime, onSetPlayerPosition, onSetPlayerLastDamageDealtTime,
    onShowNarrativeMessage, completedCombatScenesRef
  } = props;

  const updateProjectiles = (deltaTimeArg: number, nowArg: number): UpdateProjectilesResult => {
    let newProjectilesBuffer: ProjectileState[] = [];
    const projectilesToRemove = new Set<string>();

    const processedProjectiles = projectilesRef.current.map(proj => {
      let hitAegisWisp = false; 
      let newVx = proj.vx;
      let newVy = proj.vy;
      let newX = proj.x + newVx * deltaTimeArg * 60; 
      let newY = proj.y + newVy * deltaTimeArg * 60;
      let shouldBeRemoved = false;
      let currentPiercing = proj.piercing;

      // Cosmic Orb -> Echo AOE
      if (proj.triggersEchoOnImpact && (newX < -proj.width || newX > GAME_WIDTH || newY < -proj.height || newY > GAME_HEIGHT || (proj.duration && proj.spawnTime && (nowArg - proj.spawnTime >= proj.duration)))) {
        newProjectilesBuffer.push({
          id: `cosmic_echo-${Date.now()}`, x: newX - 25, y: newY - 25, width: 50, height: 50,
          damage: proj.damage * 0.8, owner: 'player', type: 'cosmic_echo_aoe',
          vx: 0, vy: 0, piercing: 99, duration: 300, spawnTime: nowArg,
          color: 'bg-purple-400 opacity-60', isNeon: true, isEchoAoE: true,
        });
        shouldBeRemoved = true;
      }
      
      // Reality Bender Orb influence
      if (proj.isRealityBenderOrb) {
        projectilesRef.current.forEach(otherProj => {
          if (otherProj.id !== proj.id && !otherProj.isRealityBenderOrb) {
            const dist = Math.hypot(otherProj.x - newX, otherProj.y - newY);
            if (dist < (proj.realityBenderInfluenceRadius || 100)) {
              const angleToBender = Math.atan2(newY - otherProj.y, newX - otherProj.x);
              const forceFactor = (1 - dist / (proj.realityBenderInfluenceRadius || 100)) * (proj.realityBenderStrength || 0.05);
              otherProj.vx += Math.cos(angleToBender) * forceFactor * PLAYER_PROJECTILE_SPEED * deltaTimeArg * 60;
              otherProj.vy += Math.sin(angleToBender) * forceFactor * PLAYER_PROJECTILE_SPEED * deltaTimeArg * 60;
            }
          }
        });
      }

      // Nexus Portal shooting
      if (proj.isNexusPortal && proj.burstInterval && proj.burstsLeft && proj.burstsLeft > 0 && proj.projectilesPerBurst) {
        if (nowArg - (proj.lastBurstTime || 0) > proj.burstInterval) {
          for (let i = 0; i < proj.projectilesPerBurst; i++) {
            const angle = Math.random() * Math.PI * 2; // Random direction from portal
            newProjectilesBuffer.push({
              id: `nexus_burst-${Date.now()}-${i}`, owner: 'player', type: 'nexus_energy_burst',
              x: newX + proj.width / 2 - 4, y: newY + proj.height / 2 - 4, width: 8, height: 8,
              damage: playerRef.current.projectileDamage, 
              vx: Math.cos(angle) * PLAYER_PROJECTILE_SPEED * 0.8,
              vy: Math.sin(angle) * PLAYER_PROJECTILE_SPEED * 0.8,
              color: 'bg-teal-400', isNeon: true, size: 'small', duration: 800, spawnTime: nowArg, piercing: 0,
            });
          }
          proj.lastBurstTime = nowArg;
          proj.burstsLeft -= 1;
          if (proj.burstsLeft <= 0) { 
            shouldBeRemoved = true;
          }
          // Note: The specific sound for Nexus portal burst might need a dedicated trigger if different from initial shoot.
          // For now, relying on the main playerShoot trigger for the staff.
        }
      }


      if (proj.isChaotic && proj.chaoticBehavior === 'erratic_move' && Math.random() < 0.2 * deltaTimeArg * 60) {
        newVx += (Math.random() - 0.5) * PLAYER_PROJECTILE_SPEED * 0.3;
        newVy += (Math.random() - 0.5) * PLAYER_PROJECTILE_SPEED * 0.3;
      }
      if (proj.isRealityGlitchShot && nowArg - (proj.lastDirectionChangeTime || 0) > 300 && Math.random() < 0.15 * deltaTimeArg * 60) {
        const randomAngleOffset = (Math.random() - 0.5) * Math.PI / 3; 
        const currentAngle = Math.atan2(proj.vy, proj.vx);
        const newAngle = currentAngle + randomAngleOffset;
        const speed = Math.hypot(proj.vx, proj.vy);
        newVx = Math.cos(newAngle) * speed;
        newVy = Math.sin(newAngle) * speed;
        proj.lastDirectionChangeTime = nowArg;
      }
      if (proj.type === 'black_hole_effect') {
        enemiesRef.current.forEach(enemy => {
          const dist = Math.hypot(newX - enemy.x, newY - enemy.y);
          if (dist < 150 && dist > 10) { 
            const angleToHole = Math.atan2(newY - enemy.y, newX - enemy.x);
            const pullStrength = (1 - dist / 150) * 0.3 * deltaTimeArg * 60;
            enemy.x += Math.cos(angleToHole) * pullStrength;
            enemy.y += Math.sin(angleToHole) * pullStrength;
            if (dist < 30) { 
                enemy.hp -= proj.damage * deltaTimeArg * 60; 
                if (enemy.hp <= 0 && !enemiesRef.current.find(e => e.id === enemy.id)?.isFearedUntil) { 
                    enemiesRef.current = enemiesRef.current.filter(e => e.id !== enemy.id);
                    setSoundTriggers(prev => ({...prev, enemyDeath: { enemyType: enemy.type, maxHp: enemy.maxHp, timestamp: Date.now()}}));
                }
            }
          }
        });
      }

      if (newX < -proj.width - 50 || newX > GAME_WIDTH + 50 || newY < -proj.height - 100 || newY > GAME_HEIGHT + 50 || (proj.duration && proj.spawnTime && (nowArg - proj.spawnTime >= proj.duration))) {
        if (!shouldBeRemoved && proj.triggersEchoOnImpact) {
            newProjectilesBuffer.push({
              id: `cosmic_echo-${Date.now()}`, x: proj.x - 25, y: proj.y - 25, width: 50, height: 50,
              damage: proj.damage * 0.8, owner: 'player', type: 'cosmic_echo_aoe',
              vx: 0, vy: 0, piercing: 99, duration: 300, spawnTime: nowArg,
              color: 'bg-purple-400 opacity-60', isNeon: true, isEchoAoE: true,
            });
        }
        if (proj.isPsychicExplosion || (proj.isPsionicOrb && proj.psionicOrbAoERadius)) {
            // Already handled by duration, this is just for boundary removal
        } else if (proj.owner === 'player' && playerRef.current.projectilesCausePsychicExplosion && playerRef.current.psychicExplosionDamageFactor && !proj.isEchoAoE && proj.type !== 'nexus_portal') {
             newProjectilesBuffer.push({
                id: `psychic_explode-${Date.now()}`, x: proj.x - 15, y: proj.y - 15, width: 30, height: 30,
                damage: proj.damage * playerRef.current.psychicExplosionDamageFactor, owner: 'player', type: 'psychic_explosion',
                vx: 0, vy: 0, piercing: 99, duration: 250, spawnTime: nowArg,
                color: 'bg-cyan-300 opacity-70', isNeon: true, isPsychicExplosion: true,
            });
        }
        shouldBeRemoved = true;
      }

      if (!shouldBeRemoved) {
        if (proj.owner === 'player' || proj.owner === 'neutral' || proj.owner === 'converted_player' || proj.owner === 'player_minion') {
          for (let i = 0; i < enemiesRef.current.length; i++) {
            let enemy = enemiesRef.current[i];
            if (checkCollision({ ...proj, x: newX, y: newY }, enemy)) {
              setSoundTriggers(prev => ({ ...prev, enemyHit: { enemyType: enemy.type, timestamp: Date.now() } }));
              onSetPlayerLastDamageDealtTime(nowArg);
              const isCrit = (proj.owner === 'player' || proj.owner === 'player_minion') && Math.random() < playerRef.current.critChance;
              let damageDealt = isCrit ? proj.damage * (playerRef.current.critDamageMultiplier || 1.5) : proj.damage;
                
              if (enemy.isBuffedByAegis) damageDealt *= 0.75; 
              if (enemy.armorWeakenedFactor) damageDealt *= (1 + enemy.armorWeakenedFactor);
              if (enemy.vulnerabilityStacks) damageDealt *= (1 + enemy.vulnerabilityStacks * (playerRef.current.vulnerabilityMarkDamageIncreasePerStack || 0.05));

              onSetScore(s => s + 10 * (completedCombatScenesRef.current + 1) + (isCrit ? 20 : 0));
              enemy.hp -= damageDealt;
              
              if (playerRef.current.causesFearOnHit && playerRef.current.fearDuration && Math.random() < 0.15) {
                enemy.isFearedUntil = nowArg + playerRef.current.fearDuration;
              }
              if (isCrit && playerRef.current.critCausesBleed && proj.causesBleed && proj.bleedDuration && proj.bleedDmgFactor) {
                enemy.bleedDamagePerTick = (enemy.bleedDamagePerTick || 0) + proj.damage * proj.bleedDmgFactor;
                enemy.bleedTicksLeft = (enemy.bleedTicksLeft || 0) + proj.bleedDuration;
              }
              if (isCrit && playerRef.current.critWeakensArmor) {
                enemy.armorWeakenedFactor = (enemy.armorWeakenedFactor || 0) + 0.05;
              }
              if (playerRef.current.attacksApplyVulnerabilityMark && playerRef.current.vulnerabilityMarkMaxStacks && playerRef.current.vulnerabilityMarkDamageIncreasePerStack) {
                enemy.vulnerabilityStacks = Math.min(playerRef.current.vulnerabilityMarkMaxStacks, (enemy.vulnerabilityStacks || 0) + 1);
              }

              if (playerRef.current.lifeStealPercentage && (proj.owner === 'player' || proj.owner === 'player_minion')) {
                onSetPlayerHP(Math.min(playerRef.current.maxHp, playerRef.current.hp + damageDealt * playerRef.current.lifeStealPercentage));
              }
              if (enemy.hp <= 0) {
                setSoundTriggers(prev => ({ ...prev, enemyDeath: { enemyType: enemy.type, maxHp: enemy.maxHp, timestamp: Date.now() } }));

                onSetScore(s => s + 50 * (completedCombatScenesRef.current + 1) + (enemy.behaviorProps?.isBoss ? 500 : 0));
                
                const dropChance = (playerRef.current.baseHealingOrbDropChance || BASE_HEALING_ORB_DROP_CHANCE) + (playerRef.current.additionalHealingOrbChance || 0);
                if (Math.random() < dropChance) {
                  collectiblesRef.current.push({
                    id: `heal-${Date.now()}`, type: 'healing_orb',
                    x: enemy.x + enemy.width / 2 - 8, y: enemy.y + enemy.height / 2 - 8, width: 16, height: 16,
                    value: 15 + completedCombatScenesRef.current, 
                    isPotent: playerRef.current.healingOrbsArePotent,
                    velocityY: -2 - Math.random() * 2, // Initial pop-up
                    isFalling: true,
                  });
                }
                if (playerRef.current.canDropSoulOrbs && Math.random() < (playerRef.current.soulOrbChance || 0.01)) {
                   collectiblesRef.current.push({
                    id: `soul-${Date.now()}`, type: 'soul_orb',
                    x: enemy.x + enemy.width / 2 - 8, y: enemy.y + enemy.height / 2 - 8, width: 16, height: 16,
                    value: 50 + completedCombatScenesRef.current * 5,
                    velocityY: -2 - Math.random() * 2, // Initial pop-up
                    isFalling: true,
                  });
                }
                 if (playerRef.current.enemiesExplodeOnDeath) {
                  const fragmentCount = playerRef.current.fragmentationCount || 2;
                  const explosionModifier = playerRef.current.enemiesExplodeViolentlyModifier || 1;
                  for (let k = 0; k < fragmentCount * explosionModifier; k++) {
                    newProjectilesBuffer.push({
                      id: `frag-${Date.now()}-${k}`, owner: 'neutral', type: 'fragment',
                      x: enemy.x + enemy.width / 2 - 4, y: enemy.y + enemy.height / 2 - 4, width: 8, height: 8,
                      damage: (playerRef.current.projectileDamage * FRAGMENTATION_DAMAGE_MULTIPLIER) * explosionModifier,
                      vx: (Math.random() - 0.5) * PLAYER_PROJECTILE_SPEED * 0.6,
                      vy: (Math.random() - 0.5) * PLAYER_PROJECTILE_SPEED * 0.6,
                      color: 'bg-orange-400', isNeon: false, size: 'small', duration: 1000, spawnTime: nowArg, piercing: 0,
                    });
                  }
                  if (playerRef.current.playerTakesRecoilFromViolentExplosion && explosionModifier > 1) {
                     const recoilDamage = (playerRef.current.projectileDamage * FRAGMENTATION_DAMAGE_MULTIPLIER) * explosionModifier * 0.1 * fragmentCount;
                     onSetPlayerHP(playerRef.current.hp - recoilDamage);
                     onSetPlayerInvulnerableUntil(nowArg + 200);
                  }
                }
                 if (playerRef.current.killHasChanceToCreateBlackHole && Math.random() < playerRef.current.killHasChanceToCreateBlackHole) {
                     newProjectilesBuffer.push({
                        id: `bh-${Date.now()}`, owner: 'neutral', type: 'black_hole_effect',
                        x: enemy.x + enemy.width / 2 - 15, y: enemy.y + enemy.height / 2 - 15, width: 30, height: 30,
                        damage: playerRef.current.projectileDamage * 0.2, 
                        vx: 0, vy: 0, color: 'bg-black', duration: 3000, spawnTime: nowArg, piercing: 999,
                    });
                 }

                const enemyData = THEMATIC_ENEMY_DATA[enemy.type];
                if (enemyData?.behaviorProps?.splitsOnLowHealth && enemyData.behaviorProps?.splitIntoType && !enemy.hasSplit) {
                    const numSplits = enemyData.behaviorProps.splitCount || 2;
                    const splitType = enemyData.behaviorProps.splitIntoType as EnemyTypeKey;
                    const splitEnemyData = THEMATIC_ENEMY_DATA[splitType];
                    if (splitEnemyData) {
                        for (let s = 0; s < numSplits; s++) {
                             enemiesRef.current.push({
                                id: `split-${enemy.id}-${s}-${Date.now()}`,
                                x: enemy.x + (Math.random() - 0.5) * 20,
                                y: enemy.y + (Math.random() - 0.5) * 20,
                                width: splitEnemyData.width, height: splitEnemyData.height,
                                hp: splitEnemyData.hp, maxHp: splitEnemyData.hp,
                                type: splitType, speed: splitEnemyData.speed,
                                attackCooldown: splitEnemyData.attackCooldown, lastAttackTime: nowArg,
                                targetYOffset: 80 + Math.random() * 40, 
                                damage: splitEnemyData.baseDamage, // Corrected assignment
                                behaviorProps: { ...(splitEnemyData.behaviorProps || {}), isBoss: false }, 
                                hasSplit: true, 
                            });
                        }
                    }
                }

                enemiesRef.current = enemiesRef.current.filter(e => e.id !== enemy.id);
                i--; 
              }
              
              if (proj.triggersEchoOnImpact) {
                 newProjectilesBuffer.push({
                    id: `cosmic_echo-${Date.now()}`, x: newX - 25, y: newY - 25, width: 50, height: 50,
                    damage: proj.damage * 0.8, owner: 'player', type: 'cosmic_echo_aoe',
                    vx: 0, vy: 0, piercing: 99, duration: 300, spawnTime: nowArg,
                    color: 'bg-purple-400 opacity-60', isNeon: true, isEchoAoE: true,
                });
              }

              if (currentPiercing > 0) {
                currentPiercing -= 1;
              } else {
                shouldBeRemoved = true;
                if (playerRef.current.projectilesCausePsychicExplosion && playerRef.current.psychicExplosionDamageFactor && !proj.isEchoAoE && proj.type !== 'nexus_portal') {
                     newProjectilesBuffer.push({
                        id: `psychic_explode-${Date.now()}`, x: newX - 15, y: newY - 15, width: 30, height: 30,
                        damage: proj.damage * playerRef.current.psychicExplosionDamageFactor, owner: 'player', type: 'psychic_explosion',
                        vx: 0, vy: 0, piercing: 99, duration: 250, spawnTime: nowArg,
                        color: 'bg-cyan-300 opacity-70', isNeon: true, isPsychicExplosion: true,
                    });
                }
                break;
              }
            }
          }
        } else if (proj.owner === 'enemy') {
          const playerWisps = playerRef.current.activeWisps;
          for (let wIdx = 0; wIdx < playerWisps.length; wIdx++) {
            const wisp = playerWisps[wIdx];
             if (wisp.wispType === 'aegis_shield_orb' && wisp.currentShieldHp && wisp.currentShieldHp > 0) {
              if (checkCollision({ ...proj, x: newX, y: newY }, wisp)) {
                wisp.currentShieldHp -= 1;
                shouldBeRemoved = true;
                hitAegisWisp = true; 
                setSoundTriggers(prev => ({...prev, barrierShieldBlock: Date.now()}));
                if (wisp.currentShieldHp <= 0) {
                   playerRef.current.activeWisps = playerRef.current.activeWisps.filter(aw => aw.id !== wisp.id);
                }
                break; 
              }
            }
          }

          if (!hitAegisWisp) {
            const isPlayerEthereal = playerRef.current.etherealUntil && nowArg < playerRef.current.etherealUntil;
            if (!isPlayerEthereal && nowArg > playerRef.current.invulnerableUntil && checkCollision({ ...proj, x: newX, y: newY }, playerRef.current)) {
              if (playerRef.current.chanceToNullifyAttackAndHeal && playerRef.current.chanceToNullifyAttackAndHeal > 0 && Math.random() < playerRef.current.chanceToNullifyAttackAndHeal) {
                shouldBeRemoved = true;
                onSetPlayerHP(Math.min(playerRef.current.maxHp, playerRef.current.hp + (playerRef.current.nullifyHealAmount || 5)));
                if(playerRef.current.chanceToNullifyAttackAndHeal > 0) onShowNarrativeMessage("Intervenção Divina!", 1500);
                setSoundTriggers(prev => ({...prev, playerHeal: Date.now()}));
              } else if (playerRef.current.teleportOnHitChance && playerRef.current.teleportOnHitChance > 0 && Math.random() < playerRef.current.teleportOnHitChance) {
                shouldBeRemoved = true;
                onSetPlayerPosition(Math.random() * (GAME_WIDTH - playerRef.current.width), playerRef.current.y - Math.random() * 50);
                onSetPlayerInvulnerableUntil(nowArg + 300);
                if(playerRef.current.teleportOnHitChance > 0) onShowNarrativeMessage("Glitch na Matrix!", 1500);
              } else if (playerRef.current.hasBarrierShield) {
                onSetPlayerHasBarrierShield(false);
                onSetPlayerLastBarrierActivationTime(nowArg);
                onSetPlayerInvulnerableUntil(nowArg + (playerRef.current.invulnerabilityDurationOnHit || INITIAL_INVULNERABILITY_ON_HIT));
                shouldBeRemoved = true;
                setSoundTriggers(prev => ({...prev, barrierShieldBlock: Date.now()}));
              } else {
                const damageTaken = Math.max(1, proj.damage * (1 - playerRef.current.defense));
                onSetPlayerHP(playerRef.current.hp - damageTaken);
                onSetPlayerInvulnerableUntil(nowArg + (playerRef.current.invulnerabilityDurationOnHit || INITIAL_INVULNERABILITY_ON_HIT));
                shouldBeRemoved = true;
                setSoundTriggers(prev => ({...prev, playerHit: {damageAmount: damageTaken, timestamp: Date.now()}}));
              }
            } else if (playerRef.current.projectileConversionChance && playerRef.current.convertedProjectileDamageMultiplier && Math.random() < playerRef.current.projectileConversionChance) {
              proj.owner = 'converted_player';
              proj.damage *= playerRef.current.convertedProjectileDamageMultiplier;
              proj.color = 'bg-green-400';
              proj.vx *= -0.8;
              proj.vy *= -0.8;
              if (playerRef.current.projectileConversionChance > 0) onShowNarrativeMessage("Protocolo Reescrito!", 1000);
            }
          }
        }
      }

      if (shouldBeRemoved) {
        projectilesToRemove.add(proj.id);
        if(proj.owner !== 'enemy' || (proj.owner === 'enemy' && !hitAegisWisp) ) {
            setSoundTriggers(prev => ({...prev, projectileDestroy: Date.now()}));
        }
      }
      return { ...proj, x: newX, y: newY, vx: newVx, vy: newVy, piercing: currentPiercing };
    });

    const finalProjectiles = processedProjectiles
      .filter(p => !projectilesToRemove.has(p.id))
      .concat(newProjectilesBuffer);
      
    return { updatedProjectiles: finalProjectiles };
  };

  return { updateProjectiles };
};