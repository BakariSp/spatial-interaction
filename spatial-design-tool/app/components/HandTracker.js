import { memo, useRef, useEffect, useState } from "react";
import * as handTrack from "handtrackjs";

const HandTracker = memo(function HandTracker({ onHandMove }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const modelRef = useRef(null);
  const isMountedRef = useRef(false);
  const lastHandPositionRef = useRef({ x: 0, y: 0 });
  const initialDistanceRef = useRef(null);
  const [error, setError] = useState(null);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  const pointerSizeHistory = useRef([]);
  const lastClickTime = useRef(0);

  const detectClick = (currentSize) => {
    const now = Date.now();
    pointerSizeHistory.current.push({ size: currentSize, time: now });

    // Keep only the last 250ms of history
    while (pointerSizeHistory.current.length > 0 && now - pointerSizeHistory.current[0].time > 250) {
      pointerSizeHistory.current.shift();
    }

    if (pointerSizeHistory.current.length > 1) {
      const oldestSize = pointerSizeHistory.current[0].size;
      const growthRatio = currentSize / oldestSize;

      if (growthRatio >= 1.5 && now - lastClickTime.current > 500) {
        lastClickTime.current = now;
        console.log("Click detected");
        return true;
      }
    }

    return false;
  };

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
          const closedHands = predictions.filter((pred) => pred.label === "closed");

          if (predictions.length === 1 && predictions[0].label === "point") {
            const hand = pointHands[0];
            const handPosition = {
              x: (hand.bbox[0] + hand.bbox[2] / 2) / video.videoWidth,
              y: (hand.bbox[1] + hand.bbox[3] / 2) / video.videoHeight
            };
            const currentSize = hand.bbox[2] * hand.bbox[3]; // Calculate bounding box area
            const isClicked = detectClick(currentSize);
            onHandMove({ 
              mode: 'cursor-move', 
              hands: [handPosition],
              clicked: isClicked
            });
          } else if (openHands.length === 1) { // Rotate
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
            onHandMove({ 
              mode: 'scale', 
              scaleValue 
            });
          } else if (closedHands.length === 1 && predictions.length === 1) {
            const hand = closedHands[0];
            const handPosition = {
              x: ((hand.bbox[0] + hand.bbox[2] / 2) / video.videoWidth - 0.5) * 2,
              y: -(((hand.bbox[1] + hand.bbox[3] / 2) / video.videoHeight - 0.5) * 2)
            };
            onHandMove({ 
              mode: 'move', 
              hands: [handPosition],
              moveFactor: 0.05 // Adjust this value to control movement speed
            });
          } else if (openHands.length === 2) {
            const hand1 = openHands[0];
            const hand2 = openHands[1];
            
            const distance = Math.sqrt(
              Math.pow(hand2.bbox[0] - hand1.bbox[0], 2) +
              Math.pow(hand2.bbox[1] - hand1.bbox[1], 2)
            );

            onHandMove({ 
              mode: 'camera-move', 
              distance: distance / video.videoWidth // Normalize the distance
            });
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
});

export default HandTracker;