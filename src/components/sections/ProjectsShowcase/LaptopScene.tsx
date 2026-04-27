'use client';

import { useGLTF } from '@react-three/drei';
import { Canvas, type ObjectMap, useFrame, useThree } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';
import { useScreenMediaTextures } from './use-screen-media-textures';

/* ------------------------------------------------------------------ */
/*  Constants — match the reference portfolio exactly                  */
/* ------------------------------------------------------------------ */

const LID_CLOSED = Math.PI / 2;
const LID_OPEN = 0;
const LAPTOP_SCALE = 50;
const CAMERA_Z = 750;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

type GLTFResult = GLTF &
  ObjectMap & {
    nodes: {
      Cube008: THREE.Mesh;
      Cube008_1: THREE.Mesh;
      Cube008_2: THREE.Mesh;
      keyboard: THREE.Mesh;
      Cube002: THREE.Mesh;
      Cube002_1: THREE.Mesh;
      touchbar: THREE.Mesh;
    };
    materials: {
      aluminium: THREE.MeshStandardMaterial;
      'matte.001': THREE.MeshStandardMaterial;
      'screen.001': THREE.MeshStandardMaterial;
      keys: THREE.MeshStandardMaterial;
      trackpad: THREE.MeshStandardMaterial;
      touchbar: THREE.MeshStandardMaterial;
    };
  };

/* ------------------------------------------------------------------ */
/*  Inner 3D component                                                  */
/* ------------------------------------------------------------------ */

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
  const isMobile = size.width < 696;

  const fallbackMedia = '/images/senda/course-details.png';
  const mediaPaths = useMemo<readonly string[]>(
    () => (previewSources.length > 0 ? previewSources : [fallbackMedia]),
    [previewSources, fallbackMedia],
  );
  const screenTextures = useScreenMediaTextures(mediaPaths);

  // Refs for animated sub-objects
  const groupRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const screenMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Init lid rotation
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

    const numProjects = previewSources.length;
    const totalPhases = numProjects > 0 ? numProjects * 2 + 1 : 1;
    const phaseLength = 1 / totalPhases;

    /* --- Lid opens during Phase 0 (0 → phaseLength) --- */
    const lidT = easeInOut(clamp(progress / phaseLength, 0, 1));
    if (lid) lid.rotation.x = lerp(LID_CLOSED, LID_OPEN, lidT);

    /* --- Lateral movement + Y rotation --- */
    const maxSlide = isMobile ? 0 : viewport.width * 0.25;
    let xOffset = 0;
    let yRot = 0;

    if (!isMobile && numProjects > 0 && progress >= phaseLength) {
      // Find current project index based on progress
      let activeIndex = Math.floor(
        (progress - phaseLength) / (phaseLength * 2),
      );
      activeIndex = clamp(activeIndex, 0, numProjects - 1);

      const isEven = activeIndex % 2 === 0;
      const targetX = isEven ? -maxSlide : maxSlide;
      const targetRot = isEven ? Math.PI / 12 : -Math.PI / 12;
      const oppositeX = isEven ? maxSlide : -maxSlide;
      const oppositeRot = isEven ? -Math.PI / 12 : Math.PI / 12;

      const projectStartPhase = phaseLength + activeIndex * phaseLength * 2;
      const tSlideIn = clamp(
        (progress - projectStartPhase) / phaseLength,
        0,
        1,
      );

      if (activeIndex === 0 && tSlideIn < 1) {
        xOffset = lerp(0, targetX, easeInOut(tSlideIn));
        yRot = lerp(0, targetRot, easeInOut(tSlideIn));
      } else if (
        activeIndex === numProjects - 1 &&
        progress >= projectStartPhase + phaseLength
      ) {
        const tSlideOut = clamp(
          (progress - (projectStartPhase + phaseLength)) / phaseLength,
          0,
          1,
        );
        xOffset = lerp(targetX, 0, easeInOut(tSlideOut));
        yRot = lerp(targetRot, 0, easeInOut(tSlideOut));
      } else {
        if (tSlideIn < 1) {
          xOffset = lerp(oppositeX, targetX, easeInOut(tSlideIn));
          yRot = lerp(oppositeRot, targetRot, easeInOut(tSlideIn));
        } else {
          xOffset = targetX;
          yRot = targetRot;
        }
      }
    }

    /* --- Mouse parallax --- */
    const mouse = reducedMotion
      ? { x: 0, y: 0 }
      : {
          x: mouseX.get(),
          y: mouseY.get(),
        };
    group.position.x = xOffset;
    group.rotation.x = Math.PI / 20 + mouse.y * 0.025;
    group.rotation.y = yRot + mouse.x * 0.05;

    const screenMaterial = screenMaterialRef.current;
    if (screenMaterial && screenTextures.length > 0) {
      let nextTexture = screenTextures[0];
      let nextOpacity = 0;

      if (numProjects === 0 || progress < phaseLength * 2) {
        nextTexture = screenTextures[0];
        nextOpacity = lidT;
      } else {
        let activeIndex = Math.floor(
          (progress - phaseLength * 2) / (phaseLength * 2),
        );
        activeIndex = clamp(activeIndex, 0, numProjects - 2);

        const transitionStart = phaseLength * 2 + activeIndex * phaseLength * 2;
        const t = clamp((progress - transitionStart) / phaseLength, 0, 1);

        const primaryTexture = screenTextures[activeIndex];
        const secondaryTexture = screenTextures[activeIndex + 1];

        if (!primaryTexture || !secondaryTexture) return;

        if (t < 0.5) {
          nextTexture = primaryTexture;
          nextOpacity = 1 - t * 2;
        } else {
          nextTexture = secondaryTexture;
          nextOpacity = (t - 0.5) * 2;
        }
      }

      if (nextTexture && screenMaterial.map !== nextTexture) {
        screenMaterial.map = nextTexture;
        screenMaterial.needsUpdate = true;
      }

      screenMaterial.opacity = nextOpacity;
    }
  });

  return (
    <>
      {/* Laptop body */}
      <group
        ref={groupRef}
        scale={isMobile ? LAPTOP_SCALE * 0.9 : LAPTOP_SCALE}
        position={[0, isMobile ? viewport.height * 0.06 : -100, 0]}
        rotation={[Math.PI / 20, 0, 0]}
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
                  side={THREE.DoubleSide}
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

/* ------------------------------------------------------------------ */
/*  Scene setup: lights                                                */
/* ------------------------------------------------------------------ */

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
      {/* Main light from above-front, matching reference */}
      <pointLight intensity={3.5} position={[0, 700, 750]} decay={0} />
      {/* Subtle fill */}
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

/* ------------------------------------------------------------------ */
/*  Canvas export                                                      */
/* ------------------------------------------------------------------ */

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
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
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
