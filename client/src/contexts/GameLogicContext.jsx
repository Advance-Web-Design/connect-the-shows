import React, { createContext, useCallback, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { 
  fetchRandomPerson as getRandomActors, 
  getPersonDetails, 
  checkActorInTvShow as checkActorTvShowConnectionService 
} from '../services/tmdbService';
import { useBoardContext } from '../hooks/contextHooks'; // Updated import

const GameLogicContext = createContext();

// GameLogicProvider no longer takes resetBoard and resetSearch as props
export const GameLogicProvider = ({ children }) => { 
  const gameState = useGame();
  // Using useBoardContext to get the required setters for resetting the game

  const {
    isLoading,
    gameStarted,
    gameStartTime,
    startActors,
    gameCompleted,
    keepPlayingAfterWin,
    startActorsError,
    bestScore,
    shortestPathLength,
    setIsLoading,
    setGameStarted,
    setGameStartTime,
    setStartActors,
    setGameCompleted,
    setKeepPlayingAfterWin,
    setStartActorsError,
    resetGame: resetGameFromHook,
    completeGame: completeGameFromHook,
    selectStartActor: selectStartActorFromHook,
    setShortestPathLength: setShortestPathLengthFromHook,
  } = gameState;

  const [selectedNode, setSelectedNodeState] = useState(null); // Moved up for resetGame
  const randomizeActors = useCallback(async (index) => {
    setIsLoading(true);
    try {
      // fetchRandomPerson returns a single actor, not an array
      const randomActor = await getRandomActors();
      if (randomActor && randomActor.id) {
        const isAlreadySelected = startActors.some(sa => sa && sa.id === randomActor.id);
        if (!isAlreadySelected || startActors.filter(Boolean).length === 0) {
          // Use the actor we got
          await selectStartActorFromHook(randomActor.id, index);
        } else {
          // If already selected, try one more time
          console.log("Actor already selected, trying again");
          const secondAttempt = await getRandomActors();
          if (secondAttempt && secondAttempt.id) {
            await selectStartActorFromHook(secondAttempt.id, index);
          }
        }
      }
    } catch (error) {
      console.error("Error randomizing actors:", error);
      setStartActorsError("Failed to fetch random actors. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, startActors, selectStartActorFromHook, setStartActorsError]);

  const startGame = useCallback(async (setNodes, setNodePositions) => {
    if (startActors[0] && startActors[1]) {
      if (startActors[0].id === startActors[1].id) {
        setStartActorsError("Cannot start with duplicate actors. Please select two different actors.");
        return;
      }
      setStartActorsError(null);
      setIsLoading(true);
      try {
        const actor1Id = `person-${startActors[0].id}`;
        const actor2Id = `person-${startActors[1].id}`;
        // The setNodes and setNodePositions calls are expected to be passed by the component using startGame
        // This context itself doesn't manage board nodes directly.
        if (typeof setNodes === 'function') {
             setNodes([
                { id: actor1Id, type: 'person', data: startActors[0] },
                { id: actor2Id, type: 'person', data: startActors[1] }
            ]);
        }
        if (typeof setNodePositions === 'function') {
            setNodePositions({
                [actor1Id]: { x: 100, y: 100 },
                [actor2Id]: { x: 500, y: 100 }
            });
        }
        setGameStartTime(new Date().getTime());
        setGameStarted(true);
      } catch (error) {
        console.error("Error starting game:", error);
        setStartActorsError("Error starting game. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [startActors, setIsLoading, setStartActorsError, setGameStartTime, setGameStarted]);  // Get board state setters from BoardContext to pass to resetGame
  const { setNodes, setNodePositions, setConnections } = useBoardContext();
  
  // Update resetGame to use all necessary reset functions
  const resetGame = useCallback(() => {
    // Pass only the available setters (from BoardContext) to resetGameFromHook
    resetGameFromHook(
      setNodes,
      setNodePositions, 
      setConnections,
      null, // We don't have access to SearchContext's setSearchResults here
      null  // We don't have access to SearchContext's setConnectableItems here
    );
    
    // These state updates are redundant as they're already handled in resetGameFromHook
    // But keeping them to maintain existing behavior and ensure everything is reset
    setGameStarted(false);
    setGameCompleted(false);
    setGameStartTime(null);
    setKeepPlayingAfterWin(false);
    setStartActors([null, null]);
    setStartActorsError(null);
    setSelectedNodeState(null);  }, [resetGameFromHook, setNodes, setNodePositions, setConnections, 
      setGameStarted, setGameCompleted, setGameStartTime, setKeepPlayingAfterWin, 
      setStartActors, setStartActorsError, setSelectedNodeState]);

  const selectActor = useCallback(async (actorId, actorIndex) => {
    await selectStartActorFromHook(actorId, actorIndex);
  }, [selectStartActorFromHook]);

  const completeGame = useCallback((score, pathLength) => {
    completeGameFromHook(score);
    if (setShortestPathLengthFromHook) {
      setShortestPathLengthFromHook(pathLength);
    }
  }, [completeGameFromHook, setShortestPathLengthFromHook]);

  const checkActorTvShowConnection = useCallback(async (actorId, tvShowId, currentNodes) => {
    // currentNodes might be needed by the service for context, e.g., to prevent re-adding existing items
    return await checkActorTvShowConnectionService(actorId, tvShowId, currentNodes);
  }, []); // Removed currentNodes from deps as service might not need it reactively

  const fetchAllPossibleConnections = useCallback(async (node) => {
    console.warn("fetchAllPossibleConnections called in GameLogicContext - ensure this is intended or handled by selectNode.");
    // This function's logic might need to be restored or confirmed if it's used elsewhere.
    // For now, returning node.data as a placeholder.
    return node.data; 
  }, []);

  const selectNode = useCallback(async (node) => {
    if (!node) {
      setSelectedNodeState(null);
      return;
    }
    setIsLoading(true);
    try {
      let detailedData = { ...node.data };
      if (node.type === 'person') {
        // Fetch detailed info only if not already fetched or if necessary
        // Assuming node.data might be partial initially
        detailedData = await getPersonDetails(node.data.id, true); // true for extended cast/crew info
      }
      // If node.type is 'tv', TMDB service might have a getTvShowDetails
      // For now, assume tv show data is complete enough or handled by another mechanism
      setSelectedNodeState({ ...node, data: detailedData });
    } catch (error) {
      console.error("Error selecting node and fetching details:", error);
      setSelectedNodeState(node); // Fallback to original node data on error
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setSelectedNodeState]);

  const closeConnectionsPanel = useCallback(() => {
    setSelectedNodeState(null);
  }, [setSelectedNodeState]);

  const value = {
    isLoading,
    gameStarted,
    gameStartTime,
    startActors,
    gameCompleted,
    keepPlayingAfterWin,
    startActorsError,
    bestScore,
    shortestPathLength,
    selectedNode,
    isLoggedIn: false, // Placeholder
    currentUser: null, // Placeholder
    randomizeActors,
    startGame,
    resetGame,
    completeGame,
    selectStartActor: selectActor,
    setKeepPlayingAfterWin,
    fetchAllPossibleConnections, 
    selectNode,
    closeConnectionsPanel,
    checkActorTvShowConnection,
    login: () => console.warn("Login function not implemented"),
    logout: () => console.warn("Logout function not implemented"),
    register: () => console.warn("Register function not implemented"),
  };

  return <GameLogicContext.Provider value={value}>{children}</GameLogicContext.Provider>;
};

export { GameLogicContext };

