'use client';

import { useGLTF } from '@react-three/drei';
import { Canvas, type ObjectMap, useFrame, useThree } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import {
  DoubleSide,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
} from 'three';
import type { GLTF } from 'three-stdlib';
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
import { useScreenMediaTextures } from './use-screen-media-textures';

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

function LaptopModel({
  scrollProgress,
  mouseX,
  mouseY,
  previewSources,
  reducedMotion,
}: LaptopModelProps) {
  const { nodes, materials } = useGLTF('/models/laptop.glb') as GLTFResult;
  const { viewport, size } = useThree();
  const isMobile = size.width < MOBILE_BREAKPOINT;

  const fallbackMedia = '/images/senda/course-details.png';
  const mediaPaths = useMemo<readonly string[]>(
    () => (previewSources.length > 0 ? previewSources : [fallbackMedia]),
    [previewSources, fallbackMedia],
  );
  const projectCount = mediaPaths.length;
  const screenTextures = useScreenMediaTextures(mediaPaths);

  const groupRef = useRef<Group>(null);
  const lidRef = useRef<Group>(null);
  const screenMaterialRef = useRef<MeshBasicMaterial>(null);

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

    if (lid) {
      lid.rotation.x = getLidRotation(progress, projectCount);
    }

    const maxSlide = isMobile ? 0 : viewport.width * DESKTOP_SLIDE_FACTOR;
    const laptopTransform = isMobile
      ? { xOffset: 0, yRotation: 0 }
      : getLaptopTransform(progress, projectCount, maxSlide);

    const mouse = reducedMotion
      ? { x: 0, y: 0 }
      : {
          x: mouseX.get(),
          y: mouseY.get(),
        };
    group.position.x = laptopTransform.xOffset;
    group.rotation.x = BASE_LAPTOP_ROTATION_X + mouse.y * PARALLAX_Y_FACTOR;
    group.rotation.y = laptopTransform.yRotation + mouse.x * PARALLAX_X_FACTOR;

    const screenMaterial = screenMaterialRef.current;
    if (screenMaterial && screenTextures.length > 0) {
      const transition = getScreenTransition(
        progress,
        projectCount,
        screenTextures.length,
      );

      const nextTexture = screenTextures[transition.textureIndex] ?? null;
      const nextOpacity = transition.opacity;

      if (nextTexture && screenMaterial.map !== nextTexture) {
        screenMaterial.map = nextTexture;
        screenMaterial.needsUpdate = true;
      }

      screenMaterial.opacity = nextOpacity;
    }
  });

  return (
    <>
      <group
        ref={groupRef}
        scale={isMobile ? LAPTOP_SCALE * 0.9 : LAPTOP_SCALE}
        position={[0, isMobile ? viewport.height * 0.06 : -100, 0]}
        rotation={[BASE_LAPTOP_ROTATION_X, 0, 0]}
      >
        <group dispose={null}>
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
              <mesh geometry={nodes.Cube008_2.geometry}>
                <meshBasicMaterial
                  ref={screenMaterialRef}
                  color={0xffffff}
                  transparent
                  opacity={0}
                  toneMapped={false}
                  side={DoubleSide}
                />
              </mesh>
            </group>
          </group>
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
    </>
  );
}

interface LaptopSceneInnerProps {
  scrollProgress: MotionValue<number>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  previewSources: string[];
  reducedMotion: boolean;
}

function LaptopSceneInner({
  scrollProgress,
  mouseX,
  mouseY,
  previewSources,
  reducedMotion,
}: LaptopSceneInnerProps) {
  return (
    <>
      <pointLight intensity={3.5} position={[0, 700, 750]} decay={0} />
      <pointLight intensity={0.05} position={[-300, 100, 100]} decay={0} />
      <ambientLight intensity={0.4} color="#ffffff" />
      <LaptopModel
        scrollProgress={scrollProgress}
        mouseX={mouseX}
        mouseY={mouseY}
        previewSources={previewSources}
        reducedMotion={reducedMotion}
      />
    </>
  );
}

export interface LaptopSceneProps {
  scrollProgress: MotionValue<number>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  previewSources: string[];
  reducedMotion?: boolean;
}

export function LaptopScene({
  scrollProgress,
  mouseX,
  mouseY,
  previewSources,
  reducedMotion = false,
}: LaptopSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, CAMERA_Z], fov: 70, near: 1, far: 5000 }}
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
        preserveDrawingBuffer: false,
      }}
    >
      <Suspense fallback={null}>
        <LaptopSceneInner
          scrollProgress={scrollProgress}
          mouseX={mouseX}
          mouseY={mouseY}
          previewSources={previewSources}
          reducedMotion={reducedMotion}
        />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload('/models/laptop.glb');
