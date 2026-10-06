# Character art review

The revised module uses original geometry recipes informed by a read-only study of SOCiety's character construction: continuous rounded skull and pear torso, facial detail, soft limbs, and merged cached vertex-coloured rigid parts. No private project source or assets are copied into this implementation.

Feet are at the origin; +Z faces forward; standard height is approximately 1.3m. `createCharacter(kind, role)`, `animateCharacter(group, moving, time, motion?)` and `setCharacterWeapon(group, name)` retain the scene contract. The soldier has articulated shoulders, elbows, hips and knees, with two-bone arm support for the rifle. Motion supports idle, walk, sprint and leopard crawl; the body and head blend into the prone pose.

The latest soldier pass follows user-supplied field photographs and uniform references. It removes the clipping helmet hair and grenade-like gloves, reduces facial features, refits the waist webbing and pouches, and adds collar, chest tapes, boot laces and a compact bullpup rifle. The local review uses the supplied fabric image at `public/reference-textures/saf-digital-fabric.png`, projected at a consistent scale; a generated atlas remains the fallback.

Goggles follow the three additional user-supplied photographs: a continuous curved lens with a central nose cutout, black outer frame and foam rim, translucent grey lens, a wide strap following the helmet shell, and side fittings. `src/goggles.ts` keeps the lens material separate from opaque kit. The preview includes a Helmet detail control for close-up rotation. This remains stylized art awaiting visual approval, not a claim of exact equipment reproduction.

Preview-only controls: WASD walks in place, two separate W presses within 300ms enable sprint while W stays held, and either Shift key plus WASD selects leopard crawl. Releasing movement returns to idle; blur clears held keys. Buttons allow each animation to run continuously for review. These controls are not connected to combat or online gameplay.

Public references in `references/saf/reference-log.json` inform SAF uniform palette, SAR21 bullpup silhouette, cookhouse worker outfit and institutional context. Pistol and legacy Ultimax recipes follow the separately inspected public references. The larger sharpshooter optic is a readability interpretation of the documented 3x sight and still needs close-up reference comparison. Rank artwork remains simplified pending official insignia signoff.

Character screenshots and the interactive preview must be reviewed before gameplay expansion. Suggested later readability: small indicators above actual players, infected distinguished through posture/expression, and Security Trooper through guard equipment and a stronger silhouette. Enemy art remains unapproved.

Face refinement: the skull and jaw now form one continuously shaped surface. The previous overlapping jaw created a visible crease across the cheeks and mouth. Raised blush patches have been removed; the eyes and nose are smaller, the eyebrows are less angled, and a subtle resting lip line replaces the curved smile. Front and side close-ups remain the visual approval checkpoints.

Security Trooper replaces the former Gatekeeper name in the preview and encounter labels. The extra eye covering is removed. A black cuff and curved raised panel fit the right upper arm, with orange two-line SECURITY TROOPER lettering, following the three supplied armband photographs. The preview provides an Armband detail control. Helmet and raised ballistic goggles are retained; this request does not replace them with a beret. The original MASTER_SPEC is preserved as reference history.

Infected mouth correction: separate mouth/teeth blocks retained their old depth after the skull refinement and appeared detached. All infected characters, including Security Trooper, now share mouth detail projected onto the actual head surface. Teeth are drawn within that mouth detail, with no independent blocks protruding from the face. `faceSurface.ts` provides the shared head shape and fitted mouth.

## Elbows and reference field gear
All military characters now have longer upper sleeves and a fabric-covered elbow volume centered on the articulated joint. This overlap stays connected during IK and animation. Chin webbing is projected onto the actual cheek/jaw mesh with a narrow clearance instead of straight rods suspended outside the face. Goggles use a light smoke-green tint with restrained highlights.

The latest user vest photograph informed fitted camouflaged carrier panels, broad shoulder straps, three upper-chest MOLLE rows, two curved-flap magazine pouches, a chest radio, a visible shirt gap, a padded digital-camo belt with dark center buckle, and hanging utility pouches. The shared military recipe applies to Soldier, Infected and Security Trooper. The stylized body proportions are retained.

A Vest & belt inspection button zooms to the equipment, lowers the arms, and temporarily hides the rifle in this review view. Normal armed poses remain available outside the close-up. Build and browser error checks passed; soldier sprint/crawl, infected walk and Security Trooper walk were visually checked.
