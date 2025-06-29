
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS } from '../constants';

const sceneId: NarrativeNodeId = 'VINGANCA_FINAL_C';
const narrativeNode = NARRATIVE_TREE[sceneId];

export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode.title || "Vingança: Trono de Cinzas",
  enemyTypes: ['vinganca_boss_ira'], 
  enemyCount: 1,
  isBossScene: true,
  platforms: DEFAULT_PLATFORMS, 
};
