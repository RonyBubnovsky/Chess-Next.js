'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function ThreeDScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas>
        <OrbitControls enableZoom={false} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <RotatingBox />
        </Suspense>
      </Canvas>
    </div>
  );
}

function RotatingBox() {
  // A simple rotating box for demonstration
  return (
    <mesh rotation={[0.4, 0.2, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="purple" />
    </mesh>
  );
}
