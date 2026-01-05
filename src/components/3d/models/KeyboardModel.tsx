// src/components/3d/models/KeyboardModel.tsx

"use client";

import React from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { FEATURE_FLAGS } from "@/src/config/models.config";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

interface KeyboardModelProps {
  /**
   * Model URL from Cloudinary or API
   */
  modelUrl: string;

  /**
   * Position in 3D space [x, y, z]
   * @default [0, 0, 0]
   */
  position?: [number, number, number];

  /**
   * Scale factor
   * @default 1
   */
  scale?: number;

  /**
   * Rotation in radians [x, y, z]
   * @default [0, 0, 0]
   */
  rotation?: [number, number, number];

  /**
   * Callback when model loads successfully
   */
  onLoad?: () => void;

  /**
   * Callback when model fails to load
   */
  onError?: (error: Error) => void;
}

/**
 * ============================================================
 * COMPONENT: KeyboardModel
 * ============================================================
 * Renders a 3D keyboard model from dynamic URL
 *
 * @example
 * <KeyboardModel
 *   modelUrl="https://res.cloudinary.com/.../keyboard.glb"
 *   position={[0, -2, 0]}
 *   scale={1}
 * />
 */

export const KeyboardModel = React.memo<KeyboardModelProps>(
  ({
    modelUrl,
    position = [0, 0, 0],
    scale = 1,
    rotation = [0, 0, 0],
    onLoad,
    onError,
  }) => {
    // Load 3D model
    const { scene } = useGLTF(modelUrl, true, true, (loader) => {
      // Configure loader
      loader.manager.onLoad = () => {
        if (FEATURE_FLAGS.DEBUG_MODE) {
          console.log("[Model] Loaded successfully:", modelUrl);
        }
        onLoad?.();
      };

      loader.manager.onError = (url) => {
        const error = new Error(`Failed to load model: ${url}`);
        console.error("[Model] Load error:", error);
        onError?.(error);
      };
    });

    return (
      <group
        position={position}
        scale={scale}
        rotation={rotation}
        dispose={null}
      >
        <primitive object={scene} />
      </group>
    );
  }
);

KeyboardModel.displayName = "KeyboardModel";

/**
 * ============================================================
 * PRELOAD UTILITY
 * ============================================================
 * Manually preload a model
 *
 * @example
 * preloadKeyboardModel('https://cloudinary.com/.../keyboard.glb');
 */
export const preloadKeyboardModel = (modelUrl: string): void => {
  useGLTF.preload(modelUrl);

  if (FEATURE_FLAGS.DEBUG_MODE) {
    console.log("[Model] Preloading:", modelUrl);
  }
};
