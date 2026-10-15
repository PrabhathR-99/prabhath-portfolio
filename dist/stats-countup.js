/* Animate the achievement values once when the statistics enter the viewport. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finishers = new Set();
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function mount(strip) {
    if (strip.dataset.countMounted) return;
    strip.dataset.countMounted = 'true';
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    const counters = [...strip.querySelectorAll('.portfolio-stat dd')].map(dd => {
      const label = dd.textContent.trim(), match = label.match(/^(\d+)(\+?)$/);
      if (!match) return null;
      const number = document.createElement('span');number.setAttribute('aria-hidden','true');number.textContent = '0' + match[2];
      const accessible = document.createElement('span');accessible.className = 'sr';accessible.textContent = label;
      dd.replaceChildren(number,accessible);dd.style.minWidth = label.length + 'ch';
      return {number,value:Number(match[1]),suffix:match[2],label};
    }).filter(Boolean);
    let frame = 0, done = false;
    const finish = () => {
      if (done) return;done = true;cancelAnimationFrame(frame);observer.disconnect();
      counters.forEach(c => {c.number.textContent = c.label;});finishers.delete(finish);
    };
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting) || done) return;
      observer.disconnect();const started = performance.now();
      const tick = time => {
        if (!strip.isConnected || reduced.matches) {finish();return;}
        let complete = true;
        counters.forEach((c,index) => {
          const progress = Math.max(0,Math.min(1,(time-started-index*80)/1450));
          const text = Math.round(c.value * ease(progress)) + c.suffix;
          if (c.number.textContent !== text) c.number.textContent = text;
          if (progress < 1) complete = false;
        });
        if (complete) finish();else frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    },{threshold:.35});
    finishers.add(finish);observer.observe(strip);
  }
  reduced.addEventListener('change',() => {if (reduced.matches) [...finishers].forEach(finish=>finish());});
  const scan = () => document.querySelectorAll('.portfolio-stats').forEach(mount);
  new MutationObserver(scan).observe(document.getElementById('view') || document.body,{childList:true,subtree:true});scan();
})();
