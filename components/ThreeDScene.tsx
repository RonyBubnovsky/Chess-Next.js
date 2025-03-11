'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// List of all .glb paths
const piecePaths = [
  '/ClassicalRook.glb',
  '/ClassicalBishop.glb',
  '/ClassicalQueen.glb',
  '/ClassicalKnight.glb',
  '/ClassicalKing.glb',
  '/ClassicalPawn.glb'
];

export default function ThreeDScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas>
        <OrbitControls enableZoom={false} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <FloatingPieces />
        </Suspense>
      </Canvas>
    </div>
  );
}

/**
 * Component that creates multiple floating and rotating chess pieces
 */
function FloatingPieces() {
  return (
    <group>
      {piecePaths.map((path, index) => {
        // Calculate position in a circular formation
        const angle = (index / piecePaths.length) * Math.PI * 2;
        const radius = 1.5; // Adjust radius to fit inside the ring
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        // Create a different phase for each piece to make movement look natural
        const phase = Math.random() * Math.PI * 2;
        
        return (
          <FloatingPiece 
            key={path}
            modelPath={path}
            position={[x, 0, z]}
            phase={phase}
            rotationSpeed={0.4 + Math.random() * 0.3} // Slightly different speeds
          />
        );
      })}
    </group>
  );
}

/**
 * A floating and rotating chess piece model loaded from the given path.
 */
function FloatingPiece({ 
  modelPath, 
  position, 
  phase, 
  rotationSpeed 
}: { 
  modelPath: string, 
  position: [number, number, number], 
  phase: number,
  rotationSpeed: number
}) {
  const pieceRef = useRef<THREE.Group>(null);
  
  // Load the model from /public
  const { scene } = useGLTF(modelPath);
  
  // Clone the scene to avoid sharing the same instance
  const clonedScene = React.useMemo(() => {
    return scene.clone();
  }, [scene]);
  
  // Set the initial orientation
  React.useEffect(() => {
    if (clonedScene) {
      clonedScene.rotation.set(-Math.PI / 2, Math.PI, 0);
    }
  }, [clonedScene]);
  
  // Animate the piece to float up and down and rotate
  useFrame((_, delta) => {
    if (pieceRef.current) {
      // Rotate around its own axis
      pieceRef.current.rotation.y += rotationSpeed * delta;
      
      // Float up and down with sine wave
      const time = performance.now() * 0.001;
      pieceRef.current.position.y = Math.sin(time + phase) * 0.3; // 0.3 is the float height
    }
  });
  
  return (
    <primitive
      ref={pieceRef}
      object={clonedScene}
      scale={0.05} // Made smaller to fit multiple pieces
      position={position}
    />
  );
}