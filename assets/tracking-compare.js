/* Synchronized paired-video comparison with an accessible reveal slider. */
(() => {
  'use strict';
  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  function icon(path) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shape.setAttribute('d', path);
    svg.append(shape);
    return svg;
  }
  const formatTime = seconds => {
    const value = Math.max(0, Math.floor(Number(seconds) || 0));
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  };

  window.GameRealmVideoComparison = ({
    media, index, resolveURL, isVisible, onPlay,
    idPrefix = 'tracking', labelPrefix = 'Tracking',
    leftLabel = 'RGB camera tracks', rightLabel = 'RGBD tracks', comparisonSuffix = 'rgbd'
  }) => {
    const comparison = media.comparison || {};
    const Media = window.GameRealmMedia;
    const label = `${labelPrefix} video ${index + 1}`;
    const specs = [
      { ...media, label: media.label || leftLabel },
      { ...comparison, label: comparison.label || rightLabel }
    ];
    const card = create('div', 'tracking-card tracking-compare-card');
    card.classList.add(`${idPrefix}-card`);
    if (media.fullWidth) card.classList.add('tracking-compare-card-wide');
    else if (media.halfWidth) card.classList.add('tracking-compare-card-half');
    card.setAttribute('role', 'group');
    card.setAttribute('aria-label', `${label} comparison`);
    const viewport = create('div', 'tracking-comparison');
    if (typeof media.aspectRatio === 'string') viewport.style.setProperty('--comparison-aspect-ratio', media.aspectRatio);
    viewport.style.setProperty('--comparison-position', '50%');
    const sides = specs.map((spec, sideIndex) => {
      const layer = create('div', `tracking-compare-side tracking-compare-${sideIndex ? 'right' : 'left'}`);
      const video = create('video', 'showcase-video');
      video.id = `${idPrefix}-video-${index + 1}${sideIndex ? `-${comparisonSuffix}` : ''}`;
      video.controls = false;
      video.playsInline = true;
      video.preload = 'none';
      video.muted = sideIndex === 1;
      video.setAttribute('aria-label', `${label}: ${spec.label}`);
      const src = resolveURL(spec.src);
      const poster = resolveURL(spec.poster);
      const resource = Media.register(video, { src, poster });
      const placeholder = create('div', 'tracking-empty', 'Video to be added');
      placeholder.hidden = Boolean(src);
      const badge = create('span', 'tracking-compare-label', spec.label);
      layer.append(video, placeholder, badge);
      viewport.append(layer);
      return { video, placeholder, src, resource };
    });
    const pair = sides.map(side => side.video);
    const [primary, secondary] = pair;
    const reveal = create('input', 'tracking-compare-slider');
    reveal.type = 'range'; reveal.min = '0'; reveal.max = '100'; reveal.step = '1'; reveal.value = '50';
    reveal.setAttribute('aria-label', `${label}: comparison split`);
    const divider = create('div', 'tracking-compare-divider');
    divider.setAttribute('aria-hidden', 'true');
    const handle = create('span', 'tracking-compare-handle');
    handle.append(icon('m9 8-4 4 4 4m6-8 4 4-4 4'));
    divider.append(handle);
    viewport.append(reveal, divider);
    const controls = create('div', 'tracking-compare-controls');
    const playButton = create('button', 'tracking-compare-play');
    playButton.type = 'button';
    const playIcon = icon('m9 6 9 6-9 6Z');
    playButton.append(playIcon);
    const seek = create('input', 'tracking-compare-seek');
    seek.type = 'range'; seek.min = '0'; seek.max = '1'; seek.step = '0.01'; seek.value = '0'; seek.disabled = true;
    seek.setAttribute('aria-label', `Seek ${label}`);
    const time = create('span', 'tracking-compare-time', '0:00 / 0:00');
    time.setAttribute('aria-hidden', 'true');
    const fullscreen = create('button', 'tracking-compare-fullscreen');
    fullscreen.type = 'button';
    fullscreen.setAttribute('aria-label', `Fullscreen ${label}`);
    fullscreen.append(icon('M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5'));
    fullscreen.hidden = typeof card.requestFullscreen !== 'function';
    controls.append(playButton, seek, time, fullscreen);
    const status = create('span', 'showcase-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    card.append(viewport, controls, status);

    let duration = 0;
    let wanted = false;
    let starting = false;
    let attempt = 0;
    let clock = null;
    let failed = sides.some(side => !side.src);
    playButton.disabled = failed;
    const visible = () => isVisible() && !document.hidden;
    function updateButton() {
      playButton.setAttribute('aria-label', `${wanted ? 'Pause' : 'Play'} ${label}`);
      playButton.setAttribute('aria-pressed', String(wanted));
      playIcon.querySelector('path').setAttribute('d', wanted ? 'M9 6v12M15 6v12' : 'm9 6 9 6-9 6Z');
    }
    function updateProgress() {
      const current = Math.max(0, Math.min(duration, sides[0].resource.currentTime || 0));
      seek.value = String(current);
      seek.setAttribute('aria-valuetext', `${formatTime(current)} of ${formatTime(duration)}`);
      time.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    }
    function stopClock() {
      if (clock !== null) clearInterval(clock);
      clock = null;
    }
    function pause() {
      playback.release();
    }
    const playback = Media.group(sides.map(side => side.resource), { element: card, onRelease() {
      wanted = false; starting = false; attempt++;
      stopClock();
      updateButton(); updateProgress();
    } });
    function alignSecondary() {
      if (secondary.readyState >= 1 && Math.abs((secondary.currentTime || 0) - (primary.currentTime || 0)) > .08) {
        secondary.currentTime = primary.currentTime || 0;
      }
      secondary.playbackRate = primary.playbackRate || 1;
    }
    function sync() {
      if (!wanted) return;
      if (!visible()) { pause(); return; }
      alignSecondary();
      updateProgress();
      if (duration && primary.currentTime >= duration) pause();
    }
    function resume() {
      if (!wanted || failed || !visible()) return;
      const request = ++attempt;
      starting = true;
      alignSecondary();
      let playback;
      try { playback = Promise.all(pair.map(video => video.play())); }
      catch (_) { playback = Promise.reject(new Error('Playback unavailable')); }
      playback.then(() => {
        if (request !== attempt || !wanted) return;
        starting = false;
        if (!visible()) { pause(); return; }
        status.textContent = '';
        stopClock();
        clock = setInterval(sync, 100);
        sync();
      }).catch(() => {
        if (request !== attempt || !wanted) return;
        pause();
        status.textContent = 'The comparison could not start. Try playing it again.';
      });
    }
    function seekTo(value) {
      const target = Math.max(0, Math.min(duration, Number(value) || 0));
      sides.forEach(side => side.resource.seek(target));
      updateProgress();
    }
    function start() {
      if (failed || !visible()) return;
      onPlay(controller);
      playback.activate();
      if (duration && primary.currentTime >= duration - .04) seekTo(0);
      wanted = true;
      updateButton();
      resume();
    }
    function updateDuration() {
      const values = pair.map(video => video.duration);
      duration = values.every(value => Number.isFinite(value) && value > 0) ? Math.min(...values) : 0;
      seek.max = String(duration || 1);
      seek.disabled = failed || !duration;
      updateProgress();
    }
    playButton.addEventListener('click', () => { if (wanted) pause(); else start(); });
    seek.addEventListener('input', () => seekTo(seek.value));
    function updateReveal() {
      const position = Math.max(0, Math.min(100, Number(reveal.value) || 0));
      viewport.style.setProperty('--comparison-position', `${position}%`);
      reveal.setAttribute('aria-valuetext', `${specs[0].label} ${position}%, ${specs[1].label} ${100 - position}%`);
    }
    reveal.addEventListener('input', updateReveal);
    updateReveal();
    pair.forEach((video, sideIndex) => {
      video.addEventListener('loadedmetadata', updateDuration);
      video.addEventListener('play', () => {
        if (!wanted || !visible()) video.pause();
      });
      video.addEventListener('ended', pause);
      video.addEventListener('waiting', () => {
        if (!wanted || starting || video.paused) return;
        attempt++; starting = false; stopClock();
        pair.forEach(item => { if (item !== video) item.pause(); });
        status.textContent = 'Loading comparison videos.';
      });
      const ready = () => {
        if (wanted && !starting && pair.every(item => item.readyState >= 2) && pair.some(item => item.paused)) resume();
      };
      video.addEventListener('canplay', ready);
      video.addEventListener('seeked', ready);
      video.addEventListener('error', () => {
        failed = true;
        pause();
        video.hidden = true;
        sides[sideIndex].placeholder.hidden = false;
        sides[sideIndex].placeholder.textContent = 'Video unavailable';
        playButton.disabled = true; seek.disabled = true;
        status.textContent = `${specs[sideIndex].label} could not be loaded.`;
      });
    });
    primary.addEventListener('timeupdate', sync);
    primary.addEventListener('ratechange', alignSecondary);
    fullscreen.addEventListener('click', () => {
      const action = document.fullscreenElement === card ? document.exitFullscreen() : card.requestFullscreen();
      if (action && typeof action.catch === 'function') action.catch(() => {});
    });
    document.addEventListener('fullscreenchange', () => fullscreen.setAttribute('aria-label', `${document.fullscreenElement === card ? 'Exit fullscreen' : 'Fullscreen'} ${label}`));
    updateButton();
    const controller = { element: card, pause };
    return controller;
  };
  window.GameRealmTrackingComparison = window.GameRealmVideoComparison;
})();
