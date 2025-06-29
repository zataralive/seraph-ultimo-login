
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS, PATH_ENEMY_POOL } from '../constants';
const sceneId: NarrativeNodeId = 'CARNE_HUB';
const narrativeNode = NARRATIVE_TREE[sceneId];
export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode.title || "Encruzilhada da Carne",
  enemyTypes: PATH_ENEMY_POOL['Carne'],
  enemyCount: 3,
  isBossScene: false,
  platforms: DEFAULT_PLATFORMS,
  // cardNodeKeyOverride: 'TERMINAL_CARNAGE', // Removed
};
