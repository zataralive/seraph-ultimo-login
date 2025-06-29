
import React from 'react';
import { EnemyState, PlayerState, ProjectileState, TerrainPlatform, EnemyTypeKey, SoundTriggerState } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, ENEMY_PROJECTILE_SPEED, THEMATIC_ENEMY_DATA } from '../constants';
import { checkCollision } from '../App'; 

export interface UseEnemyLogicProps {
  enemiesRef: React.MutableRefObject<EnemyState[]>;
  playerRef: React.MutableRefObject<PlayerState>;
  projectilesRef: React.MutableRefObject<ProjectileState[]>; 
  currentScenePlatformsRef: React.MutableRefObject<TerrainPlatform[]>;
  completedCombatScenesRef: React.MutableRefObject<number>;
  setSoundTriggers: React.Dispatch<React.SetStateAction<SoundTriggerState>>;
}

export const useEnemyLogic = (props: UseEnemyLogicProps) => {
  const {
    enemiesRef, playerRef, projectilesRef, currentScenePlatformsRef,
    completedCombatScenesRef, setSoundTriggers
  } = props;

  const updateEnemies = (deltaTimeArg: number, nowArg: number): EnemyState[] => {
    const playerSnapshotForLoop = playerRef.current;
    const dtFactor = deltaTimeArg * 60;

    const updatedEnemiesArray = enemiesRef.current.map(enemy => {
      let updatedEnemy = { ...enemy };
      const enemyData = THEMATIC_ENEMY_DATA[updatedEnemy.type] || THEMATIC_ENEMY_DATA['basic_flyer'];
      let currentEnemySpeed = updatedEnemy.speed;
      const isActualBoss = updatedEnemy.behaviorProps?.isBoss || updatedEnemy.type.startsWith('boss_');


      const aegisOrb = enemiesRef.current.find(e => e.type === 'esperanca_aegis_orb');
      if (aegisOrb && aegisOrb.behaviorProps?.buffsAllies && updatedEnemy.id !== aegisOrb.id) {
        const distToAegis = Math.hypot(aegisOrb.x - updatedEnemy.x, aegisOrb.y - updatedEnemy.y);
        updatedEnemy.isBuffedByAegis = distToAegis < (aegisOrb.behaviorProps.buffRadius || 200);
      } else {
        updatedEnemy.isBuffedByAegis = false;
      }

      if (playerSnapshotForLoop.hasTemporalDistortionAura && playerSnapshotForLoop.temporalAuraRadius && playerSnapshotForLoop.temporalAuraSlowFactor) {
        const distToPlayer = Math.hypot(playerSnapshotForLoop.x - updatedEnemy.x, playerSnapshotForLoop.y - updatedEnemy.y);
        if (distToPlayer < playerSnapshotForLoop.temporalAuraRadius) {
          currentEnemySpeed *= playerSnapshotForLoop.temporalAuraSlowFactor;
        }
      }

      if (updatedEnemy.isFearedUntil && nowArg < updatedEnemy.isFearedUntil) {
        const angleAwayFromPlayer = Math.atan2(updatedEnemy.y - playerSnapshotForLoop.y, updatedEnemy.x - playerSnapshotForLoop.x);
        updatedEnemy.x += Math.cos(angleAwayFromPlayer) * currentEnemySpeed * 1.5 * dtFactor;
        updatedEnemy.y += Math.sin(angleAwayFromPlayer) * currentEnemySpeed * 1.5 * dtFactor;
      } else if (updatedEnemy.isConfusedUntil && nowArg < updatedEnemy.isConfusedUntil) {
        const otherEnemies = enemiesRef.current.filter(e => e.id !== updatedEnemy.id);
        if (otherEnemies.length > 0 && Math.random() < 0.5 * dtFactor) {
          const targetEnemy = otherEnemies[Math.floor(Math.random() * otherEnemies.length)];
          const angleToTargetEnemy = Math.atan2(targetEnemy.y - updatedEnemy.y, targetEnemy.x - updatedEnemy.x);
          updatedEnemy.x += Math.cos(angleToTargetEnemy) * currentEnemySpeed * 0.8 * dtFactor;
          updatedEnemy.y += Math.sin(angleToTargetEnemy) * currentEnemySpeed * 0.8 * dtFactor;
        } else {
          updatedEnemy.x += (Math.random() - 0.5) * currentEnemySpeed * 2 * dtFactor;
          updatedEnemy.y += (Math.random() - 0.5) * currentEnemySpeed * 2 * dtFactor;
        }
      } else {
        updatedEnemy.isFearedUntil = undefined;
        updatedEnemy.isConfusedUntil = undefined;

        if (enemyData.behaviorProps?.fleeFromPlayer && updatedEnemy.type === 'esperanca_aegis_orb') {
            const angleAwayFromPlayer = Math.atan2(updatedEnemy.y - playerSnapshotForLoop.y, updatedEnemy.x - playerSnapshotForLoop.x);
            updatedEnemy.x += Math.cos(angleAwayFromPlayer) * currentEnemySpeed * dtFactor;
            updatedEnemy.y += Math.sin(angleAwayFromPlayer) * currentEnemySpeed * dtFactor;
        } else if (enemyData.behaviorProps?.shortTeleport && updatedEnemy.type === 'intelecto_glitch' && nowArg - (updatedEnemy.lastDashTime || 0) > (enemyData.behaviorProps.teleportCooldown || 3500)) {
            updatedEnemy.x = Math.random() * (GAME_WIDTH - updatedEnemy.width);
            updatedEnemy.y = Math.random() * (GAME_HEIGHT / 2); 
            updatedEnemy.lastDashTime = nowArg;
        } else if (enemyData.behaviorProps?.frequentTeleport && updatedEnemy.type === 'absurdo_reality_glitch' && nowArg - (updatedEnemy.lastDashTime || 0) > (enemyData.behaviorProps.teleportCooldownShort || 2500)) {
            updatedEnemy.x = playerSnapshotForLoop.x + (Math.random() - 0.5) * 300; 
            updatedEnemy.y = playerSnapshotForLoop.y + (Math.random() - 0.5) * 200;
            updatedEnemy.lastDashTime = nowArg;
        }
        else if (enemyData.behaviorProps?.shortLungeAttack && nowArg - (updatedEnemy.lastDashTime || 0) > (enemyData.behaviorProps.lungeCooldown || 4000) && Math.hypot(playerSnapshotForLoop.x - updatedEnemy.x, playerSnapshotForLoop.y - updatedEnemy.y) < (enemyData.behaviorProps.lungeRange || 100)) {
            const angleToPlayer = Math.atan2(playerSnapshotForLoop.y - updatedEnemy.y, playerSnapshotForLoop.x - updatedEnemy.x);
            updatedEnemy.x += Math.cos(angleToPlayer) * (enemyData.behaviorProps.lungeSpeed || 7) * dtFactor;
            updatedEnemy.y += Math.sin(angleToPlayer) * (enemyData.behaviorProps.lungeSpeed || 7) * dtFactor;
            updatedEnemy.lastDashTime = nowArg; 
        }
         else if (enemyData.behaviorProps?.aggressivePursuit && updatedEnemy.type === 'vinganca_estilhaco') {
             const angleToPlayer = Math.atan2(playerSnapshotForLoop.y - updatedEnemy.y, playerSnapshotForLoop.x - updatedEnemy.x);
             updatedEnemy.x += Math.cos(angleToPlayer) * currentEnemySpeed * dtFactor;
             updatedEnemy.y += Math.sin(angleToPlayer) * currentEnemySpeed * 0.7 * dtFactor; 
         }
        else { 
            if (isActualBoss) { 
                if (!updatedEnemy.targetX || Math.abs(updatedEnemy.x - updatedEnemy.targetX) < 15 || Math.random() < 0.02 * dtFactor) { 
                    updatedEnemy.targetX = Math.random() * (GAME_WIDTH * 0.6) + (GAME_WIDTH * 0.2); 
                }
                if (updatedEnemy.x < updatedEnemy.targetX) updatedEnemy.x += currentEnemySpeed * dtFactor;
                else if (updatedEnemy.x > updatedEnemy.targetX) updatedEnemy.x -= currentEnemySpeed * dtFactor;
                updatedEnemy.y = 80 + Math.sin(nowArg / 1800 + updatedEnemy.id.charCodeAt(0)) * 40; 
            } else { 
                if (!updatedEnemy.targetX || Math.abs(updatedEnemy.x - updatedEnemy.targetX) < 5) {
                    updatedEnemy.targetX = Math.random() * (GAME_WIDTH - updatedEnemy.width);
                }
                if (updatedEnemy.x < updatedEnemy.targetX) updatedEnemy.x += currentEnemySpeed * dtFactor; 
                else if (updatedEnemy.x > updatedEnemy.targetX) updatedEnemy.x -= currentEnemySpeed * dtFactor;
                if(enemyData.behaviorProps?.bobbingMovement) updatedEnemy.y += Math.sin(nowArg / 500 + updatedEnemy.id.charCodeAt(0)) * 0.5 * dtFactor; 
                else updatedEnemy.y += Math.sin(nowArg / 1000 + updatedEnemy.id.charCodeAt(0)) * 0.3 * dtFactor; 
            }
        }
      }
      
      if (playerSnapshotForLoop.nearbyEnemiesChanceToConfuse && playerSnapshotForLoop.nearbyEnemiesChanceToConfuse > 0 && playerSnapshotForLoop.confusionDuration &&
          (!updatedEnemy.isConfusedUntil || nowArg > updatedEnemy.isConfusedUntil) &&
          (!updatedEnemy.isFearedUntil || nowArg > updatedEnemy.isFearedUntil)) {
        const distToPlayer = Math.hypot(playerSnapshotForLoop.x - updatedEnemy.x, playerSnapshotForLoop.y - updatedEnemy.y);
        if (distToPlayer < 200 && Math.random() < (playerSnapshotForLoop.nearbyEnemiesChanceToConfuse * deltaTimeArg)) {
          updatedEnemy.isConfusedUntil = nowArg + playerSnapshotForLoop.confusionDuration;
          updatedEnemy.lastAttackTime = nowArg + playerSnapshotForLoop.confusionDuration / 2;
        }
      }

      if (nowArg - updatedEnemy.lastAttackTime > updatedEnemy.attackCooldown &&
          (!updatedEnemy.isFearedUntil || nowArg > updatedEnemy.isFearedUntil) &&
          (!updatedEnemy.isConfusedUntil || nowArg > updatedEnemy.isConfusedUntil) &&
          enemyData.attackCooldown < 99990) { 
        updatedEnemy.lastAttackTime = nowArg;
        
        let targetPlayerX = playerSnapshotForLoop.x + playerSnapshotForLoop.width / 2;
        let targetPlayerY = playerSnapshotForLoop.y + playerSnapshotForLoop.height / 2;
        let projectileSpeedFactor = (ENEMY_PROJECTILE_SPEED + completedCombatScenesRef.current * 0.03) * (isActualBoss ? 1.2 : 1);


        if (isActualBoss && enemyData.behaviorProps?.predictiveAimingFactor) {
            const timeToTarget = Math.hypot(targetPlayerX - updatedEnemy.x, targetPlayerY - updatedEnemy.y) / projectileSpeedFactor;
            const playerFutureX = playerSnapshotForLoop.x + (playerSnapshotForLoop.direction === 'right' ? playerSnapshotForLoop.speed : -playerSnapshotForLoop.speed) * timeToTarget * (enemyData.behaviorProps.predictiveAimingFactor || 0.75);
            // Y prediction could be added if player has significant vertical velocity often
            targetPlayerX = playerFutureX + playerSnapshotForLoop.width / 2;
        }
        
        const angle = Math.atan2(targetPlayerY - (updatedEnemy.y + updatedEnemy.height / 2), targetPlayerX - (updatedEnemy.x + updatedEnemy.width / 2));
        
        if (playerSnapshotForLoop.hasTemporalDistortionAura && playerSnapshotForLoop.temporalAuraRadius && playerSnapshotForLoop.temporalAuraSlowFactor) {
            const distToPlayer = Math.hypot(playerSnapshotForLoop.x - updatedEnemy.x, playerSnapshotForLoop.y - updatedEnemy.y);
            if (distToPlayer < playerSnapshotForLoop.temporalAuraRadius) {
                projectileSpeedFactor *= playerSnapshotForLoop.temporalAuraSlowFactor;
            }
        }
        const projectileSize = isActualBoss ? 14 : 8;
        const projectileColor = isActualBoss ? 'bg-red-600' : 'bg-pink-500';
        let projType: ProjectileState['type'] = enemyData.projectileType || 'standard';
        let projDamage = updatedEnemy.damage; 
        let projProps: Partial<ProjectileState> = {};


        if (updatedEnemy.type === 'intelecto_protocol_sentry' && enemyData.behaviorProps?.createsFirewalls && 
            nowArg - (updatedEnemy.lastFirewallSpawnTime || 0) > (enemyData.behaviorProps.firewallCooldown || 8000)) {
             projectilesRef.current.push({
                id: `firewall-${updatedEnemy.id}-${Date.now()}`, owner: 'enemy', type: 'firewall_segment',
                x: updatedEnemy.x + updatedEnemy.width/2 - (enemyData.behaviorProps.firewallWidth || 80)/2, 
                y: updatedEnemy.y - 20, 
                width: enemyData.behaviorProps.firewallWidth || 80, height: enemyData.behaviorProps.firewallHeight || 12,
                damage: 0, vx: 0, vy: 0, piercing: 999,
                color: 'bg-blue-500 opacity-50', isNeon: false, duration: enemyData.behaviorProps.firewallDuration || 4000, spawnTime: nowArg,
                isFirewall: true,
            });
            updatedEnemy.lastFirewallSpawnTime = nowArg;
        } else {
            projectilesRef.current.push({
                id: `eproj-${Date.now()}-${Math.random()}`, owner: 'enemy', type: projType,
                x: updatedEnemy.x + updatedEnemy.width / 2 - projectileSize/2, y: updatedEnemy.y + updatedEnemy.height / 2 - projectileSize/2,
                width: projectileSize, height: projectileSize,
                damage: projDamage,
                vx: Math.cos(angle) * projectileSpeedFactor, vy: Math.sin(angle) * projectileSpeedFactor,
                color: projectileColor, isNeon: true, size: isActualBoss ? 'medium' : 'small', piercing: 0,
                isRealityGlitchShot: updatedEnemy.type === 'absurdo_reality_glitch',
                isPsionicOrb: updatedEnemy.type === 'transcendencia_psionic_echo',
                psionicOrbAoERadius: updatedEnemy.type === 'transcendencia_psionic_echo' ? enemyData.behaviorProps?.psionicOrbAoERadius : undefined,
                ...projProps
            });
        }
      }

      if (updatedEnemy.bleedTicksLeft && updatedEnemy.bleedTicksLeft > 0 && updatedEnemy.bleedDamagePerTick) {
        updatedEnemy.hp -= updatedEnemy.bleedDamagePerTick * dtFactor * 2; 
        if (Math.random() < dtFactor * 2) { 
          updatedEnemy.bleedTicksLeft -= 1;
        }
        if (updatedEnemy.bleedTicksLeft <= 0) {
          updatedEnemy.bleedDamagePerTick = undefined;
          updatedEnemy.bleedTicksLeft = undefined;
        }
      }

      updatedEnemy.x = Math.max(0, Math.min(updatedEnemy.x, GAME_WIDTH - updatedEnemy.width));
      const groundPlatform = currentScenePlatformsRef.current.find(p => p.id === 'ground') || { y: GAME_HEIGHT - 30 };
      updatedEnemy.y = Math.max(0, Math.min(updatedEnemy.y, groundPlatform.y - updatedEnemy.height - 10)); 

      return updatedEnemy;
    }).filter(e => {
        if (e.hp <= 0) {
            setSoundTriggers(prev => ({ ...prev, enemyDeath: { enemyType: e.type, maxHp: e.maxHp, timestamp: Date.now() } }));
            if (e.behaviorProps?.isBoss) {
                setSoundTriggers(prev => ({ ...prev, bossRoar: Date.now() }));
            }
            return false;
        }
        return true;
    });

    return updatedEnemiesArray;
  };

  return { updateEnemies };
};