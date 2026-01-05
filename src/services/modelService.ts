// src/services/modelService.ts

import {
  Model3DConfig,
  Model3DApiResponse,
  CacheEntry,
} from "@/src/types/model.types";
import {
  API_CONFIG,
  FEATURE_FLAGS,
  HARDCODED_MODELS,
  DEFAULT_MODEL_CONFIG,
} from "@/src/config/models.config";
import {
  transformApiResponse,
  sanitizeModelConfig,
  preloadModelUrl,
} from "@/src/lib/validations/modelValidation";

/**
 * ============================================================
 * CACHE MANAGER
 * ============================================================
 */

class ModelCacheManager {
  private cache = new Map<string, CacheEntry<Model3DConfig>>();
  private readonly TTL = FEATURE_FLAGS.CACHE_TTL;

  /**
   * Set cache entry
   */
  set(key: string, config: Model3DConfig): void {
    this.cache.set(key, {
      data: config,
      timestamp: Date.now(),
    });

    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.log("[Cache] Cached model:", key);
    }
  }

  /**
   * Get cache entry if not expired
   */
  get(key: string): Model3DConfig | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > this.TTL;

    if (isExpired) {
      this.cache.delete(key);
      if (FEATURE_FLAGS.DEBUG_MODE) {
        console.log("[Cache] Expired:", key);
      }
      return null;
    }

    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.log("[Cache] Hit:", key);
    }

    return entry.data;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.log("[Cache] Cleared all");
    }
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.log("[Cache] Deleted:", key);
    }
  }
}

// Singleton instance
export const modelCache = new ModelCacheManager();

/**
 * ============================================================
 * API FETCH UTILITIES
 * ============================================================
 */

/**
 * Fetch with timeout
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = API_CONFIG.TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * ============================================================
 * MAIN SERVICE FUNCTIONS
 * ============================================================
 */

/**
 * Fetch 3D model configuration from API
 * TODO: This will be used when backend is ready
 *
 * @param productId - Product identifier
 * @returns Model configuration
 */
const fetchModelFromApi = async (productId: string): Promise<Model3DConfig> => {
  const endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_3D_MODEL(
    productId
  )}`;

  if (FEATURE_FLAGS.DEBUG_MODE) {
    console.log("[API] Fetching model from:", endpoint);
  }

  try {
    const response = await fetchWithTimeout(endpoint);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: Model3DApiResponse = await response.json();

    // Transform and validate API response
    const config = transformApiResponse(data);

    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.log("[API] Model fetched successfully:", config);
    }

    return config;
  } catch (error) {
    console.error("[API] Failed to fetch model:", error);
    throw error;
  }
};

/**
 * Get model from hardcoded configuration
 * Currently used until backend is ready
 *
 * @param productId - Product identifier
 * @returns Model configuration
 */
const getHardcodedModel = (productId: string): Model3DConfig => {
  if (FEATURE_FLAGS.DEBUG_MODE) {
    console.log("[Service] Getting hardcoded model:", productId);
  }

  const config = HARDCODED_MODELS[productId];

  if (!config) {
    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.warn("[Service] Model not found, using default:", productId);
    }
    return DEFAULT_MODEL_CONFIG;
  }

  return sanitizeModelConfig(config);
};

/**
 * ============================================================
 * PUBLIC API
 * ============================================================
 */

/**
 * Get 3D model configuration
 * Automatically uses API or hardcoded data based on FEATURE_FLAGS
 *
 * @param productId - Product identifier
 * @param forceRefresh - Skip cache and fetch fresh data
 * @returns Model configuration
 *
 * @example
 * const config = await getModelConfig('keyboard-gaming-pro');
 */
export const getModelConfig = async (
  productId: string,
  forceRefresh = false
): Promise<Model3DConfig> => {
  // Check cache first
  if (!forceRefresh) {
    const cached = modelCache.get(productId);
    if (cached) {
      return cached;
    }
  }

  let config: Model3DConfig;

  // TODO: When backend is ready, set FEATURE_FLAGS.USE_API = true
  if (FEATURE_FLAGS.USE_API) {
    try {
      config = await fetchModelFromApi(productId);
    } catch (error) {
      console.error("[Service] API fetch failed, using hardcoded fallback");
      config = getHardcodedModel(productId);
    }
  } else {
    // Currently using hardcoded models
    config = getHardcodedModel(productId);
  }

  // Cache the config
  modelCache.set(productId, config);

  // Preload model if enabled
  if (FEATURE_FLAGS.ENABLE_PRELOAD) {
    preloadModelUrl(config.modelUrl);
  }

  return config;
};

/**
 * Preload multiple models
 *
 * @param productIds - Array of product IDs to preload
 *
 * @example
 * preloadModels(['keyboard-001', 'mouse-001']);
 */
export const preloadModels = async (productIds: string[]): Promise<void> => {
  if (!FEATURE_FLAGS.ENABLE_PRELOAD) {
    return;
  }

  if (FEATURE_FLAGS.DEBUG_MODE) {
    console.log("[Service] Preloading models:", productIds);
  }

  const promises = productIds.map((id) =>
    getModelConfig(id).catch((error) => {
      console.error(`[Service] Failed to preload model ${id}:`, error);
    })
  );

  await Promise.all(promises);
};

/**
 * Invalidate cache for specific product
 *
 * @param productId - Product identifier
 *
 * @example
 * invalidateModelCache('keyboard-001');
 */
export const invalidateModelCache = (productId: string): void => {
  modelCache.delete(productId);
};

/**
 * Clear all model cache
 *
 * @example
 * clearModelCache();
 */
export const clearModelCache = (): void => {
  modelCache.clear();
};
