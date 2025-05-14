import React from 'react';
import { useGameLogicContext, useBoardContext } from '../../hooks/contextHooks';
import { getItemTitle } from '../../utils/stringUtils';

import ConnectionContent from './ConnectionContent';
import './ConnectionsPanel.css';

const ConnectionsPanel = () => {
  const { 
    selectedNode, 
    closeConnectionsPanel, 
  } = useGameLogicContext();
  
  const {
    nodes, 
    addToBoard, 
  } = useBoardContext();
  
  if (!selectedNode) return null;
  
  const title = getItemTitle(selectedNode.data);
  const nodeType = selectedNode.type;
  
  const isItemOnBoard = (item, type) => {
    const itemId = `${type}-${item.id}`;
    return nodes.some(node => node.id === itemId);
  };

  const getPossibleConnections = () => {
    switch (nodeType) {
      case 'person': {
        const movieCredits = selectedNode.data.movie_credits?.cast || [];
        const tvCredits = selectedNode.data.tv_credits?.cast || [];
        
        const sortedMovies = [...movieCredits].sort((a, b) => b.popularity - a.popularity);
        const sortedTvShows = [...tvCredits].sort((a, b) => b.popularity - a.popularity);
        
        const markedTvShows = sortedTvShows.map(show => ({
          ...show,
          isGuestAppearance: show.is_guest_appearance || 
                             show.isGuestAppearance ||
                             (show.character && show.character.toLowerCase().includes('guest')) ||
                             (show.credit_id && show.credit_id.toLowerCase().includes('guest')) ||
                             false
        }));
        
        return {
          movies: sortedMovies,
          tvShows: markedTvShows
        };
      }
      case 'movie': {
        const cast = selectedNode.data.credits?.cast || [];
        const sortedCast = [...cast].sort((a, b) => (a.order || 999) - (b.order || 999));
        return { cast: sortedCast };
      }
      case 'tv': {
        const regularCast = selectedNode.data.credits?.cast || [];
        const aggregateCast = selectedNode.data.aggregate_credits?.cast || [];
        const castToUse = aggregateCast.length > 0 ? aggregateCast : regularCast;
        const sortedCast = [...castToUse].sort((a, b) => {
          const aEpisodes = a.total_episode_count || a.episode_count || 0;
          const bEpisodes = b.total_episode_count || b.episode_count || 0;
          if (bEpisodes !== aEpisodes) return bEpisodes - aEpisodes;
          return b.popularity - a.popularity;
        });
        return { cast: sortedCast };
      }
      default:
        return {};
    }
  };
  
  const connectionsData = getPossibleConnections();

  const handleAddToBoard = (item, mediaType) => {
    let itemToAdd = { ...item, media_type: mediaType };
    if (mediaType === 'tv' && item.isGuestAppearance) {
      itemToAdd.is_guest_appearance = true;
      itemToAdd.hasGuestAppearances = true; 
    }
    addToBoard(itemToAdd);
  };
  
  const isGuestStar = (actor) => {
    if (actor.roles && Array.isArray(actor.roles)) {
      return actor.roles.some(role => role.character && role.character.toLowerCase().includes('guest'));
    }
    if (actor.character && typeof actor.character === 'string') {
      return actor.character.toLowerCase().includes('guest');
    }
    if (typeof actor.is_guest_appearance === 'boolean') {
      return actor.is_guest_appearance;
    }
    if (typeof actor.isGuestAppearance === 'boolean') {
        return actor.isGuestAppearance;
    }
    return false;
  };

  return (
    <div className="connections-panel">
      <div className="connections-header">
        <h2>{title}</h2>
        <button className="close-button" onClick={closeConnectionsPanel}>×</button>
      </div>
      
      <ConnectionContent
        nodeType={nodeType}
        connections={connectionsData}
        isItemOnBoard={isItemOnBoard}
        handleAddToBoard={handleAddToBoard}
        isGuestStar={isGuestStar}
      />
    </div>
  );
};

export default ConnectionsPanel;