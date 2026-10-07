# Camp Infected: visual direction

## The problem this pass addresses

A live local SOCiety stage-2 office preview and Camp's inspector were captured at 1440 × 900. SOCiety uses the same Three.js family of tools and procedural geometry. The difference is a consistent hierarchy: warm shell, department floor zones, furniture colour, readable interaction accents, contact shading and animation communicating work. Its floor area is organized around activity. Camp's expanded 40 × 16m room had the same fine tiled surface almost everywhere, pervasive olive-grey colours, weak ambient fill and perimeter-only detail. The largest empty surface dominated the image while many small props disappeared at overview zoom. Procedural art itself is not the problem; adding details without composition was the wrong priority.

SOCiety's visual bible is specific about scale, shape, palette, grounded furniture, room identity and performance. Camp needs the same consistency, without copying SOCiety's office assets or its happy tycoon tone. No SOCiety source or assets were copied into this pass.

## Working visual thesis

A readable Singapore-inspired institutional diorama interrupted by a lockdown: cream plaster and stone, cool navy public furniture, olive military equipment, warm off-duty areas, and amber restricted-area accents. Danger comes from actors, spatial tension and localized failures. It should not require tinting the entire world green or dimming every surface.

- **Large shapes first:** walls and floor finishes establish room functions at normal play zoom. Existing furniture retains its reviewed proportions.
- **Colour roles:** neutral shell; navy visitor seating; blue-green lounge upholstery; olive kit and lockers; cream paper and sheets; amber markings/security lamp. Keep these roles consistent using `src/render/campPalette.ts`.
- **Room identity:** public tiles, staff terrazzo inset, screening floor island, warm rest-wing tiles, cool concrete bunk floor and clean washroom tiles. Architectural transitions align to existing walls/openings.
- **Grounding:** soft contact shading under authored solid furniture footprints; shared texture/material and merged geometry. No new post-processing or shadow lights.
- **Lighting:** warmer sky, neutral cool ground fill and soft directional light preserve colour separation. Local practical failures remain restrained; routes and combat silhouettes stay readable.
- **Detail:** functional clusters and wear at contact points. Do not fill combat space with random crates, posters, rugs or debris to inflate detail counts.
- **Animation:** fans move because they are machinery; indicators communicate security status. Ambient effects have an off switch and respect reduced motion. Reload, attack anticipation and impact feedback remain future combat work.
- **Comparison:** inspect overview, normal gameplay camera, rest wing and close-ups. Do not call a close-up screenshot proof of full-map quality or target-hardware performance.

## Implemented in this pass

Shared environment palette, five floor treatments plus an office inset and screening island, restrained physical lane paint, stronger upholstery identity, brighter neutral lighting in both inspector and gameplay, and one merged contact-shadow mesh derived from collision footprints. Gameplay-only supply objects are excluded from the inspector shadow pass to avoid phantom marks. Flat surfaces add no collisions. The existing side sofa and coffee table now form a close lounge cluster, and the dining table/chairs sit near the kitchenette. Their physical solid footprints were updated together; no new obstacles were added. The older base tile remains below the overlays and supplies small boundary joints; floor planes use deliberately separated elevations to avoid coplanar overlap.

## Remaining gaps

The footprint is still too large relative to its prop clusters. A subsequent layout pass should design individual encounters and sightlines around active areas rather than continuing to enlarge one rectangle. That requires updating art and navigation together, not silently shrinking the model. Keep clear retreat routes, but use purposeful partitions and encounter beats where needed.

The map also needs authored surface wear, stronger silhouette treatment on selected fixtures, consistent contextual labels, combat/reload animation, positional sound, human playtesting and performance measurements on target devices. This pass improves visual hierarchy; it does not establish parity with a finished paid game. SOCiety's progression and state-driven activity also give its rooms life; a static art inspector cannot reproduce that by adding flicker alone.
