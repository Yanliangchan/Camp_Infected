/** Metres, matching the approved dungeonRoom/passOffice/guardRest procedural art. */
export type Rect = {
  id: string;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  kind: "wall" | "barrier" | "crate";
};
const solid = (
  id: string,
  x: number,
  z: number,
  w: number,
  d: number,
  h: number,
  kind: Rect["kind"] = "crate",
): Rect => ({ id, x, z, w, d, h, kind });
export const bounds = { left: -7, right: 33, back: -5, front: 11 };
export const start = { x: -0.7, z: 10.3 };
export const introduction = { x: -0.7, z: 6.3 };
export const points = {
  supply: { x: 5, z: 6 },
  survivor: { x: 19.8, z: 2 },
  console: { x: 0.4, z: -3.8 },
  exit: { x: 4.75, z: -3.7 },
};
export const solids: Rect[] = [
  solid("west-wall", -7, 3, 0.26, 16, 3, "wall"),
  solid("back-wall", 13, -5, 40, 0.26, 3, "wall"),
  solid("front-west", -5, 11, 4, 0.23, 0.48, "wall"),
  solid("front-main", 6.8, 11, 12.4, 0.23, 0.48, "wall"),
  solid("front-rest", 23, 11, 20, 0.23, 0.48, "wall"),
  solid("east-wall", 33, 3, 0.23, 16, 1.1, "wall"),
  solid("rest-partition-back", 13, -2.8, 0.23, 4.4, 0.7, "wall"),
  solid("rest-partition-front", 13, 5.8, 0.23, 10.4, 0.7, "wall"),
  solid("bunk-partition-back", 24, -2.8, 0.18, 4.4, 0.72, "wall"),
  solid("bunk-partition-middle", 24, 2.7375, 0.18, 4.275, 0.72, "wall"),
  solid("bunk-partition-front", 24, 8.5625, 0.18, 4.875, 0.72, "wall"),
  solid("washroom-divider", 28.45, 1, 8.9, 0.18, 0.72, "wall"),
  solid("pass-counter", -3, -1.1, 5, 0.75, 1.05, "barrier"),
  solid("staff-desk", -4, -4.24, 2.7, 1.22, 1.05, "barrier"),
  solid("staff-chair", -4, -3.12, 0.7, 0.7, 0.8),
  solid("filing-cabinet", -6, -4.5, 1.12, 0.72, 1.3),
  solid("public-seating", -5, 2.4, 3.7, 1, 0.9),
  solid("uniform-locker", 8, -4.5, 1.03, 0.68, 1.94),
  solid("detector-left", -1.22, 8.6, 0.18, 0.49, 2.1),
  solid("detector-right", -0.18, 8.6, 0.18, 0.49, 2.1),
  solid("scanner", 2, 8.5, 1.3, 4.8, 1.2, "barrier"),
  solid("scanner-workstation", 3.16, 8.13, 0.63, 0.72, 1.25),
  solid("tray-return", 0.7, 7.4, 0.48, 0.7, 0.8),
  solid("turnstile", 2.1, -0.55, 0.75, 1, 1.1),
  solid("equipment-west", 12.46, 4.1, 0.8, 2.1, 1.05),
  solid("equipment-east", 12.46, 8.7, 0.8, 2.1, 1.05),
  solid("lounge-back-sofa", 17.1, -4.35, 2.15, 0.86, 0.9),
  solid("lounge-side-sofa", 15.15, -2.3, 0.86, 2.15, 0.9),
  solid("coffee-table", 17.1, -2.9, 1.35, 0.72, 0.48),
  solid("tv-cabinet", 19.2, -4.645, 1.12, 0.41, 0.75),
  solid("dining-table", 17.7, 8.3, 2.7, 1.15, 0.82, "barrier"),
  solid("kitchenette", 17.5, 10.58, 4.95, 0.6, 1.2),
  solid("supply-pallet",10.2,3.05,1.95,1.55,1.62,"barrier"),
  solid("supply-case", 5, 5.1, 1.1, 0.7, 0.5),
  ...[16.9, 18.5].flatMap((x) =>
    [7.35, 9.25].map((z) =>
      solid("dining-chair-" + x + "-" + z, x, z, 0.5, 0.5, 0.85),
    ),
  ),
  ...[26.4, 30.1].flatMap((x) =>
    [2.15, 9.73].map((z) => solid("bunk-" + x + "-" + z, x, z, 1.08, 2.1, 2.1)),
  ),
  ...[2, 3.15, 4.3, 5.45, 6.6, 7.75, 8.9].map((z) =>
    solid("locker-" + z, 32.555, z, 0.65, 0.79, 1.94),
  ),
  ...[25.08, 27.18, 29.28].map((x) =>
    solid("toilet-stall-" + x, x, -2.8, 2.1, 2.1, 1.5),
  ),
];
