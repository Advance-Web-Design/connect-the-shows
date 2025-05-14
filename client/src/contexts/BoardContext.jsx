import React, { createContext, useCallback } from 'react';
import { useBoard } from '../hooks/useBoard';
import { useSearchContext } from '../hooks/contextHooks'; // Import useSearchContext

const BoardContext = createContext();

export const BoardProvider = ({ children }) => {
  const boardState = useBoard();
  const { 
    nodes, setNodes,
    connections, setConnections,
    nodePositions, setNodePositions,
    updateNodePosition: updateNodePositionFromBoard,
    checkItemConnectability: checkItemConnectabilityFromBoard,
    checkInitialConnectability: checkInitialConnectabilityFromBoard,
    addToBoard: addToBoardFnFromBoard,
    checkGameCompletion
  } = boardState;

  // Attempt to get updateConnectableEntitiesForNode from SearchContext
  // It might not be available immediately if SearchProvider is still initializing,
  // so we provide a fallback.
  const searchContext = useSearchContext();
  const updateConnectableEntitiesForNode = searchContext?.updateConnectableEntitiesForNode || 
                                           (() => console.warn('updateConnectableEntitiesForNode not available from SearchContext yet'));

  const updateNodePosition = useCallback((nodeId, newPosition) => {
    updateNodePositionFromBoard(nodeId, newPosition);
  }, [updateNodePositionFromBoard]);

  const addToBoard = useCallback(async (item, exactMatch, connectableItems, setIsLoading) => {
    const newNode = await addToBoardFnFromBoard(item, exactMatch, connectableItems, setIsLoading);
    if (newNode && updateConnectableEntitiesForNode) {
      // Call updateConnectableEntitiesForNode from SearchContext after a node is added.
      // Note: The SearchContext's useEffect for selectedNode will also trigger this,
      // but calling it here ensures immediate update upon adding if needed.
      // This might be redundant if the selectedNode effect in SearchContext is sufficient.
      // Consider if selectedNode is always set before/after addToBoard.
      // For now, let's assume direct call is beneficial for immediate UI feedback on connectability.
      // updateConnectableEntitiesForNode(newNode, nodes); // nodes here might be stale, use the updated nodes from boardState or returned by addToBoardFnFromBoard
    }
    return newNode; // Return the new node so other operations can use it
  }, [addToBoardFnFromBoard, updateConnectableEntitiesForNode]);

  const resetBoard = useCallback(() => {
    setNodes([]);
    setNodePositions({});
    setConnections([]);
  }, [setNodes, setNodePositions, setConnections]);

  const value = {
    nodes, setNodes,
    connections, setConnections,
    nodePositions, setNodePositions,
    updateNodePosition,
    checkItemConnectability: checkItemConnectabilityFromBoard,
    checkInitialConnectability: checkInitialConnectabilityFromBoard,
    addToBoard,
    checkGameCompletion,
    resetBoard
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};

export { BoardContext };

