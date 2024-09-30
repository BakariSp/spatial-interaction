import { memo, useRef, useEffect, useCallback, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import Box from "./Box";
import { OrbitControls } from "@react-three/drei";

const Scene = memo(function Scene({ handPosition, selectedCube, setSelectedCube, cursorPosition, backgroundColor }) {
  const { camera, scene } = useThree();
  const redRotationRef = useRef([0, 0, 0]);
  const greenRotationRef = useRef([0, 0, 0]);
  const blueRotationRef = useRef([0, 0, 0]);
  const scaleRef = useRef({ red: 1, green: 1, blue: 1 });
  const positionRef = useRef({ red: [-2, 0, 0], green: [0, 0, 0], blue: [2, 0, 0] });
  const cameraPositionRef = useRef(1); // Initial camera position

  useEffect(() => {
    if (handPosition) {
      if (handPosition.mode === 'camera-move') {
        const moveFactor = 10; // Adjust this value to control camera movement speed
        const newPosition = cameraPositionRef.current + (handPosition.distance - 0.5) * moveFactor;
        cameraPositionRef.current = newPosition;
        camera.position.z = newPosition;
      } else if (selectedCube) {
        if (handPosition.mode === 'rotate' && handPosition.hands.length === 1) {
          const rotationRef = selectedCube === "red" ? redRotationRef
            : selectedCube === "green" ? greenRotationRef
            : blueRotationRef;
          
          rotationRef.current = [
            handPosition.rotationX,
            handPosition.rotationY,
            0
          ];
        } else if (handPosition.mode === 'scale') {
          scaleRef.current = {
            ...scaleRef.current,
            [selectedCube]: handPosition.scaleValue
          };
        } else if (handPosition.mode === 'move') {
          const moveFactor = handPosition.moveFactor || 0.05;
          const newPosition = [
            positionRef.current[selectedCube][0] + handPosition.hands[0].x * moveFactor,
            positionRef.current[selectedCube][1] + handPosition.hands[0].y * moveFactor,
            positionRef.current[selectedCube][2]
          ];
          positionRef.current = {
            ...positionRef.current,
            [selectedCube]: newPosition
          };
        }
      }
    }
  }, [handPosition, selectedCube, camera]);

  const getBoxProps = (color) => ({
    position: positionRef.current[color],
    color: color,
    rotation: color === 'red' ? redRotationRef.current
      : color === 'green' ? greenRotationRef.current
      : blueRotationRef.current,
    onClick: () => setSelectedCube(color),
    onPointerOver: () => {}, // Remove hover effect
    onPointerOut: () => {}, // Remove hover effect
    isSelected: selectedCube === color,
    scale: [scaleRef.current[color], scaleRef.current[color], scaleRef.current[color]],
  });

  const checkCursorOverCube = useCallback(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(
      (cursorPosition.x / window.innerWidth) * 2 - 1,
      -(cursorPosition.y / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      if (intersectedObject.parent && intersectedObject.parent.userData.color) {
        setSelectedCube(intersectedObject.parent.userData.color);
      }
    } else {
      setSelectedCube(null);
    }
  }, [cursorPosition, setSelectedCube, camera, scene]);

  useEffect(() => {
    checkCursorOverCube();
  }, [cursorPosition, checkCursorOverCube]);

  const boxProps = useMemo(() => ({
    red: getBoxProps('red'),
    green: getBoxProps('green'),
    blue: getBoxProps('blue')
  }), [redRotationRef.current, greenRotationRef.current, blueRotationRef.current, scaleRef.current, selectedCube, positionRef.current]);

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Box {...boxProps.red} userData={{ color: 'red' }} />
      <Box {...boxProps.green} userData={{ color: 'green' }} />
      <Box {...boxProps.blue} userData={{ color: 'blue' }} />
      <OrbitControls />
    </>
  );
});

export default Scene;