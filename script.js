(() => {
  const input = document.getElementById('photoInput');
  const canvas = document.getElementById('previewCanvas');
  const ctx = canvas.getContext('2d');
  const zoom = document.getElementById('zoom');
  const zoomValue = document.getElementById('zoomValue');
  const frameSelect = document.getElementById('frameSelect');
  const formatSelect = document.getElementById('format');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const status = document.getElementById('status');
  const emptyState = document.getElementById('emptyState');
  const shell = document.getElementById('canvasShell');

  let photo = null, objectUrl = null, scale = 1, offsetX = 0, offsetY = 0;
  let dragging = false, lastX = 0, lastY = 0;
  const frameStyles = {
    classic: {outer:'#173e75', inner:'#e6f1ff', width:.035},
    celebration: {outer:'#a71930', inner:'#f5c86a', width:.045},
    minimal: {outer:'#ffffff', inner:'#252b37', width:.018},
    joy: {outer:'#087a4a', inner:'#e62b3b', width:.045}
  };

  function setStatus(msg) { status.textContent = msg; }
  function drawFrame(c, w, h) {
    const f = frameStyles[frameSelect.value];
    const bw = Math.max(8, Math.round(Math.min(w,h) * f.width));
    c.save();
    c.lineWidth = bw;
    c.strokeStyle = f.outer;
    c.strokeRect(bw/2, bw/2, w-bw, h-bw);
    c.lineWidth = Math.max(2, bw*.22);
    c.strokeStyle = f.inner;
    c.strokeRect(bw*1.35, bw*1.35, w-bw*2.7, h-bw*2.7);
    if (frameSelect.value === 'celebration' || frameSelect.value === 'joy') {
      const bandH = Math.round(h*.075);
      c.fillStyle = f.outer;
      c.fillRect(bw, h-bandH-bw, w-bw*2, bandH);
      c.fillStyle = f.inner;
      c.font = `700 ${Math.round(bandH*.38)}px sans-serif`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(frameSelect.value === 'joy' ? 'আমরা জয় বাংলার লোক' : 'SPECIAL MOMENT', w/2, h-bandH/2-bw, w-bw*4);
    }
    c.restore();
  }
  function drawImageCover(c, w, h) {
    if (!photo) return;
    const base = Math.max(w/photo.width, h/photo.height);
    const s = base * scale;
    const dw = photo.width*s, dh = photo.height*s;
    const x = (w-dw)/2 + offsetX*(w/canvas.width);
    const y = (h-dh)/2 + offsetY*(h/canvas.height);
    c.save();
    c.beginPath(); c.rect(0,0,w,h); c.clip();
    c.drawImage(photo,x,y,dw,dh);
    c.restore();
  }
  function render() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#e9edf2'; ctx.fillRect(0,0,canvas.width,canvas.height);
    drawImageCover(ctx,canvas.width,canvas.height);
    drawFrame(ctx,canvas.width,canvas.height);
    zoomValue.value = `${zoom.value}%`;
    zoomValue.textContent = `${zoom.value}%`;
  }
  function setCanvasRatio() {
    const [w,h] = formatSelect.value.split('x').map(Number);
    // Keep preview canvas lighter; final export uses the selected full dimensions.
    const ratio = w/h, maxW = 540, maxH = 675;
    if (ratio > maxW/maxH) { canvas.width = maxW; canvas.height = Math.round(maxW/ratio); }
    else { canvas.height = maxH; canvas.width = Math.round(maxH*ratio); }
    shell.style.aspectRatio = `${w}/${h}`;
    render();
  }
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setStatus('অনুগ্রহ করে একটি ছবি নির্বাচন করুন।'); return; }
    if (file.size > 20*1024*1024) { setStatus('ছবির সাইজ ২০ MB-এর কম রাখুন।'); return; }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      photo = img; scale = 1; offsetX = 0; offsetY = 0; zoom.value = 100;
      emptyState.hidden = true; downloadBtn.disabled = false;
      setStatus(`ছবি লোড হয়েছে: ${file.name}`);
      render();
    };
    img.onerror = () => setStatus('ছবিটি খোলা যায়নি। অন্য একটি ছবি চেষ্টা করুন।');
    img.src = objectUrl;
  });
  zoom.addEventListener('input', () => { scale = Number(zoom.value)/100; render(); });
  frameSelect.addEventListener('change', render);
  formatSelect.addEventListener('change', setCanvasRatio);

  document.querySelectorAll('[data-move]').forEach(btn => btn.addEventListener('click', () => {
    const amount = 18;
    switch (btn.dataset.move) {
      case 'up': offsetY -= amount; break;
      case 'down': offsetY += amount; break;
      case 'left': offsetX -= amount; break;
      case 'right': offsetX += amount; break;
      case 'center': offsetX = 0; offsetY = 0; break;
    }
    render();
  }));
  shell.addEventListener('pointerdown', e => {
    if (!photo) return;
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    shell.setPointerCapture(e.pointerId);
  });
  shell.addEventListener('pointermove', e => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    offsetX += (e.clientX-lastX)*canvas.width/rect.width;
    offsetY += (e.clientY-lastY)*canvas.height/rect.height;
    lastX = e.clientX; lastY = e.clientY; render();
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev => shell.addEventListener(ev, () => dragging = false));

  downloadBtn.addEventListener('click', () => {
    if (!photo) return;
    const [w,h] = formatSelect.value.split('x').map(Number);
    const out = document.createElement('canvas'); out.width = w; out.height = h;
    const outCtx = out.getContext('2d');
    outCtx.fillStyle = '#fff'; outCtx.fillRect(0,0,w,h);
    drawImageCover(outCtx,w,h);
    drawFrame(outCtx,w,h);
    out.toBlob(blob => {
      if (!blob) { setStatus('ডাউনলোড তৈরি করা যায়নি। আবার চেষ্টা করুন।'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'photo-frame.png'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setStatus('PNG ডাউনলোড শুরু হয়েছে।');
    },'image/png');
  });
  resetBtn.addEventListener('click', () => {
    input.value = ''; photo = null; scale = 1; offsetX = 0; offsetY = 0; zoom.value = 100;
    emptyState.hidden = false; downloadBtn.disabled = true; setStatus('শুরু করতে একটি ছবি নির্বাচন করুন।'); render();
  });
  document.getElementById('year').textContent = new Date().getFullYear();
  setCanvasRatio();
})();