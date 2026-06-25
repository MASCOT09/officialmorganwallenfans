"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

function CameraRig() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
      group.current.rotation.x = Math.cos(clock.getElapsedTime() * 0.2) * 0.05;
    }
  });
  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh>
          <torusKnotGeometry args={[1, 0.3, 128, 16]} />
          <meshStandardMaterial color="#7a9a6e" metalness={0.6} roughness={0.3} wireframe />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh position={[2, 0.5, -1]}>
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial color="#4a5c3f" metalness={0.4} roughness={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroScene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#7a9a6e" />
      <pointLight position={[-10, -5, 5]} intensity={0.4} color="#4a5c3f" />
      <Stars radius={50} depth={30} count={800} factor={3} fade speed={0.5} />
      <CameraRig />
    </Canvas>
  );
}
