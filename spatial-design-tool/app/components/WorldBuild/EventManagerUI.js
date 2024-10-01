import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const EventManagerUI = ({ onEventConfigChange }) => {
  const [eventConfig, setEventConfig] = useState([
    { id: 'hover', hands: ['point', 'closed'], mode: 'hover' },
    { id: 'cursor-move', hands: ['point'], mode: 'cursor-move' },
    { id: 'rotate', hands: ['open'], mode: 'rotate' },
    { id: 'scale', hands: ['closed', 'closed'], mode: 'scale' },
    { id: 'move', hands: ['closed'], mode: 'move' },
    { id: 'camera-move', hands: ['open', 'open'], mode: 'camera-move' },
  ]);

  useEffect(() => {
    onEventConfigChange(eventConfig);
  }, [eventConfig, onEventConfigChange]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(eventConfig);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEventConfig(items);
  };

  const updateEventConfig = (id, field, value) => {
    setEventConfig(prevConfig =>
      prevConfig.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="event-manager-ui" style={{background: 'rgba(0, 0, 0, 0.7)'}}>
      <h2>Gesture Event Configuration</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="event-list">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {eventConfig.map((event, index) => (
                <Draggable key={event.id} draggableId={event.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="event-item"
                    >
                      <div className="event-details">
                        <select
                          value={event.hands[0]}
                          onChange={(e) => updateEventConfig(event.id, 'hands', [e.target.value, event.hands[1]])}
                        >
                          <option value="point">Point</option>
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                        </select>
                        {event.hands[1] && (
                          <select
                            value={event.hands[1]}
                            onChange={(e) => updateEventConfig(event.id, 'hands', [event.hands[0], e.target.value])}
                          >
                            <option value="point">Point</option>
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                          </select>
                        )}
                        <span>=</span>
                        <input
                          type="text"
                          value={event.mode}
                          onChange={(e) => updateEventConfig(event.id, 'mode', e.target.value)}
                        />
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default EventManagerUI;