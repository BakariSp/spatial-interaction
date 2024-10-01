import React, { useState, useEffect, useCallback } from 'react';
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
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (typeof onEventConfigChange === 'function') {
      onEventConfigChange(eventConfig);
    }
  }, [eventConfig, onEventConfigChange]);

  const onDragEnd = useCallback((result) => {
    if (!result.destination || !isEditMode) return;

    const items = Array.from(eventConfig);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEventConfig(items);
  }, [eventConfig, isEditMode]);

  const updateEventConfig = useCallback((id, field, value) => {
    if (!isEditMode) return;
    setEventConfig(prevConfig =>
      prevConfig.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }, [isEditMode]);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <div className="event-manager-ui">
      <h2>Gesture Event Configuration</h2>
      <button onClick={toggleEditMode}>
        {isEditMode ? 'Save Changes' : 'Edit Configuration'}
      </button>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="event-list">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {eventConfig.map((event, index) => (
                <Draggable key={event.id} draggableId={event.id} index={index} isDragDisabled={!isEditMode}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="event-item"
                    >
                      <div className="event-details">
                        {isEditMode ? (
                          <>
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
                          </>
                        ) : (
                          <span>{`${event.hands.join(' + ')} = ${event.mode}`}</span>
                        )}
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