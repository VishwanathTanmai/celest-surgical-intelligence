"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Float, Stars, TorusKnot, Line } from "@react-three/drei";
import * as THREE from "three";

function AbstractCore() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <TorusKnot args={[1.2, 0.3, 128, 32, 2, 3]} scale={1.5}>
          <meshStandardMaterial 
            color="#00f0ff" 
            wireframe 
            emissive="#00f0ff"
            emissiveIntensity={0.8}
            transparent
            opacity={0.3}
          />
        </TorusKnot>
        <Sphere args={[1, 32, 32]}>
          <meshStandardMaterial 
            color="#0a0a0a" 
            metalness={0.9} 
            roughness={0.1}
            envMapIntensity={1}
          />
        </Sphere>
        
        {/* Pulsing Inner Core */}
        <Sphere args={[0.9, 16, 16]}>
          <meshBasicMaterial color="#00f0ff" wireframe />
        </Sphere>
      </Float>
    </group>
  );
}

function Particles() {
  const count = 500;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 15;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 15;
      temp.push({ x, y, z, factor: Math.random(), speed: Math.random() * 0.01 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { x, y, z, factor, speed } = particle;
      const t = state.clock.elapsedTime * speed;
      dummy.position.set(
        x + Math.cos(t) * factor,
        y + Math.sin(t) * factor,
        z + Math.cos(t) * factor
      );
      dummy.scale.setScalar(Math.max(0.1, Math.sin(t * 5) * 0.5));
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) {
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} />
    </instancedMesh>
  );
}

export default function ThreeDScene() {
  return (
    <div className="w-full h-[600px] lg:h-[800px] absolute inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <color attach="background" args={["#030303"]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#00f0ff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#ffffff" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <AbstractCore />
        <Particles />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030303_100%)] pointer-events-none" />
    </div>
  );
}
