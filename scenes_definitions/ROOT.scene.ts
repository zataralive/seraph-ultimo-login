
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, PLATFORMS, DECISION_NODE_ENEMY_POOL } from '../constants'; // Added DECISION_NODE_ENEMY_POOL

const sceneId: NarrativeNodeId = 'ROOT';
const narrativeNode = NARRATIVE_TREE[sceneId];

export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode.title || sceneId,
  enemyTypes: DECISION_NODE_ENEMY_POOL['ROOT'] || ['basic_flyer'], 
  enemyCount: 1,    
  isBossScene: false,
  platforms: PLATFORMS,
};
