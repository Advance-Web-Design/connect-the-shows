import React from 'react';
import { getItemTitle } from '../../utils/stringUtils';
import {getItemYear} from '../../utils/stringUtils';
const SearchPanelUI = ({
  handleSubmit,
  inputRef,
  searchTerm,
  handleInputChange,
  isLoading,
  hasResults,
  didYouMean,
  originalSearchTerm,
  useSpellingCorrection, // This is actually applySpellingCorrection from context
  noMatchFound,
  shouldShowResults,
  resultsContainerRef,
  organizedResults,  // connectableItems - no longer needed since all items in organizedResults.connectable are already filtered 
  handleAddToBoard,
}) => {
  return (
    <div className={`search-panel-container ${hasResults ? 'with-results' : ''}`}>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          ref={inputRef}
          className="in-game-search-input"
          type="text"
          placeholder="Search movies, TV shows, actors..."
          value={searchTerm}
          onChange={handleInputChange}
          autoFocus
        />
        <button
          type="submit"
          className="in-game-search-button"
          disabled={isLoading || !searchTerm.trim()}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {/* Enhanced Did You Mean section */}
      {didYouMean && originalSearchTerm && (
        <div className="in-game-search-suggestion">
          <p className="suggestion-title">
            Did you mean:
          </p>
          <div className="suggestion-content">
            {typeof didYouMean === 'string' ? (
              <button 
                onClick={useSpellingCorrection}
                className="suggestion-button text-only"
              >
                {didYouMean}
              </button>
            ) : (
              <button 
                onClick={useSpellingCorrection}
                className={`suggestion-button entity-suggestion ${didYouMean.isConnectable ? 'connectable' : ''}`}
              >
                <div className="suggestion-image">
                  <img 
                    src={`https://image.tmdb.org/t/p/w92${didYouMean.media_type === 'person' ? didYouMean.profile_path : didYouMean.poster_path}`} 
                    alt={getItemTitle(didYouMean)}
                  />
                </div>
                <div className="suggestion-info">
                  <span className="suggestion-name">{getItemTitle(didYouMean)}</span>
                  <span className="suggestion-type">
                    {didYouMean.media_type === 'movie' ? 'Movie' : 
                     didYouMean.media_type === 'tv' ? 'TV Show' : 'Actor'}
                    {didYouMean.isConnectable && 
                      <span className="connectable-tag"> (Can be added to board)</span>
                    }
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* No Results Message */}
      {noMatchFound && (
        <div className="in-game-search-no-results">
          <p>No matches found for "{originalSearchTerm}"</p>
          <p style={{ fontSize: 'smaller' }}>Try a different search term or check your spelling.</p>
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="in-game-search-loading">
          Searching...
        </div>
      )}
      
      {/* Search Results - only show if we have search term and results */}
      {shouldShowResults && (
        <div className="in-game-search-results" ref={resultsContainerRef}>
          {/* Only show connectable results - no need to separate into categories */}          {organizedResults.connectable.map(item => (
            <div
              key={`${item.media_type}-${item.id}`}
              className="in-game-result-item can-connect"
              onClick={() => handleAddToBoard(item)}
            >
              <div className="in-game-result-image">
                <img
                  src={`https://image.tmdb.org/t/p/w92${item.media_type === 'person' ? item.profile_path : item.poster_path}`}
                  alt={getItemTitle(item)}
                />
              </div>
              <div className="in-game-result-info">
                <div className="in-game-result-title">{getItemTitle(item)+" " + getItemYear(item)} </div>
                <div className="in-game-result-type">
                  {item.media_type === 'movie' ? 'Movie' : item.media_type === 'tv' ? 'TV Show' : 'Actor'}
                  {/* Show guest appearance tag if applicable */}
                  {item.media_type === 'tv' && (item.is_guest_appearance || item.hasGuestAppearances) && 
                    <span style={{ color: '#FFC107' }}> (Guest)</span>
                  }
                  {item.media_type === 'person' && item.is_guest_star && 
                    <span style={{ color: '#FFC107' }}> (Guest)</span>
                  }
                </div>
                  

              </div>
              <button 
                className="in-game-add-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToBoard(item);
                }}
              >
                Add
              </button>
            </div>
          ))}
          
          {/* Show message if no connectable items */}
          {organizedResults.connectable.length === 0 && organizedResults.notConnectable.length > 0 && (
            <div className="in-game-search-no-results">
              <p>Found matches, but none can be connected to the board.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default SearchPanelUI;