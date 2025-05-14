import React, { createContext, useCallback, useEffect } from 'react';
import { useSearch } from '../hooks/useSearch';
import { searchMulti, getItemTitle } from '../services/tmdbService';
import { useBoardContext, useGameLogicContext } from '../hooks/contextHooks';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {  const {
    searchTerm, setSearchTerm,
    showAllSearchable, setShowAllSearchable,
    searchResults, setSearchResults,
    noMatchFound, setNoMatchFound,
    didYouMean, setDidYouMean,
    exactMatch, setExactMatch,
    originalSearchTerm, setOriginalSearchTerm,
    connectableItems, setConnectableItems,
    isLoading: isLoadingGeneral, setIsLoading: setIsLoadingGeneral,
    actorSearchResults,
    actorSearchTerms,
    actorSearchPages,
    actorSearchTotalPages,
    isActorSearchLoading,
    searchStartActors: searchStartActorsFnFromHook,
    applySpellingCorrection: applySpellingCorrectionFnFromSearch,
    updateConnectableEntitiesForNode: updateConnectableEntitiesForNodeFnFromHook,
    fetchAllSearchableEntities: fetchAllSearchableEntitiesFromHook,
    resetSearchState,
  } = useSearch();
  const { nodes: currentBoardNodes } = useBoardContext();  const { gameStarted, selectedNode, startActors } = useGameLogicContext();

  const toggleShowAllSearchable = useCallback(() => {
    setShowAllSearchable(prev => !prev);
  }, [setShowAllSearchable]);

  const internalResetSearch = useCallback(() => {
    setSearchTerm('');
    setShowAllSearchable(false);
    setSearchResults([]);
    setNoMatchFound(false);
    setDidYouMean(null);
    setExactMatch(null);
    setOriginalSearchTerm('');
    setConnectableItems({});
  }, [
    setSearchTerm, setShowAllSearchable, setSearchResults, setNoMatchFound,
    setDidYouMean, setExactMatch, setOriginalSearchTerm, setConnectableItems
  ]);

  useEffect(() => {
    if (!gameStarted) {
      internalResetSearch();
    }
  }, [gameStarted, internalResetSearch]);

  useEffect(() => {
    if (selectedNode && currentBoardNodes) {
      updateConnectableEntitiesForNodeFnFromHook(selectedNode, currentBoardNodes);
    } else if (!selectedNode) {
      setConnectableItems({});
    }
  }, [selectedNode, currentBoardNodes, updateConnectableEntitiesForNodeFnFromHook, setConnectableItems]);

  const fetchAndSetAllSearchableEntities = useCallback(async () => {
    await fetchAllSearchableEntitiesFromHook();
  }, [fetchAllSearchableEntitiesFromHook]);  const { checkInitialConnectability: checkInitialConnectabilityFn } = useBoardContext();
  const { checkActorTvShowConnection: checkActorTvShowConnectionFn } = useGameLogicContext();

  const processSearchResults = useCallback(async (results, term) => {
    if (!results || results.length === 0) {
      setNoMatchFound(true);
      setDidYouMean(null);
      setExactMatch(null);
      return;
    }

    setNoMatchFound(false);
    const lowerTerm = term.toLowerCase().trim();
    let foundExactMatch = null;
    
    // Create a temporary object to track connectability
    const tempConnectableItems = {};
    
    const processedResults = results.map(item => {
      const title = getItemTitle(item);
      // Calculate connectability based on game state
      let connectable = false;
      // If board is empty, everything is connectable
      if (currentBoardNodes.length === 0) {
        connectable = true;
      }
      // Otherwise check using the connection functions if they're available
      else if (checkInitialConnectabilityFn && checkActorTvShowConnectionFn) {
        try {
          // Correctly pass startActors as the parameter instead of currentBoardNodes
          // The checkInitialConnectability function expects startingActors as the second param
          connectable = checkInitialConnectabilityFn(item, startActors);
          console.log(`Connectability for "${getItemTitle(item)}": ${connectable}`);
          
          // Store the connectability in our temporary object
          const itemKey = `${item.media_type}-${item.id}`;
          tempConnectableItems[itemKey] = connectable;
        } catch (error) {
          console.error("Error checking connectability:", error);
          console.error(error.stack);
          connectable = false;
        }
      }
      
      if (title.toLowerCase() === lowerTerm) {
        foundExactMatch = { ...item, connectable };
      }
      return { ...item, connectable };
    });

    // Update the connectableItems state with our connectability results
    setConnectableItems(prev => ({
      ...prev,
      ...tempConnectableItems
    }));

    if (foundExactMatch) {
      setExactMatch(foundExactMatch);
      setSearchResults([foundExactMatch]);
    } else {
      setExactMatch(null);
      setSearchResults(processedResults);
      if (processedResults.length > 0 && lowerTerm.length > 3) {
        const closestTitle = processedResults[0].name || processedResults[0].title;
        if (closestTitle.toLowerCase() !== lowerTerm) {
          setDidYouMean(closestTitle);
        } else {
          setDidYouMean(null);
        }
      } else {
        setDidYouMean(null);
      }
    }
  }, [setNoMatchFound, setDidYouMean, setExactMatch, setSearchResults, setConnectableItems, checkInitialConnectabilityFn, currentBoardNodes, checkActorTvShowConnectionFn, startActors]);

  const checkExactMatchConnectability = useCallback((exactMatchItem) => {
    if (!exactMatchItem || !checkInitialConnectabilityFn) return null;
    // Make sure we're passing startActors as the second parameter, not currentBoardNodes
    const connectable = checkInitialConnectabilityFn(exactMatchItem, startActors);
    return { ...exactMatchItem, connectable };
  }, [checkInitialConnectabilityFn, startActors]);
  const checkSearchResultsConnectability = useCallback((results) => {
    if (!checkInitialConnectabilityFn) return results.map(item => ({...item, connectable: false}));
    return results.map(item => ({
      ...item,
      connectable: checkInitialConnectabilityFn(item, startActors)
    }));
  }, [checkInitialConnectabilityFn, startActors]);
  const handleSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      setNoMatchFound(false);
      setDidYouMean(null);
      setExactMatch(null);
      setOriginalSearchTerm('');
      return;
    }
    setIsLoadingGeneral(true);
    setOriginalSearchTerm(term);
    
    // Clear previous connectableItems before a new search
    setConnectableItems({});
    
    try {
      console.log('Searching for:', term);
      const results = await searchMulti(term);
      console.log('Search results:', results);
      
      // Add more detailed logging
      if (results && results.length > 0) {
        console.log(`Found ${results.length} results. Processing...`);
        console.log('Results media types:', results.map(r => r.media_type).join(', '));
        
        // Check if connectability functions are available
        console.log('checkInitialConnectabilityFn available:', Boolean(checkInitialConnectabilityFn));
        console.log('checkActorTvShowConnectionFn available:', Boolean(checkActorTvShowConnectionFn));
        console.log('startActors available:', Boolean(startActors));
        console.log('currentBoardNodes length:', currentBoardNodes?.length || 0);
        
        processSearchResults(results, term);
      } else {
        console.log('No search results found');
        setNoMatchFound(true);
      }
    } catch (error) {
      console.error("Error during search:", error);
      console.error(error.stack); // Add stack trace for better debugging
      setNoMatchFound(true);
    } finally {
      setIsLoadingGeneral(false);
    }  }, [
    setSearchResults, setNoMatchFound, setDidYouMean, setExactMatch,
    setOriginalSearchTerm, setIsLoadingGeneral, setConnectableItems, processSearchResults,
    checkInitialConnectabilityFn, checkActorTvShowConnectionFn, startActors, currentBoardNodes
  ]);

  const searchActors = useCallback(async (term, actorIndex, page = 1) => {
    await searchStartActorsFnFromHook(term, actorIndex, page);
  }, [searchStartActorsFnFromHook]);

  const resetSearch = useCallback(() => {
    internalResetSearch();
  }, [internalResetSearch]);

  const value = {
    searchTerm, setSearchTerm,
    showAllSearchable,
    toggleShowAllSearchable,
    searchResults, setSearchResults,
    noMatchFound,
    didYouMean,
    exactMatch,
    originalSearchTerm,
    connectableItems,
    handleSearch,
    fetchAndSetAllSearchableEntities,
    applySpellingCorrection: applySpellingCorrectionFnFromSearch,
    updateConnectableEntitiesForNode: updateConnectableEntitiesForNodeFnFromHook,
    isLoading: isLoadingGeneral,
    actorSearchResults,
    actorSearchTerms,
    actorSearchPages,
    actorSearchTotalPages,
    isActorSearchLoading,
    searchActors,
    resetSearch,    checkExactMatchConnectability,
    checkSearchResultsConnectability,
    processSearchResults,
    // Reset the search state completely
    resetSearchState,
    // Add properties needed by SearchEntitiesSidebar
    connectableEntitiesForNode: connectableItems, // Renaming for clarity
    allSearchableEntities: [], // This seems to be missing, add an empty array as default
    isLoadingGeneral // Make sure this is properly included
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export { SearchContext };
