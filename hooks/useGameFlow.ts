
import { useCallback, useRef } from 'react';
import {
  GamePhase, NarrativeNodeId, PlayerState, EnemyState, ProjectileState, CollectibleState, VisualEffectState,
  AffinityName, NarrativeChoiceDefinition, TerrainPlatform, HighScoreEntry, StaffDefinition, GameObject,
  SoundTriggerState, 
} from '../types';
import {
  GAME_WIDTH, GAME_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, JUMP_FORCE,
  INITIAL_PLAYER_HP, INITIAL_AFFINITIES, NARRATIVE_TREE, DEFAULT_PLATFORMS,
  ALL_STAVES_MAP, DEFAULT_STAFF_ID, THEMATIC_ENEMY_DATA, ENEMY_PROJECTILE_SPEED,
  INITIAL_PROJECTILE_SIZE_MULTIPLIER, INITIAL_INVULNERABILITY_ON_HIT,
  INITIAL_CRIT_DAMAGE_MULTIPLIER, BASE_HEALING_ORB_DROP_CHANCE,
  AFFINITY_NARRATIVES, ENDING_STAFF_UNLOCK_MAP, ALL_EFFECTS_MAP, AFFINITY_CARD_TRIGGERS,
} from '../constants';
import { SCENE_DEFINITIONS } from '../scenes';
import { getEnemyPoolForNode } from '../sceneUtils';

export interface UseGameFlowProps {
  playerRef: React.MutableRefObject<PlayerState>;
  enemiesRef: React.MutableRefObject<EnemyState[]>;
  projectilesRef: React.MutableRefObject<ProjectileState[]>;
  collectiblesRef: React.MutableRefObject<CollectibleState[]>;
  visualEffectsRef: React.MutableRefObject<VisualEffectState[]>;
  currentSceneIdRef: React.MutableRefObject<NarrativeNodeId>;
  affinitiesRef: React.MutableRefObject<Record<AffinityName, number>>;
  lockedNarrativePathRef: React.MutableRefObject<AffinityName | null>;
  completedCombatScenesRef: React.MutableRefObject<number>;
  lastCombatSceneIdClearedRef: React.MutableRefObject<NarrativeNodeId | null>;
  sceneJustLoadedRef: React.MutableRefObject<boolean>;
  activeBossRef: React.MutableRefObject<EnemyState | null>;
  gamePhaseRef: React.MutableRefObject<GamePhase>;
  currentScenePlatformsRef: React.MutableRefObject<TerrainPlatform[]>;
  isMouseDownRef: React.MutableRefObject<boolean>;
  shotRequestedRef: React.MutableRefObject<boolean>;
  keysPressedRef: React.MutableRefObject<Record<string, boolean>>;
  score: number;
  selectedStaffId: string;

  setPlayer: React.Dispatch<React.SetStateAction<PlayerState>>;
  setEnemies: React.Dispatch<React.SetStateAction<EnemyState[]>>;
  setProjectiles: React.Dispatch<React.SetStateAction<ProjectileState[]>>; // Added this line
  setVisualEffects: React.Dispatch<React.SetStateAction<VisualEffectState[]>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setActiveBoss: React.Dispatch<React.SetStateAction<EnemyState | null>>;
  setGamePhase: React.Dispatch<React.SetStateAction<GamePhase>>;
  setCurrentSceneId: React.Dispatch<React.SetStateAction<NarrativeNodeId>>;
  setAffinities: React.Dispatch<React.SetStateAction<Record<AffinityName, number>>>;
  setLockedNarrativePath: React.Dispatch<React.SetStateAction<AffinityName | null>>;
  setLastNarrativeMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setCurrentEnding: React.Dispatch<React.SetStateAction<{title: string, desc: string} | null>>;
  setCurrentVisualTheme: React.Dispatch<React.SetStateAction<AffinityName | null>>;
  setAchievedEndings: React.Dispatch<React.SetStateAction<Set<string>>>;
  setHighScores: React.Dispatch<React.SetStateAction<HighScoreEntry[]>>;
  setUnlockedStaffIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setAvailableStaves: React.Dispatch<React.SetStateAction<StaffDefinition[]>>;
  setObscuredHudCorners: React.Dispatch<React.SetStateAction<{ topLeft: boolean; topRight: boolean; bottomLeft: boolean; bottomRight: boolean; }>>;
  
  saveData: <T>(key: string, data: T) => void;
  setSoundTriggers: React.Dispatch<React.SetStateAction<SoundTriggerState>>; 
  
  scoreToSubmit: number | null;
  setScoreToSubmit: React.Dispatch<React.SetStateAction<number | null>>;
  endingToSubmit: {title: string, desc: string} | null;
  setEndingToSubmit: React.Dispatch<React.SetStateAction<{title: string, desc: string} | null>>;
}

export const useGameFlow = (props: UseGameFlowProps) => {
  const {
    playerRef, enemiesRef, projectilesRef, collectiblesRef, visualEffectsRef, currentSceneIdRef,
    affinitiesRef, lockedNarrativePathRef, completedCombatScenesRef, lastCombatSceneIdClearedRef,
    sceneJustLoadedRef, activeBossRef, gamePhaseRef, currentScenePlatformsRef,
    isMouseDownRef, shotRequestedRef, keysPressedRef, score, selectedStaffId,
    setPlayer, setEnemies, setProjectiles, setVisualEffects, setScore, setActiveBoss, setGamePhase, // Added setProjectiles
    setCurrentSceneId, setAffinities, setLockedNarrativePath, setLastNarrativeMessage,
    setCurrentEnding, setCurrentVisualTheme, setAchievedEndings, setHighScores,
    setUnlockedStaffIds, setAvailableStaves, setObscuredHudCorners, saveData,
    setSoundTriggers, scoreToSubmit, setScoreToSubmit, endingToSubmit, setEndingToSubmit,
  } = props;

  const narrativeTimeoutIdRef = useRef<number | null>(null);

  const showNarrativeMessage = useCallback((message: string, duration: number = 4000) => {
    setLastNarrativeMessage(message);
    if (narrativeTimeoutIdRef.current) clearTimeout(narrativeTimeoutIdRef.current);
    narrativeTimeoutIdRef.current = window.setTimeout(() => setLastNarrativeMessage(null), duration);
  }, [setLastNarrativeMessage]);

  const prepareForNamePrompt = useCallback((finalScore: number, endingDetails: {title: string, desc: string} | null) => {
    setScoreToSubmit(finalScore);
    setEndingToSubmit(endingDetails);
    setGamePhase(GamePhase.EnterNamePrompt);
    gamePhaseRef.current = GamePhase.EnterNamePrompt;
    if (activeBossRef.current) setActiveBoss(null);
  }, [setScoreToSubmit, setEndingToSubmit, setGamePhase, gamePhaseRef, setActiveBoss, activeBossRef]);


  const finalizeScoreSubmission = useCallback((playerName: string) => {
    const finalPlayerName = playerName.trim() === "" ? "Anônimo" : playerName;
    
    if (scoreToSubmit === null) {
      console.error("finalizeScoreSubmission called with null scoreToSubmit.");
      setGamePhase(GamePhase.MainMenu); 
      gamePhaseRef.current = GamePhase.MainMenu;
      return;
    }

    let finalEndingDetails = endingToSubmit;

    if (finalEndingDetails) { 
      setCurrentVisualTheme(lockedNarrativePathRef.current); 
      setCurrentEnding(finalEndingDetails);

      if (finalEndingDetails.title !== "Ciclo do Sistema Incompleto") {
        setAchievedEndings(prevEndings => {
          const newEndingsSet = new Set(prevEndings).add(finalEndingDetails!.title);
          saveData('achievedEndings', newEndingsSet);
          return newEndingsSet;
        });

        const unlockedStaff = ENDING_STAFF_UNLOCK_MAP[finalEndingDetails.title];
        if (unlockedStaff) {
          setUnlockedStaffIds(prevUnlocked => {
            const newUnlockedStaffsSet = new Set(prevUnlocked).add(unlockedStaff);
            saveData('unlockedStaffIds', newUnlockedStaffsSet);
            const updatedAvailableStaves = Array.from(newUnlockedStaffsSet).map(id => ALL_STAVES_MAP[id]).filter(Boolean) as StaffDefinition[];
            setAvailableStaves(updatedAvailableStaves.length > 0 ? updatedAvailableStaves : [ALL_STAVES_MAP[DEFAULT_STAFF_ID]]);
            return newUnlockedStaffsSet;
          });
        }
      }
    } else { 
      setCurrentVisualTheme(null);
      setCurrentEnding(null); 
    }
    
    setHighScores(prevHighScores => {
      const newHighScoresList = [...prevHighScores, { score: scoreToSubmit, name: finalPlayerName, date: new Date().toISOString(), endingTitle: finalEndingDetails?.title }];
      newHighScoresList.sort((a, b) => b.score - a.score);
      const topScores = newHighScoresList.slice(0, 10);
      saveData('highScores', topScores);
      return topScores;
    });

    setGamePhase(finalEndingDetails ? GamePhase.Ending : GamePhase.GameOver);
    setScoreToSubmit(null);
    setEndingToSubmit(null);

  }, [scoreToSubmit, endingToSubmit, setCurrentVisualTheme, setCurrentEnding, setAchievedEndings, saveData, setUnlockedStaffIds, setAvailableStaves, setHighScores, setGamePhase, gamePhaseRef, lockedNarrativePathRef, setScoreToSubmit, setEndingToSubmit]);


  const checkEndGameCondition = useCallback(() => {
    const narrativeNode = NARRATIVE_TREE[currentSceneIdRef.current];

    if (gamePhaseRef.current === GamePhase.Ending || gamePhaseRef.current === GamePhase.MainMenu || gamePhaseRef.current === GamePhase.CompendiumView || gamePhaseRef.current === GamePhase.EnterNamePrompt) {
      return;
    }

    if (!(narrativeNode && narrativeNode.isTerminal)) {
      console.warn(`[checkEndGameCondition] Called on non-terminal node ${currentSceneIdRef.current}. Setting to SceneCleared.`);
      setGamePhase(GamePhase.SceneCleared);
      return;
    }

    let chosenEndingDetails: { title: string; desc: string };
    const currentEndingNodeId = currentSceneIdRef.current;

    let determinedAffinityForEnding: AffinityName | null = null;
    for (const key of Object.keys(AFFINITY_NARRATIVES) as AffinityName[]) {
      if (currentEndingNodeId.startsWith(key.toUpperCase().replace('Ê', 'E').replace('Ç', 'C').replace('Ã', 'A'))) {
        determinedAffinityForEnding = key;
        break;
      }
    }

    if (determinedAffinityForEnding && narrativeNode && narrativeNode.isTerminal) {
      const affinityEndings = AFFINITY_NARRATIVES[determinedAffinityForEnding].endings;
      let endingDescSuffix = "";
      if (playerRef.current.currentAscensionLevel) {
        endingDescSuffix = `\n\n(Ascensão Nível ${playerRef.current.currentAscensionLevel} influenciou este desfecho.)`;
      }

      let endingIndex = 0;
      if (currentEndingNodeId.endsWith('_FINAL_B')) endingIndex = 1;
      else if (currentEndingNodeId.endsWith('_FINAL_C')) endingIndex = 2;

      chosenEndingDetails = { ...affinityEndings[endingIndex], desc: affinityEndings[endingIndex].desc + endingDescSuffix };
    } else {
      chosenEndingDetails = { title: "Ciclo do Sistema Incompleto", desc: "O fluxo de dados se dissipa. Nenhum caminho narrativo dominante foi forjado. O sistema aguarda outra iteração." };
      if (playerRef.current.currentAscensionLevel) {
        chosenEndingDetails.desc += `\n\n(Ascensão Nível ${playerRef.current.currentAscensionLevel} notada.)`;
      }
    }
    prepareForNamePrompt(score, chosenEndingDetails);

  }, [score, playerRef, gamePhaseRef, currentSceneIdRef, prepareForNamePrompt, setGamePhase]);


  const loadScene = useCallback((sceneId: NarrativeNodeId) => {
    projectilesRef.current = [];
    setProjectiles([]); // Ensure state is also cleared
    collectiblesRef.current = [];
    visualEffectsRef.current = [];
    setVisualEffects([]);
    setActiveBoss(null);

    isMouseDownRef.current = false;
    shotRequestedRef.current = false;

    console.log(`[LOAD SCENE] Loading scene: ${sceneId}. Combat scenes completed: ${completedCombatScenesRef.current}`);

    if (playerRef.current.chosenEffects.some(effect => effect.id === 'esperanca_asc2')) { 
        playerRef.current.hasDivineInterventionOncePerScene = true;
    }

    setCurrentSceneId(sceneId);
    currentSceneIdRef.current = sceneId; 
    const sceneDefinition = SCENE_DEFINITIONS[sceneId];
    const narrativeNodeForScene = NARRATIVE_TREE[sceneId];

    if (!sceneDefinition) {
      console.error(`Scene definition for ${sceneId} not found! Preparing for name prompt (defaulting to incomplete ending).`);
      prepareForNamePrompt(score, { title: "Falha Catastrófica do Sistema", desc: `A definição da cena ${sceneId} não foi encontrada. O sistema colapsou.`});
      return;
    }

    currentScenePlatformsRef.current = sceneDefinition.platforms || DEFAULT_PLATFORMS;

    const newEnemies: EnemyState[] = [];
    if (sceneDefinition.enemyCount > 0) {
      let enemyTypesToSpawn = sceneDefinition.enemyTypes;
      if (!enemyTypesToSpawn || enemyTypesToSpawn.length === 0) {
        console.warn(`[LOAD SCENE ${sceneId}] No enemyTypes defined for scene with enemyCount > 0. Using fallback.`);
        enemyTypesToSpawn = getEnemyPoolForNode(sceneId);
      }

      for (let i = 0; i < sceneDefinition.enemyCount; i++) {
        const typeIndex = i % enemyTypesToSpawn.length;
        const enemyTypeKey = enemyTypesToSpawn[typeIndex] || getEnemyPoolForNode(sceneId)[0];
        const enemyData = THEMATIC_ENEMY_DATA[enemyTypeKey] || THEMATIC_ENEMY_DATA['basic_flyer'];

        const sceneDifficultyFactor = completedCombatScenesRef.current * 0.10;
        const scaledHP = enemyData.hp + enemyData.hp * sceneDifficultyFactor * (enemyData.behaviorProps?.isBoss ? 1.25 : 1);
        const scaledSpeed = enemyData.speed + enemyData.speed * sceneDifficultyFactor * 0.35;
        const scaledDamage = enemyData.baseDamage + enemyData.baseDamage * sceneDifficultyFactor * 0.12 * (enemyData.behaviorProps?.isBoss ? 1.25 : 1);
        const scaledAttackCooldown = Math.max(300, enemyData.attackCooldown - completedCombatScenesRef.current * 20);

        const enemyToAdd: EnemyState = {
          id: `enemy-${sceneId}-${i}-${Date.now()}`,
          x: Math.random() * (GAME_WIDTH - enemyData.width),
          y: Math.random() * 50 + 20,
          width: enemyData.width, height: enemyData.height, hp: scaledHP, maxHp: scaledHP,
          type: enemyTypeKey, speed: scaledSpeed, attackCooldown: scaledAttackCooldown,
          lastAttackTime: Date.now() + Math.random() * scaledAttackCooldown,
          targetYOffset: 80 + Math.random() * 80, 
          damage: scaledDamage, // Assign scaledDamage to damage
          behaviorProps: { ...(enemyData.behaviorProps || {}), isBoss: sceneDefinition.isBossScene },
          isDashing: false,
          dashSpeed: (enemyData.behaviorProps?.dashSpeed || ENEMY_PROJECTILE_SPEED + 4.8) + sceneDifficultyFactor,
          dashDuration: enemyData.behaviorProps?.dashDuration || 280,
          dashCooldownTime: Math.max(800, (enemyData.behaviorProps?.dashCooldownTime || 2800) - completedCombatScenesRef.current * 60),
          lastDashTime: Date.now() - Math.random() * (enemyData.behaviorProps?.dashCooldownTime || 2800),
          isPreparingDash: false,
          prepareDashDuration: Math.max(180, (enemyData.behaviorProps?.prepareDashDuration || 650) - completedCombatScenesRef.current * 10),
          lastFirewallSpawnTime: (enemyData.behaviorProps?.createsFirewalls) ? Date.now() : undefined,
          hasSplit: false,
        };
        newEnemies.push(enemyToAdd);
        if (sceneDefinition.isBossScene) {
          setActiveBoss(enemyToAdd);
          activeBossRef.current = enemyToAdd;
          let bossPreamble = `ALERTA DE PROTOCOLO HOSTIL: ${narrativeNodeForScene?.title || sceneDefinition.displayName}`;
          if (playerRef.current.currentAscensionLevel) {
            bossPreamble += ` (Ascensão Nv. ${playerRef.current.currentAscensionLevel})`;
          }
          showNarrativeMessage(bossPreamble, 6000);
          setSoundTriggers(prev => ({ ...prev, bossRoar: Date.now() }));
        }
      }
      enemiesRef.current = newEnemies;
      setEnemies(newEnemies);
    } else {
      enemiesRef.current = [];
      setEnemies([]);
    }

    sceneJustLoadedRef.current = true;
    setGamePhase(GamePhase.Playing);
    gamePhaseRef.current = GamePhase.Playing;

  }, [
    score, projectilesRef, setProjectiles, collectiblesRef, visualEffectsRef, setVisualEffects, setActiveBoss, isMouseDownRef, shotRequestedRef,
    completedCombatScenesRef, setCurrentSceneId, currentSceneIdRef, prepareForNamePrompt, currentScenePlatformsRef,
    setEnemies, enemiesRef, sceneJustLoadedRef, setGamePhase, gamePhaseRef, showNarrativeMessage, playerRef, activeBossRef, setSoundTriggers
  ]);

  const resetGame = useCallback((startPhase: GamePhase = GamePhase.Intro, startSceneId: NarrativeNodeId = 'ROOT') => {
    console.log(`[RESET GAME] Target Phase: ${startPhase}, Start Scene: ${startSceneId}, Selected Staff: ${selectedStaffId}`);
    const staffToUse = ALL_STAVES_MAP[selectedStaffId] || ALL_STAVES_MAP[DEFAULT_STAFF_ID];
    const initialSceneDef = SCENE_DEFINITIONS[startSceneId] || SCENE_DEFINITIONS['ROOT'];
    const initialPlatforms = initialSceneDef.platforms || DEFAULT_PLATFORMS;
    currentScenePlatformsRef.current = initialPlatforms;
    const groundPlatform = initialPlatforms.find(p => p.id === 'ground') || { height: 30 };

    const initialPlayerState: PlayerState = {
        id: 'player', x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: GAME_HEIGHT - PLAYER_HEIGHT - groundPlatform.height,
        width: PLAYER_WIDTH, height: PLAYER_HEIGHT, hp: INITIAL_PLAYER_HP, maxHp: INITIAL_PLAYER_HP,
        speed: PLAYER_SPEED, jumpForce: JUMP_FORCE, isJumping: false, velocityY: 0, direction: 'right',
        attackSpeed: staffToUse.baseAttackSpeed, lastShotTime: 0, projectileDamage: staffToUse.baseDamage,
        critChance: 0.05, defense: 0, currentStaff: staffToUse, chosenEffects: [], 
        jumpsLeft: 1, maxJumps: 1, invulnerableUntil: 0,
        projectilesCanPierce: 0,
        projectileSizeMultiplier: INITIAL_PROJECTILE_SIZE_MULTIPLIER,
        invulnerabilityDurationOnHit: INITIAL_INVULNERABILITY_ON_HIT,
        critDamageMultiplier: INITIAL_CRIT_DAMAGE_MULTIPLIER, activeWisps: [],
        lastThunderboltTime: undefined, thunderboltCooldown: undefined, thunderboltsPerActivation: undefined,
        baseHealingOrbDropChance: BASE_HEALING_ORB_DROP_CHANCE,
        additionalHealingOrbChance: 0, 
        canDropSoulOrbs: undefined, soulOrbChance: undefined,
        enemiesExplodeOnDeath: undefined, fragmentationCount: undefined,
        lifeStealPercentage: undefined, canTriggerRage: undefined, regrowthRatePerEnemy: undefined,
        hasBarrierShield: undefined, barrierCooldown: undefined, lastBarrierActivationTime: undefined,
        distanceRanSinceLastFrictionProjectile: 0, frictionProjectileThreshold: undefined, frictionProjectilesToLaunch: undefined,
        currentAscensionLevel: null,
        ascensionAffinity: null,
        activeMinions: [],
        etherealUntil: undefined, lastMinionSpawnTime: undefined,
        lastDamageDealtTime: undefined,
        causesFearOnHit: false, fearDuration: 2000,
        critCausesBleed: false, critWeakensArmor: false, 
        enemiesExplodeViolentlyModifier: 1, playerTakesRecoilFromViolentExplosion: false,
        extraChoiceInEvent: false, 
        projectileConversionChance: 0, convertedProjectileDamageMultiplier: 0.5, 
        hasTemporalDistortionAura: false, temporalAuraRadius: 180, temporalAuraSlowFactor: 0.6,
        attacksApplyVulnerabilityMark: false, vulnerabilityMarkMaxStacks: 5, vulnerabilityMarkDamageIncreasePerStack: 0.08, 
        summonsHungeringShadow: false, killHasChanceToCreateBlackHole: 0,
        contactDamageBonus: 0, 
        hasLifeDegeneration: false, lifeDegenerationRate: 1, 
        periodicallySpawnsMinions: false, minionTypeToSpawn: 'carne_spawnling', minionSpawnInterval: 7000, maxMinionsAllowed: 3,
        passiveHpRegenAmount: 0, 
        hasDivineInterventionOncePerScene: false, 
        chanceToNullifyAttackAndHeal: 0, nullifyHealAmount: 10, healingOrbsArePotent: false,
        hasChaoticProjectiles: false, 
        nearbyEnemiesChanceToConfuse: 0, confusionDuration: 3000,
        unpredictablePlayerSpeedActive: false, 
        teleportOnHitChance: 0, 
        chanceToDuplicateProjectiles: 0,
        etherealOnJump: false, etherealDuration: 600, 
        projectilesCausePsychicExplosion: false, psychicExplosionDamageFactor: 0.4, 
        activeSkillCooldownReductionFactor: 1, chanceToResetCooldownOnUse: 0,
        activeAuraColor: undefined, particleEffectType: null,
    };
    setPlayer(initialPlayerState);
    playerRef.current = initialPlayerState;

    setEnemies([]);
    enemiesRef.current = [];
    projectilesRef.current = [];
    setProjectiles([]); // Also set state
    collectiblesRef.current = [];
    setVisualEffects([]);
    visualEffectsRef.current = [];
    setScore(0);
    setCurrentSceneId(startSceneId);
    currentSceneIdRef.current = startSceneId;
    setAffinities(INITIAL_AFFINITIES);
    affinitiesRef.current = INITIAL_AFFINITIES;
    setLockedNarrativePath(null);
    lockedNarrativePathRef.current = null;
    setLastNarrativeMessage(null);
    if (narrativeTimeoutIdRef.current) clearTimeout(narrativeTimeoutIdRef.current);
    narrativeTimeoutIdRef.current = null;
    setCurrentEnding(null);
    setCurrentVisualTheme(null);
    setActiveBoss(null);
    activeBossRef.current = null;
    completedCombatScenesRef.current = 0;
    lastCombatSceneIdClearedRef.current = null;
    setScoreToSubmit(null);
    setEndingToSubmit(null);

    keysPressedRef.current = {};
    isMouseDownRef.current = false;
    shotRequestedRef.current = false;
    sceneJustLoadedRef.current = false;
    setObscuredHudCorners({ topLeft: false, topRight: false, bottomLeft: false, bottomRight: false });

    setGamePhase(startPhase);
    gamePhaseRef.current = startPhase;

    if (startPhase === GamePhase.Intro) {
      // IntroScreen handles itself
    } else if (startPhase !== GamePhase.MainMenu && startPhase !== GamePhase.CompendiumView && startPhase !== GamePhase.StaffSelection && startPhase !== GamePhase.TrophyRoomView && startPhase !== GamePhase.HallOfFameView) {
      loadScene(startSceneId);
    }
  }, [selectedStaffId, loadScene, currentScenePlatformsRef, playerRef, enemiesRef, projectilesRef, collectiblesRef, visualEffectsRef, currentSceneIdRef, affinitiesRef, lockedNarrativePathRef, activeBossRef, gamePhaseRef, completedCombatScenesRef, lastCombatSceneIdClearedRef, sceneJustLoadedRef, isMouseDownRef, shotRequestedRef, keysPressedRef, setPlayer, setEnemies, setProjectiles, setVisualEffects, setScore, setCurrentSceneId, setAffinities, setLockedNarrativePath, setLastNarrativeMessage, setCurrentEnding, setCurrentVisualTheme, setActiveBoss, setGamePhase, setObscuredHudCorners, setScoreToSubmit, setEndingToSubmit]);

  const processNextGameStep = useCallback(() => {
    const currentScene = currentSceneIdRef.current;
    const narrativeNodeForScene = NARRATIVE_TREE[currentScene];

    console.log(`[PROCESS NEXT GAME STEP] Processing for scene: ${currentScene}`);

    if (!narrativeNodeForScene) {
      console.error(`[PROCESS NEXT GAME STEP] ERROR: Missing narrativeNode for ${currentScene}. Preparing for name prompt (defaulting).`);
      prepareForNamePrompt(score, { title: "Falha Interna do Sistema", desc: `O nó narrativo ${currentScene} é inválido.`});
      return;
    }
    
    setSoundTriggers(prev => ({ ...prev, sceneClearedSound: Date.now() }));


    if (narrativeNodeForScene.isTerminal) {
      console.log(`[PROCESS NEXT GAME STEP] Current scene ${currentScene} is terminal. Calling checkEndGameCondition.`);
      checkEndGameCondition();
    } else if (narrativeNodeForScene.choices && narrativeNodeForScene.choices.length > 0) {
      console.log(`[PROCESS NEXT GAME STEP] Node ${currentScene} has choices. Setting GamePhase to NarrativeDecision.`);
      setGamePhase(GamePhase.NarrativeDecision);
      gamePhaseRef.current = GamePhase.NarrativeDecision;
    } else {
      console.error(`[PROCESS NEXT GAME STEP] Node ${currentScene} is not terminal and has no choices. This is a dead end. Preparing for name prompt (defaulting).`);
      prepareForNamePrompt(score, { title: "Loop Infinito Detectado", desc: `O nó narrativo ${currentScene} não leva a lugar nenhum.`});
    }
  }, [score, checkEndGameCondition, loadScene, setGamePhase, gamePhaseRef, currentSceneIdRef, setSoundTriggers, prepareForNamePrompt]);

  const handleNarrativeChoice = useCallback((choice: NarrativeChoiceDefinition) => {
    console.log(`[NARRATIVE CHOICE] Choice: ${choice.id}, LeadsTo: ${choice.leadsToNode}`);
    setSoundTriggers(prev => ({...prev, narrativeChoiceMade: Date.now() }));


    setPlayer(prevPlayer => {
      let updatedPlayer = { ...playerRef.current };
      if (choice.grantsEffectId) {
        const effectDefinition = ALL_EFFECTS_MAP[choice.grantsEffectId];
        if (effectDefinition) {
          updatedPlayer = effectDefinition.applyEffect(updatedPlayer, enemiesRef.current);
          updatedPlayer.chosenEffects = [...updatedPlayer.chosenEffects, effectDefinition];
          setSoundTriggers(prev => ({ ...prev, effectActivatePositive: Date.now() }));

          if (effectDefinition.getAffinityImpact) {
            const effectAffinityImpact = effectDefinition.getAffinityImpact();
            setAffinities(prevAffinities => {
              const newAffinities = { ...prevAffinities };
              for (const key in effectAffinityImpact) {
                const affinityKey = key as AffinityName;
                newAffinities[affinityKey] = (newAffinities[affinityKey] || 0) + (effectAffinityImpact[affinityKey] || 0);
              }
              affinitiesRef.current = newAffinities;
              return newAffinities;
            });
          }
          const effectAffinityForMessage = Object.keys(AFFINITY_CARD_TRIGGERS).find(affKey =>
            AFFINITY_CARD_TRIGGERS[affKey as AffinityName]?.[effectDefinition.id]
          ) as AffinityName | undefined;

          if (effectAffinityForMessage) {
            showNarrativeMessage(`${AFFINITY_NARRATIVES[effectAffinityForMessage].displayName}: ${AFFINITY_CARD_TRIGGERS[effectAffinityForMessage]?.[effectDefinition.id]}`, 5000);
          } else {
            showNarrativeMessage(`Habilidade Adquirida: ${effectDefinition.name}`, 4000);
          }
        } else {
          console.error(`Definição do efeito ${choice.grantsEffectId} não encontrada!`);
        }
      }

      if (choice.setsAscensionLevel) {
        updatedPlayer.currentAscensionLevel = choice.setsAscensionLevel;
      }
      if (choice.setsAscensionAffinity) {
        updatedPlayer.ascensionAffinity = choice.setsAscensionAffinity;
        setLockedNarrativePath(choice.setsAscensionAffinity);
        lockedNarrativePathRef.current = choice.setsAscensionAffinity;
        setCurrentVisualTheme(choice.setsAscensionAffinity);
      }
      playerRef.current = updatedPlayer;
      return updatedPlayer;
    });

    setAffinities(prevAffinities => {
      const newAffinities = { ...prevAffinities };
      for (const key in choice.affinityBoost) {
        const affinityKey = key as AffinityName;
        newAffinities[affinityKey] = (newAffinities[affinityKey] || 0) + (choice.affinityBoost[affinityKey] || 0);
      }
      if (!lockedNarrativePathRef.current && !choice.setsAscensionAffinity) {
        const sorted = (Object.keys(newAffinities) as AffinityName[]).sort((a, b) => newAffinities[b] - newAffinities[a]);
        if (newAffinities[sorted[0]] >= AFFINITY_NARRATIVES[sorted[0]].ascensionChoices.length) { 
             setCurrentVisualTheme(sorted[0]);
        } else {
             setCurrentVisualTheme(null);
        }
      }
      affinitiesRef.current = newAffinities;
      return newAffinities;
    });

    if (choice.dialogueResponse && choice.dialogueResponse.length > 0) {
      showNarrativeMessage(`Seraph: "${choice.dialogueResponse.join(' ')}"`, 3000);
      setTimeout(() => showNarrativeMessage(choice.effectDescription, 5000), choice.grantsEffectId ? 4100 : 3100);
    } else {
      showNarrativeMessage(choice.effectDescription, 5000);
    }

    const nextNode = NARRATIVE_TREE[choice.leadsToNode];
    if (nextNode && nextNode.isTerminal && !choice.setsAscensionAffinity) {
      const affinityNameForTheme = Object.keys(AFFINITY_NARRATIVES).find(
        affName => choice.leadsToNode.startsWith(affName.toUpperCase().replace('Ê', 'E').replace('Ç', 'C').replace('Ã', 'A'))
      ) as AffinityName | undefined;

      if (affinityNameForTheme) setCurrentVisualTheme(affinityNameForTheme);
    }

    const sceneDefinition = SCENE_DEFINITIONS[choice.leadsToNode];
    if (sceneDefinition && (sceneDefinition.enemyCount > 0 || sceneDefinition.isBossScene)) {
      loadScene(choice.leadsToNode);
    } else {
      console.log(`[NARRATIVE CHOICE] No combat for ${choice.leadsToNode}. Proceeding to next step.`);
      setCurrentSceneId(choice.leadsToNode);
      currentSceneIdRef.current = choice.leadsToNode;
      processNextGameStep();
    }
  }, [
      playerRef, enemiesRef, setPlayer, setAffinities, affinitiesRef, showNarrativeMessage,
      setLockedNarrativePath, lockedNarrativePathRef, setCurrentVisualTheme, loadScene,
      setCurrentSceneId, currentSceneIdRef, processNextGameStep, setSoundTriggers
    ]);

  const checkAndHandlePlayerDeath = useCallback(() => {
    if (playerRef.current.hp <= 0 && gamePhaseRef.current === GamePhase.Playing) {
        prepareForNamePrompt(score, null); 
    }
  }, [playerRef, gamePhaseRef, score, prepareForNamePrompt]);

  return {
    resetGame,
    loadScene,
    processNextGameStep,
    checkEndGameCondition,
    handleNarrativeChoice,
    showNarrativeMessage,
    checkAndHandlePlayerDeath,
    finalizeScoreSubmission,
  };
};