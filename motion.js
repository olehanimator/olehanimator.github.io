const revealTargets=[
  document.querySelector('.hero-card'),
  ...document.querySelectorAll('.project-card'),
  document.querySelector('.about')
].filter(Boolean);

const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if(reducedMotion||!('IntersectionObserver' in window)){
  revealTargets.forEach(element=>element.classList.add('is-visible'));
}else{
  revealTargets.forEach(element=>element.classList.add('reveal'));
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
  revealTargets.forEach(element=>revealObserver.observe(element));
}
