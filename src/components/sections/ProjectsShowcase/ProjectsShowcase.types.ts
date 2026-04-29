export interface Project {
  id: string;
  title: string;
  description: string;
  previewSrc: string;
  side: 'left' | 'right';
}

export interface ProjectSlideState {
  reveal: number;
  blur: number;
  active: boolean;
}

export interface LaptopTransform {
  xOffset: number;
  yRotation: number;
}

export interface ScreenTransition {
  fromIndex: number;
  toIndex: number;
  blend: number;
}
