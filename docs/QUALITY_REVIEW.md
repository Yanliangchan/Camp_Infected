# Landing and Main Gate development review

## Verdict

Not ready for paid release. The landing page can introduce a public prototype; the tutorial is a small solo mechanics slice. Neither proves an 8–15 hour campaign or production multiplayer. No player willingness-to-pay claim has been validated.

The rejected exterior blockout has been removed. Gameplay now runs inside the approved 40 × 16 metre guardhouse, reusing the same detailed environment, materials and props as the art inspector. This closes the most obvious consistency gap; it does not establish parity with commercial Steam games.

## Delivered

- Responsive landing hero using the existing guardhouse and characters; story, gameplay pillars, honest build status, FAQ and project links.
- Solo deployment lobby with briefing and a functional tutorial entry. No fabricated online room codes or matchmaking.
- Separate Main Gate slice using the original characters: screen-relative movement, aiming/fire, finite ammunition, reload, sprint/stamina, dodge, a field dressing, substantial cover, a survivor interaction, gate access and extraction.
- An authored collision layout matches substantial furniture in the approved guardhouse, including screening, counter, desk, storage, lounge, dining area, bunks and partitions; shots respect cover. Three cadet infected navigate around obstacles with throttled path updates.
- Pause on focus loss; pause/resume/restart; win/fail states; contextual objective marker and minimal HUD.
- Existing character and environment inspector retained at `/review.html`.

## References reviewed

- User PDF, CAMP: INFECTED master specification. The supplied My Mini Mart screenshots are described in the PDF but not attached as standalone images in this session. Exact screenshot comparison remains outstanding.
- SOCiety: architecture, roadmap, design vision, visual bible and screenshot workflow. Applied fixed orthographic presentation, physical interaction, pure simulation rules, original procedural models and separate tests. This was source/design review, not a complete live playthrough of SOCiety.
- https://enlisted.yanliangchan.com — inspected its delivered HTML and JavaScript: strong deployment action, tactical identity, controls, operations and settings. Remote screenshot capture failed on the browser's proxy certificate chain; no screenshot comparison is claimed.
- https://en.wikipedia.org/wiki/SAR_21 — viewed public photographs of a soldier carrying a SAR 21 and a standard rifle in use. Checked bullpup silhouette, magazine behind grip, helmet/kit and Singapore digital camouflage. The IDEX modular variant was also inspected but is not the standard-issue silhouette benchmark.
- Google image search was attempted but returned an interstitial without usable images. Use verified public SAF/Army references for the next environment pass. No complete real guardhouse-layout accuracy claim is made.

Reference photos remain outside the repository and are not game assets.

## Verification

Baseline: production build and 2 existing input tests passed.

Current simulation checks (11 total tests): collision/normalised movement, interaction proximity and ordering, blocked shots/nearest target, ammunition conservation, medical limits, end-state freeze, and a full physically traversed operation. The full-run test walks, fires and interacts through the same simulation without teleporting; it caught and fixed an inactive enemy beyond the original alert radius.

Browser acceptance script checks desktop/phone landing layout, lower-page content, deployment dialog, character navigation, movement, pause and restart. Screenshots are local artifacts, excluded from Git. Run `node scripts/acceptance.mjs` with the dev server at port 5173. System Chromium is the default; override via `CHROMIUM_PATH` where needed. Software rendering here cannot establish target-device FPS.

## Gates before charging players

1. Build a polished 10–15 minute operation and have fresh players complete it without developer guidance. Record confusion, deaths, completion, enjoyment and willingness to replay.
2. Combat feel: aiming feedback, hit confirmation, recoil, reload animation, readable attack windup, hurt/death animation, spatial audio and warning cues. The current slice has no audio.
3. Environment: use the approved guardhouse prop/material language, public SAF references and a fictional authored layout. Add density, coherent thresholds, recovery positions and environmental story details. The approved interior replaces the rejected exterior. Further polish should focus on coherent floor variation, wear, art direction, visible combat feedback and performance, rather than adding arbitrary clutter.
4. Online authority, real two/three-player sessions, scaling through composition/objectives, revival, disconnect/reconnect and squad camera tests. Solo lobby is not evidence of multiplayer.
5. Accessibility: rebindable controls, scalable text, contrast options, reduced motion, settings, gamepad support if shipping on PC. Phone gameplay is not supported; the marketing page is responsive.
6. Performance on actual target hardware; GPU/shadow cost, memory, load time and long-session stability. Browser software-rendering captures are visual evidence only.
7. Campaign/content scope, licensing, save system, distribution and pricing. Select the intended platform before expanding the campaign.

## Guardhouse revision after visual rejection

The sparse exterior was not an acceptable visual milestone. Its working mechanics were insufficient reason to advance it. Gameplay now calls `buildDungeonRoom` and shares the actual approved art builders, rather than attempting to imitate their appearance with a new set of boxes.

- Reused glazed pass counter, paperwork, workstation, cabinet, linked seats, notices, fan, scanning equipment, field storage, lounge, kitchenette, detailed tubular bunks, lockers and washroom fixtures.
- Preserved plaster/tile/concrete surfaces, wall fittings, conduits, scuffs and institutional lighting.
- Added a detailed supply pallet as substantial cover, screening floor markings, discarded documents and a restrained survivor trail. Blocking pallet geometry is represented in the collision layout.
- Added adjustable 4–10 metre camera span using the mouse wheel; `M` toggles a full-sector overview. Close-up view keeps the soldier and prop details readable.
- Rebuilt navigation for the approved layout with a half-metre grid. Walking clearance is distinct from shooting visibility; regression tests cover the scanner edge and all authored door openings.
- Physical full-operation simulation still passes through the revised map without teleporting. Browser screenshots include close-up entry, overview and a physically walked interior view.

Steam references viewed directly: [Dreadhunter](https://store.steampowered.com/app/1553710/Dreadhunter/) and [The Ascent](https://store.steampowered.com/app/979690/The_Ascent/), using official store screenshots from the Steam appdetails API. Dreadhunter shows strong floor/wall surface variation, differentiated cover and combat effects; The Ascent shows layered functional props, lighting hierarchy, wear and clear combat space. Their realism and sci-fi art direction are not the requested visual style. The useful benchmark is coherent environmental detail and gameplay readability, not copying their assets or claiming equivalent production quality.

Still outstanding: full named-boss first-stage design, online co-op, audio and combat animation/feedback, occlusion handling, target-hardware profiling, and independent human playtesting. This remains a solo tutorial slice rather than a complete campaign stage.

### Atmosphere pass and next map priorities

The Steam references (The Ascent and Dreadhunter) show stronger focal lighting, distinct surface treatments, and purposeful environmental stories. Their production quality remains above this prototype. Keep the brighter stylised SAF direction; copying their darkness would hurt readability and contradict the design brief.

Implemented: two independently phased fluorescent dips, a four-second security-lamp pulse, and rotation of the existing pedestal fan blades. Entry, combat fill and rest-wing lighting remain steady. Effects follow simulation time, freeze on pause, and restore steady emission when disabled. The pause menu exposes an ambient animation toggle; reduced-motion preference defaults effects off. No new point lights, shadow lights, particles or per-frame texture uploads were added. The fan adds three inexpensive blade meshes.

Next priorities, in order:
1. Give the pass office, screening area and rest wing distinct material palettes and one readable focal point each. Add wear where feet, hands and equipment actually contact surfaces, rather than scattering random dirt.
2. Replace repetitive tile treatment with authored grout, threshold transitions and selective roughness variation. Inspect at the normal gameplay zoom as well as close-up.
3. Build a coherent lockdown story through displaced chairs, abandoned registration paperwork and a damaged service fixture. Keep retreat lanes clear; ensure any new cover has matching collision.
4. Add fan hum, electrical buzz, radio ambience and positional alarm audio with volume controls. Pair combat hits with readable feedback and proper reload/attack animation.
5. Validate a complete encounter with human players and profile on target hardware before increasing scene density. Browser software rendering cannot establish a shipping performance budget.

This atmosphere pass does not establish paid-release readiness. Animation adds life, but material work, composition, combat feel and a complete polished mission are still necessary.

### SOCiety comparison and room composition pass

See [Art direction](ART_DIRECTION.md) for the direct local comparison and applied rules. The map now separates functional floor finishes, uses a shared palette and merged furniture grounding, and places the lounge/dining furniture in believable clusters with matching collisions. Brighter neutral lighting replaces the pervasive green-grey cast in the inspector and gameplay. Before/after and close-up screenshots were captured from real rendered builds, without generated concept art. The current inspector reports 211 draw calls and about 614k triangles including display actors and shadow passes; this is a diagnostic count, not a performance qualification. The map still has a large sparse footprint and needs encounter-led layout refinement.
