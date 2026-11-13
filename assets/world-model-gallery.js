/* Generated clips with read-only indicators for their fixed conditioning inputs. */
(() => {
  'use strict';
  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const svgNode = (tag, attributes) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  };
  const icon = path => {
    const svg = svgNode('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' });
    svg.append(svgNode('path', { d: path }));
    return svg;
  };
  const formatTime = seconds => {
    const value = Math.max(0, Math.floor(Number(seconds) || 0));
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  };

  window.GameRealmWorldModelGallery = ({ grid, media, resolveURL, isVisible, onPlay }) => {
    const players = [];
    const Media = window.GameRealmMedia;
    let inView = true;
    const visible = () => inView && isVisible() && !document.hidden;
    const pause = () => players.forEach(player => player.pause());

    (Array.isArray(media) ? media : []).forEach((clip, index) => {
      const label = typeof clip.label === 'string' ? clip.label : String(index + 1);
      const description = `World Model: ${label} input`;
      const card = create('div', 'world-model-card');
      card.setAttribute('role', 'group');
      card.setAttribute('aria-label', description);
      const viewport = create('div', 'world-model-viewport');
      if (typeof clip.aspectRatio === 'string') viewport.style.setProperty('aspect-ratio', clip.aspectRatio);
      const video = create('video', 'showcase-video');
      video.id = `world-model-video-${index + 1}`;
      video.controls = false;
      video.playsInline = true;
      video.muted = true;
      video.preload = 'none';
      video.setAttribute('aria-label', description);
      const src = resolveURL(clip.src);
      const poster = resolveURL(clip.poster);
      const resource = Media.register(video, { src, poster });
      const empty = create('div', 'world-model-empty', 'Video to be added');
      empty.hidden = Boolean(src);
      video.hidden = !src;

      const inputs = create('div', 'world-model-inputs');
      inputs.setAttribute('aria-hidden', 'true');
      const keyboard = create('div', 'wm-keyboard');
      const keys = new Set((Array.isArray(clip.keys) ? clip.keys : []).map(key => String(key).toUpperCase()));
      ['W', 'A', 'S', 'D'].forEach(key => {
        keyboard.append(create('kbd', `wm-key wm-key-${key.toLowerCase()}${keys.has(key) ? ' is-active' : ''}`, key));
      });
      const stick = create('div', 'wm-joystick');
      const direction = Array.isArray(clip.lookDirection) ? clip.lookDirection : [0, 0];
      const [x, y] = [0, 1].map(axis => Math.max(-1, Math.min(1, Number(direction[axis]) || 0)));
      const joystick = svgNode('svg', { viewBox: '0 0 48 48', focusable: 'false' });
      joystick.append(
        svgNode('circle', { class: 'wm-stick-ring', cx: 24, cy: 24, r: 20 }),
        svgNode('path', { class: 'wm-stick-axes', d: 'M11 24h26M24 11v26' }),
        svgNode('circle', { class: `wm-stick-thumb${x || y ? ' is-active' : ''}`, cx: 24 + x * 11, cy: 24 - y * 11, r: 5.5 })
      );
      stick.append(joystick);
      inputs.append(keyboard, stick);
      viewport.append(video, empty, inputs);
      function updateInputLayout() {
        const width = viewport.clientWidth;
        const height = viewport.clientHeight;
        if (!width || !height) return;
        // Scale the whole HUD with the contained video, including letterboxing.
        const ratio = video.videoWidth > 0 && video.videoHeight > 0 ? video.videoWidth / video.videoHeight : 5 / 3;
        const designWidth = 640;
        const designHeight = designWidth / ratio;
        const scale = Math.min(width / designWidth, height / designHeight);
        const left = (width - designWidth * scale) / 2;
        const top = (height - designHeight * scale) / 2;
        inputs.style.width = `${designWidth}px`;
        inputs.style.height = `${designHeight}px`;
        inputs.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
      }

      const controls = create('div', 'tracking-compare-controls wm-controls');
      const play = create('button', 'wm-play');
      play.type = 'button';
      const playIcon = icon('m9 6 9 6-9 6Z');
      play.append(playIcon);
      const seek = create('input', 'tracking-compare-seek wm-seek');
      seek.type = 'range'; seek.min = '0'; seek.max = '1'; seek.step = '0.01'; seek.value = '0';
      seek.setAttribute('aria-label', `Seek ${description}`);
      const time = create('span', 'tracking-compare-time', '0:00 / 0:00');
      time.setAttribute('aria-hidden', 'true');
      const fullscreen = create('button', 'wm-fullscreen');
      fullscreen.type = 'button';
      fullscreen.setAttribute('aria-label', `Fullscreen ${description}`);
      fullscreen.hidden = typeof card.requestFullscreen !== 'function';
      fullscreen.append(icon('M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5'));
      controls.append(play, seek, time, fullscreen);
      const status = create('span', 'showcase-status');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      card.append(viewport, controls, status);

      let wanted = false;
      let attempt = 0;
      let failed = !src;
      function update() {
        const duration = resource.duration > 0 ? resource.duration : 0;
        const current = Math.max(0, Math.min(duration, resource.currentTime || 0));
        seek.max = String(duration || 1);
        seek.value = String(current);
        seek.disabled = failed || !duration;
        seek.setAttribute('aria-valuetext', `${formatTime(current)} of ${formatTime(duration)}`);
        time.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
        play.disabled = failed;
        play.setAttribute('aria-label', `${wanted ? 'Pause' : 'Play'} ${description}`);
        play.setAttribute('aria-pressed', String(wanted));
        playIcon.querySelector('path').setAttribute('d', wanted ? 'M9 6v12M15 6v12' : 'm9 6 9 6-9 6Z');
      }
      function stop() {
        resourceGroup.release();
      }
      const resourceGroup = Media.group([resource], { element: card, onRelease() {
        wanted = false;
        attempt++;
        update();
      } });
      const controller = { pause: stop };
      function start() {
        if (failed || !visible()) return;
        if (typeof onPlay === 'function') onPlay();
        players.forEach(other => { if (other !== controller) other.pause(); });
        resourceGroup.activate();
        if (Number.isFinite(video.duration) && video.currentTime >= video.duration - .04) video.currentTime = 0;
        wanted = true;
        const request = ++attempt;
        update();
        let playback;
        try { playback = Promise.resolve(video.play()); }
        catch (_) { playback = Promise.reject(new Error('Playback unavailable')); }
        playback.then(() => {
          if (request !== attempt) return;
          if (!wanted || !visible()) stop();
        }).catch(() => {
          if (request !== attempt) return;
          stop();
          status.textContent = 'The video could not start. Try playing it again.';
        });
      }
      play.addEventListener('click', () => { if (wanted) stop(); else start(); });
      seek.addEventListener('input', () => {
        resource.seek(Math.min(resource.duration || 0, Number(seek.value) || 0));
        update();
      });
      ['loadedmetadata', 'durationchange', 'timeupdate', 'seeked'].forEach(event => video.addEventListener(event, update));
      video.addEventListener('loadedmetadata', updateInputLayout);
      video.addEventListener('play', () => {
        if (!wanted || !visible()) { stop(); return; }
        status.textContent = '';
        update();
      });
      video.addEventListener('pause', () => {
        if (video.paused) { wanted = false; attempt++; }
        update();
      });
      video.addEventListener('ended', stop);
      video.addEventListener('error', () => {
        failed = true;
        stop();
        video.hidden = true;
        inputs.hidden = true;
        empty.hidden = false;
        empty.textContent = 'Video unavailable';
        status.textContent = `${description} could not be loaded.`;
      }, { once: true });
      fullscreen.addEventListener('click', () => {
        const action = document.fullscreenElement === card ? document.exitFullscreen() : card.requestFullscreen();
        if (action && typeof action.catch === 'function') action.catch(() => {});
      });
      document.addEventListener('fullscreenchange', () => {
        fullscreen.setAttribute('aria-label', `${document.fullscreenElement === card ? 'Exit fullscreen' : 'Fullscreen'} ${description}`);
        updateInputLayout();
      });
      players.push(controller);
      grid.append(card);
      update();
      const resizeObserver = new ResizeObserver(updateInputLayout);
      resizeObserver.observe(viewport);
      updateInputLayout();
    });

    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (!inView) pause();
    });
    observer.observe(grid);
    return { pause };
  };
})();
