"use client";

import React from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { ThreeElements } from "@react-three/fiber";

type GLTFResult = GLTF & {
  nodes: {
    ["Plane004_13_-_Default_0"]: THREE.Mesh;
  };
  materials: {
    ["13_-_Default"]: THREE.MeshStandardMaterial;
  };
};

export function KeyboardModel(props: ThreeElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/gaming_keyboard.glb"
  ) as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="keyboardFBX" rotation={[Math.PI / 2, 0, 0]}>
            <group name="RootNode">
              <group
                name="Plane004"
                rotation={[-Math.PI / 2, 0, 0]}
                scale={0.085}
              >
                <group name="Object_4" position={[7.95, 2.951, 2.749]}>
                  <mesh
                    name="Plane004_13_-_Default_0"
                    castShadow
                    receiveShadow
                    geometry={nodes["Plane004_13_-_Default_0"].geometry}
                    material={materials["13_-_Default"]}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/gaming_keyboard.glb");
