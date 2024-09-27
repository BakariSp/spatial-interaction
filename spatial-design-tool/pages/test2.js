import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import styles from './page.module.css';

function Cube() {
  const meshRef = useRef();
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta;
    meshRef.current.rotation.y += delta;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={0x00ff00} />
    </mesh>
  );
}

function Plane() {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      {/* <mesh>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="gray" side={2} />
      </mesh> */}
      <Grid
        args={[10, 10]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#0000ff"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#ff0000"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      />
    </group>
  );
}

const Test2 = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 2, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Cube />
        <Plane />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Test2;
