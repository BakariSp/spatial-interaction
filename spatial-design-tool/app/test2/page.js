'use client'
import './page.css';
import React, { useState, useCallback } from 'react';
import { Canvas } from "@react-three/fiber";
import GameCanvas from '@/app/components/WorldBuild/GameCanvas';
import GrassModel from '@/app/components/WorldBuild/grassModel';

const size = 10;
const cubeSize = 0.8;

function WorldBuild() {
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

  return (
    <>
      <div className='overlay'>
        <button onClick={handleSelectState}>Reset</button>
        <div className='unselectable'>
          <p>Select State: {selectState ? 'true' : 'false'}</p>
          {pointersIndecator}
        </div>
      </div>
      
      <Canvas style={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
        <ambientLight intensity={1} />
        <directionalLight color="red" position={[5, 0, 5]} />
        <GameCanvas 
          size={size} cubeSize={cubeSize}
          selectState={selectState} setSelectState={setSelectStateCallback}
          setPointersIndecator={setPointersIndecatorCallback}
        />
      </Canvas>
    </>
  );
}

export default WorldBuild;