import { describe, it, expect } from "vitest";
import { TutorialSim, points, solids } from "../src/game/tutorialSim";
import { start, introduction } from "../src/game/checkpointLayout";
describe("Main Gate operation", () => {
  it("prevents diagonal movement boosting and passing through cover", () => {
    const s = new TutorialSim(),
      a = new TutorialSim();
    s.tick(0.05, 1, 1);
    a.tick(0.05, 1, 0);
    expect(Math.hypot(s.x - start.x, s.z - start.z)).toBeCloseTo(a.x - start.x);
    const o = solids.find((o) => o.kind === "barrier")!;
    s.x = o.x;
    s.z = o.z + 1;
    s.tick(0.05, 0, -1);
    expect(s.z).toBeGreaterThan(o.z + o.d / 2 + 0.3);
  });
  it("requires nearby interactions and blocks skipped objectives", () => {
    const s = new TutorialSim();
    s.interact();
    expect(s.step).toBe(0);
    s.x = introduction.x;
    s.z = introduction.z;
    s.tick(0.01);
    expect(s.step).toBe(1);
    s.interact();
    expect(s.ammo).toBe(0);
    s.x = points.supply.x;
    s.z = points.supply.z;
    s.interact();
    expect(s.step).toBe(2);
    expect(s.enemies).toHaveLength(3);
    s.x = points.exit.x;
    s.z = points.exit.z;
    s.interact();
    expect(s.status).toBe("playing");
  });
  it("cover stops shots and closest target takes damage", () => {
    const s = new TutorialSim();
    s.ammo = 30;
    s.x = -3;
    s.z = 1;
    s.enemies = [{ x: -3, z: -3, health: 60, cooldown: 0 }];
    s.shoot(-3, -3);
    expect(s.enemies[0].health).toBe(60);
    s.x = 6;
    s.z = 8;
    s.cooldown = 0;
    s.enemies = [
      { x: 6, z: 6, health: 60, cooldown: 0 },
      { x: 6, z: 4, health: 60, cooldown: 0 },
    ];
    s.shoot(6, 0);
    expect(s.enemies.map((e) => e.health)).toEqual([30, 60]);
  });
  it("reload transfers reserve exactly once and cannot invent ammo", () => {
    const s = new TutorialSim();
    s.ammo = 4;
    s.reserve = 10;
    s.startReload();
    for (let i = 0; i < 40; i++) s.tick(0.05);
    expect(s.ammo).toBe(14);
    expect(s.reserve).toBe(0);
    s.startReload();
    expect(s.reload).toBe(0);
  });
  it("finishes an operation through ordered objectives", () => {
    const s = new TutorialSim();
    s.x = introduction.x;
    s.z = introduction.z;
    s.tick(0.01);
    Object.assign(s, points.supply);
    s.interact();
    s.enemies.forEach((e) => (e.health = 0));
    s.tick(0.01);
    expect(s.step).toBe(3);
    s.ammo = 20;
    s.startReload();
    for (let i = 0; i < 35; i++) s.tick(0.05);
    expect(s.step).toBe(4);
    Object.assign(s, points.survivor);
    s.interact();
    expect(s.step).toBe(5);
    Object.assign(s, points.console);
    s.interact();
    expect(s.step).toBe(6);
    Object.assign(s, points.exit);
    s.interact();
    expect(s.status).toBe("won");
  });
  it("freezes completed operations and consumes finite medical supplies", () => {
    const s = new TutorialSim();
    s.health = 20;
    s.heal();
    expect(s.health).toBe(70);
    s.heal();
    expect(s.health).toBe(70);
    s.status = "lost";
    s.tick(0.05, 1, 0);
    s.ammo = 10;
    expect(s.shoot(0, 0)).toBe(false);
    expect(s.x).toBe(start.x);
  });
});
it("can physically walk and fight through the complete tutorial without teleporting", () => {
  const s = new TutorialSim();
  let ticks = 0;
  while (s.status === "playing" && ticks++ < 12000) {
    const target =
      s.step === 0
        ? introduction
        : s.step === 1
          ? points.supply
          : s.step === 4
            ? points.survivor
            : s.step === 5
              ? points.console
              : s.step === 6
                ? points.exit
                : null;
    let dx = 0,
      dz = 0;
    if (target) {
      const distance = Math.hypot(target.x - s.x, target.z - s.z);
      if (distance > 1.2) {
        const n = s.canWalkLine(s.x, s.z, target.x, target.z)
          ? target
          : s.route(s.x, s.z, target.x, target.z);
        if (n) {
          dx = n.x - s.x;
          dz = n.z - s.z;
        }
      } else s.interact();
    }
    if (s.step === 2) {
      const e = s.enemies.find(
        (e) => e.health > 0 && s.lineClear(s.x, s.z, e.x, e.z),
      );
      if (e) s.shoot(e.x, e.z);
      if (s.ammo === 0) s.startReload();
    }
    if (s.step === 3) s.startReload();
    if (s.health < 50) s.heal();
    s.tick(0.05, dx, dz);
  }
  expect({ status: s.status, step: s.step, kills: s.kills }).toEqual({
    status: "won",
    step: 6,
    kills: 3,
  });
});
it("keeps the approved doorways and interaction positions traversable", () => {
  const s = new TutorialSim();
  for (const p of Object.values(points))
    expect(s.blocked(p.x, p.z), JSON.stringify(p)).toBe(false);
  for (const [x, z] of [
    [13, 0],
    [24, 0],
    [24, 5.5],
    [-0.7, 8.6],
  ])
    expect(s.blocked(x, z), `door ${x},${z}`).toBe(false);
  expect(s.blocked(-3, -1.1)).toBe(true);
  expect(s.blocked(2, 8.5)).toBe(true);
  expect(s.blocked(17.7, 5.75)).toBe(true);
  expect(s.blocked(26.4, 2.15)).toBe(true);
});
it("distinguishes a clear shot from a route wide enough for the player", () => {
  const s = new TutorialSim();
  expect(s.lineClear(1, 6, 5, 6)).toBe(true);
  expect(s.canWalkLine(1, 6, 5, 6)).toBe(false);
});
