export function initOscilloscope() {
  const canvas = document.getElementById('oscilloscope');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, time = 0;

  function resize() {
    const parent = canvas.parentElement;
    width = parent.clientWidth;
    height = parent.clientHeight;
    canvas.width = width;
    canvas.height = height;
  }

  window.addEventListener('resize', resize);
  resize();

  const inputs = [
    { speed: 0.02, amp: 40, offset: 0 },
    { speed: 0.03, amp: 30, offset: 100 },
    { speed: 0.015, amp: 50, offset: 200 },
    { speed: 0.04, amp: 20, offset: 50 },
    { speed: 0.025, amp: 35, offset: 150 },
  ];

  let pulses = [];

  // Animated readout values
  const trustEl = document.getElementById('val-trust');
  const stepsEl = document.getElementById('val-steps');
  let stepCount = 42;
  let stepTimer = 0;

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const cy = height / 2;
    const cx = width / 2;
    time += 1;

    // Input signals (left side, noisy, dim white)
    inputs.forEach((inp, i) => {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + Math.sin(time * 0.05 + i) * 0.08})`;
      for (let x = 0; x < cx; x += 3) {
        const progress = x / cx;
        const merge = 1 - Math.pow(progress, 3);
        const wave = Math.sin(x * inp.speed + time * inp.speed + inp.offset) * inp.amp;
        const noise = (Math.random() - 0.5) * 20 * merge;
        const y = cy + (wave + noise) * merge + (i - 2) * 32 * merge;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Clean output signal (right side, green)
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#33ff77';
    ctx.shadowColor = '#33ff77';
    ctx.shadowBlur = 4;
    ctx.moveTo(cx, cy);
    ctx.lineTo(width, cy);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Pulse events on output line
    if (Math.random() < 0.008) {
      pulses.push({ x: cx });
    }
    pulses = pulses.filter(p => {
      p.x += 5;
      if (p.x > width) return false;
      ctx.beginPath();
      ctx.strokeStyle = '#33ff77';
      ctx.shadowColor = '#33ff77';
      ctx.shadowBlur = 6;
      ctx.lineWidth = 2;
      const pw = 28;
      let started = false;
      for (let px = p.x - pw; px < p.x + pw; px += 2) {
        if (px < cx || px > width) continue;
        const d = (px - p.x) / (pw / 3);
        const yo = -28 * Math.exp(-(d * d));
        if (!started) { ctx.moveTo(px, cy + yo); started = true; }
        else ctx.lineTo(px, cy + yo);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      return true;
    });

    // Convergence node dot
    ctx.beginPath();
    ctx.strokeStyle = '#33ff77';
    ctx.shadowColor = '#33ff77';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.5;
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Schematic center line
    ctx.beginPath();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Concentric circles (schematic)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    [70, 140].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Update step counter readout periodically
    stepTimer++;
    if (stepTimer > 120 && Math.random() < 0.03) {
      stepCount++;
      stepTimer = 0;
      if (stepsEl) stepsEl.textContent = stepCount.toString().padStart(4, '0');
    }

    requestAnimationFrame(draw);
  }

  // Animate trust score with tiny fluctuations
  setInterval(() => {
    if (trustEl) {
      const base = 0.97;
      const jitter = (Math.random() - 0.5) * 0.01;
      trustEl.textContent = (base + jitter).toFixed(2);
    }
  }, 3000);

  draw();
}
