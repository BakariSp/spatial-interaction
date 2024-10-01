'use client'
import './WorldBuild.css';
import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from "@react-three/fiber";
import GameCanvas from './WorldBuild/GameCanvas';
import GrassModel from './WorldBuild/grassModel';
import HandTracker from './WorldBuild/handsTracker';
import HandsEventManager from './WorldBuild/handsEventManager';
import EventManagerUI from './WorldBuild/EventManagerUI';

const size = 10;
const cubeSize = 0.8;

function WorldBuild({ cursorPosition, isHover, selectedCube, setSelectedCube }) {
  const [handEvent, setHandEvent] = useState(null);
  const [eventConfig, setEventConfig] = useState(null);

  const handleHandEvent = (event) => {
    setHandEvent(event);
    // Use the event data to update your 3D world or UI
  };

  const handleEventConfigChange = useCallback((newConfig) => {
    setEventConfig(newConfig);
  }, []);

  const { processHandData } = HandsEventManager({ 
    onHandEvent: handleHandEvent,
    eventConfig: eventConfig
  });

  const [selectState, setSelectState] = useState(false);
  const [pointersIndecator, setPointersIndecator] = useState(<></>);

  const handleSelectState = () => {
    localStorage.clear();
    window.location.reload();
  }

  const setSelectStateCallback = useCallback((value) => {
    setSelectState(value);
  }, []);

  const setPointersIndecatorCallback = useCallback((value) => {
    setPointersIndecator(value);
  }, []);

  useEffect(() => {
    if (isHover && cursorPosition) {
      // Implement hover logic based on cursorPosition if needed
      // For example, highlight the cube under the cursor
    }
  }, [isHover, cursorPosition]);

  return (
    <div>
      <HandTracker onHandsDetected={processHandData} />
      <EventManagerUI onEventConfigChange={handleEventConfigChange} />
      <div className='overlay'>
        <button onClick={handleSelectState}>Reset</button>
        <div className='unselectable'>
          <p>Select State: {selectState ? 'true' : 'false'}</p>
          {pointersIndecator}
        </div>
      </div>
      
      <Canvas 
        style={{width: '100vw', height: '100vh', overflow: 'hidden', cursor: 'none'}}
      >
        <ambientLight intensity={1} />
        <directionalLight color="red" position={[5, 0, 5]} />
        <GameCanvas 
          size={size} 
          cubeSize={cubeSize}
          selectState={selectState} 
          setSelectState={setSelectStateCallback}
          setPointersIndecator={setPointersIndecatorCallback}
          cursorPosition={cursorPosition}
          isHover={isHover}
          selectedCube={selectedCube}
          setSelectedCube={setSelectedCube}
        />
      </Canvas>
    </div>
  );
}

export default WorldBuild;