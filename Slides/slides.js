(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const stage = document.querySelector('.stage');
  const viewport = document.querySelector('.viewport');
  const status = document.querySelector('[role="status"]');
  let index = -1;
  const clamp = n => Math.max(0, Math.min(slides.length - 1, n));
  const readHash = () => { const n = Number(location.hash.slice(1)); return clamp(Number.isFinite(n) ? Math.floor(n) - 1 : 0); };
  function resize() {
    stage.style.transform = `translate(-50%, -50%) scale(${Math.min(viewport.clientWidth / 1600, viewport.clientHeight / 900)})`;
  }
  function show(target, updateURL = true) {
    const nextIndex = clamp(target);
    if (nextIndex === index) return;
    index = nextIndex;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      slide.classList.toggle('past', i < index);
      slide.setAttribute('aria-hidden', String(i !== index));
      slide.inert = i !== index;
    });
    status.textContent = `Slide ${index + 1} de ${slides.length}. ${slides[index].dataset.title}`;
    document.title = `${slides[index].dataset.title} — ${document.body.dataset.title}`;
    if (updateURL) history.replaceState(null, '', `#${index + 1}`);
  }
  document.addEventListener('keydown', event => {
    if (event.altKey || event.metaKey || event.ctrlKey || event.target.matches('input, textarea, select, [contenteditable="true"]')) return;
    if (event.code === 'Space' && event.target.closest('button')) return;
    let target;
    if (['ArrowRight', 'ArrowDown', 'PageDown', 'Space'].includes(event.code)) target = index + (event.shiftKey && event.code === 'Space' ? -1 : 1);
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.code)) target = index - 1;
    if (event.code === 'Home') target = 0;
    if (event.code === 'End') target = slides.length - 1;
    if (target !== undefined) { event.preventDefault(); show(target); }
    if (event.code === 'KeyF' && document.fullscreenEnabled) {
      const operation = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
      operation.catch(() => {});
    }
  });
  let touchStart = null;
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') touchStart = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  viewport.addEventListener('pointerup', event => {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x, dy = event.clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  viewport.addEventListener('pointercancel', () => { touchStart = null; });
  window.addEventListener('hashchange', () => show(readHash(), false));
  new ResizeObserver(resize).observe(viewport);
  resize();
  // Two frames give CSS a stable starting state for the opening reveal.
  requestAnimationFrame(() => requestAnimationFrame(() => show(readHash(), false)));
})();
