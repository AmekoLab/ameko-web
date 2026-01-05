// src/components/3d/scenes/KeyboardViewer.tsx

"use client";

import {
  Suspense,
  useState,
  useCallback,
  memo,
  useRef,
  Component,
  ErrorInfo,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Html,
  useProgress,
} from "@react-three/drei";
import {
  Camera,
  Download,
  Activity,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { KeyboardModel } from "../models/KeyboardModel";
import { Model3DConfig, EnvironmentPreset } from "@/src/types/model.types";
import { VIEWER_DEFAULTS, FEATURE_FLAGS } from "@/src/config/models.config";
import { validateModelUrl } from "@/src/lib/validations/modelValidation";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

interface ViewerProps {
  /**
   * Model configuration from API or hardcoded
   */
  modelConfig: Model3DConfig;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Enable automatic rotation
   * @default true
   */
  autoRotate?: boolean;

  /**
   * Enable zoom controls
   * @default false
   */
  enableZoom?: boolean;

  /**
   * Enable screenshot functionality
   * @default false
   */
  enableScreenshot?: boolean;

  /**
   * Show FPS counter
   * @default false
   */
  enableFPS?: boolean;

  /**
   * Enable mobile gesture controls
   * @default true
   */
  enableGestures?: boolean;

  /**
   * Environment lighting preset
   * @default "city"
   */
  environmentPreset?: EnvironmentPreset;

  /**
   * Callback when screenshot is taken
   */
  onScreenshot?: (dataUrl: string) => void;

  /**
   * Callback when error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Callback when model loads successfully
   */
  onLoad?: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * ============================================================
 * ERROR BOUNDARY
 * ============================================================
 */

class ViewerErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[3D Viewer] Error:", error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
            <div className="text-red-400 mb-4">
              <AlertCircle className="w-16 h-16" />
            </div>
            <h3 className="text-xl font-bold mb-2">Failed to Load 3D Model</h3>
            <p className="text-gray-400 text-sm mb-4 text-center max-w-md">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * ============================================================
 * LOADING SKELETON
 * ============================================================
 */

const LoadingSkeleton = memo(() => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 animate-pulse">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-white/5 animate-ping" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse" />
        </div>

        <div className="relative z-10 w-32 h-32 flex items-center justify-center">
          <div className="w-16 h-16 text-white/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M10 16h4" />
            </svg>
          </div>
        </div>
      </div>

      <p className="mt-8 text-white/40 text-sm font-medium tracking-wider">
        Initializing 3D Viewer...
      </p>
    </div>
  );
});

LoadingSkeleton.displayName = "LoadingSkeleton";

/**
 * ============================================================
 * FPS COUNTER
 * ============================================================
 */

const FPSCounter = memo(() => {
  const [fps, setFps] = useState(60);

  useFrame((state) => {
    const newFps = Math.round(
      state.clock.elapsedTime > 0 ? 1 / state.clock.getDelta() : 60
    );
    setFps(newFps);
  });

  return (
    <Html position={[0, 5, 0]} center>
      <div className="bg-black/70 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-green-400" />
          <span className="text-white text-xs font-mono font-bold">
            {fps} FPS
          </span>
        </div>
      </div>
    </Html>
  );
});

FPSCounter.displayName = "FPSCounter";

/**
 * ============================================================
 * PROGRESS LOADER
 * ============================================================
 */

const Loader = memo(() => {
  const { progress } = useProgress();

  return (
    <Html center>
      <div
        className="flex flex-col items-center gap-3"
        role="status"
        aria-live="polite"
      >
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-700"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={226}
              strokeDashoffset={226 - (226 * progress) / 100}
              className="text-white transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>

        <span className="text-[10px] font-bold text-white/50 tracking-widest">
          LOADING MODEL
        </span>
      </div>
    </Html>
  );
});

Loader.displayName = "Loader";

/**
 * ============================================================
 * SCREENSHOT UTILITIES
 * ============================================================
 */

const useScreenshot = (onScreenshot?: (dataUrl: string) => void) => {
  const { gl, scene, camera } = useThree();

  const takeScreenshot = useCallback(() => {
    try {
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL("image/png");

      if (onScreenshot) {
        onScreenshot(dataUrl);
      } else {
        const link = document.createElement("a");
        link.download = `3d-model-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }

      if (FEATURE_FLAGS.DEBUG_MODE) {
        console.log("[Screenshot] Captured successfully");
      }
    } catch (error) {
      console.error("[Screenshot] Failed:", error);
    }
  }, [gl, scene, camera, onScreenshot]);

  return takeScreenshot;
};

/**
 * ============================================================
 * 3D SCENE
 * ============================================================
 */

const Scene = memo<{
  modelConfig: Model3DConfig;
  autoRotate: boolean;
  enableZoom: boolean;
  isInteracting: boolean;
  environmentPreset: EnvironmentPreset;
  enableFPS: boolean;
  enableGestures: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}>(
  ({
    modelConfig,
    autoRotate,
    enableZoom,
    isInteracting,
    environmentPreset,
    enableFPS,
    enableGestures,
    onLoad,
    onError,
  }) => {
    return (
      <>
        <Environment preset={environmentPreset} />

        <KeyboardModel
          modelUrl={modelConfig.modelUrl}
          position={modelConfig.position || [0, -2, 0]}
          scale={modelConfig.scale || 1}
          rotation={modelConfig.rotation}
          onLoad={onLoad}
          onError={onError}
        />

        <ContactShadows
          position={VIEWER_DEFAULTS.SHADOW.position}
          opacity={VIEWER_DEFAULTS.SHADOW.opacity}
          scale={VIEWER_DEFAULTS.SHADOW.scale}
          blur={VIEWER_DEFAULTS.SHADOW.blur}
          far={VIEWER_DEFAULTS.SHADOW.far}
          resolution={VIEWER_DEFAULTS.SHADOW.resolution}
          color={VIEWER_DEFAULTS.SHADOW.color}
        />

        <OrbitControls
          makeDefault
          autoRotate={autoRotate && !isInteracting}
          autoRotateSpeed={VIEWER_DEFAULTS.ORBIT.autoRotateSpeed}
          enableZoom={enableZoom}
          minDistance={VIEWER_DEFAULTS.ORBIT.minDistance}
          maxDistance={VIEWER_DEFAULTS.ORBIT.maxDistance}
          enablePan={false}
          minPolarAngle={VIEWER_DEFAULTS.ORBIT.minPolarAngle}
          maxPolarAngle={VIEWER_DEFAULTS.ORBIT.maxPolarAngle}
          touches={enableGestures ? { ONE: 2, TWO: 0 } : undefined}
        />

        {enableFPS && <FPSCounter />}
      </>
    );
  }
);

Scene.displayName = "Scene";

/**
 * ============================================================
 * SCREENSHOT BUTTON
 * ============================================================
 */

const ScreenshotButton = memo<{ onClick: () => void }>(({ onClick }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleClick = useCallback(() => {
    setIsCapturing(true);
    onClick();
    setTimeout(() => setIsCapturing(false), 300);
  }, [onClick]);

  return (
    <button
      onClick={handleClick}
      disabled={isCapturing}
      className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg transition-all disabled:opacity-50 group"
      aria-label="Take screenshot"
      title="Take Screenshot"
    >
      {isCapturing ? (
        <Download className="w-5 h-5 text-white animate-bounce" />
      ) : (
        <Camera className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
});

ScreenshotButton.displayName = "ScreenshotButton";

/**
 * ============================================================
 * MAIN COMPONENT
 * ============================================================
 */

export default function KeyboardViewer({
  modelConfig,
  className = "h-[500px]",
  autoRotate = true,
  enableZoom = false,
  enableScreenshot = false,
  enableFPS = false,
  enableGestures = true,
  environmentPreset = "city",
  onScreenshot,
  onError,
  onLoad,
}: ViewerProps) {
  const [isInteracting, setIsInteracting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const screenshotTriggerRef = useRef<(() => void) | undefined>(undefined);

  // Validate model config - useMemo instead of useEffect to avoid cascading renders
  const isValidConfig = useMemo(() => {
    const isValid = validateModelUrl(modelConfig.modelUrl);

    if (!isValid) {
      const error = new Error("Invalid model URL");
      console.error("[Viewer] Invalid config:", modelConfig);
      onError?.(error);
    }

    return isValid;
  }, [modelConfig.modelUrl, modelConfig, onError]);

  const handlePointerDown = useCallback(() => {
    setIsInteracting(true);
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsInteracting(false);
  }, []);

  const handleScreenshot = useCallback(() => {
    screenshotTriggerRef.current?.();
  }, []);

  const handleModelLoad = useCallback(() => {
    if (FEATURE_FLAGS.DEBUG_MODE) {
      console.log("[Viewer] Model loaded");
    }
    onLoad?.();
  }, [onLoad]);

  if (!isValidConfig) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-sm text-gray-400">Invalid model configuration</p>
        </div>
      </div>
    );
  }

  return (
    <ViewerErrorBoundary onError={onError}>
      <div
        ref={canvasRef}
        className={`w-full relative bg-transparent ${className}`}
        role="img"
        aria-label={`Interactive 3D model: ${modelConfig.name}`}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10">
            <LoadingSkeleton />
          </div>
        )}

        {enableScreenshot && !isLoading && (
          <div className="absolute top-4 right-4 z-20">
            <ScreenshotButton onClick={handleScreenshot} />
          </div>
        )}

        <Canvas
          shadows
          dpr={[1, 2]}
          camera={VIEWER_DEFAULTS.CAMERA}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onCreated={() => setIsLoading(false)}
          gl={{ preserveDrawingBuffer: true }}
        >
          <Suspense fallback={<Loader />}>
            <Scene
              modelConfig={modelConfig}
              autoRotate={autoRotate}
              enableZoom={enableZoom}
              isInteracting={isInteracting}
              environmentPreset={environmentPreset}
              enableFPS={enableFPS}
              enableGestures={enableGestures}
              onLoad={handleModelLoad}
              onError={onError}
            />

            {enableScreenshot && (
              <ScreenshotHandler
                onScreenshot={onScreenshot}
                triggerRef={screenshotTriggerRef}
              />
            )}
          </Suspense>
        </Canvas>

        {enableGestures && !isLoading && (
          <div className="absolute bottom-4 left-4 text-white/30 text-xs pointer-events-none">
            <p>👆 One finger to rotate</p>
            <p>✌️ Two fingers to zoom</p>
          </div>
        )}
      </div>
    </ViewerErrorBoundary>
  );
}

/**
 * Screenshot handler component
 */
function ScreenshotHandler({
  onScreenshot,
  triggerRef,
}: {
  onScreenshot?: (dataUrl: string) => void;
  triggerRef: React.MutableRefObject<(() => void) | undefined>;
}) {
  const takeScreenshot = useScreenshot(onScreenshot);

  // Update ref in useEffect to avoid updating during render
  useEffect(() => {
    triggerRef.current = takeScreenshot;
  }, [takeScreenshot, triggerRef]);

  return null;
}
