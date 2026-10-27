(() => {
  "use strict";

  const input = document.getElementById("photoInput");
  const canvas = document.getElementById("frameCanvas");
  const ctx = canvas.getContext("2d");
  const status = document.getElementById("status");
  const emptyState = document.getElementById("emptyState");
  const zoomRange = document.getElementById("zoomRange");
  const sizeSelect = document.getElementById("sizeSelect");
  const downloadBtn = document.getElementById("downloadBtn");

  let photo = null;
  let frame = "classic";
  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;

  const sizes = {
    portrait: [540, 675],
    square: [540, 540],
    story: [540, 960]
  };

  function setCanvasSize() {
    const size = sizes[sizeSelect.value] || sizes.portrait;
    canvas.width = size[0];
    canvas.height = size[1];
    draw();
  }

  function roundedRect(context, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + w, y, x + w, y + h, radius);
    context.arcTo(x + w, y + h, x, y + h, radius);
    context.arcTo(x, y + h, x, y, radius);
    context.arcTo(x, y, x + w, y, radius);
    context.closePath();
  }

  function drawPhoto() {
    if (!photo) return;
    const w = canvas.width, h = canvas.height;
    const scale = Math.max(w / photo.width, h / photo.height) * zoom;
    const dw = photo.width * scale, dh = photo.height * scale;
    const dx = (w - dw) / 2 + offsetX;
    const dy = (h - dh) / 2 + offsetY;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();
    ctx.drawImage(photo, dx, dy, dw, dh);
    ctx.restore();
  }

  function drawFrame() {
    const w = canvas.width, h = canvas.height;
    const short = Math.min(w, h);
    if (frame === "classic") {
      ctx.strokeStyle = "#123e9b"; ctx.lineWidth = short * .055; ctx.strokeRect(0, 0, w, h);
      ctx.strokeStyle = "#f5d66e"; ctx.lineWidth = short * .012; ctx.strokeRect(short*.035, short*.035, w-short*.07, h-short*.07);
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = short * .004; ctx.strokeRect(short*.06, short*.06, w-short*.12, h-short*.12);
      ctx.fillStyle = "#123e9b"; ctx.fillRect(0,0,w,short*.045); ctx.fillRect(0,h-short*.045,w,short*.045);
    } else if (frame === "celebration") {
      ctx.strokeStyle = "#a7192e"; ctx.lineWidth = short * .075; ctx.strokeRect(0, 0, w, h);
      ctx.strokeStyle = "#f6ca61"; ctx.lineWidth = short * .018; ctx.strokeRect(short*.045, short*.045, w-short*.09, h-short*.09);
      ctx.strokeStyle = "#fff0c2"; ctx.lineWidth = short * .006; ctx.strokeRect(short*.075, short*.075, w-short*.15, h-short*.15);
      const radius = short * .018;
      [[short*.06,short*.06],[w-short*.06,short*.06],[short*.06,h-short*.06],[w-short*.06,h-short*.06]].forEach(([x,y]) => {
        ctx.beginPath(); ctx.fillStyle="#f6ca61"; ctx.arc(x,y,radius,0,Math.PI*2); ctx.fill();
      });
    } else if (frame === "minimal") {
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = short * .065; ctx.strokeRect(0, 0, w, h);
      ctx.strokeStyle = "#cfd6e4"; ctx.lineWidth = short * .005; ctx.strokeRect(short*.045, short*.045, w-short*.09, h-short*.09);
    } else if (frame === "green") {
      ctx.strokeStyle = "#087847"; ctx.lineWidth = short * .065; ctx.strokeRect(0, 0, w, h);
      ctx.strokeStyle = "#e2f2cf"; ctx.lineWidth = short * .014; ctx.strokeRect(short*.04, short*.04, w-short*.08, h-short*.08);
      ctx.strokeStyle = "#d52b3f"; ctx.lineWidth = short * .012; ctx.strokeRect(short*.065, short*.065, w-short*.13, h-short*.13);
      ctx.fillStyle="#087847"; ctx.fillRect(0,0,w,short*.025); ctx.fillRect(0,h-short*.025,w,short*.025);
    }
  }

  function draw() {
    if (!ctx) {
      status.textContent = "এই ব্রাউজারে Canvas সমর্থিত নয়।";
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#e8edf7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (photo) drawPhoto();
    else {
      ctx.fillStyle = "#dbe3f1";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    drawFrame();
    emptyState.hidden = Boolean(photo);
  }

  input.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      status.textContent = "অনুগ্রহ করে JPG, PNG বা WEBP ছবি নির্বাচন করুন।";
      input.value = "";
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      status.textContent = "ছবিটি ২০ MB-এর চেয়ে বড়। ছোট ছবি নির্বাচন করুন।";
      input.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      photo = img;
      zoom = 1; offsetX = 0; offsetY = 0;
      zoomRange.value = "1";
      status.textContent = "ছবি লোড হয়েছে: " + file.name;
      draw();
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      status.textContent = "ছবিটি খোলা যায়নি। অন্য ছবি নির্বাচন করুন।";
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });

  document.querySelectorAll(".frame-choice").forEach((button) => {
    button.addEventListener("click", () => {
      frame = button.dataset.frame;
      document.querySelectorAll(".frame-choice").forEach(b => b.classList.toggle("active", b === button));
      draw();
    });
  });

  zoomRange.addEventListener("input", () => {
    zoom = Number(zoomRange.value) || 1;
    draw();
  });

  function nudge(x, y) {
    offsetX += x * canvas.width * .04;
    offsetY += y * canvas.height * .04;
    draw();
  }
  document.getElementById("moveLeft").addEventListener("click", () => nudge(-1, 0));
  document.getElementById("moveRight").addEventListener("click", () => nudge(1, 0));
  document.getElementById("moveUp").addEventListener("click", () => nudge(0, -1));
  document.getElementById("moveDown").addEventListener("click", () => nudge(0, 1));
  document.getElementById("resetPosition").addEventListener("click", () => {
    zoom = 1; offsetX = 0; offsetY = 0; zoomRange.value = "1"; draw();
  });
  sizeSelect.addEventListener("change", setCanvasSize);

  downloadBtn.addEventListener("click", () => {
    if (!photo) {
      status.textContent = "ডাউনলোডের আগে একটি ছবি নির্বাচন করুন।";
      input.click();
      return;
    }
    const output = document.createElement("canvas");
    const target = sizes[sizeSelect.value] || sizes.portrait;
    output.width = target[0] * 2;
    output.height = target[1] * 2;
    const outCtx = output.getContext("2d");
    outCtx.drawImage(canvas, 0, 0, output.width, output.height);
    output.toBlob((blob) => {
      if (!blob) {
        status.textContent = "PNG তৈরি করা যায়নি। আবার চেষ্টা করুন।";
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "photo-frame.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      status.textContent = "PNG ডাউনলোড শুরু হয়েছে।";
    }, "image/png");
  });

  setCanvasSize();
})(); 
