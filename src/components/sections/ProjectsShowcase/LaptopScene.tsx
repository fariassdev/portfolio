'use client';

import { useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Constants — match the reference portfolio exactly                  */
/* ------------------------------------------------------------------ */

const LID_CLOSED = Math.PI / 2;
const LID_OPEN = 0;
const LAPTOP_SCALE = 50;
const CAMERA_Z = 750;
const VIDEO_FILE_PATTERN = /\.(mp4|webm|mov|m4v)$/i;

interface ScreenMediaResource {
  texture: THREE.Texture;
  dispose: () => void;
}

function isVideoSource(source: string) {
  return VIDEO_FILE_PATTERN.test(source);
}

function createVideoElement(src: string) {
  const video = document.createElement('video');
  video.src = src;
  video.loop = true;
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.crossOrigin = 'anonymous';
  video.setAttribute('playsinline', 'true');
  video.setAttribute('webkit-playsinline', 'true');
  return video;
}

async function loadScreenMediaResource(source: string) {
  if (isVideoSource(source)) {
    const video = createVideoElement(source);
    const tryPlay = () => {
      void video.play().catch(() => undefined);
    };

    video.addEventListener('canplay', tryPlay);
    tryPlay();

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const resource: ScreenMediaResource = {
      texture,
      dispose: () => {
        video.pause();
        video.removeEventListener('canplay', tryPlay);
        video.removeAttribute('src');
        video.load();
        texture.dispose();
      },
    };

    return resource;
  }

  const loader = new THREE.TextureLoader();
  const texture = await new Promise<THREE.Texture>((resolve, reject) => {
    loader.load(source, resolve, undefined, reject);
  });

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.needsUpdate = true;

  const resource: ScreenMediaResource = {
    texture,
    dispose: () => {
      texture.dispose();
    },
  };

  return resource;
}

function useScreenMediaTextures(sources: readonly [string, string]) {
  const [textures, setTextures] = useState<
    [THREE.Texture | null, THREE.Texture | null]
  >([null, null]);

  useEffect(() => {
    let cancelled = false;
    let activeDisposers: Array<() => void> = [];

    const load = async () => {
      try {
        const resources = await Promise.all([
          loadScreenMediaResource(sources[0]),
          loadScreenMediaResource(sources[1]),
        ]);

        if (cancelled) {
          resources.forEach((resource) => resource.dispose());
          return;
        }

        activeDisposers = resources.map((resource) => resource.dispose);
        setTextures([resources[0].texture, resources[1].texture]);
      } catch {
        if (!cancelled) {
          setTextures([null, null]);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      activeDisposers.forEach((dispose) => dispose());
    };
  }, [sources]);

  return textures;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

import type { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
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
  images: string[];
  reducedMotion: boolean;
}

function LaptopModel({
  scrollProgress,
  mouseX,
  mouseY,
  images,
  reducedMotion,
}: LaptopModelProps) {
  const { nodes, materials } = useGLTF(
    '/models/laptop.glb',
  ) as unknown as GLTFResult;
  const { viewport } = useThree();

  const fallbackImage = '/images/senda/course-details.png';
  const textureSources = useMemo<readonly [string, string]>(
    () => [images[0] ?? fallbackImage, images[1] ?? images[0] ?? fallbackImage],
    [images],
  );
  const [screenTexture1, screenTexture2] =
    useScreenMediaTextures(textureSources);

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

    /* --- Lid opens during Phase 0 (0 → 0.2) --- */
    const lidT = easeInOut(clamp(progress / 0.2, 0, 1));
    if (lid) lid.rotation.x = lerp(LID_CLOSED, LID_OPEN, lidT);

    /* --- Lateral movement + Y rotation --- */
    const maxSlide = viewport.width * 0.25;
    let xOffset = 0;
    let yRot = 0;

    if (progress >= 0.2 && progress < 0.4) {
      const t = easeInOut(clamp((progress - 0.2) / 0.2, 0, 1));
      xOffset = -maxSlide * t;
      yRot = (Math.PI / 12) * t;
    } else if (progress >= 0.4 && progress < 0.6) {
      const t = easeInOut(clamp((progress - 0.4) / 0.2, 0, 1));
      xOffset = lerp(-maxSlide, maxSlide, t);
      yRot = lerp(Math.PI / 12, -Math.PI / 12, t);
    } else if (progress >= 0.6 && progress < 0.8) {
      xOffset = maxSlide;
      yRot = -Math.PI / 12;
    } else if (progress >= 0.8) {
      const t = easeInOut(clamp((progress - 0.8) / 0.2, 0, 1));
      xOffset = lerp(maxSlide, 0, t);
      yRot = lerp(-Math.PI / 12, 0, t);
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
    if (screenMaterial) {
      const primaryTexture = screenTexture1;
      const secondaryTexture = screenTexture2;
      if (!primaryTexture || !secondaryTexture) {
        return;
      }

      let nextTexture = primaryTexture;
      let nextOpacity = 0;

      if (progress < 0.4) {
        nextTexture = primaryTexture;
        nextOpacity = lidT;
      } else if (progress < 0.6) {
        const t = clamp((progress - 0.4) / 0.2, 0, 1);
        if (t < 0.5) {
          nextTexture = primaryTexture;
          nextOpacity = 1 - t * 2;
        } else {
          nextTexture = secondaryTexture;
          nextOpacity = (t - 0.5) * 2;
        }
      } else {
        nextTexture = secondaryTexture;
        nextOpacity = 1;
      }

      if (screenMaterial.map !== nextTexture) {
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
        scale={LAPTOP_SCALE}
        position={[0, -100, 0]}
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
  images: string[];
  reducedMotion: boolean;
}

function LaptopSceneInner({
  scrollProgress,
  mouseX,
  mouseY,
  images,
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
        images={images}
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
  images: string[];
  reducedMotion?: boolean;
}

export function LaptopScene({
  scrollProgress,
  mouseX,
  mouseY,
  images,
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
          images={images}
          reducedMotion={reducedMotion}
        />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload('/models/laptop.glb');
