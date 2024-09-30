import * as THREE from "three";
import React, { useState, useEffect } from 'react';
import { OrthographicCamera, OrbitControls } from "@react-three/drei";
import CubeArray from './CubeArray';

const GameCanvas = ({ size, cubeSize, selectState, setSelectState, setPointersIndecator, cursorPosition, isHover }) => {
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isPointerEnter, setIsPointerEnter] = useState(false);
  const boxMaterial = new THREE.MeshBasicMaterial({ opacity: 0.1, transparent: true, color: 0x00ff00 });

  const handlePointerDown = () => {
    setIsPointerDown(true);
  };

  const handlePointerUp = () => {
    setIsPointerDown(false);
    setSelectState(false);
  };

  const handlePointerEnter = () => {
    setIsPointerEnter(true);
  };

  const handlePointerLeave = () => {
    setIsPointerEnter(false);
  };

  useEffect(() => {
    const checkPointerStatus = () => {
      if (isPointerDown && isPointerEnter) {
        setSelectState(true);
      }

      setPointersIndecator(
        <>
          <p>Pointer Down: {isPointerDown ? 'true' : 'false'}</p>
          <p>Pointer Enter: {isPointerEnter ? 'true' : 'false'}</p>
        </>
      );
    };
    checkPointerStatus();
  }, [isPointerDown, isPointerEnter, setSelectState, setPointersIndecator]);

  useEffect(() => {
    if (isHover && cursorPosition) {
      // Convert cursorPosition to normalized device coordinates
      const x = (cursorPosition.x / window.innerWidth) * 2 - 1;
      const y = -(cursorPosition.y / window.innerHeight) * 2 + 1;

      // Raycaster to detect intersection
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(x, y);
      raycaster.setFromCamera(mouse, camera);

      // Access camera and scene from context
      // Ensure 'camera' is accessible here, possibly by passing it as a prop or using useThree()

      // Example using useThree:
      // const { camera, scene } = useThree();
      // const intersects = raycaster.intersectObjects(scene.children, true);
      // if (intersects.length > 0) {
      //   const intersectedObject = intersects[0].object;
      //   // Highlight the intersected object or perform actions
      // }
    }
  }, [isHover, cursorPosition]);

  return (
    <>
      <OrthographicCamera
        makeDefault
        far={500}
        near={0}
        position={[size * 1.2 , 6, size * 1.2 ]}
        rotation={[-Math.PI / 4, Math.PI / 4, 0]}
        zoom={75}
      />
      <OrbitControls enableRotate={!selectState} target={[size / 2, 0.5, size / 2]}/>
      <mesh
        position={[size * 0.5, 0, size * 0.5]}
        material={boxMaterial}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <boxGeometry args={[size * 1.1, 3, size * 1.1]} />
      </mesh>
      <CubeArray 
        size={size} 
        cubeSize={cubeSize} 
        selectState={selectState} 
        cursorPosition={cursorPosition} 
        isHover={isHover} 
      />
    </>
  );
};

export default GameCanvas;