/* Scroll-driven Stretch gallery: two readable projects per focus frame. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cardAspect = 5 / 6;
  let textures;
  const focusedPosition = position => position - .82 * Math.sin(2 * Math.PI * position) / (2 * Math.PI);
  function fitLine(ctx, copy, width) {
    if (ctx.measureText(copy).width <= width) return copy;
    while (copy.length && ctx.measureText(copy + '…').width > width) copy = copy.slice(0, -1);
    return copy.trimEnd() + '…';
  }
  function wrap(ctx, copy, x, y, width, height) {
    let line = '', row = 0;
    for (const word of copy.split(' ')) {
      const next = line ? line + ' ' + word : word;
      if (line && ctx.measureText(next).width > width) { ctx.fillText(line, x, y + row++ * height); line = word; }
      else line = next;
    }
    ctx.fillText(line, x, y + row * height);
    return y + row * height;
  }
  function paintCard(ctx, project, image, x) {
    const rect = project.previewRect || [0,0,image.naturalWidth,image.naturalHeight];
    const [sx,sy,sw,sh] = rect;
    ctx.save();ctx.translate(x,0);ctx.beginPath();ctx.roundRect(0,0,1000,1200,20);ctx.clip();
    ctx.fillStyle='#101f2c';ctx.fillRect(0,0,1000,1200);
    // Atmospheric background only; the foreground product preview is fitted whole.
    const bgScale=Math.max(1000/sw,1200/sh);
    ctx.save();ctx.filter='blur(24px)';ctx.drawImage(image,sx,sy,sw,sh,(1000-sw*bgScale)/2,(1200-sh*bgScale)/2,sw*bgScale,sh*bgScale);ctx.restore();
    ctx.fillStyle='#081525c9';ctx.fillRect(0,0,1000,1200);
    const shade=ctx.createLinearGradient(0,0,0,1200);shade.addColorStop(0,'#42322a35');shade.addColorStop(.65,'#101f2c30');shade.addColorStop(1,'#081525b3');ctx.fillStyle=shade;ctx.fillRect(0,0,1000,1200);
    ctx.textAlign='center';ctx.fillStyle='#ffffff';ctx.font='600 58px Nohemi, sans-serif';
    const bottom=wrap(ctx,project.name,500,115,890,65);
    ctx.font='400 36px Overused, sans-serif';ctx.fillText(fitLine(ctx,project.subtitle || project.cat,880),500,bottom+60);
    const box={x:45,y:310,w:910,h:570};
    ctx.fillStyle='#ffffff';ctx.fillRect(box.x,box.y,box.w,box.h);
    const scale=Math.min(box.w/sw,box.h/sh),width=sw*scale,height=sh*scale;
    ctx.drawImage(image,sx,sy,sw,sh,box.x+(box.w-width)/2,box.y+(box.h-height)/2,width,height);
    ctx.textAlign='left';ctx.fillStyle='#ffffff';ctx.font='400 32px Overused, sans-serif';
    wrap(ctx,project.desc,45,966,755,39);
    // Thick southeast arrow with squared ends, as in the supplied reference.
    ctx.strokeStyle='#ffa33d';ctx.lineWidth=18;ctx.lineCap='butt';ctx.lineJoin='miter';
    ctx.beginPath();ctx.moveTo(861,1067);ctx.lineTo(932,1138);ctx.stroke();
    ctx.beginPath();ctx.moveTo(855,1138);ctx.lineTo(932,1138);ctx.lineTo(932,1061);ctx.stroke();
    ctx.restore();
  }
  async function makeTextures(projects) {
    await Promise.all([document.fonts.load("600 58px Nohemi"),document.fonts.load("500 27px Overused"),document.fonts.load("400 30px Overused")]);
    await document.fonts.ready;
    const images = await Promise.all(projects.map(async p => {const image = new Image();image.src = '/' + p.image;await image.decode();return image;}));
    return projects.map((project, index) => {const canvas = document.createElement('canvas');canvas.width = 1000;canvas.height = 1200;paintCard(canvas.getContext('2d'), project, images[index], 0);return canvas.toDataURL('image/png');});
  }
  function action(label, href, external) {
    const a = document.createElement('a');a.className = 'project-action ' + (external ? 'project-action-live project-action-primary' : 'project-action-case');a.setAttribute('aria-label', label);const icon = document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('fill','none');icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','1.75');icon.setAttribute('stroke-linecap','round');icon.setAttribute('stroke-linejoin','round');icon.setAttribute('aria-hidden','true');const path = document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',external ? 'M5 19 19 5M5 5h14v14' : 'M4 4h6a2 2 0 0 1 2 2v15a3 3 0 0 0-3-3H4V4Zm16 0h-6a2 2 0 0 0-2 2v15a3 3 0 0 1 3-3h5V4Z');icon.appendChild(path);const text = document.createElement('span');text.textContent = external ? 'View Live Site' : 'View Case Study';a.append(icon,text);a.href = href;
    if (external) {a.target = '_blank';a.rel = 'noopener';}return a;
  }
  async function mount(root) {
    if (root.dataset.mounted) return;root.dataset.mounted = 'true';
    const projects = window.PORTFOLIO_PROJECTS;if (!projects?.length) return;
    let mobileMode = window.innerWidth <= 720;
    let pairs = mobileMode ? projects.map((_,index)=>[index]) : projects.slice(0, -1).map((_, index) => [index, index + 1]);
    if (!pairs.length) return;
    const stage = root.querySelector('[data-carousel-stage]'), pin = root.querySelector('.project-showcase-pin');
    root.style.setProperty('--project-travel', `${Math.max(1, pairs.length - 1) * 65}svh`);
    const overlay = document.createElement('div');overlay.className = 'showcase-pair-overlay';overlay.inert = true;
    let carousel, current = -1, disposed = false, scrollFrame = 0, watchFrame = 0, overlayLeft = 0, cardSpacing = 0;
    function announce(index) {
      if (current === index) return;current = index;overlay.replaceChildren();
      for (const projectIndex of pairs[index]) {
        const project = projects[projectIndex], hit = document.createElement('div');hit.className = 'showcase-card-hit';hit.tabIndex = 0;hit.setAttribute('role','group');hit.setAttribute('aria-label',project.name + '. ' + project.cat + '. ' + project.desc);
        const mobile = document.createElement('div');mobile.className = 'showcase-mobile-copy';
        const title = document.createElement('b');title.textContent = project.name;mobile.appendChild(title);
        const subtitle = document.createElement('span');subtitle.textContent = project.subtitle || project.cat;mobile.appendChild(subtitle);hit.appendChild(mobile);
        const mobileDesc = document.createElement('p');mobileDesc.className = 'showcase-mobile-description';mobileDesc.textContent = project.desc;hit.appendChild(mobileDesc);
        const actions = document.createElement('div');actions.className = 'showcase-card-actions';
        if (project.liveUrl) actions.appendChild(action('View live site', project.liveUrl, true));
        if (project.caseUrl) actions.appendChild(action('View case study', project.caseUrl, false));
        hit.appendChild(actions);
        const open = () => (actions.querySelector('.project-action-case') || actions.querySelector('a'))?.click();
        hit.addEventListener('click', e => {if (!e.target.closest('a')) open();});
        hit.addEventListener('keydown', e => {if (e.target === hit && e.key === 'Enter') {e.preventDefault();open();}});
        overlay.appendChild(hit);
      }
    }
    const fallback = () => {
      root.classList.add('project-showcase-static');stage.replaceChildren();
      const grid = document.createElement('div');grid.className = 'showcase-fallback-grid';
      for (const project of projects) {
        const card = document.createElement('article');card.className = 'showcase-fallback-card';
        const image = document.createElement('img');image.src = '/' + project.image;image.alt = project.name;image.loading = 'lazy';card.appendChild(image);
        const title = document.createElement('h3');title.textContent = project.name;card.appendChild(title);
        const desc = document.createElement('p');desc.textContent = project.desc;card.appendChild(desc);
        const links = document.createElement('div');links.className = 'showcase-fallback-actions';
        if (project.caseUrl) links.appendChild(action('View case study',project.caseUrl,false));
        if (project.liveUrl) links.appendChild(action('View live project',project.liveUrl,true));
        card.appendChild(links);grid.appendChild(card);
      }
      stage.appendChild(grid);
      makeTextures(projects).then(images => {grid.querySelectorAll('img').forEach((image,index)=>{image.src=images[index];});}).catch(()=>{});
    };
    try {
      const probe = document.createElement('canvas'), gl = probe.getContext('webgl2');if (!gl) {fallback();return;}gl.getExtension('WEBGL_lose_context')?.loseContext();
      textures ||= makeTextures(projects);const images = await textures;if (!root.isConnected) return;
      carousel = document.createElement('card-carousel');carousel.images = images;
      carousel.set({effect:'stretch',bg:'#ffffff',radius:0,autoplay:0,startCard:0,depthRatio:0,zone:.6,speedZone:0,stiffness:reduced ? 1000 : 18,motion:reduced ? 0 : 1});
      carousel.setAttribute('role','region');carousel.setAttribute('aria-label','Projects. Scroll down to explore projects. Focus a card to reveal its links.');
      const progress = () => {
        if (!carousel._c || disposed) return;
        const distance = Math.max(1, root.offsetHeight - pin.offsetHeight), top = parseFloat(getComputedStyle(pin).top) || 0;
        const value = Math.max(0, Math.min(1, (top - root.getBoundingClientRect().top) / distance));
        const position = value * (pairs.length - 1);carousel._c.goTo((mobileMode ? 0 : .5) + (reduced ? Math.round(position) : focusedPosition(position)));
      };
      const onScroll = () => {if (!scrollFrame) scrollFrame = requestAnimationFrame(() => {scrollFrame = 0;progress();});};
      const fit = () => {
        const w = stage.clientWidth, h = stage.clientHeight;if (!w || !h) return;
        const tall = w / h < .85, mobile = w <= 720, hFrac = mobile ? .98 : .86, widthFraction = mobile ? .84 : .35;
        if (mobileMode !== mobile) {mobileMode = mobile;pairs = mobile ? projects.map((_,index)=>[index]) : projects.slice(0,-1).map((_,index)=>[index,index+1]);current=-1;}
        root.style.setProperty('--project-travel', `${Math.max(1,pairs.length-1)*65}svh`);
        overlay.style.gridTemplateColumns = mobile ? 'minmax(0,1fr)' : 'repeat(2,minmax(0,1fr))';
        const t = Math.tan(16 * Math.PI / 180), D = Math.max(1 / (2*t*hFrac), cardAspect / (2*t*(w/h)*widthFraction));
        const pairH = h / (2*D*t), cardW = pairH * cardAspect, gap = .04 * w / 2, pairW = mobile ? cardW : 2 * cardW + gap;
        cardSpacing = cardW + gap;overlayLeft = (w-pairW)/2;
        const sideInner = cardW/w + .04, zone = mobile ? .72 : Math.max(0,Math.min(.96,(pairW/w + .02 - sideInner)/(1-sideInner)));
        carousel.set({hFrac,lift:0,zone,...(tall ? {wFracTall:widthFraction,gapTall:.04} : {wFrac:widthFraction,gap:.04})});
        Object.assign(overlay.style,{width:pairW+'px',height:pairH+'px',gap:gap+'px',left:overlayLeft+'px',top:(h-pairH)/2+'px'});progress();
      };
      // Follow the actual spring position so hover links match the displayed pair.
      const watch = () => {
        if (disposed) return;
        if (carousel._c) {
          const position = carousel._c.position - (mobileMode ? 0 : .5), index = Math.max(0,Math.min(pairs.length-1,Math.round(position)));
          announce(index);overlay.style.left = (overlayLeft - (position-index)*cardSpacing)+'px';const settled = Math.abs(position-index) < .13;overlay.dataset.settled = String(settled);overlay.inert = !settled;
        }
        watchFrame = requestAnimationFrame(watch);
      };
      // Keep the original stretch renderer, while the page owns wheel/drag input.
      carousel.addEventListener('wheel',e=>e.stopPropagation(),{capture:true,passive:true});
      for (const type of ['pointerdown','pointerup','pointercancel']) carousel.addEventListener(type,e=>e.stopPropagation(),true);
      carousel.addEventListener('ready',()=>{fit();progress();},{once:true});
      stage.append(carousel,overlay);fit();watch();
      const resize = new ResizeObserver(fit);resize.observe(stage);resize.observe(root);window.addEventListener('scroll',onScroll,{passive:true});
      const cleanup = new MutationObserver(()=>{if (!root.isConnected) {disposed=true;cancelAnimationFrame(scrollFrame);cancelAnimationFrame(watchFrame);resize.disconnect();cleanup.disconnect();window.removeEventListener('scroll',onScroll);}});
      cleanup.observe(document.getElementById('view') || document.body,{childList:true,subtree:true});
    } catch (error) {fallback();console.warn('Project gallery fallback:',error);}
  }
  const scan = () => document.querySelectorAll('[data-project-showcase]').forEach(mount);
  new MutationObserver(scan).observe(document.getElementById('view') || document.body,{childList:true,subtree:true});scan();
})();
