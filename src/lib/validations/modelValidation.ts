import { Model3DConfig, Model3DApiResponse } from "@/src/types/model.types";
import {
  DEFAULT_MODEL_CONFIG,
  FEATURE_FLAGS,
} from "@/src/config/models.config";

/**
 * ============================================================
 * URL VALIDATION
 * ============================================================
 */

/**
 * Validate if URL is a valid 3D model URL
 * @param url - URL to validate
 * @returns true if valid, false otherwise
 */
export const validateModelUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);

    // Check if it's a valid GLB/GLTF file
    const isValidExtension =
      urlObj.pathname.endsWith(".glb") || urlObj.pathname.endsWith(".gltf");

    // Check if it's from a trusted domain (optional security check)
    const trustedDomains = [
      "res.cloudinary.com",
      "cloudinary.com",
      // TODO: Add your API domain here when backend is ready
      // "api.yourdomain.com",
    ];

    const isTrustedDomain = trustedDomains.some((domain) =>
      urlObj.hostname.includes(domain)
    );

    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.log("[Validation] URL validation:", {
        url,
        isValidExtension,
        isTrustedDomain,
      });
    }

    return isValidExtension && isTrustedDomain;
  } catch (error) {
    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.error("[Validation] Invalid URL:", url, error);
    }
    return false;
  }
};

/**
 * ============================================================
 * MODEL CONFIG VALIDATION
 * ============================================================
 */

/**
 * Validate position array
 * @param position - Position array to validate
 * @returns true if valid
 */
const isValidPosition = (
  position?: [number, number, number]
): position is [number, number, number] => {
  return (
    Array.isArray(position) &&
    position.length === 3 &&
    position.every((n) => typeof n === "number" && !isNaN(n))
  );
};

/**
 * Validate scale value
 * @param scale - Scale value to validate
 * @returns true if valid
 */
const isValidScale = (scale?: number): scale is number => {
  return typeof scale === "number" && !isNaN(scale) && scale > 0;
};

/**
 * Sanitize and validate model configuration
 * @param config - Partial model config to sanitize
 * @returns Valid model configuration
 */
export const sanitizeModelConfig = (
  config: Partial<Model3DConfig>
): Model3DConfig => {
  // Validate URL
  if (!config.modelUrl || !validateModelUrl(config.modelUrl)) {
    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.warn(
        "[Validation] Invalid model URL, using default:",
        config.modelUrl
      );
    }
    return DEFAULT_MODEL_CONFIG;
  }

  return {
    id: config.id || `model-${Date.now()}`,
    name: config.name || "Unnamed Model",
    modelUrl: config.modelUrl,
    thumbnailUrl: config.thumbnailUrl,
    position: isValidPosition(config.position) ? config.position : [0, -2, 0],
    scale: isValidScale(config.scale) ? config.scale : 1,
    rotation: isValidPosition(config.rotation) ? config.rotation : undefined,
  };
};

/**
 * ============================================================
 * API RESPONSE TRANSFORMATION
 * ============================================================
 */

/**
 * Transform API response to internal model config format
 * TODO: Update this based on your actual backend API response format
 *
 * @param apiResponse - Raw API response
 * @returns Sanitized model configuration
 */
export const transformApiResponse = (
  apiResponse: Model3DApiResponse
): Model3DConfig => {
  if (FEATURE_FLAGS.DEBUG_MODE) {
    console.log("[Transform] API response:", apiResponse);
  }

  // Transform snake_case from API to camelCase
  const config: Partial<Model3DConfig> = {
    id: apiResponse.id,
    name: apiResponse.name,
    modelUrl: apiResponse.model_url, // Transform snake_case
    thumbnailUrl: apiResponse.thumbnail_url,
    position: apiResponse.position,
    scale: apiResponse.scale,
    rotation: apiResponse.rotation,
  };

  // Validate and sanitize
  return sanitizeModelConfig(config);
};

/**
 * ============================================================
 * PRELOAD UTILITIES
 * ============================================================
 */

/**
 * Preload model from URL for better performance
 * @param url - Model URL to preload
 */
export const preloadModelUrl = (url: string): void => {
  if (!validateModelUrl(url)) {
    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.warn("[Preload] Invalid model URL:", url);
    }
    return;
  }

  try {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "fetch";
    link.href = url;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);

    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.log("[Preload] Model URL preloaded:", url);
    }
  } catch (error) {
    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.error("[Preload] Failed to preload:", error);
    }
  }
};
