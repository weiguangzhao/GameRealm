/* Disclosure navigation; links keep native fragment navigation and tab order. */
(() => {
  'use strict';
  const nav = document.querySelector('.section-nav');
  if (!nav) return;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const mobile = window.matchMedia('(max-width: 760px)');
  const records = Array.from(nav.querySelectorAll('[data-nav-disclosure]')).map(group => {
    const toggle = group.querySelector('[data-nav-toggle]');
    return { group, toggle, panel: document.getElementById(toggle.getAttribute('aria-controls')) };
  });
  const isOpen = record => record.toggle.getAttribute('aria-expanded') === 'true';
  function visibleControls(panel) {
    return Array.from(panel.querySelectorAll('a, button')).filter(control => !control.closest('[hidden]'));
  }
  function positionPanel(record) {
    const { group, panel } = record;
    panel.classList.remove('is-aligned-end', 'is-flipped');
    group.classList.remove('opens-left');
    if (mobile.matches) return;
    const bounds = panel.getBoundingClientRect();
    if (bounds.right > window.innerWidth - 12) {
      if (panel.classList.contains('nav-submenu')) {
        panel.classList.add('is-flipped');
        group.classList.add('opens-left');
      } else panel.classList.add('is-aligned-end');
    }
  }
  function setOpen(record, open) {
    if (open) {
      records.forEach(other => {
        if (other !== record && other.group.parentElement === record.group.parentElement) setOpen(other, false);
      });
    } else {
      records.forEach(child => {
        if (child !== record && record.group.contains(child.group)) setOpen(child, false);
      });
    }
    record.toggle.setAttribute('aria-expanded', String(open));
    record.panel.hidden = !open;
    if (open) positionPanel(record);
  }
  const closeAll = () => records.forEach(record => setOpen(record, false));
  records.forEach(record => {
    const { group, toggle, panel } = record;
    toggle.addEventListener('click', () => setOpen(record, !isOpen(record)));
    toggle.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      setOpen(record, true);
      const controls = visibleControls(panel);
      const next = event.key === 'ArrowUp' ? controls[controls.length - 1] : controls[0];
      if (next) next.focus();
    });
    const branchLink = group.querySelector('.nav-branch-header > a');
    if (group.classList.contains('nav-branch') && branchLink) {
      branchLink.addEventListener('keydown', event => {
        if (event.key !== 'ArrowRight') return;
        event.preventDefault(); setOpen(record, true);
        const first = visibleControls(panel)[0];
        if (first) first.focus();
      });
    }
    group.addEventListener('pointerenter', event => {
      if (finePointer.matches && event.pointerType !== 'touch') setOpen(record, true);
    });
    group.addEventListener('pointerleave', event => {
      if (!finePointer.matches || event.pointerType === 'touch') return;
      if (!group.contains(document.activeElement)) setOpen(record, false);
    });
    group.addEventListener('focusout', event => {
      if (!group.contains(event.relatedTarget)) setOpen(record, false);
    });
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeAll();
  });
  document.addEventListener('click', event => { if (!nav.contains(event.target)) closeAll(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' && event.key !== 'ArrowLeft') return;
    const applicable = records.filter(record => isOpen(record) && record.group.contains(event.target));
    const record = applicable[applicable.length - 1];
    if (record && (event.key === 'Escape' || record.panel.contains(event.target))) {
      event.preventDefault(); setOpen(record, false); record.toggle.focus();
    } else if (event.key === 'Escape') closeAll();
  });
  const bar = document.querySelector('.navigation-wrap');
  function resize() {
    if (bar) {
      const height = bar.getBoundingClientRect().height;
      if (height > 0) document.documentElement.style.setProperty('--navigation-offset', `${Math.ceil(height) + 12}px`);
    }
    records.filter(isOpen).forEach(positionPanel);
  }
  if (bar) new ResizeObserver(resize).observe(bar);
  window.addEventListener('resize', resize);
  resize();
})();
