(()=>{
  const card=document.querySelector('.hero-card');
  const video=card&&card.querySelector('video');
  if(!card||!video)return;

  video.removeAttribute('controls');

  const ui=document.createElement('div');
  ui.className='showreel-ui';
  ui.innerHTML=`
    <div class="showreel-progress-wrap">
      <input class="showreel-progress" type="range" min="0" max="1000" value="0" step="1" aria-label="Showreel progress">
      <div class="showreel-pause-time" aria-hidden="true">0:00</div>
    </div>
    <button class="showreel-control-btn showreel-fullscreen" type="button" aria-label="Enter fullscreen">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4"/></svg>
    </button>`;
  card.appendChild(ui);

  const centerState=document.createElement('div');
  centerState.className='showreel-center-state';
  centerState.setAttribute('aria-hidden','true');
  centerState.innerHTML=`<div class="showreel-center-play"></div>`;
  card.appendChild(centerState);

  const progress=ui.querySelector('.showreel-progress');
  const fullscreen=ui.querySelector('.showreel-fullscreen');
  const pauseTime=ui.querySelector('.showreel-pause-time');

  let scrubbing=false;
  let clickTimer=null;

  const formatTime=(seconds)=>{
    if(!Number.isFinite(seconds))return '0:00';
    const total=Math.max(0,Math.floor(seconds));
    const mins=Math.floor(total/60);
    const secs=String(total%60).padStart(2,'0');
    return `${mins}:${secs}`;
  };

  const syncPauseState=()=>{
    const paused=video.paused&&!video.ended&&video.currentTime>0;
    card.classList.toggle('is-paused',paused);
  };

  const syncTime=()=>{
    if(!Number.isFinite(video.duration)||video.duration<=0)return;
    const time=scrubbing ? video.duration*(Number(progress.value)/1000) : video.currentTime;
    const ratio=Math.min(1,Math.max(0,time/video.duration));
    if(!scrubbing) progress.value=String(Math.round(ratio*1000));
    const pct=ratio*100;
    progress.style.setProperty('--showreel-progress',`${pct}%`);
    pauseTime.style.left=`${pct}%`;
    pauseTime.textContent=formatTime(time);
  };

  const togglePlayback=()=>{
    if(video.paused||video.ended){
      card.classList.remove('is-paused');
      video.play().catch(()=>{});
    }else{
      card.classList.add('is-paused');
      video.pause();
    }
  };

  const syncVideoBounds=()=>{
    const cardRect=card.getBoundingClientRect();
    const sourceW=video.videoWidth||1920;
    const sourceH=video.videoHeight||1200;
    const sourceRatio=sourceW/sourceH;
    const cardRatio=cardRect.width/cardRect.height;

    let displayW=cardRect.width;
    let displayH=cardRect.height;
    if(cardRatio>sourceRatio){
      displayH=cardRect.height;
      displayW=displayH*sourceRatio;
    }else{
      displayW=cardRect.width;
      displayH=displayW/sourceRatio;
    }

    const left=(cardRect.width-displayW)/2;
    const top=(cardRect.height-displayH)/2;

    card.style.setProperty('--showreel-video-left',`${left}px`);
    card.style.setProperty('--showreel-video-top',`${top}px`);
    card.style.setProperty('--showreel-video-width',`${displayW}px`);
    card.style.setProperty('--showreel-video-height',`${displayH}px`);
  };

  const setFullscreen=(enabled)=>{
    card.classList.toggle('is-web-fullscreen',enabled);
    document.body.classList.toggle('showreel-fullscreen-lock',enabled);
    fullscreen.setAttribute('aria-label',enabled?'Exit fullscreen':'Enter fullscreen');
    requestAnimationFrame(syncVideoBounds);
  };

  fullscreen.addEventListener('click',(event)=>{
    event.stopPropagation();
    setFullscreen(!card.classList.contains('is-web-fullscreen'));
  });

  progress.addEventListener('input',(event)=>{
    event.stopPropagation();
    scrubbing=true;
    syncTime();
  });
  progress.addEventListener('change',(event)=>{
    event.stopPropagation();
    const ratio=Number(progress.value)/1000;
    if(Number.isFinite(video.duration)) video.currentTime=video.duration*ratio;
    scrubbing=false;
    syncTime();
    syncPauseState();
  });
  progress.addEventListener('pointerdown',(event)=>{
    event.stopPropagation();
    scrubbing=true;
  });
  progress.addEventListener('pointerup',(event)=>{
    event.stopPropagation();
    scrubbing=false;
  });
  progress.addEventListener('click',(event)=>event.stopPropagation());

  card.addEventListener('click',(event)=>{
    if(event.target.closest('.showreel-fullscreen,.showreel-progress-wrap,.play'))return;
    if(!(card.classList.contains('is-playing')||card.classList.contains('is-paused')))return;
    clearTimeout(clickTimer);
    clickTimer=setTimeout(()=>togglePlayback(),220);
  });

  card.addEventListener('dblclick',(event)=>{
    if(event.target.closest('.showreel-fullscreen,.showreel-progress-wrap,.play'))return;
    event.preventDefault();
    clearTimeout(clickTimer);
    setFullscreen(!card.classList.contains('is-web-fullscreen'));
  });

  video.addEventListener('loadedmetadata',()=>{syncTime();syncVideoBounds();});
  video.addEventListener('durationchange',syncTime);
  video.addEventListener('timeupdate',syncTime);
  video.addEventListener('play',()=>{syncPauseState();syncTime();});
  video.addEventListener('playing',()=>{syncPauseState();syncTime();});
  video.addEventListener('pause',()=>{syncPauseState();syncTime();});
  video.addEventListener('ended',()=>{
    syncPauseState();
    syncTime();
    if(card.classList.contains('is-web-fullscreen')) setFullscreen(false);
  });

  document.addEventListener('keydown',(event)=>{
    if(event.key==='Escape'&&card.classList.contains('is-web-fullscreen')) setFullscreen(false);
    if((event.code==='Space'||event.key===' ')&&(card.classList.contains('is-playing')||card.classList.contains('is-paused'))){
      if(document.activeElement===progress||document.activeElement===fullscreen)return;
      event.preventDefault();
      togglePlayback();
    }
  });

  window.addEventListener('resize',syncVideoBounds);

  syncPauseState();
  syncTime();
  syncVideoBounds();
})();