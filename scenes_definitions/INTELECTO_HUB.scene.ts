
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS, PATH_ENEMY_POOL } from '../constants';
const sceneId: NarrativeNodeId = 'INTELECTO_HUB';
const narrativeNode = NARRATIVE_TREE[sceneId];
export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode.title || "Encruzilhada do Intelecto",
  enemyTypes: PATH_ENEMY_POOL['Intelecto'],
  enemyCount: 3,
  isBossScene: false,
  platforms: DEFAULT_PLATFORMS,
  // cardNodeKeyOverride: 'DEFENSE_TIER_2_ARMOR', // Removed
};
