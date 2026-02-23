"use client";

import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { Group } from "three";
import * as THREE from "three";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Animal3DMarkerProps {
  animal: {
    name: string;
    type: "COW" | "SHEEP" | "GOAT" | "CHICKEN" | "HORSE" | "PIG";
    status: "SAFE" | "WARNING" | "ALERT";
  };
  isSelected: boolean;
  onClick: () => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUS_COLORS: Record<string, string> = {
  SAFE: "#00C896",
  WARNING: "#FFB020",
  ALERT: "#FF4757",
};

const STATUS_GLOW: Record<string, string> = {
  SAFE: "rgba(0,200,150,0.5)",
  WARNING: "rgba(255,176,32,0.6)",
  ALERT: "rgba(255,71,87,0.7)",
};

const MODEL_PATHS: Record<string, string> = {
  COW: "/models/cow.glb",
  SHEEP: "/models/sheep.glb",
  CHICKEN: "/models/chicken.glb",
};

/* ------------------------------------------------------------------ */
/*  Simple, reliable model prep: just center + normalize scale         */
/* ------------------------------------------------------------------ */

function prepareModel(scene: THREE.Group): THREE.Group {
  // Use SkeletonUtils.clone for skinned meshes (e.g. sheep with armature)
  const clone = skeletonClone(scene) as THREE.Group;

  // Fix materials to be visible
  clone.traverse((child: any) => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone();
      child.material.side = THREE.DoubleSide;
      // Lighten overly dark materials
      if (child.material.color) {
        const c = child.material.color;
        if (c.r + c.g + c.b < 0.4) {
          child.material.color.set(0.55, 0.45, 0.4);
          child.material.roughness = Math.min(child.material.roughness ?? 1, 0.7);
          child.material.metalness = 0;
        }
      }
      // Ensure emissive isn't killing visibility
      if (child.material.emissive) {
        child.material.emissiveIntensity = 0;
      }
    }
  });

  // Wrap in a container for clean transforms
  const container = new THREE.Group();
  container.add(clone);

  // Step 1: Center the model at origin FIRST
  container.updateMatrixWorld(true);
  const box1 = new THREE.Box3().setFromObject(container);
  const center1 = new THREE.Vector3();
  box1.getCenter(center1);
  clone.position.set(-center1.x, -center1.y, -center1.z);

  // Step 2: Normalize scale to fit in ~1.4 units
  container.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(container);
  const size2 = new THREE.Vector3();
  box2.getSize(size2);
  const maxDim = Math.max(size2.x, size2.y, size2.z);
  if (maxDim > 0) {
    const s = 1.4 / maxDim;
    container.scale.set(s, s, s);
  }

  // Step 3: Re-center after scaling (in case of rounding)
  container.updateMatrixWorld(true);
  const box3 = new THREE.Box3().setFromObject(container);
  const center3 = new THREE.Vector3();
  box3.getCenter(center3);
  container.position.sub(center3);

  return container;
}

/* ------------------------------------------------------------------ */
/*  GLB Model with slow rotation + bobbing                             */
/* ------------------------------------------------------------------ */

function AnimalModel({
  modelPath,
  isSelected,
  onClick,
}: {
  modelPath: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(modelPath);

  const prepared = useMemo(() => prepareModel(scene), [scene]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        Math.sin(clock.getElapsedTime() * 1.6) * 0.05;
      // Steady rotation so users see the model from all sides
      groupRef.current.rotation.y += 0.012;
    }
  });

  const scale = isSelected ? 1.25 : 1.0;

  return (
    <group
      ref={groupRef}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <primitive object={prepared} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported component                                                 */
/* ------------------------------------------------------------------ */

export default function Animal3DMarker({
  animal,
  isSelected,
  onClick,
}: Animal3DMarkerProps) {
  const modelPath = MODEL_PATHS[animal.type];
  const statusColor = STATUS_COLORS[animal.status] ?? "#00C896";
  const glowColor = STATUS_GLOW[animal.status] ?? "rgba(0,200,150,0.5)";

  if (!modelPath) return null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        width: 68,
        height: 68,
        cursor: "pointer",
        position: "relative",
      }}
      title={animal.name}
    >
      {/* Status ring */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `3px solid ${statusColor}`,
          boxShadow: isSelected
            ? `0 0 0 3px white, 0 0 14px ${glowColor}, 0 4px 14px rgba(0,0,0,0.3)`
            : `0 0 8px ${glowColor}, 0 2px 6px rgba(0,0,0,0.2)`,
          background: "rgba(255,255,255,0.92)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          transform: isSelected ? "scale(1.12)" : "scale(1)",
        }}
      />

      {/* R3F Canvas — isometric-ish camera far enough to see any model */}
      <Canvas
        camera={{ position: [2, 1.5, 2], fov: 28 }}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 1,
          pointerEvents: "none",
        }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0, 0);
        }}
      >
        <ambientLight intensity={1.8} />
        <directionalLight position={[4, 5, 4]} intensity={1.2} />
        <directionalLight position={[-3, 3, -2]} intensity={0.7} />
        <directionalLight position={[0, -2, 3]} intensity={0.4} />
        <hemisphereLight args={["#ffffff", "#e8ddd0", 0.9]} />
        <Suspense fallback={null}>
          <AnimalModel
            modelPath={modelPath}
            isSelected={isSelected}
            onClick={onClick}
          />
        </Suspense>
      </Canvas>

      {/* Alert dot */}
      {animal.status === "ALERT" && (
        <div
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#FF4757",
            border: "2px solid white",
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
}

// Preload models
if (typeof window !== "undefined") {
  Object.values(MODEL_PATHS).forEach((path) => {
    useGLTF.preload(path);
  });
}
