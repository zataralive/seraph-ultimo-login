
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS } from '../constants';
const sceneId: NarrativeNodeId = 'TRANSCENDENCIA_FINAL_C';
const narrativeNode = NARRATIVE_TREE[sceneId];
export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode.title || "Transcendência: Sonhador",
  enemyTypes: ['transcendencia_boss_fractal'],
  enemyCount: 1,
  isBossScene: true,
  platforms: DEFAULT_PLATFORMS,
};
