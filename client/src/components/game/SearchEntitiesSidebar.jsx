// ==================================================================================================== //
// ==================== this component is a developer tool to help us test the code =================== //
// ==================== it will be removed in the final version of the game         =================== //
// ==================================================================================================== //

import React from 'react';
import { useBoardContext, useSearchContext } from '../../hooks/contextHooks'; // Corrected import
import { getItemTitle } from '../../utils/stringUtils';
import './SearchEntitiesSidebar.css';

const SearchEntitiesSidebar = ({ isOpen, onClose }) => {
  const { 
    nodes,        // From BoardContext
    addToBoard    // From BoardContext
  } = useBoardContext();
    const {
    searchResults,          // General search results from SearchContext
    isLoading: isLoadingGeneral, // Loading state for general searches from SearchContext
    showAllSearchable,      // From SearchContext
    toggleShowAllSearchable,// From SearchContext
    connectableItems,       // Map of connectable items for the selected node, from SearchContext
    connectableEntitiesForNode, // For backward compatibility
    allSearchableEntities   // All entities connectable to any node on board, from SearchContext
  } = useSearchContext();
  
  // Use either connectableEntitiesForNode or connectableItems, whichever is available
  const connectableEntities = React.useMemo(() => {
    return connectableEntitiesForNode || connectableItems || {};
  }, [connectableEntitiesForNode, connectableItems]);
  
  const itemsFromSearchResultsConnectableToSelectedNode = React.useMemo(() => {
    if (!searchResults || !Object.keys(connectableEntities).length) return [];
    return searchResults.filter(item => {
      const itemKey = `${item.media_type}-${item.id}`;
      return connectableEntities[itemKey];
    });
  }, [searchResults, connectableEntities]);

  const groupedEntities = React.useMemo(() => {
    const groups = {
      person: [],
      movie: [],
      tv: []
    };
    
    const entitiesToGroup = showAllSearchable 
      ? allSearchableEntities || [] 
      : itemsFromSearchResultsConnectableToSelectedNode;
    
    entitiesToGroup.forEach(item => {
      if (groups[item.media_type]) {
        groups[item.media_type].push(item);
      }
    });
    
    groups.person.sort((a, b) => getItemTitle(a).localeCompare(getItemTitle(b)));
    groups.movie.sort((a, b) => getItemTitle(a).localeCompare(getItemTitle(b)));
    groups.tv.sort((a, b) => getItemTitle(a).localeCompare(getItemTitle(b)));
    
    return groups;
  }, [showAllSearchable, allSearchableEntities, itemsFromSearchResultsConnectableToSelectedNode]);

  if (!isOpen) return null;

  if (!showAllSearchable && itemsFromSearchResultsConnectableToSelectedNode.length === 0 && !isLoadingGeneral) {
    return null; 
  }
  if (showAllSearchable && (!allSearchableEntities || allSearchableEntities.length === 0) && !isLoadingGeneral) {
    return null;
  }

  const handleAddToBoard = (item) => {
    addToBoard(item);
  };

  const handleClose = () => {
    if (showAllSearchable) {
        toggleShowAllSearchable(); 
    }
    onClose();
  };

  const getConnectedNodes = (item) => {
    if (item.source_node) {
      const sourceNode = nodes.find(node => node.id === item.source_node);
      if (sourceNode) {
        return [sourceNode];
      }
    }
    const connectedNodes = [];
    if (item.media_type === 'person') {
      const movieNodes = nodes.filter(node => node.type === 'movie');
      movieNodes.forEach(movieNode => {
        const cast = movieNode.data.credits?.cast || [];
        if (cast.some(actor => actor.id === item.id)) {
          connectedNodes.push(movieNode);
        }
      });
      const tvNodes = nodes.filter(node => node.type === 'tv');
      tvNodes.forEach(tvNode => {
        const cast = tvNode.data.credits?.cast || [];
        const guestStars = tvNode.data.guest_stars || [];
        if (cast.some(actor => actor.id === item.id) || 
            guestStars.some(actor => actor.id === item.id)) {
          connectedNodes.push(tvNode);
        }
      });
    } else if (item.media_type === 'movie' || item.media_type === 'tv') {
      const personNodes = nodes.filter(node => node.type === 'person');
      personNodes.forEach(personNode => {
        const movieCredits = personNode.data.movie_credits?.cast || [];
        const tvCredits = personNode.data.tv_credits?.cast || [];
        if (item.media_type === 'movie' && movieCredits.some(credit => credit.id === item.id)) {
          connectedNodes.push(personNode);
        }
        if (item.media_type === 'tv' && tvCredits.some(credit => credit.id === item.id)) {
          connectedNodes.push(personNode);
        }
      });
    }
    return connectedNodes;
  };

  return (
    <div className={`search-entities-sidebar ${isOpen ? 'open' : ''}`}>
      <button onClick={handleClose} className="close-sidebar-btn">×</button>
      <h3>{showAllSearchable ? "All Connectable Entities" : "Connectable Search Results"}</h3>
      {isLoadingGeneral && <div>Loading...</div>}
      {!isLoadingGeneral && Object.keys(groupedEntities).map(type => (
        groupedEntities[type].length > 0 && (
          <div key={type} className="entity-group">
            <h4>{type.charAt(0).toUpperCase() + type.slice(1)}s</h4>
            <ul>
              {groupedEntities[type].map(item => {
                const itemKey = `${item.media_type}-${item.id}`;
                const isOnBoard = nodes.some(node => node.id === itemKey);
                const connectedToNodes = getConnectedNodes(item);
                return (
                  <li key={item.id} className={`entity-item ${isOnBoard ? 'on-board' : ''}`}>
                    <div>
                      <strong>{getItemTitle(item)}</strong>
                      {item.media_type === 'person' && item.known_for_department && ` (${item.known_for_department})`}
                      {item.release_date && ` (${item.release_date.substring(0,4)})`}
                      {item.first_air_date && ` (${item.first_air_date.substring(0,4)})`}
                    </div>
                    {!isOnBoard && (
                      <button onClick={() => handleAddToBoard(item)} className="add-to-board-btn">
                        Add to Board
                      </button>
                    )}
                    {connectedToNodes.length > 0 && (
                        <div className="connected-to-nodes">
                            Connects to: {connectedToNodes.map(node => getItemTitle(node.data)).join(', ')}
                        </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )
      ))}
      {!isLoadingGeneral && 
        !Object.values(groupedEntities).some(group => group.length > 0) &&
        <div>No {showAllSearchable ? "connectable entities found on the board" : "connectable entities in current search results"}.</div>
      }
    </div>
  );
};

export default SearchEntitiesSidebar;