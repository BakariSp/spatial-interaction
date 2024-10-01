import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import GrassModel from './grassModel';

class CubeDate {
  constructor(cubeSize, position, material, hasGrass = false) {
    this.cubeSize = cubeSize;
    this.position = position;
    this.material = material; // store as string: "default" or "newMaterial"
    this.hasGrass = hasGrass;
  }
}

const CubeArray = React.memo(({ size, cubeSize, selectState }) => {
  const meshRefs = useRef([]);
  const [cubeData, setCubeData] = useState([]);

  const defaultMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x000000 }), []);
  const newMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xff0000 }), []);
  const cubeGeometry = useMemo(() => new THREE.BoxGeometry(cubeSize, 0.1, cubeSize), [cubeSize]);

  const getMaterialByName = useCallback((name) => {
    return name === "newMaterial" ? newMaterial : defaultMaterial;
  }, [newMaterial, defaultMaterial]);

  useEffect(() => {
    const storedCubeData = JSON.parse(localStorage.getItem('cubeData'));
    if (storedCubeData) {
      setCubeData(storedCubeData.map(item => new CubeDate(item.cubeSize, item.position, item.material, item.hasGrass)));
    } else {
      const initialCubeData = useMemo(() => {
        const data = [];
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            data.push(new CubeDate(cubeSize, [i, j], "default"));
          }
        }
        return data;
      }, [size, cubeSize]);

      setCubeData(initialCubeData);
      localStorage.setItem('cubeData', JSON.stringify(initialCubeData));
    }
  }, [size, cubeSize]);

  const selectCube = useCallback((index) => {
    if (meshRefs.current[index]) {
      setCubeData(prevData => {
        const updatedCubeData = [...prevData];
        if (updatedCubeData[index].hasGrass) {
          updatedCubeData[index].material = "default";
          updatedCubeData[index].hasGrass = false;
        } else if (selectState) {
          updatedCubeData[index].material = "newMaterial";
          updatedCubeData[index].hasGrass = true;
        }
        localStorage.setItem('cubeData', JSON.stringify(updatedCubeData));
        return updatedCubeData;
      });
    }
  }, [selectState]);

  return (
    <>
      {cubeData.map((item, index) => (
          <mesh
            key={`cube-${index}`}
            position={[item.position[0], 0, item.position[1]]}
            onPointerEnter={() => selectState && selectCube(index)}
            onClick={() => selectCube(index)}
            geometry={cubeGeometry}
            material={getMaterialByName(item.material)}
            ref={(ref) => (meshRefs.current[index] = ref)}
          />
      ))}

      {cubeData.map((item, index) => (
        item.hasGrass && (
        <mesh key={`grass-${index}`} position={[item.position[0], 0.1, item.position[1]]}>
          <GrassModel ></GrassModel>
        </mesh>
      )))}
    </>
  );
});


export default CubeArray;