(function () {
  const viewer = document.querySelector('.xp-viewer .image');
  const toolbar = document.querySelector('.xp-viewer .toolbar');
  const shell = document.querySelector('.xp-viewer');
  const titleLabel = document.querySelector('.titlebar .label');
  const windowEl = document.querySelector('.window');

  if (!viewer || !toolbar) return;

  const state = {
    images: [],
    index: 0,
    img: null,
    scale: 1,
    rotation: 0,
    flipH: 1,
    mode: 'fit',
    slideshowInterval: null,
  };

  const controls = {
    prev: toolbar.querySelector('.prev'),
    next: toolbar.querySelector('.next'),
    maximise: toolbar.querySelector('.maximise'),
    minimise: toolbar.querySelector('.minimise'),
    slideshow: toolbar.querySelector('.slideshow'),
    zoomin: toolbar.querySelector('.zoomin'),
    zoomout: toolbar.querySelector('.zoomout'),
    flipleft: toolbar.querySelector('.flipleft'),
    flipright: toolbar.querySelector('.flipright'),
    delete: toolbar.querySelector('.delete'),
    print: toolbar.querySelector('.print'),
    save: toolbar.querySelector('.save'),
    edit: toolbar.querySelector('.edit'),
    help: toolbar.querySelector('.help'),
  };

  const windowButtons = {
    close: document.querySelector('.titlebar .close'),
    maximize: document.querySelector('.titlebar .maximize'),
    minimize: document.querySelector('.titlebar .minimize'),
  };

  function normalizeSrc(src) {
    if (!src) return null;
    if (/^(https?:)?\/\//i.test(src)) return src;
    return '/' + src.replace(/^\//, '');
  }

  function setTitleSuffix(text) {
    if (!titleLabel) return;
    const base = 'Windows Picture and Fax Viewer';
    titleLabel.textContent = text ? `${base} - ${text}` : base;
  }

  function showLoading(text = 'Loading image...') {
    const existing = viewer.querySelector('.loading');
    if (existing) {
      existing.textContent = text;
      return;
    }
    const el = document.createElement('div');
    el.className = 'loading';
    el.textContent = text;
    viewer.appendChild(el);
  }

  function clearLoading() {
    const existing = viewer.querySelector('.loading');
    if (existing) existing.remove();
  }

  function showMessage(text) {
    viewer.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'loading';
    el.textContent = text;
    viewer.appendChild(el);
  }

  function applyTransform() {
    const img = state.img;
    if (!img || !img.naturalWidth || !img.naturalHeight) return;
    const containerWidth = viewer.clientWidth;
    const containerHeight = viewer.clientHeight;
    const iw = img.naturalWidth || 1;
    const ih = img.naturalHeight || 1;
    const rad = state.rotation * Math.PI / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const rotatedWidth = iw * cos + ih * sin;
    const rotatedHeight = iw * sin + ih * cos;
    let fitScale = 1;
    if (state.mode === 'fit') {
      fitScale = Math.min(containerWidth / rotatedWidth, containerHeight / rotatedHeight);
    }
    const finalScale = state.scale * fitScale;
    img.style.transform = `scale(${finalScale * state.flipH}) rotate(${state.rotation}deg)`;
    img.style.width = `${iw}px`;
    img.style.height = `${ih}px`;
    img.style.maxWidth = 'none';
    img.style.maxHeight = 'none';
    img.style.display = 'block';
  }

  function getFinalScaleForExport() {
    const img = state.img;
    if (!img || !img.naturalWidth || !img.naturalHeight) return 1;
    const iw = img.naturalWidth || 1;
    const ih = img.naturalHeight || 1;
    const rad = state.rotation * Math.PI / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const rotatedWidth = iw * cos + ih * sin;
    const rotatedHeight = iw * sin + ih * cos;
    if (state.mode === 'fit') {
      const fitScale = Math.min(viewer.clientWidth / rotatedWidth, viewer.clientHeight / rotatedHeight);
      return state.scale * fitScale;
    }
    return state.scale;
  }

  function getTransformedBlob() {
    return new Promise((resolve, reject) => {
      const img = state.img;
      if (!img || !img.naturalWidth || !img.naturalHeight) {
        reject(new Error('No image loaded'));
        return;
      }
      const iw = img.naturalWidth || 1;
      const ih = img.naturalHeight || 1;
      const rad = state.rotation * Math.PI / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const rotatedWidth = iw * cos + ih * sin;
      const rotatedHeight = iw * sin + ih * cos;
      const finalScale = getFinalScaleForExport();
      const canvasW = Math.max(1, Math.round(rotatedWidth * finalScale));
      const canvasH = Math.max(1, Math.round(rotatedHeight * finalScale));
      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvasW / 2, canvasH / 2);
      ctx.rotate(rad);
      ctx.scale(state.flipH * finalScale, finalScale);
      ctx.drawImage(img, -iw / 2, -ih / 2);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to export'));
      }, 'image/png');
    });
  }

  function updateButtons() {
    if (controls.minimise) {
      if (state.mode === 'fit') {
        controls.minimise.classList.add('active');
      } else {
        controls.minimise.classList.remove('active');
      }
    }
    if (controls.maximise) {
      if (state.mode === 'actual') {
        controls.maximise.classList.add('active');
      } else {
        controls.maximise.classList.remove('active');
      }
    }
  }

  function stopSlideshow() {
    if (state.slideshowInterval) {
      clearInterval(state.slideshowInterval);
      state.slideshowInterval = null;
      controls.slideshow?.classList.remove('active');
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  async function loadAt(i) {
    if (!state.images.length) return;
    if (i < 0) i = state.images.length - 1;
    if (i >= state.images.length) i = 0;
    state.index = i;

    if (state.img) {
      state.img.remove();
      state.img = null;
    }

    showLoading();

    const imageInfo = state.images[state.index];
    const newImg = new Image();
    newImg.alt = imageInfo.alt || 'Image';
    newImg.decoding = 'async';
    newImg.src = imageInfo.src;
    newImg.onload = () => {
      clearLoading();
      state.scale = 1;
      state.rotation = 0;
      state.flipH = 1;
      state.mode = 'fit';
      updateButtons();
      state.img = newImg;
      viewer.appendChild(newImg);
      applyTransform();
      setTitleSuffix(imageInfo.alt);
    };
    newImg.onerror = () => {
      clearLoading();
      showMessage('Failed to load image');
    };
  }

  async function loadImagesFromProjects() {
    try {
      const res = await fetch('/projects.json');
      if (!res.ok) throw new Error('Failed to fetch projects.json');
      const projects = await res.json();
      const collected = [];
      projects.forEach((project) => {
        if (Array.isArray(project.images)) {
          project.images.forEach((img) => {
            const src = normalizeSrc(img?.src);
            if (!src) return;
            const alt = (img?.alt || project.title || '').trim() || 'Image';
            collected.push({ src, alt });
          });
        }
      });
      return collected;
    } catch (err) {
      console.error('Failed to load project images', err);
      return [];
    }
  }

  async function initImages() {
    const list = await loadImagesFromProjects();
    if (list.length) {
      state.images = list;
      return;
    }

    // Fallback to Bliss wallpaper from the copied static assets
    const fallback = normalizeSrc('apps/openlair-viewer/static/images/wallpaper/Bliss.jpg');
    if (fallback) {
      state.images = [{ src: fallback, alt: 'Bliss' }];
    }
  }

  function wireToolbar() {
    controls.prev?.addEventListener('click', () => loadAt(state.index - 1));
    controls.next?.addEventListener('click', () => loadAt(state.index + 1));

    controls.maximise?.addEventListener('click', () => {
      if (state.mode === 'actual') {
        state.mode = 'fit';
      } else {
        state.mode = 'actual';
        state.scale = 1;
      }
      updateButtons();
      applyTransform();
    });

    controls.minimise?.addEventListener('click', () => {
      state.mode = 'fit';
      state.scale = 1;
      state.rotation = 0;
      state.flipH = 1;
      updateButtons();
      applyTransform();
    });

    controls.slideshow?.addEventListener('click', async () => {
      if (state.slideshowInterval) {
        stopSlideshow();
        return;
      }
      controls.slideshow.classList.add('active');
      state.scale = 1;
      state.rotation = 0;
      state.flipH = 1;
      state.mode = 'fit';
      applyTransform();
      if (shell?.requestFullscreen) {
        try {
          await shell.requestFullscreen();
        } catch (err) {
          console.warn('Fullscreen request was blocked', err);
        }
      }
      state.slideshowInterval = setInterval(async () => {
        await loadAt(state.index + 1);
        state.scale = 1;
        state.rotation = 0;
        state.flipH = 1;
        state.mode = 'fit';
        applyTransform();
      }, 5000);
    });

    controls.zoomin?.addEventListener('click', () => {
      state.scale = Math.min(state.scale * 1.25, 16);
      state.mode = 'actual';
      updateButtons();
      applyTransform();
    });

    controls.zoomout?.addEventListener('click', () => {
      state.scale = Math.max(state.scale / 1.25, 0.0625);
      state.mode = 'actual';
      updateButtons();
      applyTransform();
    });

    controls.flipleft?.addEventListener('click', () => {
      state.rotation = (state.rotation - 90) % 360;
      applyTransform();
    });

    controls.flipright?.addEventListener('click', () => {
      state.rotation = (state.rotation + 90) % 360;
      applyTransform();
    });

    controls.delete?.addEventListener('click', () => {
      alert('Delete is not available in this demo viewer.');
    });

    controls.print?.addEventListener('click', async () => {
      try {
        const blob = await getTransformedBlob();
        const url = URL.createObjectURL(blob);
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          alert('Please allow popups to print.');
          return;
        }
        printWindow.document.write(`
          <html>
            <head>
              <title>Print</title>
              <style>
                @media print { html,body{width:100%;height:100%;margin:0} img{display:block;margin:auto;max-width:100%;max-height:100%;object-fit:contain} }
                body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh}
                img{max-width:100vw;max-height:100vh;object-fit:contain;display:block;margin:auto}
              </style>
            </head>
            <body>
              <img src="${url}" onload="window.print(); window.close();" />
            </body>
          </html>
        `);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } catch {
        alert('No image to print');
      }
    });

    controls.save?.addEventListener('click', async () => {
      try {
        const originalScale = state.scale;
        const originalMode = state.mode;
        state.scale = 1;
        state.mode = 'actual';
        const blob = await getTransformedBlob();
        state.scale = originalScale;
        state.mode = originalMode;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const alt = state.images[state.index]?.alt || 'image';
        const safeName = `${alt}`.replace(/\s+/g, '_').replace(/[^\w.-]/g, '') || 'image';
        link.download = `${safeName}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      } catch {
        alert('No image to save');
      }
    });

    controls.edit?.addEventListener('click', () => {
      alert('Edit is not wired up yet inside the standalone viewer.');
    });

    controls.help?.addEventListener('click', () => {
      alert('Use the toolbar to navigate, zoom, rotate, and print images from your projects.');
    });
  }

  function wireWindowControls() {
    const sendAction = (action) => {
      window.parent?.postMessage(
        { type: 'xportfolio', action },
        '*'
      );
    };
    windowButtons.close?.addEventListener('click', () => sendAction('close'));
    windowButtons.minimize?.addEventListener('click', () => sendAction('minimize'));
    windowButtons.maximize?.addEventListener('click', () => sendAction('maximize'));

    // Double-click title bar to maximize/restore host window
    const titleBar = document.querySelector('.titlebar');
    titleBar?.addEventListener('dblclick', () => sendAction('maximize'));
  }

  async function init() {
    wireToolbar();
    wireWindowControls();
    await initImages();
    if (!state.images.length) {
      showMessage('No images available');
      return;
    }
    await loadAt(0);
    window.addEventListener('resize', applyTransform);
    window.addEventListener('beforeunload', stopSlideshow);
  }

  init();
})();
