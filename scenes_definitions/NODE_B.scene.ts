
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, PLATFORMS, DECISION_NODE_ENEMY_POOL } from '../constants';

const sceneId: NarrativeNodeId = 'NODE_B';
const narrativeNode = NARRATIVE_TREE[sceneId];

export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode.title || sceneId,
  enemyTypes: DECISION_NODE_ENEMY_POOL['NODE_B'] || ['vinganca_executor', 'dasher'], 
  enemyCount: 2, 
  isBossScene: false,
  platforms: PLATFORMS, 
};
