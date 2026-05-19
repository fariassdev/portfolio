export interface TechStackItem {
  name: string;
  iconClass?: string;
}

export interface ExperienceCommit {
  hash: string;
  date: string;
  author: string;
  tag?: string;
  type: 'feat' | 'refactor' | 'build' | 'docs' | 'chore';
  message: string;
  role: string;
  company: string;
  location: string;
  technologies?: TechStackItem[];
  bulletPoints: string[];
}
