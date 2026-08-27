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
    </div>
    <div class="showreel-bottom-controls">
      <button class="showreel-control-btn showreel-toggle" type="button" aria-label="Pause">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path class="pause-icon" d="M8 6v12M16 6v12"/><path class="play-icon fill-icon" d="M9 6.5 18 12l-9 5.5z" style="display:none"/></svg>
      </button>
      <span class="showreel-time"><span class="showreel-current">0:00</span> / <span class="showreel-duration">0:00</span></span>
      <div class="showreel-controls-spacer"></div>
      <button class="showreel-control-btn showreel-mute" type="button" aria-label="Mute">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10v4h4l5 4V6L9 10H5Z"/><path class="sound-waves" d="M17 9c1 .8 1.5 1.8 1.5 3S18 14.2 17 15M19 6.8c1.7 1.4 2.5 3.1 2.5 5.2S20.7 15.8 19 17.2"/></svg>
      </button>
      <button class="showreel-control-btn showreel-fullscreen" type="button" aria-label="Enter fullscreen">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4"/></svg>
      </button>
    </div>`;
  card.appendChild(ui);

  const progress=ui.querySelector('.showreel-progress');
  const toggle=ui.querySelector('.showreel-toggle');
  const mute=ui.querySelector('.showreel-mute');
  const fullscreen=ui.querySelector('.showreel-fullscreen');
  const currentEl=ui.querySelector('.showreel-current');
  const durationEl=ui.querySelector('.showreel-duration');
  const pauseIcon=ui.querySelector('.pause-icon');
  const playIcon=ui.querySelector('.play-icon');
  const soundWaves=ui.querySelector('.sound-waves');

  let hideTimer=null;
  let scrubbing=false;

  const formatTime=(seconds)=>{
    if(!Number.isFinite(seconds))return '0:00';
    const total=Math.max(0,Math.floor(seconds));
    const mins=Math.floor(total/60);
    const secs=String(total%60).padStart(2,'0');
    return `${mins}:${secs}`;
  };

  const showControls=()=>{
    card.classList.add('show-controls');
    clearTimeout(hideTimer);
    if(!video.paused){
      hideTimer=setTimeout(()=>card.classList.remove('show-controls'),2600);
    }
  };

  const syncPlayIcon=()=>{
    const paused=video.paused;
    pauseIcon.style.display=paused?'none':'';
    playIcon.style.display=paused?'':'none';
    toggle.setAttribute('aria-label',paused?'Play':'Pause');
    card.classList.toggle('is-paused',paused&&!video.ended);
  };

  const syncMuteIcon=()=>{
    soundWaves.style.display=video.muted||video.volume===0?'none':'';
    mute.setAttribute('aria-label',video.muted||video.volume===0?'Unmute':'Mute');
  };

  const syncTime=()=>{
    if(!scrubbing&&Number.isFinite(video.duration)&&video.duration>0){
      const ratio=Math.min(1,Math.max(0,video.currentTime/video.duration));
      progress.value=String(Math.round(ratio*1000));
      progress.style.setProperty('--showreel-progress',`${ratio*100}%`);
    }
    currentEl.textContent=formatTime(video.currentTime);
    durationEl.textContent=formatTime(video.duration);
  };

  const togglePlayback=()=>{
    if(video.paused||video.ended){
      video.play().catch(()=>{});
    }else{
      video.pause();
    }
    showControls();
  };

  toggle.addEventListener('click',(event)=>{event.stopPropagation();togglePlayback();});
  mute.addEventListener('click',(event)=>{
    event.stopPropagation();
    video.muted=!video.muted;
    syncMuteIcon();
    showControls();
  });

  const setFullscreen=(enabled)=>{
    card.classList.toggle('is-web-fullscreen',enabled);
    document.body.classList.toggle('showreel-fullscreen-lock',enabled);
    fullscreen.setAttribute('aria-label',enabled?'Exit fullscreen':'Enter fullscreen');
    showControls();
  };

  fullscreen.addEventListener('click',(event)=>{
    event.stopPropagation();
    setFullscreen(!card.classList.contains('is-web-fullscreen'));
  });

  progress.addEventListener('input',()=>{
    scrubbing=true;
    const ratio=Number(progress.value)/1000;
    progress.style.setProperty('--showreel-progress',`${ratio*100}%`);
    if(Number.isFinite(video.duration)) currentEl.textContent=formatTime(video.duration*ratio);
  });
  progress.addEventListener('change',()=>{
    const ratio=Number(progress.value)/1000;
    if(Number.isFinite(video.duration)) video.currentTime=video.duration*ratio;
    scrubbing=false;
    syncTime();
    showControls();
  });
  progress.addEventListener('pointerdown',()=>{scrubbing=true;clearTimeout(hideTimer);card.classList.add('show-controls');});
  progress.addEventListener('pointerup',()=>{scrubbing=false;});

  card.addEventListener('click',(event)=>{
    if(event.target.closest('.showreel-control-btn,.showreel-progress-wrap,.play'))return;
    if(card.classList.contains('is-playing')||card.classList.contains('is-paused')) showControls();
  });
  card.addEventListener('pointermove',()=>{
    if(card.classList.contains('is-playing')||card.classList.contains('is-paused')) showControls();
  });

  video.addEventListener('loadedmetadata',syncTime);
  video.addEventListener('durationchange',syncTime);
  video.addEventListener('timeupdate',syncTime);
  video.addEventListener('play',()=>{syncPlayIcon();showControls();});
  video.addEventListener('playing',()=>{syncPlayIcon();showControls();});
  video.addEventListener('pause',()=>{syncPlayIcon();showControls();});
  video.addEventListener('volumechange',syncMuteIcon);
  video.addEventListener('ended',()=>{
    syncPlayIcon();
    card.classList.add('show-controls');
    clearTimeout(hideTimer);
    if(card.classList.contains('is-web-fullscreen')) setFullscreen(false);
  });

  document.addEventListener('keydown',(event)=>{
    if(event.key==='Escape'&&card.classList.contains('is-web-fullscreen')) setFullscreen(false);
  });

  syncPlayIcon();
  syncMuteIcon();
  syncTime();
})();
