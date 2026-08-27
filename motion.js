const brandStyles=document.createElement('link');
brandStyles.rel='stylesheet';
brandStyles.href='brand-2026.css?v=20260815-1';
document.head.appendChild(brandStyles);

if(typeof translations!=='undefined'){
  translations.en['hero.role']='3D Generalist · Technical Artist';
  translations.de['hero.role']='3D Generalist · Technical Artist';
  translations.uk['hero.role']='3D Generalist · Technical Artist';
  translations.en['about.p1']='I’m a 3D Generalist and Technical Artist with experience in 3D graphics, animation, interactive applications and game development. In my work, I combine an artistic approach with technical thinking—creating visual content, real-time solutions, technical visualizations and interactive projects.';
  translations.de['about.p1']='Ich bin 3D Generalist und Technical Artist mit Erfahrung in 3D-Grafik, Animation, interaktiven Anwendungen und Game Development. In meiner Arbeit verbinde ich gestalterisches Denken mit einem technischen Ansatz und entwickle visuellen Content, Echtzeitlösungen, technische Visualisierungen und interaktive Projekte.';
  translations.uk['about.p1']='Я 3D Generalist і Technical Artist із досвідом у 3D-графіці, анімації, інтерактивних застосунках і розробці ігор. У своїй роботі я поєдную художній підхід із технічним мисленням — створюю візуальний контент, рішення реального часу, технічні візуалізації та інтерактивні проєкти.';
  translations.en['meta.description']='Portfolio of Oleh Lytvynenko, a 3D Generalist and Technical Artist working in 3D graphics, animation, interactive applications, real-time solutions and game development.';
  translations.de['meta.description']='Portfolio von Oleh Lytvynenko, 3D Generalist und Technical Artist mit Schwerpunkt auf 3D-Grafik, Animation, interaktiven Anwendungen, Echtzeitlösungen und Game Development.';
  translations.uk['meta.description']='Портфоліо Олега Литвиненка — 3D Generalist і Technical Artist: 3D-графіка, анімація, інтерактивні застосунки, рішення реального часу та розробка ігор.';
  if(typeof setLanguage==='function'&&typeof currentLanguage!=='undefined')setLanguage(currentLanguage);
}

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

const showreelCard=document.querySelector('.hero-card');
const showreelVideo=showreelCard?.querySelector('video');
if(showreelCard&&showreelVideo){
  const playerStateStyles=document.createElement('style');
  playerStateStyles.textContent=`
    .hero-card{transition:border-radius .26s cubic-bezier(.2,.8,.2,1)}
    .hero-card.is-player-active{border-radius:0!important}
  `;
  document.head.appendChild(playerStateStyles);

  const activatePlayer=()=>showreelCard.classList.add('is-player-active');
  const restorePreview=()=>showreelCard.classList.remove('is-player-active');

  showreelVideo.addEventListener('play',activatePlayer);
  showreelVideo.addEventListener('playing',activatePlayer);
  showreelVideo.addEventListener('ended',restorePreview);
  showreelVideo.addEventListener('emptied',restorePreview);
}
