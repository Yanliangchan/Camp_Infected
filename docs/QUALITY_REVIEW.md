# Landing and Main Gate development review

## Verdict

Not ready for paid release. The landing page can introduce a public prototype; the tutorial is a small solo mechanics slice. Neither proves an 8–15 hour campaign or production multiplayer. No player willingness-to-pay claim has been validated.

The existing guardhouse artwork is substantially more detailed than the new exterior tutorial. Closing that visual gap is a release blocker. Preserve the approved characters; bring the playable environment up to their standard.

## Delivered

- Responsive landing hero using the existing guardhouse and characters; story, gameplay pillars, honest build status, FAQ and project links.
- Solo deployment lobby with briefing and a functional tutorial entry. No fabricated online room codes or matchmaking.
- Separate Main Gate slice using the original characters: screen-relative movement, aiming/fire, finite ammunition, reload, sprint/stamina, dodge, a field dressing, substantial cover, a survivor interaction, gate access and extraction.
- Shared geometry/collision layout; shots respect cover. Three cadet infected navigate around obstacles with throttled path updates.
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

New simulation checks: collision/normalised movement, interaction proximity and ordering, blocked shots/nearest target, ammunition conservation, medical limits, end-state freeze, and a full physically traversed operation. The full-run test walks, fires and interacts through the same simulation without teleporting; it caught and fixed an inactive enemy beyond the original alert radius.

Browser acceptance script checks desktop/phone landing layout, lower-page content, deployment dialog, character navigation, movement, pause and restart. Screenshots are local artifacts, excluded from Git. Run `node scripts/acceptance.mjs` with the dev server at port 5173. System Chromium is the default; override via `CHROMIUM_PATH` where needed. Software rendering here cannot establish target-device FPS.

## Gates before charging players

1. Build a polished 10–15 minute operation and have fresh players complete it without developer guidance. Record confusion, deaths, completion, enjoyment and willingness to replay.
2. Combat feel: aiming feedback, hit confirmation, recoil, reload animation, readable attack windup, hurt/death animation, spatial audio and warning cues. The current slice has no audio.
3. Environment: use the approved guardhouse prop/material language, public SAF references and a fictional authored layout. Add density, coherent thresholds, recovery positions and environmental story details. Current exterior trees/fences/furniture are placeholders.
4. Online authority, real two/three-player sessions, scaling through composition/objectives, revival, disconnect/reconnect and squad camera tests. Solo lobby is not evidence of multiplayer.
5. Accessibility: rebindable controls, scalable text, contrast options, reduced motion, settings, gamepad support if shipping on PC. Phone gameplay is not supported; the marketing page is responsive.
6. Performance on actual target hardware; GPU/shadow cost, memory, load time and long-session stability. Browser software-rendering captures are visual evidence only.
7. Campaign/content scope, licensing, save system, distribution and pricing. Select the intended platform before expanding the campaign.

## Deliberate scope limit

This exterior slice establishes mechanics. It does not replace the reviewed 40 × 16 metre pass-office/guard-rest environment, implement the entire first campaign stage, or fulfil the co-op tutorial from the master specification. Integrating these mechanics with that approved environment is the next major area milestone.
