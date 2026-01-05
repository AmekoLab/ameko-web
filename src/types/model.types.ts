/**
 * 3D Model Configuration Interface
 * Used for both hardcoded and API-fetched models
 */
export interface Model3DConfig {
  id: string;
  name: string;
  modelUrl: string;
  thumbnailUrl?: string;
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

/**
 * API Response Interface
 * TODO: Update this based on your actual backend API response
 */
export interface Model3DApiResponse {
  id: string;
  name: string;
  model_url: string; // Note: snake_case from backend
  thumbnail_url?: string;
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

/**
 * Hook Return Type
 */
export interface Use3DModelReturn {
  modelConfig: Model3DConfig | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Environment Preset Options
 */
export type EnvironmentPreset =
  | "city"
  | "sunset"
  | "dawn"
  | "night"
  | "warehouse"
  | "forest"
  | "apartment"
  | "studio"
  | "park"
  | "lobby";

/**
 * Model Source Type
 */
export enum ModelSource {
  HARDCODED = "hardcoded",
  API = "api",
  CLOUDINARY = "cloudinary",
}

/**
 * Cache Entry Interface
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
