import React from 'react';
import { Box } from '@mui/material';
import DraggableNode from './DraggableNode';

const NodeLayer = ({ 
  nodes, 
  nodePositions, 
  updateNodePosition, 
  startActors 
}) => {
  return (
    <Box className="nodes-container">
      {nodes.map(node => {
        // Check if this node is one of the starting actors
        const isStartActor = startActors.some(actor => 
          `person-${actor.id}` === node.id
        );          return (
          <DraggableNode
            key={node.id}
            node={node}
            position={nodePositions[node.id] || { x: 0, y: 0 }}
            updatePosition={updateNodePosition}
            isStartActor={isStartActor}
          />
        );
      })}
    </Box>
  );
};

export default NodeLayer;