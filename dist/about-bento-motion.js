/* Staggered scroll reveals for the About Me cards. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mount = section => {
    if (section.dataset.aboutMotionMounted) return;
    section.dataset.aboutMotionMounted = 'true';
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    const elements = [...section.querySelectorAll('.about-bento-heading > *, .about-tile')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({target, isIntersecting}) => {
        if (!isIntersecting) return;
        target.classList.add('is-revealed');
        observer.unobserve(target);
      });
    }, {threshold: .08});
    elements.forEach((element,index) => {
      element.style.setProperty('--about-delay', `${Math.min(index % 5 * 75,225)}ms`);
      element.setAttribute('data-about-reveal','');
      observer.observe(element);
    });
    const stop = () => {
      observer.disconnect();
      elements.forEach(element => element.classList.add('is-revealed'));
    };
    const preference = () => {if(reduced.matches) stop();};
    reduced.addEventListener('change',preference);
    const cleanup = new MutationObserver(() => {
      if (section.isConnected) return;
      observer.disconnect();
      reduced.removeEventListener('change',preference);
      cleanup.disconnect();
    });
    cleanup.observe(document.getElementById('view') || document.body,{childList:true,subtree:true});
  };
  const scan = () => document.querySelectorAll('.about-bento').forEach(mount);
  new MutationObserver(scan).observe(document.getElementById('view') || document.body,{childList:true,subtree:true});
  scan();
})();
/* A soft surface highlight follows the pointer without moving the cards. */
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,lastEvent;
  document.addEventListener('pointermove',event=>{
    if(reduced.matches || event.pointerType==='touch') return;
    lastEvent=event;
    if(frame)return;
    frame=requestAnimationFrame(()=>{
      frame=0;
      const tile=lastEvent.target.closest?.('.about-bento .about-tile');
      if(!tile)return;
      const rect=tile.getBoundingClientRect();
      tile.style.setProperty('--bento-x',((lastEvent.clientX-rect.left)/rect.width*100).toFixed(1)+'%');
      tile.style.setProperty('--bento-y',((lastEvent.clientY-rect.top)/rect.height*100).toFixed(1)+'%');
    });
  },{passive:true});
})();
