import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { CAMP_PALETTE as P } from "./campPalette";
import { solids } from "../game/checkpointLayout";

/** Flat, authored surface zones: no new furniture or changes to physical circulation. */
export function addRoomSurfaces(room: THREE.Group) {
  const group = new THREE.Group();
  group.name = "guardhouse-surface-direction";
  room.add(group);
  const texture = (draw: (c: CanvasRenderingContext2D) => void, size = 512) => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    draw(c.getContext("2d")!);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  function floor(
    w: number,
    d: number,
    x: number,
    z: number,
    color: string,
    tiles: boolean,
    y = 0.037,
  ) {
    const map = texture((c) => {
      c.fillStyle = color;
      c.fillRect(0, 0, 512, 512);
      // Repeatable terrazzo chips; broad tiles read at play zoom without a fine grid covering everything.
      let seed = 73;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      for (let i = 0; i < 2200; i++) {
        c.fillStyle = i % 2 ? "rgba(255,255,255,.12)" : "rgba(29,43,46,.08)";
        c.fillRect(rand() * 512, rand() * 512, 1 + rand() * 2, 1 + rand() * 2);
      }
      if (tiles) {
        c.strokeStyle = "rgba(53,61,61,.17)";
        c.lineWidth = 1.5;
        for (let i = 0; i <= 512; i += 128) {
          c.beginPath();
          c.moveTo(i, 0);
          c.lineTo(i, 512);
          c.moveTo(0, i);
          c.lineTo(512, i);
          c.stroke();
        }
      }
    });
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(w / 3.2, d / 3.2);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshStandardMaterial({ map, roughness: 0.9 }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  floor(19.72, 15.72, 3, 3, P.publicFloor, true);
  floor(10.72, 15.72, 18.5, 3, P.restFloor, true);
  floor(8.72, 9.72, 28.5, 6, P.bunkFloor, false);
  floor(8.72, 5.72, 28.5, -2, P.washroomFloor, true);
  // Public-to-staff transitions and screening island are floor finishes, not floating decoration.
  floor(6.1, 4, -3.65, -2.8, P.officeFloor, false, 0.041);
  floor(5.6, 4.55, 0.8, 8.5, P.screeningFloor, false, 0.042);
  const markings: THREE.BufferGeometry[] = [];
  const stripe = (w: number, d: number, x: number, z: number) => {
    const g = new THREE.PlaneGeometry(w, d);
    g.rotateX(-Math.PI / 2);
    g.translate(x, 0.046, z);
    markings.push(g);
  };
  stripe(6.1, 0.06, -3.65, -0.8);
  stripe(0.06, 4, -0.6, -2.8);
  for (const x of [-2, 3.6]) stripe(0.065, 4.55, x, 8.5);
  // A continuous staff circulation band terminates at the actual door openings.
  stripe(10.8, 0.055, 18.5, 0.48);
  stripe(8.75, 0.055, 28.5, 4.22);
  stripe(8.75, 0.055, 28.5, 6.78);
  const paint = new THREE.Mesh(
    mergeGeometries(markings, false)!,
    new THREE.MeshStandardMaterial({ color: 0xd9c89e, roughness: 1 }),
  );
  markings.forEach((g) => g.dispose());
  paint.receiveShadow = true;
  group.add(paint);
  // Shared low-cost contact shading derived from existing solid footprints, avoiding stale duplicate positions.
  const radial = texture((c) => {
    const g = c.createRadialGradient(256, 256, 25, 256, 256, 256);
    g.addColorStop(0, "rgba(255,255,255,.8)");
    g.addColorStop(0.6, "rgba(255,255,255,.38)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 512);
  }, 512);
  const shadows: THREE.BufferGeometry[] = [];
  for (const s of solids) {
    if (
      s.kind === "wall" ||
      s.id.startsWith("detector") ||
      s.id === "turnstile" ||
      s.id === "supply-pallet" ||
      s.id === "supply-case"
    )
      continue;
    const g = new THREE.PlaneGeometry(s.w + 0.75, s.d + 0.65);
    g.rotateX(-Math.PI / 2);
    g.translate(s.x, 0.047, s.z);
    shadows.push(g);
  }
  const grounding = new THREE.Mesh(
    mergeGeometries(shadows, false)!,
    new THREE.MeshBasicMaterial({
      map: radial,
      color: P.shadow,
      transparent: true,
      opacity: 0.27,
      depthWrite: false,
    }),
  );
  shadows.forEach((g) => g.dispose());
  grounding.name = "guardhouse-contact-shading";
  group.add(grounding);
}
