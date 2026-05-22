# ImperiumAI – `public/models/`

ImperiumAI **no longer bundles per-device GLB assets**. The only 3D scene that
ships with the project lives on the landing page
(`frontend/components/HomeHero3D.jsx`) and is fully procedural — built from
primitive Three.js geometries at runtime. The Battle dashboard uses a 2D
CSS + Framer-Motion component (`frontend/components/SmartHomeBoard.jsx`).

The single remaining asset in this folder is:

| File         | Used by                          | Note                                           |
| ------------ | -------------------------------- | ---------------------------------------------- |
| `house.glb`  | (reserved — currently unused)    | Kept so the landing scene can optionally swap  |
|              |                                  | the procedural house for a real model later.   |

Drop in any new `.glb` files only if you bring back a Three.js scene in a
future iteration; nothing in the current code path tries to load them.
