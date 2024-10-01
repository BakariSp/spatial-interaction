import { memo } from "react";

const ModeIndicator = memo(function ModeIndicator({ handData, eventConfig }) {
  if (!handData || !eventConfig) return null;

  const { pointHands, openHands, closedHands, totalHands } = handData;

  const getActiveMode = () => {
    for (const event of eventConfig) {
      if (event.hands.length === totalHands) {
        const handCounts = {
          point: pointHands.count,
          open: openHands.count,
          closed: closedHands.count,
        };
        if (event.hands.every(handType => handCounts[handType] > 0)) {
          return event.mode;
        }
      }
    }
    return 'none';
  };

  const mode = getActiveMode();
  const modeText = mode.charAt(0).toUpperCase() + mode.slice(1);

  const getDataText = () => {
    switch (mode) {
      case 'rotate':
        if (openHands.count > 0) {
          const hand = openHands.hands[0];
          return `Rotation: (${hand.position.x.toFixed(2)}, ${hand.position.y.toFixed(2)})`;
        }
        break;
      case 'scale':
        if (closedHands.count === 2) {
          const distance = Math.hypot(
            closedHands.hands[0].position.x - closedHands.hands[1].position.x,
            closedHands.hands[0].position.y - closedHands.hands[1].position.y
          );
          return `Scale: ${distance.toFixed(2)}`;
        }
        break;
      case 'cursor-move':
      case 'move':
        if (pointHands.count > 0) {
          const hand = pointHands.hands[0];
          return `Position: (${hand.position.x.toFixed(2)}, ${hand.position.y.toFixed(2)})`;
        }
        break;
      case 'camera-move':
        if (openHands.count === 2) {
          const distance = Math.hypot(
            openHands.hands[0].position.x - openHands.hands[1].position.x,
            openHands.hands[0].position.y - openHands.hands[1].position.y
          );
          return `Camera Move: ${distance.toFixed(2)}`;
        }
        break;
      case 'hover':
        return 'Hovering';
      default:
        return '';
    }
  };

  const dataText = getDataText();

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      color: 'white',
      borderRadius: '5px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      textAlign: 'center',
      zIndex: 1000,
    }}>
      <div style={{ fontWeight: 'bold' }}>Mode: {modeText}</div>
      {dataText && <div>{dataText}</div>}
    </div>
  );
});

export default ModeIndicator;