'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
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
  const [modelPath, setModelPath] = useState(piecePaths[0]); // start with Rook or any

  // Every 5 seconds, pick a random piece from piecePaths
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * piecePaths.length);
      setModelPath(piecePaths[randomIndex]);
    }, 5000);

    // Clean up the interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas>
        <OrbitControls enableZoom={false} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <RotatingPiece modelPath={modelPath} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/**
 * A rotating chess piece model loaded from the given path.
 */
function RotatingPiece({ modelPath }: { modelPath: string }) {
  const pieceRef = useRef<THREE.Group>(null);

  // Load the model from /public
  const { scene } = useGLTF(modelPath);

  // Once the model is loaded, fix its initial orientation so it stands upright
  useEffect(() => {
    if (scene) {
      scene.rotation.set(-Math.PI / 2, Math.PI, 0); 
    }
  }, [scene]);

  // Continuously rotate around the x axis
  useFrame((_, delta) => {
    if (pieceRef.current) {
      pieceRef.current.rotation.x += 0.5 * delta;
    }
  });

  return (
    <primitive
      ref={pieceRef}
      object={scene}
      scale={0.05}
      position={[0, -0.5, 0]}
    />
  );
}

