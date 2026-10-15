(() => {
 function mount(section){
  if(section.dataset.companyMounted)return;section.dataset.companyMounted='true';
  const dialog=section.querySelector('dialog'),area=dialog.querySelector('.letter-viewer-area'),image=area.querySelector('img'),percent=dialog.querySelector('[data-letter-percent]');
  const zoomIn=dialog.querySelector('[data-letter-zoom="in"]'),zoomOut=dialog.querySelector('[data-letter-zoom="out"]');
  area.setAttribute('data-lenis-prevent','');
  let zoom=1.25,previousOverflow='';
  function paint(){const padding=parseFloat(getComputedStyle(area).paddingLeft)||0;const base=Math.max(160,Math.min(900,area.clientWidth-padding*2));image.style.setProperty('--letter-width',base*zoom+'px');percent.textContent=Math.round(zoom*100)+'%';zoomIn.disabled=zoom>=3;zoomOut.disabled=zoom<=.5;}
  function change(amount){zoom=Math.max(.5,Math.min(3,zoom+amount));paint();}
  section.querySelector('[data-open-letter]').addEventListener('click',()=>{zoom=1.25;previousOverflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';requestAnimationFrame(()=>{paint();area.scrollTop=0;area.scrollLeft=0;});});
  zoomIn.addEventListener('click',()=>change(.25));zoomOut.addEventListener('click',()=>change(-.25));
  dialog.querySelector('[data-letter-reset]').addEventListener('click',()=>{zoom=1;paint();area.scrollTop=0;area.scrollLeft=0;});
  dialog.querySelector('[data-letter-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
  dialog.addEventListener('keydown',event=>{if(event.key==='+'||event.key==='='){event.preventDefault();change(.25);}else if(event.key==='-'){event.preventDefault();change(-.25);}});
  const resize=new ResizeObserver(()=>{if(dialog.open)paint();});resize.observe(area);
  const cleanup=new MutationObserver(()=>{if(section.isConnected)return;if(dialog.open)document.body.style.overflow=previousOverflow;resize.disconnect();cleanup.disconnect();});cleanup.observe(document.getElementById('view')||document.body,{childList:true,subtree:true});
 }
 const scan=()=>document.querySelectorAll('[data-company-experience]').forEach(mount);
 new MutationObserver(scan).observe(document.getElementById('view')||document.body,{childList:true,subtree:true});scan();
})();
