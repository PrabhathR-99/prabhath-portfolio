/* Fit each project's selected product image into its opening banner. */
(() => {
  const canvas = document.querySelector('[data-banner-image]');
  if (!canvas) return;
  const image = new Image();image.decoding='async';image.src=canvas.dataset.bannerImage;
  const rect = JSON.parse(canvas.dataset.bannerRect || 'null');
  let ready = false, frame = 0;
  function paint() {
    frame = 0;if (!ready) return;
    const width = canvas.clientWidth,height = canvas.clientHeight;if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1,1.5);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    const ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
    const [x,y,w,h]=rect || [0,0,image.naturalWidth,image.naturalHeight];
    // Preserve the complete device or screen rather than cropping it to the viewport.
    const scale=Math.min(width*.94/w,height*.94/h),dw=w*scale,dh=h*scale;
    ctx.imageSmoothingQuality='high';ctx.drawImage(image,x,y,w,h,(width-dw)/2,(height-dh)/2,dw,dh);
    canvas.style.opacity='1';
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint);};
  image.decode().then(()=>{ready=true;paint();}).catch(()=>{});
  new ResizeObserver(schedule).observe(canvas);
})();
