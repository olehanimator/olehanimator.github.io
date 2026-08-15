const brandStyles=document.createElement('link');
brandStyles.rel='stylesheet';
brandStyles.href='brand-2026.css?v=20260815-1';
document.head.appendChild(brandStyles);

const logoLink=document.querySelector('.logo-mark');
if(logoLink&&!logoLink.querySelector('.logo-name')){
  const logoName=document.createElement('span');
  logoName.className='logo-name';
  logoName.textContent='Oleh Lytvynenko';
  logoLink.appendChild(logoName);
}

const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealGroups=[
  {selector:'.hero-card',delay:0},
  {selector:'.section-label',delay:0},
  {selector:'.work-section',delay:0},
  {selector:'.about',delay:0},
  {selector:'footer',delay:0}
];

const revealTargets=[];
revealGroups.forEach(group=>{
  document.querySelectorAll(group.selector).forEach((element,index)=>{
    element.style.setProperty('--reveal-delay',`${group.delay+index*70}ms`);
    revealTargets.push(element);
  });
});

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
  },{threshold:.1,rootMargin:'0px 0px -8% 0px'});
  revealTargets.forEach(element=>revealObserver.observe(element));
}

document.querySelectorAll('.work-section').forEach(section=>{
  section.querySelectorAll('.work-card').forEach((card,index)=>{
    card.style.setProperty('--card-delay',`${90+index*55}ms`);
    card.classList.add('motion-card');
  });
});

document.querySelectorAll('.work-card,.cv-link,.contact-row,.language-switcher button,.play').forEach(element=>{
  element.addEventListener('pointerdown',()=>element.classList.add('is-pressed'));
  const release=()=>element.classList.remove('is-pressed');
  element.addEventListener('pointerup',release);
  element.addEventListener('pointercancel',release);
  element.addEventListener('pointerleave',release);
});
