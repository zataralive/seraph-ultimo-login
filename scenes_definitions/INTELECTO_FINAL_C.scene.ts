
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS } from '../constants';
const sceneId: NarrativeNodeId = 'INTELECTO_FINAL_C';
const narrativeNode = NARRATIVE_TREE[sceneId];
export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode.title || "Intelecto: Biblioteca Infinita",
  enemyTypes: ['intelecto_boss_core'],
  enemyCount: 1,
  isBossScene: true,
  platforms: DEFAULT_PLATFORMS,
};
