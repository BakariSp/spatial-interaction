import { memo, useMemo } from "react";
import * as THREE from "three";
import { EdgesGeometry, LineBasicMaterial, LineSegments } from "three";

const Box = memo(function Box({ position, color, rotation, onClick, isSelected, scale, userData }) {
  const hoverScale = useMemo(() => scale.map(s => s * 1.2), [scale]);
  const boxGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const edgesGeometry = useMemo(() => new EdgesGeometry(boxGeometry), [boxGeometry]);

  return (
    <group userData={userData}>
      <mesh
        position={position}
        rotation={rotation}
        onClick={onClick}
        scale={isSelected ? hoverScale : scale}
      >
        <primitive object={boxGeometry} />
        <meshStandardMaterial color={color} />
      </mesh>
      {isSelected && (
        <lineSegments position={position} rotation={rotation} scale={hoverScale}>
          <primitive object={edgesGeometry} />
          <lineBasicMaterial color="white" linewidth={5} />
        </lineSegments>
      )}
    </group>
  );
});

export default Box;
