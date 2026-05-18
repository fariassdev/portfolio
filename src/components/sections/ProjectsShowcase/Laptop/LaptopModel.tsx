'use client';

import { useGLTF, Html } from '@react-three/drei';
import { useFrame, useThree, type ObjectMap } from '@react-three/fiber';
import { useReducedMotion, type MotionValue } from 'framer-motion';
import { memo, useEffect, useMemo, useRef } from 'react';
import type { Group, Mesh, MeshStandardMaterial } from 'three';
import type { GLTF } from 'three-stdlib';
import { MOBILE_BREAKPOINT } from '../ProjectsShowcase.constants';
import {
  BASE_LAPTOP_ROTATION_X,
  CAMERA_Z,
  DESKTOP_SLIDE_FACTOR,
  LAPTOP_SCALE,
  LID_CLOSED,
} from './Laptop.constants';
import {
  getLaptopTransform,
  getScreenTransition,
  getPhaseLength,
} from './Laptop.helpers';
import type { LaptopScreenHandle } from './Laptop.types';
import { LaptopScreen } from './LaptopScreen';
import { useLaptopAnimation } from './use-laptop-animation';

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
  previewSources: string[];
}

/**
 * LaptopModel Component
 *
 * Manages the 3D representation of the laptop, including hinge animations
 * and synchronization with scroll-based transformations.
 *
 * Animation strategy (simplified):
 * - Lid and opacity: Declarative (useTransform), read in useFrame
 * - Position and rotation: Imperative (useFrame with calculations)
 * - Transitions: Event-driven (useMotionValueEvent)
 * - No mouse parallax (accessibility + performance)
 */
export const LaptopModel = memo(
  ({ scrollProgress, previewSources }: LaptopModelProps) => {
    const { nodes, materials } = useGLTF('/models/laptop.glb') as GLTFResult;
    const { viewport, size } = useThree();
    const reduceMotion = useReducedMotion();

    // Layout calculations
    const isMobile = size.width < MOBILE_BREAKPOINT;
    const isTablet = size.width >= MOBILE_BREAKPOINT && size.width < 1040;

    const laptopScale = useMemo(() => {
      if (isMobile) return LAPTOP_SCALE * 0.7;
      if (isTablet) return LAPTOP_SCALE * 0.8;
      return LAPTOP_SCALE;
    }, [isMobile, isTablet]);

    const laptopPosition = useMemo<[number, number, number]>(() => {
      if (isMobile) return [0, viewport.height * 0.06, 0];
      return [0, -80, 0];
    }, [isMobile, viewport.height]);

    // Media paths with fallback
    const fallbackMediaPath = '/images/senda/course-details.png';
    const mediaPaths = useMemo<readonly string[]>(
      () => (previewSources.length > 0 ? previewSources : [fallbackMediaPath]),
      [previewSources],
    );

    const projectCount = mediaPaths.length;
    const groupRef = useRef<Group>(null);
    const lidRef = useRef<Group>(null);
    const screenRef = useRef<LaptopScreenHandle>(null);

    // Animation state
    const laptopAnimation = useLaptopAnimation(
      scrollProgress,
      projectCount,
      mediaPaths.length,
      (fromIndex, toIndex) => {
        // Callback when project index changes
        screenRef.current?.transitionTo(fromIndex, toIndex);
      },
    );

    // Initialize lid to closed state
    useEffect(() => {
      if (lidRef.current) {
        lidRef.current.rotation.x = LID_CLOSED;
      }
    }, []);

    // Continuous animation loop: read motion values and update 3D transforms
    useFrame(() => {
      const currentProgress = reduceMotion ? 0 : scrollProgress.get();
      const lid = lidRef.current;
      const group = groupRef.current;

      if (!group) return;

      // Update lid hinge rotation
      if (lid) {
        lid.rotation.x = laptopAnimation.lidRotation.get();
      }

      // Calculate laptop position and rotation based on scroll progress
      const maxSlideDistance = isMobile
        ? 0
        : viewport.width * DESKTOP_SLIDE_FACTOR;
      const transform = isMobile
        ? { xOffset: 0, yOffset: 0, yRotation: 0 }
        : getLaptopTransform(currentProgress, projectCount, maxSlideDistance);

      // Entrance zoom effect: the laptop starts small and grows as we enter the section
      const phaseLength = getPhaseLength(projectCount);
      const entranceScale = Math.min(
        1,
        Math.max(0.2, currentProgress / phaseLength),
      );

      // Apply position and rotation transforms
      group.position.x = transform.xOffset;
      group.position.y = laptopPosition[1] + transform.yOffset;
      group.rotation.x = BASE_LAPTOP_ROTATION_X;
      group.rotation.y = transform.yRotation;
      group.scale.setScalar(laptopScale * entranceScale);

      // Perspective tilt compensation based on horizontal offset
      group.rotation.z = Math.atan(transform.xOffset / (CAMERA_Z * 6));

      // Update texture blend state for LaptopScreen component
      const screenTransition = getScreenTransition(
        currentProgress,
        projectCount,
        mediaPaths.length,
      );
      laptopAnimation.blendMotion.set(screenTransition.blend);
    });

    return (
      <group
        ref={groupRef}
        scale={laptopScale}
        position={laptopPosition}
        rotation={[BASE_LAPTOP_ROTATION_X, 0, 0]}
      >
        <group dispose={null}>
          {/* Laptop Lid (rotates on hinge) */}
          <group
            ref={lidRef}
            position={[0.002, -0.038, 0.414]}
            rotation={[0.014, 0, 0]}
          >
            {/* Lid display group */}
            <group position={[0, 2.965, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
              {/* Lid shell */}
              <mesh
                geometry={nodes.Cube008.geometry}
                material={materials.aluminium}
              />
              {/* Lid matte finish */}
              <mesh
                geometry={nodes.Cube008_1.geometry}
                material={materials['matte.001']}
              />

              {/* Screen occlusion placeholder (invisible geometry for hit detection) */}
              <mesh geometry={nodes.Cube008_2.geometry} visible={false} />

              {/* Interactive HTML screen content rendered onto 3D surface */}
              <Html
                distanceFactor={2.6}
                position={[0, 0.1, -0.09]}
                rotation={[-Math.PI / 2, 0, 0]}
                occlude={false}
                transform
                zIndexRange={[0, 0]}
                prepend
                style={{ pointerEvents: 'none' }}
              >
                <LaptopScreen
                  ref={screenRef}
                  mediaPaths={mediaPaths}
                  opacityMotion={laptopAnimation.screenOpacity}
                />
              </Html>
            </group>
          </group>

          {/* Laptop Base (keyboard) */}
          <mesh geometry={nodes.keyboard.geometry} position={[1.793, 0, 3.451]}>
            <meshPhongMaterial
              color={0x1a1a1a}
              emissive={0x000000}
              specular={0x111111}
              shininess={100}
            />
          </mesh>

          {/* Laptop Base Frame */}
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

          {/* Touch Bar */}
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
