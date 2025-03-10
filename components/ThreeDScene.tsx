'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function ThreeDScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas>
        <OrbitControls enableZoom={false} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <RotatingRook />
        </Suspense>
      </Canvas>
    </div>
  );
}

/**
 * A rotating chess rook model loaded from /public
 */
function RotatingRook() {
  const rookRef = useRef<THREE.Group>(null);

  // Load the model from public
  const { scene } = useGLTF('/chess-rook.glb');

  // Rotate the rook continuously
  useFrame((_, delta) => {
    if (rookRef.current) {
      rookRef.current.rotation.y += 0.5 * delta;
    }
  });

  return (
    <primitive
      ref={rookRef}
      object={scene}
      scale={15}
      position={[0, -1, 0]} // move it down a bit so it's centered
    />
  );
}
