
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    PlayerState, EnemyState, ProjectileState, EffectDefinition, TerrainPlatform, GamePhase, 
    AffinityName, GameObject, NarrativeNodeId, NarrativeChoiceDefinition, 
    NarrativeNodeDefinition, CollectibleState, WispState, StaffDefinition, HighScoreEntry, SceneDefinition,
    AscensionLevel, MinionState, EnemyTypeKey, VisualEffectState, 
    SoundTriggerState, AudioManagerControls 
} from './types'; 
import {
  GAME_WIDTH, GAME_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, JUMP_FORCE,
  INITIAL_PLAYER_HP, INTRO_TEXT_PARAGRAPHS, ALL_EFFECTS_MAP, DEFAULT_STAFF, DEFAULT_PLATFORMS, 
  INITIAL_AFFINITIES, AFFINITY_NARRATIVES,
  NARRATIVE_TREE,
  INITIAL_PROJECTILE_SIZE_MULTIPLIER, INITIAL_INVULNERABILITY_ON_HIT, INITIAL_CRIT_DAMAGE_MULTIPLIER,
  ALL_STAVES_MAP, DEFAULT_STAFF_ID, ENDING_STAFF_UNLOCK_MAP,
  BASE_HEALING_ORB_DROP_CHANCE
} from './constants';
import { SCENE_DEFINITIONS } from './scenes'; 
import PlayerDisplayComponent from './components/Player'; 
import EnemyComponent from './components/Enemy';
import ProjectileComponent from './components/Projectile';
import TerrainComponent from './components/Terrain';
import IntroScreen from './components/IntroScreen';
import PauseMenu from './components/PauseMenu'; 
import NarrativeDisplay from './components/NarrativeDisplay';
import GameOverScreen from './components/GameOverScreen';
import EndingScreen from './components/EndingScreen';
import NarrativeDecisionModal from './components/NarrativeDecisionModal'; 
import CollectibleComponent from './components/Collectible';
import WispComponent from './components/Wisp';
import MainMenuComponent from './components/MainMenu';
import TrophyRoomComponent from './components/TrophyRoom';
import HallOfFameComponent from './components/HallOfFame';
import StaffSelectionModalComponent from './components/StaffSelectionModal';
import { NarrativeCompendiumComponent } from './components/NarrativeCompendium';
import VisualEffectComponent from './components/VisualEffect'; 
import EnterNamePromptComponent from './components/EnterNamePromptComponent';
// import GeminiInteractionPanel from './components/GeminiInteractionPanel'; // Removed import


// HUD Corner Components
import HUDHealth from './components/HUDHealth';
import HUDScore from './components/HUDScore';
import HUDAbilities from './components/HUDAbilities';
import HUDLocation from './components/HUDLocation';

// Hooks
import { usePersistentData } from './hooks/usePersistentData';
import { useGameInput, GameInputRefs } from './hooks/useGameInput';
import { useGameFlow } from './hooks/useGameFlow';
import { usePlayerLogic } from './hooks/usePlayerLogic';
import { useEnemyLogic } from './hooks/useEnemyLogic';
import { useProjectileLogic } from './hooks/useProjectileLogic';
import { useEffectsAndCollectiblesLogic } from './hooks/useEffectsAndCollectiblesLogic';
import { useAudioManager } from './hooks/useAudioManager'; 


export const checkCollision = (obj1: GameObject, obj2: GameObject): boolean => { 
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
};

const HUD_ZONES = {
  TOP_LEFT: { id: 'hud-zone-tl', x: 16, y: 16, width: 180, height: 50 }, 
  TOP_RIGHT: { id: 'hud-zone-tr', x: GAME_WIDTH - 100 - 16, y: 16, width: 100, height: 45 }, 
  BOTTOM_LEFT: { id: 'hud-zone-bl', x: 16, y: GAME_HEIGHT - 32 - 16, width: 150, height: 40 },
  BOTTOM_RIGHT: { id: 'hud-zone-br', x: GAME_WIDTH - 130 - 16, y: GAME_HEIGHT - 45 - 16, width: 130, height: 45 }, 
};

const initialSoundTriggers: SoundTriggerState = {
  uiClick: 0,
  uiNavigation: 0,
  playerJump: 0,
  playerLand: 0,
  playerShoot: 0,
  playerHit: 0,
  playerHeal: 0,
  enemyHit: 0,
  enemyDeath: 0,
  bossRoar: 0,
  collectiblePickup: 0,
  effectActivatePositive: 0,
  effectActivateNegative: 0,
  barrierShieldActivate: 0,
  barrierShieldBlock: 0,
  thunderboltCast: 0,
  narrativeChoiceMade: 0,
  projectileDestroy: 0,
  sceneClearedSound: 0, // Added new trigger
};


const App: React.FC = () => {
  const { loadData, saveData } = usePersistentData();
  
  const [soundTriggers, setSoundTriggers] = useState<SoundTriggerState>(initialSoundTriggers);
  
  const [player, setPlayer] = useState<PlayerState>(() => {
    const initialStaff = ALL_STAVES_MAP[DEFAULT_STAFF_ID] || DEFAULT_STAFF;
    const initialGround = DEFAULT_PLATFORMS.find(p => p.id === 'ground') || { height: 30 };
    return {
        id: 'player', x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: GAME_HEIGHT - PLAYER_HEIGHT - initialGround.height,
        width: PLAYER_WIDTH, height: PLAYER_HEIGHT, hp: INITIAL_PLAYER_HP, maxHp: INITIAL_PLAYER_HP,
        speed: PLAYER_SPEED, jumpForce: JUMP_FORCE, isJumping: false, velocityY: 0, direction: 'right',
        attackSpeed: initialStaff.baseAttackSpeed, lastShotTime: 0, projectileDamage: initialStaff.baseDamage,
        critChance: 0.05, defense: 0, currentStaff: initialStaff, chosenEffects: [], 
        jumpsLeft: 1, maxJumps: 1, invulnerableUntil: 0,
        projectilesCanPierce: 0,
        projectileSizeMultiplier: INITIAL_PROJECTILE_SIZE_MULTIPLIER,
        invulnerabilityDurationOnHit: INITIAL_INVULNERABILITY_ON_HIT,
        critDamageMultiplier: INITIAL_CRIT_DAMAGE_MULTIPLIER, activeWisps: [],
        currentAscensionLevel: null, ascensionAffinity: null, activeMinions: [],
        baseHealingOrbDropChance: BASE_HEALING_ORB_DROP_CHANCE,
        etherealUntil: undefined, lastMinionSpawnTime: undefined, lastDamageDealtTime: undefined,
        causesFearOnHit: false, fearDuration: 2000, critCausesBleed: false, critWeakensArmor: false, 
        enemiesExplodeViolentlyModifier: 1, playerTakesRecoilFromViolentExplosion: false,
        extraChoiceInEvent: false, projectileConversionChance: 0, convertedProjectileDamageMultiplier: 0.5, 
        hasTemporalDistortionAura: false, temporalAuraRadius: 180, temporalAuraSlowFactor: 0.6,
        attacksApplyVulnerabilityMark: false, vulnerabilityMarkMaxStacks: 5, vulnerabilityMarkDamageIncreasePerStack: 0.08, 
        summonsHungeringShadow: false, killHasChanceToCreateBlackHole: 0, contactDamageBonus: 0, 
        hasLifeDegeneration: false, lifeDegenerationRate: 1, 
        periodicallySpawnsMinions: false, minionTypeToSpawn: 'carne_spawnling', minionSpawnInterval: 7000, maxMinionsAllowed: 3,
        passiveHpRegenAmount: 0, hasDivineInterventionOncePerScene: false, 
        chanceToNullifyAttackAndHeal: 0, nullifyHealAmount: 10, healingOrbsArePotent: false,
        hasChaoticProjectiles: false, nearbyEnemiesChanceToConfuse: 0, confusionDuration: 3000,
        unpredictablePlayerSpeedActive: false, teleportOnHitChance: 0, chanceToDuplicateProjectiles: 0,
        etherealOnJump: false, etherealDuration: 600, projectilesCausePsychicExplosion: false, psychicExplosionDamageFactor: 0.4, 
        activeSkillCooldownReductionFactor: 1, chanceToResetCooldownOnUse: 0,
        activeAuraColor: undefined, particleEffectType: null,
    };
  });
  const [enemies, setEnemies] = useState<EnemyState[]>([]);
  const [projectiles, setProjectiles] = useState<ProjectileState[]>([]);
  const [collectibles, setCollectibles] = useState<CollectibleState[]>([]);
  const [visualEffects, setVisualEffects] = useState<VisualEffectState[]>([]); 
  const [score, setScore] = useState<number>(0);
  const [activeBoss, setActiveBoss] = useState<EnemyState | null>(null); 

  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.MainMenu);
  const [currentSceneId, setCurrentSceneId] = useState<NarrativeNodeId>('ROOT');
  const [affinities, setAffinities] = useState<Record<AffinityName, number>>(INITIAL_AFFINITIES);
  const [lockedNarrativePath, setLockedNarrativePath] = useState<AffinityName | null>(null);
  const [lastNarrativeMessage, setLastNarrativeMessage] = useState<string | null>(null);
  const [currentEnding, setCurrentEnding] = useState<{title: string, desc: string} | null>(null);
  const [currentVisualTheme, setCurrentVisualTheme] = useState<AffinityName | null>(null);
  
  const [achievedEndings, setAchievedEndings] = useState<Set<string>>(new Set());
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [unlockedStaffIds, setUnlockedStaffIds] = useState<Set<string>>(new Set([DEFAULT_STAFF_ID]));
  const [selectedStaffId, setSelectedStaffId] = useState<string>(DEFAULT_STAFF_ID);
  const [availableStaves, setAvailableStaves] = useState<StaffDefinition[]>([DEFAULT_STAFF]);
  
  const [showingTrophyRoom, setShowingTrophyRoom] = useState<boolean>(false);
  const [showingHallOfFame, setShowingHallOfFame] = useState<boolean>(false);

  const [obscuredHudCorners, setObscuredHudCorners] = useState({
    topLeft: false, topRight: false, bottomLeft: false, bottomRight: false,
  });

  const [scoreToSubmit, setScoreToSubmit] = useState<number | null>(null);
  const [endingToSubmit, setEndingToSubmit] = useState<{title: string, desc: string} | null>(null);

  const audioManager = useAudioManager({ 
    soundTriggers, 
    onSoundPlayed: (triggerKey) => setSoundTriggers(prev => ({ ...prev, [triggerKey]: 0 })),
    gamePhase: gamePhase,
    playerAscensionAffinity: player.ascensionAffinity 
  });

  const gameCanvasRef = useRef<HTMLDivElement>(null); 
  const animationFrameIdRef = useRef<number | null>(null);
  const currentScenePlatformsRef = useRef<TerrainPlatform[]>(DEFAULT_PLATFORMS);

  const playerRef = useRef<PlayerState>(player);
  useEffect(() => { playerRef.current = player; }, [player]);
  const enemiesRef = useRef<EnemyState[]>(enemies);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  const projectilesRef = useRef<ProjectileState[]>(projectiles);
  useEffect(() => { projectilesRef.current = projectiles; }, [projectiles]);
  const collectiblesRef = useRef<CollectibleState[]>(collectibles);
  useEffect(() => { collectiblesRef.current = collectibles; }, [collectibles]);
  const visualEffectsRef = useRef<VisualEffectState[]>(visualEffects); 
  useEffect(() => { visualEffectsRef.current = visualEffects; }, [visualEffects]);
  const gamePhaseRef = useRef<GamePhase>(gamePhase);
  useEffect(() => { gamePhaseRef.current = gamePhase; }, [gamePhase]);
  const activeBossRef = useRef<EnemyState | null>(activeBoss); 
  useEffect(() => { activeBossRef.current = activeBoss; }, [activeBoss]);
  const currentSceneIdRef = useRef<NarrativeNodeId>(currentSceneId);
  useEffect(() => { currentSceneIdRef.current = currentSceneId; }, [currentSceneId]);
  const affinitiesRef = useRef<Record<AffinityName, number>>(affinities);
  useEffect(() => { affinitiesRef.current = affinities; }, [affinities]);
  const lockedNarrativePathRef = useRef<AffinityName | null>(lockedNarrativePath);
  useEffect(() => { lockedNarrativePathRef.current = lockedNarrativePath; }, [lockedNarrativePath]);
      
  const completedCombatScenesRef = useRef<number>(0); 
  const lastCombatSceneIdClearedRef = useRef<NarrativeNodeId | null>(null); 
  const sceneJustLoadedRef = useRef<boolean>(false); 
      
  const keysPressedRef = useRef<Record<string, boolean>>({});
  const isMouseDownRef = useRef<boolean>(false);
  const shotRequestedRef = useRef<boolean>(false);
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });

  useEffect(() => { 
    setAchievedEndings(loadData('achievedEndings', new Set<string>()));
    setHighScores(loadData('highScores', []));
    const loadedUnlockedStaffs = loadData('unlockedStaffIds', new Set<string>([DEFAULT_STAFF_ID]));
    setUnlockedStaffIds(loadedUnlockedStaffs);
    const staffList = Array.from(loadedUnlockedStaffs).map(id => ALL_STAVES_MAP[id]).filter(Boolean) as StaffDefinition[];
    setAvailableStaves(staffList.length > 0 ? staffList : [ALL_STAVES_MAP[DEFAULT_STAFF_ID]]);
    setSelectedStaffId(loadData('selectedStaffId', DEFAULT_STAFF_ID));
  }, [loadData]); 

  const gameFlow = useGameFlow({
    playerRef, enemiesRef, projectilesRef, collectiblesRef, visualEffectsRef,
    currentSceneIdRef, affinitiesRef, lockedNarrativePathRef, completedCombatScenesRef,
    lastCombatSceneIdClearedRef, sceneJustLoadedRef, activeBossRef, gamePhaseRef,
    currentScenePlatformsRef, isMouseDownRef, shotRequestedRef, keysPressedRef,
    score, selectedStaffId,
    setPlayer, setEnemies, setProjectiles,
    setVisualEffects, setScore, setActiveBoss, setGamePhase,
    setCurrentSceneId, setAffinities, setLockedNarrativePath, setLastNarrativeMessage,
    setCurrentEnding, setCurrentVisualTheme, setAchievedEndings, setHighScores,
    setUnlockedStaffIds, setAvailableStaves, setObscuredHudCorners, saveData,
    setSoundTriggers, 
    scoreToSubmit, setScoreToSubmit, // Pass state for score/ending submission
    endingToSubmit, setEndingToSubmit,
  });

  const initializeAudioAndTriggerUiSound = useCallback(async (triggerType: keyof SoundTriggerState = 'uiClick') => {
    if (!audioManager.isReady()) {
      await audioManager.initAudioContext();
    }
    if (audioManager.isReady()) {
      setSoundTriggers(prev => ({ ...prev, [triggerType]: Date.now() }));
    } else {
      console.warn("Audio couldn't be initialized. UI Sound not triggered:", triggerType);
    }
  }, [audioManager, setSoundTriggers]);


  const handleReturnToMenu = useCallback(() => {
    if (animationFrameIdRef.current) { cancelAnimationFrame(animationFrameIdRef.current); animationFrameIdRef.current = null; }
    setShowingTrophyRoom(false); setShowingHallOfFame(false);
    gameFlow.resetGame(GamePhase.MainMenu, 'ROOT'); 
  }, [gameFlow]); 

  const gameInputRefs: GameInputRefs = { keysPressedRef, isMouseDownRef, shotRequestedRef, mousePositionRef, gameCanvasRef };
  useGameInput({ 
      gamePhase, 
      onPauseToggle: () => {
        if (gamePhase === GamePhase.Playing) { setGamePhase(GamePhase.Paused); initializeAudioAndTriggerUiSound('uiNavigation');} // Changed to uiNavigation for variety
        else if (gamePhase === GamePhase.Paused) { setGamePhase(GamePhase.Playing); initializeAudioAndTriggerUiSound('uiNavigation');}
      },
      onMainMenu: () => { initializeAudioAndTriggerUiSound('uiClick'); handleReturnToMenu(); },
    }, gameInputRefs);

  const effectsAndCollectiblesLogic = useEffectsAndCollectiblesLogic({
    collectiblesRef, visualEffectsRef, projectilesRef, playerRef, currentScenePlatformsRef,
    setSoundTriggers,
    onSetPlayerHP: (newHP) => setPlayer(p => ({ ...p, hp: newHP })),
    onSetScore: setScore,
  });

  const playerLogic = usePlayerLogic({
    playerRef, enemiesRef, projectilesRef, visualEffectsRef, currentScenePlatformsRef,
    keysPressedRef, isMouseDownRef, mousePositionRef, gamePhaseRef, shotRequestedRef, 
    setSoundTriggers,
    onShowNarrativeMessage: gameFlow.showNarrativeMessage,
    onSpawnThunderbolts: effectsAndCollectiblesLogic.spawnThunderbolts,
    onSpawnFrictionProjectileSpark: effectsAndCollectiblesLogic.spawnFrictionProjectileSpark,
    onSetPlayerHP: (newHP) => setPlayer(p => ({ ...p, hp: newHP })),
    onSetPlayerInvulnerableUntil: (timestamp) => setPlayer(p => ({ ...p, invulnerableUntil: timestamp })),
    onSetPlayerLastDamageDealtTime: (timestamp) => setPlayer(p => ({ ...p, lastDamageDealtTime: timestamp })),
    onSetPlayerHasDivineIntervention: (value) => setPlayer(p => ({...p, hasDivineInterventionOncePerScene: value })),
    onSetPlayerHasBarrierShield: (value) => setPlayer(p => ({...p, hasBarrierShield: value })),
    onSetPlayerLastBarrierActivationTime: (timestamp) => setPlayer(p => ({...p, lastBarrierActivationTime: timestamp })),
  });
  
  const enemyLogic = useEnemyLogic({
    enemiesRef, playerRef, projectilesRef, currentScenePlatformsRef,
    completedCombatScenesRef, 
    setSoundTriggers,
  });

  const projectileLogic = useProjectileLogic({
    projectilesRef, playerRef, enemiesRef, collectiblesRef,
    setSoundTriggers,
    onSetScore: setScore,
    onSetPlayerHP: (newHP) => setPlayer(p => ({ ...p, hp: newHP })),
    onSetPlayerInvulnerableUntil: (timestamp) => setPlayer(p => ({ ...p, invulnerableUntil: timestamp })),
    onSetPlayerHasBarrierShield: (value) => setPlayer(p => ({...p, hasBarrierShield: value })),
    onSetPlayerLastBarrierActivationTime: (timestamp) => setPlayer(p => ({...p, lastBarrierActivationTime: timestamp })),
    onSetPlayerPosition: (x, y) => setPlayer(p => ({ ...p, x, y })),
    onSetPlayerLastDamageDealtTime: (timestamp) => setPlayer(p => ({ ...p, lastDamageDealtTime: timestamp })),
    onShowNarrativeMessage: gameFlow.showNarrativeMessage,
    completedCombatScenesRef,
  });

  // Main Game Loop
  useEffect(() => {
    if (gamePhase !== GamePhase.Playing) { 
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
        return;
    }

    let lastFrameTime = performance.now();

    const gameLoop = (currentTime: number) => {
      if(gamePhaseRef.current !== GamePhase.Playing) { 
         if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
         animationFrameIdRef.current = null;
         return;
      }
      const deltaTime = Math.min(0.05, (currentTime - lastFrameTime) / 1000); 
      lastFrameTime = currentTime;
      const now = Date.now();
      
      const updatedPlayerResult = playerLogic.updatePlayer(deltaTime, now); 
      if (updatedPlayerResult) {
        playerRef.current = updatedPlayerResult; 
        setPlayer(updatedPlayerResult);
      }


      const updatedEnemies = enemyLogic.updateEnemies(deltaTime, now); 
      enemiesRef.current = updatedEnemies;
      setEnemies(updatedEnemies);

      const projectileResult = projectileLogic.updateProjectiles(deltaTime, now); 
      projectilesRef.current = projectileResult.updatedProjectiles;
      setProjectiles(projectileResult.updatedProjectiles);
      
      const collectibleResult = effectsAndCollectiblesLogic.updateCollectibles(deltaTime, now); 
      collectiblesRef.current = collectibleResult.updatedCollectibles;
      setCollectibles(collectibleResult.updatedCollectibles);

      const visualEffectsResult = effectsAndCollectiblesLogic.updateVisualEffects(now); 
      visualEffectsRef.current = visualEffectsResult.updatedVisualEffects;
      setVisualEffects(visualEffectsResult.updatedVisualEffects);
      
      // HUD Obscurity Check
      const newObscuredCorners = { topLeft: false, topRight: false, bottomLeft: false, bottomRight: false };
      const entitiesToCheck = [playerRef.current, ...enemiesRef.current];
      for (const entity of entitiesToCheck) {
        if (checkCollision(entity, HUD_ZONES.TOP_LEFT)) newObscuredCorners.topLeft = true;
        if (checkCollision(entity, HUD_ZONES.TOP_RIGHT)) newObscuredCorners.topRight = true;
        if (checkCollision(entity, HUD_ZONES.BOTTOM_LEFT)) newObscuredCorners.bottomLeft = true;
        if (checkCollision(entity, HUD_ZONES.BOTTOM_RIGHT)) newObscuredCorners.bottomRight = true; 
      }
      setObscuredHudCorners(newObscuredCorners);
      
      gameFlow.checkAndHandlePlayerDeath(); 

      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };
    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null; 
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [gamePhase]); 

  // Effect for Scene Cleared
  useEffect(() => {
    const currentGPVal = gamePhaseRef.current;
    const currentEnemiesVal = enemiesRef.current;
    const currentSceneIdVal = currentSceneIdRef.current;
    const currentSceneDef = SCENE_DEFINITIONS[currentSceneIdVal];

    if (currentGPVal !== GamePhase.Playing || !currentSceneDef) return;

    if (currentEnemiesVal.length === 0 && !sceneJustLoadedRef.current && currentSceneDef.enemyCount > 0) {
        if(lastCombatSceneIdClearedRef.current !== currentSceneIdVal) { 
            completedCombatScenesRef.current += 1;
            lastCombatSceneIdClearedRef.current = currentSceneIdVal;
        }
        setGamePhase(GamePhase.SceneCleared); return;
    }
    if (sceneJustLoadedRef.current) {
        sceneJustLoadedRef.current = false; 
        if (currentSceneDef.enemyCount === 0 && !currentSceneDef.isBossScene) {
            setGamePhase(GamePhase.SceneCleared);
        } else if (currentSceneDef.enemyCount > 0 && currentEnemiesVal.length === 0) {
             if(lastCombatSceneIdClearedRef.current !== currentSceneIdVal && currentSceneDef.enemyCount > 0) {
                completedCombatScenesRef.current += 1;
                lastCombatSceneIdClearedRef.current = currentSceneIdVal;
            }
            setGamePhase(GamePhase.SceneCleared);
        }
    }
  }, [enemies, gamePhase, activeBoss, setGamePhase]); 

  useEffect(() => {
    if (gamePhase === GamePhase.SceneCleared) {
      setSoundTriggers(prev => ({ ...prev, sceneClearedSound: Date.now() }));
      gameFlow.processNextGameStep();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, setSoundTriggers]); // Added setSoundTriggers dependency for sceneClearedSound

  const handleIntroEnd = useCallback(async () => { 
    await initializeAudioAndTriggerUiSound('uiClick');
    gameFlow.loadScene('ROOT'); 
  }, [gameFlow, initializeAudioAndTriggerUiSound]);

  const currentThemeDetails = currentVisualTheme ? AFFINITY_NARRATIVES[currentVisualTheme] : null;

  const handleStartNewRun = async () => {
    await initializeAudioAndTriggerUiSound('uiClick');
    setGamePhase(GamePhase.StaffSelection);
  };

  const handleShowTrophies = async () => {
    await initializeAudioAndTriggerUiSound('uiClick');
    setShowingTrophyRoom(true); 
    setGamePhase(GamePhase.TrophyRoomView);
  };
  
  const handleShowHallOfFame = async () => {
    await initializeAudioAndTriggerUiSound('uiClick');
    setShowingHallOfFame(true); 
    setGamePhase(GamePhase.HallOfFameView);
  };
  
  const handleShowCompendium = async () => {
    await initializeAudioAndTriggerUiSound('uiClick');
    setGamePhase(GamePhase.CompendiumView);
  };

  // const handleShowGeminiConsole = async () => { // Removed handler
  //   await initializeAudioAndTriggerUiSound('uiClick');
  //   setGamePhase(GamePhase.GeminiConsoleView);
  // };
  
  const handleStaffSelection = async (staffId: string) => {
    await initializeAudioAndTriggerUiSound('uiClick');
    setSelectedStaffId(staffId); 
    saveData('selectedStaffId', staffId); 
    gameFlow.resetGame(GamePhase.Intro, 'ROOT');
  };
  
  const handleCancelStaffSelection = async () => {
    await initializeAudioAndTriggerUiSound('uiClick');
    handleReturnToMenu();
  };

  const handleNameSubmitted = async (playerName: string) => {
    await initializeAudioAndTriggerUiSound('uiClick');
    gameFlow.finalizeScoreSubmission(playerName);
  };

  const handleCancelNamePrompt = async () => {
    await initializeAudioAndTriggerUiSound('uiNavigation');
    // If user cancels name prompt, save score with default name and proceed
    gameFlow.finalizeScoreSubmission("Anônimo"); 
  };


  return (
    <div 
        id="app-container" 
        className="flex flex-col items-center justify-center p-0 bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-slate-800 dark:to-slate-900 h-screen w-screen overflow-hidden select-none"
        role="application" aria-roledescription="Aplicativo Seraph: O Último Login"
    >
      <div 
        id="game-canvas-container" ref={gameCanvasRef} className="relative shadow-2xl overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT, 
            background: currentThemeDetails?.visualTheme?.overlayGradient 
                ? `linear-gradient(rgba(17, 24, 39, 0.9), rgba(17, 24, 39, 0.9)), radial-gradient(circle, ${currentThemeDetails.visualTheme.overlayGradient} 20%, transparent 70%), var(--background-start-rgb)`
                : 'var(--background-start-rgb)',
            boxShadow: currentThemeDetails?.visualTheme?.pulseColor ? `0 0 25px ${currentThemeDetails.visualTheme.pulseColor} inset` : 'none',
            transition: 'background 0.5s ease-in-out, box-shadow 0.5s ease-in-out'
        }}
      >
      {gamePhase === GamePhase.MainMenu && (
        <MainMenuComponent 
            onStartNewRun={handleStartNewRun} 
            onShowTrophies={handleShowTrophies}
            onShowHallOfFame={handleShowHallOfFame}
            onShowCompendium={handleShowCompendium}
            // onShowGeminiConsole={handleShowGeminiConsole} // Prop removed
        />
      )}
      {gamePhase === GamePhase.StaffSelection && (
          <StaffSelectionModalComponent 
            availableStaves={availableStaves}
            onSelectStaff={handleStaffSelection}
            onCancel={handleCancelStaffSelection}
          />
      )}
      {gamePhase === GamePhase.TrophyRoomView && showingTrophyRoom && (
        <TrophyRoomComponent achievedEndings={Array.from(achievedEndings)} endingStaffUnlockMap={ENDING_STAFF_UNLOCK_MAP} allStavesMap={ALL_STAVES_MAP} onClose={async () => { await initializeAudioAndTriggerUiSound('uiNavigation'); handleReturnToMenu();}} />
      )}
      {gamePhase === GamePhase.HallOfFameView && showingHallOfFame && (
        <HallOfFameComponent highScores={highScores} onClose={async () => { await initializeAudioAndTriggerUiSound('uiNavigation'); handleReturnToMenu();}} />
      )}
      {gamePhase === GamePhase.CompendiumView && ( <NarrativeCompendiumComponent narrativeTree={NARRATIVE_TREE} affinityDetails={AFFINITY_NARRATIVES} onClose={async () => { await initializeAudioAndTriggerUiSound('uiNavigation'); handleReturnToMenu();}} /> )}
      {gamePhase === GamePhase.Intro && <IntroScreen paragraphs={INTRO_TEXT_PARAGRAPHS} onEnd={handleIntroEnd} />}
      
      {(gamePhase === GamePhase.Playing || gamePhase === GamePhase.Paused || gamePhase === GamePhase.SceneCleared || gamePhase === GamePhase.NarrativeDecision) && (
        <>
          <TerrainComponent platforms={currentScenePlatformsRef.current} />
          {player && <PlayerDisplayComponent {...player} />}
          {enemies.map(enemy => <EnemyComponent key={enemy.id} {...enemy} />)}
          {projectiles.map(projectile => <ProjectileComponent key={projectile.id} {...projectile} />)}
          {collectibles.map(collectible => <CollectibleComponent key={collectible.id} {...collectible} />)}
          {player?.activeWisps.map(wisp => <WispComponent key={wisp.id} {...wisp} />)}
          {player?.activeMinions.map(minion => (
              <div key={minion.id} style={{position: 'absolute', left: minion.x, top: minion.y, width: minion.width, height: minion.height}} className="bg-green-700 rounded-sm opacity-80 border border-green-400"></div>
          ))}
          {visualEffects.map(effect => <VisualEffectComponent key={effect.id} {...effect} />)}
          
          {player && <HUDHealth hp={player.hp} maxHp={player.maxHp} isObscured={obscuredHudCorners.topLeft} />}
          <HUDScore score={score} isObscured={obscuredHudCorners.topRight} />
          {player && <HUDAbilities chosenEffects={player.chosenEffects} isObscured={obscuredHudCorners.bottomLeft} />}
          <HUDLocation sceneName={SCENE_DEFINITIONS[currentSceneId]?.displayName || NARRATIVE_TREE[currentSceneId]?.title || currentSceneId} isObscured={obscuredHudCorners.bottomRight} />
          
          {lastNarrativeMessage && <NarrativeDisplay message={lastNarrativeMessage} />}
          
          {gamePhase === GamePhase.Paused && player && (
            <PauseMenu playerState={player} 
              onResume={async () => { await initializeAudioAndTriggerUiSound('uiNavigation'); setGamePhase(GamePhase.Playing);}} 
              onRestart={async () => { await initializeAudioAndTriggerUiSound('uiClick'); gameFlow.resetGame(GamePhase.Playing, 'ROOT');}} 
              onMainMenu={async () => { await initializeAudioAndTriggerUiSound('uiClick'); handleReturnToMenu();}}
            />
          )}
          {gamePhase === GamePhase.NarrativeDecision && NARRATIVE_TREE[currentSceneId] && ( 
            <NarrativeDecisionModal 
              node={NARRATIVE_TREE[currentSceneId]} 
              onSelectChoice={async (choice) => {
                await initializeAudioAndTriggerUiSound('narrativeChoiceMade');
                gameFlow.handleNarrativeChoice(choice);
              }} 
            /> 
          )}
        </>
      )}
      {gamePhase === GamePhase.EnterNamePrompt && (
        <EnterNamePromptComponent 
          onSubmitName={handleNameSubmitted}
          onCancel={handleCancelNamePrompt}
        />
      )}
      {gamePhase === GamePhase.GameOver && <GameOverScreen score={scoreToSubmit !== null ? scoreToSubmit : score} onReturnToMenu={async () => {await initializeAudioAndTriggerUiSound('uiClick'); handleReturnToMenu();}} />}
      {gamePhase === GamePhase.Ending && currentEnding && ( <EndingScreen title={currentEnding.title} description={currentEnding.desc} onReturnToMenu={async () => {await initializeAudioAndTriggerUiSound('uiClick'); handleReturnToMenu();}}/> )}
      
      {/* Removed GeminiInteractionPanel rendering block */}

      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none"></div>
     </div > 
    </div>
  );
};
export default App;