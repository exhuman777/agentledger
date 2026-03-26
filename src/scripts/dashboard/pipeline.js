// Pipeline visualization for WORKFLOW.md -- Canvas 2D

const NODE_W = 160;
const NODE_H = 60;
const GAP_X = 60;
const GAP_Y = 30;
const PAD = 40;

// Animated particles
let particles = [];
let animFrame = null;

export function renderPipeline(canvas, steps) {
  if (animFrame) cancelAnimationFrame(animFrame);
  particles = [];

  if (!steps || steps.length === 0) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(224,224,224,0.3)';
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('No steps parsed', canvas.width / 2, canvas.height / 2);
    return;
  }

  // Build layout: find parallel groups
  const layout = buildLayout(steps);
  const totalW = layout.maxCol * (NODE_W + GAP_X) + PAD * 2;
  const totalH = layout.maxRow * (NODE_H + GAP_Y) + PAD * 2;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(canvas.offsetWidth, totalW) * dpr;
  canvas.height = Math.max(canvas.offsetHeight, totalH) * dpr;
  canvas.style.width = Math.max(canvas.offsetWidth, totalW) + 'px';
  canvas.style.height = Math.max(canvas.offsetHeight, totalH) + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // Build connection list for particles
  const connections = [];
  for (const node of layout.nodes) {
    if (node.prevNodes) {
      for (const prev of node.prevNodes) {
        connections.push({ from: prev, to: node });
      }
    }
  }

  // Init particles on connections
  for (const conn of connections) {
    particles.push({
      conn,
      t: Math.random(),
      speed: 0.003 + Math.random() * 0.003
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Draw connections
    for (const conn of connections) {
      const fx = conn.from.x + NODE_W;
      const fy = conn.from.y + NODE_H / 2;
      const tx = conn.to.x;
      const ty = conn.to.y + NODE_H / 2;

      ctx.strokeStyle = 'rgba(51, 255, 119, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      // Bezier curve
      const midX = (fx + tx) / 2;
      ctx.bezierCurveTo(midX, fy, midX, ty, tx, ty);
      ctx.stroke();
    }

    // Draw rollback connections (dashed)
    for (const node of layout.nodes) {
      if (node.step.rollback) {
        ctx.strokeStyle = 'rgba(255, 68, 68, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(node.x + NODE_W / 2, node.y + NODE_H);
        ctx.lineTo(node.x + NODE_W / 2, node.y + NODE_H + 16);
        ctx.stroke();
        ctx.setLineDash([]);

        // Rollback label
        ctx.fillStyle = 'rgba(255, 68, 68, 0.5)';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.step.rollback, node.x + NODE_W / 2, node.y + NODE_H + 26);
      }
    }

    // Draw nodes
    for (const node of layout.nodes) {
      drawNode(ctx, node);
    }

    // Animate particles
    for (const p of particles) {
      p.t += p.speed;
      if (p.t > 1) p.t -= 1;

      const fx = p.conn.from.x + NODE_W;
      const fy = p.conn.from.y + NODE_H / 2;
      const tx = p.conn.to.x;
      const ty = p.conn.to.y + NODE_H / 2;
      const midX = (fx + tx) / 2;

      // Cubic bezier point
      const t = p.t;
      const mt = 1 - t;
      const px = mt*mt*mt*fx + 3*mt*mt*t*midX + 3*mt*t*t*midX + t*t*t*tx;
      const py = mt*mt*mt*fy + 3*mt*mt*t*fy + 3*mt*t*t*ty + t*t*t*ty;

      ctx.fillStyle = '#33ff77';
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    animFrame = requestAnimationFrame(draw);
  }

  draw();
}

function drawNode(ctx, node) {
  const { x, y, step } = node;

  // Background
  ctx.fillStyle = 'rgba(0, 20, 5, 0.6)';
  ctx.fillRect(x, y, NODE_W, NODE_H);

  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, NODE_W, NODE_H);

  // Corner accents
  const cs = 6;
  ctx.strokeStyle = '#33ff77';
  ctx.lineWidth = 1;
  // TL
  ctx.beginPath(); ctx.moveTo(x, y + cs); ctx.lineTo(x, y); ctx.lineTo(x + cs, y); ctx.stroke();
  // TR
  ctx.beginPath(); ctx.moveTo(x + NODE_W - cs, y); ctx.lineTo(x + NODE_W, y); ctx.lineTo(x + NODE_W, y + cs); ctx.stroke();

  // Step name
  ctx.fillStyle = '#e0e0e0';
  ctx.font = 'bold 11px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(step.name, x + 10, y + 18);

  // Skill badge
  if (step.skill) {
    ctx.fillStyle = 'rgba(224, 224, 224, 0.4)';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText(step.skill, x + 10, y + 32);
  }

  // Agent
  if (step.agent) {
    ctx.fillStyle = 'rgba(224, 224, 224, 0.3)';
    ctx.font = '8px JetBrains Mono, monospace';
    ctx.fillText(step.agent, x + 10, y + 44);
  }

  // Gate badge
  if (step.gate) {
    const gateColor = step.gate === 'auto-pass' ? '#33ff77' :
                      step.gate.includes('human') ? '#ffb347' : '#e0e0e0';
    const gw = 6;
    ctx.fillStyle = gateColor;
    ctx.fillRect(x + NODE_W - 16, y + 8, gw, gw);
  }
}

function buildLayout(steps) {
  // Detect parallel groups
  const parallelSets = [];
  const assigned = new Set();

  for (const s of steps) {
    if (s.parallel && s.parallel.length > 0 && !assigned.has(s.name)) {
      const group = [s.name, ...s.parallel];
      const unique = [...new Set(group)].filter(n => steps.find(st => st.name === n));
      for (const n of unique) assigned.add(n);
      parallelSets.push(unique);
    }
  }

  // Arrange: parallel steps share a column, sequential steps get separate columns
  const nodes = [];
  let col = 0;

  const stepMap = {};
  for (const s of steps) stepMap[s.name] = s;

  const placed = new Set();
  let prevColNodes = [];

  for (const step of steps) {
    if (placed.has(step.name)) continue;

    // Check if this step is part of a parallel group
    const pGroup = parallelSets.find(g => g.includes(step.name));
    if (pGroup) {
      const colNodes = [];
      pGroup.forEach((name, row) => {
        if (placed.has(name)) return;
        const s = stepMap[name];
        if (!s) return;
        placed.add(name);
        const node = {
          x: PAD + col * (NODE_W + GAP_X),
          y: PAD + row * (NODE_H + GAP_Y),
          step: s,
          prevNodes: prevColNodes.length > 0 ? [...prevColNodes] : undefined
        };
        // Only first in parallel group gets prev connections
        if (row > 0) node.prevNodes = undefined;
        nodes.push(node);
        colNodes.push(node);
      });
      // All parallel nodes connect from previous column
      for (const n of colNodes) {
        if (!n.prevNodes && prevColNodes.length > 0) {
          n.prevNodes = [...prevColNodes];
        }
      }
      prevColNodes = colNodes;
      col++;
    } else {
      placed.add(step.name);
      const node = {
        x: PAD + col * (NODE_W + GAP_X),
        y: PAD,
        step,
        prevNodes: prevColNodes.length > 0 ? [...prevColNodes] : undefined
      };
      nodes.push(node);
      prevColNodes = [node];
      col++;
    }
  }

  const maxCol = col;
  const maxRow = Math.max(...nodes.map(n => Math.floor((n.y - PAD) / (NODE_H + GAP_Y)) + 1), 1);

  return { nodes, maxCol, maxRow };
}

export function destroyPipeline() {
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
  particles = [];
}
