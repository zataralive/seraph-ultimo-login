
import { SceneDefinition, NarrativeNodeId, EnemyTypeKey } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS, PATH_ENEMY_POOL, ASCENSION_NODE_ENEMY_POOL_BASE } from '../constants';

const sceneId: NarrativeNodeId = 'VINGANCA_ASCENSION';
const narrativeNode = NARRATIVE_TREE[sceneId];

// Combine affinity-specific enemies with a base pool for ascension nodes
const enemyPool: EnemyTypeKey[] = [
    ...(PATH_ENEMY_POOL['Vingança'] || []),
    ...ASCENSION_NODE_ENEMY_POOL_BASE
];
// Ensure unique enemy types and select a few
const uniqueEnemyTypes = Array.from(new Set(enemyPool));


export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode?.title || "Ascensão da Vingança",
  enemyTypes: [uniqueEnemyTypes[0] || 'vinganca_estilhaco', uniqueEnemyTypes[1] || 'dasher'], // Example: 2 enemies
  enemyCount: 2, 
  isBossScene: false,
  platforms: DEFAULT_PLATFORMS,
};
