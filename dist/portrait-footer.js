(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function mount(footer) {
    if(footer.dataset.footerMounted) return;
    footer.dataset.footerMounted='true';
    const items=[...footer.querySelectorAll('[data-footer-reveal]')];
    if(!reduced.matches && 'IntersectionObserver' in window){
      const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');reveal.unobserve(entry.target);}}),{threshold:.12});
      items.forEach((item,index)=>{item.style.setProperty('--footer-delay',index*100+'ms');item.classList.add('footer-reveal-ready');reveal.observe(item);});
      footer._revealObserver=reveal;
    }
    let frame=0,visible=false;
    function render(){frame=0;if(!footer.isConnected || !visible || reduced.matches)return;const rect=footer.getBoundingClientRect();const progress=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)));footer.style.setProperty('--footer-photo-shift',((progress-.5)*35).toFixed(2)+'px');}
    const schedule=()=>{if(!frame && visible)frame=requestAnimationFrame(render);};
    const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;footer.querySelector('.portrait-footer-track').style.animationPlayState=visible&&!reduced.matches?'':'paused';schedule();},{rootMargin:'100px'});
    visibility.observe(footer);
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
    const preference=()=>{if(reduced.matches){items.forEach(item=>item.classList.add('is-revealed'));footer.style.setProperty('--footer-photo-shift','0px');footer._revealObserver?.disconnect();}schedule();};
    reduced.addEventListener('change',preference);
    const cleanup=new MutationObserver(()=>{if(footer.isConnected)return;cancelAnimationFrame(frame);visibility.disconnect();footer._revealObserver?.disconnect();removeEventListener('scroll',schedule);removeEventListener('resize',schedule);reduced.removeEventListener('change',preference);cleanup.disconnect();});
    cleanup.observe(document.getElementById('view')||document.body,{childList:true,subtree:true});
  }
  const scan=()=>document.querySelectorAll('[data-portrait-footer]').forEach(mount);
  new MutationObserver(scan).observe(document.getElementById('view')||document.body,{childList:true,subtree:true});scan();
})();
