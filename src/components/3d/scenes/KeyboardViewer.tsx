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
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Html,
  useProgress,
} from "@react-three/drei";
import { Camera, Download, Activity, RefreshCw } from "lucide-react";
import { KeyboardModel } from "../models/KeyboardModel";

// ==================== CONSTANTS ====================
const CAMERA_CONFIG = {
  position: [0, 15, 30] as [number, number, number],
  fov: 40,
} as const;

const ORBIT_CONFIG = {
  autoRotateSpeed: 0.8,
  minDistance: 10,
  maxDistance: 60,
  minPolarAngle: 0,
  maxPolarAngle: Math.PI,
} as const;

const SHADOW_CONFIG = {
  position: [0, -2.05, 0] as [number, number, number],
  opacity: 0.4,
  scale: 40,
  blur: 2.5,
  far: 4,
  resolution: 256,
  color: "#000000",
} as const;

const MODEL_CONFIGS = {
  keyboard: {
    path: "/gaming_keyboard.glb",
    position: [0, -2, 0] as [number, number, number],
  },
  // thêm các mô hình khác nếu cần
  // mouse: { path: "/gaming_mouse.glb", position: [0, -1, 0] },
} as const;

// ==================== TYPES ====================
interface ViewerProps {
  className?: string;
  autoRotate?: boolean;
  enableZoom?: boolean;
  enableScreenshot?: boolean;
  enableFPS?: boolean;
  enableGestures?: boolean;
  modelType?: keyof typeof MODEL_CONFIGS;
  environmentPreset?:
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
  onScreenshot?: (dataUrl: string) => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// ==================== ERROR BOUNDARY ====================
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
    console.error("3D Viewer Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
            <div className="text-red-400 mb-4">
              <svg
                className="w-16 h-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Failed to Load 3D Model</h3>
            <p className="text-gray-400 text-sm mb-4 text-center max-w-md">
              {this.state.error?.message ||
                "An error occurred while loading the 3D viewer"}
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

// ==================== LOADING SKELETON ====================
const LoadingSkeleton = memo(() => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 animate-pulse">
      <div className="relative">
        {/* Pulsing circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-white/5 animate-ping" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse" />
        </div>

        {/* Center icon */}
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

// ==================== FPS COUNTER ====================
const FPSCounter = memo(() => {
  const [fps, setFps] = useState(60);

  useFrame((state) => {
    setFps(
      Math.round(state.clock.elapsedTime > 0 ? 1 / state.clock.getDelta() : 60)
    );
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

// ==================== LOADER ====================
const Loader = memo(() => {
  const { progress } = useProgress();

  return (
    <Html center>
      <div
        className="flex flex-col items-center gap-3"
        role="status"
        aria-live="polite"
      >
        {/* Progress Ring */}
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

// ==================== SCREENSHOT HANDLER ====================
// const useScreenshot = (onScreenshot?: (dataUrl: string) => void) => {
//   const { gl, scene, camera } = useThree();

//   const takeScreenshot = useCallback(() => {
//     try {
//       gl.render(scene, camera);
//       const dataUrl = gl.domElement.toDataURL("image/png");

//       if (onScreenshot) {
//         onScreenshot(dataUrl);
//       } else {
//         // Auto download
//         const link = document.createElement("a");
//         link.download = `3d-keyboard-${Date.now()}.png`;
//         link.href = dataUrl;
//         link.click();
//       }
//     } catch (error) {
//       console.error("Screenshot failed:", error);
//     }
//   }, [gl, scene, camera, onScreenshot]);

//   return takeScreenshot;
// };

// ==================== SCENE ====================
const Scene = memo<{
  autoRotate: boolean;
  enableZoom: boolean;
  isInteracting: boolean;
  environmentPreset: ViewerProps["environmentPreset"];
  modelConfig: (typeof MODEL_CONFIGS)[keyof typeof MODEL_CONFIGS];
  enableFPS: boolean;
  enableGestures: boolean;
}>(
  ({
    autoRotate,
    enableZoom,
    isInteracting,
    environmentPreset,
    modelConfig,
    enableFPS,
    enableGestures,
  }) => {
    return (
      <>
        <Environment preset={environmentPreset || "city"} />

        <KeyboardModel position={modelConfig.position} />

        <ContactShadows
          position={SHADOW_CONFIG.position}
          opacity={SHADOW_CONFIG.opacity}
          scale={SHADOW_CONFIG.scale}
          blur={SHADOW_CONFIG.blur}
          far={SHADOW_CONFIG.far}
          resolution={SHADOW_CONFIG.resolution}
          color={SHADOW_CONFIG.color}
        />

        <OrbitControls
          makeDefault
          autoRotate={autoRotate && !isInteracting}
          autoRotateSpeed={ORBIT_CONFIG.autoRotateSpeed}
          enableZoom={enableZoom}
          minDistance={ORBIT_CONFIG.minDistance}
          maxDistance={ORBIT_CONFIG.maxDistance}
          enablePan={false}
          minPolarAngle={ORBIT_CONFIG.minPolarAngle}
          maxPolarAngle={ORBIT_CONFIG.maxPolarAngle}
          touches={enableGestures ? { ONE: 2, TWO: 0 } : undefined}
        />

        {enableFPS && <FPSCounter />}
      </>
    );
  }
);

Scene.displayName = "Scene";

// ==================== SCREENSHOT BUTTON ====================
const ScreenshotButton = ({ onClick }: { onClick: () => void }) => {
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
};

// ==================== MAIN COMPONENT ====================
export default function KeyboardViewer({
  className = "h-[500px]",
  autoRotate = true,
  enableZoom = false,
  enableScreenshot = false,
  enableFPS = false,
  enableGestures = true,
  modelType = "keyboard",
  environmentPreset = "city",
  onScreenshot,
}: ViewerProps) {
  const [isInteracting, setIsInteracting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  //   const screenshotTriggerRef = useRef<() => void>();

  const modelConfig = MODEL_CONFIGS[modelType] || MODEL_CONFIGS.keyboard;

  const handlePointerDown = useCallback(() => {
    setIsInteracting(true);
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsInteracting(false);
  }, []);

  //   const handleScreenshot = useCallback(() => {
  //     if (screenshotTriggerRef.current) {
  //       screenshotTriggerRef.current();
  //     }
  //   }, []);

  return (
    <ViewerErrorBoundary>
      <div
        ref={canvasRef}
        className={`w-full relative bg-transparent ${className}`}
        role="img"
        aria-label="Interactive 3D keyboard model"
      >
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 z-10">
            <LoadingSkeleton />
          </div>
        )}

        {/* Screenshot Button */}
        {/* {enableScreenshot && !isLoading && (
          <div className="absolute top-4 right-4 z-20">
            <ScreenshotButton onClick={handleScreenshot} />
          </div>
        )} */}

        {/* Canvas */}
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={CAMERA_CONFIG}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onCreated={() => setIsLoading(false)}
          gl={{ preserveDrawingBuffer: true }}
        >
          <Suspense fallback={<Loader />}>
            <Scene
              autoRotate={autoRotate}
              enableZoom={enableZoom}
              isInteracting={isInteracting}
              environmentPreset={environmentPreset}
              modelConfig={modelConfig}
              enableFPS={enableFPS}
              enableGestures={enableGestures}
            />

            {/* Xử lí screenshot */}
            {/* {enableScreenshot && (
              <ScreenshotHandler
                onScreenshot={onScreenshot}
                triggerRef={screenshotTriggerRef}
              />
            )} */}
          </Suspense>
        </Canvas>

        {/* Gợi ý cử chỉ chạm */}
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

// Screenshot handler component
// function ScreenshotHandler({
//   onScreenshot,
//   triggerRef,
// }: {
//   onScreenshot?: (dataUrl: string) => void;
//   triggerRef: React.MutableRefObject<(() => void) | undefined>;
// }) {
//   const takeScreenshot = useScreenshot(onScreenshot);

//   triggerRef.current = takeScreenshot;

//   return null;
// }
