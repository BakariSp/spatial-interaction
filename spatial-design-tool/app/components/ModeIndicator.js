import { memo } from "react";

const ModeIndicator = memo(function ModeIndicator({ handPosition }) {
  const mode = handPosition?.mode || 'none';
  const modeText = mode.charAt(0).toUpperCase() + mode.slice(1);
  
  let dataText = '';
  if (mode === 'rotate' && handPosition?.hands?.[0]) {
    const rotation = handPosition.hands[0].x * Math.PI * 2; // Assuming this is how rotation is calculated
    dataText = `Rotation: ${rotation.toFixed(2)} radians`;
  } else if (mode === 'scale' && handPosition?.scaleValue) {
    dataText = `Scale: ${handPosition.scaleValue.toFixed(2)}`;
  } else if (mode === 'cursor-move' && handPosition?.hands?.[0]) {
    const { x, y } = handPosition.hands[0];
    dataText = `Position: (${x.toFixed(2)}, ${y.toFixed(2)})`;
  } else if (mode === 'move' && handPosition?.hands?.[0]) {
    const { x, y } = handPosition.hands[0];
    dataText = `Position: (${x.toFixed(2)}, ${y.toFixed(2)})`;
  } else if (mode === 'camera-move' && handPosition?.distance) {
    dataText = `Camera Move: ${handPosition.distance.toFixed(2)}`;
  }

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '50%',
      padding: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      borderRadius: '5px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      textAlign: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      textSizeAdjust: '150%'
    }}>
      <div>Mode: {modeText}</div>
      {dataText && <div>{dataText}</div>}
    </div>
  );
});

export default ModeIndicator;