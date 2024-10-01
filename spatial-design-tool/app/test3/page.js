"use client";
import { useState, useCallback, useEffect } from "react";
import WorldBuild from "../components/WorldBuild";
import HandTracker from "../components/WorldBuild/handsTracker";
import ModeIndicator from "../components/WorldBuild/ModeIndicator";
import CustomCursor from "../components/CustomCursor";
import HandsIndicator from "../components/WorldBuild/handsIndicator";

export default function Home() {
  const [handPosition, setHandPosition] = useState(null);
  const [selectedCube, setSelectedCube] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [backgroundColor, setBackgroundColor] = useState('#fff');
  const [isHover, setIsHover] = useState(false); // New state for hover
  const [handData, setHandData] = useState(null); // New state for hand data

  useEffect(() => {
    setCursorPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  }, []);

  const handleHandsDetected = useCallback((data) => {
    setHandData(data);
    // You can add additional logic here to handle cursor movement, clicks, etc.
    // based on the new hand data structure
  }, []);

  return (
    <div className="w-full h-screen relative cursor-none" style={{ backgroundColor }}>
      <WorldBuild 
        cursorPosition={cursorPosition} 
        isHover={isHover} 
        selectedCube={selectedCube}
        setSelectedCube={setSelectedCube}
      />
      <HandTracker onHandsDetected={handleHandsDetected} />
      <ModeIndicator handPosition={handPosition} />
      <CustomCursor position={cursorPosition} />
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
        <HandsIndicator handData={handData} />
      </div>
    </div>
  );
}