
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS, DECISION_NODE_ENEMY_POOL } from '../constants'; // Changed PLATFORMS to DEFAULT_PLATFORMS

const sceneId: NarrativeNodeId = 'NODE_Y';
const narrativeNode = NARRATIVE_TREE[sceneId];

export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode?.title || "Nó Intermediário Y",
  enemyTypes: DECISION_NODE_ENEMY_POOL['NODE_Y'] || ['esperanca_aegis_orb', 'basic_flyer'], 
  enemyCount: 2, 
  isBossScene: false,
  platforms: DEFAULT_PLATFORMS, // Using default platforms
};
