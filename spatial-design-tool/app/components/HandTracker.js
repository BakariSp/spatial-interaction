import { memo, useRef, useEffect, useState } from "react";
import * as handTrack from "handtrackjs";

const HandTracker = memo(function HandTracker({ onHandsDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const modelRef = useRef(null);
  const isMountedRef = useRef(false);
  const [error, setError] = useState(null);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  const pointerSizeHistory = useRef([]);
  const lastClickTime = useRef(0);

  const detectClick = (currentSize) => {
    const now = Date.now();
    pointerSizeHistory.current.push({ size: currentSize, time: now });

    // Keep only the last 250ms of history
    while (
      pointerSizeHistory.current.length > 0 &&
      now - pointerSizeHistory.current[0].time > 250
    ) {
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

    document.addEventListener("pointerlockchange", handlePointerLockChange);

    return () => {
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
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
          const predictions = await model.detect(video);
          console.log("Raw Predictions:", predictions); // Debugging line
          const handData = processHandData(predictions, video);
          console.log("Processed Hand Data:", handData); // Debugging line
          onHandsDetected(handData);

          // Render predictions on canvas
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

    const processHandData = (predictions, video) => {
      const handTypes = {
        point: [],
        open: [],
        closed: [],
      };
      const faces = [];

      predictions.forEach((pred) => {
        const { label, bbox, score } = pred;

        // Log each prediction for debugging
        console.log(`Label: ${label}, Score: ${score}`);

        const objectInfo = {
          bbox,
          position: {
            x: (bbox[0] + bbox[2] / 2) / video.videoWidth,
            y: (bbox[1] + bbox[3] / 2) / video.videoHeight,
          },
          confidence: score,
        };

        if (label.toLowerCase() === "face") {
          faces.push(objectInfo);
        } else if (label.toLowerCase() === "point") {
          handTypes.point.push(objectInfo);
        } else if (label.toLowerCase() === "open") {
          handTypes.open.push(objectInfo);
        } else if (label.toLowerCase() === "closed") {
          handTypes.closed.push(objectInfo);
        } else {
          console.warn(`Unknown label detected: ${label}`);
        }
      });

      return {
        pointHands: {
          count: handTypes.point.length,
          hands: handTypes.point,
        },
        openHands: {
          count: handTypes.open.length,
          hands: handTypes.open,
        },
        closedHands: {
          count: handTypes.closed.length,
          hands: handTypes.closed,
        },
        faces: {
          count: faces.length,
          detections: faces,
        },
        totalHands:
          handTypes.point.length +
          handTypes.open.length +
          handTypes.closed.length,
      };
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
  }, [onHandsDetected]);

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
        style={{
          width: "400px",
          height: "350px",
          border: "1px solid #ccc",
          cursor: isPointerLocked ? "none" : "auto",
        }}
        onClick={requestPointerLock}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!isPointerLocked && (
        <p>Click on the canvas to enable cursor control</p>
      )}
    </div>
  );
});

export default HandTracker;