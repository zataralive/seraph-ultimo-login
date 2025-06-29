
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS, DECISION_NODE_ENEMY_POOL } from '../constants';

const sceneId: NarrativeNodeId = 'DECISION_POINT_GAMMA';
const narrativeNode = NARRATIVE_TREE[sceneId];

export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode?.title || "Ponto de Decisão Gamma",
  enemyTypes: DECISION_NODE_ENEMY_POOL['DECISION_POINT_GAMMA'] || ['vinganca_estilhaco'], 
  enemyCount: 1, 
  isBossScene: false,
  platforms: DEFAULT_PLATFORMS,
};
