(() => {
  const shell = document.getElementById('viewerShell');
  const pagesEl = document.getElementById('pdfPages');
  const statusEl = document.getElementById('viewerStatus');
  const PDF_URL = 'assets/cv.pdf';
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3.5;

  let pdf = null;
  let baseScale = 1;
  let zoom = 1;
  let renderToken = 0;
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;
  let pinchZoom = 1;
  let liveScale = 1;

  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  function distance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  function midpoint(touches) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  }

  function clearLiveTransform() {
    liveScale = 1;
    pagesEl.style.transform = '';
    pagesEl.style.transformOrigin = '';
    pagesEl.style.willChange = '';
  }

  async function calculateBaseScale() {
    const firstPage = await pdf.getPage(1);
    const unit = firstPage.getViewport({ scale: 1 });
    const mobile = window.matchMedia('(max-width: 700px)').matches;
    const horizontalPadding = mobile ? 16 : 36;
    const verticalPadding = mobile ? 16 : 36;
    const availableWidth = Math.max(100, shell.clientWidth - horizontalPadding);
    const availableHeight = Math.max(100, shell.clientHeight - verticalPadding);
    return Math.min(availableWidth / unit.width, availableHeight / unit.height);
  }

  async function renderDocument(preservePosition = false) {
    const token = ++renderToken;
    const oldScrollWidth = shell.scrollWidth;
    const oldScrollHeight = shell.scrollHeight;
    const oldCenterX = shell.scrollLeft + shell.clientWidth / 2;
    const oldCenterY = shell.scrollTop + shell.clientHeight / 2;
    const xRatio = oldScrollWidth ? oldCenterX / oldScrollWidth : 0.5;
    const yRatio = oldScrollHeight ? oldCenterY / oldScrollHeight : 0;

    clearLiveTransform();
    pagesEl.innerHTML = '';
    statusEl.textContent = 'Rendering CV…';
    statusEl.classList.remove('hidden');

    const scale = baseScale * zoom;
    const outputScale = Math.min(window.devicePixelRatio || 1, 2);

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      if (token !== renderToken) return;
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page';
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      pagesEl.appendChild(canvas);

      const context = canvas.getContext('2d', { alpha: false });
      await page.render({
        canvasContext: context,
        viewport,
        transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0]
      }).promise;
    }

    statusEl.classList.add('hidden');

    if (preservePosition) {
      requestAnimationFrame(() => {
        shell.scrollLeft = Math.max(0, shell.scrollWidth * xRatio - shell.clientWidth / 2);
        shell.scrollTop = Math.max(0, shell.scrollHeight * yRatio - shell.clientHeight / 2);
      });
    } else {
      shell.scrollLeft = Math.max(0, (shell.scrollWidth - shell.clientWidth) / 2);
      shell.scrollTop = 0;
    }
  }

  async function init() {
    try {
      pdf = await pdfjsLib.getDocument(PDF_URL).promise;
      baseScale = await calculateBaseScale();
      zoom = 1;
      await renderDocument(false);
    } catch (error) {
      console.error(error);
      statusEl.innerHTML = 'Could not load CV. <a href="assets/cv.pdf" style="color:#78adff">Open PDF</a>';
    }
  }

  shell.addEventListener('touchstart', (event) => {
    if (event.touches.length === 2) {
      pinchStartDistance = distance(event.touches);
      pinchStartZoom = zoom;
      pinchZoom = zoom;
      liveScale = 1;

      const point = midpoint(event.touches);
      const rect = pagesEl.getBoundingClientRect();
      const originX = point.x - rect.left;
      const originY = point.y - rect.top;
      pagesEl.style.transformOrigin = `${originX}px ${originY}px`;
      pagesEl.style.willChange = 'transform';
    }
  }, { passive: true });

  shell.addEventListener('touchmove', (event) => {
    if (event.touches.length !== 2 || !pinchStartDistance) return;
    event.preventDefault();

    const factor = distance(event.touches) / pinchStartDistance;
    pinchZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoom * factor));
    liveScale = pinchZoom / pinchStartZoom;

    // Fast visual feedback while the fingers are moving. The PDF is re-rendered
    // at full quality only after the gesture ends.
    pagesEl.style.transform = `scale(${liveScale})`;
  }, { passive: false });

  shell.addEventListener('touchend', async (event) => {
    if (event.touches.length < 2 && pinchStartDistance) {
      pinchStartDistance = 0;
      const targetZoom = pinchZoom;
      clearLiveTransform();

      if (Math.abs(targetZoom - zoom) > 0.01) {
        zoom = targetZoom;
        await renderDocument(true);
      }
    }
  }, { passive: true });

  shell.addEventListener('touchcancel', () => {
    pinchStartDistance = 0;
    pinchZoom = zoom;
    clearLiveTransform();
  }, { passive: true });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(async () => {
      if (!pdf || zoom !== 1) return;
      baseScale = await calculateBaseScale();
      await renderDocument(false);
    }, 180);
  });

  init();
})();
