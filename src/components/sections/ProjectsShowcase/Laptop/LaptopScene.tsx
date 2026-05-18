'use client';

import { Canvas } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import { Suspense, memo } from 'react';
import { CAMERA_Z } from './Laptop.constants';
import { LaptopModel } from './LaptopModel';

export interface LaptopSceneProps {
  scrollProgress: MotionValue<number>;
  previewSources: string[];
}

/**
 * LaptopScene Component
 *
 * High-level orchestrator for the 3D laptop showcase.
 * Responsible for setting up the R3F Canvas and global lighting.
 */
export const LaptopScene = memo(
  ({ scrollProgress, previewSources }: LaptopSceneProps) => {
    return (
      <Canvas
        camera={{ position: [0, 0, CAMERA_Z], fov: 45, near: 1, far: 5000 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        flat
        frameloop="demand"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background: 'transparent',
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <ambientLight intensity={0.4} color="#ffffff" />
        <pointLight intensity={3.5} position={[0, 700, 750]} decay={0} />
        <pointLight intensity={0.05} position={[-300, 100, 100]} decay={0} />

        <Suspense fallback={null}>
          <LaptopModel
            scrollProgress={scrollProgress}
            previewSources={previewSources}
          />
        </Suspense>
      </Canvas>
    );
  },
);

LaptopScene.displayName = 'LaptopScene';
