'use client';

import { useGLTF, Html } from '@react-three/drei';
import { useFrame, useThree, type ObjectMap } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { type Group, type Mesh, type MeshStandardMaterial } from 'three';
import type { GLTF } from 'three-stdlib';
import { LaptopScreen } from './LaptopScreen';
import {
  BASE_LAPTOP_ROTATION_X,
  CAMERA_Z,
  DESKTOP_SLIDE_FACTOR,
  LAPTOP_SCALE,
  LID_CLOSED,
  MOBILE_BREAKPOINT,
  PARALLAX_X_FACTOR,
  PARALLAX_Y_FACTOR,
} from './ProjectsShowcase.constants';
import {
  getLidRotation,
  getLaptopTransform,
  getScreenTransition,
} from './ProjectsShowcase.helpers';

type GLTFResult = GLTF &
  ObjectMap & {
    nodes: {
      Cube008: Mesh;
      Cube008_1: Mesh;
      Cube008_2: Mesh;
      keyboard: Mesh;
      Cube002: Mesh;
      Cube002_1: Mesh;
      touchbar: Mesh;
    };
    materials: {
      aluminium: MeshStandardMaterial;
      'matte.001': MeshStandardMaterial;
      'screen.001': MeshStandardMaterial;
      keys: MeshStandardMaterial;
      trackpad: MeshStandardMaterial;
      touchbar: MeshStandardMaterial;
    };
  };

interface LaptopModelProps {
  scrollProgress: MotionValue<number>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  previewSources: string[];
  reducedMotion: boolean;
}

/**
 * LaptopModel Component
 *
 * Manages the 3D representation of the laptop, including hinge animations
 * and synchronization with scroll/mouse parallax.
 */
export const LaptopModel = memo(
  ({
    scrollProgress,
    mouseX,
    mouseY,
    previewSources,
    reducedMotion,
  }: LaptopModelProps) => {
    const { nodes, materials } = useGLTF('/models/laptop.glb') as GLTFResult;
    const { viewport, size } = useThree();
    const isMobile = size.width < MOBILE_BREAKPOINT;
    const isTablet = size.width >= MOBILE_BREAKPOINT && size.width < 1040;

    const currentScale = useMemo(() => {
      if (isMobile) return LAPTOP_SCALE * 0.8;
      if (isTablet) return LAPTOP_SCALE * 0.8;
      return LAPTOP_SCALE;
    }, [isMobile, isTablet]);

    const currentPosition = useMemo<[number, number, number]>(() => {
      if (isMobile) return [0, viewport.height * 0.06, 0];
      return [0, -80, 0];
    }, [isMobile, viewport.height]);

    const fallbackMedia = '/images/senda/course-details.png';
    const mediaPaths = useMemo<readonly string[]>(
      () => (previewSources.length > 0 ? previewSources : [fallbackMedia]),
      [previewSources, fallbackMedia],
    );

    const projectCount = mediaPaths.length;
    const groupRef = useRef<Group>(null);
    const lidRef = useRef<Group>(null);

    const [transition, setTransition] = useState({
      fromIndex: 0,
      toIndex: 0,
      blend: 0,
      opacity: 0,
    });

    useEffect(() => {
      if (lidRef.current) {
        lidRef.current.rotation.x = LID_CLOSED;
      }
    }, []);

    useFrame(() => {
      const progress = reducedMotion ? 0 : scrollProgress.get();
      const lid = lidRef.current;
      const group = groupRef.current;
      if (!group) return;

      // Hinge animation
      if (lid) {
        lid.rotation.x = getLidRotation(progress, projectCount);
      }

      // Laptop position and parallax
      const maxSlide = isMobile ? 0 : viewport.width * DESKTOP_SLIDE_FACTOR;
      const laptopTransform = isMobile
        ? { xOffset: 0, yRotation: 0 }
        : getLaptopTransform(progress, projectCount, maxSlide);

      const mouse = reducedMotion
        ? { x: 0, y: 0 }
        : { x: mouseX.get(), y: mouseY.get() };

      group.position.x = laptopTransform.xOffset;
      group.rotation.x = BASE_LAPTOP_ROTATION_X + mouse.y * PARALLAX_Y_FACTOR;
      group.rotation.y =
        laptopTransform.yRotation + mouse.x * PARALLAX_X_FACTOR;

      // Perspective lean compensation
      group.rotation.z = Math.atan(laptopTransform.xOffset / (CAMERA_Z * 6));

      // Calculate current transition state
      const currentTransition = getScreenTransition(
        progress,
        projectCount,
        mediaPaths.length,
      );

      setTransition(currentTransition);
    });

    return (
      <group
        ref={groupRef}
        scale={currentScale}
        position={currentPosition}
        rotation={[BASE_LAPTOP_ROTATION_X, 0, 0]}
      >
        <group dispose={null}>
          {/* Lid Group */}
          <group
            ref={lidRef}
            position={[0.002, -0.038, 0.414]}
            rotation={[0.014, 0, 0]}
          >
            <group position={[0, 2.965, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh
                geometry={nodes.Cube008.geometry}
                material={materials.aluminium}
              />
              <mesh
                geometry={nodes.Cube008_1.geometry}
                material={materials['matte.001']}
              />

              {/* Virtual Screen Placeholder (Transparent for occlusion) */}
              <mesh geometry={nodes.Cube008_2.geometry} visible={false} />

              {/* Interactive HTML Screen */}
              <Html
                transform
                distanceFactor={2.56}
                position={[0, 0.06, -0.09]}
                rotation={[-Math.PI / 2, 0, 0]}
                occlude
                // Optimization: Only render when opacity is > 0
                style={{ display: transition.opacity > 0 ? 'block' : 'none' }}
              >
                <LaptopScreen mediaPaths={mediaPaths} transition={transition} />
              </Html>
            </group>
          </group>

          {/* Base / Keyboard */}
          <mesh geometry={nodes.keyboard.geometry} position={[1.793, 0, 3.451]}>
            <meshPhongMaterial
              color={0x1a1a1a}
              emissive={0x000000}
              specular={0x111111}
              shininess={100}
            />
          </mesh>
          <group position={[0, -0.1, 3.394]}>
            <mesh
              geometry={nodes.Cube002.geometry}
              material={materials.aluminium}
            />
            <mesh
              geometry={nodes.Cube002_1.geometry}
              material={materials.trackpad}
            />
          </group>
          <mesh
            geometry={nodes.touchbar.geometry}
            material={materials.touchbar}
            position={[0, -0.027, 1.201]}
          />
        </group>
      </group>
    );
  },
);

LaptopModel.displayName = 'LaptopModel';

useGLTF.preload('/models/laptop.glb');
