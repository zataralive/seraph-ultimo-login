

export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AscensionLevel = 1 | 2 | 3;

export interface PlayerState extends GameObject {
  hp: number;
  maxHp: number;
  speed: number;
  jumpForce: number;
  isJumping: boolean;
  velocityY: number;
  direction: 'left' | 'right';
  attackSpeed: number; // Time in ms between shots
  lastShotTime: number;
  projectileDamage: number;
  critChance: number; // 0-1
  defense: number; // Percentage damage reduction 0-1
  currentStaff: StaffDefinition;
  chosenEffects: EffectDefinition[]; 
  jumpsLeft: number;
  maxJumps: number;
  invulnerableUntil: number; // Timestamp
  projectilesCanPierce: number;

  // Effect specific mechanics
  lastThunderboltTime?: number;
  thunderboltCooldown?: number;
  thunderboltsPerActivation?: number;

  baseHealingOrbDropChance: number; 
  additionalHealingOrbChance?: number; 
  canDropSoulOrbs?: boolean;
  soulOrbChance?: number;

  enemiesExplodeOnDeath?: boolean;
  fragmentationCount?: number;

  projectileSizeMultiplier?: number;
  
  invulnerabilityDurationOnHit?: number;
  lifeStealPercentage?: number; 
  critDamageMultiplier?: number;
  canTriggerRage?: boolean;
  regrowthRatePerEnemy?: number; 
  
  hasBarrierShield?: boolean;
  barrierCooldown?: number;
  lastBarrierActivationTime?: number;

  activeWisps: WispState[];

  distanceRanSinceLastFrictionProjectile?: number;
  frictionProjectileThreshold?: number;
  frictionProjectilesToLaunch?: number;

  currentAscensionLevel: AscensionLevel | null;
  ascensionAffinity: AffinityName | null; 
  etherealUntil?: number; 
  lastMinionSpawnTime?: number; 
  activeMinions: MinionState[]; 
  lastDamageDealtTime?: number; 


  // --- ASCENSION EFFECT PROPERTIES (Refined for clarity and new visuals) ---
  // Vingança
  causesFearOnHit?: boolean; 
  fearDuration?: number; 
  critCausesBleed?: boolean;  
  critWeakensArmor?: boolean;  
  enemiesExplodeViolentlyModifier?: number; 
  playerTakesRecoilFromViolentExplosion?: boolean; 

  // Intelecto
  extraChoiceInEvent?: boolean; 
  projectileConversionChance?: number; 
  convertedProjectileDamageMultiplier?: number; 
  hasTemporalDistortionAura?: boolean; 
  temporalAuraRadius?: number; 
  temporalAuraSlowFactor?: number; 
  
  // Abismo
  attacksApplyVulnerabilityMark?: boolean; 
  vulnerabilityMarkMaxStacks?: number; 
  vulnerabilityMarkDamageIncreasePerStack?: number; 
  summonsHungeringShadow?: boolean;  
  killHasChanceToCreateBlackHole?: number; 

  // Carne
  contactDamageBonus?: number; 
  hasLifeDegeneration?: boolean; 
  lifeDegenerationRate?: number; 
  periodicallySpawnsMinions?: boolean; 
  minionTypeToSpawn?: string; 
  minionSpawnInterval?: number; 
  maxMinionsAllowed?: number; 


  // Esperança
  passiveHpRegenAmount?: number; 
  hasDivineInterventionOncePerScene?: boolean; 
  chanceToNullifyAttackAndHeal?: number; 
  nullifyHealAmount?: number; 
  healingOrbsArePotent?: boolean; 

  // Absurdo
  hasChaoticProjectiles?: boolean; 
  nearbyEnemiesChanceToConfuse?: number; 
  confusionDuration?: number; 
  unpredictablePlayerSpeedActive?: boolean; 
  teleportOnHitChance?: number; 
  chanceToDuplicateProjectiles?: number; 

  // Transcendência
  etherealOnJump?: boolean; 
  etherealDuration?: number; 
  projectilesCausePsychicExplosion?: boolean; 
  psychicExplosionDamageFactor?: number; 
  activeSkillCooldownReductionFactor?: number; 
  chanceToResetCooldownOnUse?: number; 

  // For enhanced visual feedback on ascensions in Player.tsx
  activeAuraColor?: string; 
  particleEffectType?: 'fire' | 'ice' | 'shadow' | 'light' | 'glitch' | 'psi' | 'bio' | null;
}

export interface WispState extends GameObject {
  ownerId: string; 
  targetId?: string; 
  orbitAngle: number; 
  lastAttackTime: number;
  attackSpeed: number;
  damage: number;
  wispType?: 'standard' | 'hungering_shadow' | 'aegis_shield_orb'; 
  isHungeringShadow?: boolean; 
  canAttackPlayerProjectiles?: boolean; 
  // For Gilded Aegis Staff
  maxShieldHp?: number;
  currentShieldHp?: number;
}

export interface MinionBehaviorProps {
  orbitsPlayer?: boolean; 
  orbitDistance?: number;
  canAttack?: boolean;
  aggressiveChase?: boolean; 
  formationOffset?: {x: number, y: number}; 
}
export interface MinionState extends GameObject {
  ownerId: string;
  targetId?: string; 
  followTargetId?: string; 
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  lastAttackTime: number;
  attackCooldown: number;
  minionType: string; 
  behaviorProps?: MinionBehaviorProps;
  orbitAngle?: number; 
  currentFormationOffset?: {x: number, y: number}; 
}


export type EnemyTypeKey = 
  | 'basic_flyer'
  | 'dasher'
  | 'vinganca_estilhaco'
  | 'vinganca_executor'
  | 'vinganca_boss_ira'
  | 'intelecto_sonda'
  | 'intelecto_glitch'
  | 'intelecto_boss_core'
  | 'intelecto_protocol_sentry' 
  | 'abismo_tentaculo'
  | 'abismo_olho'
  | 'abismo_boss_leviathan'
  | 'carne_massa_instavel' 
  | 'carne_boss_golem'
  | 'carne_unstable_growth' 
  | 'carne_spawnling' 
  | 'esperanca_sentinela'
  | 'esperanca_boss_guardian'
  | 'esperanca_aegis_orb' 
  | 'absurdo_boss_glitchking'
  | 'absurdo_reality_glitch' 
  | 'transcendencia_boss_fractal'
  | 'transcendencia_psionic_echo';

export interface EnemyState extends GameObject {
  hp: number;
  maxHp: number;
  type: EnemyTypeKey; 
  speed: number;
  damage: number; // Damage this enemy's attacks deal
  attackCooldown: number;
  lastAttackTime: number;
  targetYOffset: number;
  targetX?: number; 

  isDashing?: boolean;
  dashSpeed?: number;
  dashDuration?: number; 
  dashCooldownTime?: number; 
  lastDashTime?: number; 
  dashTargetX?: number;
  dashTargetY?: number;
  isPreparingDash?: boolean;
  prepareDashStartTime?: number; 
  prepareDashDuration?: number; 

  behaviorProps?: Record<string, any>; 
  
  // Status effects from player
  isFearedUntil?: number; 
  isConfusedUntil?: number; 
  vulnerabilityStacks?: number; 
  bleedDamagePerTick?: number; 
  bleedTicksLeft?: number; 
  armorWeakenedFactor?: number; 

  // Specific enemy states
  isBuffedByAegis?: boolean; 
  hasSplit?: boolean; 
  lastFirewallSpawnTime?: number; 

  // Boss Special Ability Timers & States
  isCastingChainsUntil?: number;
  lastChainCastTime?: number;
  chainsToCast?: number;

  isFiringBarrageUntil?: number;
  lastBarrageFireTime?: number;
  projectilesInBarrageLeft?: number;
  barrageTargetX?: number;
  barrageTargetY?: number;

  voidRuptureTelegraphs?: { x: number, y: number, spawnTime: number, radius: number }[];
  lastVoidRuptureCastTime?: number;

  lastFleshSpikeEruptionTime?: number;
  
  lightPillarTelegraphs?: { x: number, y: number, spawnTime: number, radius: number, height: number }[];
  lastLightPillarCastTime?: number;

  isWarpingRealityUntil?: number;
  lastGlitchSpawnTime?: number;

  isCastingPsionicOverloadUntil?: number;
  psionicOverloadChargeStartTime?: number;
}

export type ChaoticBehavior = 'erratic_move' | 'random_size_pulse' | 'color_shift' | 'random_status_apply' | null;

export interface ProjectileState extends GameObject {
  owner: 'player' | 'enemy' | 'neutral' | 'converted_player' | 'player_minion'; 
  type?: 'standard' | 'thunderbolt' | 'fragment' | 'friction_explosive' | 'wisp_shot' | 
         'enemy_beam' | 'enemy_sharp_shot' | 'wave_shot' | 'slow_orb' | 'psychic_explosion' | 
         'black_hole_effect' | 'minion_shot' | 'sharp_shot' | 'beam_charge' | 'firewall_segment' |
         'reality_glitch_shot' | 'psionic_orb_shot' |
         // New staff projectiles
         'cosmic_orb' | 'cosmic_echo_aoe' | 'reality_bender_orb' | 'flesh_tentacle_segment' |
         'nexus_portal' | 'nexus_energy_burst' |
         // New boss projectiles
         'chains_of_retribution' | 'flesh_spike' | 'light_pillar' | 'glitch_static_shot' | 
         'psionic_wave' | 'void_rupture_aoe';
  damage: number;
  vx: number;
  vy: number;
  piercing: number;
  homingTargetId?: string;
  color: string;
  isNeon?: boolean; 
  size?: 'small' | 'medium' | 'large';
  duration?: number; 
  spawnTime?: number;
  
  isChaotic?: boolean; 
  chaoticBehavior?: ChaoticBehavior;
  chaoticColor?: string; 

  causesBleed?: boolean; 
  bleedDuration?: number; 
  bleedDmgFactor?: number; 

  isPsychicExplosion?: boolean; 
  isFirewall?: boolean; 
  isRealityGlitchShot?: boolean;
  lastDirectionChangeTime?: number;
  isPsionicOrb?: boolean;
  psionicOrbAoERadius?: number;

  // For Cosmic Echo Staff
  triggersEchoOnImpact?: boolean;
  isEchoAoE?: boolean;

  // For Reality Bender Staff
  isRealityBenderOrb?: boolean;
  realityBenderInfluenceRadius?: number;
  realityBenderStrength?: number;

  // For Nexus Key Staff
  isNexusPortal?: boolean;
  lastBurstTime?: number;
  burstInterval?: number;
  burstsLeft?: number;
  projectilesPerBurst?: number;

  // For Boss Special Abilities
  isChainSegment?: boolean;
  isFleshSpike?: boolean;
  isLightPillar?: boolean;
  isGlitchStatic?: boolean;
  isPsionicWave?: boolean;
  isVoidRupture?: boolean;
  expansionRate?: number; // for psionic wave, void rupture
}

export interface CollectibleState extends GameObject {
  type: 'healing_orb' | 'soul_orb';
  value?: number; 
  isPotent?: boolean; 
  velocityY: number;
  isFalling: boolean;
}


export interface EffectDefinition { 
  id: string;
  name: string;
  description: string;
  applyEffect: (playerState: PlayerState, currentEnemies?: EnemyState[]) => PlayerState; 
  getAffinityImpact?: () => AffinityImpact; 
  icon?: string; 
  isPassiveEffect?: boolean; 
  isAttributeBoost?: boolean; 
}

export type AffinityName = 
  | 'Vingança' 
  | 'Intelecto' 
  | 'Abismo' 
  | 'Carne' 
  | 'Esperança' 
  | 'Absurdo' 
  | 'Transcendência';

export type AffinityImpact = Partial<Record<AffinityName, number>>;

export interface StaffDefinition {
  id: string; 
  name: string;
  description: string;
  shoot: (player: PlayerState, gameWidth: number, gameHeight: number, mouseX: number, mouseY: number) => ProjectileState[]; // Removed activeWisps from signature
  baseAttackSpeed: number; 
  baseDamage: number;
  sfxPath?: string; // Optional: specific shoot sound effect path (will be ignored by procedural audio)
}

export interface TerrainPlatform extends GameObject {}

export enum GamePhase {
  MainMenu, 
  Intro,
  Playing,
  Paused,
  GameOver,
  NarrativeEvent, 
  NarrativeDecision, 
  Ending,
  StaffSelection, 
  TrophyRoomView, 
  HallOfFameView, 
  SceneCleared,
  CompendiumView, 
  EnterNamePrompt,
  // GeminiConsoleView, // Removed
}

export type NarrativeNodeId = 
  | 'ROOT' 
  | 'NODE_A' 
  | 'NODE_B' 
  | 'NODE_C' 
  | 'VINGANCA_HUB'
  | 'INTELECTO_HUB'
  | 'ABISMO_HUB'
  | 'CARNE_HUB'
  | 'ESPERANCA_HUB'
  | 'ABSURDO_HUB'
  | 'TRANSCENDENCIA_HUB'
  | 'VINGANCA_ASCENSION' 
  | 'INTELECTO_ASCENSION' 
  | 'ABISMO_ASCENSION'    
  | 'CARNE_ASCENSION'     
  | 'ESPERANCA_ASCENSION' 
  | 'ABSURDO_ASCENSION'   
  | 'TRANSCENDENCIA_ASCENSION' 
  | 'VINGANCA_FINAL_A' | 'VINGANCA_FINAL_B' | 'VINGANCA_FINAL_C'
  | 'INTELECTO_FINAL_A' | 'INTELECTO_FINAL_B' | 'INTELECTO_FINAL_C'
  | 'ABISMO_FINAL_A' | 'ABISMO_FINAL_B' | 'ABISMO_FINAL_C'
  | 'CARNE_FINAL_A' | 'CARNE_FINAL_B' | 'CARNE_FINAL_C'
  | 'ESPERANCA_FINAL_A' | 'ESPERANCA_FINAL_B' | 'ESPERANCA_FINAL_C'
  | 'ABSURDO_FINAL_A' | 'ABSURDO_FINAL_B' | 'ABSURDO_FINAL_C'
  | 'TRANSCENDENCIA_FINAL_A' | 'TRANSCENDENCIA_FINAL_B' | 'TRANSCENDENCIA_FINAL_C'
  // Ramification
  | 'DECISION_POINT_ALPHA'
  | 'DECISION_POINT_BETA'
  | 'DECISION_POINT_GAMMA'
  | 'NODE_X'
  | 'NODE_Y'
  // Attribute Boost Nodes
  | 'NODE_ATTRIB_BOOST_1'
  | 'NODE_ATTRIB_BOOST_2'
  | 'NODE_ATTRIB_BOOST_3'
  | AffinityName; 


export interface NarrativeChoiceDefinition {
  id: string; 
  choiceText: string; 
  fullDescription: string; 
  effectDescription: string; 
  leadsToNode: NarrativeNodeId;
  affinityBoost: AffinityImpact;
  dialogueResponse?: string[];
  grantsEffectId?: string; 
  setsAscensionLevel?: AscensionLevel; 
  setsAscensionAffinity?: AffinityName; 
}

export interface NarrativeNodeDefinition {
  id: NarrativeNodeId;
  title: string; 
  triggerCombatScenesCompleted?: number; 
  isTerminal?: boolean; 
  choices?: NarrativeChoiceDefinition[];
  dialoguePreamble?: string[]; 
  speaker?: 'Seraph' | 'System' | 'AlliedAI' | 'CorruptedEcho' | 'Concept' | string;
  isAscensionNode?: boolean; 
  isAttributeBoostNode?: boolean; 
}


export interface HighScoreEntry {
  score: number;
  name: string; 
  date: string; 
  endingTitle?: string; 
}

export interface SceneDefinition {
  id: NarrativeNodeId;
  displayName: string;
  enemyTypes: EnemyTypeKey[]; 
  enemyCount: number;
  isBossScene?: boolean;
  platforms?: TerrainPlatform[];
}

// --- Visual Effect System ---
export type VisualEffectType = 
  | 'thunder_telegraph' 
  | 'player_spark_burst'
  | 'void_zone_telegraph' 
  | 'light_pillar_telegraph';

export interface VisualEffectState extends GameObject {
  effectType: VisualEffectType;
  creationTime: number;
  duration: number;
  color?: string; // e.g., for spark burst color
  data?: any; // For extra data, like targetX for thunderbolt
}

// --- New Procedural Sound System Types ---
export type SoundTriggerPayload = { // This is a general payload structure
  type?: EnemyTypeKey | 'healing_orb' | 'soul_orb' | string; // For enemy death, collectible type, or staff ID
  maxHp?: number;      // For enemy death sounds
  combo?: number;      // For combo sounds
  staffId?: string;    // For staff-specific procedural sounds
  damageAmount?: number; // For hit sounds
  // Add other relevant data points as needed
};

export interface SoundTriggerState {
  uiClick: number;
  uiNavigation: number; 
  playerJump: number;
  playerLand: number;
  playerShoot: { staffId: string; timestamp: number } | number; 
  playerHit: { damageAmount: number; timestamp: number } | number;
  playerHeal: number;
  enemyHit: { enemyType: EnemyTypeKey; timestamp: number } | number;
  enemyDeath: { enemyType: EnemyTypeKey; maxHp: number; timestamp: number } | number;
  bossRoar: number;
  collectiblePickup: { type: 'healing_orb' | 'soul_orb'; timestamp: number } | number;
  effectActivatePositive: number;
  effectActivateNegative: number; 
  barrierShieldActivate: number;
  barrierShieldBlock: number;
  thunderboltCast: number;
  narrativeChoiceMade: number;
  projectileDestroy: number; 
  sceneClearedSound: number; // New trigger for scene clear
  // Add more triggers as needed
  [key: string]: number | { timestamp: number; [key: string]: any } ; 
}

export type ProceduralSoundType = 
  | 'tone' 
  | 'noise' 
  | 'sweep' 
  | 'chord'
  | 'click';

export interface ProceduralSoundParams {
  type: ProceduralSoundType;
  frequency?: number | number[]; // Single for tone/sweep, array for chord
  duration: number; // in seconds
  volume?: number; // 0-1
  waveType?: OscillatorType; // 'sine', 'square', 'sawtooth', 'triangle'
  noiseType?: 'white' | 'pink' | 'brownian';
  attackTime?: number; // in seconds
  decayTime?: number;  // in seconds
  releaseTime?: number; // in seconds (for sounds that sustain)
  sustainDuration?: number; // in seconds (duration of sustain before release)
  sweepStartFreq?: number;
  sweepEndFreq?: number;
  filterFrequency?: number; // For noise
  filterQ?: number; // For noise filter resonance
  numTonesForChord?: number; // For procedural chords
  intervalTypeForChord?: 'major' | 'minor' | 'diminished' | 'custom' | 'whole_tone'; // For chords
  customIntervals?: number[]; // e.g. [0, 4, 7] for major triad steps from base frequency
}

export interface AudioManagerControls {
  initAudioContext: () => Promise<boolean>;
  isReady: () => boolean;
}

// For useAudioManager hook props
export interface UseAudioManagerProps {
  soundTriggers: SoundTriggerState;
  onSoundPlayed: (triggerKey: keyof SoundTriggerState) => void;
  gamePhase: GamePhase;
  playerAscensionAffinity: AffinityName | null;
}