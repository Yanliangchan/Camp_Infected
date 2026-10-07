import * as THREE from "three";
import {
  createCharacter,
  animateCharacter,
  setCharacterWeapon,
} from "./characters";
import { TutorialSim, points, objectives } from "./game/tutorialSim";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./tutorial.css";
import { buildDungeonRoom } from "./dungeonRoom";
import { addCheckpointDressing } from "./render/checkpointDressing";
import { updateAtmosphere } from "./render/atmosphere";
import { introduction } from "./game/checkpointLayout";
document.body.innerHTML = `<main id="operation"><canvas id="world" aria-label="Main Gate isometric tutorial"></canvas><header><a href="/">CI / RETURN TO CAMP</a><span>SECTOR 01 / MAIN GATE</span><button id="pause">Pause / Esc</button></header><section class="objective"><small>CHECKPOINT LOCKDOWN</small><h1 id="objective"></h1><p id="radio" role="status"></p></section><div id="prompt"></div><div id="waypoint"></div><div id="damage-flash"></div><div class="hud"><div><small>YOU / SAR 21</small><b id="health"></b><progress id="health-bar" max="100"></progress></div><div><small>STAMINA</small><progress id="stamina" max="100"></progress></div><div><small>AMMUNITION</small><b id="ammo"></b></div><div><small>FIELD DRESSING</small><b id="medkit"></b></div></div><aside class="controls">WASD / Move &nbsp; Shift / Sprint &nbsp; Mouse / Aim & fire &nbsp; R / Reload &nbsp; Space / Dodge &nbsp; E / Interact &nbsp; H / Heal &nbsp; M / Sector map &nbsp; Wheel / Zoom</aside><dialog id="menu"><h2 id="menu-title">Main Gate</h2><p id="menu-copy">Find another way into camp. Keep your distance, use cover, and recover supplies.</p><p>WASD to move · Mouse to aim and fire · E to interact<br>R to reload · H to heal · Space to dodge · Esc to pause</p><button id="ambient" aria-pressed="true">Ambient animation: on</button><button id="resume">Begin operation</button><button id="retry">Restart operation</button><a href="/">Return to landing page</a></dialog></main>`;
const canvas = document.querySelector<HTMLCanvasElement>("#world")!;
const menu = document.querySelector<HTMLDialogElement>("#menu")!;
let overview = false,
  zoomSpan = 6;
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
scene.background = new THREE.Color("#182923");
scene.add(new THREE.HemisphereLight(0xdce5d5, 0x526555, 0.8));
const sun = new THREE.DirectionalLight(0xffe7bc, 1.6);
sun.position.set(-12, 28, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {
  left: -35,
  right: 35,
  top: 25,
  bottom: -25,
  far: 90,
});
sun.shadow.normalBias = 0.02;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xc4d8ef, 0.5);
fill.position.set(18, 16, 28);
scene.add(fill);
const environment = buildDungeonRoom(scene);
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let ambientEnabled = !motionPreference.matches;
const ambientButton = document.querySelector<HTMLButtonElement>("#ambient")!;
function syncAmbient() {
  ambientButton.textContent = `Ambient animation: ${ambientEnabled ? "on" : "off"}`;
  ambientButton.setAttribute("aria-pressed", String(ambientEnabled));
  updateAtmosphere(environment, sim.time, ambientEnabled);
}
ambientButton.addEventListener("click", () => {
  ambientEnabled = !ambientEnabled;
  syncAmbient();
});
motionPreference.addEventListener("change", () => {
  ambientEnabled = !motionPreference.matches;
  syncAmbient();
});
syncAmbient();
addCheckpointDressing(scene);
// The gameplay slice now uses the approved detailed artwork, not a second blockout.
function casePart(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  color: number,
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.12 }),
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}
casePart(1.1, 0.42, 0.7, 5, 0.28, 5.1, 0x576b4c);
casePart(1.15, 0.06, 0.75, 5, 0.52, 5.1, 0x869075);
for (const x of [4.6, 5.4]) casePart(0.07, 0.09, 0.025, x, 0.4, 5.46, 0xb8b79e);
casePart(0.38, 0.012, 0.19, 5, 0.557, 5.1, 0xe2dbc5);
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
const player = createCharacter("player", "soldier");
setCharacterWeapon(player, "SAR 21");
scene.add(player);
const survivor = createCharacter("player", "soldier");
survivor.position.set(points.survivor.x, 0.12, points.survivor.z);
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
  const v = overview
    ? Math.max(26, (44 * h) / w)
    : innerWidth < 700
      ? 9
      : zoomSpan;
  camera.left = (-v * w) / h / 2;
  camera.right = (v * w) / h / 2;
  camera.top = v / 2;
  camera.bottom = -v / 2;
  camera.near = 0.1;
  camera.far = 150;
  camera.updateProjectionMatrix();
}
canvas.addEventListener(
  "wheel",
  (e) => {
    if (paused) return;
    e.preventDefault();
    zoomSpan = THREE.MathUtils.clamp(
      zoomSpan + Math.sign(e.deltaY) * 0.5,
      4,
      10,
    );
    resize();
  },
  { passive: false },
);
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
  if (e.code === "KeyM" && !menu.open) {
    overview = !overview;
    resize();
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
  updateAtmosphere(environment, sim.time, ambientEnabled);
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
  const target = overview
    ? new THREE.Vector3(13, 0.6, 3)
    : new THREE.Vector3(sim.x + 0.5, 0.6, sim.z - 1.2);
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
      ? introduction
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
        ambientEnabled,
        atmosphereTime: sim.time,
        fixtureLevels: environment.userData.ambientFixtures.map(
          (f: { light: THREE.PointLight }) => f.light.intensity,
        ),
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
