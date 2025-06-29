
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS, DECISION_NODE_ENEMY_POOL } from '../constants'; // Changed PLATFORMS to DEFAULT_PLATFORMS

const sceneId: NarrativeNodeId = 'NODE_X';
const narrativeNode = NARRATIVE_TREE[sceneId];

export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode?.title || "Nó Intermediário X",
  enemyTypes: DECISION_NODE_ENEMY_POOL['NODE_X'] || ['absurdo_reality_glitch', 'basic_flyer'], 
  enemyCount: 2, 
  isBossScene: false,
  platforms: DEFAULT_PLATFORMS, // Using default platforms
};
