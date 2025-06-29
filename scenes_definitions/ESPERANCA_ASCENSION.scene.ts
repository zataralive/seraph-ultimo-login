
import { SceneDefinition, NarrativeNodeId, EnemyTypeKey } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS, PATH_ENEMY_POOL, ASCENSION_NODE_ENEMY_POOL_BASE } from '../constants';

const sceneId: NarrativeNodeId = 'ESPERANCA_ASCENSION';
const narrativeNode = NARRATIVE_TREE[sceneId];

const enemyPool: EnemyTypeKey[] = [
    ...(PATH_ENEMY_POOL['Esperança'] || []),
    ...ASCENSION_NODE_ENEMY_POOL_BASE
];
const uniqueEnemyTypes = Array.from(new Set(enemyPool));

export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode?.title || "Ascensão da Esperança",
  enemyTypes: [uniqueEnemyTypes[0] || 'esperanca_sentinela', uniqueEnemyTypes[1] || 'esperanca_aegis_orb'],
  enemyCount: 2,
  isBossScene: false,
  platforms: DEFAULT_PLATFORMS,
};
