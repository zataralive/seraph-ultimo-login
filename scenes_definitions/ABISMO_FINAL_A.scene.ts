
import { SceneDefinition, NarrativeNodeId } from '../types';
import { NARRATIVE_TREE, DEFAULT_PLATFORMS } from '../constants';
const sceneId: NarrativeNodeId = 'ABISMO_FINAL_A';
const narrativeNode = NARRATIVE_TREE[sceneId];
export const scene: SceneDefinition = {
  id: sceneId,
  displayName: narrativeNode.title || "Abismo: Testemunha",
  enemyTypes: ['abismo_boss_leviathan'],
  enemyCount: 1,
  isBossScene: true,
  platforms: DEFAULT_PLATFORMS,
};
