
import { SceneDefinition, NarrativeNodeId, EnemyTypeKey } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS, PATH_ENEMY_POOL, ASCENSION_NODE_ENEMY_POOL_BASE } from '../constants';

const sceneId: NarrativeNodeId = 'TRANSCENDENCIA_ASCENSION';
const narrativeNode = NARRATIVE_TREE[sceneId];

const enemyPool: EnemyTypeKey[] = [
    ...(PATH_ENEMY_POOL['Transcendência'] || []),
    ...ASCENSION_NODE_ENEMY_POOL_BASE
];
const uniqueEnemyTypes = Array.from(new Set(enemyPool));

export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode?.title || "Ascensão da Transcendência",
  enemyTypes: [uniqueEnemyTypes[0] || 'transcendencia_psionic_echo', uniqueEnemyTypes[1] || 'abismo_tentaculo'],
  enemyCount: 2,
  isBossScene: false,
  platforms: DEFAULT_PLATFORMS,
};
