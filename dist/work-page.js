(() => {
 const projects=window.WORK_PAGE_PROJECTS||[];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function mount(page){
  if(page.dataset.workMounted)return;page.dataset.workMounted='true';
  const cards=[...page.querySelectorAll('[data-work-project]')];
  const count=page.querySelector('[data-work-count]');
  page.querySelectorAll('[data-work-filter]').forEach(button=>button.addEventListener('click',()=>{
   const filter=button.dataset.workFilter;
   page.querySelectorAll('[data-work-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   let total=0;cards.forEach(card=>{const show=filter==='All'||card.dataset.category.split('|').includes(filter);card.hidden=!show;if(show){total++;card.classList.add('is-visible');}});count.textContent=total;
  }));
  page.querySelectorAll('[data-work-crop]').forEach(canvas=>{
   const project=projects.find(p=>p.slug===canvas.dataset.workCrop),img=canvas.previousElementSibling;
   const draw=()=>{if(!img.naturalWidth)return;const [sx,sy,sw,sh]=project.previewRect;const ctx=canvas.getContext('2d');canvas.width=1200;canvas.height=750;ctx.fillStyle='#f0f1f2';ctx.fillRect(0,0,1200,750);const scale=Math.min(1120/sw,670/sh);ctx.drawImage(img,sx,sy,sw,sh,(1200-sw*scale)/2,(750-sh*scale)/2,sw*scale,sh*scale);canvas.hidden=false;img.hidden=true;};if(img.complete)draw();else img.addEventListener('load',draw,{once:true});
  });
  const dialog=page.querySelector('dialog'),title=dialog.querySelector('h2'),image=dialog.querySelector('img');
  let previousOverflow='',previewTrigger=null;
  dialog.setAttribute('data-lenis-prevent','');
  page.querySelectorAll('[data-design-preview]').forEach(button=>button.addEventListener('click',()=>{const p=projects.find(p=>p.slug===button.dataset.designPreview);if(!p)return;previewTrigger=button;title.textContent=p.name;image.src=p.image;image.alt=p.name+' design preview';previousOverflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';}));
  dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;previewTrigger?.focus({preventScroll:true});});
  dialog.querySelector('[data-close-preview]').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  if(!reduced.matches&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.07});page.querySelectorAll('[data-work-reveal]').forEach(element=>{element.classList.add('work-motion-ready');observer.observe(element);});const preference=()=>{if(reduced.matches){page.querySelectorAll('[data-work-reveal]').forEach(element=>element.classList.add('is-visible'));observer.disconnect();}};reduced.addEventListener('change',preference);const cleanup=new MutationObserver(()=>{if(!page.isConnected){if(dialog.open)document.body.style.overflow=previousOverflow;observer.disconnect();reduced.removeEventListener('change',preference);cleanup.disconnect();}});cleanup.observe(document.getElementById('view')||document.body,{childList:true,subtree:true});}
 }
 const scan=()=>document.querySelectorAll('[data-work-page]').forEach(mount);new MutationObserver(scan).observe(document.getElementById('view')||document.body,{childList:true,subtree:true});scan();
})();
