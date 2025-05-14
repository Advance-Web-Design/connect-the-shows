// New component: GameplayArea.jsx
import React from 'react';
import { Box } from '@mui/material';
import GameBoard from './GameBoard';
import SearchPanel from './SearchPanel';
import VictoryModal from './VictoryModal';
import BoardHeader from './BoardHeader';
import { useGameLogicContext } from '../../hooks/contextHooks'; // Corrected import

function GameplayArea() {
  const { gameCompleted, keepPlayingAfterWin } = useGameLogicContext();

  return (
    <Box className="relative flex-1 flex flex-col">
      <BoardHeader /> 
      
      <GameBoard />

      {/* SearchPanel is rendered outside the flex layout as a fixed element */}
      <SearchPanel />
      
      {gameCompleted && !keepPlayingAfterWin && (
        <VictoryModal />
      )}
    </Box>
  );
}

export default GameplayArea;