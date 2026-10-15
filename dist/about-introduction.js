(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function mount(section){
  if(section.dataset.introMounted)return;section.dataset.introMounted='true';
  const photos=[...section.querySelectorAll('[data-photo-drift]')];
  const reveals=[...section.querySelectorAll('[data-intro-reveal]')];
  let frame=0,visible=false,disposed=false;
  function paint(){frame=0;if(disposed||!section.isConnected)return;const rect=section.getBoundingClientRect();const progress=Math.max(-1,Math.min(1,(innerHeight/2-rect.top-rect.height/2)/((innerHeight+rect.height)/2)));photos.forEach(photo=>photo.style.setProperty('--photo-y',reduced.matches?'0px':progress*Number(photo.dataset.photoDrift)+'px'));}
  function schedule(){if(visible&&!frame&&!disposed)frame=requestAnimationFrame(paint);}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.target===section){visible=entry.isIntersecting;section.classList.toggle('intro-icons-active',visible);schedule();}else if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.1});
  observer.observe(section);
  reveals.forEach((element,i)=>{if(!reduced.matches){element.classList.add('intro-motion-ready');element.style.setProperty('--intro-delay',Math.min(i*50,200)+'ms');observer.observe(element);}});
  function preference(){if(reduced.matches)reveals.forEach(el=>el.classList.add('is-visible'));paint();}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',preference);
  const cleanup=new MutationObserver(()=>{if(section.isConnected)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();cleanup.disconnect();removeEventListener('scroll',schedule);removeEventListener('resize',schedule);reduced.removeEventListener('change',preference);});
  cleanup.observe(document.getElementById('view')||document.body,{childList:true,subtree:true});paint();
 }
 const scan=()=>document.querySelectorAll('[data-about-introduction]').forEach(mount);
 new MutationObserver(scan).observe(document.getElementById('view')||document.body,{childList:true,subtree:true});scan();
})();
