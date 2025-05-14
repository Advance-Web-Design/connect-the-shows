import React from 'react';
import { useGameLogicContext } from '../../hooks/contextHooks';
import StartScreen from '../StartScreen';
import GameplayArea from './GameplayArea';
import { Box } from '@mui/material';

import Profile from '../Profile';
import ProfileHeader from '../ProfileHeader';
import Leaderboard from '../Leaderboard';
import ChallengeMode from '../ChallengeMode';
import Register from '../Register';
import Login from '../Login';

function GameContent() {
  const { 
    gameStarted, 
    gameCompleted,
    keepPlayingAfterWin, 
    resetGame, 
    setKeepPlayingAfterWin 
  } = useGameLogicContext();
  
  return (
    <Box 
      className="flex flex-col h-screen"
      sx={{
        backgroundColor: !gameStarted ? 'black' : 'transparent',
      }}
    >
      {!gameStarted ? ( <StartScreen /> ) : ( <GameplayArea 
          gameCompleted={gameCompleted}
          keepPlayingAfterWin={keepPlayingAfterWin}
          resetGame={resetGame}
          setKeepPlayingAfterWin={setKeepPlayingAfterWin}
        />
      )}
    </Box>
  );
}

export default GameContent;