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
  let pinchStartMidpoint = null;
  let lastPinchMidpoint = null;
  let liveDx = 0;
  let liveDy = 0;

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
    liveDx = 0;
    liveDy = 0;
    pinchStartMidpoint = null;
    lastPinchMidpoint = null;
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

  async function buildPages(scale, token) {
    const fragment = document.createDocumentFragment();
    const outputScale = Math.min(window.devicePixelRatio || 1, 2);

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      if (token !== renderToken) return null;
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page';
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const context = canvas.getContext('2d', { alpha: false });
      await page.render({
        canvasContext: context,
        viewport,
        transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0]
      }).promise;

      fragment.appendChild(canvas);
    }

    return fragment;
  }

  async function renderInitial() {
    const token = ++renderToken;
    statusEl.textContent = 'Rendering CV…';
    statusEl.classList.remove('hidden');
    const fragment = await buildPages(baseScale * zoom, token);
    if (!fragment || token !== renderToken) return;

    pagesEl.replaceChildren(fragment);
    statusEl.classList.add('hidden');
    shell.scrollLeft = Math.max(0, (shell.scrollWidth - shell.clientWidth) / 2);
    shell.scrollTop = 0;
  }

  async function commitPinch(targetZoom, anchorInfo) {
    const token = ++renderToken;
    const fragment = await buildPages(baseScale * targetZoom, token);
    if (!fragment || token !== renderToken) return;

    zoom = targetZoom;

    // Important: the old live transform already represents targetZoom visually.
    // The freshly rendered canvases are ALSO at targetZoom. If we keep the live
    // transform for even one frame after swapping, the new render gets scaled a
    // second time and produces the visible jump. Clear the transform and place
    // the new render in the exact matching scroll position in the same JS task,
    // before the browser can paint another frame.
    pagesEl.style.transform = '';
    pagesEl.style.transformOrigin = '';
    pagesEl.style.willChange = '';
    pagesEl.replaceChildren(fragment);

    // Force layout now so dimensions below are those of the final crisp render.
    const finalWidth = pagesEl.offsetWidth;
    const finalHeight = pagesEl.offsetHeight;
    const desiredLeft = anchorInfo.normalizedX * finalWidth - anchorInfo.viewportX;
    const desiredTop = anchorInfo.normalizedY * finalHeight - anchorInfo.viewportY;
    const maxLeft = Math.max(0, shell.scrollWidth - shell.clientWidth);
    const maxTop = Math.max(0, shell.scrollHeight - shell.clientHeight);
    const clampedLeft = Math.min(maxLeft, Math.max(0, desiredLeft));
    const clampedTop = Math.min(maxTop, Math.max(0, desiredTop));

    shell.scrollLeft = clampedLeft;
    shell.scrollTop = clampedTop;

    const correctionX = Math.abs(desiredLeft - clampedLeft);
    const correctionY = Math.abs(desiredTop - clampedTop);

    liveScale = 1;
    liveDx = 0;
    liveDy = 0;
    pinchStartMidpoint = null;
    lastPinchMidpoint = null;

    // Only edge correction is animated. Normal pinch release has no transition,
    // because the final render should be pixel-for-pixel at the released scale.
    if (correctionX > 2 || correctionY > 2) {
      shell.scrollTo({ left: clampedLeft, top: clampedTop, behavior: 'smooth' });
    }
  }

  async function init() {
    try {
      pdf = await pdfjsLib.getDocument(PDF_URL).promise;
      baseScale = await calculateBaseScale();
      zoom = 1;
      await renderInitial();
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
      liveDx = 0;
      liveDy = 0;
      pinchStartMidpoint = midpoint(event.touches);
      lastPinchMidpoint = pinchStartMidpoint;

      const rect = pagesEl.getBoundingClientRect();
      const originX = pinchStartMidpoint.x - rect.left;
      const originY = pinchStartMidpoint.y - rect.top;
      pagesEl.style.transformOrigin = `${originX}px ${originY}px`;
      pagesEl.style.willChange = 'transform';
    }
  }, { passive: true });

  shell.addEventListener('touchmove', (event) => {
    if (event.touches.length !== 2 || !pinchStartDistance || !pinchStartMidpoint) return;
    event.preventDefault();

    const factor = distance(event.touches) / pinchStartDistance;
    pinchZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoom * factor));
    liveScale = pinchZoom / pinchStartZoom;

    const point = midpoint(event.touches);
    lastPinchMidpoint = point;
    liveDx = point.x - pinchStartMidpoint.x;
    liveDy = point.y - pinchStartMidpoint.y;

    pagesEl.style.transform = `translate(${liveDx}px, ${liveDy}px) scale(${liveScale})`;
  }, { passive: false });

  shell.addEventListener('touchend', (event) => {
    if (event.touches.length < 2 && pinchStartDistance) {
      pinchStartDistance = 0;
      const targetZoom = pinchZoom;
      const point = lastPinchMidpoint || pinchStartMidpoint;
      const shellRect = shell.getBoundingClientRect();
      const transformedRect = pagesEl.getBoundingClientRect();
      const normalizedX = transformedRect.width
        ? (point.x - transformedRect.left) / transformedRect.width
        : 0.5;
      const normalizedY = transformedRect.height
        ? (point.y - transformedRect.top) / transformedRect.height
        : 0;

      const anchorInfo = {
        normalizedX: Math.min(1, Math.max(0, normalizedX)),
        normalizedY: Math.min(1, Math.max(0, normalizedY)),
        viewportX: point.x - shellRect.left,
        viewportY: point.y - shellRect.top
      };

      if (Math.abs(targetZoom - zoom) > 0.01) {
        commitPinch(targetZoom, anchorInfo);
      } else {
        pagesEl.style.transition = 'transform 160ms ease-out';
        pagesEl.style.transform = '';
        setTimeout(() => {
          pagesEl.style.transition = '';
          clearLiveTransform();
        }, 170);
      }
    }
  }, { passive: true });

  shell.addEventListener('touchcancel', () => {
    pinchStartDistance = 0;
    pinchZoom = zoom;
    pagesEl.style.transition = 'transform 160ms ease-out';
    pagesEl.style.transform = '';
    setTimeout(() => {
      pagesEl.style.transition = '';
      clearLiveTransform();
    }, 170);
  }, { passive: true });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(async () => {
      if (!pdf || zoom !== 1) return;
      baseScale = await calculateBaseScale();
      await renderInitial();
    }, 180);
  });

  init();
})();
