
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS, PATH_ENEMY_POOL } from '../constants';

const sceneId: NarrativeNodeId = 'VINGANCA_HUB';
const narrativeNode = NARRATIVE_TREE[sceneId];

export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode.title || "Encruzilhada da Vingança",
  enemyTypes: PATH_ENEMY_POOL['Vingança'], 
  enemyCount: 3, 
  isBossScene: false,
  platforms: DEFAULT_PLATFORMS, 
  // cardNodeKeyOverride: 'OFFENSE_TIER_2_CRIT', // Removed
};
