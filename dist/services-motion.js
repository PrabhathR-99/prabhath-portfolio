/* Scroll reveals, gentle photographic parallax, and a moving service-row focus. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0,Math.min(1,value));
  function mount(section) {
    if (section.dataset.motionMounted) return;
    section.dataset.motionMounted = 'true';
    const reveals = [...section.querySelectorAll('[data-service-reveal]')];
    const rows = [...section.querySelectorAll('.services-motion-row')];
    let frame = 0, disposed = false, visible = true, lastY = scrollY, lastTime = 0, drift = 0, blur = 0;
    function tick(time) {
      frame = 0;if (disposed || !section.isConnected || !visible) return;
      const dt = Math.min(64,lastTime ? time-lastTime : 16), dy = scrollY-lastY;
      lastTime = time;lastY = scrollY;
      if (reduced.matches) {
        section.classList.remove('motion-ready');section.style.setProperty('--services-drift','0px');section.style.setProperty('--services-blur','0px');section.style.setProperty('--services-parallax','0px');
        rows.forEach(row=>row.classList.remove('is-active'));return;
      }
      // Measure before writing so progress stays tied to document position.
      const bounds = section.getBoundingClientRect(), height = innerHeight;
      const positions = reveals.map(element=>({element,rect:element.getBoundingClientRect()}));
      let closest = null, distance = Infinity;
      rows.forEach(row=>{const rect=row.getBoundingClientRect(),d=Math.abs(rect.top+rect.height/2-height*.52);if(rect.bottom>0 && rect.top<height && d<distance){closest=row;distance=d;}});
      const blend = 1-Math.exp(-dt/140), speed = Math.min(1,Math.abs(dy)/Math.max(1,dt)*.55);
      drift += (Math.tanh(dy/14)*14-drift)*blend;
      blur += (speed*1.6-blur)*blend;
      section.style.setProperty('--services-drift',drift.toFixed(2)+'px');
      section.style.setProperty('--services-blur',blur.toFixed(2)+'px');
      const progress = clamp((height-bounds.top)/(height+bounds.height));
      section.style.setProperty('--services-parallax',((progress-.5)*100).toFixed(2)+'px');
      positions.forEach(({element,rect})=>{
        // Subtract the last reveal shift from the measurement to avoid feedback.
        const oldRise = parseFloat(element.style.getPropertyValue('--service-rise')) || 0;
        const top = rect.top-oldRise,bottom = rect.bottom-oldRise;
        const enter = clamp((height*.92-top)/(height*.42)),leave = clamp((bottom-height*.08)/(height*.24));
        element.style.setProperty('--service-opacity',(.32+.68*Math.min(enter,leave)).toFixed(3));
        element.style.setProperty('--service-rise',((1-enter)*42).toFixed(2)+'px');
      });
      rows.forEach(row=>row.classList.toggle('is-active',row===closest && distance<height*.45));
      section.classList.add('motion-ready');
      if (Math.abs(drift)>.08 || blur>.015) frame=requestAnimationFrame(tick);else lastTime=0;
    }
    function schedule(){if(!disposed && visible && !frame)frame=requestAnimationFrame(tick);}
    const visibility = new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){lastY=scrollY;lastTime=0;schedule();}else{cancelAnimationFrame(frame);frame=0;lastTime=0;}},{rootMargin:'100px'});
    visibility.observe(section);
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',schedule);
    const resize = new ResizeObserver(schedule);resize.observe(section);
    const cleanup = new MutationObserver(()=>{if(!section.isConnected){disposed=true;cancelAnimationFrame(frame);visibility.disconnect();resize.disconnect();cleanup.disconnect();removeEventListener('scroll',schedule);removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule);}});
    cleanup.observe(document.getElementById('view') || document.body,{childList:true,subtree:true});schedule();
  }
  const scan=()=>document.querySelectorAll('[data-services-motion]').forEach(mount);
  new MutationObserver(scan).observe(document.getElementById('view') || document.body,{childList:true,subtree:true});scan();
})();
