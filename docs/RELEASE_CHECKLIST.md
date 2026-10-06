# Release evidence and remaining work

Updated 6 October 2026. This is a development build, not a signed-off production release.

## Implemented automated checks

- TypeScript check and Vite production build.
- Simulation tests: required weapon/boss roster, navigable mission anchors, infected routing, cover, reload ammunition conservation, utilities, revive, deterministic save continuation, campaign transitions, malformed saves/input, player addition/removal.
- Server integration tests: health/static/HEAD, rejected HTTP method, encoded traversal and malformed paths; maximum three players; identical shared movement snapshots; host-only restart; disconnect actor/inventory removal and replacement; invalid messages and hostile input sanitization.
- CI builds before testing on Node 22 and uploads the browser bundle.

Record the exact revision and results of the final run before release. Presence of CI configuration does not prove a remote CI run passed. Docker and Railway configuration have not yet been deployed or tested in those environments.

## Required gameplay acceptance

- [ ] Complete solo campaign played without debug shortcuts; measure first-playthrough duration against the requested 8–15 hours.
- [ ] Two and three human players complete all major encounters on separate devices.
- [ ] Verify flanking, revive, cover, alternate entrances and retreat routes in every major area; check furniture does not trap squads.
- [ ] Boss phase, objective and area-specific behavior acceptance against the complete master brief.
- [ ] Complete and validate requested endgame operation varieties and procedural underground replayability.
- [ ] Confirm save recovery, menu transitions, host departure, disconnect/rejoin, server restart and browser graphics recovery with real players.
- [ ] Difficulty and resource balance across solo, two and three players using recorded play sessions.

## Required visual and audio acceptance

- [ ] Compare camera, proportions, density, lighting and UI to the supplied visual benchmark and authorized project reference.
- [ ] Each major SAF asset compared against 2–3 real public images, with official imagery where possible; record render comparison results in reference log.
- [ ] Resolve LMG period/model and remaining unverified uniform kit, helmets, vehicles, medical, barracks, signage and props.
- [ ] Verify all named characters have distinct models, animation, personality and environment-driven encounters.
- [ ] Finish required camp/NPC animation and progression changes through lockdown and destruction.
- [ ] Complete environmental, enemy and distinctive boss audio; validate mix, volume controls and browser audio permissions.

## Required operational acceptance

- [ ] Test latest target browsers and low/mid/high hardware; record frame time, memory and busy three-player encounters.
- [ ] Test latency, packet interruption, slow clients and reconnection; perform measured load testing before promising capacity.
- [ ] Test production HTTPS/WSS, exact origin restriction, proxy upgrade/timeout behavior and `/health` on the chosen host.
- [ ] Test the Docker image; scan and review runtime dependencies; define update and rollback procedure.
- [ ] Add durable online room state/recovery and cross-instance routing if required by the release scale; current rooms are volatile and single-process.
- [ ] Review public asset/source licensing and ensure reference photos/private comparison-project material remain excluded.

Do not check these boxes based solely on automated simulation progression or generated geometry. Attach screenshots, recordings and measured evidence to the release revision.
