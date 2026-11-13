# Three.js

Vendored Three.js 0.181.2 (MIT). See `LICENSE.txt`.
Runtime files are served locally, with no CDN request in the browser.

Files come from `https://cdn.jsdelivr.net/npm/three@0.181.2/`:

- `build/three.module.min.js` saved as `three.module.js`.
- `build/three.core.min.js`.
- `examples/jsm/controls/OrbitControls.js`.
- `examples/jsm/loaders/PLYLoader.js`.
- `LICENSE` saved as `LICENSE.txt`.

The two addon imports of `three` are changed to `./three.module.js` so the
modules can load without an import map or build step. All files use the same
pinned package version. Mixed indentation in PLYLoader's custom-attribute block
is normalized without changing behavior.

Official references: [installation](https://threejs.org/manual/pages/installation.html),
[PLYLoader](https://threejs.org/docs/pages/PLYLoader.html),
[OrbitControls](https://threejs.org/docs/pages/OrbitControls.html).
