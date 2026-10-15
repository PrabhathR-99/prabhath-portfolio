(() => {
 function mount(section){
  if(section.dataset.awardsMounted)return;
  section.dataset.awardsMounted='true';
  const dialog=section.querySelector('dialog'),image=dialog.querySelector('img'),title=dialog.querySelector('h2');
  let previousOverflow='',trigger=null;
  section.querySelectorAll('[data-award-image]').forEach(button=>button.addEventListener('click',()=>{
   trigger=button;image.src=button.dataset.awardImage;image.alt=button.dataset.awardCaption;title.textContent=button.dataset.awardCaption;
   previousOverflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';
  }));
  dialog.querySelector('[data-award-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;if(trigger?.isConnected)trigger.focus({preventScroll:true});});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  let observer;
  if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   section.classList.add('awards-ready');
   observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}},{threshold:.1});
   section.querySelectorAll('.award-row').forEach((row,index)=>{row.style.setProperty('--award-delay',`${index*60}ms`);observer.observe(row);});
  }
  const cleanup=new MutationObserver(()=>{if(section.isConnected)return;if(dialog.open)document.body.style.overflow=previousOverflow;observer?.disconnect();cleanup.disconnect();});
  cleanup.observe(document.getElementById('view')||document.body,{childList:true,subtree:true});
 }
 const scan=()=>document.querySelectorAll('[data-about-awards]').forEach(mount);
 new MutationObserver(scan).observe(document.getElementById('view')||document.body,{childList:true,subtree:true});scan();
})();
