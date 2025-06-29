
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS } from '../constants';

const sceneId: NarrativeNodeId = 'VINGANCA_FINAL_B';
const narrativeNode = NARRATIVE_TREE[sceneId];

export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode.title || "Vingança: Ciclo Eterno",
  enemyTypes: ['vinganca_boss_ira'], // Can use same boss or a variant
  enemyCount: 1,
  isBossScene: true,
  platforms: DEFAULT_PLATFORMS, 
};
