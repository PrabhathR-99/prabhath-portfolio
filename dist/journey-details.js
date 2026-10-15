(() => {
 'use strict';
 // Journey descriptions, keyed to each character’s chapter number.
 const descriptions={
  "1": "I began my journey at Sabaragamuwa University of Sri Lanka as a passionate designer, eager to learn and develop my skills.",
  "2": "At ZeroPlastic, I designed branding and marketing materials as an intern graphic designer, supporting the foundation’s environmental initiatives.",
  "3": "I volunteered as a main designer for Faculty of Computing events, including Adawwa, Pearl Hack, Virtual Rival, and events organized by IEEE and AIESEC.",
  "4": "At Acendae, I learned to work within a design team and collaborate with developers and clients throughout the project process.",
  "5": "I led the design team at Acendae, trained and mentored interns, and handled client communication. I worked closely with developers throughout the full project process.",
  "6": "I graduated from Sabaragamuwa University of Sri Lanka with a BSc (Hons) in Computing and Information Systems.",
  "7": "I work with Arventics as a part-time designer on several projects. I also work independently with clients on freelance design projects."
};
 let sequence=0;
 function mount(section){
  if(section.dataset.detailsMounted)return;section.dataset.detailsMounted='true';
  const tooltip=document.createElement('div');tooltip.className='journey-tooltip';tooltip.id=`journey-tooltip-${++sequence}`;tooltip.setAttribute('role','tooltip');tooltip.setAttribute('data-lenis-prevent','');tooltip.hidden=true;
  tooltip.innerHTML='<p class="journey-tooltip-date"></p><h3></h3><p class="journey-tooltip-company"></p><p class="journey-tooltip-description"></p>';
  document.body.append(tooltip);
  let active=null,timer=0,frame=0;
  function hide(){clearTimeout(timer);cancelAnimationFrame(frame);frame=0;tooltip.hidden=true;active=null;}
  function position(){
   if(!active)return;
   const r=active.getBoundingClientRect(),w=tooltip.offsetWidth,h=tooltip.offsetHeight,gap=12;
   if(r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth){hide();return;}
   const x=Math.max(12,Math.min(innerWidth-w-12,r.right-w));
   const above=r.top-h-gap>=12;const y=Math.max(12,Math.min(innerHeight-h-12,above?r.top-h-gap:r.bottom+gap));
   tooltip.style.left=x+'px';tooltip.style.top=y+'px';tooltip.dataset.side=above?'above':'below';
   tooltip.style.setProperty('--tooltip-arrow',Math.max(20,Math.min(w-20,r.left+r.width/2-x))+'px');
   frame=requestAnimationFrame(position);
  }
  function show(button){
   clearTimeout(timer);if(active===button&&!tooltip.hidden)return;cancelAnimationFrame(frame);active=button;
   const chapter=button.closest('.journey-chapter');
   tooltip.querySelector('h3').textContent=chapter.querySelector('.journey-role h2').innerText.replace(/\s+/g,' ').trim();
   tooltip.querySelector('.journey-tooltip-date').textContent=chapter.querySelector('.journey-date').textContent;
   tooltip.querySelector('.journey-tooltip-company').textContent=chapter.querySelector('.journey-caption p').textContent;
   tooltip.querySelector('.journey-tooltip-description').textContent=descriptions[button.dataset.journeyMore]||'More about this chapter is coming soon.';
   tooltip.hidden=false;position();
  }
  function delayedHide(){clearTimeout(timer);timer=setTimeout(()=>{if(active===document.activeElement||tooltip.matches(':hover'))return;hide();},120);}
  section.querySelectorAll('[data-journey-more]').forEach(button=>{
   button.removeAttribute('aria-haspopup');
   const accessible=document.createElement('span');accessible.className='sr';accessible.id=`${tooltip.id}-chapter-${button.dataset.journeyMore}`;accessible.textContent=descriptions[button.dataset.journeyMore]||'More about this chapter is coming soon.';button.closest('.journey-chapter').append(accessible);button.setAttribute('aria-describedby',accessible.id);
   button.setAttribute('aria-label','More about '+button.closest('.journey-chapter').querySelector('.journey-role h2').innerText.replace(/\s+/g,' ').trim());
   button.addEventListener('pointerenter',()=>show(button));button.addEventListener('pointerleave',delayedHide);
   button.addEventListener('focus',()=>show(button));button.addEventListener('blur',delayedHide);
   button.addEventListener('click',()=>{if(matchMedia('(hover: none)').matches)show(button);});
  });
  tooltip.addEventListener('pointerenter',()=>clearTimeout(timer));tooltip.addEventListener('pointerleave',delayedHide);
  const escape=event=>{if(event.key==='Escape')hide();};document.addEventListener('keydown',escape);
  const outside=event=>{if(active&&!active.contains(event.target)&&!tooltip.contains(event.target))hide();};document.addEventListener('pointerdown',outside);
  const cleanup=new MutationObserver(()=>{if(section.isConnected)return;hide();tooltip.remove();document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside);cleanup.disconnect();});
  cleanup.observe(document.getElementById('view')||document.body,{childList:true,subtree:true});
 }
 const scan=()=>document.querySelectorAll('[data-about-journey]').forEach(mount);
 new MutationObserver(scan).observe(document.getElementById('view')||document.body,{childList:true,subtree:true});scan();
})();
