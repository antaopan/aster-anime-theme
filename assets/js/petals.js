(() => {
  'use strict';

  const canvas = document.getElementById('petals');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const COLORS = [
    'rgba(110, 200, 255, 0.52)',
    'rgba(143, 168, 255, 0.46)',
    'rgba(255, 158, 199, 0.5)',
    'rgba(255, 214, 232, 0.55)',
    'rgba(220, 236, 255, 0.6)',
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let petals = [];
  let raf = 0;
  let running = true;

  function makePetal(initialY) {
    const depth = Math.random();
    return {
      x: Math.random() * width,
      y: initialY === undefined ? -20 - Math.random() * height : initialY,
      size: 4 + depth * 7,
      speed: 0.25 + depth * 0.55,
      swayAmp: 14 + Math.random() * 30,
      swayFreq: 0.0006 + Math.random() * 0.0012,
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.008,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      alpha: 0.35 + depth * 0.45,
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(14, Math.min(34, Math.floor(width / 46)));
    petals = Array.from({ length: count }, () => makePetal(Math.random() * height));
  }

  function drawPetal(p) {
    const sway = Math.sin(p.phase + performance.now() * p.swayFreq) * p.swayAmp;
    ctx.save();
    ctx.translate(p.x + sway, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    const s = p.size;
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.78, -s * 0.55, s * 0.66, s * 0.55, 0, s);
    ctx.bezierCurveTo(-s * 0.66, s * 0.55, -s * 0.78, -s * 0.55, 0, -s);
    ctx.fill();
    ctx.restore();
  }

  function tick(now) {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);
    for (const p of petals) {
      p.y += p.speed;
      p.rot += p.spin;
      if (p.y > height + 24) {
        p.y = -24;
        p.x = Math.random() * width;
      }
      drawPetal(p);
    }
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (!running) {
      running = true;
      raf = requestAnimationFrame(tick);
    }
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    if (running) raf = requestAnimationFrame(tick);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  resize();
  raf = requestAnimationFrame(tick);
})();
