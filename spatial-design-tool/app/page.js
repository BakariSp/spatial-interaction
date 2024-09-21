"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useEffect, useCallback, memo, useMemo } from "react";
import * as handTrack from "handtrackjs";
import * as THREE from "three";
import { EdgesGeometry, LineBasicMaterial, LineSegments } from "three";

// Memoized Box component with selection effects
const Box = memo(function Box({ position, color, rotation, onPointerOver, onPointerOut, onClick, isSelected, scale, userData }) {
  const hoverScale = useMemo(() => {
    return scale.map(s => s * 1.2);
  }, [scale]);

  return (
    <group userData={userData}>
      <mesh
        position={position}
        rotation={rotation}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
        scale={isSelected ? hoverScale : scale}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {isSelected && (
        <lineSegments
          position={position}
          rotation={rotation}
          scale={hoverScale}
        >
          <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(1, 1, 1)]} />
          <lineBasicMaterial attach="material" color="white" linewidth={5} />
        </lineSegments>
      )}
    </group>
  );
});

// Memoized Scene component
const Scene = memo(function Scene({ handPosition, selectedCube, setSelectedCube, cursorPosition }) {
  const { camera, scene } = useThree();
  const redRotationRef = useRef([0, 0, 0]);
  const greenRotationRef = useRef([0, 0, 0]);
  const blueRotationRef = useRef([0, 0, 0]);
  const scaleRef = useRef({ red: 1, green: 1, blue: 1 });
  const positionRef = useRef({ red: [-2, 0, 0], green: [0, 0, 0], blue: [2, 0, 0] });

  useEffect(() => {
    if (handPosition && selectedCube) {
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
      }
    }
  }, [handPosition, selectedCube]);

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

  // Add a function to check if the cursor is over a cube
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

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Box {...getBoxProps('red')} userData={{ color: 'red' }} />
      <Box {...getBoxProps('green')} userData={{ color: 'green' }} />
      <Box {...getBoxProps('blue')} userData={{ color: 'blue' }} />
      <OrbitControls />
    </>
  );
});

const HandTracker = ({ onHandMove }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const modelRef = useRef(null);
  const isMountedRef = useRef(false);
  const lastHandPositionRef = useRef({ x: 0, y: 0 });
  const [error, setError] = useState(null);
  const initialDistanceRef = useRef(null);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsPointerLocked(!!document.pointerLockElement);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, []);

  const requestPointerLock = () => {
    const canvas = canvasRef.current;
    if (canvas && !isPointerLocked) {
      canvas.requestPointerLock();
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    const loadModelAndStartVideo = async () => {
      try {
        const model = await handTrack.load({
          flipHorizontal: true,
          outputStride: 16,
          imageScaleFactor: 1,
          maxNumBoxes: 3,
          iouThreshold: 0.2,
          scoreThreshold: 0.6,
          modelType: "ssd320fpnlite",
          modelSize: "medium",
          bboxLineWidth: "2",
          fontSize: 17,
        });
        modelRef.current = model;

        const video = videoRef.current;
        if (video) {
          video.addEventListener("loadeddata", onLoadedData);

          const status = await handTrack.startVideo(video);
          if (status) {
            console.log("Video started successfully");
          } else {
            setError("Please enable video access.");
          }
        }
      } catch (err) {
        console.error("Error loading model or starting video:", err);
        setError("Failed to load hand tracking model.");
      }
    };

    const onLoadedData = () => {
      console.log("Video data loaded");
      runDetection();
    };

    const runDetection = async () => {
      const model = modelRef.current;
      const video = videoRef.current;

      if (model && video && !video.paused) {
        try {
          var predictions = await model.detect(video);
          predictions = predictions.filter((pred) => pred.label !== "face");
          const pointHands = predictions.filter((pred) => pred.label === "point" || pred.score > 0.75);
          const openHands = predictions.filter((pred) => pred.label === "open");
          const closedHands = predictions.filter((pred) => pred.label === "closed" );

          if (predictions.length === 1 && predictions[0].label === "point") {
            const hand = pointHands[0];
            const handPosition = {
              x: (hand.bbox[0] + hand.bbox[2] / 2) / video.videoWidth,
              y: (hand.bbox[1] + hand.bbox[3] / 2) / video.videoHeight
            };
            onHandMove({ mode: 'move', hands: [handPosition] });
          } else if (openHands.length === 1) {
            const hand = openHands[0];
            const handPosition = {
              x: (hand.bbox[0] + hand.bbox[2] / 2) / video.videoWidth - 0.5,
              y: -((hand.bbox[1] + hand.bbox[3] / 2) / video.videoHeight - 0.5)
            };
            onHandMove({ 
              mode: 'rotate', 
              hands: [handPosition],
              rotationX: handPosition.y * Math.PI, // Vertical movement for X-axis rotation
              rotationY: handPosition.x * Math.PI  // Horizontal movement for Y-axis rotation
            });
          } else if (closedHands.length === 2) {
            const hand1 = closedHands[0];
            const hand2 = closedHands[1];
            
            const distance = Math.sqrt(
              Math.pow(hand2.bbox[0] - hand1.bbox[0], 2) +
              Math.pow(hand2.bbox[1] - hand1.bbox[1], 2)
            );

            if (initialDistanceRef.current === null) {
              initialDistanceRef.current = distance;
            }

            const scaleValue = distance / initialDistanceRef.current;
            onHandMove({ mode: 'scale', scaleValue });
          } else {
            // Send null for hand position, but don't update cursor position
            onHandMove(null);
          }

          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            model.renderPredictions(predictions, canvasRef.current, ctx, video);
          }
        } catch (err) {
          console.error("Detection error:", err);
        }

        if (isMountedRef.current) {
          animationFrameRef.current = requestAnimationFrame(runDetection);
        }
      }
    };

    loadModelAndStartVideo();

    return () => {
      isMountedRef.current = false;
      const video = videoRef.current;
      if (video) {
        handTrack.stopVideo(video);
        video.removeEventListener("loadeddata", onLoadedData);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onHandMove]);

  return (
    <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)" }}>
      <video
        ref={videoRef}
        style={{ display: "none", width: "400px", height: "350px" }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        width={400}
        height={350}
        style={{ width: "400px", height: "350px", border: "1px solid #ccc", cursor: isPointerLocked ? 'none' : 'auto' }}
        onClick={requestPointerLock}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!isPointerLocked && <p>Click on the canvas to enable cursor control</p>}
    </div>
  );
}

// New component for mode indicator
const ModeIndicator = ({ handPosition }) => {
  const mode = handPosition?.mode || 'none';
  const modeText = mode.charAt(0).toUpperCase() + mode.slice(1);
  
  let dataText = '';
  if (mode === 'rotate' && handPosition?.hands?.[0]) {
    const rotation = handPosition.hands[0].x * Math.PI * 2; // Assuming this is how rotation is calculated
    dataText = `Rotation: ${rotation.toFixed(2)} radians`;
  } else if (mode === 'scale' && handPosition?.scaleValue) {
    dataText = `Scale: ${handPosition.scaleValue.toFixed(2)}`;
  } else if (mode === 'move' && handPosition?.hands?.[0]) {
    const { x, y } = handPosition.hands[0];
    dataText = `Position: (${x.toFixed(2)}, ${y.toFixed(2)})`;
  }

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      padding: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      borderRadius: '5px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px'
    }}>
      <div>Mode: {modeText}</div>
      {dataText && <div>{dataText}</div>}
    </div>
  );
};

export default function Home() {
  const [handPosition, setHandPosition] = useState(null);
  const [selectedCube, setSelectedCube] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const handleHandMove = useCallback((position) => {
    setHandPosition(position);
    
    // Update cursor position only when 'point' gesture is detected
    if (position && position.mode === 'move' && position.hands && position.hands.length > 0) {
      const hand = position.hands[0];
      setCursorPosition({
        x: hand.x * window.innerWidth,
        y: hand.y * window.innerHeight
      });
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
        />
      </Canvas>
      <HandTracker onHandMove={handleHandMove} />
      <ModeIndicator handPosition={handPosition} />
      {/* Custom Cursor */}
      <div 
        className="custom-cursor" 
        style={{
          position: 'fixed',
          top: cursorPosition.y,
          left: cursorPosition.x,
          width: '20px',
          height: '20px',
          backgroundColor: 'red',
          borderRadius: '50%',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999, // Ensure the cursor is always on top
        }}
      />
    </div>
  );
}
