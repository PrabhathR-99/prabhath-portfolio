(() => {
  const page = document.body.dataset.page || 'work';
  const links = document.querySelectorAll('.glass-link');
  links.forEach(link => {const name = link.getAttribute('aria-label').toLowerCase();if (name === page) link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  let frame = 0;
  const update = () => {frame = 0;document.querySelector('.glass-nav')?.classList.toggle('compact',scrollY > 40);};
  addEventListener('scroll',() => {if (!frame) frame = requestAnimationFrame(update);},{passive:true});update();
})();
