'use client';

import { useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { type MotionValue, useMotionValueEvent } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Constants — match the reference portfolio exactly                  */
/* ------------------------------------------------------------------ */

const LID_CLOSED = Math.PI / 2;
const LID_OPEN = 0;
const LAPTOP_SCALE = 50;
const CAMERA_Z = 750;
const PROGRESS_EPSILON = 0.001;
const MOUSE_EPSILON = 0.003;

// Reusable vectors to avoid per-frame allocations
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scl = new THREE.Vector3();
const _rotAxis = new THREE.Vector3(1, 0, 0);

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

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
  const gltf = useGLTF('/models/laptop.glb');
  const { viewport, invalidate } = useThree();

  // Refs for animated sub-objects
  const groupRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Object3D | null>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const screenPlaneRef = useRef<THREE.Mesh>(null);
  const screenTextureIndexRef = useRef(-1);

  const latestProgressRef = useRef(scrollProgress.get());
  const latestMouseXRef = useRef(mouseX.get());
  const latestMouseYRef = useRef(mouseY.get());

  // Load textures
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return images.map((src) => {
      const tex = loader.load(src);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    });
  }, [images]);

  // Clone scene + apply materials
  const clonedScene = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const lid = scene.children[0] ?? null;
    const screenMeshNode = lid?.children[0]?.children[2] ?? null;
    const screenMesh =
      screenMeshNode && (screenMeshNode as THREE.Mesh).isMesh
        ? (screenMeshNode as THREE.Mesh)
        : null;

    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      if (mesh.name === 'Cube008_2') {
        (mesh.material as THREE.MeshStandardMaterial).side = THREE.FrontSide;
      }
      if (mesh.name === 'keyboard') {
        mesh.material = new THREE.MeshPhongMaterial({
          color: 0x1a1a1a,
          emissive: 0x000000,
          specular: 0x111111,
          shininess: 100,
        });
      }
    });

    if (screenMesh) {
      // Replace screen material with dark base (image overlay goes on separate plane)
      screenMesh.material = new THREE.MeshBasicMaterial({ color: 0x080808 });
    }

    return {
      scene,
      lid,
      screenMesh,
    };
  }, [gltf.scene]);

  // Extract sub-mesh refs (lid, screen)
  useEffect(() => {
    lidRef.current = clonedScene.lid;
    screenMeshRef.current = clonedScene.screenMesh;
    if (lidRef.current) {
      lidRef.current.rotation.x = LID_CLOSED;
    }

    invalidate();
  }, [clonedScene.lid, clonedScene.screenMesh, invalidate]);

  const setScreenTextureIndex = useCallback(
    (nextIndex: number) => {
      if (screenTextureIndexRef.current === nextIndex) {
        return;
      }

      const screenPlane = screenPlaneRef.current;
      if (!screenPlane) {
        return;
      }

      const material = screenPlane.material;
      if (!(material instanceof THREE.MeshBasicMaterial)) {
        return;
      }

      const nextTexture = textures[nextIndex] ?? null;
      material.map = nextTexture;
      material.needsUpdate = true;
      screenTextureIndexRef.current = nextIndex;
    },
    [textures],
  );

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  useMotionValueEvent(scrollProgress, 'change', (nextProgress) => {
    if (reducedMotion) {
      return;
    }

    if (Math.abs(nextProgress - latestProgressRef.current) < PROGRESS_EPSILON) {
      return;
    }

    latestProgressRef.current = nextProgress;
    invalidate();
  });

  useMotionValueEvent(mouseX, 'change', (nextMouseX) => {
    if (reducedMotion) {
      return;
    }

    if (Math.abs(nextMouseX - latestMouseXRef.current) < MOUSE_EPSILON) {
      return;
    }

    latestMouseXRef.current = nextMouseX;
    invalidate();
  });

  useMotionValueEvent(mouseY, 'change', (nextMouseY) => {
    if (reducedMotion) {
      return;
    }

    if (Math.abs(nextMouseY - latestMouseYRef.current) < MOUSE_EPSILON) {
      return;
    }

    latestMouseYRef.current = nextMouseY;
    invalidate();
  });

  useFrame(() => {
    const progress = reducedMotion ? 0 : scrollProgress.get();
    const lid = lidRef.current;
    const group = groupRef.current;
    if (!group) return;

    /* --- Lid opens during Phase 0 (0 → 0.2) --- */
    const lidT = easeInOut(clamp(progress / 0.2, 0, 1));
    if (lid) lid.rotation.x = lerp(LID_CLOSED, LID_OPEN, lidT);

    /* --- Lateral movement + Y rotation --- */
    // Use viewport width in scene units; at scale=50 the laptop is ~300 units wide
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

    /* --- Screen image plane: sync position to laptop screen mesh --- */
    const screenPlane = screenPlaneRef.current;
    const screenMesh = screenMeshRef.current;
    if (screenPlane && screenMesh) {
      const material = screenPlane.material;
      if (!(material instanceof THREE.MeshBasicMaterial)) {
        return;
      }

      screenMesh.updateWorldMatrix(true, false);
      screenMesh.matrixWorld.decompose(_pos, _quat, _scl);

      screenPlane.position.copy(_pos);
      screenPlane.quaternion.copy(_quat);
      // The screen face's normal points along the model's -Z in local space.
      // After lid rotation, we need to orient the plane to face the camera.
      screenPlane.rotateOnAxis(_rotAxis, -Math.PI / 2);

      // Opacity and texture crossfade
      if (progress < 0.4) {
        setScreenTextureIndex(0);
        material.opacity = lidT;
      } else if (progress < 0.6) {
        const t = clamp((progress - 0.4) / 0.2, 0, 1);
        if (t < 0.5) {
          setScreenTextureIndex(0);
          material.opacity = 1 - t * 2;
        } else {
          setScreenTextureIndex(1);
          material.opacity = (t - 0.5) * 2;
        }
      } else {
        setScreenTextureIndex(1);
        material.opacity = 1;
      }
    }
  }, 1);

  useEffect(() => {
    return () => {
      textures.forEach((texture) => texture.dispose());
    };
  }, [textures]);

  return (
    <>
      {/* Laptop body */}
      <group
        ref={groupRef}
        scale={LAPTOP_SCALE}
        position={[0, -1.8, 0]}
        rotation={[Math.PI / 20, 0, 0]}
      >
        <primitive object={clonedScene.scene} />
      </group>

      {/* Screen image plane (synced to screen mesh world position) */}
      <mesh ref={screenPlaneRef} renderOrder={1}>
        <planeGeometry args={[8.3, 5.6]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
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
      <pointLight intensity={500} position={[0, 700, 750]} decay={0} />
      {/* Subtle fill */}
      <pointLight intensity={5} position={[-300, 100, 100]} decay={0} />
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
      dpr={
        typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1
      }
      frameloop="demand"
    >
      <LaptopSceneInner
        scrollProgress={scrollProgress}
        mouseX={mouseX}
        mouseY={mouseY}
        images={images}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}

useGLTF.preload('/models/laptop.glb');
