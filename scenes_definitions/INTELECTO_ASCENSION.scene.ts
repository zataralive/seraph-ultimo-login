
import { SceneDefinition, NarrativeNodeId, EnemyTypeKey } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS, PATH_ENEMY_POOL, ASCENSION_NODE_ENEMY_POOL_BASE } from '../constants';

const sceneId: NarrativeNodeId = 'INTELECTO_ASCENSION';
const narrativeNode = NARRATIVE_TREE[sceneId];

const enemyPool: EnemyTypeKey[] = [
    ...(PATH_ENEMY_POOL['Intelecto'] || []),
    ...ASCENSION_NODE_ENEMY_POOL_BASE
];
const uniqueEnemyTypes = Array.from(new Set(enemyPool));

export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode?.title || "Ascensão do Intelecto",
  enemyTypes: [uniqueEnemyTypes[0] || 'intelecto_sonda', uniqueEnemyTypes[1] || 'intelecto_glitch'],
  enemyCount: 2,
  isBossScene: false,
  platforms: DEFAULT_PLATFORMS,
};
