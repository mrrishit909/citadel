"use client";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { densityAt, gateClosedAt, mulberry32 } from "@citadel/domain";
import type { Data } from "../data";
import { base } from "../data";
import { live, state, useStore } from "../store";

const RADIUS = 7;
// Palette: Concrete #B6B3AA, Blueprint #183B66, Safety Lime #B9FF44, Emergency Red #D32F2F, Night #101417, Steel #79838B, Human White #F3F1EA.
function Concourse() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[RADIUS - 1.6, RADIUS + 1.6, 64]} />
      <meshStandardMaterial color="#1b2430" roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Gates({ data }: { data: Data }) {
  const gltf = useLoader(GLTFLoader, `${base}/models/gate.glb`);
  const scenes = useMemo(() => data.gates.map(() => gltf.scene.clone(true)), [gltf, data]);
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    data.gates.forEach((g, i) => {
      const grp = refs.current[i]; if (!grp) return;
      const closed = gateClosedAt(g.id, state.t);
      grp.traverse((o) => { const mesh = o as THREE.Mesh; if (mesh.name === "Signage") (mesh.material as THREE.MeshStandardMaterial).color.set(closed ? "#D32F2F" : "#B9FF44"); });
    });
  });
  return <>{data.gates.map((g, i) => (
    <group key={g.id} ref={(el) => { refs.current[i] = el; }} position={[Math.sin(g.angle) * RADIUS, 0, Math.cos(g.angle) * RADIUS]} rotation={[0, -g.angle, 0]}>
      <primitive object={scenes[i]} />
    </group>
  ))}</>;
}

function Crowd({ data }: { data: Data }) {
  const N = 320;
  const seeds = useMemo(() => { const r = mulberry32(606), out: { angle: number; radial: number }[] = []; for (let i = 0; i < N; i++) out.push({ angle: r() * Math.PI * 2, radial: RADIUS - 1.4 + r() * 2.8 }); return out; }, []);
  const gltf = useLoader(GLTFLoader, `${base}/models/human-glyph.glb`);
  const bodyGeo = useMemo(() => { let m: THREE.Mesh | null = null; gltf.scene.traverse((o) => { if (!m && o.name === "GlyphBody" && (o as THREE.Mesh).isMesh) m = o as THREE.Mesh; }); return (m as unknown as THREE.Mesh).geometry; }, [gltf]);
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const im = ref.current; if (!im) return; const d = new THREE.Object3D(), white = new THREE.Color(1, 1, 1);
    seeds.forEach((s, i) => { d.position.set(Math.sin(s.angle) * s.radial, 0, Math.cos(s.angle) * s.radial); d.rotation.y = s.angle; d.scale.setScalar(0.001); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, white); });
    im.instanceMatrix.needsUpdate = true;
  }, [seeds]);
  useFrame(() => {
    const im = ref.current; if (!im || !im.instanceColor) return; const d = new THREE.Object3D(), col = new THREE.Color();
    seeds.forEach((s, i) => {
      const dens = densityAt(data.gates, s.angle, state.t);
      const show = dens > (i / N) * 0.75;
      d.position.set(Math.sin(s.angle) * s.radial, 0, Math.cos(s.angle) * s.radial); d.rotation.y = s.angle; d.scale.setScalar(show ? 1 : 0.001); d.updateMatrix(); im.setMatrixAt(i, d.matrix);
      im.setColorAt(i, col.setHSL(0.6, 0.1, 0.3 + dens * 0.6));
    });
    im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[bodyGeo, new THREE.MeshStandardMaterial({ roughness: 0.7 }), N]} frustumCulled={false} />;
}

function Rig() {
  const { camera } = useThree(), want = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const s = state;
    if (!s.introDone) want.set(0.5, 2 + live.rise * 16, 1 + live.rise * 2);
    else want.set(0, 14, 14);
    const k = s.reduced ? 1 : 1 - Math.exp(-dt * 2.4);
    camera.position.lerp(want, k); (camera as THREE.PerspectiveCamera).lookAt(0, 0, 0);
  });
  return null;
}

function Lifecycle() {
  const { setFrameloop, gl } = useThree();
  useEffect(() => {
    const vis = () => setFrameloop(document.hidden ? "never" : "always");
    const lost = (e: Event) => e.preventDefault();
    document.addEventListener("visibilitychange", vis); gl.domElement.addEventListener("webglcontextlost", lost);
    return () => { document.removeEventListener("visibilitychange", vis); gl.domElement.removeEventListener("webglcontextlost", lost); };
  }, [setFrameloop, gl]);
  return null;
}

declare global { interface Window { __citadelData?: Data; __citadelStats?: () => unknown } }
function Stats() {
  const gl = useThree((s) => s.gl);
  useEffect(() => { window.__citadelStats = () => ({ calls: gl.info.render.calls, triangles: gl.info.render.triangles, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures }); }, [gl]);
  return null;
}

export default function Scene({ data }: { data: Data }) {
  useStore();
  window.__citadelData = data;
  return (
    <Canvas className="stage" data-testid="stage" dpr={[1, 1.5]} camera={{ fov: 50, near: 0.3, far: 100, position: [0, 14, 14] }} gl={{ antialias: false, powerPreference: "high-performance" }} onCreated={({ gl }) => gl.setClearColor("#101417")}>
      <ambientLight intensity={0.55} color="#79838B" /><directionalLight position={[10, 16, 8]} intensity={1.6} color="#F3F1EA" />
      <Rig /><Concourse /><Gates data={data} /><Crowd data={data} /><Lifecycle /><Stats />
    </Canvas>
  );
}
