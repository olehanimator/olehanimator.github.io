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
})();
