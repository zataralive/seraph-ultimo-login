
import { useCallback, useEffect, useRef } from 'react';
import { GamePhase } from '../types'; 

export interface GameInputRefs {
  keysPressedRef: React.MutableRefObject<Record<string, boolean>>;
  isMouseDownRef: React.MutableRefObject<boolean>;
  shotRequestedRef: React.MutableRefObject<boolean>;
  mousePositionRef: React.MutableRefObject<{ x: number; y: number }>;
  gameCanvasRef: React.RefObject<HTMLDivElement>;
}

export interface GameInputProps {
  gamePhase: GamePhase; 
  onPauseToggle?: () => void; 
  onMainMenu?: () => void; 
}

export const useGameInput = (
    { gamePhase, onPauseToggle, onMainMenu }: GameInputProps,
    inputRefs: GameInputRefs
) => {
  const { keysPressedRef, isMouseDownRef, shotRequestedRef, mousePositionRef, gameCanvasRef } = inputRefs;
  const gamePhaseRef = useRef(gamePhase);

  useEffect(() => {
    gamePhaseRef.current = gamePhase;
  }, [gamePhase]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return; // Prevent processing repeated events for held keys

    const currentLocalPhase = gamePhaseRef.current;

    if (e.code.toLowerCase() === 'escape') {
      if (
        currentLocalPhase === GamePhase.NarrativeDecision ||
        currentLocalPhase === GamePhase.StaffSelection ||
        currentLocalPhase === GamePhase.Intro ||
        currentLocalPhase === GamePhase.GameOver ||
        currentLocalPhase === GamePhase.Ending ||
        currentLocalPhase === GamePhase.CompendiumView ||
        currentLocalPhase === GamePhase.TrophyRoomView ||
        currentLocalPhase === GamePhase.HallOfFameView
      ) {
        if (onMainMenu && (currentLocalPhase === GamePhase.CompendiumView || currentLocalPhase === GamePhase.TrophyRoomView || currentLocalPhase === GamePhase.HallOfFameView)) {
            onMainMenu();
        }
        return; // Don't set keysPressed for escape in these phases / don't toggle pause
      }
      if (onPauseToggle) onPauseToggle(); // Toggle pause for Playing/Paused
      return; // Escape should not be registered in keysPressedRef for movement
    }
    
    // Allow movement keys etc. to be registered regardless of phase,
    // their effect will be determined by the game logic consuming keysPressedRef
    keysPressedRef.current[e.code.toLowerCase()] = true;
  }, [onPauseToggle, onMainMenu, keysPressedRef]); // gamePhaseRef used internally

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.code.toLowerCase();
    keysPressedRef.current[key] = false;
  }, [keysPressedRef]);

  const handleMouseDownLocal = useCallback((e: MouseEvent) => {
    if (e.button === 0 && gamePhaseRef.current === GamePhase.Playing) {
      isMouseDownRef.current = true;
      shotRequestedRef.current = true; // Request a shot immediately
    }
  }, [isMouseDownRef, shotRequestedRef]); // gamePhaseRef used internally

  const handleMouseUpLocal = useCallback((e: MouseEvent) => {
    if (e.button === 0) {
      isMouseDownRef.current = false;
      // shotRequestedRef is typically reset in the game loop after a shot is processed
      // or can be set to false here if continuous shooting on hold is not desired after mouse up.
      // For now, let's ensure it's false on mouse up to prevent unwanted shots if mouse up is missed by game loop.
      shotRequestedRef.current = false;
    }
  }, [isMouseDownRef, shotRequestedRef]);

  const handleMouseMoveLocal = useCallback((e: MouseEvent) => {
    if (gameCanvasRef.current) {
      const rect = gameCanvasRef.current.getBoundingClientRect();
      mousePositionRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }, [gameCanvasRef, mousePositionRef]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMoveLocal);
    // Mouse up is global to catch it even if mouse moves out of canvas
    window.addEventListener('mouseup', handleMouseUpLocal); 

    const gameAreaElement = gameCanvasRef.current;
    if (gameAreaElement) {
      // Mousedown is specific to the game canvas
      if (gamePhase === GamePhase.Playing) {
        gameAreaElement.addEventListener('mousedown', handleMouseDownLocal);
      } else {
        gameAreaElement.removeEventListener('mousedown', handleMouseDownLocal);
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMoveLocal);
      window.removeEventListener('mouseup', handleMouseUpLocal);
      if (gameAreaElement) {
        gameAreaElement.removeEventListener('mousedown', handleMouseDownLocal);
      }
    };
  }, [handleKeyDown, handleKeyUp, handleMouseMoveLocal, handleMouseUpLocal, gameCanvasRef, gamePhase, handleMouseDownLocal]);
};
