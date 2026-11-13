import * as THREE from './vendor/three/three.module.js';
import { OrbitControls } from './vendor/three/OrbitControls.js';

export function fitReconstructionFov(fov, sourceAspect, viewportAspect) {
  const base = THREE.MathUtils.clamp(Number(fov) || 70, 1, 179);
  if (!(sourceAspect > 0) || !(viewportAspect > 0)) return base;
  const scale = Math.max(1, sourceAspect / viewportAspect) * 1.03;
  return Math.min(179, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(base) / 2) * scale)));
}

export function createReconstructionViewer(stage) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Interactive reconstruction. Drag to rotate, scroll to zoom, or use arrow keys to pan.');
  stage.prepend(canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#09121e');
  const camera = new THREE.PerspectiveCamera(70, 1, 0.001, 1000);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.listenToKeyEvents(canvas);
  let cloud = null;
  let visible = false;
  let pointSize = 1.5;
  let sourceFov = 70;
  let sourceAspect = 0;
  function render() {
    if (visible && cloud && stage.clientWidth && stage.clientHeight) renderer.render(scene, camera);
  }
  function resize() {
    if (!stage.clientWidth || !stage.clientHeight) return;
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    camera.aspect = stage.clientWidth / stage.clientHeight;
    camera.fov = fitReconstructionFov(sourceFov, sourceAspect, camera.aspect);
    camera.updateProjectionMatrix();
    render();
  }
  controls.addEventListener('change', render);
  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  function clear() {
    if (!cloud) return;
    scene.remove(cloud);
    cloud.geometry.dispose();
    cloud.material.dispose();
    cloud = null;
    if (visible) renderer.clear();
  }
  return {
    setData({ positions, colors, focusDepth, fov = 70, cameraAspect = 0 }) {
      clear();
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      if (colors) geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.computeBoundingSphere();
      const radius = geometry.boundingSphere.radius || 1;
      const material = new THREE.PointsMaterial({ size: pointSize, sizeAttenuation: false, vertexColors: Boolean(colors), toneMapped: false });
      cloud = new THREE.Points(geometry, material);
      // These reconstructions use camera coordinates: +Y down, +Z forward.
      cloud.rotation.x = Math.PI;
      scene.add(cloud);
      camera.position.set(0, 0, 0);
      sourceFov = THREE.MathUtils.clamp(Number(fov) || 70, 1, 179);
      sourceAspect = Number(cameraAspect) || 0;
      camera.fov = sourceFov;
      camera.near = Math.max(0.00001, focusDepth / 10000);
      camera.far = Math.max(100, radius * 10);
      camera.updateProjectionMatrix();
      controls.target.set(0, 0, -focusDepth);
      controls.minDistance = Math.max(0.0001, focusDepth / 1000);
      controls.maxDistance = Math.max(100, radius * 10);
      controls.update();
      controls.saveState();
      resize();
    },
    setVisible(value) { visible = value; controls.enabled = value; if (value) resize(); },
    setPointSize(value) { pointSize = value; if (cloud) cloud.material.size = value; render(); },
    reset() { controls.reset(); render(); },
    clear,
    dispose() { clear(); observer.disconnect(); controls.dispose(); renderer.dispose(); canvas.remove(); }
  };
}
