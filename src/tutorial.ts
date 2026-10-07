import * as THREE from "three";
import {
  createCharacter,
  animateCharacter,
  setCharacterWeapon,
} from "./characters";
import { TutorialSim, solids, points, objectives } from "./game/tutorialSim";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./tutorial.css";
document.body.innerHTML = `<main id="operation"><canvas id="world" aria-label="Main Gate isometric tutorial"></canvas><header><a href="/">CI / RETURN TO CAMP</a><span>SECTOR 01 / MAIN GATE</span><button id="pause">Pause / Esc</button></header><section class="objective"><small>CHECKPOINT LOCKDOWN</small><h1 id="objective"></h1><p id="radio" role="status"></p></section><div id="prompt"></div><div id="waypoint"></div><div id="damage-flash"></div><div class="hud"><div><small>YOU / SAR 21</small><b id="health"></b><progress id="health-bar" max="100"></progress></div><div><small>STAMINA</small><progress id="stamina" max="100"></progress></div><div><small>AMMUNITION</small><b id="ammo"></b></div><div><small>FIELD DRESSING</small><b id="medkit"></b></div></div><aside class="controls">WASD / Move &nbsp; Shift / Sprint &nbsp; Mouse / Aim & fire &nbsp; R / Reload &nbsp; Space / Dodge &nbsp; E / Interact &nbsp; H / Heal</aside><dialog id="menu"><h2 id="menu-title">Main Gate</h2><p id="menu-copy">Find another way into camp. Keep your distance, use cover, and recover supplies.</p><p>WASD to move · Mouse to aim and fire · E to interact<br>R to reload · H to heal · Space to dodge · Esc to pause</p><button id="resume">Begin operation</button><button id="retry">Restart operation</button><a href="/">Return to landing page</a></dialog></main>`;
const canvas = document.querySelector<HTMLCanvasElement>("#world")!;
const menu = document.querySelector<HTMLDialogElement>("#menu")!;
let sim = new TutorialSim(),
  paused = true;
let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch {
  document.querySelector("#menu-copy")!.textContent =
    "3D graphics could not start. Enable hardware acceleration and reload.";
  menu.showModal();
  throw new Error("WebGL unavailable");
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
const scene = new THREE.Scene();
scene.background = new THREE.Color("#a9c6ba");
const camera = new THREE.OrthographicCamera();
scene.add(new THREE.HemisphereLight(0xfff2d5, 0x698573, 2));
const sun = new THREE.DirectionalLight(0xffe4bf, 2.6);
sun.position.set(-14, 30, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {
  left: -25,
  right: 25,
  top: 25,
  bottom: -25,
  far: 80,
});
sun.shadow.normalBias = 0.03;
scene.add(sun);
const mats = new Map<string, THREE.MeshStandardMaterial>();
function mat(c: string) {
  if (!mats.has(c))
    mats.set(c, new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }));
  return mats.get(c)!;
}
function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  c: string,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}
box(38, 0.3, 30, 0, -0.23, 0, "#728e62");
const yard = box(30, 0.15, 22, 0, -0.04, 0, "#a5aea1");
box(6, 0.04, 22, 10, 0.05, 0, "#727e79");
const officeFloor = box(8, 0.05, 10, -8, 0.06, -5, "#d1d6c6");
const tileCanvas = document.createElement("canvas");
tileCanvas.width = tileCanvas.height = 256;
const tileCtx = tileCanvas.getContext("2d")!;
tileCtx.fillStyle = "#c3ccbb";
tileCtx.fillRect(0, 0, 256, 256);
tileCtx.strokeStyle = "#899b8a";
tileCtx.lineWidth = 2;
for (let i = 0; i <= 256; i += 64) {
  tileCtx.beginPath();
  tileCtx.moveTo(i, 0);
  tileCtx.lineTo(i, 256);
  tileCtx.moveTo(0, i);
  tileCtx.lineTo(256, i);
  tileCtx.stroke();
}
const tileMap = new THREE.CanvasTexture(tileCanvas);
tileMap.wrapS = tileMap.wrapT = THREE.RepeatWrapping;
tileMap.repeat.set(4, 5);
officeFloor.material = new THREE.MeshStandardMaterial({
  map: tileMap,
  roughness: 0.9,
});
for (let z = -10; z < 11; z += 2) box(0.12, 0.012, 1, 10, 0.085, z, "#e2dfbc");
for (let x = -14; x < -4; x += 1) {
  box(0.65, 0.01, 1.8, x, 0.055, 7, "#d9dccb");
}
for (const z of [-9, 9]) {
  box(29, 0.04, 0.18, 0, 0.055, z, "#d5d8bc");
}

for (const o of solids) {
  box(
    o.w,
    o.h,
    o.d,
    o.x,
    o.h / 2 + 0.07,
    o.z,
    o.kind === "wall"
      ? "#dfdfca"
      : o.kind === "barrier"
        ? "#65756b"
        : "#7b8966",
  );
  if (o.kind === "wall" && o.h > 2) {
    box(o.w + 0.02, 0.9, o.d + 0.02, o.x, 0.5, o.z, "#7f9483");
  }
  if (o.kind === "barrier")
    for (let x = -o.w / 2 + 0.25; x < o.w / 2; x += 0.55)
      box(0.3, 0.09, o.d + 0.03, o.x + x, o.h + 0.13, o.z, "#d9b862");
}
// Fictional perimeter: public-reference proportions, no real camp layout.
for (let x = -15; x <= 15; x += 2) {
  box(0.08, 2, 0.08, x, 1, -11.2, "#5a6c5c");
  const wire = box(1.95, 1.7, 0.04, x + 0.97, 1, -11.2, "#93a291");
  wire.material = new THREE.MeshStandardMaterial({
    color: "#617b69",
    wireframe: true,
  });
}
box(4, 0.15, 0.18, 10, 1.25, -8, "#ede7d0");
for (let x = 8; x < 12; x += 0.7) box(0.3, 0.17, 0.2, x, 1.25, -8, "#bd6450");
box(0.5, 1.4, 0.5, 8, 0.7, -8, "#546c5c");
for (const x of [-13, 14])
  for (const z of [-8, 8]) {
    box(0.25, 2.5, 0.25, x, 1.25, z, "#786447");
    const crown = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.4, 1),
      mat("#4f8356"),
    );
    crown.position.set(x, 3, z);
    crown.castShadow = true;
    scene.add(crown);
  }
box(2, 0.75, 0.8, -9, 0.45, -7.4, "#748776");
box(0.6, 0.35, 0.12, -9, 0.96, -7.4, "#364f48");
box(1.3, 0.45, 0.7, -7, 0.33, -2, "#55765a");
box(0.7, 0.04, 0.18, -7, 0.58, -2, "#dfd9b8");
// Small camp details stay beside circulation, with solid furniture registered above.
for (const z of [-6.8, -5.2]) {
  box(0.12, 0.5, 0.12, -10.4, 0.35, z, "#45554b");
  box(0.12, 0.5, 0.12, -9.6, 0.35, z, "#45554b");
}
box(0.65, 0.4, 0.12, -10, 1.05, -6.2, "#283e34");
box(0.3, 0.08, 0.2, -9.6, 0.93, -5.8, "#d4d1b4");
box(0.08, 1.3, 2.4, -11.8, 0.9, -6, "#809083");
for (let x = -11; x < -9; x += 0.65) {
  box(0.55, 0.15, 0.55, x, 0.5, -2, "#7b9988");
  box(0.55, 0.65, 0.1, x, 0.85, -2.3, "#7b9988");
}
for (const [x, z] of [
  [-2, 7],
  [5, 7],
  [12, 2],
]) {
  box(0.12, 3.8, 0.12, x, 1.9, z, "#536e5b");
  box(0.7, 0.13, 0.5, x, 3.8, z, "#dfdebd");
}
for (const [x, z] of [
  [4, 8],
  [7, 7],
  [13, -5],
]) {
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.6, 12),
    mat("#ce8051"),
  );
  cone.position.set(x, 0.35, z);
  scene.add(cone);
  box(0.5, 0.04, 0.5, x, 0.08, z, "#435d49");
}
const markers = new Map<string, THREE.Mesh>();
for (const [key, p] of Object.entries(points)) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.7, 0.82, 40),
    new THREE.MeshBasicMaterial({ color: 0xf6d58f, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(p.x, 0.16, p.z);
  scene.add(ring);
  markers.set(key, ring);
}
function sign(text: string, x: number, z: number) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 96;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#284b39";
  ctx.fillRect(0, 0, 512, 96);
  ctx.fillStyle = "#f1edcf";
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, 256, 62);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 0.56),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(c),
      side: THREE.DoubleSide,
    }),
  );
  m.position.set(x, 2.1, z);
  scene.add(m);
}
sign("PASS OFFICE", -8, -9.8);
sign("PEDESTRIAN GATE", 12, -10.8);
const player = createCharacter("player", "soldier");
setCharacterWeapon(player, "SAR 21");
scene.add(player);
const survivor = createCharacter("player", "soldier");
survivor.position.set(0, 0.12, 0);
survivor.rotation.z = -Math.PI / 2;
scene.add(survivor);
let actors: THREE.Group[] = [];
const keys = new Set<string>();
let firing = false,
  aimX = 0,
  aimZ = 0;
const mouse = new THREE.Vector2(),
  ray = new THREE.Raycaster(),
  plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
  hit = new THREE.Vector3();
function resize() {
  const w = innerWidth,
    h = innerHeight;
  renderer.setSize(w, h);
  const v = innerWidth < 700 ? 14 : 10;
  camera.left = (-v * w) / h / 2;
  camera.right = (v * w) / h / 2;
  camera.top = v / 2;
  camera.bottom = -v / 2;
  camera.near = 0.1;
  camera.far = 150;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();
function openMenu(title: string, copy: string) {
  paused = true;
  keys.clear();
  firing = false;
  document.querySelector("#menu-title")!.textContent = title;
  document.querySelector("#menu-copy")!.textContent = copy;
  document.querySelector<HTMLButtonElement>("#resume")!.hidden =
    sim.status !== "playing";
  if (!menu.open) menu.showModal();
}
menu.addEventListener("cancel", (e) => {
  e.preventDefault();
  if (sim.status === "playing") {
    menu.close();
    paused = false;
  }
});
document.querySelector<HTMLButtonElement>("#resume")!.onclick = () => {
  menu.close();
  paused = false;
};
document.querySelector<HTMLButtonElement>("#retry")!.onclick = () => {
  for (const a of actors) scene.remove(a);
  actors = [];
  sim = new TutorialSim();
  menu.close();
  paused = false;
};
document.querySelector<HTMLButtonElement>("#pause")!.onclick = () =>
  openMenu(
    "Operation paused",
    "Take a breath. The operation resumes where you left off.",
  );
addEventListener("keydown", (e) => {
  if (e.code === "Escape") {
    e.preventDefault();
    if (menu.open && sim.status === "playing") {
      menu.close();
      paused = false;
    } else if (!menu.open)
      openMenu(
        "Operation paused",
        "Take a breath. The operation resumes where you left off.",
      );
    return;
  }
  if (paused || e.repeat) return;
  keys.add(e.code);
  if (["Space", "KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code))
    e.preventDefault();
  if (e.code === "KeyE") sim.interact();
  if (e.code === "KeyR") sim.startReload();
  if (e.code === "Space") sim.evade();
  if (e.code === "KeyH") sim.heal();
});
addEventListener("keyup", (e) => keys.delete(e.code));
addEventListener("blur", () => {
  if (!paused && sim.status === "playing")
    openMenu("Operation paused", "Focus returned safely. Resume when ready.");
});
canvas.addEventListener("pointermove", (e) => {
  mouse.set(
    (e.clientX / innerWidth) * 2 - 1,
    (-e.clientY / innerHeight) * 2 + 1,
  );
});
canvas.addEventListener("pointerdown", (e) => {
  if (e.button === 0 && !paused) firing = true;
});
addEventListener("pointerup", () => (firing = false));
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
const tracer = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(),
    new THREE.Vector3(),
  ]),
  new THREE.LineBasicMaterial({ color: 0xffe4a3 }),
);
scene.add(tracer);
let flash = 0,
  last = performance.now(),
  lastHealth = 100,
  damageFlash = 0;
const health = document.querySelector("#health")!,
  ammo = document.querySelector("#ammo")!,
  objective = document.querySelector("#objective")!,
  radio = document.querySelector("#radio")!,
  prompt = document.querySelector("#prompt")!;
function frame(now: number) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  const dx = Number(keys.has("KeyD")) - Number(keys.has("KeyA")),
    dy = Number(keys.has("KeyW")) - Number(keys.has("KeyS"));
  if (!paused) {
    sim.tick(
      dt,
      (dx - dy) * 0.707,
      (-dx - dy) * 0.707,
      keys.has("ShiftLeft") || keys.has("ShiftRight"),
    );
    ray.setFromCamera(mouse, camera);
    if (ray.ray.intersectPlane(plane, hit)) {
      aimX = hit.x;
      aimZ = hit.z;
    }
    if (firing && sim.shoot(aimX, aimZ)) {
      const attr = tracer.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      attr.setXYZ(0, sim.x, 0.85, sim.z);
      attr.setXYZ(1, aimX, 0.85, aimZ);
      attr.needsUpdate = true;
      flash = 0.06;
    }
    if (sim.status !== "playing")
      openMenu(
        sim.status === "won" ? "Main Gate secured" : "Operation failed",
        sim.status === "won"
          ? `CPL Tan is safe. ${sim.kills} contacts cleared. ${Math.round(sim.time)} seconds in the field. This concludes the first tutorial slice.`
          : "You were overrun. Use cover to break line of sight, reload before moving, and apply your field dressing with H.",
      );
  }
  player.position.set(sim.x, 0.12, sim.z);
  player.rotation.y = Math.atan2(aimX - sim.x, aimZ - sim.z);
  animateCharacter(
    player,
    !paused && (dx !== 0 || dy !== 0),
    sim.time,
    keys.has("ShiftLeft") ? "sprint" : "walk",
  );
  while (actors.length < sim.enemies.length) {
    const a = createCharacter("infected", "cadet");
    scene.add(a);
    actors.push(a);
  }
  sim.enemies.forEach((e, i) => {
    const a = actors[i];
    a.visible = true;
    a.rotation.z = e.health <= 0 ? Math.PI / 2 : 0;
    a.position.set(e.x, 0.12, e.z);
    a.rotation.y = Math.atan2(sim.x - e.x, sim.z - e.z);
    animateCharacter(
      a,
      !paused && e.health > 0,
      sim.time,
      e.health > 0 ? "walk" : "idle",
    );
  });
  survivor.rotation.z = sim.step >= 5 ? 0 : -Math.PI / 2;
  const target = new THREE.Vector3(sim.x, 0.6, sim.z);
  camera.position.copy(target).add(new THREE.Vector3(24, 26.5, 24));
  camera.lookAt(target);
  camera.updateMatrixWorld();
  flash = Math.max(0, flash - dt);
  tracer.visible = flash > 0;
  for (const [key, m] of markers)
    m.visible =
      (key === "supply" && sim.step === 1) ||
      (key === "survivor" && sim.step === 4) ||
      (key === "console" && sim.step === 5) ||
      (key === "exit" && sim.step === 6);
  const point =
    sim.step === 0
      ? { x: -5, z: 2 }
      : sim.step === 1
        ? points.supply
        : sim.step === 4
          ? points.survivor
          : sim.step === 5
            ? points.console
            : sim.step === 6
              ? points.exit
              : null;
  const wp = document.querySelector<HTMLElement>("#waypoint")!;
  if (point) {
    const projected = new THREE.Vector3(point.x, 0.6, point.z).project(camera);
    wp.textContent = `${sim.step === 0 ? "PASS OFFICE" : sim.step === 1 ? "SUPPLIES" : sim.step === 4 ? "CPL TAN" : sim.step === 5 ? "GATE CONTROL" : "EXIT"} · ${Math.round(Math.hypot(point.x - sim.x, point.z - sim.z))}m`;
    wp.style.left =
      Math.max(
        180,
        Math.min(innerWidth - 180, ((projected.x + 1) * innerWidth) / 2),
      ) + "px";
    wp.style.top =
      Math.max(
        230,
        Math.min(innerHeight - 200, ((-projected.y + 1) * innerHeight) / 2),
      ) + "px";
    wp.hidden = false;
  } else wp.hidden = true;
  if (sim.health < lastHealth) damageFlash = 0.35;
  lastHealth = sim.health;
  damageFlash = Math.max(0, damageFlash - dt);
  document.querySelector<HTMLElement>("#damage-flash")!.style.opacity =
    String(damageFlash);
  objective.textContent = objectives[sim.step];
  radio.textContent = sim.message;
  health.textContent = `${sim.health} / 100`;
  document.querySelector<HTMLProgressElement>("#health-bar")!.value =
    sim.health;
  document.querySelector<HTMLProgressElement>("#stamina")!.value = sim.stamina;
  ammo.textContent =
    sim.reload > 0 ? "RELOADING" : `${sim.ammo} / ${sim.reserve}`;
  document.querySelector("#medkit")!.textContent = String(sim.medkits);
  prompt.textContent = sim.prompt;
  renderer.render(scene, camera);
}
openMenu(
  "Main Gate / Solo tutorial",
  "The main gate is sealed. Check the pass office, recover supplies, and find another way into camp.",
);
requestAnimationFrame(frame);
// Read-only telemetry for browser acceptance checks.
Object.assign(window, {
  campTutorial: {
    get state() {
      return {
        x: sim.x,
        z: sim.z,
        step: sim.step,
        status: sim.status,
        health: sim.health,
        ammo: sim.ammo,
        kills: sim.kills,
      };
    },
  },
});
