export interface Video {
  id: string;
  name: string;
  description: string;
  url: string;
  duration?: number;
  downloadUrl?: string;
  downloadFileName?: string;
}

export interface Resource {
  name: string;
  url: string;
  type: string;
}

export interface ProgramPage {
  id: string;
  pageNumber: number;
  instructions: string;
  videos: Video[];
  resources: Resource[];
}

export interface MeditationProgram {
  id: string;
  name: string;
  description: string;
  instructions: string;
  pages: ProgramPage[];
  resources: Resource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  userId: string;
  programId: string;
  currentPage: number;
  completedVideos: string[];
  lastAccessed: Date;
}