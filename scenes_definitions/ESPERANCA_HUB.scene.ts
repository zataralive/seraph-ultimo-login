
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS, PATH_ENEMY_POOL } from '../constants';
const sceneId: NarrativeNodeId = 'ESPERANCA_HUB';
const narrativeNode = NARRATIVE_TREE[sceneId];
export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode.title || "Encruzilhada da Esperança",
  enemyTypes: PATH_ENEMY_POOL['Esperança'],
  enemyCount: 3,
  isBossScene: false,
  platforms: DEFAULT_PLATFORMS,
  // cardNodeKeyOverride: 'DEFENSE_TIER_3_A', // Removed
};
