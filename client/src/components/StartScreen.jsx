/**
 * StartScreen Component
 * 
 * This component serves as the initial screen of the game where users select their starting actors.
 * It allows users to:
 * - Search for actors by name
 * - Select random actors
 * - Select actors from search results
 * - Start the game once two actors are selected
 * 
 * The component uses debounced search to improve performance and uses local state
 * to keep the UI responsive during searches.
 */
import React from 'react';
import { useGameLogicContext, useSearchContext, useBoardContext } from '../hooks/contextHooks';
import ActorCard from './game/ActorCard';
import Menu from './Menu';
import LoadingOverlay from './game/LoadingOverlay';
import './StartScreen.css';

const StartScreen = () => {
  // Extract from GameLogicContext
  const {
    startActors,       // Array containing the two selected starting actors
    randomizeActors,   // Function to select a random actor for a position
    startGame,         // Function to begin the game with selected actors
    isLoading: isLoadingGameLogic, // Loading state from game logic (e.g., starting game)
    selectStartActor,  // Function to select an actor for a position
    startActorsError,   // Error message for actor selection
  } = useGameLogicContext();

  // Extract from SearchContext
  const {
    actorSearchResults,
    actorSearchTerms,
    searchActors,
    actorSearchPages,
    actorSearchTotalPages, // Expected to be an array like [num, num]
    isActorSearchLoading, // Loading state specific to actor search
  } = useSearchContext();

  // Extract from BoardContext (needed for startGame)
  const {
    setNodes, // Used by startGame
    setNodePositions // Used by startGame
  } = useBoardContext();

  // Combine loading states or use the more specific one where appropriate
  const isLoading = isLoadingGameLogic || (isActorSearchLoading ? (isActorSearchLoading[0] || isActorSearchLoading[1]) : false);

  const handleSelectActor = (actorId, index) => {
    selectStartActor(actorId, index);
  };
  
  const loadMoreActors = (index) => {
    const totalPages = (actorSearchTotalPages && typeof actorSearchTotalPages[index] === 'number') ? actorSearchTotalPages[index] : 0;
    const isLoadingCurrentActorSearch = isActorSearchLoading && isActorSearchLoading[index];

    if (isLoadingCurrentActorSearch || actorSearchPages[index] >= totalPages || totalPages === 0) return;
    searchActors(actorSearchTerms[index] || '', index, actorSearchPages[index] + 1);
  };

  const handleSearchAgain = (index) => {
    selectStartActor(null, index);
  };

  const handleActorSearchTermChange = (term, index) => {
    searchActors(term, index, 1);
  };
  
  const handleStartGame = () => {
    startGame(setNodes, setNodePositions);
  };

  return (
    <div className="min-h-screen bg-black text-white relative"
      style={{
        backgroundImage: 'url("/stars-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>

      <div className="flex justify-between items-center p-4 w-full">
        <h1 style={{ 
          fontFamily: 'serif', 
          color: 'gold', 
          fontWeight: 'bold',
          fontSize: '1.75rem'
        }}>
          Connect The Stars
        </h1>
        <Menu parentName={'StartScreen'} />
      </div>
      <div className="start-screen">
        {startActorsError && (
          <div className="error-message">
            {typeof startActorsError === 'string' ? startActorsError : JSON.stringify(startActorsError)}
          </div>
        )}
        <div className="actor-selection-area">
          {[0, 1].map(index => (
            <ActorCard
              key={index}
              index={index}
              selectedActor={startActors[index]}
              callbackOnRandomize={() => randomizeActors(index)}
              callbackOnSelectActor={(actorId) => handleSelectActor(actorId, index)}
              callbackSearchActors={searchActors}
              callbackUpdateSearchTerm={handleActorSearchTermChange}
              initialSearchTerm={actorSearchTerms[index] || ''}
              currentActorSearchResults={actorSearchResults[index] || []}
              isLoading={isActorSearchLoading ? isActorSearchLoading[index] : false}
              callbackOnLoadMore={() => loadMoreActors(index)}
              searchPageNum={actorSearchPages[index] || 1}
              searchTotalPages={(actorSearchTotalPages && typeof actorSearchTotalPages[index] === 'number') ? actorSearchTotalPages[index] : 1}
              onSearchAgain={() => handleSearchAgain(index)}
            />
          ))}
        </div>
        {isLoading && <LoadingOverlay />}
        <button 
          className="start-game-btn" 
          onClick={handleStartGame}
          disabled={!startActors[0] || !startActors[1] || isLoading}
        >
          Start Game
        </button>
        
      </div>
    </div>
  );
};

export default StartScreen;