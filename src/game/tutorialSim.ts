export type Rect = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  kind: "wall" | "barrier" | "crate";
};
// Collision and visible geometry use the same authored layout.
export const solids: Rect[] = [
  { x: -12, z: -5, w: 0.3, d: 10, h: 2.6, kind: "wall" },
  { x: -8, z: -10, w: 8, d: 0.3, h: 2.6, kind: "wall" },
  { x: -4, z: -7, w: 0.3, d: 6, h: 1.1, kind: "wall" },
  { x: -4, z: 0, w: 0.3, d: 2, h: 1.1, kind: "wall" },
  { x: -8, z: 0, w: 8, d: 0.3, h: 0.5, kind: "wall" },
  { x: 1, z: 4, w: 5, d: 1, h: 1.1, kind: "barrier" },
  { x: 6, z: -2, w: 1, d: 5, h: 1.1, kind: "barrier" },
  { x: -10, z: -6, w: 1.2, d: 2.5, h: 0.8, kind: "crate" },
  { x: -10, z: -2, w: 2.5, d: 0.6, h: 0.5, kind: "crate" },
  { x: 0, z: -5, w: 2, d: 2, h: 1.4, kind: "crate" },
  { x: 10, z: 5, w: 3, d: 2, h: 1.2, kind: "crate" },
];
export const points = {
  supply: { x: -7, z: -2 },
  survivor: { x: 0, z: 0 },
  console: { x: -9, z: -7 },
  exit: { x: 12, z: -8 },
};
export const objectives = [
  "Move towards the pass office",
  "Recover ammunition at the supply case",
  "Clear the access route · use cover",
  "Reload your SAR 21",
  "Stabilise CPL Tan",
  "Restore pedestrian gate access",
  "Reach the pedestrian gate",
];
export type Enemy = {
  x: number;
  z: number;
  health: number;
  cooldown: number;
  navCooldown?: number;
  navX?: number;
  navZ?: number;
};
export class TutorialSim {
  x = -9;
  z = 8;
  health = 100;
  ammo = 0;
  reserve = 0;
  step = 0;
  time = 0;
  reload = 0;
  cooldown = 0;
  dodge = 0;
  stamina = 100;
  medkits = 1;
  status: "playing" | "won" | "lost" = "playing";
  message = "Radio: Main gate is sealed. Check the pass office.";
  enemies: Enemy[] = [];
  kills = 0;
  shots = 0;
  damageTaken = 0;
  blocked(x: number, z: number, r = 0.3) {
    return (
      x < -15 + r ||
      x > 15 - r ||
      z < -11 + r ||
      z > 11 - r ||
      solids.some(
        (o) =>
          x > o.x - o.w / 2 - r &&
          x < o.x + o.w / 2 + r &&
          z > o.z - o.d / 2 - r &&
          z < o.z + o.d / 2 + r,
      )
    );
  }
  lineClear(ax: number, az: number, bx: number, bz: number) {
    const n = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.15);
    for (let i = 1; i <= n; i++)
      if (this.blocked(ax + ((bx - ax) * i) / n, az + ((bz - az) * i) / n, 0))
        return false;
    return true;
  }
  route(ax: number, az: number, bx: number, bz: number) {
    const start = [Math.round(ax), Math.round(az)],
      goal = [Math.round(bx), Math.round(bz)];
    const id = (x: number, z: number) => x + "," + z;
    const queue = [start],
      seen = new Map<string, number>();
    seen.set(id(...(start as [number, number])), -1);
    let end = -1;
    for (let i = 0; i < queue.length; i++) {
      const [x, z] = queue[i];
      if (Math.hypot(x - goal[0], z - goal[1]) < 1) {
        end = i;
        break;
      }
      for (const [dx, dz] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx,
          nz = z + dz,
          k = id(nx, nz);
        if (!seen.has(k) && !this.blocked(nx, nz, 0.4)) {
          seen.set(k, i);
          queue.push([nx, nz]);
        }
      }
    }
    if (end < 0) return null;
    while ((seen.get(id(...(queue[end] as [number, number]))) ?? -1) > 0)
      end = seen.get(id(...(queue[end] as [number, number])))!;
    return { x: queue[end][0], z: queue[end][1] };
  }
  move(dx: number, dz: number) {
    if (!this.blocked(this.x + dx, this.z)) this.x += dx;
    if (!this.blocked(this.x, this.z + dz)) this.z += dz;
  }
  tick(dt: number, dx = 0, dz = 0, sprint = false) {
    if (this.status !== "playing") return;
    dt = Math.min(Math.max(dt, 0), 0.05);
    this.time += dt;
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.dodge = Math.max(0, this.dodge - dt);
    const n = Math.hypot(dx, dz);
    const fast = sprint && this.stamina > 0 && n > 0;
    const speed = this.dodge > 0 ? 7 : fast ? 4.5 : 2.8;
    if (n > 0) this.move((dx / n) * speed * dt, (dz / n) * speed * dt);
    this.stamina = Math.max(
      0,
      Math.min(100, this.stamina + (fast ? -22 : 14) * dt),
    );
    if (this.step === 0 && Math.hypot(this.x + 5, this.z - 2) < 3) {
      this.step = 1;
      this.message =
        "Radio: Supply case inside the pass office. Press E nearby.";
    }
    if (this.reload > 0) {
      this.reload = Math.max(0, this.reload - dt);
      if (this.reload === 0) {
        const amount = Math.min(30 - this.ammo, this.reserve);
        this.ammo += amount;
        this.reserve -= amount;
        if (this.step === 3) this.step = 4;
      }
    }
    for (const e of this.enemies) {
      if (e.health <= 0) continue;
      e.cooldown = Math.max(0, e.cooldown - dt);
      const ex = this.x - e.x,
        ez = this.z - e.z,
        dist = Math.hypot(ex, ez);
      if (dist < 0.85) {
        if (e.cooldown === 0 && this.dodge === 0) {
          this.health = Math.max(0, this.health - 12);
          this.damageTaken += 12;
          e.cooldown = 1;
        }
      } else if (dist < 24) {
        const clear = this.lineClear(e.x, e.z, this.x, this.z);
        e.navCooldown = Math.max(0, (e.navCooldown ?? 0) - dt);
        if (!clear && e.navCooldown === 0) {
          const waypoint = this.route(e.x, e.z, this.x, this.z);
          e.navX = waypoint?.x;
          e.navZ = waypoint?.z;
          e.navCooldown = 0.35;
        }
        const node = clear
          ? { x: this.x, z: this.z }
          : e.navX === undefined || e.navZ === undefined
            ? null
            : { x: e.navX, z: e.navZ };
        if (!node) continue;
        const vx = node.x - e.x,
          vz = node.z - e.z,
          l = Math.hypot(vx, vz) || 1;
        const mx = (vx / l) * 1.25 * dt,
          mz = (vz / l) * 1.25 * dt;
        if (!this.blocked(e.x + mx, e.z)) e.x += mx;
        if (!this.blocked(e.x, e.z + mz)) e.z += mz;
      }
    }
    if (this.step === 2 && this.enemies.every((e) => e.health <= 0)) {
      this.step = 3;
      this.message = "Route clear. Reload before moving on. Press R.";
    }
    if (this.health <= 0) this.status = "lost";
  }
  shoot(tx: number, tz: number) {
    if (
      this.status !== "playing" ||
      this.cooldown > 0 ||
      this.reload > 0 ||
      this.ammo <= 0
    )
      return false;
    const len = Math.hypot(tx - this.x, tz - this.z);
    if (len < 0.01) return false;
    this.ammo--;
    this.shots++;
    this.cooldown = 0.18;
    const dx = (tx - this.x) / len,
      dz = (tz - this.z) / len;
    const targets = this.enemies
      .filter((e) => e.health > 0)
      .map((e) => ({ e, t: (e.x - this.x) * dx + (e.z - this.z) * dz }))
      .filter(
        (v) =>
          v.t > 0 &&
          v.t < 14 &&
          Math.hypot(v.e.x - this.x - dx * v.t, v.e.z - this.z - dz * v.t) <
            0.55,
      )
      .sort((a, b) => a.t - b.t);
    const hit = targets[0];
    if (hit && this.lineClear(this.x, this.z, hit.e.x, hit.e.z)) {
      hit.e.health -= 30;
      if (hit.e.health <= 0) this.kills++;
    }
    return true;
  }
  startReload() {
    if (
      this.status === "playing" &&
      this.ammo < 30 &&
      this.reserve > 0 &&
      this.reload === 0
    )
      this.reload = 1.4;
  }
  evade() {
    if (this.status === "playing" && this.dodge === 0 && this.stamina >= 30) {
      this.stamina -= 30;
      this.dodge = 0.35;
    }
  }
  heal() {
    if (this.status === "playing" && this.health < 100 && this.medkits > 0) {
      this.medkits--;
      this.health = Math.min(100, this.health + 50);
      this.message = "Field dressing applied.";
    }
  }
  interact() {
    if (this.status !== "playing") return;
    const near = (p: { x: number; z: number }) =>
      Math.hypot(this.x - p.x, this.z - p.z) < 1.6 &&
      this.lineClear(this.x, this.z, p.x, p.z);
    if (this.step === 1 && near(points.supply)) {
      this.ammo = 30;
      this.reserve = 90;
      this.step = 2;
      this.enemies = [
        { x: 2, z: 1, health: 60, cooldown: 0 },
        { x: 4, z: -6, health: 60, cooldown: 0 },
        { x: 10, z: -6, health: 60, cooldown: 0 },
      ];
      this.message =
        "Radio: Three contacts. Use the barriers. Do not get surrounded.";
    } else if (this.step === 4 && near(points.survivor)) {
      this.step = 5;
      this.message =
        "CPL Tan: The gate controls are in the security office. I can make it from here.";
    } else if (this.step === 5 && near(points.console)) {
      this.step = 6;
      this.message = "Pedestrian gate unlocked. Regroup and get out.";
    } else if (this.step === 6 && near(points.exit)) {
      this.status = "won";
      this.message = "Main Gate secured. Tutorial complete.";
    }
  }
  get prompt() {
    const key =
      this.step === 1
        ? "supply"
        : this.step === 4
          ? "survivor"
          : this.step === 5
            ? "console"
            : this.step === 6
              ? "exit"
              : null;
    if (!key) return "";
    const p = points[key];
    return Math.hypot(this.x - p.x, this.z - p.z) < 1.6
      ? "E · " +
          {
            supply: "Recover supplies",
            survivor: "Stabilise CPL Tan",
            console: "Restore gate access",
            exit: "Leave the checkpoint",
          }[key]
      : "";
  }
}
