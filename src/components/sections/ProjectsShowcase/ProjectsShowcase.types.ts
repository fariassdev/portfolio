export interface Technology {
  name: string;
  iconClass: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  previewSrc: string;
  side: 'left' | 'right';
  githubUrl?: string;
  liveUrl?: string;
  technologies?: Technology[];
}
