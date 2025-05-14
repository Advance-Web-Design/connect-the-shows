import React, { useState, useRef, useEffect } from 'react';
import { useSearchContext, useBoardContext, useGameLogicContext } from '../../hooks/contextHooks';
import './SearchPanel.css';
import SearchPanelUI from './SearchPanelUI';
import SearchEntitiesSidebar from './SearchEntitiesSidebar';
import { debugSearch } from '../../services/tmdbService';

const SearchPanel = () => {  // Get search-related state and functions from SearchContext
  const {
    searchTerm,
    setSearchTerm,
    handleSearch,
    searchResults,
    isLoading,
    connectableItems,
    didYouMean,
    originalSearchTerm,
    noMatchFound,
    applySpellingCorrection,
    showAllSearchable,
    setSearchResults,
    setNoMatchFound,
    setDidYouMean,
    setExactMatch
  } = useSearchContext();
  
  // Get board-related functions from BoardContext
  const { addToBoard } = useBoardContext();
  
  // Get game logic context to access startActors for debugging
  const { startActors } = useGameLogicContext();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  
  useEffect(() => {
    // Focus the search input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Determine if search has results AND there's an active search term
  const hasResults = searchResults && searchResults.length > 0 && searchTerm.trim() !== '';

  // Filter and organize search results
  const organizedResults = React.useMemo(() => {
    if (!searchResults || searchResults.length === 0) return { connectable: [], notConnectable: [] };
    
    // Categorize results by connectivity
    const connectable = [];
    const notConnectable = [];
    
    searchResults.forEach(item => {
      const itemKey = `${item.media_type}-${item.id}`;
      if (connectableItems[itemKey]) {
        connectable.push(item);
      } else {
        notConnectable.push(item);
      }
    });
    
    return { connectable, notConnectable };
  }, [searchResults, connectableItems]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      handleSearch(searchTerm);
    }
  };
  
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    
    // If the search term is emptied, clear the search results in the context
    if (e.target.value.trim() === '') {
      // Reset all search-related states when the input is cleared
      if (typeof setSearchResults === 'function') {
        setSearchResults([]);
      }
      // Also reset the suggestion and no match found states
      setNoMatchFound(false);
      setDidYouMean(null);
      setExactMatch(null);
    }
  };
    const handleAddToBoard = (item) => {
    // Match the signature in BoardContext - (item, exactMatch, connectableItems, setIsLoading)
    addToBoard(item, false, connectableItems, isLoading);
    
    // Clear search results and term after adding to board
    setSearchTerm('');
    
    // Also clear the search results in the context to collapse the panel
    if (typeof setSearchResults === 'function') {
      setSearchResults([]);
    }
    
    // Reset search feedback states from context
    setNoMatchFound(false);
    setDidYouMean(null);
    setExactMatch(null);

    // Focus back on the input after clicking
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // Update sidebar open state when showAllSearchable changes in context
  useEffect(() => {
    setSidebarOpen(showAllSearchable);
  }, [showAllSearchable]);

  // Only show results section if we have a search term and results
  const shouldShowResults = !isLoading && hasResults && searchTerm.trim() !== '';

  return (
    <> {/* Use a fragment to wrap SearchPanelUI and SearchEntitiesSidebar */}      <SearchPanelUI
        handleSubmit={handleSubmit}
        inputRef={inputRef}
        searchTerm={searchTerm}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
        hasResults={hasResults}
        didYouMean={didYouMean}
        originalSearchTerm={originalSearchTerm}
        useSpellingCorrection={applySpellingCorrection}
        noMatchFound={noMatchFound}
        shouldShowResults={shouldShowResults}
        resultsContainerRef={resultsContainerRef}
        organizedResults={organizedResults}
        connectableItems={connectableItems}
        handleAddToBoard={handleAddToBoard}
      />
      
{ /*==================================================================================*/}
                { /* remove this part before final release!!! */}

      <SearchEntitiesSidebar 
        isOpen={sidebarOpen} 
        onClose={handleCloseSidebar} 
      />        {/* Debug Tools - Remove in Production */}
      <div style={{ padding: '10px', marginTop: '10px', border: '1px solid red', background: '#ffe0e0' }}>
        <h4 style={{ marginBottom: '5px' }}>Debug Tools</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '5px' }}>
          <button 
            onClick={async () => {
              console.log('Debug search for "Tom Hanks"');
              const debugResults = await debugSearch('Tom Hanks');
              console.log('Debug API results:', debugResults);
              
              // Manually inject search results to bypass the context issue
              if (debugResults.people && debugResults.people.length > 0) {
                // Add connectable flag and set in state
                const connectableResults = debugResults.people.map(item => ({
                  ...item,
                  connectable: true
                }));
                setSearchResults(connectableResults);
                setNoMatchFound(false);
                setSearchTerm("Tom Hanks");
              }
            }}
            style={{ padding: '5px' }}
          >
            Actor: Tom Hanks
          </button>
          
          <button 
            onClick={async () => {
              console.log('Debug search for "Breaking Bad"');
              const debugResults = await debugSearch('Breaking Bad');
              console.log('Debug API results:', debugResults);
              
              // Manually inject search results to bypass the context issue
              if (debugResults.tvShows && debugResults.tvShows.length > 0) {
                const connectableResults = debugResults.tvShows.map(item => ({
                  ...item,
                  connectable: true
                }));
                setSearchResults(connectableResults);
                setNoMatchFound(false);
                setSearchTerm("Breaking Bad");
              }
            }}
            style={{ padding: '5px' }}
          >
            TV: Breaking Bad
          </button>
          
          <button 
            onClick={async () => {
              console.log('Debug search for "Inception"');
              const debugResults = await debugSearch('Inception');
              console.log('Debug API results:', debugResults);
              
              // Manually inject search results to bypass the context issue
              if (debugResults.movies && debugResults.movies.length > 0) {
                const connectableResults = debugResults.movies.map(item => ({
                  ...item,
                  connectable: true
                }));
                setSearchResults(connectableResults);
                setNoMatchFound(false);
                setSearchTerm("Inception");
              }
            }}
            style={{ padding: '5px' }}
          >
            Movie: Inception
          </button>
        </div>
          
        <button 
          onClick={async () => {
            console.log('Current search state:', {
              searchTerm,
              searchResults: searchResults?.length || 0,
              connectableItems,
              noMatchFound,
              didYouMean,
              isLoading
            });
            
            // Use the startActors from the component level
            console.log('Start actors:', startActors);
            
            // Add a test item to the board
            if (searchResults && searchResults.length > 0) {
              const testItem = searchResults[0];
              console.log('Attempting to add to board:', testItem);
              addToBoard({
                ...testItem,
                connectable: true // Force connectable
              }, false, { [`${testItem.media_type}-${testItem.id}`]: true }, false);
            }
          }}
          style={{ padding: '5px' }}
        >
          Test Add First Result to Board
        </button>
      </div>
{ /*==================================================================================*/}
    </>
  );
};

export default SearchPanel;