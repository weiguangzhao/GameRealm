/* GameRealm: dependency-free interactions and original illustrative artwork. */
(() => {
  'use strict';
  const config = window.GAMEREALM_CONTENT || {};
  const Media = window.GameRealmMedia;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let phase = 0;
  let raf = 0;
  let previousTime = 0;
  const setText = (selector, value) => {
    const el = $(selector);
    if (el && typeof value === 'string' && value.trim()) el.textContent = value;
  };
  // Accept ordinary web URLs and relative files, never script/data URLs.
  function safeURL(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    const raw = value.trim();
    try {
      const url = new URL(raw, document.baseURI);
      if (['https:', 'http:'].includes(url.protocol)) return Media.versionURL(url.href);
      if (location.protocol === 'file:' && url.protocol === 'file:' && !/^[a-z]+:/i.test(raw)) return url.href;
    } catch (_) { /* An invalid editor value stays unpublished. */ }
    return '';
  }
  setText('#hero-tagline', config.tagline);
  setText('#footer-note', config.footerNote);
  if (typeof config.title === 'string' && config.title.trim()) {
    const title = config.title.trim();
    const heading = $('#hero-title');
    if (heading) heading.textContent = title;
    $$('.brand > span:last-child').forEach(el => { el.textContent = title; });
    document.title = `${title} — ${config.tagline || 'Grounding World Understanding in Games'}`;
    $('meta[property="og:title"]').content = document.title;
    $('.brand').setAttribute('aria-label', `${title} home`);
  }
  if (config.heroDescription) {
    $('meta[name="description"]').content = config.heroDescription;
    $('meta[property="og:description"]').content = config.heroDescription;
  }
  $('#year').textContent = String(new Date().getFullYear());
  function initViewpointPlayer() {
    const panel = $('#viewpoint-panel');
    const tabs = $$('#viewpoint-tabs button[data-modality]');
    if (!panel || !tabs.length) return;
    const viewport = $('#viewpoint-viewport');
    const empty = $('#viewpoint-empty');
    const grids = [
      { id: 'single-view', label: 'Single-View', count: 8, node: $('#single-view-grid'), rendered: false },
      { id: 'stereo', label: 'Stereo', count: 6, node: $('#stereo-grid'), rendered: false },
      { id: 'multi-view', label: 'Multi-View', count: 3, node: $('#multi-view-grid'), rendered: false },
      { id: 'panoramic', label: 'Panoramic', count: 4, node: $('#panoramic-grid'), rendered: false }
    ];
    const gridVideos = [];
    let currentVideo = null;
    let selectedTab = null;
    function pauseVideos() {
      if (currentVideo) Media.release(currentVideo);
      gridVideos.forEach(video => Media.release(video));
    }
    function renderViewpointGrid(state) {
      if (state.rendered) return;
      state.rendered = true;
      const grid = state.node;
      const configured = (config.viewpointVideos || {})[state.id];
      const clips = Array.isArray(configured) ? configured : [configured || {}];
      for (let index = 0; index < state.count; index++) {
        const media = clips[index] || {};
        const label = `${state.label} video ${index + 1}`;
        const card = document.createElement('div');
        card.className = `${state.id}-card`;
        if (typeof media.aspectRatio === 'string') card.style.setProperty('aspect-ratio', media.aspectRatio);
        card.setAttribute('role', 'group');
        card.setAttribute('aria-label', label);
        const placeholder = document.createElement('div');
        placeholder.className = `${state.id}-empty`;
        const icon = $('.showcase-play-icon svg', empty).cloneNode(true);
        icon.setAttribute('aria-hidden', 'true');
        const note = document.createElement('span');
        note.textContent = 'Video to be added';
        placeholder.append(icon, note);
        card.append(placeholder);
        const url = safeURL(media.src);
        if (url) {
          const video = document.createElement('video');
          video.id = `${state.id}-video-${index + 1}`;
          video.className = 'showcase-video';
          video.controls = true;
          video.playsInline = true;
          video.preload = 'none';
          video.setAttribute('aria-label', label);
          const poster = safeURL(media.poster);
          video.addEventListener('error', () => {
            Media.release(video);
            video.hidden = true;
            placeholder.hidden = false;
            note.textContent = 'Video unavailable';
          });
          gridVideos.push(video);
          card.append(video);
          Media.bindNative(video, { src: url, poster, isVisible: () => !grid.hidden });
          placeholder.hidden = true;
        }
        grid.append(card);
      }
    }
    function selectViewpoint(tab, focus = false) {
      if (focus) tab.focus();
      const selectedGrid = grids.find(state => state.id === tab.dataset.modality);
      if (selectedTab === tab && selectedGrid) return;
      if (selectedTab === tab && currentVideo && !currentVideo.error) {
        return;
      }
      selectedTab = tab;
      tabs.forEach(option => {
        const selected = option === tab;
        option.setAttribute('aria-selected', String(selected));
        option.tabIndex = selected ? 0 : -1;
      });
      $$('[data-viewpoint]').forEach(link => {
        if (link.dataset.viewpoint === tab.dataset.modality) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      panel.setAttribute('aria-labelledby', tab.id);
      pauseVideos();
      if (currentVideo) {
        const previous = currentVideo;
        currentVideo = null;
        Media.destroy(previous);
        previous.remove();
      }
      panel.classList.toggle('is-grid-view', Boolean(selectedGrid));
      grids.forEach(state => { state.node.hidden = state !== selectedGrid; });
      viewport.hidden = Boolean(selectedGrid);
      if (selectedGrid) {
        renderViewpointGrid(selectedGrid);
        setText('#viewpoint-status', `${selectedGrid.label} video gallery selected.`);
        return;
      }
      const label = tab.textContent.trim();
      const media = (config.viewpointVideos || {})[tab.dataset.modality] || {};
      const url = safeURL(media.src);
      setText('#viewpoint-empty-title', `${label} video`);
      setText('#viewpoint-empty-note', 'Video to be added.');
      empty.hidden = false;
      setText('#viewpoint-status', `${label} video has not been added yet.`);
      if (!url) return;
      const video = document.createElement('video');
      currentVideo = video;
      video.id = 'viewpoint-video';
      video.className = 'showcase-video';
      video.controls = true;
      video.playsInline = true;
      video.preload = 'none';
      video.setAttribute('aria-label', `${label} video`);
      const poster = safeURL(media.poster);
      video.addEventListener('error', () => {
        if (currentVideo !== video) return;
        Media.release(video);
        video.hidden = true;
        empty.hidden = false;
        setText('#viewpoint-empty-note', 'This video is temporarily unavailable.');
        setText('#viewpoint-status', `${label} video could not be loaded.`);
      });
      viewport.append(video);
      Media.bindNative(video, { src: url, poster, isVisible: () => !viewport.hidden });
      empty.hidden = true;
      setText('#viewpoint-status', `${label} video selected.`);
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectViewpoint(tab));
      tab.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        selectViewpoint(tabs[next], true);
      });
    });
    $$('[data-viewpoint]').forEach(link => link.addEventListener('click', event => {
      if (link.classList.contains('viewpoint-card-link')) event.preventDefault();
      const tab = tabs.find(item => item.dataset.modality === link.dataset.viewpoint);
      if (tab) selectViewpoint(tab);
    }));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseVideos();
    });
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) pauseVideos();
    });
    observer.observe(panel);
    selectViewpoint(tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0]);
  }
  initViewpointPlayer();
  function initModalityNavigation() {
    const buttons = $$('#modality-tabs button[data-modality]');
    const galleries = [
      { id: 'depth', count: 4, panel: $('#depth-panel'), grid: $('#depth-grid'), rendered: false, players: [], options: { idPrefix: 'depth', labelPrefix: 'Depth', leftLabel: 'RGB', rightLabel: 'Depth', comparisonSuffix: 'depth' } },
      { id: 'camera', count: 4, panel: $('#camera-panel'), grid: $('#camera-grid'), rendered: false, players: [], options: {} },
      { id: 'tracking', count: 6, panel: $('#tracking-panel'), grid: $('#tracking-grid'), rendered: false, players: [], options: {} },
      { id: 'audio', count: 4, panel: $('#audio-panel'), grid: $('#audio-grid'), rendered: false, players: [], options: {} },
      { id: 'keypress', count: 4, panel: $('#keypress-panel'), grid: $('#keypress-grid'), rendered: false, players: [], options: {} },
      { id: 'text', count: 1, panel: $('#text-panel'), grid: $('#text-examples'), rendered: false, players: [], options: {} }
    ];
    if (!buttons.length || galleries.some(gallery => !gallery.panel || !gallery.grid)) return;
    const players = [];
    let activeButton = null;
    function pauseVideos() {
      players.forEach(player => player.pause());
    }
    function buildCameraExample(media, index) {
      const label = typeof media.label === 'string' ? media.label : `Camera trajectory ${index + 1}`;
      const card = document.createElement('figure');
      card.className = 'camera-card';
      const frame = document.createElement('div');
      frame.className = 'camera-frame';
      const image = document.createElement('img');
      image.alt = `${label} 3D camera trajectory`;
      image.loading = 'lazy';
      image.decoding = 'async';
      if (media.width > 0 && media.height > 0) {
        image.width = media.width;
        image.height = media.height;
        frame.style.setProperty('aspect-ratio', `${media.width} / ${media.height}`);
      }
      const src = safeURL(media.src);
      const empty = document.createElement('div');
      empty.className = 'camera-empty';
      empty.setAttribute('role', 'status');
      empty.textContent = 'GIF to be added';
      empty.hidden = Boolean(src);
      image.hidden = !src;
      image.addEventListener('error', () => {
        image.hidden = true;
        empty.hidden = false;
        empty.textContent = 'GIF unavailable';
      }, { once: true });
      frame.append(image, empty);
      card.append(frame);
      if (src) Media.deferImage(image, src);
      return card;
    }
    function buildModalityVideo(media, index, gallery) {
      const card = document.createElement('div');
      card.className = `${gallery.id}-card${media.halfWidth ? ` ${gallery.id}-card-half` : ''}`;
      if (typeof media.aspectRatio === 'string') card.style.setProperty('aspect-ratio', media.aspectRatio);
      const video = document.createElement('video');
      video.id = `${gallery.id}-video-${index + 1}`;
      video.className = 'showcase-video';
      video.controls = true;
      video.playsInline = true;
      video.preload = 'none';
      const label = gallery.id === 'keypress' ? 'Keypress' : 'Audio';
      video.setAttribute('aria-label', `${label} example ${index + 1}${media.label ? `: ${media.label}` : ''}`);
      const src = safeURL(media.src);
      const poster = safeURL(media.poster);
      const empty = document.createElement('div');
      empty.className = 'tracking-empty';
      empty.setAttribute('role', 'status');
      empty.textContent = 'Video to be added';
      empty.hidden = Boolean(src);
      video.hidden = !src;
      card.append(video, empty);
      const controller = Media.bindNative(video, { src, poster, isVisible: () => !gallery.panel.hidden && gallery.inView !== false });
      video.addEventListener('error', () => {
        Media.release(video);
        video.hidden = true;
        empty.hidden = false;
        empty.textContent = 'Video unavailable';
      }, { once: true });
      return controller;
    }
    function buildTextExample(media, index, gallery) {
      const create = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
      };
      const example = create('article', 'text-example');
      example.setAttribute('aria-label', `Text example ${index + 1}`);
      const viewport = create('div', 'text-video-viewport');
      if (typeof media.aspectRatio === 'string') viewport.style.setProperty('aspect-ratio', media.aspectRatio);
      const video = create('video', 'showcase-video');
      video.id = `text-video-${index + 1}`;
      video.controls = true;
      video.playsInline = true;
      video.preload = 'none';
      video.setAttribute('aria-label', `Text example ${index + 1}: cam1, cam2 and cam3`);
      const src = safeURL(media.src);
      const poster = safeURL(media.poster);
      const empty = create('div', 'tracking-empty', 'Video to be added');
      empty.setAttribute('role', 'status');
      empty.hidden = Boolean(src);
      video.hidden = !src;
      viewport.append(video, empty);
      const captionGrid = create('div', 'text-caption-grid');
      ['cam1', 'cam2', 'cam3', 'global'].forEach(key => {
        const card = create('section', `text-caption-card${key === 'global' ? ' text-caption-global' : ''}`);
        const heading = create('h4', '', key);
        heading.id = `text-caption-${index + 1}-${key}`;
        card.setAttribute('aria-labelledby', heading.id);
        const caption = (media.captions || {})[key];
        card.append(heading, create('p', '', typeof caption === 'string' && caption.trim() ? caption : 'Caption to be added.'));
        captionGrid.append(card);
      });
      example.append(viewport, captionGrid);
      const controller = Media.bindNative(video, { src, poster, isVisible: () => !gallery.panel.hidden });
      controller.element = example;
      video.addEventListener('error', () => {
        Media.release(video);
        video.hidden = true;
        empty.hidden = false;
        empty.textContent = 'Video unavailable';
      }, { once: true });
      return controller;
    }
    function renderGallery(gallery) {
      if (gallery.rendered) return;
      gallery.rendered = true;
      const configured = (config.modalityVideos || {})[gallery.id];
      const clips = Array.isArray(configured) ? configured : [];
      for (let index = 0; index < Math.max(gallery.count, clips.length); index++) {
        const media = clips[index] || {};
        if (gallery.id === 'camera') {
          gallery.grid.append(buildCameraExample(media, index));
          continue;
        }
        const player = ['audio', 'keypress'].includes(gallery.id) ? buildModalityVideo(media, index, gallery)
          : gallery.id === 'text' ? buildTextExample(media, index, gallery) : window.GameRealmVideoComparison({
          ...gallery.options,
          media, index, resolveURL: safeURL,
          isVisible: () => !gallery.panel.hidden,
          onPlay: active => players.forEach(other => { if (other !== active) other.pause(); })
        });
        players.push(player);
        gallery.players.push(player);
        gallery.grid.append(player.element);
      }
    }
    function selectModality(button) {
      if (activeButton === button) return;
      activeButton = button;
      buttons.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
      $$('[data-modality-select]').forEach(link => {
        if (link.dataset.modalitySelect === button.dataset.modality) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      pauseVideos();
      galleries.forEach(gallery => {
        gallery.panel.hidden = button.dataset.modality !== gallery.id;
        if (!gallery.panel.hidden) renderGallery(gallery);
      });
    }
    buttons.forEach(button => button.addEventListener('click', () => selectModality(button)));
    $$('[data-modality-select]').forEach(link => link.addEventListener('click', event => {
      if (link.classList.contains('modality-card-link')) event.preventDefault();
      const button = buttons.find(item => item.dataset.modality === link.dataset.modalitySelect);
      if (button) selectModality(button);
    }));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseVideos();
    });
    galleries.forEach(gallery => {
      const observer = new IntersectionObserver(entries => {
        gallery.inView = entries[0].isIntersecting;
        if (!entries[0].isIntersecting) gallery.players.forEach(player => player.pause());
      });
      observer.observe(gallery.panel);
    });
    selectModality(buttons.find(button => button.getAttribute('aria-pressed') === 'true') || buttons[0]);
  }
  initModalityNavigation();
  const modelButtons = $$('#finetuned-model-tabs button[data-model]');
  const modelPanels = $$('#finetuned-models [data-model-panel]');
  const finetunedTrackingGrid = $('#finetuned-tracking-grid');
  const finetunedTrackingPlayers = [];
  let finetunedTrackingRendered = false;
  let finetunedTrackingInView = true;
  function pauseFinetunedTracking() { finetunedTrackingPlayers.forEach(player => player.pause()); }
  function renderFinetunedTracking() {
    if (!finetunedTrackingGrid || finetunedTrackingRendered) return;
    finetunedTrackingRendered = true;
    const clips = Array.isArray(config.finetunedTrackingVideos) ? config.finetunedTrackingVideos : [];
    clips.forEach((media, index) => {
      const player = window.GameRealmVideoComparison({
        media, index, resolveURL: safeURL, idPrefix: 'vgl-tracking',
        labelPrefix: media.name || 'VGL Tracking', rightLabel: 'RGBD world tracks',
        isVisible: () => finetunedTrackingInView && !$('#finetuned-visual-geometry-panel').hidden,
        onPlay: active => finetunedTrackingPlayers.forEach(other => { if (other !== active) other.pause(); })
      });
      finetunedTrackingPlayers.push(player);
      finetunedTrackingGrid.append(player.element);
    });
  }
  if (finetunedTrackingGrid) {
    const observer = new IntersectionObserver(entries => {
      finetunedTrackingInView = entries[0].isIntersecting;
      if (!finetunedTrackingInView) pauseFinetunedTracking();
    });
    observer.observe(finetunedTrackingGrid);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseFinetunedTracking(); });
  const reconstructionRoot = $('#reconstruction-gallery');
  const reconstructionGallery = reconstructionRoot ? window.GameRealmReconstructionGallery({
    root: reconstructionRoot, samples: config.reconstructionSamples, resolveURL: safeURL,
    localPreviewURL: config.localPreviewURL,
    isVisible: () => !$('#finetuned-visual-geometry-panel').hidden
  }) : null;
  const modelVideos = [];
  function pauseModelVideos() {
    modelVideos.forEach(video => Media.release(video));
  }
  const worldModelGrid = $('#world-model-grid');
  const worldModelGallery = worldModelGrid ? window.GameRealmWorldModelGallery({
    grid: worldModelGrid,
    media: config.worldModelVideos,
    resolveURL: safeURL,
    isVisible: () => !$('#finetuned-world-model-panel').hidden,
    onPlay: pauseModelVideos
  }) : null;
  function initModelVideoGallery({ idPrefix, media: items, cardClass, title, aspectRatio }) {
    const grid = $(`#${idPrefix}-grid`);
    if (!grid) return;
    const clips = Array.isArray(items) ? items : [];
    const galleryVideos = [];
    let inView = true;
    clips.forEach((media, index) => {
      const label = `${title} video ${index + 1}`;
      const card = document.createElement('div');
      card.className = cardClass;
      card.style.setProperty('aspect-ratio', media.aspectRatio || aspectRatio);
      card.setAttribute('role', 'group');
      card.setAttribute('aria-label', label);
      const video = document.createElement('video');
      video.id = `${idPrefix}-video-${index + 1}`;
      video.className = 'showcase-video';
      video.controls = true;
      video.playsInline = true;
      video.preload = 'none';
      video.setAttribute('aria-label', label);
      const src = safeURL(media.src);
      const poster = safeURL(media.poster);
      const empty = document.createElement('div');
      empty.className = 'panoramic-empty';
      empty.textContent = 'Video to be added';
      empty.setAttribute('role', 'status');
      empty.hidden = Boolean(src);
      video.hidden = !src;
      video.addEventListener('error', () => {
        Media.release(video);
        video.hidden = true;
        empty.hidden = false;
        empty.textContent = 'Video unavailable';
      }, { once: true });
      card.append(video, empty);
      grid.append(card);
      galleryVideos.push(video);
      modelVideos.push(video);
      Media.bindNative(video, { src, poster, isVisible: () => inView && !$('#finetuned-world-model-panel').hidden });
    });
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (!inView) galleryVideos.forEach(video => Media.release(video));
    });
    observer.observe(grid);
  }
  initModelVideoGallery({
    idPrefix: 'multi-view-world-model', media: config.multiViewWorldModelVideos,
    cardClass: 'multi-view-card', title: 'Multi-View World Model', aspectRatio: '10 / 3'
  });
  initModelVideoGallery({
    idPrefix: 'panoramic-world-model', media: config.panoramicWorldModelVideos,
    cardClass: 'panoramic-card', title: 'Panoramic World Model', aspectRatio: '2 / 1'
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseModelVideos(); });
  function selectModelDirection(button) {
    if (!button) return;
    modelButtons.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    $$('[data-model-select]').forEach(link => {
      if (link.dataset.modelSelect === button.dataset.model) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    modelPanels.forEach(panel => { panel.hidden = panel.dataset.modelPanel !== button.dataset.model; });
    if (button.dataset.model === 'visual-geometry') renderFinetunedTracking();
    else pauseFinetunedTracking();
    if (reconstructionGallery) reconstructionGallery.setVisible(button.dataset.model === 'visual-geometry');
    if (button.dataset.model !== 'world-model') {
      if (worldModelGallery) worldModelGallery.pause();
      pauseModelVideos();
    }
  }
  modelButtons.forEach(button => button.addEventListener('click', () => selectModelDirection(button)));
  $$('[data-model-select]').forEach(link => link.addEventListener('click', event => {
    if (link.classList.contains('model-card-link')) event.preventDefault();
    const button = modelButtons.find(item => item.dataset.model === link.dataset.modelSelect);
    if (button) selectModelDirection(button);
  }));
  const requestedModel = new URLSearchParams(location.search).get('model');
  selectModelDirection(modelButtons.find(button => button.dataset.model === requestedModel)
    || modelButtons.find(button => button.getAttribute('aria-pressed') === 'true') || modelButtons[0]);
  $$('.resource-link').forEach(link => {
    const resource = (config.resources || {})[link.dataset.resource] || {};
    const url = safeURL(resource.url);
    if (!url) return;
    link.href = url;
    link.removeAttribute('aria-disabled'); link.removeAttribute('tabindex');
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    const badge = $('.soon', link);
    if (badge) badge.remove();
    const status = $('.resource-status', link);
    if (status) status.textContent = 'AVAILABLE';
    if ($('h3', link)) setText(`.resource-card[data-resource="${link.dataset.resource}"] h3`, resource.label);
  });
  function initVideoShowcase() {
    const directory = $('#showcase-directory');
    if (!directory) return;
    const groups = (Array.isArray(config.videoShowcase) ? config.videoShowcase : [])
      .filter(group => group && typeof group.label === 'string' && Array.isArray(group.cases) && group.cases.length);
    if (!groups.length) return;
    const viewport = $('#showcase-viewport');
    const videoPrev = $('#showcase-video-prev');
    const videoNext = $('#showcase-video-next');
    const empty = $('#showcase-empty');
    const thumbnails = $('#showcase-thumbnails');
    const thumbnailsPrev = $('#showcase-thumbnails-prev');
    const thumbnailsNext = $('#showcase-thumbnails-next');
    const thumbnailButtons = [];
    const categoryButtons = new Map();
    let currentVideo = null;
    let selectedCase = null;
    let thumbnailGroup = null;
    let thumbnailDrag = null;
    let suppressThumbnailClick = false;

    function maxThumbnailScroll() {
      return Math.max(0, thumbnails.scrollWidth - thumbnails.clientWidth);
    }
    function updateThumbnailControls() {
      const maximum = maxThumbnailScroll();
      thumbnailsPrev.disabled = thumbnails.scrollLeft <= 1;
      thumbnailsNext.disabled = thumbnails.scrollLeft >= maximum - 1;
    }
    function scrollThumbnailWindow(left) {
      thumbnails.scrollTo({
        left: Math.max(0, Math.min(maxThumbnailScroll(), left)),
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
      updateThumbnailControls();
    }
    function scrollThumbnailStep(direction) {
      const first = thumbnailButtons[0];
      if (!first) return;
      const step = thumbnailButtons[1] ? thumbnailButtons[1].offsetLeft - first.offsetLeft : first.offsetWidth;
      scrollThumbnailWindow(thumbnails.scrollLeft + direction * step);
    }
    thumbnailsPrev.addEventListener('click', () => scrollThumbnailStep(-1));
    thumbnailsNext.addEventListener('click', () => scrollThumbnailStep(1));
    thumbnails.addEventListener('scroll', updateThumbnailControls, { passive: true });
    thumbnails.addEventListener('keydown', event => {
      if (event.target !== thumbnails) return;
      if (event.key === 'ArrowLeft') scrollThumbnailStep(-1);
      else if (event.key === 'ArrowRight') scrollThumbnailStep(1);
      else if (event.key === 'Home') scrollThumbnailWindow(0);
      else if (event.key === 'End') scrollThumbnailWindow(maxThumbnailScroll());
      else return;
      event.preventDefault();
    });
    // Touch and trackpad scrolling stay native; mouse users can drag the strip.
    thumbnails.addEventListener('pointerdown', event => {
      suppressThumbnailClick = false;
      thumbnailDrag = null;
      if (event.pointerType !== 'mouse' || event.button !== 0 || maxThumbnailScroll() <= 0) return;
      thumbnailDrag = { id: event.pointerId, x: event.clientX, left: thumbnails.scrollLeft, moved: false };
    });
    function endThumbnailDrag(event) {
      if (!thumbnailDrag || event.pointerId !== thumbnailDrag.id) return;
      suppressThumbnailClick = thumbnailDrag.moved && event.type === 'pointerup';
      const pointerId = thumbnailDrag.id;
      thumbnailDrag = null;
      thumbnails.classList.remove('is-dragging');
      if (thumbnails.hasPointerCapture?.(pointerId)) thumbnails.releasePointerCapture(pointerId);
      updateThumbnailControls();
    }
    thumbnails.addEventListener('pointermove', event => {
      if (!thumbnailDrag || event.pointerId !== thumbnailDrag.id) return;
      if (!(event.buttons & 1)) { endThumbnailDrag(event); return; }
      const delta = event.clientX - thumbnailDrag.x;
      if (!thumbnailDrag.moved && Math.abs(delta) < 5) return;
      if (!thumbnailDrag.moved) {
        thumbnailDrag.moved = true;
        thumbnails.classList.add('is-dragging');
        thumbnails.setPointerCapture?.(event.pointerId);
      }
      event.preventDefault();
      const left = thumbnailDrag.left - delta;
      thumbnails.scrollLeft = Math.max(0, Math.min(maxThumbnailScroll(), left));
      updateThumbnailControls();
    });
    thumbnails.addEventListener('pointerup', endThumbnailDrag);
    thumbnails.addEventListener('pointercancel', endThumbnailDrag);
    thumbnails.addEventListener('lostpointercapture', endThumbnailDrag);
    thumbnails.addEventListener('click', event => {
      if (!suppressThumbnailClick) return;
      suppressThumbnailClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    thumbnails.addEventListener('dragstart', event => event.preventDefault());

    function selectAdjacentCase(offset) {
      if (!selectedCase || selectedCase.group.cases.length < 2) return;
      const index = selectedCase.index + offset;
      if (index >= 0 && index < selectedCase.group.cases.length) selectCase(selectedCase.group, index);
    }
    videoPrev.addEventListener('click', () => selectAdjacentCase(-1));
    videoNext.addEventListener('click', () => selectAdjacentCase(1));
    function hideVideoNavigation() {
      delete viewport.dataset.navEdge;
    }
    function revealVideoNavigation(event) {
      if (event.pointerType === 'touch') { hideVideoNavigation(); return; }
      const rect = viewport.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const edgeWidth = Math.max(72, Math.min(120, rect.width * .16));
      // Leave the native playback controls at the bottom unobstructed.
      if (rect.width <= 0 || x < 0 || x > rect.width || y < 0 || y > rect.height - 56) hideVideoNavigation();
      else if (x <= edgeWidth) viewport.dataset.navEdge = 'previous';
      else if (x >= rect.width - edgeWidth) viewport.dataset.navEdge = 'next';
      else hideVideoNavigation();
    }
    viewport.addEventListener('pointerenter', revealVideoNavigation);
    viewport.addEventListener('pointermove', revealVideoNavigation);
    viewport.addEventListener('pointerleave', hideVideoNavigation);
    viewport.addEventListener('pointercancel', hideVideoNavigation);

    function updateThumbnails(group, selectedIndex) {
      if (thumbnailGroup !== group) {
        thumbnailGroup = group;
        thumbnailButtons.length = 0;
        Media.forgetImages(thumbnails);
        thumbnails.replaceChildren();
        thumbnails.scrollLeft = 0;
        thumbnails.setAttribute('aria-label', `${group.label} videos`);
        group.cases.forEach((item, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'showcase-thumbnail';
          button.setAttribute('aria-label', `Show ${group.label} video ${index + 1}`);
          button.setAttribute('aria-controls', 'showcase-player');
          const frame = document.createElement('span');
          frame.className = 'showcase-thumbnail-frame';
          frame.setAttribute('aria-hidden', 'true');
          const placeholder = document.createElement('span');
          placeholder.className = 'showcase-thumbnail-placeholder';
          frame.append(placeholder);
          const poster = safeURL((item || {}).poster);
          if (poster) {
            const image = document.createElement('img');
            Media.deferImage(image, Media.thumbnailURL(poster));
            image.alt = '';
            image.width = 160;
            image.height = 90;
            image.loading = 'lazy';
            image.decoding = 'async';
            image.draggable = false;
            image.addEventListener('error', () => image.remove(), { once: true });
            frame.append(image);
          }
          button.append(frame);
          button.addEventListener('click', () => selectCase(group, index));
          thumbnailButtons.push(button);
          thumbnails.append(button);
        });
      }
      thumbnailButtons.forEach((button, index) => {
        if (index === selectedIndex) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      // Reveal a selected thumbnail without moving the page vertically.
      const active = thumbnailButtons[selectedIndex];
      const left = Math.max(0, active.offsetLeft - 4);
      const right = active.offsetLeft + active.offsetWidth + 4;
      if (thumbnails.clientWidth > 0) {
        if (left < thumbnails.scrollLeft) thumbnails.scrollLeft = left;
        else if (right > thumbnails.scrollLeft + thumbnails.clientWidth) thumbnails.scrollLeft = Math.min(maxThumbnailScroll(), right - thumbnails.clientWidth);
      }
      updateThumbnailControls();
    }

    function selectCase(group, index) {
      const item = group.cases[index] || {};
      const title = `${group.label} video ${index + 1}`;
      selectedCase = { group, index };
      videoPrev.disabled = index <= 0;
      videoNext.disabled = index >= group.cases.length - 1;
      if (currentVideo) {
        const previous = currentVideo;
        currentVideo = null;
        Media.release(previous);
        Media.destroy(previous);
        previous.remove();
      }
      categoryButtons.forEach((button, category) => {
        if (category === group) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      $$('[data-showcase-category]').forEach(link => {
        if (link.dataset.showcaseCategory === group.id) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      setText('#showcase-current-group', group.label);
      updateThumbnails(group, index);
      empty.hidden = false;
      setText('#showcase-empty-title', 'Video to be added');
      setText('#showcase-empty-note', 'Select a video from the thumbnails above.');
      const url = safeURL(item.src);
      setText('#showcase-status', `${title}. ${url ? 'Use the video controls to play.' : 'Video to be added.'}`);
      if (!url) return;

      const video = document.createElement('video');
      currentVideo = video;
      video.className = 'showcase-video';
      video.controls = true;
      video.playsInline = true;
      video.preload = 'none';
      video.setAttribute('aria-label', title);
      const poster = safeURL(item.poster);
      video.addEventListener('error', () => {
        if (currentVideo !== video) return;
        video.hidden = true;
        empty.hidden = false;
        setText('#showcase-empty-title', 'Video unavailable');
        setText('#showcase-empty-note', 'Please try another video.');
        setText('#showcase-status', `${title}. The video could not be loaded.`);
      }, { once: true });
      viewport.append(video);
      Media.bindNative(video, { src: url, poster, isVisible: () => !viewport.hidden });
      empty.hidden = true;
    }

    directory.replaceChildren();
    groups.forEach(group => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'showcase-category';
      button.setAttribute('aria-controls', 'showcase-player');
      const name = document.createElement('span');
      name.textContent = group.label;
      button.append(name);
      button.addEventListener('click', () => {
        if (selectedCase?.group !== group) selectCase(group, 0);
      });
      categoryButtons.set(group, button);
      directory.append(button);
    });
    $$('[data-showcase-category]').forEach(link => link.addEventListener('click', () => {
      const group = groups.find(item => item.id === link.dataset.showcaseCategory);
      if (group && selectedCase?.group !== group) selectCase(group, 0);
    }));
    selectCase(groups.find(group => group.id === 'interaction') || groups[0], 0);
    const thumbnailSizeObserver = new ResizeObserver(updateThumbnailControls);
    thumbnailSizeObserver.observe(thumbnails);
    // A case never autoplays, and leaving the player stops its audio.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && currentVideo) Media.release(currentVideo);
    });
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting && currentVideo) Media.release(currentVideo);
    });
    observer.observe($('#showcase-player'));
  }
  initVideoShowcase();

  if (Array.isArray(config.authors) && config.authors.length) {
    const holder = $('#authors');
    config.authors.forEach(author => {
      if (!author || typeof author.name !== 'string' || !author.name.trim()) return;
      const wrapper = document.createElement('span');
      const url = safeURL(author.url);
      const name = document.createElement(url ? 'a' : 'span');
      name.textContent = author.name;
      if (url) { name.href = url; name.target = '_blank'; name.rel = 'noopener noreferrer'; }
      if (author.affiliation) name.title = String(author.affiliation);
      wrapper.append(name); holder.append(wrapper);
    });
    holder.hidden = holder.childElementCount === 0;
  }
  if (typeof config.citation === 'string' && config.citation.trim()) {
    $('#citation-block').hidden = false; $('#citation-code').textContent = config.citation;
    $('#copy-citation').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(config.citation);
        $('#copy-status').textContent = 'Citation copied.';
      } catch (_) {
        const range = document.createRange(); range.selectNodeContents($('#citation-code'));
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
        $('#copy-status').textContent = 'Citation selected. Use your device’s copy command.';
      }
    });
  }
  // Track only top-level sections; submenu links keep their selected-option state.
  const navLinks = $$('.section-nav [data-nav-section]');
  const navigationTargets = navLinks.map(link => $(link.dataset.navSection)).filter(Boolean);
  let scrollPending = false;
  function updateNavigation() {
    scrollPending = false;
    let current = navigationTargets[0];
    if (!current) return;
    const threshold = window.innerHeight * .38;
    navigationTargets.forEach(target => { if (target.getBoundingClientRect().top <= threshold) current = target; });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = navigationTargets[navigationTargets.length - 1];
    navLinks.forEach(link => {
      if (link.dataset.navSection === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateNavigation); }
  }, { passive: true });
  window.addEventListener('resize', updateNavigation);
  updateNavigation();

  const heroVideo = $('#hero-video');
  let hasHeroVideo = false;
  let heroVisible = true;
  const videoURL = safeURL((config.heroVideo || {}).src);
  if (videoURL) {
    hasHeroVideo = true; heroVideo.hidden = false;
    $('#hero-overlay').hidden = true;
    heroVideo.setAttribute('aria-label', config.heroVideo.label || 'GameRealm project teaser');
    const poster = safeURL(config.heroVideo.poster);
    Media.bindNative(heroVideo, { src: videoURL, poster, isVisible: () => heroVisible });
    $('#scene-label').textContent = 'GameRealm in motion';
    heroVideo.addEventListener('error', () => {
      hasHeroVideo = false; heroVideo.hidden = true; heroVideo.removeAttribute('src');
      $('#hero-overlay').hidden = false;
      $('#scene-label').textContent = 'An interactive landscape';
      requestDraw();
    });
  }
  function syncVideo() {
    if (!hasHeroVideo) return;
    // Real footage is opt-in and uses native, keyboard-accessible controls.
    if (document.hidden || !heroVisible) Media.release(heroVideo);
  }
  function updateMotionButton() {
    const button = $('#motion-toggle');
    button.setAttribute('aria-label', paused ? 'Play visual animation' : 'Pause visual animation');
    button.setAttribute('aria-pressed', String(paused));
    $('span', button).textContent = paused ? 'Play' : 'Pause';
    $('path', button).setAttribute('d', paused ? 'M5 3L12 8L5 13Z' : 'M5 3v10M11 3v10');
    syncVideo();
  }
  $('#motion-toggle').addEventListener('click', () => { paused = !paused; updateMotionButton(); requestDraw(); });
  reducedMotion.addEventListener('change', e => { paused = e.matches; updateMotionButton(); requestDraw(); });
  updateMotionButton();

  // Deterministic artwork: these shapes are not inferred geometry or project data.
  const canvases = [$('#world-canvas')].filter(Boolean).map(canvas => ({
    canvas, ctx: canvas.getContext('2d', { alpha: true }), width: 1, height: 1,
    visible: true, hero: true, pointerX: 0, pointerY: 0, x: 0, y: 0
  })).filter(stage => stage.ctx);
  const random = n => { const f = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return f - Math.floor(f); };
  function resize(stage) {
    const rect = stage.canvas.getBoundingClientRect();
    stage.width = Math.max(1, rect.width); stage.height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.7);
    stage.canvas.width = Math.round(stage.width * dpr); stage.canvas.height = Math.round(stage.height * dpr);
    stage.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(stage);
  }
  const sizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) { const stage = canvases.find(s => s.canvas === entry.target); if (stage) resize(stage); }
  });
  canvases.forEach(stage => {
    sizeObserver.observe(stage.canvas);
    stage.canvas.parentElement.addEventListener('pointermove', e => {
      if (reducedMotion.matches || paused || e.pointerType === 'touch') return;
      const r = stage.canvas.getBoundingClientRect();
      stage.pointerX = (e.clientX - r.left) / r.width - .5; stage.pointerY = (e.clientY - r.top) / r.height - .5;
    }, { passive: true });
    stage.canvas.parentElement.addEventListener('pointerleave', () => { stage.pointerX = stage.pointerY = 0; });
  });
  // The hero artwork is pointer-transparent; use the visible section for parallax.
  $('.hero').addEventListener('pointermove', e => {
    const stage = canvases.find(s => s.hero); if (!stage || paused || reducedMotion.matches || e.pointerType === 'touch') return;
    const r = $('.hero').getBoundingClientRect(); stage.pointerX = (e.clientX - r.left) / r.width - .5; stage.pointerY = (e.clientY - r.top) / r.height - .5;
  }, { passive: true });
  $('.hero').addEventListener('pointerleave', () => { const stage = canvases.find(s => s.hero); if (stage) stage.pointerX = stage.pointerY = 0; });
  const visibilityObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === $('.hero')) { heroVisible = entry.isIntersecting; syncVideo(); }
      const stage = canvases.find(s => s.canvas === entry.target);
      if (stage) { stage.visible = entry.isIntersecting; if (stage.visible) draw(stage); }
    }
    requestDraw();
  }, { rootMargin: '40px' });
  canvases.forEach(stage => visibilityObserver.observe(stage.canvas)); visibilityObserver.observe($('.hero'));
  document.addEventListener('visibilitychange', () => { syncVideo(); requestDraw(); });

  function terrainHeight(x, z) {
    const valley = 26 * Math.exp(-((x - 43) ** 2 / 580 + (z - 95) ** 2 / 2400))
      + 32 * Math.exp(-((x + 54) ** 2 / 850 + (z - 153) ** 2 / 2400))
      + 14 * Math.exp(-((x - 12) ** 2 / 500 + (z - 190) ** 2 / 1500));
    return valley + 2.1 * Math.sin(x * .12 + z * .05) + 1.2 * Math.sin(z * .21 + x * .07) + .7 * Math.cos(x * .31 - z * .11);
  }
  function drawTerrain(stage, time) {
    const { ctx, width: w, height: h, hero } = stage;
    const focal = hero ? w * .83 : w * 1.15;
    const center = w * .50;
    const horizon = hero ? h * .53 : h * .32;
    const shift = Math.sin(time * .3) * 2 + stage.x * 4;
    const step = w < 600 ? 3.2 : 2.4;
    const project = (x,z) => {
      const y = terrainHeight(x, z);
      const depth = z + 26;
      return [center + (x + shift) * focal / depth, horizon + (13.5 - y + stage.y * 2) * focal / depth + h * .13, depth, y];
    };
    ctx.save();
    const glow = ctx.createRadialGradient(w * .72, h * .4, 0, w * .72, h * .4, w * .55);
    glow.addColorStop(0, 'rgba(118,154,223,.19)'); glow.addColorStop(1, 'rgba(12,35,42,0)');
    ctx.fillStyle = glow; ctx.fillRect(0,0,w,h);
    for (let i = 0; i < 64; i++) {
      const x = random(i + 10) * w, y = random(i + 300) * h * .49;
      ctx.fillStyle = `rgba(202,219,250,${.1 + random(i + 30) * .2})`;
      ctx.fillRect(x,y,random(i+19)>.92 ? 2 : 1,1);
    }
    // Distant contour lines establish an expansive, continuous horizon.
    for (let z = 240; z > 16; z -= step) {
      const alpha = Math.min(.66, .12 + (245-z)/400);
      ctx.strokeStyle = `rgba(123,174,225,${alpha*.30})`;
      ctx.lineWidth = .55; ctx.beginPath(); let first = true;
      for (let x = -130; x <= 130; x += step) {
        const p = project(x,z);
        if (p[0]<-80 || p[0]>w+80 || p[1]<-70 || p[1]>h+70) { first = true; continue; }
        if (first) ctx.moveTo(p[0],p[1]); else ctx.lineTo(p[0],p[1]); first = false;
      }
      ctx.stroke();
      ctx.fillStyle = `rgba(148,202,242,${alpha})`; ctx.beginPath();
      for (let x = -130; x <= 130; x += step) {
        const p = project(x,z);
        if (p[0]<0 || p[0]>w || p[1]<0 || p[1]>h) continue;
        const radius = Math.min(1.7, Math.max(.55, 60 / p[2]));
        ctx.moveTo(p[0]+radius,p[1]); ctx.arc(p[0],p[1],radius,0,Math.PI*2);
      }
      ctx.fill();
    }
    // A small moving survey path is decorative, not a real trajectory.
    ctx.beginPath();
    for (let z=30;z<220;z+=2) {
      const x = 7 + Math.sin(z*.025)*9;
      const p = project(x,z);
      if (z===30) ctx.moveTo(p[0],p[1]); else ctx.lineTo(p[0],p[1]);
    }
    ctx.strokeStyle='rgba(198,223,255,.5)';ctx.lineWidth=.8;ctx.setLineDash([3,7]);ctx.stroke();ctx.setLineDash([]);
    ctx.restore();
  }
  function draw(stage){
    if(!stage.ctx || !stage.visible) return;
    stage.x+=(stage.pointerX-stage.x)*.04;stage.y+=(stage.pointerY-stage.y)*.04;
    stage.ctx.clearRect(0,0,stage.width,stage.height);
    drawTerrain(stage,phase);
  }
  function loop(now){
    raf=0;
    if(document.hidden)return;
    if(now-previousTime>42){
      const elapsed=Math.min((now-previousTime)/1000,.06);previousTime=now;
      if(!paused)phase+=elapsed;
      canvases.forEach(stage=>{if(stage.visible && !(stage.hero && hasHeroVideo))draw(stage);});
    }
    if(!paused && canvases.some(stage=>stage.visible && !(stage.hero && hasHeroVideo)))raf=requestAnimationFrame(loop);
  }
  function requestDraw(){
    canvases.forEach(draw);
    if(!document.hidden && !paused && !raf)raf=requestAnimationFrame(loop);
  }
  canvases.forEach(resize);requestDraw();
})();
