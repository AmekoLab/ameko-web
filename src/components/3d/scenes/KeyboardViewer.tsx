"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Html,
  useProgress,
} from "@react-three/drei";
import { KeyboardModel } from "../models/KeyboardModel";

// --- LOADER ---
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-24 h-1 bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-white/50 tracking-widest">
          {progress.toFixed(0)}%
        </span>
      </div>
    </Html>
  );
}

interface ViewerProps {
  className?: string;
  autoRotate?: boolean;
  enableZoom?: boolean;
}

export default function KeyboardViewer({
  className = "h-[500px]",
  autoRotate = true,
  enableZoom = false, // Mặc định tắt zoom để an toàn cho scroll trang
}: ViewerProps) {
  const [isInteracting, setIsInteracting] = useState(false);

  return (
    <div className={`w-full relative bg-transparent ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 15, 30], fov: 40 }}
        onPointerDown={() => setIsInteracting(true)}
        onPointerUp={() => setIsInteracting(false)}
      >
        <Suspense fallback={<Loader />}>
          <Environment preset="city" />

          <KeyboardModel position-y={-2} />

          <ContactShadows
            position={[0, -2.05, 0]}
            opacity={0.4}
            scale={40}
            blur={2.5}
            far={4}
            resolution={256}
            color="#000000"
          />

          <OrbitControls
            makeDefault
            autoRotate={autoRotate && !isInteracting}
            autoRotateSpeed={0.8}
            enableZoom={enableZoom}
            minDistance={10} // Không cho zoom quá gần
            maxDistance={60} // Không cho zoom quá xa
            enablePan={false}
            minPolarAngle={0} // Góc cao nhất (nhìn từ đỉnh đầu xuống)
            maxPolarAngle={Math.PI}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
