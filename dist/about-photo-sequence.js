(() => {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 function mount(visual) {
  if (visual.dataset.sequenceMounted) return;
  visual.dataset.sequenceMounted = 'true';
  const frames = [...visual.querySelectorAll('.about-photo-frame')];
  let index = 0, timer = null, visible = true, ready = false;
  function paint() {frames.forEach((frame, i) => frame.classList.toggle('is-active', i === index));}
  function stop() {if(timer !== null) clearInterval(timer);timer = null;}
  function sync() {
   stop();
   if (!visual.isConnected) {dispose();return;}
   if (reduced.matches) {index = 0;paint();return;}
   if (ready && visible && !document.hidden) timer = setInterval(() => {index = (index + 1) % frames.length;paint();}, 500);
  }
  const observer = new IntersectionObserver(entries => {visible = entries[0].isIntersecting;sync();});
  observer.observe(visual);
  const cleanup = new MutationObserver(() => {if (!visual.isConnected) dispose();});
  function dispose() {stop();observer.disconnect();cleanup.disconnect();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);}
  cleanup.observe(document.getElementById('view') || document.body,{childList:true,subtree:true});
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  Promise.all(frames.map(frame => frame.querySelector('.about-photo-original').decode().catch(() => {frame.remove();}))).then(() => {
   for (let i = frames.length - 1; i >= 0; i--) if (!frames[i].isConnected) frames.splice(i,1);
   if (!frames.length) return;
   ready = true;index = 0;paint();sync();
  });
 }
 const scan = () => document.querySelectorAll('[data-about-sequence]').forEach(mount);
 new MutationObserver(scan).observe(document.getElementById('view') || document.body,{childList:true,subtree:true});scan();
})();
