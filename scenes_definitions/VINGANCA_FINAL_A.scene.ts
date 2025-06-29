
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS } from '../constants';

const sceneId: NarrativeNodeId = 'VINGANCA_FINAL_A';
const narrativeNode = NARRATIVE_TREE[sceneId];

export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode.title || "Vingança: Absoluta",
  enemyTypes: ['vinganca_boss_ira'], // Specific boss for this ending
  enemyCount: 1,
  isBossScene: true,
  platforms: DEFAULT_PLATFORMS, // Customize for boss arena
};
