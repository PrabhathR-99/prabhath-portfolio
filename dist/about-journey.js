(() => {
 'use strict';
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
 function mount(section) {
  if (section.dataset.journeyMounted) return;
  section.dataset.journeyMounted = 'true';
  const panel = section.querySelector('.journey-sticky');
  const viewport = section.querySelector('.journey-window');
  const rail = section.querySelector('.journey-rail');
  const chapters = [...rail.children];
  const counter = section.querySelector('[data-journey-count]');
  let distance = 0, travel = 1, start = 0, current = 0, target = 0, frame = 0, last = 0, disposed = false;
  function layout() {
   distance = Math.max(0, rail.scrollWidth - viewport.clientWidth);
   travel = Math.max(innerHeight, distance * 1.2);
   start = Math.max(0, panel.offsetHeight - innerHeight);
   section.style.setProperty('--journey-height', panel.offsetHeight + 'px');
   section.style.setProperty('--journey-travel', travel + 'px');
   section.style.setProperty('--journey-top', -start + 'px');
   section.classList.toggle('is-pinned', !reduced.matches && distance > 0);
   viewport.scrollLeft = 0;
   if (reduced.matches) {current = 0;rail.style.transform = '';}
   schedule();
  }
  function paint() {
   const offset = reduced.matches ? viewport.scrollLeft : current * distance;
   if (!reduced.matches) rail.style.transform = `translate3d(${-offset}px,0,0)`;
   let nearest = 0, best = Infinity;
   chapters.forEach((chapter, index) => {
    const center = chapter.offsetLeft - rail.offsetLeft + chapter.offsetWidth / 2;
    const separation = Math.abs(center - offset - viewport.clientWidth / 2);
    if (separation < best) {best = separation;nearest = index;}
    const visible = clamp(1 - separation / viewport.clientWidth);
    chapter.style.setProperty('--character-rise', (1 - visible) * 14 + 'px');
    chapter.style.setProperty('--character-scale', .98 + visible * .02);
   });
   counter.textContent = String(current > .995 && !reduced.matches ? chapters.length : nearest + 1).padStart(2, '0');
  }
  function tick(time) {
   frame = 0;
   if (disposed || !section.isConnected) return;
   target = reduced.matches ? 0 : clamp((-section.getBoundingClientRect().top - start) / travel);
   const dt = Math.min(64, last ? time - last : 16);last = time;
   current += (target - current) * (1 - Math.exp(-dt / 75));
   if (Math.abs(target - current) < .0001) current = target;
   paint();
   if (Math.abs(target - current) >= .0001) frame = requestAnimationFrame(tick);else last = 0;
  }
  function schedule() {if (!disposed && !frame) frame = requestAnimationFrame(tick);}
  function focus(event) {
   const chapter = event.target.closest('.journey-chapter');
   if (!chapter || reduced.matches || !event.target.matches(':focus-visible')) return;
   // Browser focus scrolling must not offset the scroll-driven rail.
   viewport.scrollLeft = 0;
   const center = chapter.offsetLeft - rail.offsetLeft + chapter.offsetWidth / 2;
   const progress = clamp((center - viewport.clientWidth / 2) / Math.max(1, distance));
   scrollTo({top:scrollY + section.getBoundingClientRect().top + start + progress * travel,behavior:reduced.matches?'instant':'smooth'});
  }
  section.querySelectorAll('img').forEach(img => {img.loading = 'eager';});
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', layout, {passive:true});
  viewport.addEventListener('scroll', schedule, {passive:true});
  section.addEventListener('focusin', focus);
  reduced.addEventListener('change', layout);
  const resize = new ResizeObserver(layout);resize.observe(panel);resize.observe(viewport);
  const cleanup = new MutationObserver(() => {
   if (section.isConnected) return;
   disposed = true;cancelAnimationFrame(frame);resize.disconnect();cleanup.disconnect();
   removeEventListener('scroll', schedule);removeEventListener('resize', layout);
   reduced.removeEventListener('change', layout);
  });
  cleanup.observe(document.getElementById('view') || document.body, {childList:true,subtree:true});
  layout();
 }
 const scan = () => document.querySelectorAll('[data-about-journey]').forEach(mount);
 new MutationObserver(scan).observe(document.getElementById('view') || document.body, {childList:true,subtree:true});
 scan();
})();
