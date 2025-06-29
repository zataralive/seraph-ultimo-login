
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { NarrativeNodeId, NarrativeNodeDefinition, AffinityName, EnemyTypeKey } from '../types';
import { AFFINITY_NARRATIVES, ALL_EFFECTS_MAP, THEMATIC_ENEMY_DATA, NARRATIVE_PATHS_DISPLAY_NAMES } from '../constants';
import { SCENE_DEFINITIONS } from '../scenes';

interface NarrativeCompendiumProps {
  narrativeTree: Record<NarrativeNodeId, NarrativeNodeDefinition>;
  affinityDetails: typeof AFFINITY_NARRATIVES;
  onClose: () => void;
}

interface SingleCompendiumTheme {
  base: string;
  light: string;
  dark: string;
  accent: string;
  text: string;
  stream: string;
  choiceTextBg: string;
  choiceTextFill: string;
  icon: string; // Icon is now required
}

interface NodeDisplayInfo extends NarrativeNodeDefinition {
  level: number;
  x: number;
  y: number;
  childrenConnections: { to: NarrativeNodeId; choiceText?: string; choiceFullDescription?: string; }[];
  isHubNode?: boolean;
  isAscensionNode?: boolean;
  isFinalNode?: boolean;
  isAttributeBoostNode?: boolean;
  isDecisionPointNode?: boolean;
  isRootNode?: boolean;
  enemyTypes?: EnemyTypeKey[];
  enemyCount?: number;
  affinity?: AffinityName;
  nodeColor?: string;
  textColor?: string;
  borderColor?: string;
  icon?: string; 
  columnIndex?: number;
  parentColumnIndex?: number;
}

const NODE_WIDTH = 100; 
const NODE_HEIGHT = 50; 
const GRID_CELL_WIDTH = NODE_WIDTH + 60; 
const GRID_CELL_HEIGHT = NODE_HEIGHT + 50; 
const CANVAS_PADDING = 150; 
const MIN_CANVAS_DIMENSION = 1200; 


const getSpeakerDisplayName = (speakerKey?: string): string => {
    if (!speakerKey) return "Narrador";
    switch (speakerKey) {
      case "Seraph": return "Seraph (Pensamentos)";
      case "System": return "Entidade do Sistema";
      case "AlliedAI": return "Fragmento de IA Aliada";
      case "CorruptedEcho": return "Eco Corrompido";
      case "Concept": return "Voz da Afinidade";
      default: return speakerKey;
    }
  };

const compendiumAffinityThemeColors: Record<AffinityName, SingleCompendiumTheme> = {
    'Vingança': { base: 'bg-red-700', light: 'bg-red-500', dark: 'bg-red-900', accent: 'border-red-400', text: 'text-red-100', stream: 'stroke-red-500', choiceTextBg: 'fill-red-800/80', choiceTextFill: 'fill-red-100', icon: '🔥'},
    'Intelecto': { base: 'bg-blue-700', light: 'bg-blue-500', dark: 'bg-blue-900', accent: 'border-blue-400', text: 'text-blue-100', stream: 'stroke-blue-500', choiceTextBg: 'fill-blue-800/80', choiceTextFill: 'fill-blue-100', icon: '💡' },
    'Abismo': { base: 'bg-purple-800', light: 'bg-purple-600', dark: 'bg-purple-900', accent: 'border-purple-500', text: 'text-purple-100', stream: 'stroke-purple-600', choiceTextBg: 'fill-purple-900/80', choiceTextFill: 'fill-purple-100', icon: '🌀' },
    'Carne': { base: 'bg-orange-700', light: 'bg-orange-500', dark: 'bg-orange-900', accent: 'border-orange-400', text: 'text-orange-100', stream: 'stroke-orange-500', choiceTextBg: 'fill-orange-800/80', choiceTextFill: 'fill-orange-100', icon: '💪' },
    'Esperança': { base: 'bg-emerald-600', light: 'bg-emerald-400', dark: 'bg-emerald-800', accent: 'border-emerald-300', text: 'text-emerald-100', stream: 'stroke-emerald-500', choiceTextBg: 'fill-emerald-700/80', choiceTextFill: 'fill-emerald-100', icon: '🌟' },
    'Absurdo': { base: 'bg-fuchsia-700', light: 'bg-fuchsia-500', dark: 'bg-fuchsia-900', accent: 'border-fuchsia-400', text: 'text-fuchsia-100', stream: 'stroke-fuchsia-500', choiceTextBg: 'fill-fuchsia-800/80', choiceTextFill: 'fill-fuchsia-100', icon: '🎲' },
    'Transcendência': { base: 'bg-cyan-600', light: 'bg-cyan-400', dark: 'bg-cyan-800', accent: 'border-cyan-300', text: 'text-cyan-100', stream: 'stroke-cyan-500', choiceTextBg: 'fill-cyan-700/80', choiceTextFill: 'fill-cyan-100', icon: '🧘' },
};
const defaultThemeColors: SingleCompendiumTheme = { base: 'bg-slate-700', light: 'bg-slate-500', dark: 'bg-slate-800', accent: 'border-slate-400', text: 'text-slate-100', stream: 'stroke-slate-500', choiceTextBg: 'fill-slate-600/80', choiceTextFill: 'fill-slate-100', icon: '●' };
const rootNodeThemeColors: SingleCompendiumTheme = { ...defaultThemeColors, base: 'bg-green-600', light: 'bg-green-400', dark: 'bg-green-800', accent: 'border-green-300', text: 'text-green-100', stream: 'stroke-green-500', choiceTextBg: 'fill-green-700/80', choiceTextFill: 'fill-green-100', icon: '◈' };
const decisionNodeThemeColors: SingleCompendiumTheme = { ...defaultThemeColors, base: 'bg-sky-700', light: 'bg-sky-500', dark: 'bg-sky-900', accent: 'border-sky-400', text: 'text-sky-100', stream: 'stroke-sky-500', choiceTextBg: 'fill-sky-800/80', choiceTextFill: 'fill-sky-100', icon: '❓' };
const attributeNodeThemeColors: SingleCompendiumTheme = { ...defaultThemeColors, base: 'bg-teal-700', light: 'bg-teal-500', dark: 'bg-teal-900', accent: 'border-teal-400', text: 'text-teal-100', stream: 'stroke-teal-500', choiceTextBg: 'fill-teal-800/80', choiceTextFill: 'fill-teal-100', icon: '✨' };


export const NarrativeCompendiumComponent: React.FC<NarrativeCompendiumProps> = ({ narrativeTree, onClose }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<NarrativeNodeId | null>('ROOT'); 
  const [hoveredNodeId, setHoveredNodeId] = useState<NarrativeNodeId | null>(null);
  const [scale, setScale] = useState(0.65); 
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: MIN_CANVAS_DIMENSION, height: MIN_CANVAS_DIMENSION });
  const [panning, setPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const svgCanvasRef = useRef<HTMLDivElement>(null);


  const {
    positionedNodes,
    connections,
    calculatedCanvasWidth,
    calculatedCanvasHeight
  } = useMemo(() => {
    const nodesMap: Map<NarrativeNodeId, NodeDisplayInfo> = new Map();
    const posConnections: Array<{
        from: NarrativeNodeId;
        to: NarrativeNodeId;
        pathD: string;
        streamClass: string;
    }> = [];

    const gridOccupancy: Map<string, NarrativeNodeId> = new Map(); 
    const nodeGridPositions: Map<NarrativeNodeId, {row: number, col: number}> = new Map();

    let minRow = 0, maxRow = 0, minCol = 0, maxCol = 0;

    Object.values(narrativeTree).forEach(nodeDef => {
        if (nodeDef && nodeDef.id) {
            const sceneDef = SCENE_DEFINITIONS[nodeDef.id];
            let affinity: AffinityName | undefined = undefined;
            if (nodeDef.id.includes('_HUB') || nodeDef.id.includes('_ASCENSION') || nodeDef.id.includes('_FINAL')) {
                for (const affKey of Object.keys(NARRATIVE_PATHS_DISPLAY_NAMES) as AffinityName[]) {
                    const normalizedAffKey = affKey.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    if (nodeDef.id.startsWith(normalizedAffKey)) {
                        affinity = affKey;
                        break;
                    }
                }
            }
            const isRoot = nodeDef.id === 'ROOT';
            const isDecision = nodeDef.id.startsWith('DECISION_POINT');
            const isAttribute = nodeDef.id.startsWith('NODE_ATTRIB_BOOST');
            const isHub = nodeDef.id.endsWith('_HUB') && !!affinity;
            const isAscension = nodeDef.id.endsWith('_ASCENSION') && !!affinity;
            const isFinal = nodeDef.id.includes('_FINAL_') && !!affinity;

            let theme: SingleCompendiumTheme = defaultThemeColors;
            let iconDisplay = defaultThemeColors.icon;

            if (affinity) {
                theme = compendiumAffinityThemeColors[affinity];
                iconDisplay = compendiumAffinityThemeColors[affinity].icon || defaultThemeColors.icon;
                if (isAscension) iconDisplay = `${iconDisplay}↑`;
                else if (isFinal) iconDisplay = '🏁';

            } else if (isRoot) {
                theme = rootNodeThemeColors;
                iconDisplay = rootNodeThemeColors.icon;
            } else if (isDecision) {
                theme = decisionNodeThemeColors;
                iconDisplay = decisionNodeThemeColors.icon;
            } else if (isAttribute) {
                theme = attributeNodeThemeColors;
                iconDisplay = attributeNodeThemeColors.icon;
            }
            
            nodesMap.set(nodeDef.id, {
                ...nodeDef, level: -1, x: 0, y: 0, columnIndex: 0,
                childrenConnections: nodeDef.choices?.map(c => ({ to: c.leadsToNode, choiceText: c.choiceText, choiceFullDescription: c.fullDescription })) || [],
                isRootNode: isRoot, isDecisionPointNode: isDecision, isAttributeBoostNode: isAttribute,
                isHubNode: isHub, isAscensionNode: isAscension, isFinalNode: isFinal,
                enemyTypes: sceneDef?.enemyTypes, enemyCount: sceneDef?.enemyCount, affinity: affinity,
                nodeColor: theme.base, textColor: theme.text, borderColor: theme.accent, icon: iconDisplay,
            });
        }
    });

    const q: { nodeId: NarrativeNodeId; r: number; c: number; parentNodeId?: NarrativeNodeId }[] = [];
    if (nodesMap.has('ROOT')) {
        q.push({ nodeId: 'ROOT', r: 0, c: 0 });
        gridOccupancy.set("0,0", 'ROOT');
        nodeGridPositions.set('ROOT', {row: 0, col: 0});
    }

    let head = 0;
    while(head < q.length) {
        const { nodeId, r, c } = q[head++];
        const node = nodesMap.get(nodeId);
        if (!node) continue;

        minRow = Math.min(minRow, r); maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c); maxCol = Math.max(maxCol, c);

        const children = node.childrenConnections || [];
        let childColOffset = -Math.floor(children.length / 2) ;

        children.forEach((conn, childIndex) => {
            if (nodeGridPositions.has(conn.to)) return; 

            let placed = false;
            const preferredDr = 1; 

            let attemptCol = c + childColOffset + (children.length % 2 === 0 && childColOffset >= 0 ? 1 : 0);
            if (children.length === 1) attemptCol = c; 


            const potentialPositions = [
                { dr: preferredDr, dc: childColOffset }, 
                { dr: preferredDr, dc: childColOffset + 1 }, 
                { dr: preferredDr, dc: childColOffset - 1 }, 
                { dr: 0, dc: 1 + childIndex }, 
                { dr: 0, dc: -1 - childIndex }, 
                { dr: preferredDr + 1, dc: c }, 
            ];
            
            let bestPosKey: string | null = null;
            let bestPosR = 0, bestPosC = 0;

            for (const pos of potentialPositions) {
                const newR = r + pos.dr;
                const newC = (pos.dr === 0) ? c + pos.dc : attemptCol + pos.dc ; 
                const key = `${newR},${newC}`;
                if (!gridOccupancy.has(key)) {
                    bestPosKey = key; bestPosR = newR; bestPosC = newC;
                    placed = true;
                    break;
                }
            }
            
            if (!placed) { 
                for (let spread = 1; spread < 5 && !placed; spread++) { 
                    const fallbackPositions = [
                        {dr: preferredDr, dc: attemptCol + spread}, {dr: preferredDr, dc: attemptCol - spread}, 
                        {dr: preferredDr + spread, dc: c}, 
                        {dr: preferredDr + spread, dc: c + spread}, {dr: preferredDr + spread, dc: c - spread}, 
                        {dr: 0, dc: c + children.length + spread}, {dr: 0, dc: c - children.length - spread}, 
                    ];
                    for (const pos of fallbackPositions) {
                         const newR = r + pos.dr; const newC = c + pos.dc;
                         const key = `${newR},${newC}`;
                         if (!gridOccupancy.has(key)) {
                            bestPosKey = key; bestPosR = newR; bestPosC = newC;
                            placed = true; break;
                         }
                    }
                }
            }

            if (placed && bestPosKey) {
                gridOccupancy.set(bestPosKey, conn.to);
                nodeGridPositions.set(conn.to, {row: bestPosR, col: bestPosC});
                q.push({ nodeId: conn.to, r: bestPosR, c: bestPosC, parentNodeId: nodeId });
            } else {
                const fallbackR = r + preferredDr + 1;
                const fallbackC = c + childIndex - Math.floor(children.length/2);
                const fallbackKey = `${fallbackR},${fallbackC}`;
                if (!gridOccupancy.has(fallbackKey)) {
                    gridOccupancy.set(fallbackKey, conn.to);
                    nodeGridPositions.set(conn.to, {row: fallbackR, col: fallbackC});
                    q.push({ nodeId: conn.to, r: fallbackR, c: fallbackC, parentNodeId: nodeId });
                } else {
                    // If still cannot place, log it (this indicates very dense graph needing more sophisticated layout)
                     console.warn(`Compendium: Could not place node ${conn.to}. Using default offset from parent ${nodeId}.`);
                     const lastResortR = r + preferredDr + childIndex + 1; // Spread out further
                     const lastResortC = c;
                     const lastResortKey = `${lastResortR},${lastResortC}`;
                     gridOccupancy.set(lastResortKey, conn.to);
                     nodeGridPositions.set(conn.to, {row: lastResortR, col: lastResortC});
                     q.push({ nodeId: conn.to, r: lastResortR, c: lastResortC, parentNodeId: nodeId });
                }
            }
            childColOffset++;
        });
    }

    let finalMaxX = 0; let finalMaxY = 0; let finalMinX = Infinity; let finalMinY = Infinity;
    nodeGridPositions.forEach((pos, nodeId) => {
        const node = nodesMap.get(nodeId)!;
        node.x = (pos.col - minCol) * GRID_CELL_WIDTH + CANVAS_PADDING;
        node.y = (pos.row - minRow) * GRID_CELL_HEIGHT + CANVAS_PADDING;
        node.level = pos.row - minRow; 
        finalMaxX = Math.max(finalMaxX, node.x + NODE_WIDTH);
        finalMaxY = Math.max(finalMaxY, node.y + NODE_HEIGHT);
        finalMinX = Math.min(finalMinX, node.x);
        finalMinY = Math.min(finalMinY, node.y);
    });

    const xShift = finalMinX < CANVAS_PADDING ? CANVAS_PADDING - finalMinX : 0;
    const yShift = finalMinY < CANVAS_PADDING ? CANVAS_PADDING - finalMinY : 0;

    if (xShift > 0 || yShift > 0) {
      nodesMap.forEach(node => {
        if (nodeGridPositions.has(node.id)) { 
            node.x += xShift;
            node.y += yShift;
        }
      });
      finalMaxX += xShift;
      finalMaxY += yShift;
    }
    
    nodesMap.forEach(node => {
        if (!nodeGridPositions.has(node.id)) return; 
        node.childrenConnections.forEach(conn => {
            const childNode = nodesMap.get(conn.to);
            if (childNode && nodeGridPositions.has(childNode.id)) { 
                const fromX = node.x + NODE_WIDTH / 2;
                const fromY = node.y + NODE_HEIGHT / 2;
                const toX = childNode.x + NODE_WIDTH / 2;
                const toY = childNode.y + NODE_HEIGHT / 2;

                const pathD = `M ${fromX} ${fromY} L ${toX} ${toY}`; 

                let theme: SingleCompendiumTheme = defaultThemeColors;
                const streamAffinity = node.affinity || childNode.affinity;
                if (streamAffinity) theme = compendiumAffinityThemeColors[streamAffinity];
                else if (node.isRootNode) theme = rootNodeThemeColors;
                else if (node.isDecisionPointNode) theme = decisionNodeThemeColors;
                else if (node.isAttributeBoostNode) theme = attributeNodeThemeColors;

                posConnections.push({
                    from: node.id, to: conn.to,
                    pathD,
                    streamClass: theme.stream,
                });
            }
        });
    });

    const finalCalcCanvasWidth = Math.max(MIN_CANVAS_DIMENSION, finalMaxX + CANVAS_PADDING);
    const finalCalcCanvasHeight = Math.max(MIN_CANVAS_DIMENSION, finalMaxY + CANVAS_PADDING);

    return {
        positionedNodes: Array.from(nodesMap.values()).filter(n => nodeGridPositions.has(n.id)), 
        connections: posConnections,
        calculatedCanvasWidth: finalCalcCanvasWidth,
        calculatedCanvasHeight: finalCalcCanvasHeight
    };
  }, [narrativeTree]);


  const selectedNodeDetails = selectedNodeId ? positionedNodes.find(n => n.id === selectedNodeId) : null;

  const handleNodeClick = useCallback((nodeId: NarrativeNodeId) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleNodeMouseEnter = useCallback((nodeId: NarrativeNodeId) => {
    setHoveredNodeId(nodeId);
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, [setHoveredNodeId]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 0) { 
            setPanning(true);
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            if (svgCanvasRef.current) svgCanvasRef.current.style.cursor = 'grabbing';
        }
  }, []);

  const handleMouseUp = useCallback(() => {
        setPanning(false);
        if (svgCanvasRef.current) svgCanvasRef.current.style.cursor = 'grab';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!panning || !svgCanvasRef.current) return;
        const dx = (e.clientX - lastMousePos.current.x);
        const dy = (e.clientY - lastMousePos.current.y);
        setViewBox(vb => ({ ...vb, x: vb.x - dx / scale, y: vb.y - dy / scale }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, [panning, scale]); 

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!svgCanvasRef.current) return;
    e.preventDefault(); 
    const scaleAmount = 1.1;
    const svgRect = svgCanvasRef.current.getBoundingClientRect();

    const mouseXCanvas = e.clientX - svgRect.left;
    const mouseYCanvas = e.clientY - svgRect.top;

    const newScale = e.deltaY > 0 ? scale / scaleAmount : scale * scaleAmount;
    const clampedScale = Math.min(Math.max(newScale, 0.1), 2.5); 

    const currentViewBoxX = viewBox.x;
    const currentViewBoxY = viewBox.y;

    const worldXBeforeZoom = currentViewBoxX + mouseXCanvas / scale;
    const worldYBeforeZoom = currentViewBoxY + mouseYCanvas / scale;

    const newViewBoxX = worldXBeforeZoom - mouseXCanvas / clampedScale;
    const newViewBoxY = worldYBeforeZoom - mouseYCanvas / clampedScale;

    setScale(clampedScale);
    setViewBox(vb => ({ 
      ...vb, 
      x: newViewBoxX,
      y: newViewBoxY,
    }));
  }, [scale, setScale, setViewBox, viewBox.x, viewBox.y]); 

  useEffect(() => {
    const currentRef = svgCanvasRef.current;
    if (currentRef) {
      currentRef.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]); 

  useEffect(() => {
    if (calculatedCanvasWidth > 0 && calculatedCanvasHeight > 0) {
      setViewBox(prev => ({
        ...prev, 
        width: calculatedCanvasWidth,
        height: calculatedCanvasHeight,
      }));
    }
  }, [calculatedCanvasWidth, calculatedCanvasHeight]);

  useEffect(() => {
    if (selectedNodeId && positionedNodes.length > 0 && svgCanvasRef.current && scale !== 0) {
      const nodeToCenter = positionedNodes.find(n => n.id === selectedNodeId);
      if (nodeToCenter) {
        const clientWidth = svgCanvasRef.current.clientWidth || MIN_CANVAS_DIMENSION;
        const clientHeight = svgCanvasRef.current.clientHeight || MIN_CANVAS_DIMENSION;

        const targetViewBoxX = (nodeToCenter.x + NODE_WIDTH / 2) - (clientWidth / (2 * scale));
        const targetViewBoxY = (nodeToCenter.y + NODE_HEIGHT / 2) - (clientHeight / (2 * scale));
        
        setViewBox(prev => ({ ...prev, x: targetViewBoxX, y: targetViewBoxY }));
      }
    }
  }, [selectedNodeId, positionedNodes, scale, calculatedCanvasWidth, calculatedCanvasHeight]);


  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black flex flex-col z-[70] p-3 text-sky-100 overflow-hidden select-none">
      <div className="flex justify-between items-center mb-3 p-3 bg-slate-700/50 backdrop-blur-sm rounded-t-lg shadow-lg border-b border-slate-600 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-neon-cyan">Compêndio de Fluxo de Dados</h2>
        <button onClick={onClose} className="frutiger-button-neon px-5 py-1.5 text-xs border-rose-500 text-rose-400 hover:bg-rose-500 hover:text-white">
          Fechar
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden gap-3">
        <div
            ref={svgCanvasRef}
            className="flex-grow rounded-lg bg-slate-800/50 border border-slate-700/80 shadow-inner relative overflow-hidden cursor-grab"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} 
            onMouseMove={handleMouseMove}
        >
          <div
            style={{
                width: calculatedCanvasWidth,
                height: calculatedCanvasHeight,
                transform: `translate(${-viewBox.x * scale}px, ${-viewBox.y * scale}px) scale(${scale})`,
                transformOrigin: 'top left', 
                backgroundImage: 'radial-gradient(circle, rgba(45, 55, 72, 0.1) 1px, transparent 1px)', 
                backgroundSize: `${20 * scale}px ${20 * scale}px`, 
            }}
            className="relative transition-transform duration-0 " 
          >
            <svg width={calculatedCanvasWidth} height={calculatedCanvasHeight} className="absolute top-0 left-0 pointer-events-none" style={{overflow: 'visible'}}>
              <defs>
                <marker id="arrow-compendium-default" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" className={defaultThemeColors.stream.replace('stroke-','fill-')} />
                </marker>
                <marker id="arrow-compendium-hover" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" className="fill-sky-400" />
                </marker>
                <marker id="arrow-compendium-selected" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" className="fill-neon-cyan" />
                </marker>
                 {Object.entries(compendiumAffinityThemeColors).map(([key, colors]) => (
                    <marker key={`arrow-${key}`} id={`arrow-compendium-${key.toLowerCase()}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" className={colors.stream.replace('stroke-','fill-')} />
                    </marker>
                 ))}
                 <marker id="arrow-compendium-root" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" className={rootNodeThemeColors.stream.replace('stroke-','fill-')} /></marker>
                 <marker id="arrow-compendium-decision" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" className={decisionNodeThemeColors.stream.replace('stroke-','fill-')} /></marker>
                 <marker id="arrow-compendium-attribute" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" className={attributeNodeThemeColors.stream.replace('stroke-','fill-')} /></marker>
              </defs>
              {connections.map((conn, index) => {
                const isSelectedConnection = selectedNodeId === conn.from || selectedNodeId === conn.to;
                const isHoveredConnection = hoveredNodeId === conn.from || hoveredNodeId === conn.to;

                const fromNode = positionedNodes.find(n => n.id === conn.from);
                let markerIdStr = "default"; 
                if(fromNode?.affinity) markerIdStr = fromNode.affinity.toLowerCase();
                else if(fromNode?.isRootNode) markerIdStr = "root";
                else if(fromNode?.isDecisionPointNode) markerIdStr = "decision";
                else if(fromNode?.isAttributeBoostNode) markerIdStr = "attribute";

                let streamClassColor = conn.streamClass;
                let finalMarkerId = `url(#arrow-compendium-${markerIdStr})`;

                if (isSelectedConnection) {
                    streamClassColor = 'stroke-neon-cyan';
                    finalMarkerId = "url(#arrow-compendium-selected)";
                } else if (isHoveredConnection) {
                    streamClassColor = 'stroke-sky-400';
                    finalMarkerId = "url(#arrow-compendium-hover)";
                }

                return (
                  <g key={`conn-group-${index}`}>
                    <path
                      d={conn.pathD}
                      className={`fill-none ${streamClassColor} transition-all duration-200 ease-in-out`}
                      strokeWidth={isSelectedConnection || isHoveredConnection ? 2.2 : 1.5}
                      strokeOpacity={isSelectedConnection || isHoveredConnection ? 0.9 : 0.6}
                      markerEnd={finalMarkerId}
                      strokeLinecap="round"
                      strokeDasharray="4 2"
                      style={{ animation: isSelectedConnection || isHoveredConnection ? 'flowStream 1.5s linear infinite' : 'none' }}
                    />
                  </g>
                );
              })}
            </svg>

            {positionedNodes.map(node => (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => handleNodeMouseEnter(node.id)}
                onMouseLeave={handleNodeMouseLeave} 
                className={`absolute p-1.5 rounded-md border-2 shadow-lg cursor-pointer transition-all duration-200 ease-in-out group hover:shadow-xl hover:brightness-110 focus:outline-none
                            flex items-center justify-center
                            ${node.nodeColor} ${node.borderColor}
                            ${selectedNodeId === node.id ? '!border-neon-cyan !shadow-[0_0_15px_var(--neon-cyan)] scale-105 brightness-110' : ''}
                            ${hoveredNodeId === node.id ? 'scale-105 brightness-105' : ''}`}
                style={{
                  left: node.x, top: node.y,
                  width: NODE_WIDTH, height: NODE_HEIGHT,
                  boxShadow: selectedNodeId === node.id ? `0 0 15px var(--neon-cyan), inset 0 1px 3px rgba(255,255,255,0.15)` : `2px 3px 7px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.1)`,
                }}
                title={node.title} // Tooltip for icon node
              >
                <div className="absolute top-0 left-0 w-full h-1/2 rounded-t-[0.2rem] bg-gradient-to-b from-white/15 to-transparent pointer-events-none opacity-70 group-hover:from-white/25"></div>
                <span className={`text-2xl ${node.textColor} filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]`}>
                  {node.icon || '●'}
                </span>
                 {node.affinity && (
                    <div
                        className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border border-slate-900/50 shadow-sm ${compendiumAffinityThemeColors[node.affinity]?.light || defaultThemeColors.light}`}
                        title={`Afinidade: ${node.affinity}`}
                    ></div>
                 )}
              </div>
            ))}
          </div>
        </div>

        <div className="w-[380px] flex-shrink-0 p-4 bg-slate-700/60 backdrop-blur-sm rounded-lg overflow-y-auto custom-scrollbar-dark border border-slate-600 shadow-xl">
          {selectedNodeDetails ? (
            <>
              <h3 className={`text-lg font-semibold mb-1.5 pb-1.5 border-b break-words ${selectedNodeDetails.textColor?.replace('text-','border-') || defaultThemeColors.accent.replace('border-','border-b-')} ${selectedNodeDetails.textColor || defaultThemeColors.text}`}>
                  {selectedNodeDetails.icon && <span className="mr-2 text-xl">{selectedNodeDetails.icon}</span>}
                  {selectedNodeDetails.title}
              </h3>
              <p className="text-xs text-slate-400 mb-0.5">ID: <span className="text-slate-200">{selectedNodeDetails.id}</span></p>
              {selectedNodeDetails.speaker && <p className="text-xs text-slate-300 mb-0.5">Orador: <span className="italic text-sky-300">{getSpeakerDisplayName(selectedNodeDetails.speaker)}</span></p>}
              {selectedNodeDetails.affinity && <p className={`text-xs font-semibold mb-1.5 ${selectedNodeDetails.textColor || defaultThemeColors.text}`}>Afinidade: {selectedNodeDetails.affinity}</p>}

              {selectedNodeDetails.dialoguePreamble && selectedNodeDetails.dialoguePreamble.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-sky-400 mb-0.5">Diálogo de Abertura:</p>
                  <div className="pl-2 border-l-2 border-slate-500 space-y-0.5 bg-slate-800/30 p-1.5 rounded-md">
                  {selectedNodeDetails.dialoguePreamble.map((line, i) => <p key={i} className="text-[11px] italic text-slate-300">"{line}"</p>)}
                  </div>
                </div>
              )}
              {selectedNodeDetails.enemyTypes && selectedNodeDetails.enemyTypes.length > 0 && (
                  <div className="mt-2">
                      <p className="text-xs font-medium text-sky-400 mb-0.5">Ameaças ({selectedNodeDetails.enemyCount || 0}):</p>
                      <ul className="list-disc list-inside pl-0.5 space-y-0 bg-slate-800/30 p-1.5 rounded-md">
                          {selectedNodeDetails.enemyTypes.map((type, i) => (
                              <li key={i} className="text-[11px] text-slate-300">{THEMATIC_ENEMY_DATA[type]?.narrativeName || type}</li>
                          ))}
                      </ul>
                  </div>
              )}
              {selectedNodeDetails.childrenConnections && selectedNodeDetails.childrenConnections.length > 0 && (
                <div className="mt-2.5">
                  <p className="text-xs font-medium text-sky-400 mb-1">Decisões Possíveis:</p>
                  <ul className="space-y-1.5">
                    {selectedNodeDetails.childrenConnections.map((connInfo, i) => {
                      const choiceDef = selectedNodeDetails.choices?.find(c => c.leadsToNode === connInfo.to && c.choiceText === connInfo.choiceText);
                      const grantsEffect = choiceDef?.grantsEffectId ? ALL_EFFECTS_MAP[choiceDef.grantsEffectId] : null;
                      const targetNode = positionedNodes.find(n => n.id === connInfo.to);
                      return (
                        <li key={`choice-${i}`}
                            className="p-2 bg-slate-800/40 rounded-md border border-slate-600/60 hover:border-sky-500/60 transition-colors duration-150 cursor-pointer"
                            onClick={() => setSelectedNodeId(connInfo.to)}
                            onMouseEnter={() => setHoveredNodeId(connInfo.to)}
                            onMouseLeave={() => setHoveredNodeId(null)}
                        >
                          <p className={`text-sm font-medium ${targetNode?.textColor || defaultThemeColors.text}`}>
                            <span className={`mr-1 ${targetNode && targetNode.borderColor ? targetNode.borderColor.replace('border-','text-') : defaultThemeColors.accent.replace('border-', 'text-')}`}>➔</span>
                            {connInfo.choiceText || "Continuar"}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">(Leva para: {targetNode?.icon} {connInfo.to})</p>
                          {choiceDef?.fullDescription && <p className="text-xs text-slate-400 mt-0.5">{choiceDef.fullDescription}</p> }
                          {grantsEffect && (
                            <p className="text-xs text-emerald-400 mt-0.5">
                              Efeito: {grantsEffect.icon} {grantsEffect.name} <span className="text-slate-400">({grantsEffect.description})</span>
                            </p>
                          )}
                          {choiceDef?.affinityBoost && Object.keys(choiceDef.affinityBoost).length > 0 && (
                            <p className="text-xs text-purple-400 mt-0.5">
                                Afinidade: {Object.entries(choiceDef.affinityBoost).map(([aff,val]) => `${aff} ${val > 0 ? '+' : ''}${val}`).join(', ')}
                            </p>
                           )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {!(selectedNodeDetails.childrenConnections?.length) && selectedNodeDetails.isTerminal && <p className="text-sm text-amber-400 mt-3 italic">FIM DA LINHA NARRATIVA</p>}
              {!(selectedNodeDetails.childrenConnections?.length) && !selectedNodeDetails.isTerminal && <p className="text-sm text-slate-400 mt-3 italic">Nó de evento ou transição sem escolhas visíveis no compêndio.</p>}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2zM10 9h4M10 13h4M10 17h1" /></svg>
              <p className="text-slate-400 text-center text-sm">Selecione um nó no fluxo de dados para inspecionar seus detalhes e conexões.</p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes flowStream {
          to {
            stroke-dashoffset: -7; /* Adjust for desired speed and dasharray */
          }
        }
      `}</style>
    </div>
  );
};
