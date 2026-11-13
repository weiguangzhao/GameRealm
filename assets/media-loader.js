/* Covers are visible-only; a single active playback group owns video requests. */
(() => {
  'use strict';
  const manifest = window.GAMEREALM_MEDIA || { files: {}, thumbnails: {} };
  const mediaRoot = new URL('media/', document.baseURI);
  function mediaPath(value) {
    try {
      const url = new URL(value, document.baseURI);
      if (url.origin === mediaRoot.origin && url.pathname.startsWith(mediaRoot.pathname)) {
        return `media/${decodeURIComponent(url.pathname.slice(mediaRoot.pathname.length))}`;
      }
    } catch (_) { /* Invalid URLs remain unversioned. */ }
    return '';
  }
  function versionURL(value) {
    if (!value) return '';
    const url = new URL(value, document.baseURI);
    const file = manifest.files[mediaPath(value)];
    if (file && /^https?:$/.test(url.protocol)) url.searchParams.set('v', file.version);
    return url.href;
  }
  function thumbnailURL(value) {
    return versionURL(manifest.thumbnails[mediaPath(value)] || value);
  }

  const pendingCovers = new Map();
  const coverObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) showCover(entry.target); });
  }, { rootMargin: '0px' });
  function showCover(node) {
    const cover = pendingCovers.get(node);
    if (!cover) return;
    node[cover.attribute] = cover.url;
    pendingCovers.delete(node);
    coverObserver.unobserve(node);
  }
  function deferCover(node, url, attribute = 'src') {
    if (!url) return;
    pendingCovers.set(node, { url: versionURL(url), attribute });
    coverObserver.observe(node);
  }
  function forgetCover(node) {
    pendingCovers.delete(node);
    coverObserver.unobserve(node);
  }
  function forgetImages(root) { root.querySelectorAll('img').forEach(forgetCover); }

  const handles = new WeakMap();
  let activeGroup = null;
  function register(video, { src, poster }) {
    let position = 0;
    let duration = 0;
    let rate = 1;
    let loaded = false;
    const url = versionURL(src);
    video.preload = 'none';
    deferCover(video, poster, 'poster');
    function restorePosition() {
      if (!loaded) return;
      if (position > 0) video.currentTime = position;
      video.playbackRate = rate;
    }
    video.addEventListener('loadedmetadata', restorePosition);
    const handle = {
      video, group: null,
      get loaded() { return loaded; },
      get currentTime() { return loaded && video.readyState >= 1 ? video.currentTime : position; },
      get duration() { return loaded && Number.isFinite(video.duration) ? video.duration : duration; },
      load() {
        if (loaded || !url) return;
        if (duration > 0 && position >= duration - .04) position = 0;
        loaded = true;
        showCover(video);
        video.src = url;
        video.load();
      },
      seek(value) {
        position = Math.max(0, Number(value) || 0);
        if (loaded && video.readyState >= 1) video.currentTime = position;
      },
      release() {
        if (!loaded) return;
        if (video.readyState >= 1) {
          position = Number(video.currentTime) || 0;
          duration = Number(video.duration) || duration;
          rate = video.playbackRate || 1;
        }
        loaded = false;
        video.pause();
        video.removeAttribute('src');
        // Reset resource selection to abort the pending media request and decode.
        video.load();
      },
      destroy() {
        handle.group?.destroy();
        handle.release();
        forgetCover(video);
        video.removeEventListener('loadedmetadata', restorePosition);
        handles.delete(video);
      }
    };
    handles.set(video, handle);
    return handle;
  }
  function group(items, { element = items[0].video, onRelease = () => {} } = {}) {
    let releasing = false;
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) controller.release();
    });
    const controller = {
      activate() {
        if (activeGroup !== controller) activeGroup?.release();
        activeGroup = controller;
        items.forEach(item => item.load());
      },
      release() {
        if (releasing) return;
        releasing = true;
        onRelease();
        items.forEach(item => item.release());
        if (activeGroup === controller) activeGroup = null;
        releasing = false;
      },
      destroy() { controller.release(); observer.disconnect(); }
    };
    items.forEach(item => { item.group = controller; });
    observer.observe(element);
    return controller;
  }
  function release(video) { handles.get(video)?.group?.release(); }
  function destroy(video) { handles.get(video)?.destroy(); }
  function bindNative(video, { src, poster, isVisible = () => true }) {
    const handle = register(video, { src, poster });
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'media-play-trigger';
    trigger.setAttribute('aria-label', `Play ${video.getAttribute('aria-label') || 'video'}`);
    trigger.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22"/><path d="m20 15 14 9-14 9Z"/></svg>';
    trigger.hidden = !src;
    video.controls = false;
    video.parentElement.append(trigger);
    let attempt = 0;
    const playback = group([handle], {
      onRelease() {
        attempt++;
        video.controls = false;
        trigger.hidden = !src || video.hidden;
      }
    });
    function play() {
      if (!src || document.hidden || !isVisible()) return;
      playback.activate();
      const request = ++attempt;
      trigger.hidden = true;
      video.controls = true;
      Promise.resolve(video.play()).then(() => {
        if (request === attempt && (document.hidden || !isVisible())) playback.release();
      }).catch(() => { if (request === attempt) playback.release(); });
    }
    trigger.addEventListener('click', play);
    video.addEventListener('play', event => {
      if (!handle.loaded || activeGroup !== playback || document.hidden || !isVisible()) {
        event.stopImmediatePropagation();
        video.pause();
        playback.release();
      }
    }, { capture: true });
    video.addEventListener('error', () => { playback.release(); trigger.hidden = true; });
    const destroyHandle = handle.destroy;
    handle.destroy = () => { trigger.remove(); destroyHandle(); };
    return { element: video.parentElement, pause: () => playback.release(), play };
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) activeGroup?.release(); });
  window.addEventListener('pagehide', () => activeGroup?.release());
  window.GameRealmMedia = {
    versionURL, thumbnailURL, deferImage: (image, url) => deferCover(image, url),
    register, group, bindNative, release, destroy, forgetImages,
    activate: video => handles.get(video)?.group?.activate(),
    seek: (video, value) => handles.get(video)?.seek(value)
  };
})();
