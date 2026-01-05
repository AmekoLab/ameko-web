// src/hooks/use3DModel.ts

import { useState, useEffect, useCallback, useRef } from "react";
import { Model3DConfig, Use3DModelReturn } from "@/src/types/model.types";
import { getModelConfig } from "@/src/services/modelService";
import { FEATURE_FLAGS } from "@/src/config/models.config";

/**
 * ============================================================
 * CUSTOM HOOK: use3DModel
 * ============================================================
 * Fetches and manages 3D model configuration
 *
 * @param productId - Product identifier
 * @param options - Hook options
 * @returns Model config, loading state, error, and refetch function
 *
 * @example
 * const { modelConfig, isLoading, error } = use3DModel('keyboard-001');
 */

interface Use3DModelOptions {
  /**
   * Enable automatic fetching on mount
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback when model is loaded successfully
   */
  onSuccess?: (config: Model3DConfig) => void;

  /**
   * Callback when model loading fails
   */
  onError?: (error: Error) => void;

  /**
   * Retry failed requests automatically
   * @default false
   */
  retry?: boolean;

  /**
   * Number of retry attempts
   * @default 3
   */
  retryCount?: number;

  /**
   * Delay between retries in milliseconds
   * @default 1000
   */
  retryDelay?: number;
}

export const use3DModel = (
  productId: string,
  options: Use3DModelOptions = {}
): Use3DModelReturn => {
  const {
    enabled = true,
    onSuccess,
    onError,
    retry = false,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [modelConfig, setModelConfig] = useState<Model3DConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  // ✅ Use refs for callbacks to avoid re-creating fetchModel
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  /**
   * Fetch model configuration
   */
  const fetchModel = useCallback(
    async (forceRefresh = false) => {
      if (!productId) {
        const err = new Error("Product ID is required");
        setError(err);
        onError?.(err);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        if (FEATURE_FLAGS.DEBUG_MODE) {
          console.log("[Hook] Fetching model:", productId);
        }

        const config = await getModelConfig(productId, forceRefresh);

        setModelConfig(config);
        setAttemptCount(0);

        // ✅ Use ref instead of direct callback
        onSuccessRef.current?.(config);

        if (FEATURE_FLAGS.DEBUG_MODE) {
          console.log("[Hook] Model loaded successfully:", config);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);

        // ✅ Use ref instead of direct callback
        onErrorRef.current?.(error);

        if (FEATURE_FLAGS.DEBUG_MODE) {
          console.error("[Hook] Failed to load model:", error);
        }

        // Retry logic
        if (retry && attemptCount < retryCount) {
          setTimeout(() => {
            setAttemptCount((prev) => prev + 1);
            fetchModel(forceRefresh);
          }, retryDelay);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [productId, retry, retryCount, retryDelay, attemptCount] // ✅ Removed onSuccess, onError
  );

  /**
   * Refetch model (force refresh)
   */
  const refetch = useCallback(async () => {
    await fetchModel(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]); // ✅ Only depend on productId

  /**
   * Fetch on mount or when productId changes
   */
  useEffect(() => {
    if (enabled && productId) {
      fetchModel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, productId]); // ✅ Only productId and enabled

  return {
    modelConfig,
    isLoading,
    error,
    refetch,
  };
};

/**
 * ============================================================
 * VARIANT: use3DModelLazy
 * ============================================================
 * Lazy version that doesn't fetch on mount
 * Useful for modals or conditional rendering
 *
 * @param productId - Product identifier
 * @returns Model config, loading state, error, and fetch function
 *
 * @example
 * const { modelConfig, isLoading, fetch } = use3DModelLazy('keyboard-001');
 * // Later...
 * await fetch(); // Manually trigger fetch
 */

export const use3DModelLazy = (productId: string): Use3DModelReturn => {
  return use3DModel(productId, { enabled: false });
};

/**
 * ============================================================
 * HELPER HOOKS
 * ============================================================
 */

/**
 * Hook to preload multiple models
 * Useful for product listings
 *
 * @param productIds - Array of product IDs
 *
 * @example
 * usePreloadModels(['keyboard-001', 'mouse-001', 'headset-001']);
 */
export const usePreloadModels = (productIds: string[]): void => {
  useEffect(() => {
    if (!FEATURE_FLAGS.ENABLE_PRELOAD || productIds.length === 0) {
      return;
    }

    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.log("[Hook] Preloading models:", productIds);
    }

    // Preload in background (fire and forget)
    productIds.forEach((id) => {
      getModelConfig(id).catch((error) => {
        if (FEATURE_FLAGS.DEBUG_MODE) {
          console.error(`[Hook] Failed to preload ${id}:`, error);
        }
      });
    });
  }, [productIds]);
};
