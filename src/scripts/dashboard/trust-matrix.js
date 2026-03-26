// Trust matrix visualization for TRUST.md -- HTML

export function renderTrustMatrix(container, permissions) {
  if (!permissions || permissions.length === 0) {
    container.innerHTML = '<div class="viz-empty">No trust permissions parsed</div>';
    return;
  }

  // Group by agent, then by section
  const agents = {};
  for (const p of permissions) {
    if (!agents[p.agent]) agents[p.agent] = { requires: [], gates: [], denied: [] };
    const section = p.section || (p.granted ? 'requires' : 'denied');
    agents[p.agent][section].push(p);
  }

  let html = '';

  for (const [agent, sections] of Object.entries(agents)) {
    html += `<div class="trust-section-header">${esc(agent)}</div>`;

    if (sections.requires.length > 0) {
      html += renderSection('Requires', sections.requires, 'allow');
    }
    if (sections.gates.length > 0) {
      html += renderSection('Gates', sections.gates, 'gate');
    }
    if (sections.denied.length > 0) {
      html += renderSection('Denied', sections.denied, 'deny');
    }
  }

  container.innerHTML = html;
}

function renderSection(title, perms, badgeType) {
  let html = `<div style="margin-bottom:12px;">`;
  html += `<div style="font-size:9px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(224,224,224,0.4);margin-bottom:6px;">${title}</div>`;

  for (const p of perms) {
    html += `<div class="trust-row">`;
    html += `<span class="trust-cap">${esc(p.capability)}</span>`;
    html += `<span class="trust-action">${esc(p.action)}`;
    if (p.scope) {
      html += `<span class="trust-scope">${esc(p.scope)}</span>`;
    }
    html += `</span>`;
    html += `<span class="trust-badge ${badgeType}">${badgeType}</span>`;
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
