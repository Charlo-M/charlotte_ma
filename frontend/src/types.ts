export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  description: string[];
  type: 'work' | 'education';
  skills?: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
  stats?: {
    stars?: number;
    forks?: number;
  };
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface MatchAnalysis {
  matchScore: number;
  strengths: string[];
  gapAnalysis: string;
  verdict: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  analysis?: MatchAnalysis; // Optional field to store analysis data
}
