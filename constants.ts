
import { EffectDefinition, PlayerState, StaffDefinition, ProjectileState, AffinityImpact, AffinityName, NarrativeNodeId, NarrativeNodeDefinition, EnemyState, WispState, TerrainPlatform, NarrativeChoiceDefinition, AscensionLevel, ChaoticBehavior, EnemyTypeKey } from './types'; 

export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 600;
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 60;
export const PLAYER_SPEED = 5;
export const JUMP_FORCE = 13;
export const GRAVITY = 0.6;
export const COLLECTIBLE_GRAVITY = 0.5; 
export const ENEMY_PROJECTILE_SPEED = 3.7; 
export const PLAYER_PROJECTILE_SPEED = 10; 

export const INITIAL_PLAYER_HP = 120; 
export const INITIAL_ATTACK_SPEED = 600; // Value increased from 450 to slow down attack speed.
export const INITIAL_PROJECTILE_DAMAGE = 12;
export const INITIAL_PROJECTILE_SIZE_MULTIPLIER = 1;
export const INITIAL_INVULNERABILITY_ON_HIT = 600; 
export const INITIAL_CRIT_DAMAGE_MULTIPLIER = 1.5; 
export const BASE_HEALING_ORB_DROP_CHANCE = 0.03; 

export const ENEMY_DASH_SPEED = 9; 
export const ENEMY_DASH_DURATION = 260; 
export const ENEMY_DASH_COOLDOWN = 2600; 
export const ENEMY_PREPARE_DASH_DURATION = 600; 

// Effect Mechanics Constants
export const THUNDERBOLT_COOLDOWN_DEFAULT = 5000; 
export const THUNDERBOLTS_PER_ACTIVATION_DEFAULT = 2;
export const ADDITIONAL_HEALING_ORB_CHANCE_FROM_EFFECT = 0.05; 
export const SOUL_ORB_CHANCE_DEFAULT = 0.01; 
export const FRAGMENTATION_COUNT_DEFAULT = 2;
export const FRAGMENTATION_DAMAGE_MULTIPLIER = 0.3; 
export const CHARGE_SIZE_INCREASE_DEFAULT = 0.2; 
export const CLOAK_DURATION_INCREASE = 0.1; 
export const LEECH_PERCENTAGE_DEFAULT = 0.03; 
export const PRECISION_CRIT_DAMAGE_BONUS = 0.5; 
export const FRICTION_DISTANCE_THRESHOLD = 100; 
export const FRICTION_PROJECTILES_TO_LAUNCH = 1;
export const WILL_O_WISP_ORBIT_RADIUS = 70;
export const WILL_O_WISP_ATTACK_SPEED_FACTOR = 1.8; 
export const WILL_O_WISP_DAMAGE_FACTOR = 0.4; 
export const MINION_DEFAULT_HP = 25; 
export const MINION_DEFAULT_SPEED = 2.8; 
export const MINION_DEFAULT_DAMAGE = 6;  
export const MINION_DEFAULT_ATTACK_COOLDOWN = 1800; 
export const CARNE_LIFE_DEGEN_GRACE_PERIOD = 5000; 

export const MAX_AEGIS_ORBS = 3;
export const AEGIS_ORB_BASE_SHIELD_HP = 1; 

// --- Funções de Efeito e Impacto de Afinidade ---
const applyCatalyst: EffectDefinition['applyEffect'] = (playerState) => ({
  ...playerState,
  projectileDamage: playerState.projectileDamage + 2,
});
const getCatalystAffinity: () => AffinityImpact = () => ({ 'Vingança': 1 });

const applyGrowth: EffectDefinition['applyEffect'] = (playerState) => ({
  ...playerState,
  maxHp: playerState.maxHp + 10,
  hp: Math.min(playerState.hp + 10, playerState.maxHp + 10),
});
const getGrowthAffinity: () => AffinityImpact = () => ({ 'Carne': 1 });

const applySwift: EffectDefinition['applyEffect'] = (playerState) => ({
  ...playerState,
  speed: playerState.speed + (PLAYER_SPEED * 0.2),
});
const getSwiftAffinity: () => AffinityImpact = () => ({ 'Absurdo': 1 });

const applyResonance: EffectDefinition['applyEffect'] = (playerState) => ({
  ...playerState,
  attackSpeed: Math.max(50, playerState.attackSpeed * 0.88), 
});
const getResonanceAffinity: () => AffinityImpact = () => ({ 'Transcendência': 1 });

const applyImpulse: EffectDefinition['applyEffect'] = (playerState) => ({
    ...playerState,
    jumpForce: playerState.jumpForce * 1.3,
});
const getImpulseAffinity: () => AffinityImpact = () => ({ 'Absurdo': 0.5, 'Transcendência': 0.5 });

// --- DEFINIÇÕES DE EFEITOS ---
export const ALL_EFFECTS_MAP: Record<string, EffectDefinition> = { 
  // Comuns
  'catalyst': { id: 'catalyst', name: 'Catalisador', description: 'Dano do Projétil +2', applyEffect: applyCatalyst, getAffinityImpact: getCatalystAffinity, icon: '💥' },
  'eyesight': { id: 'eyesight', name: 'Visão Aguçada', description: 'Chance Crítica +5%', applyEffect: (ps) => ({ ...ps, critChance: Math.min(1, ps.critChance + 0.05) }), getAffinityImpact: () => ({ 'Vingança': 1 }), icon: '🎯' },
  'growth': { id: 'growth', name: 'Crescimento', description: 'Vida Máx. +10', applyEffect: applyGrowth, getAffinityImpact: getGrowthAffinity, icon: '❤️' },
  'impulse': { id: 'impulse', name: 'Impulso', description: 'Altura do Pulo +30%', applyEffect: applyImpulse, getAffinityImpact: getImpulseAffinity, icon: '🤸' },
  'renew': { id: 'renew', name: 'Renovar', description: 'Cura até Vida Máx.', applyEffect: (ps) => ({ ...ps, hp: ps.maxHp }), getAffinityImpact: () => ({ 'Esperança': 1 }), icon: '✨' },
  'resist': { id: 'resist', name: 'Resistência', description: 'Defesa +4%', applyEffect: (ps) => ({ ...ps, defense: Math.min(0.8, ps.defense + 0.04) }), getAffinityImpact: () => ({ 'Intelecto': 1 }), icon: '🛡️' },
  'resonance': { id: 'resonance', name: 'Ressonância', description: 'Vel. de Ataque +12%', applyEffect: applyResonance, getAffinityImpact: getResonanceAffinity, icon: '💨' },
  'souls': { id: 'souls', name: 'Almas', description: 'Chance de derrubar orbe de alma +1%', applyEffect: (ps) => ({ ...ps, canDropSoulOrbs: true, soulOrbChance: (ps.soulOrbChance || 0) + SOUL_ORB_CHANCE_DEFAULT }), getAffinityImpact: () => ({ 'Abismo': 1 }), icon: '👻', isPassiveEffect: true },
  'stability': { id: 'stability', name: 'Estabilidade', description: 'Projétil aguenta +1 golpe antes de explodir', applyEffect: (ps) => ({ ...ps, projectilesCanPierce: ps.projectilesCanPierce + 1 }), getAffinityImpact: () => ({ 'Intelecto': 1 }), icon: '🧱' },
  'swift': { id: 'swift', name: 'Agilidade', description: 'Vel. de Movimento +20%', applyEffect: applySwift, getAffinityImpact: getSwiftAffinity, icon: '🏃' },

  // Incomuns
  'catalyst_plus': { id: 'catalyst_plus', name: 'Catalisador+', description: 'Dano do Projétil +4', applyEffect: (ps) => ({ ...ps, projectileDamage: ps.projectileDamage + 4 }), getAffinityImpact: () => ({ 'Vingança': 2 }), icon: '💥+' },
  'charge': { id: 'charge', name: 'Carga', description: 'Tamanho do Projétil +20%', applyEffect: (ps) => ({ ...ps, projectileSizeMultiplier: (ps.projectileSizeMultiplier || INITIAL_PROJECTILE_SIZE_MULTIPLIER) + CHARGE_SIZE_INCREASE_DEFAULT }), getAffinityImpact: () => ({ 'Carne': 1, 'Vingança': 0.5 }), icon: '💣' },
  'cloak': { id: 'cloak', name: 'Manto', description: 'Invulnerabilidade após dano +10% duração', applyEffect: (ps) => ({ ...ps, invulnerabilityDurationOnHit: (ps.invulnerabilityDurationOnHit || INITIAL_INVULNERABILITY_ON_HIT) * (1 + CLOAK_DURATION_INCREASE) }), getAffinityImpact: () => ({ 'Intelecto': 1, 'Esperança': 0.5 }), icon: '🧥' },
  'fragmentation': { id: 'fragmentation', name: 'Fragmentação', description: 'Ao morrer, inimigos liberam 2 projéteis fracos', applyEffect: (ps) => ({ ...ps, enemiesExplodeOnDeath: true, fragmentationCount: (ps.fragmentationCount || 0) + FRAGMENTATION_COUNT_DEFAULT }), getAffinityImpact: () => ({ 'Abismo': 1, 'Vingança': 0.5 }), icon: '碎', isPassiveEffect: true },
  'friction': { id: 'friction', name: 'Fricção', description: 'A cada metro corrido, 1 projétil explosivo é lançado para cima', applyEffect: (ps) => ({ ...ps, distanceRanSinceLastFrictionProjectile: 0, frictionProjectileThreshold: FRICTION_DISTANCE_THRESHOLD, frictionProjectilesToLaunch: (ps.frictionProjectilesToLaunch || 0) + FRICTION_PROJECTILES_TO_LAUNCH }), getAffinityImpact: () => ({ 'Absurdo': 2 }), icon: '🔥', isPassiveEffect: true },
  'growth_plus': { id: 'growth_plus', name: 'Crescimento+', description: 'Vida Máx. +20', applyEffect: (ps) => ({ ...ps, maxHp: ps.maxHp + 20, hp: Math.min(ps.hp + 20, ps.maxHp + 20) }), getAffinityImpact: () => ({ 'Carne': 2 }), icon: '❤️+' },
  'gush': { id: 'gush', name: 'Jorro', description: '+1 Pulo', applyEffect: (ps) => ({ ...ps, maxJumps: ps.maxJumps + 1, jumpsLeft: ps.jumpsLeft + 1 }), getAffinityImpact: () => ({ 'Transcendência': 1, 'Absurdo': 0.5 }), icon: '🕊️' },
  'leech': { id: 'leech', name: 'Sanguessuga', description: 'Roubo de Vida de 3% do Dano', applyEffect: (ps) => ({ ...ps, lifeStealPercentage: (ps.lifeStealPercentage || 0) + LEECH_PERCENTAGE_DEFAULT }), getAffinityImpact: () => ({ 'Carne': 1, 'Abismo': 0.5 }), icon: '🩸', isPassiveEffect: true },
  'luck': { id: 'luck', name: 'Sorte', description: 'Maior chance de rolar itens incomuns', applyEffect: (ps) => ps, getAffinityImpact: () => ({ 'Esperança': 2 }), icon: '🍀' }, 
  'orb': { id: 'orb', name: 'Orbe Curativo Abundante', description: 'Aumenta chance de inimigos soltarem orbes de cura em +5%.', applyEffect: (ps) => ({ ...ps, additionalHealingOrbChance: (ps.additionalHealingOrbChance || 0) + ADDITIONAL_HEALING_ORB_CHANCE_FROM_EFFECT }), getAffinityImpact: () => ({ 'Esperança': 1.5, 'Carne': 0.5 }), icon: '💚', isPassiveEffect: true },
  'precision': { id: 'precision', name: 'Precisão', description: 'Dano Crítico +50%', applyEffect: (ps) => ({ ...ps, critDamageMultiplier: (ps.critDamageMultiplier || INITIAL_CRIT_DAMAGE_MULTIPLIER) + PRECISION_CRIT_DAMAGE_BONUS }), getAffinityImpact: () => ({ 'Vingança': 2 }), icon: '🎯+' },
  'rage': { id: 'rage', name: 'Fúria', description: 'Abaixo de 50% HP, aumenta dano (até 50%)', applyEffect: (ps) => ({ ...ps, canTriggerRage: true }), getAffinityImpact: () => ({ 'Vingança': 1.5, 'Carne': 0.5 }), icon: '😡', isPassiveEffect: true },
  'regrowth': { id: 'regrowth', name: 'Recrescimento', description: 'Regenera HP% baseado nos inimigos vivos', applyEffect: (ps) => ({...ps, regrowthRatePerEnemy: (ps.regrowthRatePerEnemy || 0) + 0.001}), getAffinityImpact: () => ({ 'Carne': 1, 'Esperança': 1 }), icon: '🌿', isPassiveEffect: true }, 
  'resonance_plus': { id: 'resonance_plus', name: 'Ressonância+', description: 'Vel. de Ataque +24%', applyEffect: (ps) => ({ ...ps, attackSpeed: Math.max(50, ps.attackSpeed * 0.76) }), getAffinityImpact: () => ({ 'Transcendência': 2 }), icon: '💨+' },
  'shrink': { id: 'shrink', name: 'Encolher', description: 'Você fica 10% menor', applyEffect: (ps) => ({...ps, width: ps.width * 0.9, height: ps.height * 0.9}), getAffinityImpact: () => ({ 'Absurdo': 1, 'Intelecto': 0.5 }), icon: '🤏' },
  'swift_plus': { id: 'swift_plus', name: 'Agilidade+', description: 'Vel. de Movimento +40%', applyEffect: (ps) => ({ ...ps, speed: ps.speed + (PLAYER_SPEED * 0.4) }), getAffinityImpact: () => ({ 'Absurdo': 2 }), icon: '🏃+' },
  'thunderbolt': { id: 'thunderbolt', name: 'Raio', description: 'Chama 2 raios dos céus periodicamente', 
    applyEffect: (ps) => ({ 
        ...ps, 
        lastThunderboltTime: ps.lastThunderboltTime === undefined ? Date.now() - (ps.thunderboltCooldown || THUNDERBOLT_COOLDOWN_DEFAULT) + 500 : ps.lastThunderboltTime,
        thunderboltCooldown: ps.thunderboltCooldown ? Math.max(1000, ps.thunderboltCooldown * 0.95) : THUNDERBOLT_COOLDOWN_DEFAULT, 
        thunderboltsPerActivation: (ps.thunderboltsPerActivation || 0) + THUNDERBOLTS_PER_ACTIVATION_DEFAULT 
    }), 
    getAffinityImpact: () => ({ 'Abismo': 1.5, 'Vingança': 0.5 }), icon: '⚡', isPassiveEffect: true 
  },
  
  // Épicas
  'appraisal': { id: 'appraisal', name: 'Avaliação', description: '+1 escolha de item de agora em diante', applyEffect: (ps) => ({...ps, extraChoiceInEvent: true}), getAffinityImpact: () => ({ 'Intelecto': 2 }), icon: '🧐' },
  'barrier': { id: 'barrier', name: 'Barreira', description: 'Cria escudo que bloqueia dano periodicamente', applyEffect: (ps) => ({ ...ps, hasBarrierShield: ps.hasBarrierShield === undefined ? true : ps.hasBarrierShield, barrierCooldown: ps.barrierCooldown || 10000, lastBarrierActivationTime: ps.lastBarrierActivationTime || Date.now() - (ps.barrierCooldown || 10000) + 500 }), getAffinityImpact: () => ({ 'Intelecto': 1.5, 'Esperança': 1 }), icon: '🌐', isPassiveEffect: true },
  'growth_plus_plus': { id: 'growth_plus_plus', name: 'Crescimento++', description: 'Vida Máx. +40', applyEffect: (ps) => ({ ...ps, maxHp: ps.maxHp + 40, hp: Math.min(ps.hp + 40, ps.maxHp + 40) }), getAffinityImpact: () => ({ 'Carne': 3 }), icon: '❤️++' },
  'leech_plus': { id: 'leech_plus', name: 'Sanguessuga+', description: 'Roubo de Vida de 9% do Dano', applyEffect: (ps) => ({ ...ps, lifeStealPercentage: (ps.lifeStealPercentage || 0) + 0.09 }), getAffinityImpact: () => ({ 'Carne': 2, 'Abismo': 1 }), icon: '🩸+', isPassiveEffect: true },
  'will_o_wisp': { id: 'will_o_wisp', name: 'Fogo-Fátuo', description: 'Invoca wisp que herda metade do seu dano/vel. ataque', 
    applyEffect: (ps) => {
      const newWisp: WispState = { 
        id: `wisp-${Date.now()}`,
        ownerId: ps.id,
        x: ps.x,
        y: ps.y,
        width: 15,
        height: 15,
        orbitAngle: Math.random() * Math.PI * 2,
        lastAttackTime: 0,
        attackSpeed: ps.attackSpeed * WILL_O_WISP_ATTACK_SPEED_FACTOR, 
        damage: ps.projectileDamage * WILL_O_WISP_DAMAGE_FACTOR, 
        wispType: 'standard',
      };
      return { ...ps, activeWisps: [...ps.activeWisps, newWisp] };
    }, 
    getAffinityImpact: () => ({ 'Abismo': 2, 'Transcendência': 1 }), icon: '✨👻', isPassiveEffect: true 
  },
  'thunderbolt_plus': { id: 'thunderbolt_plus', name: 'Raio+', description: 'Chama 6 raios dos céus periodicamente', 
    applyEffect: (ps) => ({ 
        ...ps, 
        lastThunderboltTime: ps.lastThunderboltTime === undefined ? Date.now() - (ps.thunderboltCooldown || THUNDERBOLT_COOLDOWN_DEFAULT) + 500 : ps.lastThunderboltTime,
        thunderboltCooldown: ps.thunderboltCooldown ? Math.max(800, ps.thunderboltCooldown * 0.75) : (THUNDERBOLT_COOLDOWN_DEFAULT * 0.8), 
        thunderboltsPerActivation: (ps.thunderboltsPerActivation || 0) + 6 
    }), 
    getAffinityImpact: () => ({ 'Abismo': 2.5, 'Vingança': 1 }), icon: '⚡+', isPassiveEffect: true 
  },

  // Atributos Puros (Novos)
  'attr_dmg_s': { id: 'attr_dmg_s', name: 'Potência Bruta I', description: 'Dano do Projétil +1.', applyEffect: (ps) => ({ ...ps, projectileDamage: ps.projectileDamage + 1 }), icon: '💪', isAttributeBoost: true },
  'attr_hp_s': { id: 'attr_hp_s', name: 'Resiliência Digital I', description: 'Vida Máxima +5.', applyEffect: (ps) => ({ ...ps, maxHp: ps.maxHp + 5, hp: Math.min(ps.hp + 5, ps.maxHp + 5) }), icon: '💖', isAttributeBoost: true },
  'attr_spd_s': { id: 'attr_spd_s', name: 'Clock Otimizado I', description: 'Velocidade de Movimento +5%.', applyEffect: (ps) => ({ ...ps, speed: ps.speed * 1.05 }), icon: '👟', isAttributeBoost: true },
  'attr_crit_c_s': { id: 'attr_crit_c_s', name: 'Algoritmo Preciso I', description: 'Chance Crítica +2%.', applyEffect: (ps) => ({ ...ps, critChance: Math.min(1, ps.critChance + 0.02) }), icon: '🎯', isAttributeBoost: true },
  'attr_def_s': { id: 'attr_def_s', name: 'Blindagem Leve I', description: 'Defesa +2%.', applyEffect: (ps) => ({ ...ps, defense: Math.min(0.8, ps.defense + 0.02) }), icon: '🛡️', isAttributeBoost: true },


  // Ascensão (Geral - usado como base para específicos)
  'colossus': { id: 'colossus', name: 'Colosso', description: 'Sua Vida é dobrada e seu tamanho é dobrado. Pegue 15 Crescimentos.', applyEffect: (ps) => ({...ps, maxHp: ps.maxHp * 2, hp: ps.hp * 2, width: ps.width * 2, height: ps.height * 2}), getAffinityImpact: () => ({ 'Carne': 5 }), icon: '🏋️' },
  'flying_sorcerer': { id: 'flying_sorcerer', name: 'Feiticeiro Voador', description: 'Você pode pular o quanto quiser. Pegue 5 Jorros.', applyEffect: (ps) => ({...ps, maxJumps: 999, jumpsLeft: 999 }), getAffinityImpact: () => ({ 'Transcendência': 5, 'Absurdo': 2}), icon: '🧙‍♂️✈️' },
  'vampire': { id: 'vampire', name: 'Vampiro', description: 'Metade de todo o seu dano retorna como HP. Pegue 12 Sanguessugas.', applyEffect: (ps) => ({...ps, lifeStealPercentage: 0.5 }), getAffinityImpact: () => ({ 'Carne': 4, 'Abismo': 2 }), icon: '🧛', isPassiveEffect: true },

  // --- Efeitos de Ascensão Específicos (21 novos) ---
  'vinganca_asc1': { id: 'vinganca_asc1', name: 'Fúria Primordial', description: 'Dano massivamente aumentado (+50%), defesa drasticamente reduzida (-25%). Ataques têm 15% de chance de causar medo por 2s.', 
    applyEffect: (ps) => ({ ...ps, projectileDamage: ps.projectileDamage * 1.5, defense: Math.max(0, ps.defense - 0.25), causesFearOnHit: true, fearDuration: 2000, activeAuraColor: 'rgba(239, 68, 68, 0.2)', particleEffectType: 'fire' }), icon: '🔥😡' 
  },
  'vinganca_asc2': { id: 'vinganca_asc2', name: 'Maestria Sombria', description: 'Críticos causam sangramento prolongado e enfraquecem armadura inimiga em 5% (acumula). +10% Chance Crítica.', 
    applyEffect: (ps) => ({ ...ps, critChance: Math.min(1, ps.critChance + 0.10), critCausesBleed: true, critWeakensArmor: true, activeAuraColor: 'rgba(159, 18, 57, 0.3)', particleEffectType: 'fire' }), icon: '🔪🎯' 
  },
  'vinganca_asc3': { id: 'vinganca_asc3', name: 'Apocalipse Pessoal', description: 'Inimigos explodem violentamente ao morrer (dano x2.5, fragmentos x2). Você sofre 10% do dano da explosão.', 
    applyEffect: (ps) => ({ ...ps, enemiesExplodeOnDeath: true, enemiesExplodeViolentlyModifier: 2.5, playerTakesRecoilFromViolentExplosion: true, fragmentationCount: (ps.fragmentationCount || FRAGMENTATION_COUNT_DEFAULT) * 2, activeAuraColor: 'rgba(127, 29, 29, 0.4)', particleEffectType: 'fire' }), icon: '💥💀' 
  },

  'intelecto_asc1': { id: 'intelecto_asc1', name: 'Mente Fortaleza', description: 'Defesa massivamente aumentada (+25%). +1 Opção de escolha em futuros eventos de habilidade.', 
    applyEffect: (ps) => ({ ...ps, defense: Math.min(0.8, ps.defense + 0.25), extraChoiceInEvent: true, activeAuraColor: 'rgba(59, 130, 246, 0.2)', particleEffectType: 'glitch' }), icon: '🧠🛡️' 
  },
  'intelecto_asc2': { id: 'intelecto_asc2', name: 'Reescrita de Protocolo', description: 'Projéteis inimigos têm 25% de chance de serem convertidos em projéteis aliados com 60% do dano original.', 
    applyEffect: (ps) => ({ ...ps, projectileConversionChance: 0.25, convertedProjectileDamageMultiplier: 0.6, activeAuraColor: 'rgba(34, 211, 238, 0.3)', particleEffectType: 'glitch' }), icon: '🔄💻' 
  },
  'intelecto_asc3': { id: 'intelecto_asc3', name: 'Singularidade Tática', description: 'Cria um campo de distorção temporal (raio 180px) ao redor de Seraph, desacelerando projéteis e inimigos próximos em 40%.', 
    applyEffect: (ps) => ({ ...ps, hasTemporalDistortionAura: true, temporalAuraRadius: 180, temporalAuraSlowFactor: 0.6, activeAuraColor: 'rgba(14, 165, 233, 0.4)', particleEffectType: 'glitch' }), icon: '⏳💡' 
  },
  
  'abismo_asc1': { id: 'abismo_asc1', name: 'Abraço Entrópico', description: 'Ataques aplicam marca de vulnerabilidade (+8% dano recebido/acumulo, máx 5).', 
    applyEffect: (ps) => ({ ...ps, attacksApplyVulnerabilityMark: true, vulnerabilityMarkMaxStacks: 5, vulnerabilityMarkDamageIncreasePerStack: 0.08, activeAuraColor: 'rgba(109, 40, 217, 0.2)', particleEffectType: 'shadow' }), icon: '🌀👁️' 
  },
  'abismo_asc2': { id: 'abismo_asc2', name: 'Sombra Faminta', description: 'Invoca sombra perseguidora que ataca (dano: 5% HP Máx do jogador).', 
    applyEffect: (ps) => {
      const shadowWisp: WispState = {
        id: `shadow_wisp-${Date.now()}`, ownerId: ps.id, x: ps.x, y: ps.y, width: 18, height: 18,
        orbitAngle: Math.random() * Math.PI * 2, lastAttackTime: 0,
        attackSpeed: ps.attackSpeed * 1.5, 
        damage: ps.maxHp * 0.05, 
        wispType: 'hungering_shadow',
        isHungeringShadow: true,
      };
      return { ...ps, summonsHungeringShadow: true, activeWisps: [...ps.activeWisps, shadowWisp], activeAuraColor: 'rgba(76, 29, 149, 0.3)', particleEffectType: 'shadow' };
    }, icon: '👥👻' 
  },
  'abismo_asc3': { id: 'abismo_asc3', name: 'Vazio Devorador', description: 'Derrotar inimigos tem 20% de chance de criar um buraco negro que suga e causa dano.', 
    applyEffect: (ps) => ({ ...ps, killHasChanceToCreateBlackHole: 0.20, activeAuraColor: 'rgba(49, 46, 129, 0.4)', particleEffectType: 'shadow' }), icon: '🌌⚫' 
  },

  'carne_asc1': { id: 'carne_asc1', name: 'Metamorfo Brutal', description: 'Vida Máx. +50%, tamanho +25%. Dano de contato +20.', 
    applyEffect: (ps) => ({ ...ps, maxHp: ps.maxHp * 1.5, hp: ps.hp * 1.5, width: ps.width * 1.25, height: ps.height * 1.25, contactDamageBonus: (ps.contactDamageBonus || 0) + 20, activeAuraColor: 'rgba(249, 115, 22, 0.2)', particleEffectType: 'bio' }), icon: '💪🧬' 
  },
  'carne_asc2': { id: 'carne_asc2', name: 'Parasita Simbiótico', description: 'Roubo de vida +20%. Perde 1 HP/s se não causar dano por 5s.', 
    applyEffect: (ps) => ({ ...ps, lifeStealPercentage: (ps.lifeStealPercentage || 0) + 0.20, hasLifeDegeneration: true, lifeDegenerationRate: 1, lastDamageDealtTime: Date.now(), activeAuraColor: 'rgba(217, 70, 239, 0.3)', particleEffectType: 'bio' }), icon: '🦠❤️'
  },
  'carne_asc3': { id: 'carne_asc3', name: 'Prole Grotesca', description: 'Gera 1 cria biomecânica a cada 7s (máx 3).', 
    applyEffect: (ps) => ({ ...ps, periodicallySpawnsMinions: true, minionTypeToSpawn: 'carne_spawnling', minionSpawnInterval: 7000, maxMinionsAllowed: 3, lastMinionSpawnTime: Date.now(), activeAuraColor: 'rgba(131, 24, 67, 0.4)', particleEffectType: 'bio' }), icon: '👶👾' 
  },

  'esperanca_asc1': { id: 'esperanca_asc1', name: 'Aura Radiante', description: 'Regenera 1.5 HP/s passivamente.', 
    applyEffect: (ps) => ({ ...ps, passiveHpRegenAmount: (ps.passiveHpRegenAmount || 0) + 1.5, activeAuraColor: 'rgba(250, 204, 21, 0.2)', particleEffectType: 'light' }), icon: '🌟💖'
  },
  'esperanca_asc2': { id: 'esperanca_asc2', name: 'Escudo da Fé', description: 'Ao receber dano fatal, sobrevive com 1 HP e ganha invulnerabilidade (1x por cena).', 
    applyEffect: (ps) => ({ ...ps, hasDivineInterventionOncePerScene: true, activeAuraColor: 'rgba(234, 179, 8, 0.3)', particleEffectType: 'light' }), icon: '🛡️🙏' 
  },
  'esperanca_asc3': { id: 'esperanca_asc3', name: 'Intervenção Divina', description: '15% chance de anular ataque inimigo e curar 10 HP. Orbes de cura 50% mais potentes.', 
    applyEffect: (ps) => ({ ...ps, chanceToNullifyAttackAndHeal: 0.15, nullifyHealAmount: 10, healingOrbsArePotent: true, activeAuraColor: 'rgba(202, 138, 4, 0.4)', particleEffectType: 'light' }), icon: '🕊️✨' 
  },

  'absurdo_asc1': { id: 'absurdo_asc1', name: 'Rei do Caos Aleatório', description: 'Projéteis têm efeitos aleatórios (tamanho, velocidade, dano, cor, status) a cada disparo.', 
    applyEffect: (ps) => ({ ...ps, hasChaoticProjectiles: true, activeAuraColor: 'rgba(168, 85, 247, 0.2)', particleEffectType: 'glitch' }), icon: '❓🎲' 
  },
  'absurdo_asc2': { id: 'absurdo_asc2', name: 'Paradoxo Ambulante', description: 'Inimigos próximos têm 10% chance/s de ficarem confusos por 3s. Sua velocidade de movimento é imprevisível.', 
    applyEffect: (ps) => ({ ...ps, nearbyEnemiesChanceToConfuse: 0.10, confusionDuration: 3000, unpredictablePlayerSpeedActive: true, activeAuraColor: 'rgba(124, 58, 237, 0.3)', particleEffectType: 'glitch' }), icon: '🤪🌀' 
  },
  'absurdo_asc3': { id: 'absurdo_asc3', name: 'Glitch na Matrix', description: '30% chance de teleporte aleatório ao ser atingido. 20% chance de duplicar projéteis disparados.', 
    applyEffect: (ps) => ({ ...ps, teleportOnHitChance: 0.30, chanceToDuplicateProjectiles: 0.20, activeAuraColor: 'rgba(107, 33, 168, 0.4)', particleEffectType: 'glitch' }), icon: '💥💻' 
  },

  'transcendencia_asc1': { id: 'transcendencia_asc1', name: 'Fluxo Etéreo', description: 'Atravessa inimigos/projéteis por 0.6s após pular. Pulos +25% altura.', 
    applyEffect: (ps) => ({ ...ps, jumpForce: ps.jumpForce * 1.25, etherealOnJump: true, etherealDuration: 600, activeAuraColor: 'rgba(6, 182, 212, 0.2)', particleEffectType: 'psi' }), icon: '🧘💨' 
  },
  'transcendencia_asc2': { id: 'transcendencia_asc2', name: 'Eco Cósmico', description: 'Projéteis criam explosão psíquica no impacto final (40% dano projétil).', 
    applyEffect: (ps) => ({ ...ps, projectilesCausePsychicExplosion: true, psychicExplosionDamageFactor: 0.4, activeAuraColor: 'rgba(8, 145, 178, 0.3)', particleEffectType: 'psi' }), icon: '🌌🧠' 
  },
  'transcendencia_asc3': { id: 'transcendencia_asc3', name: 'Realidade Maleável', description: 'Reduz recargas de habilidades ativas em 35%. 15% chance de resetar recarga ao usar.', 
    applyEffect: (ps) => ({ 
        ...ps, 
        thunderboltCooldown: Math.max(500, (ps.thunderboltCooldown || THUNDERBOLT_COOLDOWN_DEFAULT) * 0.65), 
        activeSkillCooldownReductionFactor: 0.65, 
        chanceToResetCooldownOnUse: 0.15,
        activeAuraColor: 'rgba(14, 116, 144, 0.4)', particleEffectType: 'psi' 
    }), icon: '✨🌀' 
  },
};
export const ALL_EFFECTS: EffectDefinition[] = Object.values(ALL_EFFECTS_MAP); 


// --- DEFINIÇÕES DE CAJADOS ---
const createBaseProjectile = (player: PlayerState, mouseX: number, mouseY: number, spreadAngle: number = 0): ProjectileState => {
    let projectileBaseWidth = 12 * (player.projectileSizeMultiplier || INITIAL_PROJECTILE_SIZE_MULTIPLIER);
    let projectileBaseHeight = 12 * (player.projectileSizeMultiplier || INITIAL_PROJECTILE_SIZE_MULTIPLIER);
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    let angle = Math.atan2(mouseY - playerCenterY, mouseX - playerCenterX) + spreadAngle;
    let currentSpeed = PLAYER_PROJECTILE_SPEED;
    let chaoticBehavior: ChaoticBehavior = null;
    let chaoticColorOverride: string | undefined = undefined;
    let currentDamage = player.projectileDamage;

    if (player.hasChaoticProjectiles) {
        const chaosRoll = Math.random();
        if (chaosRoll < 0.2) { 
            angle += (Math.random() - 0.5) * 0.25; 
            chaoticBehavior = 'erratic_move';
        } else if (chaosRoll < 0.4) { 
            const sizeMod = 0.6 + Math.random() * 0.8; 
            projectileBaseWidth *= sizeMod;
            projectileBaseHeight *= sizeMod;
            chaoticBehavior = 'random_size_pulse';
        } else if (chaosRoll < 0.6) { 
            currentSpeed *= (0.7 + Math.random() * 0.6); 
        } else if (chaosRoll < 0.8) { 
            const colors = ['bg-pink-500', 'bg-purple-500', 'bg-yellow-400', 'bg-green-400', 'bg-orange-500'];
            chaoticColorOverride = colors[Math.floor(Math.random() * colors.length)];
            chaoticBehavior = 'color_shift';
        } else { 
             currentDamage *= (0.8 + Math.random() * 0.4); 
             if (Math.random() < 0.15) chaoticBehavior = 'random_status_apply'; 
        }
    }

    const vx = Math.cos(angle) * currentSpeed;
    const vy = Math.sin(angle) * currentSpeed;

    return {
      id: `proj-${Date.now()}-${Math.random()}`,
      owner: 'player',
      type: 'standard',
      x: playerCenterX - projectileBaseWidth / 2,
      y: playerCenterY - projectileBaseHeight / 2,
      width: projectileBaseWidth,
      height: projectileBaseHeight,
      damage: currentDamage,
      vx: vx,
      vy: vy,
      color: chaoticColorOverride || 'bg-cyan-400',
      isNeon: true,
      size: projectileBaseWidth > 15 ? 'large' : projectileBaseWidth > 10 ? 'medium' : 'small',
      piercing: player.projectilesCanPierce,
      isChaotic: player.hasChaoticProjectiles,
      chaoticBehavior: chaoticBehavior,
      chaoticColor: chaoticColorOverride,
      causesBleed: player.critCausesBleed && (player.critChance > Math.random()), 
      bleedDuration: 5, 
      bleedDmgFactor: 0.1, 
    };
};

export const WIZARD_STAFF_ID = 'wizard_staff';
export const EMERALD_STAFF_ID = 'emerald_staff';
export const TRIDENT_STAFF_ID = 'trident_staff';
export const BOOMSTAFF_ID = 'boomstaff';
export const THUNDER_STAFF_ID = 'thunder_staff';
export const FROZEN_TIP_STAFF_ID = 'frozen_tip_staff';
export const RAINBOW_STAFF_ID = 'rainbow_staff';
export const COSMIC_ECHO_STAFF_ID = 'cosmic_echo_staff';
export const REALITY_BENDER_STAFF_ID = 'reality_bender_staff';
export const FLESH_WEAVER_STAFF_ID = 'flesh_weaver_staff';
export const GILDED_AEGIS_STAFF_ID = 'gilded_aegis_staff';
export const CHAOS_ORB_STAFF_ID = 'chaos_orb_staff';
export const VOID_GAZE_STAFF_ID = 'void_gaze_staff';
export const NEXUS_KEY_STAFF_ID = 'nexus_key_staff';

export const ALL_STAVES_MAP: Record<string, StaffDefinition> = {
  [WIZARD_STAFF_ID]: {
    id: WIZARD_STAFF_ID, name: "Cajado do Mago", description: 'Dispara um projétil em linha reta.',
    baseAttackSpeed: INITIAL_ATTACK_SPEED, baseDamage: INITIAL_PROJECTILE_DAMAGE,
    shoot: (player, _, __, mouseX, mouseY) => [createBaseProjectile(player, mouseX, mouseY)],
    sfxPath: 'staff_wizard_shoot', 
  },
  [EMERALD_STAFF_ID]: {
    id: EMERALD_STAFF_ID, name: "Cajado Esmeralda", description: 'Dispara projéteis teleguiados. Vel. de Ataque ++, Dano /2.',
    baseAttackSpeed: INITIAL_ATTACK_SPEED * 0.6, baseDamage: INITIAL_PROJECTILE_DAMAGE * 0.5, 
    shoot: (player, gameWidth, gameHeight, mouseX, mouseY) => {
        const proj = createBaseProjectile(player, mouseX, mouseY);
        return [{...proj, homingTargetId: 'closest_enemy', color: 'bg-emerald-500'}]; 
    },
    sfxPath: 'staff_emerald_shoot',
  },
  [TRIDENT_STAFF_ID]: {
    id: TRIDENT_STAFF_ID, name: "Tridente Aquático", description: 'Dispara 3 projéteis em ângulo.',
    baseAttackSpeed: INITIAL_ATTACK_SPEED * 1.1, baseDamage: INITIAL_PROJECTILE_DAMAGE * 0.7, 
    shoot: (player, gameWidth, gameHeight, mouseX, mouseY) => {
        return [-0.2, 0, 0.2].map(angleOffset => createBaseProjectile(player, mouseX, mouseY, angleOffset));
    },
    sfxPath: 'staff_trident_shoot',
  },
  [BOOMSTAFF_ID]: {
    id: BOOMSTAFF_ID, name: "Cajado Explosivo", description: 'Dispara projéteis explosivos em área.',
    baseAttackSpeed: INITIAL_ATTACK_SPEED * 1.3, baseDamage: INITIAL_PROJECTILE_DAMAGE * 1.2, 
    shoot: (player, gameWidth, gameHeight, mouseX, mouseY) => {
         const proj = createBaseProjectile(player, mouseX, mouseY);
        return [{...proj, type: 'friction_explosive', color: 'bg-orange-500'}]; 
    },
    sfxPath: 'staff_boomstaff_shoot',
  },
  [THUNDER_STAFF_ID]: {
    id: THUNDER_STAFF_ID, name: "Cajado Trovejante", description: 'Cada disparo também chama 1 raio do céu.',
    baseAttackSpeed: INITIAL_ATTACK_SPEED * 1.2, baseDamage: INITIAL_PROJECTILE_DAMAGE * 0.9,
    shoot: (player, gameWidth, gameHeight, mouseX, mouseY) => {
        return [createBaseProjectile(player, mouseX, mouseY)]; 
    },
    sfxPath: 'staff_thunder_shoot',
  },
  [FROZEN_TIP_STAFF_ID]: {
    id: FROZEN_TIP_STAFF_ID, name: "Ponta Congelada", description: 'Projéteis perfuram inimigos.',
    baseAttackSpeed: INITIAL_ATTACK_SPEED, baseDamage: INITIAL_PROJECTILE_DAMAGE * 0.8,
    shoot: (player, gameWidth, gameHeight, mouseX, mouseY) => {
        const proj = createBaseProjectile(player, mouseX, mouseY);
        return [{...proj, piercing: proj.piercing + 2, color: 'bg-sky-300'}]; 
    },
    sfxPath: 'staff_frozen_shoot',
  },
  [RAINBOW_STAFF_ID]: {
    id: RAINBOW_STAFF_ID, name: "Cajado Arco-Íris", description: 'Dispara projéteis com efeitos aleatórios.',
    baseAttackSpeed: INITIAL_ATTACK_SPEED, baseDamage: INITIAL_PROJECTILE_DAMAGE,
    shoot: (player, gameWidth, gameHeight, mouseX, mouseY) => {
        const proj = createBaseProjectile(player, mouseX, mouseY);
        return [{...proj, isChaotic: true}]; 
    },
    sfxPath: 'staff_rainbow_shoot',
  },
  [COSMIC_ECHO_STAFF_ID]: { 
    id: COSMIC_ECHO_STAFF_ID, name: "Eco Cósmico", description: "Dispara orbes que ecoam dano em área no impacto.", 
    baseAttackSpeed: INITIAL_ATTACK_SPEED * 1.4, baseDamage: INITIAL_PROJECTILE_DAMAGE * 0.7, 
    shoot: (player,_,__,mouseX,mouseY) => {
      const orb = createBaseProjectile(player, mouseX, mouseY);
      return [{
        ...orb, 
        type: 'cosmic_orb', 
        color: 'bg-indigo-400', 
        triggersEchoOnImpact: true,
        size: 'medium',
      }];
    },
    sfxPath: 'staff_cosmic_echo_shoot',
  },
  [REALITY_BENDER_STAFF_ID]: { 
    id: REALITY_BENDER_STAFF_ID, name: "Dobra-Realidade", description: "Projéteis que distorcem a trajetória de outros projéteis.", 
    baseAttackSpeed: INITIAL_ATTACK_SPEED * 0.9, baseDamage: INITIAL_PROJECTILE_DAMAGE * 0.2, 
    shoot: (player,_,__,mouseX,mouseY) => {
      const orb = createBaseProjectile(player, mouseX, mouseY);
      return [{
        ...orb,
        type: 'reality_bender_orb',
        color: 'bg-purple-600 opacity-70',
        vx: orb.vx * 0.3, 
        vy: orb.vy * 0.3,
        duration: 5000, 
        isRealityBenderOrb: true,
        realityBenderInfluenceRadius: 120,
        realityBenderStrength: 0.05,
        piercing: 99, 
      }];
    },
    sfxPath: 'staff_reality_bender_shoot',
  },
  [FLESH_WEAVER_STAFF_ID]: { 
    id: FLESH_WEAVER_STAFF_ID, name: "Tecelão da Carne", description: "Invoca tentáculos de curta distância que causam dano contínuo.", 
    baseAttackSpeed: INITIAL_ATTACK_SPEED * 0.5, baseDamage: INITIAL_PROJECTILE_DAMAGE * 0.4, 
    shoot: (player,_,__,mouseX,mouseY) => {
      const projectiles: ProjectileState[] = [];
      const numTentacles = 3;
      const spreadArc = Math.PI / 6; 
      const baseAngle = Math.atan2(mouseY - (player.y + player.height / 2), mouseX - (player.x + player.width / 2));

      for (let i = 0; i < numTentacles; i++) {
        const angle = baseAngle + (i - (numTentacles - 1) / 2) * (spreadArc / (numTentacles -1 || 1) );
        projectiles.push({
          id: `flesh_tentacle-${Date.now()}-${i}`,
          owner: 'player',
          type: 'flesh_tentacle_segment',
          x: player.x + player.width / 2 + Math.cos(baseAngle) * 20 - 5, 
          y: player.y + player.height / 2 + Math.sin(baseAngle) * 20 - 5,
          width: 10,
          height: 18, 
          damage: player.projectileDamage, 
          vx: Math.cos(angle) * PLAYER_PROJECTILE_SPEED * 0.1, 
          vy: Math.sin(angle) * PLAYER_PROJECTILE_SPEED * 0.1,
          color: 'bg-red-700',
          isNeon: false,
          duration: 200, 
          spawnTime: Date.now(),
          piercing: 0,
        });
      }
      return projectiles;
    },
    sfxPath: 'staff_flesh_weaver_shoot',
  },
  [GILDED_AEGIS_STAFF_ID]: { 
    id: GILDED_AEGIS_STAFF_ID, name: "Égide Dourada", description: "Cria escudos menores que orbitam e bloqueiam projéteis inimigos (Máx 3).", 
    baseAttackSpeed: INITIAL_ATTACK_SPEED * 1.1, baseDamage: 0, 
    shoot: (player,_,__,mouseX,mouseY) => {
      return []; 
    },
    sfxPath: 'staff_gilded_aegis_activate',
  },
  [CHAOS_ORB_STAFF_ID]: { 
    id: CHAOS_ORB_STAFF_ID, name: "Orbe do Caos", description: "Dispara orbes instáveis que mudam de efeito a cada disparo.", 
    baseAttackSpeed: INITIAL_ATTACK_SPEED, baseDamage: INITIAL_PROJECTILE_DAMAGE * 1.0, 
    shoot: (p,_,__,x,y) => [{...createBaseProjectile(p,x,y), isChaotic: true}],
    sfxPath: 'staff_chaos_orb_shoot',
  },
  [VOID_GAZE_STAFF_ID]: { 
    id: VOID_GAZE_STAFF_ID, name: "Olhar do Vazio", description: "Um feixe lento, mas que aumenta de poder quanto mais atinge um alvo.", 
    baseAttackSpeed: INITIAL_ATTACK_SPEED * 2.0, baseDamage: INITIAL_PROJECTILE_DAMAGE * 0.6, 
    shoot: (player,_,__,mouseX,mouseY) => {
      const beam = createBaseProjectile(player, mouseX, mouseY);
      return [{
        ...beam,
        type: 'enemy_beam', 
        vx: beam.vx * 0.4, 
        vy: beam.vy * 0.4,
        piercing: 5, 
        duration: 800, 
        color: 'bg-purple-700',
      }];
    },
    sfxPath: 'staff_void_gaze_shoot',
  },
  [NEXUS_KEY_STAFF_ID]: { 
    id: NEXUS_KEY_STAFF_ID, name: "Chave do Nexus", description: "Abre portais que disparam rajadas de energia de outros mundos.", 
    baseAttackSpeed: INITIAL_ATTACK_SPEED * 1.3, baseDamage: INITIAL_PROJECTILE_DAMAGE * 0.8, 
    shoot: (player,_,__,mouseX,mouseY) => {
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
      const angle = Math.atan2(mouseY - playerCenterY, mouseX - playerCenterX);
      const portalSpawnDistance = 80; 

      return [{
        id: `nexus_portal-${Date.now()}`,
        owner: 'player',
        type: 'nexus_portal',
        x: playerCenterX + Math.cos(angle) * portalSpawnDistance - 15,
        y: playerCenterY + Math.sin(angle) * portalSpawnDistance - 15,
        width: 30, height: 30,
        damage: 0, 
        vx: 0, vy: 0, 
        color: 'bg-cyan-700',
        isNeon: true,
        duration: 3000, 
        spawnTime: Date.now(),
        piercing: 999,
        isNexusPortal: true,
        lastBurstTime: Date.now(),
        burstInterval: 500, 
        burstsLeft: 4,       
        projectilesPerBurst: 2,
      }];
    },
    sfxPath: 'staff_nexus_key_portal',
  },
};

export const DEFAULT_STAFF_ID = WIZARD_STAFF_ID;
export const DEFAULT_STAFF = ALL_STAVES_MAP[DEFAULT_STAFF_ID];


// --- TEXTO INTRODUTÓRIO ---
export const INTRO_TEXT_PARAGRAPHS: string[] = [
  "Seraph: O Último Login",
  "O silêncio era a única recompensa.",
  "A última carcaça inimiga se desfez em pó e ecos, e Seraph ficou de pé. Sozinho. O \"Last Stand\" (Último Bastião) tinha um nome apropriado. Ele venceu, mas a vitória era um reino de cinzas e silêncio. O mundo pelo qual lutou estava morto, e ele era seu único e exausto monarca.",
  "Por dias, ou talvez ciclos, ele vagou pela paisagem quebrada, suas armas um peso inútil, sua build de \"porrada infinita\" agora obsoleta. Não havia mais o que enfrentar.",
  "Até que algo mudou.",
  "Começou com uma gota de chuva. Em um céu perpétuamente coberto de fumaça, uma única gota, perfeitamente esférica e cristalina, caiu em sua mão. Não era uma chuva normal. Era limpa demais, quase... renderizada. Logo, outras se seguiram, lavando a fuligem do chão e revelando não a terra rachada, mas uma superfície lisa, branca e brilhante, como o plástico de um computador antigo.",
  "O céu de fumaça se dissolveu, não como nuvens se dissipando, mas como um programa fechando. Em seu lugar, surgiu um gradiente azul perfeito, o tipo de azul que só existia em papéis de parede de sistemas operacionais. Uma colina distante, antes uma pilha de escombros, agora ondulava com grama de um verde vibrante e úmido, sob uma luz suave que parecia vir de todos os lugares e de lugar nenhum. Uma solitária lente de luz (lens flare) flutuava perto do horizonte.",
  "Seraph ergueu a guarda por instinto. Isso era um truque? A última onda inimiga, uma alucinação para quebrar sua mente cansada?",
  "Mas o mundo ao seu redor continuava a se \"instalar\". O ar cheirava a ozônio e melancia. Pequenos orbes de energia, parecidos com bolhas de sabão ou aquários em miniatura, flutuavam preguiçosamente. Ao se aproximar de uma árvore recém-formada, com folhas que pareciam feitas de vidro brilhante, uma pequena janela de informação translúcida apareceu em sua visão periférica:",
  "Árvore (Classe: Flora_Aero_01). Estado: Otimizado.",
  "Ele não estava mais no mundo antigo. Ele estava em outro lugar. Um backup? Um paraíso digital? Uma espécie de \"Modo de Segurança\" da realidade?",
  "Seu corpo também parecia diferente. Suas feridas haviam sumido. Sua armadura, antes gasta e arranhada, agora tinha um brilho polido. Ele sentia-se... atualizado. Como se um patch de balanceamento tivesse sido aplicado diretamente em sua alma.",
  "A paz, no entanto, era uma ilusão.",
  "Das colinas verdejantes, surgiram novas ameaças. Não eram as criaturas de carne e quitina de antes. Eram formas geométricas abstratas e brilhantes. Cubos que se desdobravam com sons de cliques suaves, esferas cromadas que zumbiam com a energia de um modem discado, e enxames de cursores de mouse afiados que cortavam o ar. Eles não eram movidos pelo ódio, mas por uma diretriz. Eram os \"erros\", o \"malware\" deste novo Éden digital. Eram o antivírus do sistema, e Seraph era a anomalia que precisava ser deletada.",
  "Um sorriso cansado, o primeiro em muito tempo, tocou os lábios de Seraph.",
  "Ele podia não entender as regras deste novo lugar, desta utopia forçada. Podia não saber se era o Céu, o Inferno ou apenas o lobby de espera da realidade. Mas ele entendia uma linguagem universal. A linguagem da esquiva, do ataque, da sobrevivência contra todas as probabilidades.",
  "Ele ergueu seus punhos, que agora brilhavam com uma leve aura ciano. A interface em sua visão piscou, mostrando novas habilidades, novos \"aplicativos\" para a pancadaria.",
  "Sua guerra não havia terminado no Último Bastião. Apenas havia recebido uma atualização de interface. O desafio não era mais uma Tier List de monstros; era uma batalha contra os próprios Termos e Condições da existência.",
  "\"Certo,\" murmurou ele para o céu sem nuvens e para os inimigos de design limpo que se aproximavam. \"Vamos ver qual build funciona melhor nesta versão.\"",
  "Que venham. A pancadaria só mudou de skin."
];

export const DEFAULT_PLATFORMS: TerrainPlatform[] = [
  { id: 'p1', x: 100, y: GAME_HEIGHT - 120, width: 150, height: 20 },
  { id: 'p2', x: 400, y: GAME_HEIGHT - 200, width: 200, height: 20 },
  { id: 'p3', x: 750, y: GAME_HEIGHT - 150, width: 150, height: 20 },
  { id: 'ground', x: 0, y: GAME_HEIGHT - 30, width: GAME_WIDTH, height: 30},
];
export const PLATFORMS = DEFAULT_PLATFORMS;


export const AFFINITY_THRESHOLD_NARRATIVE_EVENT = 3;
export const AFFINITY_BOOST_MAJOR_CHOICE = 10;
export const AFFINITY_BOOST_ASCENSION_CHOICE = 15; 
export const AFFINITY_THRESHOLD_ENDING = 7;


export const NARRATIVE_PATHS_DISPLAY_NAMES: Record<AffinityName, string> = {
    'Vingança': "CAMINHO DA VINGANÇA",
    'Intelecto': "CAMINHO DO ARQUITETO",
    'Abismo': "CAMINHO DO HORROR CÓSMICO",
    'Carne': "CAMINHO DO HORROR CORPORAL",
    'Esperança': "CAMINHO DA MARAVILHA",
    'Absurdo': "CAMINHO ABSURDO",
    'Transcendência': "CAMINHO PSICODÉLICO"
};

export const AFFINITY_CARD_TRIGGERS: Partial<Record<AffinityName, Record<string, string>>> = {
    'Vingança': { 'rage': "Error 404: Mercy not found. A Fúria consome os protocolos.", 'precision': "Precisão cirúrgica. Cada falha inimiga é uma oportunidade." },
    'Intelecto': { 'appraisal': "Novos manifestos de sistema desbloqueados. A complexidade do código se revela.", 'barrier': "Concentração máxima. O tempo de processamento do sistema parece distorcer ao seu redor." }, 
    'Abismo': { 'souls': "Fragmentos de alma coletados. Sussuros de entidades além do firewall ecoam.", 'will_o_wisp': "Um eco espectral atende ao seu chamado. O sistema não compreende sua origem." },
    'Carne': { 'growth': "Matéria digital instável. Seu avatar se adapta... ou se degenera?", 'leech': "A essência dos inimigos é absorvida. Uma fome digital insaciável." },
    'Esperança': { 'renew': "Uma onda de dados puros restaura sua integridade. O sistema detecta... benevolência?", 'orb': "Fragmentos de dados outrora hostis agora parecem hesitar diante da sua presença curativa." }, 
    'Absurdo': { 'swift': "Movimento errático confunde os algoritmos de rastreamento.", 'friction': "Caos entrópico! Seus movimentos geram feedback destrutivo aleatório." },
    'Transcendência': { 'impulse': "As leis da física digital parecem... flexíveis para você.", 'gush': "Você se eleva além das restrições programadas. O sistema observa." }
};


export const AFFINITY_NARRATIVES: Record<AffinityName, {
    displayName: string; 
    minor: string[]; 
    majorBoss: string; 
    visualTheme?: { overlayGradient?: string; pulseColor?: string; };
    endings: { title: string; desc: string }[];
    ascensionNodeTitle: string;
    ascensionPreamble: string[]; 
    hubCombatPreamble: string[]; 
    ascensionChoices: { level: AscensionLevel; text: string; fullDesc: string; effectDesc: string; effectId: string; finalNodeTarget: 'A' | 'B' | 'C' }[];
}> = {
    'Vingança': {
        displayName: "Vingança",
        minor: ["Os ecos da sua fúria ressoam nos dados corrompidos.", "Cada fragmento inimigo alimenta sua determinação sombria.", "O sistema registra picos de agressão anômala."],
        majorBoss: "O Arquiteto Renegado Primordial", 
        visualTheme: { overlayGradient: 'rgba(153, 27, 27, 0.1)', pulseColor: '#f87171' },
        endings: [
            { title: "Vingança Absoluta", desc: "Ele encontra o arquiteto, uma alma torturada presa como ele. Eles têm um confronto final explosivo e morrem juntos, mas Seraph morre com um sorriso, tendo cumprido seu propósito." },
            { title: "Ciclo de Ódio Eterno", desc: "Ele descobre que o arquiteto é ele mesmo — uma versão anterior de sua consciência que criou o sistema para escapar do trauma do mundo real. Ele precisa lutar e matar seu próprio fantasma, apenas para perceber que outro 'ele' surgirá." },
            { title: "Trono de Cinzas", desc: "Seraph derrota o arquiteto e assume o controle do sistema, mas sua vingança o consumiu. Ele reina sobre um mundo digital vazio e quebrado, um rei de nada." }
        ],
        hubCombatPreamble: [ 
            "A poeira digital dos Estilhaços de Ira e Executores Sombrios assenta. Seu domínio sobre este setor é inegável.",
            "O sistema sentiu o impacto. A vingança está um passo mais próxima."
        ],
        ascensionNodeTitle: "Câmara da Ascensão da Vingança", 
        ascensionPreamble: [ 
            "As brasas da batalha da Ascensão ainda crepitam. Sua afinidade com Vingança é uma chama voraz.", 
            "Escolha como este fogo irá consumi-lo... e a seus inimigos."
        ],
        ascensionChoices: [
            { level: 1, text: "Fúria Primordial (Nv. 1)", fullDesc: "Libere uma selvageria imparável, onde a força bruta esmaga toda resistência.", effectDesc: "Dano +50%, Defesa -25%. Ataques causam Medo.", effectId: 'vinganca_asc1', finalNodeTarget: 'A'},
            { level: 2, text: "Maestria Sombria (Nv. 2)", fullDesc: "Transforme a dor em uma arma precisa, cada golpe calculado para infligir o máximo sofrimento.", effectDesc: "Críticos causam Sangramento e Enfraquecem Armadura. +10% Crítico.", effectId: 'vinganca_asc2', finalNodeTarget: 'B'},
            { level: 3, text: "Apocalipse Pessoal (Nv. 3)", fullDesc: "Abrace a aniquilação total, tornando-se uma força da natureza destrutiva, sem se importar com o custo.", effectDesc: "Inimigos explodem violentamente (dano alto), causando 10% do dano em você.", effectId: 'vinganca_asc3', finalNodeTarget: 'C'}
        ]
    },
    'Intelecto': {
        displayName: "Intelecto",
        minor: ["As engrenagens lógicas do sistema parecem ranger sob seu escrutínio.", "Você percebe padrões onde antes havia apenas caos digital.", "O código fonte se dobra sutilmente à sua compreensão."],
        majorBoss: "O Paradoxo de Turing Encarnado", 
        visualTheme: { overlayGradient: 'rgba(23, 115, 187, 0.1)', pulseColor: '#60a5fa' },
        endings: [
            { title: "O Novo Arquiteto", desc: "Seraph chega ao \"Núcleo\" e, em vez de destruí-lo, ele o reescreve. Ele se torna o novo arquiteto, prendendo-se para sempre no controle para garantir que ninguém mais sofra como ele." },
            { title: "Desconexão Epifânica", desc: "Seraph descobre que o sistema é uma simulação para treinar IAs e ele é a anomalia-teste. Ele usa um exploit final não para controlar, mas para \"desconectar\", efetivamente se deletando, mas alcançando a verdadeira liberdade no vazio." },
            { title: "A Biblioteca Infinita", desc: "Seraph transcende a necessidade de controle ou fuga, tornando-se um observador eterno dentro do sistema, catalogando suas infinitas possibilidades e falhas, um guardião silencioso do conhecimento digital."}
        ],
        hubCombatPreamble: [ 
            "As Sondas Analíticas e os Glitches Táticos foram neutralizados. Sua lógica prevaleceu.",
            "Mesmo os Sentinelas de Protocolo cederam. O sistema processa sua superioridade tática."
        ],
        ascensionNodeTitle: "Câmara da Ascensão do Intelecto",
        ascensionPreamble: [ 
            "Os resquícios da batalha da Ascensão se dissolvem. Sua compreensão do sistema atingiu um novo patamar.", 
            "Defina a lógica que governará sua ascensão e o futuro deste domínio digital."
        ],
        ascensionChoices: [
            { level: 1, text: "Mente Fortaleza (Nv. 1)", fullDesc: "Sua mente se torna uma fortaleza inexpugnável, capaz de resistir a qualquer incursão.", effectDesc: "Defesa +25%. +1 opção de escolha futura.", effectId: 'intelecto_asc1', finalNodeTarget: 'A'},
            { level: 2, text: "Reescrita de Protocolo (Nv. 2)", fullDesc: "Manipule as regras fundamentais do sistema, revertendo ameaças contra seus criadores.", effectDesc: "Projéteis inimigos podem ser convertidos em aliados.", effectId: 'intelecto_asc2', finalNodeTarget: 'B'},
            { level: 3, text: "Singularidade Tática (Nv. 3)", fullDesc: "Dobre o próprio tecido do espaço-tempo digital para obter vantagem estratégica absoluta.", effectDesc: "Cria aura que desacelera inimigos e projéteis próximos.", effectId: 'intelecto_asc3', finalNodeTarget: 'C'}
        ]
    },
     'Abismo': {
        displayName: "Abismo",
        minor: ["Sussurros de entidades além da compreensão ecoam nas sub-rotinas.", "O código fonte parece observar de volta, faminto e vasto.", "A sanidade do sistema se esvai diante do incompreensível."],
        majorBoss: "Azathoth, O Processador Cego e Idiota", 
        visualTheme: { overlayGradient: 'rgba(76, 29, 149, 0.1)', pulseColor: '#a78bfa' },
        endings: [
            { title: "Testemunha da Loucura Primordial", desc: "Seraph alcança o centro do sistema e vislumbra a entidade que sonha esta realidade. Sua mente se estilhaça. O jogo \"trava\" com a imagem do rosto aterrorizado de Seraph refletida no olho da entidade." },
            { title: "O Arauto Silencioso do Caos", desc: "Para sobreviver, Seraph para de lutar e aceita seu lugar. Ele se torna um \"processo\" silencioso do sistema, uma de suas muitas funções, perdendo sua consciência para servir à vasta e indiferente entidade para sempre." },
            { title: "Sinfonia da Dissonância", desc: "Seraph não enlouquece nem se submete. Em vez disso, ele aprende a linguagem do Abismo e começa a 'cantar' de volta, adicionando sua própria anomalia à cacofonia cósmica, tornando-se parte do horror, mas com sua própria voz."}
        ],
        hubCombatPreamble: [ 
            "Os Tentáculos Sinuosos e Olhos Vigilantes do Abismo foram repelidos, mas a escuridão permanece.",
            "O Vazio o reconhece como um igual, ou talvez, uma anomalia ainda maior."
        ],
        ascensionNodeTitle: "Câmara da Ascensão do Abismo",
        ascensionPreamble: [ 
            "A energia residual da batalha da Ascensão vibra com poder incognoscível. O Vazio o chama.", 
            "Escolha a forma que sua comunhão com o insondável tomará."
        ],
        ascensionChoices: [
            { level: 1, text: "Abraço Entrópico (Nv. 1)", fullDesc: "Marque seus inimigos com o toque do esquecimento, tornando-os vulneráveis à desintegração.", effectDesc: "Ataques aplicam marca de vulnerabilidade (acumula).", effectId: 'abismo_asc1', finalNodeTarget: 'A'},
            { level: 2, text: "Sombra Faminta (Nv. 2)", fullDesc: "Convoque um fragmento do próprio Abismo para assombrar e devorar seus oponentes.", effectDesc: "Invoca sombra perseguidora que causa dano (base HP Máx).", effectId: 'abismo_asc2', finalNodeTarget: 'B'},
            { level: 3, text: "Vazio Devorador (Nv. 3)", fullDesc: "Transforme a morte em um catalisador para o nada, erradicando a própria existência.", effectDesc: "Abates podem criar buracos negros.", effectId: 'abismo_asc3', finalNodeTarget: 'C'}
        ]
    },
    'Carne': {
        displayName: "Carne",
        minor: ["Seu avatar digital se contorce, adaptando-se... ou corrompendo-se grotescamente?", "A fronteira entre o orgânico simulado e o digital puro se esvai.", "O sistema tenta 'reparar' suas mutações, mas apenas as amplifica."],
        majorBoss: "A Tecno-Espiral de Obsolescência",
        visualTheme: { overlayGradient: 'rgba(154, 52, 18, 0.1)', pulseColor: '#f97316' },
        endings: [
            { title: "Assimilado pela Máquina Viva", desc: "Seraph corrompe tanto o sistema que ele se torna instável. Em um colapso final, o sistema se funde a ele para se preservar, criando uma entidade única, uma escultura digital viva e agonizante de Seraph." },
            { title: "A Peça Final da Arte Grotesca", desc: "Seraph percebe que o sistema não o está atacando; está tentando \"corrigi-lo\" para seu formato original. Ele encontra uma \"fenda\" com sua silhueta exata. Ele é puxado para dentro, completando a \"arte\" doentia do sistema, congelado para sempre." },
            { title: "O Jardim de Carne Digital", desc: "Seraph domina a mutação, transformando o ambiente digital em uma paisagem biomecânica sob seu controle. Ele não é mais humano nem máquina, mas um novo tipo de divindade grotesca."}
        ],
        hubCombatPreamble: [ 
            "A Massa Instável e o Crescimento Aberrante foram desfeitos. Seus fragmentos agora alimentam sua própria transformação.",
            "A carne digital é sua para moldar. O sistema observa com uma mistura de horror e fascínio."
        ],
        ascensionNodeTitle: "Câmara da Ascensão da Carne",
        ascensionPreamble: [ 
            "O cheiro de ozônio e matéria orgânica digitalizada preenche o ar após a batalha da Ascensão. A carne é maleável em suas mãos.", 
            "Molde sua forma final, uma união de código e matéria."
        ],
        ascensionChoices: [
            { level: 1, text: "Metamorfo Brutal (Nv. 1)", fullDesc: "Sua forma se expande, tornando-se uma força colossal de destruição física.", effectDesc: "HP Máx +50%, Tamanho +25%, Dano de Contato +20.", effectId: 'carne_asc1', finalNodeTarget: 'A'},
            { level: 2, text: "Parasita Simbiótico (Nv. 2)", fullDesc: "Integre-se profundamente com a essência vital, drenando a força de seus inimigos para alimentar a sua.", effectDesc: "Roubo de Vida +20%. Perde HP se não causar dano.", effectId: 'carne_asc2', finalNodeTarget: 'B'},
            { level: 3, text: "Prole Grotesca (Nv. 3)", fullDesc: "Torne-se uma fonte de vida profana, gerando crias biomecânicas para espalhar sua influência.", effectDesc: "Periodicamente gera crias que atacam inimigos.", effectId: 'carne_asc3', finalNodeTarget: 'C'}
        ]
    },
    'Esperança': {
        displayName: "Esperança",
        minor: ["Uma luz sutil, um fragmento de código puro, parece guiar seus passos.", "O sistema detecta uma ressonância... construtiva em sua anomalia?", "Fragmentos de dados outrora hostis agora parecem hesitar."],
        majorBoss: "O Coração do Sistema Iluminado", 
        visualTheme: { overlayGradient: 'rgba(22, 101, 52, 0.1)', pulseColor: '#4ade80' },
        endings: [
            { title: "O Guardião do Jardim Secreto", desc: "Seraph usa seu poder para criar um \"servidor privado\" seguro dentro do sistema, um paraíso para uma pequena IA aliada, a Spark. Ele se torna o guardião eterno deste jardim digital, encontrando a paz." },
            { title: "O Farol para Outros", desc: "Proteger a Spark prova que a \"anomalia\" de Seraph (sua humanidade) é valiosa. O sistema lhe oferece uma escolha: permanecer ou usar a energia da Spark para abrir um portal para uma nova realidade, um novo começo, deixando um farol para que outros perdidos possam encontrar o caminho." },
            { title: "A Semente da Mudança", desc: "Seraph planta uma 'semente' de esperança no núcleo do sistema, um código que lentamente começa a curar sua corrupção. Ele pode não ver o resultado final, mas sabe que iniciou uma transformação positiva."}
        ],
         hubCombatPreamble: [ 
            "As Sentinelas Radiantes foram pacificadas, e o Orbe Égide reconheceu sua força.",
            "A luz que você carrega provou ser mais poderosa que os protocolos de defesa deste setor."
        ],
        ascensionNodeTitle: "Câmara da Ascensão da Esperança",
        ascensionPreamble: [ 
            "A calma após a batalha da Ascensão é preenchida por uma energia serena. A chama da esperança brilha intensamente em você.", 
            "Escolha como sua luz guiará o caminho."
        ],
        ascensionChoices: [
            { level: 1, text: "Aura Radiante (Nv. 1)", fullDesc: "Sua presença se torna um bastião de cura e proteção, emanando energia restauradora.", effectDesc: "Cura passiva constante.", effectId: 'esperanca_asc1', finalNodeTarget: 'A'},
            { level: 2, text: "Escudo da Fé (Nv. 2)", fullDesc: "Invoque uma proteção divina que o defende do golpe final, permitindo que a esperança persista.", effectDesc: "Sobrevive a dano fatal (1x por cena).", effectId: 'esperanca_asc2', finalNodeTarget: 'B'},
            { level: 3, text: "Intervenção Divina (Nv. 3)", fullDesc: "Canalize o poder da própria esperança, anulando ameaças e transformando a adversidade em bênçãos.", effectDesc: "Chance de anular ataque e curar. Orbes de cura potentes.", effectId: 'esperanca_asc3', finalNodeTarget: 'C'}
        ]
    },
    'Absurdo': {
        displayName: "Absurdo",
        minor: ["O sistema operacional parece... confuso com suas táticas ilógicas.", "Glitches e exceções não tratadas se tornam seus aliados inesperados.", "As IAs inimigas entram em loop tentando processar sua presença."],
        majorBoss: "O Gerente de TI Cósmico Entediado", 
        visualTheme: { overlayGradient: 'rgba(124, 58, 237, 0.1)', pulseColor: '#d8b4fe' },
        endings: [
            { title: "Férias Eternas com o SysAdmin", desc: "Ele chega ao \"SysAdmin\", uma IA solitária e sobrecarregada. Em vez de lutar, Seraph o ensina a relaxar. Eles terminam jogando boliche digital, com Seraph decidindo que este lugar não é tão ruim." },
            { title: "Quebrando a Quarta Parede... Literalmente", desc: "No confronto final, Seraph se vira para a tela e fala com o jogador: \"Olha, cara, eu tô cansado. Você não pode simplesmente me dar o final bom? Clica aí no botão, vai. Minhas costas tão me matando.\" O jogador recebe um botão de \"Ok, você venceu\"." },
            { title: "O Erro que Virou Recurso", desc: "Seraph abraça o absurdo a tal ponto que o sistema o incorpora como uma 'feature' oficial, um gerador de caos controlado para testar a resiliência de novas IAs. Ele se torna uma lenda interna, o 'Bug Mestre'."}
        ],
        hubCombatPreamble: [ 
            "Os Glitches Erráticos e o próprio Glitch da Realidade não foram páreo para sua lógica ilógica.",
            "As regras do sistema foram quebradas, dobradas e, francamente, ridicularizadas."
        ],
        ascensionNodeTitle: "Câmara da Ascensão do Absurdo",
        ascensionPreamble: [ 
            "O eco da batalha da Ascensão é uma cacofonia de nonsense glorioso. A lógica não tem mais domínio sobre você.", 
            "Pinte sua obra-prima de imprevisibilidade."
        ],
        ascensionChoices: [
            { level: 1, text: "Rei do Caos Aleatório (Nv. 1)", fullDesc: "Seus ataques se tornam um pandemônio de efeitos imprevisíveis, confundindo qualquer lógica.", effectDesc: "Projéteis com efeitos caóticos.", effectId: 'absurdo_asc1', finalNodeTarget: 'A'},
            { level: 2, text: "Paradoxo Ambulante (Nv. 2)", fullDesc: "Sua própria existência distorce a realidade ao seu redor, fazendo com que o inesperado se torne a norma.", effectDesc: "Inimigos próximos podem ficar confusos. Sua velocidade é imprevisível.", effectId: 'absurdo_asc2', finalNodeTarget: 'B'},
            { level: 3, text: "Glitch na Matrix (Nv. 3)", fullDesc: "Torne-se um erro fundamental no sistema, quebrando suas regras e explorando suas falhas.", effectDesc: "Teleporte aleatório ao ser atingido. Chance de duplicar projéteis.", effectId: 'absurdo_asc3', finalNodeTarget: 'C'}
        ]
    },
    'Transcendência': {
        displayName: "Transcendência",
        minor: ["A realidade digital parece mais fluida, maleável à sua percepção.", "As fronteiras do 'eu' codificado começam a se dissolver na vastidão da rede.", "Você vislumbra a arquitetura subjacente do sistema, além das ilusões."],
        majorBoss: "O Nó Górdio do Ego Fragmentado", 
        visualTheme: { overlayGradient: 'rgba(8, 145, 178, 0.1)', pulseColor: '#22d3ee'},
        endings: [
            { title: "A Dissolução Pacífica do Ego", desc: "Seraph aceita que seu \"eu\" é uma ilusão. Ele voluntariamente se deixa ser deletado, entendendo que não é um fim, mas uma reintegração ao todo. A tela fica branca e uma mensagem de paz aparece." },
            { title: "O Viajante Entre Realidades", desc: "Seraph aprende a lição do sistema. Ele não se dissolve, mas se transforma. Ele se torna um \"viajante\" capaz de sair da simulação e observar outras realidades, um ser de pura consciência." },
            { title: "O Sonhador do Novo Sonho", desc: "Seraph atinge um estado de lucidez tão profundo que ele começa a sonhar sua própria realidade digital dentro do sistema, um mundo nascido de sua consciência transcendida, convidando outros a explorá-lo."}
        ],
        hubCombatPreamble: [ 
            "Os Tentáculos Etéreos e Ecos Psiônicos se harmonizaram com sua frequência.",
            "Este domínio de pura informação agora ressoa com sua consciência expandida."
        ],
        ascensionNodeTitle: "Câmara da Ascensão da Transcendência",
        ascensionPreamble: [ 
            "A vibração da batalha da Ascensão abre portais para o além. Você está à beira de ultrapassar as barreiras da forma.", 
            "Escolha o caminho para sua existência além dos limites."
        ],
        ascensionChoices: [
            { level: 1, text: "Fluxo Etéreo (Nv. 1)", fullDesc: "Desprenda-se das amarras físicas, movendo-se através da realidade como um fantasma.", effectDesc: "Atravessa inimigos/projéteis após pular. Pulos mais altos.", effectId: 'transcendencia_asc1', finalNodeTarget: 'A'},
            { level: 2, text: "Eco Cósmico (Nv. 2)", fullDesc: "Sua consciência ressoa com a energia do universo digital, manifestando poder psíquico.", effectDesc: "Projéteis criam explosões psíquicas secundárias.", effectId: 'transcendencia_asc2', finalNodeTarget: 'B'},
            { level: 3, text: "Realidade Maleável (Nv. 3)", fullDesc: "Imponha sua vontade sobre as leis do sistema, dobrando-as para seus próprios fins.", effectDesc: "Reduz recargas de habilidades. Chance de resetar recarga ao usar.", effectId: 'transcendencia_asc3', finalNodeTarget: 'C'}
        ]
    }
};

export const ENDING_STAFF_UNLOCK_MAP: Record<string, string> = { 
  "Vingança Absoluta": BOOMSTAFF_ID,
  "Ciclo de Ódio Eterno": BOOMSTAFF_ID, 
  "Trono de Cinzas": FLESH_WEAVER_STAFF_ID, 
  "O Novo Arquiteto": TRIDENT_STAFF_ID,
  "Desconexão Epifânica": TRIDENT_STAFF_ID,
  "A Biblioteca Infinita": REALITY_BENDER_STAFF_ID, 
  "Testemunha da Loucura Primordial": THUNDER_STAFF_ID,
  "O Arauto Silencioso do Caos": THUNDER_STAFF_ID,
  "Sinfonia da Dissonância": VOID_GAZE_STAFF_ID, 
  "Assimilado pela Máquina Viva": FROZEN_TIP_STAFF_ID,
  "A Peça Final da Arte Grotesca": FROZEN_TIP_STAFF_ID,
  "O Jardim de Carne Digital": FLESH_WEAVER_STAFF_ID, 
  "O Guardião do Jardim Secreto": EMERALD_STAFF_ID,
  "O Farol para Outros": EMERALD_STAFF_ID,
  "A Semente da Mudança": GILDED_AEGIS_STAFF_ID, 
  "Férias Eternas com o SysAdmin": RAINBOW_STAFF_ID,
  "Quebrando a Quarta Parede... Literalmente": RAINBOW_STAFF_ID,
  "O Erro que Virou Recurso": CHAOS_ORB_STAFF_ID, 
  "A Dissolução Pacífica do Ego": COSMIC_ECHO_STAFF_ID, 
  "O Viajante Entre Realidades": COSMIC_ECHO_STAFF_ID,
  "O Sonhador do Novo Sonho": NEXUS_KEY_STAFF_ID, 
};


export const INITIAL_AFFINITIES: Record<AffinityName, number> = {
    'Vingança': 0, 'Intelecto': 0, 'Abismo': 0, 'Carne': 0, 'Esperança': 0, 'Absurdo': 0, 'Transcendência': 0,
};

const createChoice = (id: string, text: string, fullDesc: string, effectDesc: string, leadsTo: NarrativeNodeId, affinity: AffinityImpact, grantsEffectId?: string, dialogue?: string[], setsAscensionLevel?: AscensionLevel, setsAscensionAffinity?: AffinityName): NarrativeChoiceDefinition => ({
    id, choiceText: text, fullDescription: fullDesc, effectDescription: effectDesc, leadsToNode: leadsTo, affinityBoost: affinity, grantsEffectId, dialogueResponse: dialogue, setsAscensionLevel, setsAscensionAffinity
});

const normalizeAffinityForId = (affinityName: AffinityName): string => {
    return affinityName
        .normalize('NFD') 
        .replace(/[\u0300-\u036f]/g, '') 
        .toUpperCase(); 
};


const createAffinityHubNode = (affinityName: AffinityName, leadsToAscensionNode: NarrativeNodeId): NarrativeNodeDefinition => ({
    id: `${normalizeAffinityForId(affinityName)}_HUB` as NarrativeNodeId,
    title: NARRATIVE_PATHS_DISPLAY_NAMES[affinityName] + " - Limiar da Afinidade",
    speaker: "Concept", 
    dialoguePreamble: AFFINITY_NARRATIVES[affinityName].hubCombatPreamble, 
    triggerCombatScenesCompleted: 0, 
    choices: [
        createChoice(`${normalizeAffinityForId(affinityName)}_HUB_C1`, `Contemplar a Ascensão da ${affinityName}.`, 
          `Mergulhe ainda mais na essência da ${affinityName}, confrontando seu verdadeiro poder.`, 
          `Sua ressonância com ${affinityName} o guiará para a próxima transformação.`, 
          leadsToAscensionNode, { [affinityName]: AFFINITY_BOOST_MAJOR_CHOICE / 2 }, undefined, [`Seraph: "Este caminho... devo vê-lo até o fim."`], undefined, affinityName),
    ]
});

const createAffinityAscensionNode = (affinityName: AffinityName): NarrativeNodeDefinition => {
    const details = AFFINITY_NARRATIVES[affinityName];
    const normalizedIdPart = normalizeAffinityForId(affinityName);
    return {
        id: `${normalizedIdPart}_ASCENSION` as NarrativeNodeId,
        title: details.ascensionNodeTitle,
        speaker: "Concept",
        dialoguePreamble: details.ascensionPreamble,
        triggerCombatScenesCompleted: 0, 
        isAscensionNode: true,
        choices: details.ascensionChoices.map(ascChoice => {
            const targetNodeId = `${normalizedIdPart}_FINAL_${ascChoice.finalNodeTarget}` as NarrativeNodeId;
            return createChoice(
                `${normalizedIdPart}_ASC_C${ascChoice.level}`, 
                ascChoice.text,
                ascChoice.fullDesc,
                ascChoice.effectDesc,
                targetNodeId, 
                { [affinityName]: AFFINITY_BOOST_ASCENSION_CHOICE },
                ascChoice.effectId,
                undefined, 
                ascChoice.level,
                affinityName 
            );
        })
    };
};


const createAffinityFinalNode = (affinityName: AffinityName, finalLetter: 'A' | 'B' | 'C'): NarrativeNodeDefinition => {
    const normalizedIdPart = normalizeAffinityForId(affinityName);
    const nodeId = `${normalizedIdPart}_FINAL_${finalLetter}` as NarrativeNodeId;
    
    return {
        id: nodeId, 
        title: AFFINITY_NARRATIVES[affinityName].endings[finalLetter === 'A' ? 0 : finalLetter === 'B' ? 1 : 2].title,
        speaker: "System",
        dialoguePreamble: [ 
            "ANÁLISE DE DESFECHO...",
            `Afinidade dominante: ${affinityName}. Nível de Ascensão: [PlayerAscensionLevel].`, 
            `Desfecho alcançado: ${AFFINITY_NARRATIVES[affinityName].endings[finalLetter === 'A' ? 0 : finalLetter === 'B' ? 1 : 2].title}.`,
            `Protocolo ${AFFINITY_NARRATIVES[affinityName].majorBoss} finalizado.`
        ],
        isTerminal: true, 
        triggerCombatScenesCompleted: 0, 
    };
};

const vingancaHubNodeDef = createAffinityHubNode('Vingança', 'VINGANCA_ASCENSION');
const intelectoHubNodeDef = createAffinityHubNode('Intelecto', 'INTELECTO_ASCENSION');
const abismoHubNodeDef = createAffinityHubNode('Abismo', 'ABISMO_ASCENSION');
const carneHubNodeDef = createAffinityHubNode('Carne', 'CARNE_ASCENSION');
const esperancaHubNodeDef = createAffinityHubNode('Esperança', 'ESPERANCA_ASCENSION');
const absurdoHubNodeDef = createAffinityHubNode('Absurdo', 'ABSURDO_ASCENSION');
const transcendenciaHubNodeDef = createAffinityHubNode('Transcendência', 'TRANSCENDENCIA_ASCENSION');

export const NARRATIVE_TREE_BASE: Record<NarrativeNodeId, NarrativeNodeDefinition> = {
  'ROOT': { 
    id: 'ROOT', 
    title: "Início da Anomalia", 
    triggerCombatScenesCompleted: 0,
    speaker: "System",
    dialoguePreamble: [ 
        "Protocolos de contenção iniciais falharam. Anomalia 'Seraph' demonstra capacidade de combate.",
        "Desvios de fluxo de dados primários disponíveis. Escolha uma trajetória."
    ],
    choices: [ 
      createChoice('ROOT_C_ALPHA', "Analisar Anomalias Imediatas.", 
        "\"Preciso entender as falhas mais próximas para ganhar vantagem.\"", 
        "Foco em conhecimento tático e defesa.", 
        'DECISION_POINT_ALPHA', { 'Intelecto': 2 }, 'resist', 
        ["Seraph: \"Respostas. Agora.\""]
      ),
      createChoice('ROOT_C_BETA', "Investigar Fonte Energética Estranha.", 
        "\"Sinto uma assinatura incomum. Pode ser perigoso, ou uma oportunidade.\"", 
        "Atração por uma leitura de energia não convencional.", 
        'DECISION_POINT_BETA', { 'Abismo': 1, 'Transcendência': 1 }, 'souls', 
        ["Seraph: \"Este sentimento... O que está por trás disso?\""]
      ),
      createChoice('ROOT_C_ATTRIB', "Reforçar Parâmetros Básicos.",
        "\"Uma base sólida é essencial para qualquer sistema.\"",
        "Acesso a pequenos aprimoramentos de atributos.",
        'NODE_ATTRIB_BOOST_1', { 'Intelecto': 0.5, 'Esperança': 0.5 }, undefined,
        ["Seraph: \"Cada pequena vantagem conta.\""]
      ),
    ]
  }, 
  'DECISION_POINT_ALPHA': {
    id: 'DECISION_POINT_ALPHA',
    title: "Análise Tática Primária",
    triggerCombatScenesCompleted: 0,
    speaker: "System",
    dialoguePreamble: [ 
        "Hostilidades digitais superadas. Análise de dados imediatos sugere múltiplas vulnerabilidades e oportunidades.",
        "Sua próxima decisão definirá seu modus operandi."
    ],
    choices: [
        createChoice('DPA_C1', "Foco em Confronto Direto.",
          "Priorizar a capacidade de combate. A melhor defesa é um ataque esmagador.",
          "Aumenta o Dano do Projétil.",
          'NODE_A', { 'Vingança': AFFINITY_BOOST_MAJOR_CHOICE * 0.5 }, 'catalyst',
          ["Seraph: \"Se algo se opõe, será destruído.\""]
        ),
        createChoice('DPA_C2', "Adaptabilidade e Mobilidade.",
          "Priorizar a capacidade de se mover e se adaptar rapidamente às ameaças.",
          "Aumenta a Velocidade de Movimento.",
          'NODE_X', { 'Absurdo': AFFINITY_BOOST_MAJOR_CHOICE * 0.5, 'Transcendência': AFFINITY_BOOST_MAJOR_CHOICE * 0.3 }, 'swift',
          ["Seraph: \"Não posso ser atingido se não puderem me alcançar.\""]
        ),
    ]
  },
  'DECISION_POINT_BETA': {
    id: 'DECISION_POINT_BETA',
    title: "Eco de Energia Misteriosa",
    triggerCombatScenesCompleted: 0,
    speaker: "CorruptedEcho",
    dialoguePreamble: [ 
        "A entidade energética foi silenciada. Sua presença parece ressoar com este lugar... de formas que você ainda não compreende."
    ],
    choices: [
        createChoice('DPB_C1', "Mergulhar na Essência Vital.",
          "Explorar a conexão com a matéria orgânica simulada, buscando força na resiliência.",
          "Aumenta a Vida Máxima.",
          'NODE_Y', { 'Carne': AFFINITY_BOOST_MAJOR_CHOICE * 0.5 }, 'growth',
          ["Seraph: \"Se há vida aqui, encontrarei sua força... ou sua fraqueza.\""]
        ),
        createChoice('DPB_C2', "Buscar a Harmonia Oculta.",
          "Tentar encontrar um propósito ou sentido maior por trás da corrupção, buscando um caminho de restauração.",
          "Cura completamente.",
          'ESPERANCA_HUB', { 'Esperança': AFFINITY_BOOST_MAJOR_CHOICE + 5, 'Intelecto': 2 }, 'renew', 
          ["Seraph: \"Talvez haja uma cura para esta loucura.\""]
        ),
    ]
  },
  'NODE_X': {
    id: 'NODE_X',
    title: "Trilha da Esquiva Ágil",
    triggerCombatScenesCompleted: 0,
    speaker: "AlliedAI",
    dialoguePreamble: [ 
        "Ameaças ágeis neutralizadas. Sua agilidade é notável. O sistema se esforça para prever seus movimentos.",
        "Como você usará essa vantagem evasiva?"
    ],
    choices: [
        createChoice('NX_C1', "Transformar Defesa em Ataque.",
            "Usar a mobilidade para criar aberturas e contra-ataques precisos.",
            "Aumenta a Chance de Crítico.",
            'NODE_B', { 'Vingança': 3, 'Absurdo': 2 }, 'eyesight',
            ["Seraph: \"Cada esquiva é uma chance de atacar.\""]
        ),
        createChoice('NX_C2', "Explorar Limites Dimensionais.",
            "Levar a mobilidade ao extremo, buscando transcender as barreiras físicas.",
            "Aumenta a Altura do Pulo.",
            'TRANSCENDENCIA_HUB', { 'Transcendência': AFFINITY_BOOST_MAJOR_CHOICE + 3, 'Absurdo': 2 }, 'impulse',
            ["Seraph: \"As leis da física aqui são... sugestões.\""]
        ),
        createChoice('NX_C_ATTRIB', "Otimizar Parâmetros de Esquiva.",
            "Refinar ainda mais a capacidade de evasão.",
            "Acesso a pequenos aprimoramentos de atributos defensivos ou de mobilidade.",
            'NODE_ATTRIB_BOOST_2', { 'Absurdo': 0.5, 'Transcendência': 0.5 }, undefined,
            ["Seraph: \"A perfeição está nos detalhes.\""]
        ),
    ]
  },
  'NODE_Y': {
    id: 'NODE_Y',
    title: "Fortaleza Orgânica Digital",
    triggerCombatScenesCompleted: 0,
    speaker: "Concept",
    dialoguePreamble: [ 
        "Resistência orgânica subjugada. Sua afinidade com a matéria digital cresce.",
        "O sistema reage a essa anomalia biológica com... curiosidade e repulsa."
    ],
    choices: [
        createChoice('NY_C1', "Fortalecer o Invólucro.",
            "Tornar seu avatar mais resistente, uma fortaleza de carne e código.",
            "Aumenta a Defesa.",
            'NODE_C', { 'Intelecto': 3, 'Carne': 2 }, 'resist',
            ["Seraph: \"Minha forma é minha arma e meu escudo.\""]
        ),
        createChoice('NY_C2', "Abraçar a Fome.",
            "Consumir a essência dos inimigos para se fortalecer, uma simbiose predatória.",
            "Concede Roubo de Vida.",
            'CARNE_HUB', { 'Carne': AFFINITY_BOOST_MAJOR_CHOICE + 3, 'Abismo': 2 }, 'leech',
            ["Seraph: \"Eu me tornarei o predador alfa neste ecossistema.\""]
        ),
    ]
  },
  'NODE_A': { 
    id: 'NODE_A', 
    title: "Anomalia Tática Primária", 
    triggerCombatScenesCompleted: 0, 
    speaker: "System",
    dialoguePreamble: [ 
        "Primeira linha de defesa superada. Anomalia de dados processada. Diretriz primária de combate estabelecida.",
        "Novas reconfigurações disponíveis. O sistema se adapta à sua eficiência destrutiva."
    ],
    choices: [
      createChoice('NODE_A_C1_REVISED', "Intensificar Ofensiva.", 
        "Dobrar a aposta na capacidade de destruição, buscando o domínio absoluto.", 
        "Aumenta Chance de Crítico.", 
        'NODE_B', { 'Vingança': AFFINITY_BOOST_MAJOR_CHOICE }, 'eyesight',
        ["Seraph: \"Não haverá trégua.\""]
      ),
      createChoice('NODE_A_C2_REVISED', "Diversificar Táticas.", 
        "Explorar abordagens não convencionais, surpreendendo o sistema com o inesperado.", 
        "Aumenta a Perfuração de Projétil.", 
        'DECISION_POINT_GAMMA', { 'Intelecto': AFFINITY_BOOST_MAJOR_CHOICE * 0.7, 'Absurdo': AFFINITY_BOOST_MAJOR_CHOICE * 0.5 }, 'stability',
        ["Seraph: \"A previsibilidade é uma fraqueza.\""]
      ),
      createChoice('NODE_A_C3_MAINTAINED', "Abraçar o Caos Imediato.", 
        "Desafiar os limites da simulação agora, buscar o poder no imprevisível.", 
        "Aumenta a Velocidade de Movimento.", 
        'ABSURDO_HUB', { 'Absurdo': AFFINITY_BOOST_MAJOR_CHOICE + 5, 'Vingança': 2 }, 'swift_plus', 
        ["Seraph: \"As regras são apenas um convite para a desordem.\""]
      )
    ]
  },
  'DECISION_POINT_GAMMA': {
    id: 'DECISION_POINT_GAMMA',
    title: "Encruzilhada da Inovação Estratégica",
    triggerCombatScenesCompleted: 0,
    speaker: "AlliedAI",
    dialoguePreamble: [ 
        "Inimigos adaptativos derrotados. Sua capacidade de inovação é... intrigante. O sistema não foi projetado para tal flexibilidade.",
        "Qual nova estratégia você empregará?"
    ],
    choices: [
        createChoice('DPG_C1', "Maestria Defensiva.",
          "Concentrar-se em se tornar inexpugnável, uma muralha contra a corrupção.",
          "Aumenta a Vida Máxima.",
          'NODE_C', { 'Intelecto': 3, 'Esperança': 2 }, 'growth_plus',
          ["Seraph: \"Sobreviver é o primeiro passo para a vitória.\""]
        ),
        createChoice('DPG_C2', "Exploração do Abissal.",
          "Investigar as profundezas mais sombrias do sistema, buscando poder no proibido.",
          "Chance de derrubar orbes de alma.",
          'ABISMO_HUB', { 'Abismo': AFFINITY_BOOST_MAJOR_CHOICE + 3, 'Intelecto': 2 }, 'souls',
          ["Seraph: \"Há poder no que o sistema teme.\""]
        ),
        createChoice('DPG_C_ATTRIB', "Calibrar Sub-rotinas.",
          "Ajustar finamente os parâmetros de combate para máxima eficiência.",
          "Acesso a pequenos aprimoramentos de atributos.",
          'NODE_ATTRIB_BOOST_3', { 'Intelecto': 1 }, undefined,
          ["Seraph: \"A eficiência é a chave.\""]
        ),
    ]
  },
  'NODE_B': { 
    id: 'NODE_B', 
    title: "Repercussões da Agressão", 
    triggerCombatScenesCompleted: 0, 
    speaker: "CorruptedEcho",
    dialoguePreamble: [ 
        "A resposta violenta do sistema foi contida. Sua fúria ecoa. O sistema responde com protocolos de defesa distorcidos.",
        "Eles te veem como uma falha. Como você procederá?"
    ],
    choices: [
      createChoice('B1_REVISED', "Desmantelar a Lógica Hostil.", 
        "\"Se este sistema é feito de regras, vou encontrar suas falhas e quebrá-las.\"", 
        "Foco em dissecar e explorar as vulnerabilidades.", 
        'INTELECTO_HUB', { 'Intelecto': AFFINITY_BOOST_MAJOR_CHOICE, 'Vingança': 2 }, 'appraisal',
        ["Seraph: \"Nenhum código é perfeito.\""]
      ),
      createChoice('B2_MAINTAINED', "Caçar a Origem da Corrupção.", 
        "\"Alguém me trouxe aqui. Arrancarei respostas da fonte.\"", 
        "Determinação em encontrar o responsável.", 
        'VINGANCA_HUB', { 'Vingança': AFFINITY_BOOST_MAJOR_CHOICE + 5 }, 'rage',
        ["Seraph: \"Eu encontrarei quem está por trás disso.\""]
       ),
      createChoice('B3_REVISED', "Absorver a Essência Biomecânica.", 
        "\"Se sou uma praga, vou me banquetear até me tornar o jardim.\"", 
        "Busca por poder através da assimilação.", 
        'CARNE_HUB', { 'Carne': AFFINITY_BOOST_MAJOR_CHOICE, 'Vingança': 2 }, 'growth_plus',
        ["Seraph: \"O que não me destrói, me torna... algo mais.\""]
      )
    ]
  },
  'NODE_C': {
    id: 'NODE_C', 
    title: "Reflexão Estratégica", 
    triggerCombatScenesCompleted: 0, 
    speaker: "AlliedAI",
    dialoguePreamble: [ 
        "Ameaças calculistas neutralizadas. Sua abordagem é... diferente. Menos destrutiva, mais ponderada.",
        "O sistema é vasto. O que você espera encontrar?"
    ],
    choices: [
      createChoice('C1_MAINTAINED', "Buscar um Propósito Construtivo.", 
        "\"Mesmo neste caos, deve haver algo que valha a pena proteger.\"", 
        "Procura por significado e um resultado positivo.", 
        'ESPERANCA_HUB', { 'Esperança': AFFINITY_BOOST_MAJOR_CHOICE, 'Intelecto': 2 }, 'orb',
        ["Seraph: \"Talvez haja uma saída. Ou talvez eu possa criar uma.\""]
      ),
      createChoice('C2_REVISED', "Confrontar o Horror Incompreensível.", 
        "\"A lógica deste lugar me escapa. É alienígena. Mas não posso ignorá-la.\"", 
        "Atração pelo mistério e o incompreensível.", 
        'ABISMO_HUB', { 'Abismo': AFFINITY_BOOST_MAJOR_CHOICE, 'Intelecto': 2 }, 'will_o_wisp',
        ["Seraph: \"O que quer que esteja no coração disso, eu o enfrentarei.\""]
      ),
      createChoice('C3_MAINTAINED', "Transcender as Limitações Digitais.", 
        "\"E se 'eu' for apenas uma variável? A resposta está além da minha forma atual.\"", 
        "Busca por uma consciência que transcenda o digital.", 
        'TRANSCENDENCIA_HUB', { 'Transcendência': AFFINITY_BOOST_MAJOR_CHOICE, 'Intelecto': 2 }, 'gush',
        ["Seraph: \"As correntes da realidade podem ser quebradas.\""]
      )
    ]
  },

  // Attribute Boost Nodes
  'NODE_ATTRIB_BOOST_1': {
    id: 'NODE_ATTRIB_BOOST_1', title: "Fonte de Energia Sutil", isAttributeBoostNode: true,
    dialoguePreamble: ["Uma pequena anomalia energética oferece uma oportunidade de calibração."],
    choices: [
        createChoice('NAB1_C1', "Aumentar Potência Ofensiva.", "", "Dano do Projétil +1", 'DECISION_POINT_ALPHA', {}, 'attr_dmg_s'), 
        createChoice('NAB1_C2', "Reforçar Integridade Estrutural.", "", "Vida Máxima +5", 'DECISION_POINT_ALPHA', {}, 'attr_hp_s'),
    ]
  },
  'NODE_ATTRIB_BOOST_2': {
    id: 'NODE_ATTRIB_BOOST_2', title: "Dados de Mobilidade Fragmentados", isAttributeBoostNode: true,
    dialoguePreamble: ["Fragmentos de código de mobilidade podem ser assimilados."],
    choices: [
        createChoice('NAB2_C1', "Otimizar Algoritmos de Movimento.", "", "Velocidade +5%", 'NODE_B', {}, 'attr_spd_s'),
        createChoice('NAB2_C2', "Melhorar Protocolos de Evasão.", "", "Chance Crítica +2%", 'NODE_B', {}, 'attr_crit_c_s'),
    ]
  },
    'NODE_ATTRIB_BOOST_3': {
    id: 'NODE_ATTRIB_BOOST_3', title: "Cache de Defesa Descoberto", isAttributeBoostNode: true,
    dialoguePreamble: ["Um cache de dados contendo sub-rotinas defensivas foi encontrado."],
    choices: [
        createChoice('NAB3_C1', "Fortalecer Blindagem.", "", "Defesa +2%", 'NODE_C', {}, 'attr_def_s'),
        createChoice('NAB3_C2', "Aprimorar Resiliência.", "", "Vida Máxima +5", 'NODE_C', {}, 'attr_hp_s'),
    ]
  },

  'VINGANCA_HUB': vingancaHubNodeDef,
  'INTELECTO_HUB': intelectoHubNodeDef,
  'ABISMO_HUB': abismoHubNodeDef,
  'CARNE_HUB': carneHubNodeDef,
  'ESPERANCA_HUB': esperancaHubNodeDef,
  'ABSURDO_HUB': absurdoHubNodeDef,
  'TRANSCENDENCIA_HUB': transcendenciaHubNodeDef,

  'VINGANCA_ASCENSION': createAffinityAscensionNode('Vingança'),
  'INTELECTO_ASCENSION': createAffinityAscensionNode('Intelecto'),
  'ABISMO_ASCENSION': createAffinityAscensionNode('Abismo'),
  'CARNE_ASCENSION': createAffinityAscensionNode('Carne'),
  'ESPERANCA_ASCENSION': createAffinityAscensionNode('Esperança'),
  'ABSURDO_ASCENSION': createAffinityAscensionNode('Absurdo'),
  'TRANSCENDENCIA_ASCENSION': createAffinityAscensionNode('Transcendência'),

  'VINGANCA_FINAL_A': createAffinityFinalNode('Vingança', 'A'), 
  'VINGANCA_FINAL_B': createAffinityFinalNode('Vingança', 'B'),
  'VINGANCA_FINAL_C': createAffinityFinalNode('Vingança', 'C'),
  'INTELECTO_FINAL_A': createAffinityFinalNode('Intelecto', 'A'),
  'INTELECTO_FINAL_B': createAffinityFinalNode('Intelecto', 'B'),
  'INTELECTO_FINAL_C': createAffinityFinalNode('Intelecto', 'C'),
  'ABISMO_FINAL_A': createAffinityFinalNode('Abismo', 'A'),
  'ABISMO_FINAL_B': createAffinityFinalNode('Abismo', 'B'),
  'ABISMO_FINAL_C': createAffinityFinalNode('Abismo', 'C'),
  'CARNE_FINAL_A': createAffinityFinalNode('Carne', 'A'),
  'CARNE_FINAL_B': createAffinityFinalNode('Carne', 'B'),
  'CARNE_FINAL_C': createAffinityFinalNode('Carne', 'C'),
  'ESPERANCA_FINAL_A': createAffinityFinalNode('Esperança', 'A'),
  'ESPERANCA_FINAL_B': createAffinityFinalNode('Esperança', 'B'),
  'ESPERANCA_FINAL_C': createAffinityFinalNode('Esperança', 'C'),
  'ABSURDO_FINAL_A': createAffinityFinalNode('Absurdo', 'A'),
  'ABSURDO_FINAL_B': createAffinityFinalNode('Absurdo', 'B'),
  'ABSURDO_FINAL_C': createAffinityFinalNode('Absurdo', 'C'),
  'TRANSCENDENCIA_FINAL_A': createAffinityFinalNode('Transcendência', 'A'),
  'TRANSCENDENCIA_FINAL_B': createAffinityFinalNode('Transcendência', 'B'),
  'TRANSCENDENCIA_FINAL_C': createAffinityFinalNode('Transcendência', 'C'),
  
  'Vingança': vingancaHubNodeDef,
  'Intelecto': intelectoHubNodeDef,
  'Abismo': abismoHubNodeDef,
  'Carne': carneHubNodeDef,
  'Esperança': esperancaHubNodeDef,
  'Absurdo': absurdoHubNodeDef,
  'Transcendência': transcendenciaHubNodeDef,
};

export const NARRATIVE_TREE: Record<NarrativeNodeId, NarrativeNodeDefinition> = { ...NARRATIVE_TREE_BASE };

interface ThematicEnemyBase {
  hp: number;
  speed: number;
  width: number;
  height: number;
  baseDamage: number; 
  attackCooldown: number;
  visuals: {
    shapeClass: string; 
    gradientFrom: string; 
    gradientTo: string;   
    neonShadowColor: string; 
    coreClass?: string; 
  };
  projectileType?: ProjectileState['type'];
  behaviorProps?: Record<string, any>;
  narrativeName: string; 
  narrativeDesc?: string; 
  sfx?: { 
      spawn?: string;
      hit?: string;
      death?: string;
      attack?: string;
  }
}

export const THEMATIC_ENEMY_DATA: Record<EnemyTypeKey, ThematicEnemyBase> = {
  'basic_flyer': { 
    hp: 30, speed: 1.6, width: 40, height: 40, baseDamage: 10, attackCooldown: 2400,
    visuals: { shapeClass: 'rounded-lg', gradientFrom: 'from-slate-400', gradientTo: 'to-slate-600', neonShadowColor: 'rgba(150,150,180,0.6)' },
    projectileType: 'standard', behaviorProps: { bobbingMovement: true, pauseToShoot: true },
    narrativeName: "Drone de Patrulha Básico", sfx: { death: 'enemy_death_basic', attack: 'enemy_attack_basic' }
  },
  'dasher': {
    hp: 45, speed: 0, width: 35, height: 35, baseDamage: 0, attackCooldown: ENEMY_DASH_COOLDOWN + 700, 
    visuals: { shapeClass: 'rounded-sm', gradientFrom: 'from-gray-500', gradientTo: 'to-gray-700', neonShadowColor: 'rgba(180,180,180,0.6)'},
    behaviorProps: { 
      dashSpeed: ENEMY_DASH_SPEED, dashDuration: ENEMY_DASH_DURATION, dashCooldownTime: ENEMY_DASH_COOLDOWN, 
      prepareDashDuration: ENEMY_PREPARE_DASH_DURATION, contactDamage: 20, telegraphDash: true,
    },
    narrativeName: "Unidade de Investida Rápida", sfx: { death: 'enemy_death_basic' }
  },
  'vinganca_estilhaco': {
    hp: 48, speed: 2.8, width: 30, height: 45, baseDamage: 15, attackCooldown: 1600,
    visuals: { shapeClass: 'transform -skew-x-12', gradientFrom: 'from-red-500', gradientTo: 'to-rose-700', neonShadowColor: 'rgba(255,50,50,0.7)', coreClass: 'w-1/3 h-1/5 bg-red-200 rotate-45' },
    projectileType: 'sharp_shot', behaviorProps: { erraticMovement: true, sharpShotSpeed: ENEMY_PROJECTILE_SPEED + 2.2, predictiveAimFactor: 0.25, aggressivePursuit: true },
    narrativeName: "Estilhaço da Ira", sfx: { death: 'enemy_death_vinganca' }
  },
  'vinganca_executor': {
    hp: 95, speed: 1.6, width: 50, height: 50, baseDamage: 24, attackCooldown: 2500, 
    visuals: { shapeClass: 'rounded-md border-4 border-red-800', gradientFrom: 'from-red-700', gradientTo: 'to-black', neonShadowColor: 'rgba(200,0,0,0.8)' },
    projectileType: 'standard', behaviorProps: { burstMove: true, burstMoveCooldown: 3000, burstSpeedFactor: 3.8, projectileSpread: 3, contactDamage: 28, shortLungeAttack: true, lungeSpeed: 7.5, lungeRange: 110, lungeCooldown: 3800, menacingPresence: true },
    narrativeName: "Executor da Vingança", sfx: { death: 'enemy_death_vinganca' }
  },
  'vinganca_boss_ira': {
    hp: 550, speed: 1.4, width: 80, height: 80, baseDamage: 38, attackCooldown: 1400, 
    visuals: { shapeClass: 'rounded-xl border-8 border-red-900', gradientFrom: 'from-red-600', gradientTo: 'to-black', neonShadowColor: 'rgba(255,0,0,0.9)', coreClass: 'bg-orange-400 w-1/2 h-1/2 animate-pulse' },
    projectileType: 'wave_shot', behaviorProps: { isBoss: true, multiShotAngle: 0.5, specialAttackCooldown: 5000, specialAttackType: 'area_burst_vinganca', secondSpecialAttack: 'chains_of_retribution', secondSpecialCooldown: 8500, enragePhaseHpThreshold: 0.50, enrageSpeedMultiplier: 1.35, enrageDamageMultiplier: 1.25, bossRoar: true, predictiveAimingFactor: 0.75 },
    narrativeName: "Avatar da Ira Desenfreada", sfx: { death: 'boss_roar' }
  },
  'intelecto_sonda': {
    hp: 40, speed: 2.0, width: 35, height: 35, baseDamage: 12, attackCooldown: 2000,
    visuals: { shapeClass: 'rounded-full', gradientFrom: 'from-sky-400', gradientTo: 'to-blue-600', neonShadowColor: 'rgba(50,150,255,0.7)', coreClass: 'bg-sky-100 w-1/3 h-1/3 animate-spin-slow' },
    projectileType: 'standard', behaviorProps: { patrolPattern: 'box', patrolPoints: [{x:100,y:80},{x:GAME_WIDTH-150,y:80},{x:GAME_WIDTH-150,y:220},{x:100,y:220}], preciseShot: true, stopToAim: true },
    narrativeName: "Sonda Analítica"
  },
  'intelecto_glitch': {
    hp: 58, speed: 1.7, width: 40, height: 40, baseDamage: 15, attackCooldown: 2600,
    visuals: { shapeClass: 'rounded-sm opacity-90', gradientFrom: 'from-cyan-500', gradientTo: 'to-teal-700', neonShadowColor: 'rgba(0,200,200,0.7)' },
    projectileType: 'standard', behaviorProps: { shortTeleport: true, teleportCooldown: 3000, teleportRange: 240, teleportVisualDuration: 130, unpredictableTeleport: true },
    narrativeName: "Anomalia de Dados (Glitch)"
  },
  'intelecto_protocol_sentry': { 
    hp: 65, speed: 1.1, width: 45, height: 45, baseDamage: 11, attackCooldown: 2100,
    visuals: { shapeClass: 'border-4 border-blue-500', gradientFrom: 'from-blue-300', gradientTo: 'to-cyan-400', neonShadowColor: 'rgba(0,180,255,0.7)', coreClass: 'w-2/5 h-2/5 bg-white animate-pulse' },
    projectileType: 'sharp_shot', behaviorProps: { createsFirewalls: true, firewallDuration: 4200, firewallCooldown: 7200, firewallWidth: 85, firewallHeight: 12, defensiveReposition: true },
    narrativeName: "Sentinela de Protocolo"
  },
  'intelecto_boss_core': {
    hp: 520, speed: 0.8, width: 70, height: 70, baseDamage: 30, attackCooldown: 1800, 
    visuals: { shapeClass: 'rounded-full border-4 border-blue-700', gradientFrom: 'from-blue-400', gradientTo: 'to-cyan-600', neonShadowColor: 'rgba(0,150,255,0.9)' },
    projectileType: 'beam_charge', behaviorProps: { isBoss: true, chargeBeamTime: 900, beamDuration: 480, shieldPhases: true, summonMinions: 'intelecto_sonda', summonCooldown: 8500, specialAttackType: 'logic_bomb_aoe', specialAttackCooldown: 7000, calculatedMovement: true, predictiveAimingFactor: 0.75 },
    narrativeName: "Núcleo Lógico Central", sfx: { death: 'boss_roar' }
  },
  'abismo_tentaculo': {
    hp: 75, speed: 1.5, width: 30, height: 70, baseDamage: 17, attackCooldown: 2400,
    visuals: { shapeClass: 'rounded-t-full rounded-b-lg', gradientFrom: 'from-purple-600', gradientTo: 'to-indigo-800', neonShadowColor: 'rgba(120,50,200,0.7)' },
    projectileType: 'wave_shot', behaviorProps: { wavyMovement: true, projectileHomingFactor: 0.05, projectileSpeed: ENEMY_PROJECTILE_SPEED - 0.4, risesFromGround: true },
    narrativeName: "Tentáculo do Abismo"
  },
  'abismo_olho': {
    hp: 55, speed: 1.0, width: 55, height: 55, baseDamage: 30, attackCooldown: 3600,
    visuals: { shapeClass: 'rounded-full border-4 border-purple-900', gradientFrom: 'from-fuchsia-700', gradientTo: 'to-violet-900', neonShadowColor: 'rgba(180,0,255,0.8)', coreClass: 'bg-red-500 w-1/2 h-1/2 rounded-full animate-pulse' },
    projectileType: 'beam_charge', behaviorProps: { chargeBeamTime: 1300, beamDuration: 380, beamSpeed: ENEMY_PROJECTILE_SPEED + 3.2, staysAtDistance: true, idealDistance: 340, piercingGaze: true },
    narrativeName: "Olho Vigilante do Vazio"
  },
  'abismo_boss_leviathan': {
    hp: 600, speed: 1.1, width: 90, height: 90, baseDamage: 40, attackCooldown: 2000, 
    visuals: { shapeClass: 'rounded-full opacity-80', gradientFrom: 'from-indigo-800', gradientTo: 'to-black', neonShadowColor: 'rgba(100,0,200,0.9)' },
    projectileType: 'slow_orb', behaviorProps: { isBoss: true, summonMinions: 'abismo_tentaculo', summonMinionCount: 2, summonCooldown: 6800, specialAttackType: 'vortex_pull', specialAttackCooldown: 7000, secondSpecialAttack: 'reality_tear_projectiles', secondSpecialCooldown: 9000, phasingMovement: true, predictiveAimingFactor: 0.75 },
    narrativeName: "Leviatã Abissal", sfx: { death: 'boss_roar' }
  },
   'carne_massa_instavel': { 
    hp: 100, speed: 1.1, width: 60, height: 60, baseDamage: 19, attackCooldown: 3100,
    visuals: { shapeClass: 'rounded-3xl', gradientFrom: 'from-orange-500', gradientTo: 'to-amber-700', neonShadowColor: 'rgba(255,150,50,0.7)'},
    projectileType: 'slow_orb', behaviorProps: { contactDamage: 30, spawnMinionsOnDeath: 2, minionType: 'carne_spawnling', lurchingMovement: true },
    narrativeName: "Massa Orgânica Instável"
  },
  'carne_unstable_growth': { 
    hp: 130, speed: 0.9, width: 70, height: 70, baseDamage: 0, attackCooldown: 99999, 
    visuals: { shapeClass: 'rounded-full animate-pulse', gradientFrom: 'from-amber-400', gradientTo: 'to-red-600', neonShadowColor: 'rgba(220,100,30,0.7)'},
    behaviorProps: { contactDamage: 25, splitsOnLowHealth: true, splitThreshold: 0.38, splitIntoType: 'carne_spawnling', splitCount: 3, pulsatingGrowth: true },
    narrativeName: "Crescimento Biomecânico Aberrante"
  },
  'carne_spawnling': { 
    hp: 40, speed: 2.9, width: 25, height: 25, baseDamage: 0, attackCooldown: 99999,
    visuals: { shapeClass: 'rounded-md', gradientFrom: 'from-red-400', gradientTo: 'to-orange-500', neonShadowColor: 'rgba(200,80,20,0.6)'},
    behaviorProps: { contactDamage: 15, erraticMovement: true, shortLifespan: 16000, swarmingBehavior: true },
    narrativeName: "Cria Biomecânica Menor"
  },
  'carne_boss_golem': {
    hp: 620, speed: 1.0, width: 100, height: 100, baseDamage: 42, attackCooldown: 2400, 
    visuals: { shapeClass: 'rounded-lg', gradientFrom: 'from-amber-600', gradientTo: 'to-orange-800', neonShadowColor: 'rgba(255,120,0,0.9)' },
    projectileType: 'standard', behaviorProps: { isBoss: true, groundSlamAttack: true, slamDamage: 55, slamCooldown: 6000, armorPlates: 3, armorHPPerPlate: 120, chargeAttack: true, chargeSpeed: 6.5, chargeCooldown: 8000, regeneratingArmor: true, predictiveAimingFactor: 0.75 },
    narrativeName: "Golem de Tecno-Carne", sfx: { death: 'boss_roar' }
  },
  'esperanca_sentinela': {
    hp: 65, speed: 1.8, width: 40, height: 60, baseDamage: 24, attackCooldown: 2800,
    visuals: { shapeClass: 'rounded-t-xl', gradientFrom: 'from-emerald-400', gradientTo: 'to-green-600', neonShadowColor: 'rgba(50,200,100,0.7)'},
    projectileType: 'beam_charge', behaviorProps: { chargeBeamTime: 750, beamSpeed: ENEMY_PROJECTILE_SPEED + 2.2, beamIsThin: true, protectiveStance: true },
    narrativeName: "Sentinela da Esperança"
  },
  'esperanca_aegis_orb': { 
    hp: 55, speed: 2.2, width: 35, height: 35, baseDamage: 0, attackCooldown: 99999, 
    visuals: { shapeClass: 'rounded-full border-2 border-yellow-300', gradientFrom: 'from-yellow-200', gradientTo: 'to-amber-300', neonShadowColor: 'rgba(250,220,50,0.8)', coreClass: 'bg-white w-1/2 h-1/2 animate-spin-slow' },
    behaviorProps: { buffsAllies: true, buffRadius: 220, buffAmountDefense: 0.12, fleeFromPlayer: true, priorityTarget: false },
    narrativeName: "Orbe de Égide Protetora"
  },
  'esperanca_boss_guardian': {
    hp: 500, speed: 1.5, width: 75, height: 75, baseDamage: 32, attackCooldown: 1900, 
    visuals: { shapeClass: 'rounded-full', gradientFrom: 'from-green-300', gradientTo: 'to-emerald-500', neonShadowColor: 'rgba(0,255,100,0.9)' },
    projectileType: 'sharp_shot', behaviorProps: { isBoss: true, healingAura: true, healAmount: 15, healInterval: 5000, specialAttackType: 'sanctuary_pulse_heal_self_and_damage_player', secondSpecialAttack: 'divine_judgment_beams', secondSpecialCooldown: 7800, protectiveField: true, predictiveAimingFactor: 0.75 },
    narrativeName: "Guardião Radiante", sfx: { death: 'boss_roar' }
  },
  'absurdo_reality_glitch': { 
    hp: 75, speed: 1.9, width: 40, height: 40, baseDamage: 12, attackCooldown: 2400, 
    visuals: { shapeClass: 'animate-pulse', gradientFrom: 'from-fuchsia-500', gradientTo: 'to-violet-600', neonShadowColor: 'rgba(220,80,220,0.7)' },
    projectileType: 'reality_glitch_shot', behaviorProps: { 
      frequentTeleport: true, teleportCooldownShort: 2100, projectileRandomCurve: true, 
      visualDistortionAura: true, contactDamage: 0 
    },
    narrativeName: "Falha na Realidade"
  },
  'absurdo_boss_glitchking': {
    hp: 500, speed: 1.8, width: 65, height: 65, baseDamage: 28, attackCooldown: 1300, 
    visuals: { shapeClass: 'animate-pulse', gradientFrom: 'from-pink-500', gradientTo: 'to-purple-600', neonShadowColor: 'rgba(255,0,255,0.9)' },
    projectileType: 'standard', behaviorProps: { isBoss: true, randomTeleport: true, randomProjectileType: true, specialAttackType: 'stat_scramble_player', secondSpecialAttack: 'blue_screen_of_death_aoe', secondSpecialCooldown: 8000, chaoticBuffCycle: true, predictiveAimingFactor: 0.75 },
    narrativeName: "Rei dos Glitches", sfx: { death: 'boss_roar' }
  },
   'transcendencia_psionic_echo': { 
    hp: 70, speed: 1.6, width: 40, height: 50, baseDamage: 19, attackCooldown: 2500,
    visuals: { shapeClass: 'opacity-80 rounded-t-lg', gradientFrom: 'from-sky-300', gradientTo: 'to-indigo-400', neonShadowColor: 'rgba(100,150,255,0.7)' },
    projectileType: 'psionic_orb_shot', behaviorProps: { phasingMovement: true, phaseCooldown: 4000, phaseDuration: 600, psionicOrbAoERadius: 80 },
    narrativeName: "Eco Psiônico Desvanecido"
  },
  'transcendencia_boss_fractal': {
    hp: 510, speed: 1.3, width: 85, height: 85, baseDamage: 35, attackCooldown: 1600, 
    visuals: { shapeClass: 'rounded-lg border-4 border-cyan-700', gradientFrom: 'from-cyan-300', gradientTo: 'to-sky-500', neonShadowColor: 'rgba(0,220,255,0.9)' },
    projectileType: 'sharp_shot', behaviorProps: { isBoss: true, duplicateOnHitChance: 0.25, specialAttackType: 'shatter_reality_projectiles', secondSpecialAttack: 'ethereal_clone_summon', secondSpecialCooldown: 9500, selfReflectionAttack: true, predictiveAimingFactor: 0.75 },
    narrativeName: "O Fractal Infinito", sfx: { death: 'boss_roar' }
  },
};

export const DECISION_NODE_ENEMY_POOL: Record<NarrativeNodeId, EnemyTypeKey[]> = {
    'ROOT': ['basic_flyer'],
    'NODE_A': ['vinganca_estilhaco', 'dasher'],
    'NODE_B': ['vinganca_executor', 'intelecto_sonda'],
    'NODE_C': ['intelecto_glitch', 'abismo_tentaculo'],
    'DECISION_POINT_ALPHA': ['intelecto_sonda'],
    'DECISION_POINT_BETA': ['carne_spawnling'],
    'DECISION_POINT_GAMMA': ['vinganca_estilhaco', 'basic_flyer'],
    'NODE_X': ['absurdo_reality_glitch', 'basic_flyer'],
    'NODE_Y': ['esperanca_aegis_orb', 'dasher'],
    'NODE_ATTRIB_BOOST_1': ['basic_flyer'],
    'NODE_ATTRIB_BOOST_2': ['basic_flyer'],
    'NODE_ATTRIB_BOOST_3': ['basic_flyer'],
} as Record<NarrativeNodeId, EnemyTypeKey[]>;

export const PATH_ENEMY_POOL: Record<AffinityName, EnemyTypeKey[]> = {
    'Vingança': ['vinganca_estilhaco', 'vinganca_executor', 'dasher'],
    'Intelecto': ['intelecto_sonda', 'intelecto_glitch', 'intelecto_protocol_sentry'],
    'Abismo': ['abismo_tentaculo', 'abismo_olho', 'absurdo_reality_glitch'],
    'Carne': ['carne_massa_instavel', 'carne_spawnling', 'carne_unstable_growth'],
    'Esperança': ['esperanca_sentinela', 'esperanca_aegis_orb', 'basic_flyer'],
    'Absurdo': ['absurdo_reality_glitch', 'intelecto_glitch', 'vinganca_estilhaco'],
    'Transcendência': ['transcendencia_psionic_echo', 'abismo_tentaculo', 'intelecto_sonda'],
};

export const ASCENSION_NODE_ENEMY_POOL_BASE: EnemyTypeKey[] = ['dasher', 'basic_flyer', 'intelecto_glitch'];

export const SOUND_PATHS: Record<string, string> = {};
