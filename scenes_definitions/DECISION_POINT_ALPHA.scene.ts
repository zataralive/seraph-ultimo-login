
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS, DECISION_NODE_ENEMY_POOL } from '../constants';

const sceneId: NarrativeNodeId = 'DECISION_POINT_ALPHA';
const narrativeNode = NARRATIVE_TREE[sceneId];

export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode?.title || "Ponto de Decisão Alpha",
  enemyTypes: DECISION_NODE_ENEMY_POOL['DECISION_POINT_ALPHA'] || ['intelecto_sonda'], 
  enemyCount: 1, 
  isBossScene: false,
  platforms: DEFAULT_PLATFORMS,
};
