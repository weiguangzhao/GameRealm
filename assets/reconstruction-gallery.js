/* Video and image navigation with a point-cloud viewer, loaded after selection. */
(() => {
  'use strict';
  const scriptURL = document.currentScript?.src || new URL('assets/reconstruction-gallery.js', document.baseURI).href;
  const viewerURL = new URL('./reconstruction-viewer.js', scriptURL).href;
  const workerURL = new URL('./reconstruction-worker.js', scriptURL).href;
  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  window.GameRealmReconstructionGallery = ({ root, samples, resolveURL, isVisible, localPreviewURL }) => {
    const items = Array.isArray(samples) ? samples : [];
    const Media = window.GameRealmMedia;
    const fileEntry = location.protocol === 'file:';
    const requestedSample = new URLSearchParams(location.search).get('reconstruction');
    const initialIndex = items.findIndex(sample => sample.id === requestedSample);
    const nav = create('div', 'reconstruction-nav');
    nav.setAttribute('role', 'group');
    nav.setAttribute('aria-label', 'Reconstruction samples');
    const viewport = create('div', 'reconstruction-viewer');
    viewport.id = 'reconstruction-viewer';
    const stage = create('div', 'reconstruction-stage');
    const overlay = create('div', 'reconstruction-overlay');
    const status = create('p', '', 'Select a sample to explore its reconstruction.');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const progress = create('progress');
    progress.max = 1;
    progress.value = 0;
    progress.hidden = true;
    progress.setAttribute('aria-label', 'Loading reconstruction');
    const retry = create('button', 'reconstruction-retry', 'Retry');
    retry.type = 'button';
    retry.hidden = true;
    const previewLink = create('a', 'reconstruction-preview-link', 'Open interactive preview');
    const candidatePreview = resolveURL(localPreviewURL);
    const previewBase = candidatePreview && /^https?:$/.test(new URL(candidatePreview).protocol) ? candidatePreview : '';
    previewLink.hidden = !fileEntry || !previewBase;
    if (previewBase) {
      const url = new URL(previewBase);
      url.searchParams.set('model', 'visual-geometry');
      url.hash = 'finetuned-models';
      previewLink.href = url.href;
    }
    if (fileEntry) status.textContent = 'Open the interactive preview to explore 3D reconstructions.';
    overlay.append(status, progress, retry, previewLink);
    stage.append(overlay);
    const toolbar = create('div', 'reconstruction-toolbar');
    const reset = create('button', '', 'Reset view');
    reset.type = 'button'; reset.disabled = true;
    const sizeLabel = create('label', 'reconstruction-size', 'Point size');
    const size = create('input');
    size.type = 'range'; size.min = '1'; size.max = '4'; size.step = '0.25'; size.value = '1.5'; size.disabled = true;
    sizeLabel.append(size);
    const fullscreen = create('button', '', 'Fullscreen');
    fullscreen.type = 'button'; fullscreen.disabled = true;
    fullscreen.hidden = typeof viewport.requestFullscreen !== 'function';
    toolbar.append(reset, sizeLabel, fullscreen);
    viewport.append(stage, toolbar);
    const hint = create('p', 'reconstruction-hint', 'Drag to rotate · Scroll to zoom · Right-drag or arrow keys to pan');
    root.append(nav, viewport, hint);
    const previews = [];
    const buttons = [];
    let viewer = null;
    let selected = -1;
    let state = 'idle';
    let version = 0;
    let abort = null;
    let worker = null;
    let rejectWorker = null;
    let inView = true;
    const active = () => isVisible() && !document.hidden && inView;
    function pausePreviews() { previews.forEach(video => { if (video) Media.release(video); }); }
    function syncVideoPlayback() {
      previews.forEach((video, index) => {
        if (!video) return;
        if (index !== selected || !active()) { Media.release(video); return; }
        Media.activate(video);
        const promise = video.play();
        if (promise?.catch) promise.catch(() => {});
      });
    }
    function cancelPending() {
      version++;
      if (abort) abort.abort();
      abort = null;
      if (worker) worker.terminate();
      worker = null;
      if (rejectWorker) rejectWorker(new DOMException('Loading cancelled', 'AbortError'));
      rejectWorker = null;
    }
    function controlsEnabled(value) { reset.disabled = !value; size.disabled = !value; fullscreen.disabled = !value; }
    async function select(index) {
      if (!isVisible() || !items[index]) return;
      if (fileEntry) {
        if (previewBase) {
          const url = new URL(previewLink.href);
          url.searchParams.set('reconstruction', items[index].id || String(index + 1));
          status.textContent = 'Opening the interactive preview…';
          previewLink.href = url.href;
          location.assign(url.href);
        }
        return;
      }
      if (selected === index && ['loading', 'ready'].includes(state)) { syncVideoPlayback(); return; }
      cancelPending();
      const request = version;
      const media = items[index];
      const changed = selected !== index;
      selected = index;
      if (changed && previews[index]) Media.seek(previews[index], 0);
      syncVideoPlayback();
      state = 'loading';
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      viewport.setAttribute('aria-busy', 'true');
      stage.setAttribute('aria-label', `${media.label || 'Selected sample'} reconstruction`);
      overlay.hidden = false; retry.hidden = true; progress.hidden = false; progress.value = 0;
      status.textContent = 'Loading reconstruction…';
      controlsEnabled(false);
      if (viewer) viewer.clear();
      abort = new AbortController();
      const signal = abort.signal;
      let phase = 'viewer';
      try {
        const module = await import(viewerURL);
        if (request !== version) return;
        if (!viewer) viewer = module.createReconstructionViewer(stage);
        viewer.setVisible(active());
        const url = resolveURL(media.ply);
        if (!url) throw new Error('Missing reconstruction');
        phase = 'download';
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        let buffer;
        if (response.body?.getReader) {
          const reader = response.body.getReader();
          const chunks = [];
          const total = Number(response.headers.get('Content-Length')) || media.bytes || 0;
          let loaded = 0;
          let lastPercent = -1;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (request !== version) { await reader.cancel(); return; }
            chunks.push(value); loaded += value.byteLength;
            const percent = total ? Math.min(100, Math.floor(loaded / total * 100)) : 0;
            if (percent !== lastPercent) {
              lastPercent = percent;
              progress.value = total ? loaded / total : 0;
              status.textContent = total ? `Loading reconstruction… ${percent}%` : 'Loading reconstruction…';
            }
          }
          const bytes = new Uint8Array(loaded);
          let offset = 0;
          chunks.forEach(chunk => { bytes.set(chunk, offset); offset += chunk.byteLength; });
          buffer = bytes.buffer;
        } else buffer = await response.arrayBuffer();
        if (request !== version) return;
        status.textContent = 'Preparing reconstruction…';
        phase = 'parse';
        const data = await new Promise((resolve, reject) => {
          rejectWorker = reject;
          worker = new Worker(workerURL, { type: 'module' });
          worker.onmessage = ({ data }) => data.error ? reject(new Error(data.error)) : resolve(data);
          worker.onerror = () => reject(new Error('Unable to prepare reconstruction'));
          worker.postMessage({ buffer }, [buffer]);
        });
        if (request !== version) return;
        worker.terminate(); worker = null; rejectWorker = null;
        phase = 'display';
        viewer.setData({ ...data, fov: media.fov || 70, cameraAspect: media.cameraAspect });
        viewer.setPointSize(Number(size.value));
        state = 'ready';
        overlay.hidden = true;
        status.textContent = `${media.label || 'Selected sample'} reconstruction loaded.`;
        viewport.setAttribute('aria-busy', 'false');
        controlsEnabled(true);
      } catch (error) {
        if (request !== version || error.name === 'AbortError') return;
        if (worker) worker.terminate();
        worker = null; rejectWorker = null;
        state = 'error';
        progress.hidden = true; retry.hidden = false;
        const messages = {
          viewer: 'Unable to start the 3D viewer. Check that browser 3D graphics are available, then retry.',
          download: 'Unable to download this reconstruction. Check the preview connection, then retry.',
          parse: 'Unable to prepare this reconstruction. Please retry.',
          display: 'Unable to display this reconstruction. Please retry.'
        };
        status.textContent = messages[phase];
        console.error(`GameRealm reconstruction ${phase} failed:`, error);
        viewport.setAttribute('aria-busy', 'false');
      } finally { if (request === version) abort = null; }
    }
    items.forEach((media, index) => {
      const button = create('button', 'reconstruction-sample');
      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-controls', viewport.id);
      button.setAttribute('aria-label', `Load ${media.label || `sample ${index + 1}`} reconstruction`);
      let video = null;
      let thumbnail;
      const imageURL = resolveURL(media.image);
      if (imageURL) {
        thumbnail = create('img');
        Media.deferImage(thumbnail, Media.thumbnailURL(imageURL));
        thumbnail.alt = `${media.label || 'Reconstruction'} stereo pair`;
        thumbnail.loading = 'lazy';
        thumbnail.decoding = 'async';
        if (media.imageWidth > 0) thumbnail.width = media.imageWidth;
        if (media.imageHeight > 0) thumbnail.height = media.imageHeight;
      } else {
        video = create('video');
        video.muted = true; video.playsInline = true; video.loop = true; video.preload = 'none';
        video.setAttribute('aria-hidden', 'true');
        video.tabIndex = -1;
        const poster = resolveURL(media.poster);
        const src = resolveURL(media.video);
        const resource = Media.register(video, { src, poster: Media.thumbnailURL(poster) });
        Media.group([resource], { element: button });
        thumbnail = video;
      }
      button.append(thumbnail, create('span', '', imageURL ? 'stereo' : 'video'));
      button.addEventListener('click', () => select(index));
      button.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight') next = Math.min(items.length - 1, index + 1);
        else if (event.key === 'ArrowLeft') next = Math.max(0, index - 1);
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = items.length - 1;
        else return;
        event.preventDefault(); buttons[next].focus(); select(next);
      });
      previews.push(video); buttons.push(button); nav.append(button);
    });
    retry.addEventListener('click', () => select(selected));
    reset.addEventListener('click', () => viewer?.reset());
    size.addEventListener('input', () => viewer?.setPointSize(Number(size.value)));
    fullscreen.addEventListener('click', () => {
      const action = document.fullscreenElement === viewport ? document.exitFullscreen() : viewport.requestFullscreen();
      if (action?.catch) action.catch(() => {});
    });
    document.addEventListener('fullscreenchange', () => {
      fullscreen.textContent = document.fullscreenElement === viewport ? 'Exit fullscreen' : 'Fullscreen';
    });
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (!inView) pausePreviews();
      else syncVideoPlayback();
      if (viewer) viewer.setVisible(active());
    });
    observer.observe(root);
    document.addEventListener('visibilitychange', () => {
      syncVideoPlayback();
      if (viewer) viewer.setVisible(active());
    });
    return {
      setVisible(value) {
        if (!value) {
          pausePreviews();
          if (state === 'loading') { cancelPending(); state = 'idle'; viewport.setAttribute('aria-busy', 'false'); }
        }
        if (viewer) viewer.setVisible(value && active());
        if (value) syncVideoPlayback();
        if (value && selected >= 0 && state === 'idle') select(selected);
        else if (value && selected < 0 && initialIndex >= 0) select(initialIndex);
      }
    };
  };
})();
