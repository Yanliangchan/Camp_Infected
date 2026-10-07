import type * as THREE from "three";

export type AmbientFixture = {
  light: THREE.PointLight;
  material: THREE.MeshStandardMaterial;
  baseIntensity: number;
  baseEmission: number;
  kind: "fluorescent" | "beacon";
  phase: number;
};

// Broad, infrequent dips rather than rapid strobing. Steady fill lights stay untouched.
export function atmosphereLevel(
  time: number,
  kind: AmbientFixture["kind"],
  phase = 0,
  enabled = true,
): number {
  if (!enabled) return 1;
  const t = Math.max(0, time) + phase;
  if (kind === "beacon")
    return 0.65 + (0.35 * (1 - Math.cos((t * Math.PI) / 2))) / 2;
  const cycle = t % 13;
  const dip = Math.max(0, 1 - Math.abs(cycle - 4) / 0.8);
  return 1 - 0.38 * dip * dip + 0.015 * Math.sin(t * 1.7);
}

export function updateAtmosphere(
  room: THREE.Group,
  time: number,
  enabled: boolean,
) {
  const fixtures = (room.userData.ambientFixtures ?? []) as AmbientFixture[];
  for (const fixture of fixtures) {
    const level = atmosphereLevel(time, fixture.kind, fixture.phase, enabled);
    fixture.light.intensity = fixture.baseIntensity * level;
    fixture.material.emissiveIntensity = fixture.baseEmission * level;
  }
  const rotor = room.getObjectByName("pedestal-fan-rotor");
  if (rotor) rotor.rotation.z = enabled ? time * 5 : 0;
}
