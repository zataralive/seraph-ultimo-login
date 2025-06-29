
import { NarrativeNodeId, EnemyTypeKey } from './types';
import { THEMATIC_ENEMY_DATA } from './constants';

// Simplified helper to get a very basic fallback enemy pool
export const getEnemyPoolForNode = (nodeId?: NarrativeNodeId): EnemyTypeKey[] => { // nodeId can be optional now
  const allEnemyKeys = Object.keys(THEMATIC_ENEMY_DATA) as EnemyTypeKey[];
  if (allEnemyKeys.length > 0) {
    // Ensure the first key is returned as an array of EnemyTypeKey
    return [allEnemyKeys[0]]; 
  }
  // 'basic_flyer' is a valid EnemyTypeKey
  return ['basic_flyer']; 
};
