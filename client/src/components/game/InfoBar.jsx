import React from 'react';
import { useGameLogicContext } from '../../hooks/contextHooks';
import './InfoBar.css';

const InfoBar = () => {
  const { gameStarted, gameCompleted } = useGameLogicContext();
  
  if (!gameStarted) return null;

  return (
    <div className="info-bar">
      <div className="game-status">
        {gameCompleted ? (
          <div className="success-message">Connection Successful! 🎉</div>
        ) : (
          <div className="goal-message">Find a connection between the actors!</div>
        )}
      </div>
    </div>
  );
};

export default InfoBar;