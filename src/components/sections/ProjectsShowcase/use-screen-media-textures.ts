import { useEffect, useState } from 'react';
import * as THREE from 'three';

const VIDEO_FILE_PATTERN = /\.(mp4|webm|mov|m4v)$/i;

export interface ScreenMediaResource {
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

export function useScreenMediaTextures(sources: readonly string[]) {
  const [textures, setTextures] = useState<(THREE.Texture | null)[]>(
    sources.map(() => null),
  );

  useEffect(() => {
    let cancelled = false;
    let activeDisposers: Array<() => void> = [];

    const load = async () => {
      try {
        const resources = await Promise.all(
          sources.map((src) => loadScreenMediaResource(src)),
        );

        if (cancelled) {
          resources.forEach((resource) => resource.dispose());
          return;
        }

        activeDisposers = resources.map((resource) => resource.dispose);
        setTextures(resources.map((r) => r.texture));
      } catch {
        if (!cancelled) {
          setTextures(sources.map(() => null));
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
