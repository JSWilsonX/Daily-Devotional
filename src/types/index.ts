export interface Devotional {
  id: string;
  title: string;
  link: string;
  cover: string;
  description: string;
}

export interface PronunciationOverride {
  text: string;
  occurrence: number;
  token: string;
}

export interface DevotionalBlock {
  id: string;
  type: "scripture" | "body";
  text: string;
  pronunciationOverrides?: PronunciationOverride[];
}

export interface DevotionalContent {
  title: string;
  paragraphs: DevotionalBlock[];
  warning?: string;
  isFallback?: boolean;
}

export interface VoiceProfile {
  rate: number;
  pitch: number;
  genderPref: "male" | "female" | "any";
}

export interface DevotionalProfile {
  id: string;
  name: string;
  description: string;
  badge: string;
  icon: any;
}

export interface CacheProgressState {
  active: boolean;
  title: string;
  current: number;
  total: number;
  isComplete?: boolean;
  error?: string;
}
