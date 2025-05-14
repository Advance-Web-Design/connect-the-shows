import React from 'react';
import { GameLogicProvider } from './GameLogicContext';
import { BoardProvider } from './BoardContext';
import { SearchProvider } from './SearchContext';

// Main GameProvider that composes the others
export const GameProvider = ({ children }) => {
  return (
    // New Order: BoardProvider -> GameLogicProvider -> SearchProvider
    <BoardProvider>
      <GameLogicProvider>
        <SearchProvider>
          {children}
        </SearchProvider>
      </GameLogicProvider>
    </BoardProvider>
  );
};