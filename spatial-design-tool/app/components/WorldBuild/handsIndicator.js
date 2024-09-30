import React from 'react';
import './handsIndicator.css'; // Make sure to create this CSS file for styling

const HandsIndicator = ({ handData }) => {
  if (!handData) return null;

  const { pointHands, openHands, closedHands, faces, totalHands } = handData;

  const renderHandInfo = (handType, hands) => {
    if (!hands || hands.count === 0) return null; // Prevent rendering empty categories
    return (
      <div className="hand-type-info">
        <h4>{handType} Hands: {hands.count}</h4>
        {hands.hands.map((hand, index) => (
          <div key={index} className="hand-details">
            <p><strong>Hand {index + 1}:</strong></p>
            <p>Position: ({hand.position.x.toFixed(2)}, {hand.position.y.toFixed(2)})</p>
            <p>Confidence: {(hand.confidence * 100).toFixed(2)}%</p>
          </div>
        ))}
      </div>
    );
  };

  const renderFaceInfo = () => {
    if (!faces || faces.count === 0) return null; // Prevent rendering if no faces detected
    return (
      <div className="face-info">
        <h4>Faces: {faces.count}</h4>
        {faces.detections.map((face, index) => (
          <div key={index} className="face-details">
            <p><strong>Face {index + 1}:</strong></p>
            <p>Position: ({face.position.x.toFixed(2)}, {face.position.y.toFixed(2)})</p>
            <p>Confidence: {(face.confidence * 100).toFixed(2)}%</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="hands-indicator-container">
      <div className="indicator-left">
        <h2>Detected Objects: {totalHands + (faces ? faces.count : 0)}</h2>
        <div className="counts">
          <p><strong>Pointing Hands:</strong> {pointHands.count}</p>
          <p><strong>Open Hands:</strong> {openHands.count}</p>
          <p><strong>Closed Hands:</strong> {closedHands.count}</p>
          <p><strong>Faces:</strong> {faces.count}</p>
        </div>
      </div>
      <div className="indicator-right">
        {renderHandInfo("Pointing", pointHands)}
        {renderHandInfo("Open", openHands)}
        {renderHandInfo("Closed", closedHands)}
        {renderFaceInfo()}
      </div>
    </div>
  );
};

export default HandsIndicator;