import { PLYLoader } from './vendor/three/PLYLoader.js';

self.onmessage = ({ data }) => {
  try {
    const geometry = new PLYLoader().parse(data.buffer);
    const positions = geometry.getAttribute('position')?.array;
    const colors = geometry.getAttribute('color')?.array;
    if (!positions?.length) throw new Error('The reconstruction contains no points.');
    const depths = [];
    const step = Math.max(1, Math.ceil(positions.length / 3 / 16000));
    for (let i = 2; i < positions.length; i += step * 3) {
      if (Number.isFinite(positions[i]) && positions[i] > 0) depths.push(positions[i]);
    }
    depths.sort((a, b) => a - b);
    const focusDepth = depths[Math.floor(depths.length / 2)] || 1;
    const transfers = [positions.buffer];
    if (colors) transfers.push(colors.buffer);
    self.postMessage({ positions, colors, focusDepth }, transfers);
    geometry.dispose();
  } catch (error) {
    self.postMessage({ error: error.message || 'Unable to read the reconstruction.' });
  }
};
