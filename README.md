# CAMP: INFECTED

An isometric browser game set in a fictional Singapore military camp, planned for solo and online squads of up to three.

## Character and environment checkpoint

This first checkpoint preserves the reviewed soldier, infected, Security Trooper, equipment, landing page, and expanded pass-office/guard-quarters environment. The default entry is an interactive art inspection screen. The earlier campaign prototype remains in the source tree but is disconnected from the entry page; its systems are not evidence of a finished playable campaign.

Gameplay development begins with a room-gated tutorial in the approved environment, using the 2x close-up camera. See [development plan](docs/DEVELOPMENT_PLAN.md).

## Run locally

Use Node.js 22 or later:

```sh
npm ci
npm run build
npm test
npm start
```

Open http://localhost:3000. Inspect the characters, helmet, vest/belt, animations, and room camera views. `npm run dev` provides browser-only development. The art checkpoint does not connect to a gameplay server.

## Sources and status

Characters and environment geometry are original procedural artwork. The user-supplied fabric photograph is excluded from GitHub. Local previews can use it when present; clean checkouts use the original procedural camouflage. Other reference photographs and SOCiety assets are not bundled. Public references are recorded in `references/saf/`.

Build and automated tests are development checks. Production readiness, campaign duration, human co-op playtesting, hosting and asset clearance remain outstanding; see [release checklist](docs/RELEASE_CHECKLIST.md).

