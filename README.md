# CAMP: INFECTED

An isometric browser game set in a fictional Singapore military camp, planned for solo and online squads of up to three.

## Character and environment checkpoint

This first checkpoint preserves the reviewed soldier, infected, Security Trooper, equipment, landing page, and expanded pass-office/guard-quarters environment. The default entry is the public landing page with a solo deployment lobby. The character inspector is retained at `/review.html`, and an early solo guardhouse tutorial is at `/game.html`. The earlier campaign prototype remains in the source tree but is disconnected from the entry page; its systems are not evidence of a finished playable campaign.

The solo tutorial now uses the approved 40 × 16 metre pass-office/guard-rest environment. Mouse wheel adjusts the gameplay camera; M toggles a sector overview. Campaign expansion and online co-op remain outstanding. See [development plan](docs/DEVELOPMENT_PLAN.md).

## Run locally

Use Node.js 22 or later:

```sh
npm ci
npm run build
npm test
npm start
```

Open http://localhost:3000. Use the landing page to deploy to the solo slice, or `/review.html` to inspect characters and environment views. `npm run dev` provides browser-only development. The current solo slice does not connect to a gameplay server.

## Sources and status

Characters and environment geometry are original procedural artwork. The user-supplied fabric photograph is excluded from GitHub. Local previews can use it when present; clean checkouts use the original procedural camouflage. Other reference photographs and SOCiety assets are not bundled. Reference review and limitations are recorded in [quality review](docs/QUALITY_REVIEW.md).

Build and automated tests are development checks. Production readiness, campaign duration, human co-op playtesting, hosting and asset clearance remain outstanding; see [release checklist](docs/RELEASE_CHECKLIST.md).

