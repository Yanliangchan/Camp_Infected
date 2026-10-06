# Repository and first-level plan

## Checkpoints

1. Preserve the reviewed character/environment designs before changing gameplay.
2. Build and test a scoped tutorial using the approved pass office and guard quarters.
3. Review the playable first level before expanding the campaign.

## Repository boundaries

- `src/game/`: shared level layout, collisions, tutorial progression and combat rules; no browser or Three.js dependencies.
- `src/render/`: gameplay camera and scene presentation. Existing character/equipment/environment builders stay shared with the art review, avoiding duplicate models.
- `src/ui/`: tutorial HUD and squad menus.
- `src/review.ts`: retained character/environment inspection entry.
- `server/`: authoritative co-op sessions and static browser hosting.
- `public/`: assets with recorded provenance.
- `tests/`: collision, progression, combat and network behavior.
- `docs/`: design decisions, art notes, validation and release evidence.

The disconnected open-camp prototype is historical development code. It must not dictate the tutorial navigation or progression. Move or remove it after the first-level replacement is working and tested.

## First level: Checkpoint Lockdown

Use the approved 40 x 16 metre map. Camera defaults to reviewed 2x magnification (4 metre vertical orthographic span), follows the local player, and keeps aiming usable at close range.

1. Screening: safe introduction to WASD, double-tap W sprint and Shift + WASD leopard crawl.
2. Pass office: learn mouse aim/fire, reload and supplies; small authored infected encounter.
3. Guard quarters: normal security door unlocks after checkpoint clearance. Lounge, dining and bunk collisions match visible furniture.
4. Security Trooper: boss with attack warning and recovery window, balanced by squad size.
5. Regroup and exit: clear final enemies, gather the squad, interact at controlled exit. No automatic teleporting to later areas.

Squad members share encounter progression. Server owns movement/combat/progression online. Solo uses identical rules locally. Include win/fail/retry, ammo, health, teammate revive and connection feedback. This is a first-level development slice, not a complete production campaign.
