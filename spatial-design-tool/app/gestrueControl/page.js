"use client";
import { Canvas } from "@react-three/fiber";
import { useState, useCallback, useEffect } from "react";
import Scene from "../components/Scene.js";
import HandTracker from "../components/WorldBuild/handsTracker.js/index.js";
import ModeIndicator from "../components/ModeIndicator.js";
import CustomCursor from "../components/CustomCursor.js";

export default function Home() {
  const [handPosition, setHandPosition] = useState(null);
  const [selectedCube, setSelectedCube] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [backgroundColor, setBackgroundColor] = useState('#000000');

  useEffect(() => {
    setCursorPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  }, []);

  const handleHandMove = useCallback((position) => {
    setHandPosition(position);
    if (position?.mode === 'cursor-move' && position.hands?.[0]) {
      const hand = position.hands[0];
      setCursorPosition({
        x: hand.x * window.innerWidth,
        y: hand.y * window.innerHeight
      });
      if (position.clicked) {
        const newColor = `hsl(${Math.random() * 360}, 20%, 50%)`;
        setBackgroundColor(newColor);
      }
    }
  }, []);

  return (
    <div className="w-full h-screen relative cursor-none">
      <Canvas>
        <Scene
          handPosition={handPosition}
          selectedCube={selectedCube}
          setSelectedCube={setSelectedCube}
          cursorPosition={cursorPosition}
          backgroundColor={backgroundColor}
        />
      </Canvas>
      <HandTracker onHandMove={handleHandMove} />
      <ModeIndicator handPosition={handPosition} />
      <CustomCursor position={cursorPosition} />
    </div>
  );
}
