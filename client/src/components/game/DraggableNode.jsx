/**
 * DraggableNode.jsx
 * 
 * This component represents an interactive node in the game board that can be:
 * - Dragged around the board (mouse and touch support)
 * - Double-clicked/tapped to show its connections
 * - Visually styled based on entity type (person, movie, TV show)
 * 
 * Each node displays:
 * - An image (poster for movies/TV shows or profile for actors)
 * - A title/name
 * - A type badge
 * - Special highlighting for starting actors
 */
import React, { useRef, useState } from 'react';
import Draggable from 'react-draggable'; // Use the react-draggable library
import { getImageUrlSync } from '../../services/tmdbService';
import { getItemTitle } from '../../utils/stringUtils';
import { useGameLogicContext } from '../../hooks/contextHooks';
import './DraggableNode.css';

const DraggableNode = ({ node, position, updatePosition, isStartActor }) => {
  const nodeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Get the selectNode function from GameLogicContext
  const { selectNode } = useGameLogicContext();
  
  // Determine the appropriate image type and URL based on node type
  const imageType = node.type === 'person' ? 'profile' : 'poster';
  const imageUrl = node.data?.poster_path || node.data?.profile_path 
    ? getImageUrlSync(node.data.poster_path || node.data.profile_path, imageType)
    : null;
  
  // Get the display title for the node
  const title = getItemTitle(node.data);
    // Handle double-click to show connections
  const handleDoubleClick = () => {
    selectNode(node);
  };
  
  // Handle when dragging stops to update node position
  const handleDragStop = (e, data) => {
    // Update the position in the parent component with node.id
    updatePosition(node.id, { x: data.x, y: data.y });
    // Reset z-index when done dragging
    if (nodeRef.current) {
      nodeRef.current.style.zIndex = "auto";
    }
    setIsDragging(false);
  };
  
  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
    // Set high z-index to ensure the node is on top while dragging
    if (nodeRef.current) {
      nodeRef.current.style.zIndex = "1000";
    }
  };

  /**
   * Determine background color based on node type
   * @returns {string} CSS color value
   */
  const getNodeColor = () => {
    switch(node.type) {
      case 'person':
        return 'rgba(111, 168, 220, 0.9)'; // Blue for actors
      case 'movie':
        return 'rgba(201, 176, 55, 0.9)'; // Old Gold for movies
      case 'tv':
        return 'rgba(215, 215, 215, 0.9)'; // Silver for TV shows
      default:
        return 'rgba(200, 200, 200, 0.9)';
    }
  };
  
  const nodeBorderColor = getNodeColor();  return (
    <Draggable
      /* Using position prop makes this a controlled component that follows the Redux pattern.
         The state is the single source of truth maintained in the parent. */
      position={position}
      /* Cancel defaults to null which is what we want - don't cancel any drags */
      cancel={null}
      /* Set the grid to 1,1 for smooth dragging */
      grid={[1, 1]}
      /* Report position changes on drag stop */
      onStop={(e, data) => handleDragStop(e, data)}
      onStart={handleDragStart}
      /* Use bounds="parent" to constrain to parent container */
      bounds="parent"
      nodeRef={nodeRef}
    >
      <div 
        id={node.id}
        ref={nodeRef} 
        className={`draggable-node ${isDragging ? 'dragging' : ''} ${node.type}-node ${isStartActor ? 'start-actor' : ''}`}
        style={{ borderColor: nodeBorderColor }}
        onDoubleClick={handleDoubleClick}
      >
        <div className="node-content">
          <div className="node-image-container">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="node-image" draggable="false" />
            ) : (
              <div className="node-image-placeholder"> 
                {title.substring(0, 2)}
              </div>
            )}
            
            <div className="node-type-badge">
              {node.type}
            </div>
            <div className="node-title-overlay">
              {title}
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default DraggableNode;