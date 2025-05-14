import { useContext } from 'react';
import { BoardContext } from '../contexts/BoardContext';
import { GameLogicContext } from '../contexts/GameLogicContext';
import { SearchContext } from '../contexts/SearchContext';

export const useBoardContext = () => useContext(BoardContext);
export const useGameLogicContext = () => useContext(GameLogicContext);
export const useSearchContext = () => useContext(SearchContext);
