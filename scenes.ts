
import { NarrativeNodeId, SceneDefinition } from './types';

// Import all individual scene definitions
import { scene as rootScene } from './scenes_definitions/ROOT.scene';
import { scene as nodeAScene } from './scenes_definitions/NODE_A.scene';
import { scene as nodeBScene } from './scenes_definitions/NODE_B.scene';
import { scene as nodeCScene } from './scenes_definitions/NODE_C.scene';

// New Ramification Nodes
import { scene as decisionPointAlphaScene } from './scenes_definitions/DECISION_POINT_ALPHA.scene';
import { scene as decisionPointBetaScene } from './scenes_definitions/DECISION_POINT_BETA.scene';
import { scene as decisionPointGammaScene } from './scenes_definitions/DECISION_POINT_GAMMA.scene';
import { scene as nodeXScene } from './scenes_definitions/NODE_X.scene';
import { scene as nodeYScene } from './scenes_definitions/NODE_Y.scene';

// Vingança
import { scene as vingancaHubScene } from './scenes_definitions/VINGANCA_HUB.scene';
import { scene as vingancaAscensionScene } from './scenes_definitions/VINGANCA_ASCENSION.scene';
import { scene as vingancaFinalAScene } from './scenes_definitions/VINGANCA_FINAL_A.scene';
import { scene as vingancaFinalBScene } from './scenes_definitions/VINGANCA_FINAL_B.scene';
import { scene as vingancaFinalCScene } from './scenes_definitions/VINGANCA_FINAL_C.scene';

// Intelecto
import { scene as intelectoHubScene } from './scenes_definitions/INTELECTO_HUB.scene';
import { scene as intelectoAscensionScene } from './scenes_definitions/INTELECTO_ASCENSION.scene';
import { scene as intelectoFinalAScene } from './scenes_definitions/INTELECTO_FINAL_A.scene';
import { scene as intelectoFinalBScene } from './scenes_definitions/INTELECTO_FINAL_B.scene';
import { scene as intelectoFinalCScene } from './scenes_definitions/INTELECTO_FINAL_C.scene';

// Abismo
import { scene as abismoHubScene } from './scenes_definitions/ABISMO_HUB.scene';
import { scene as abismoAscensionScene } from './scenes_definitions/ABISMO_ASCENSION.scene';
import { scene as abismoFinalAScene } from './scenes_definitions/ABISMO_FINAL_A.scene';
import { scene as abismoFinalBScene } from './scenes_definitions/ABISMO_FINAL_B.scene';
import { scene as abismoFinalCScene } from './scenes_definitions/ABISMO_FINAL_C.scene';

// Carne
import { scene as carneHubScene } from './scenes_definitions/CARNE_HUB.scene';
import { scene as carneAscensionScene } from './scenes_definitions/CARNE_ASCENSION.scene';
import { scene as carneFinalAScene } from './scenes_definitions/CARNE_FINAL_A.scene';
import { scene as carneFinalBScene } from './scenes_definitions/CARNE_FINAL_B.scene';
import { scene as carneFinalCScene } from './scenes_definitions/CARNE_FINAL_C.scene';

// Esperança
import { scene as esperancaHubScene } from './scenes_definitions/ESPERANCA_HUB.scene';
import { scene as esperancaAscensionScene } from './scenes_definitions/ESPERANCA_ASCENSION.scene';
import { scene as esperancaFinalAScene } from './scenes_definitions/ESPERANCA_FINAL_A.scene';
import { scene as esperancaFinalBScene } from './scenes_definitions/ESPERANCA_FINAL_B.scene';
import { scene as esperancaFinalCScene } from './scenes_definitions/ESPERANCA_FINAL_C.scene';

// Absurdo
import { scene as absurdoHubScene } from './scenes_definitions/ABSURDO_HUB.scene';
import { scene as absurdoAscensionScene } from './scenes_definitions/ABSURDO_ASCENSION.scene';
import { scene as absurdoFinalAScene } from './scenes_definitions/ABSURDO_FINAL_A.scene';
import { scene as absurdoFinalBScene } from './scenes_definitions/ABSURDO_FINAL_B.scene';
import { scene as absurdoFinalCScene } from './scenes_definitions/ABSURDO_FINAL_C.scene';

// Transcendência
import { scene as transcendenciaHubScene } from './scenes_definitions/TRANSCENDENCIA_HUB.scene';
import { scene as transcendenciaAscensionScene } from './scenes_definitions/TRANSCENDENCIA_ASCENSION.scene';
import { scene as transcendenciaFinalAScene } from './scenes_definitions/TRANSCENDENCIA_FINAL_A.scene';
import { scene as transcendenciaFinalBScene } from './scenes_definitions/TRANSCENDENCIA_FINAL_B.scene';
import { scene as transcendenciaFinalCScene } from './scenes_definitions/TRANSCENDENCIA_FINAL_C.scene';


export const SCENE_DEFINITIONS = {
  [rootScene.id]: rootScene,
  [nodeAScene.id]: nodeAScene,
  [nodeBScene.id]: nodeBScene,
  [nodeCScene.id]: nodeCScene,

  // New Ramification Nodes
  [decisionPointAlphaScene.id]: decisionPointAlphaScene,
  [decisionPointBetaScene.id]: decisionPointBetaScene,
  [decisionPointGammaScene.id]: decisionPointGammaScene,
  [nodeXScene.id]: nodeXScene,
  [nodeYScene.id]: nodeYScene,

  [vingancaHubScene.id]: vingancaHubScene,
  [vingancaAscensionScene.id]: vingancaAscensionScene,
  [vingancaFinalAScene.id]: vingancaFinalAScene,
  [vingancaFinalBScene.id]: vingancaFinalBScene,
  [vingancaFinalCScene.id]: vingancaFinalCScene,

  [intelectoHubScene.id]: intelectoHubScene,
  [intelectoAscensionScene.id]: intelectoAscensionScene,
  [intelectoFinalAScene.id]: intelectoFinalAScene,
  [intelectoFinalBScene.id]: intelectoFinalBScene,
  [intelectoFinalCScene.id]: intelectoFinalCScene,

  [abismoHubScene.id]: abismoHubScene,
  [abismoAscensionScene.id]: abismoAscensionScene,
  [abismoFinalAScene.id]: abismoFinalAScene,
  [abismoFinalBScene.id]: abismoFinalBScene,
  [abismoFinalCScene.id]: abismoFinalCScene,

  [carneHubScene.id]: carneHubScene,
  [carneAscensionScene.id]: carneAscensionScene,
  [carneFinalAScene.id]: carneFinalAScene,
  [carneFinalBScene.id]: carneFinalBScene,
  [carneFinalCScene.id]: carneFinalCScene,

  [esperancaHubScene.id]: esperancaHubScene,
  [esperancaAscensionScene.id]: esperancaAscensionScene,
  [esperancaFinalAScene.id]: esperancaFinalAScene,
  [esperancaFinalBScene.id]: esperancaFinalBScene,
  [esperancaFinalCScene.id]: esperancaFinalCScene,

  [absurdoHubScene.id]: absurdoHubScene,
  [absurdoAscensionScene.id]: absurdoAscensionScene,
  [absurdoFinalAScene.id]: absurdoFinalAScene,
  [absurdoFinalBScene.id]: absurdoFinalBScene,
  [absurdoFinalCScene.id]: absurdoFinalCScene,

  [transcendenciaHubScene.id]: transcendenciaHubScene,
  [transcendenciaAscensionScene.id]: transcendenciaAscensionScene,
  [transcendenciaFinalAScene.id]: transcendenciaFinalAScene,
  [transcendenciaFinalBScene.id]: transcendenciaFinalBScene,
  [transcendenciaFinalCScene.id]: transcendenciaFinalCScene,

} as Record<NarrativeNodeId, SceneDefinition>;
