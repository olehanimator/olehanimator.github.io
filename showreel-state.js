(()=>{
  const video=document.querySelector('.hero-card video');
  const card=document.querySelector('.hero-card');
  if(!video||!card)return;

  const setPlaying=()=>card.classList.add('is-playing');
  const clearPlaying=()=>card.classList.remove('is-playing');
  video.addEventListener('play',setPlaying);
  video.addEventListener('playing',setPlaying);
  video.addEventListener('ended',clearPlaying);
  video.addEventListener('emptied',clearPlaying);
  if(!video.paused&&!video.ended)setPlaying();

  if(!document.querySelector('link[data-showreel-controls]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='showreel-controls.css?v=20260827-1';
    link.dataset.showreelControls='';
    document.head.appendChild(link);
  }

  if(!document.querySelector('script[data-showreel-controls]')){
    const script=document.createElement('script');
    script.src='showreel-controls.js?v=20260827-1';
    script.dataset.showreelControls='';
    document.body.appendChild(script);
  }
})();
