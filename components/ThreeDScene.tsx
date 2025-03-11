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
          <SpinningPieces />
        </Suspense>
      </Canvas>
    </div>
  );
}

/**
 * Component that creates multiple spinning chess pieces
 */
function SpinningPieces() {
  return (
    <group position={[0, -0.5, 0]}>
      {piecePaths.map((path, index) => {
        // Calculate position in a circular formation
        const angle = (index / piecePaths.length) * Math.PI * 2;
        const radius = 1.5; // Adjust radius to fit inside the ring
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        // Different spin speeds for each piece
        const spinSpeed = 0.8 + Math.random() * 0.3;
        
        // Different floating speeds and heights
        const floatSpeed = 0.3 + Math.random() * 0.2;
        const floatHeight = 0.2 + Math.random() * 0.1;
        
        return (
          <SpinningPiece 
            key={path}
            modelPath={path}
            position={[x, 0, z]}
            spinSpeed={spinSpeed}
            floatSpeed={floatSpeed}
            floatHeight={floatHeight}
          />
        );
      })}
    </group>
  );
}

/**
 * A spinning chess piece model that spins like a ballet dancer.
 */
function SpinningPiece({ 
  modelPath, 
  position, 
  spinSpeed,
  floatSpeed,
  floatHeight
}: { 
  modelPath: string, 
  position: [number, number, number],
  spinSpeed: number,
  floatSpeed: number,
  floatHeight: number
}) {
  // Create a container for positioning and floating
  const containerRef = useRef<THREE.Group>(null);
  
  // Load the model from /public
  const { scene } = useGLTF(modelPath);
  
  // Clone the scene to avoid sharing the same instance
  const clonedScene = React.useMemo(() => {
    return scene.clone();
  }, [scene]);
  
  // Set the initial orientation to make pieces right-side up
  React.useEffect(() => {
    if (clonedScene) {
      clonedScene.rotation.set(Math.PI / 2, 0, 0);
      
      // Optional: adjust the vertical position of the model within its container
      clonedScene.position.y = -0.2;
    }
  }, [clonedScene]);
  
  // Animate the piece to float up and down and spin around its vertical axis
  useFrame((_, delta) => {
    if (containerRef.current) {
      // Spin around the vertical axis (like a ballet dancer)
      containerRef.current.rotation.y += spinSpeed * delta;
      
      // Calculate vertical position using sine for smooth floating
      // Reduced floating height by using a smaller multiplier
      const time = performance.now() * 0.001;
      containerRef.current.position.y = Math.sin(time * floatSpeed) * (floatHeight * 0.7);
    }
  });
  
  return (
    <group 
      ref={containerRef} 
      position={position}
    >
      <primitive
        object={clonedScene}
        scale={0.05} // Made smaller to fit multiple pieces
      />
    </group>
  );
}