
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS } from '../constants';
const sceneId: NarrativeNodeId = 'ABSURDO_FINAL_B';
const narrativeNode = NARRATIVE_TREE[sceneId];
export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode.title || "Absurdo: Quarta Parede",
  enemyTypes: ['absurdo_boss_glitchking'],
  enemyCount: 1,
  isBossScene: true,
  platforms: DEFAULT_PLATFORMS,
};
