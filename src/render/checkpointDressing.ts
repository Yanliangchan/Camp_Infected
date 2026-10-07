import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
/** Gameplay-only dressing; blocking objects are registered in checkpointLayout. */
export function addCheckpointDressing(scene: THREE.Scene) {
  const parts: THREE.BufferGeometry[] = [];
  function box(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    color: number,
    r = 0.01,
    angle = 0,
  ) {
    const indexed = new RoundedBoxGeometry(
      w,
      h,
      d,
      1,
      Math.min(r, w / 3, h / 3, d / 3),
    );
    const g = indexed.toNonIndexed();
    indexed.dispose();
    g.deleteAttribute("uv");
    g.rotateY(angle);
    g.translate(x, y, z);
    const c = new THREE.Color(color);
    const p = g.getAttribute("position"),
      colors = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const ao = 0.8 + 0.2 * Math.min(1, Math.max(0, p.getY(i)) / 0.9);
      colors.set([c.r * ao, c.g * ao, c.b * ao], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    parts.push(g);
  }
  function crate(x: number, z: number, y: number) {
    box(0.86, 0.42, 0.64, x, y + 0.21, z, 0x69775b, 0.025);
    box(0.91, 0.05, 0.69, x, y + 0.445, z, 0x8a9274);
    for (const dx of [-0.32, 0.32]) {
      box(0.04, 0.39, 0.025, x + dx, y + 0.22, z + 0.33, 0xa9af97);
      box(0.055, 0.075, 0.035, x + dx, y + 0.33, z + 0.355, 0x424f41);
    }
    for (const dz of [-0.33, 0.33])
      box(0.22, 0.06, 0.03, x, y + 0.24, z + dz, 0x424f41);
    box(0.24, 0.12, 0.012, x, y + 0.18, z + 0.338, 0xd0cfb5);
  }
  // A grounded, substantial supply pallet gives the combat floor recognisable cover.
  for (let z = 2.35; z < 3.8; z += 0.18)
    box(1.95, 0.05, 0.14, 10.2, 0.14, z, 0x9f9371);
  for (const x of [9.45, 10.2, 10.95])
    box(0.13, 0.13, 1.55, x, 0.06, 3.05, 0x73684d);
  for (const x of [9.72, 10.67]) {
    crate(x, 3.05, 0.17);
    crate(x, 3.05, 0.66);
  }
  crate(10.2, 3.05, 1.15);
  // Field dressings, a radio and discarded paperwork tell a small camp story.
  box(0.48, 0.22, 0.35, 20.4, 0.17, 2.6, 0x73845b, 0.09);
  box(0.24, 0.014, 0.14, 20.4, 0.291, 2.6, 0xcacdb4);
  box(0.13, 0.25, 0.07, 20.1, 0.18, 2.2, 0x3c4f43);
  box(0.013, 0.22, 0.013, 20.13, 0.39, 2.2, 0x677b64);
  for (let i = 0; i < 9; i++)
    box(
      0.14,
      0.004,
      0.22,
      8.5 + Math.sin(i * 2) * 0.9,
      0.064,
      0.5 + Math.cos(i) * 0.8,
      0xbfc3a9,
      0.001,
      i * 0.8,
    );
  for (let i = 0; i < 7; i++)
    box(
      0.045,
      0.024,
      0.014,
      7.3 + Math.sin(i * 2) * 0.3,
      0.066,
      3 + Math.cos(i) * 0.5,
      0xb79d63,
      0.003,
      i * 0.6,
    );
  // Small lane markings define screening and recovery without floating loot icons.
  for (const x of [-1.5, 0.1])
    for (let z = 6.2; z < 10.5; z += 0.45)
      box(0.055, 0.006, 0.25, x, 0.062, z, 0xc4b779, 0.001);
  for (let x = 14.5; x < 22.5; x += 0.6)
    box(0.3, 0.006, 0.055, x, 0.062, 0.95, 0x97ac9b, 0.001);
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((g) => g.dispose());
  const mesh = new THREE.Mesh(
    merged,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86 }),
  );
  mesh.name = "checkpoint-gameplay-dressing";
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  // A restrained drag trail: environmental cue, with no raised collision.
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 256, 128);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = `rgba(92,47,36,${0.08 + i * 0.006})`;
    ctx.beginPath();
    ctx.ellipse(
      25 + i * 29,
      64 + Math.sin(i) * 8,
      21,
      7 + i * 0.2,
      0.12,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  const map = new THREE.CanvasTexture(c);
  const trail = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 0.7),
    new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      depthWrite: false,
      opacity: 0.7,
    }),
  );
  trail.rotation.x = -Math.PI / 2;
  trail.rotation.z = -0.4;
  trail.position.set(18.8, 0.064, 2.2);
  scene.add(trail);
}
