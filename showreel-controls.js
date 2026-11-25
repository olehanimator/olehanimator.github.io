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

  const isTouch=window.matchMedia('(pointer:coarse)').matches;
  const canElementFullscreen=!!(card.requestFullscreen||card.webkitRequestFullscreen);
  const fsElement=()=>document.fullscreenElement||document.webkitFullscreenElement||null;
  const isFullscreen=()=>card.classList.contains('is-web-fullscreen');
  const isRotated=()=>card.classList.contains('is-rotated');

  const syncVideoBounds=()=>{
    // offsetWidth/offsetHeight ignore the CSS rotation used for landscape mode
    const cardW=card.offsetWidth;
    const cardH=card.offsetHeight;
    if(!cardW||!cardH)return;
    const sourceW=video.videoWidth||1920;
    const sourceH=video.videoHeight||1200;
    const sourceRatio=sourceW/sourceH;
    const cardRatio=cardW/cardH;

    let displayW;
    let displayH;
    if(cardRatio>sourceRatio){
      displayH=cardH;
      displayW=displayH*sourceRatio;
    }else{
      displayW=cardW;
      displayH=displayW/sourceRatio;
    }

    const left=(cardW-displayW)/2;
    const top=(cardH-displayH)/2;
    const dividerTop=top+(displayH*0.9);

    progress.parentElement.style.left=`${left}px`;
    progress.parentElement.style.width=`${displayW}px`;
    progress.parentElement.style.top=`${dividerTop}px`;

    const buttonSize=fullscreen.offsetWidth||38;
    const inset=14;
    fullscreen.style.top=`${top+inset}px`;
    fullscreen.style.left=`${left+displayW-buttonSize-inset}px`;
  };

  const syncRotation=()=>{
    const vw=window.innerWidth;
    const vh=window.innerHeight;
    card.style.setProperty('--showreel-vw',`${vw}px`);
    card.style.setProperty('--showreel-vh',`${vh}px`);
    // Upright phone: video fills the width, centred on black (like YouTube).
    // Turning the phone (rotation lock off) gives the full landscape view.
    card.classList.remove('is-rotated');
    requestAnimationFrame(syncVideoBounds);
  };

  const setFullscreenState=(enabled)=>{
    card.classList.toggle('is-web-fullscreen',enabled);
    document.body.classList.toggle('showreel-fullscreen-lock',enabled);
    fullscreen.setAttribute('aria-label',enabled?'Exit fullscreen':'Enter fullscreen');
    syncRotation();
  };

  const enterFullscreen=async()=>{
    setFullscreenState(true);
    if(!canElementFullscreen)return; // fallback: page-level fullscreen only
    try{
      if(card.requestFullscreen) await card.requestFullscreen({navigationUI:'hide'});
      else card.webkitRequestFullscreen();
    }catch(error){}
    if(isTouch&&screen.orientation&&screen.orientation.lock){
      try{await screen.orientation.lock('landscape');}catch(error){}
    }
    syncRotation();
  };

  const exitFullscreen=()=>{
    if(fsElement()){
      try{
        const result=document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
        if(result&&result.catch) result.catch(()=>{});
      }catch(error){}
    }
    if(screen.orientation&&screen.orientation.unlock){
      try{screen.orientation.unlock();}catch(error){}
    }
    setFullscreenState(false);
  };

  const toggleFullscreen=()=>{
    if(isFullscreen()) exitFullscreen();
    else enterFullscreen();
  };

  const onFullscreenChange=()=>{
    if(!fsElement()&&isFullscreen()&&canElementFullscreen) setFullscreenState(false);
    else syncRotation();
  };
  document.addEventListener('fullscreenchange',onFullscreenChange);
  document.addEventListener('webkitfullscreenchange',onFullscreenChange);

  fullscreen.addEventListener('click',(event)=>{
    event.stopPropagation();
    toggleFullscreen();
  });

  // Scrubbing while the player is rotated: map the finger position along the
  // rotated bar ourselves, because a rotated range input is unreliable on iOS.
  const wrap=progress.parentElement;
  let rotatedScrub=false;
  const rotatedRatio=(event)=>{
    const rect=wrap.getBoundingClientRect();
    return Math.min(1,Math.max(0,(event.clientY-rect.top)/rect.height));
  };
  const applyRotatedScrub=(event,commit)=>{
    const ratio=rotatedRatio(event);
    progress.value=String(Math.round(ratio*1000));
    if(commit&&Number.isFinite(video.duration)) video.currentTime=video.duration*ratio;
    syncTime();
  };
  wrap.addEventListener('pointerdown',(event)=>{
    if(!isRotated())return;
    event.preventDefault();
    event.stopPropagation();
    rotatedScrub=true;
    scrubbing=true;
    try{wrap.setPointerCapture(event.pointerId);}catch(error){}
    applyRotatedScrub(event,false);
  });
  wrap.addEventListener('pointermove',(event)=>{
    if(!rotatedScrub)return;
    event.preventDefault();
    applyRotatedScrub(event,false);
  });
  const endRotatedScrub=(event)=>{
    if(!rotatedScrub)return;
    rotatedScrub=false;
    scrubbing=false;
    applyRotatedScrub(event,true);
    syncPauseState();
  };
  wrap.addEventListener('pointerup',endRotatedScrub);
  wrap.addEventListener('pointercancel',endRotatedScrub);
  wrap.addEventListener('click',(event)=>event.stopPropagation());

  // Keep the page underneath from scrolling while the player covers the screen.
  card.addEventListener('touchmove',(event)=>{
    if(isFullscreen()&&!event.target.closest('.showreel-progress')) event.preventDefault();
  },{passive:false});

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

  // One tap/click = play/pause, two quick taps/clicks = fullscreen.
  // Detected from click timing so it also works on iPhone, where dblclick is unreliable.
  card.addEventListener('click',(event)=>{
    if(event.target.closest('.showreel-fullscreen,.showreel-progress-wrap,.play'))return;
    if(!(card.classList.contains('is-playing')||card.classList.contains('is-paused')))return;
    if(clickTimer){
      clearTimeout(clickTimer);
      clickTimer=null;
      toggleFullscreen();
      return;
    }
    clickTimer=setTimeout(()=>{clickTimer=null;togglePlayback();},280);
  });

  card.addEventListener('dblclick',(event)=>{
    event.preventDefault();
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
    if(isFullscreen()) exitFullscreen();
  });

  document.addEventListener('keydown',(event)=>{
    if(event.key==='Escape'&&isFullscreen()) exitFullscreen();
    if((event.code==='Space'||event.key===' ')&&(card.classList.contains('is-playing')||card.classList.contains('is-paused'))){
      if(document.activeElement===progress||document.activeElement===fullscreen)return;
      event.preventDefault();
      togglePlayback();
    }
  });

  window.addEventListener('resize',syncRotation);
  window.addEventListener('orientationchange',()=>setTimeout(syncRotation,250));
  if(window.visualViewport) window.visualViewport.addEventListener('resize',syncRotation);
  if('ResizeObserver' in window){
    new ResizeObserver(syncVideoBounds).observe(card);
  }

  syncPauseState();
  syncTime();
  syncVideoBounds();
})();