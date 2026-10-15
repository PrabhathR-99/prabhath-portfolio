/* Scroll-controlled blending: sharp portrait -> supplied blur stages 1, 2, 3, 4. */
(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => value * value * (3 - 2 * value);
  function mount(hero) {
    if (hero.dataset.motionMounted) return;
    hero.dataset.motionMounted = 'true';
    const work = hero.hasAttribute('data-work-motion');
    const about = hero.hasAttribute('data-about-motion');
    const visual = hero.querySelector(about ? '.about-hero-photo' : work ? '.work-hero-image' : '.portrait-hero-visual');
    const track = hero.closest('.portrait-hero-scroll-track, .work-hero-scroll-track, .about-hero-scroll-track') || hero;
    if (!visual) return;
    let frame = 0, lastTime = 0, current = 0, target = 0, ready = false, disposed = false;
    const layers = [];
    let travel = 1, start = 0, failed = false;
    function layout() {
      const height = hero.offsetHeight;
      start = Math.max(0,height - innerHeight);
      travel = Math.max(540,Math.min(1200,innerHeight * .95));
      track.style.setProperty('--hero-pin-height',height+'px');
      track.style.setProperty('--hero-blur-travel',travel+'px');
      track.style.setProperty('--hero-blur-hold',Math.min(180,innerHeight*.18)+'px');
      track.style.setProperty('--hero-pin-top',(-start)+'px');
      track.classList.toggle('is-pinned',!motion.matches && !failed);
    }
    function paint(progress) {
      layers.forEach((image, index) => {
        // Completed frames remain opaque under the next frame, preventing a dark dip.
        image.style.opacity = smooth(clamp(progress * layers.length - index)).toFixed(4);
      });
    }
    function measure() {
      if (motion.matches) return 0;
      return clamp((-track.getBoundingClientRect().top - start) / travel);
    }
    function tick(time) {
      frame = 0;
      if (disposed || !hero.isConnected) return;
      target = measure();
      const dt = Math.min(64, lastTime ? time - lastTime : 16);
      lastTime = time;
      current += (target - current) * (1 - Math.exp(-dt / 85));
      if (Math.abs(target - current) < .0001) current = target;
      if (ready) paint(current);
      if (Math.abs(target - current) >= .0001) frame = requestAnimationFrame(tick);
      else lastTime = 0;
    }
    function schedule() {if (!disposed && !frame) frame = requestAnimationFrame(tick);}
    function onResize() {layout();schedule();}
    async function load() {
      if (motion.matches || layers.length) return;
      for (let stage = 1; stage <= (about ? 3 : 4); stage++) {
        const image = new Image();
        image.className = about ? 'about-blur-frame' : work ? 'work-blur-frame' : 'portrait-blur-frame';image.alt = '';image.setAttribute('aria-hidden','true');
        image.decoding = 'async';image.src = about ? `/media/about-hero-step-${stage}.png` : work ? `/media/work-hero-blur-${stage}.png` : `/media/prabhath-visor-blur-${stage}.png`;
        image.style.zIndex = String(stage);
        visual.appendChild(image);layers.push(image);
      }
      try {
        await Promise.all(layers.map(image => image.decode()));
        if (disposed) return;
        ready = true;current = measure();paint(current);schedule();
      } catch (_) {
        // Leave the original portrait visible if a transition asset cannot load.
        layers.forEach(image => image.remove());layers.length = 0;failed = true;layout();
      }
    }
    function preference() {
      cancelAnimationFrame(frame);frame = 0;current = target = 0;lastTime = 0;paint(0);layout();
      if (!motion.matches) {load();schedule();}
    }
    addEventListener('scroll',schedule,{passive:true});
    addEventListener('resize',onResize,{passive:true});
    motion.addEventListener('change',preference);
    const resize = new ResizeObserver(onResize);resize.observe(hero);resize.observe(visual);
    const cleanup = new MutationObserver(() => {
      if (!hero.isConnected) {
        disposed = true;cancelAnimationFrame(frame);resize.disconnect();cleanup.disconnect();
        removeEventListener('scroll',schedule);removeEventListener('resize',onResize);motion.removeEventListener('change',preference);
      }
    });
    cleanup.observe(document.getElementById('view') || document.body,{childList:true,subtree:true});
    layout();load();schedule();
  }
  const scan = () => document.querySelectorAll('.portrait-hero, [data-work-motion], [data-about-motion]').forEach(mount);
  new MutationObserver(scan).observe(document.getElementById('view') || document.body,{childList:true,subtree:true});
  scan();
})();
