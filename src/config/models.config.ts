import { Model3DConfig, ModelSource } from "@/src/types/model.types";

/**
 * ============================================================
 * HARDCODED MODEL CONFIGURATIONS
 * ============================================================
 * TODO: When backend is ready, these will be fetched from API
 * For now, using Cloudinary URLs directly
 */

export const HARDCODED_MODELS: Record<string, Model3DConfig> = {
  "keyboard-gaming-pro": {
    id: "keyboard-gaming-pro",
    name: "Gaming Keyboard Pro",
    modelUrl:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1766855149/gaming_keyboard_ocx8rv.glb",
    thumbnailUrl: undefined, // TODO: Add thumbnail when available
    position: [0, -2, 0],
    scale: 1,
    rotation: undefined,
  },

  "keyboard-gaming-vip": {
    id: "keyboard-gaming-vip",
    name: "Gaming Keyboard VIP",
    modelUrl:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1767629017/keyboard_mqbcqi.glb",
    thumbnailUrl: undefined, // TODO: Add thumbnail when available
    position: [0, -2, 0],
    scale: 50,
    rotation: undefined,
  },
};

/**
 * ============================================================
 * DEFAULT FALLBACK MODEL
 * ============================================================
 * Used when model is not found or fails to load
 */

export const DEFAULT_MODEL_CONFIG: Model3DConfig = {
  id: "keyboard-default",
  name: "Gaming Keyboard",
  modelUrl:
    "https://res.cloudinary.com/doezwafgz/image/upload/v1766855149/gaming_keyboard_ocx8rv.glb",
  position: [0, -2, 0],
  scale: 1,
};

/**
 * ============================================================
 * API CONFIGURATION
 * ============================================================
 * TODO: Update these when backend is ready
 */

export const API_CONFIG = {
  // TODO: Update to your actual API base URL
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",

  // TODO: Update endpoint format
  ENDPOINTS: {
    GET_3D_MODEL: (productId: string) => `/products/${productId}/3d-model`,
  },

  // Request timeout in milliseconds
  TIMEOUT: 10000,
};

/**
 * ============================================================
 * FEATURE FLAGS
 * ============================================================
 * Control which data source to use
 */

export const FEATURE_FLAGS = {
  // TODO: Set to true when backend is ready
  USE_API: false,

  // Cache duration in milliseconds (5 minutes)
  CACHE_TTL: 5 * 60 * 1000,

  // Enable preloading of models
  ENABLE_PRELOAD: true,

  // Enable console logging for debugging
  DEBUG_MODE: process.env.NODE_ENV === "development",
};

/**
 * ============================================================
 * 3D VIEWER DEFAULT SETTINGS
 * ============================================================
 */

export const VIEWER_DEFAULTS = {
  CAMERA: {
    position: [0, 15, 30] as [number, number, number],
    fov: 40,
  },
  ORBIT: {
    autoRotateSpeed: 0.8,
    minDistance: 10,
    maxDistance: 60,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
  },
  SHADOW: {
    position: [0, -2.05, 0] as [number, number, number],
    opacity: 0.4,
    scale: 40,
    blur: 2.5,
    far: 4,
    resolution: 256,
    color: "#000000",
  },
};

/**
 * ============================================================
 * HELPER FUNCTIONS
 * ============================================================
 */

/**
 * Get model configuration by ID
 * @param modelId - The model identifier
 * @returns Model configuration or default
 */
export const getModelById = (modelId: string): Model3DConfig => {
  if (FEATURE_FLAGS.DEBUG_MODE) {
    console.log("[Config] Getting model:", modelId);
  }

  return HARDCODED_MODELS[modelId] || DEFAULT_MODEL_CONFIG;
};

/**
 * Get all available model IDs
 * @returns Array of model IDs
 */
export const getAvailableModelIds = (): string[] => {
  return Object.keys(HARDCODED_MODELS);
};
