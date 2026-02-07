export interface RoastMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  image?: string; // Base64 string
  timestamp: number;
}

export type RoastTone = 'playful' | 'witty' | 'savage' | 'emotional_damage';

export interface RoastConfig {
  tone: RoastTone;
}

export type LoadingState = 'idle' | 'analyzing' | 'roasting' | 'error';
