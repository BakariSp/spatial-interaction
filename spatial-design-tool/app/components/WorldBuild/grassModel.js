import React from 'react';
import { useGLTF } from '@react-three/drei';

const GrassModel = ({position}) => {
  const { scene } = useGLTF("/models/grass.glb");
  return <primitive scale={0.1} object={scene.clone()} position={position}/>;
};

export default GrassModel;
