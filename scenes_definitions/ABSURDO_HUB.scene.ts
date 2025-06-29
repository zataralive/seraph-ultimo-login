
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS, PATH_ENEMY_POOL } from '../constants';
const sceneId: NarrativeNodeId = 'ABSURDO_HUB';
const narrativeNode = NARRATIVE_TREE[sceneId];
export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode.title || "Encruzilhada do Absurdo",
  enemyTypes: PATH_ENEMY_POOL['Absurdo'],
  enemyCount: 1, // Reduzido de 2 para 1
  isBossScene: false,
  platforms: DEFAULT_PLATFORMS,
  // cardNodeKeyOverride: 'MOBILITY_TIER_3_A', // Removed
};