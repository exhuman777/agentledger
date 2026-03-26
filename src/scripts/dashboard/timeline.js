// Timeline visualization for LEDGER.md -- HTML

export function renderTimeline(container, entries) {
  if (!entries || entries.length === 0) {
    container.innerHTML = '<div class="viz-empty">No ledger entries parsed</div>';
    return;
  }

  let html = '<div class="timeline">';

  for (const entry of entries) {
    const statusClass = entry.status || 'pending';
    html += `<div class="timeline-entry ${statusClass}">`;

    // Header
    html += `<div class="timeline-entry-header">`;
    html += `<span class="timeline-step-name">${esc(entry.step)}</span>`;
    html += `<span class="timeline-status-badge ${statusClass}">${esc(entry.status)}</span>`;
    html += `</div>`;

    // Fields
    const fields = [
      ['agent', entry.agent],
      ['skill', entry.skill],
      ['input_hash', entry.input_hash],
      ['output_hash', entry.output_hash],
      ['started', entry.started],
      ['duration', entry.duration],
      ['gate', entry.gate]
    ];

    for (const [key, val] of fields) {
      if (!val) continue;
      const isHash = key.includes('hash');
      const display = isHash ? formatHash(val) : esc(val);
      html += `<div class="timeline-field">`;
      html += `<span class="timeline-field-key">${key}</span>`;
      html += `<span class="timeline-field-val">${isHash ? `<span class="hash" title="${esc(val)}">${display}</span>` : display}</span>`;
      html += `</div>`;
    }

    html += `</div>`;
  }

  html += '</div>';
  container.innerHTML = html;

  // Copy hash on click
  container.querySelectorAll('.hash').forEach(el => {
    el.addEventListener('click', () => {
      const full = el.getAttribute('title');
      navigator.clipboard.writeText(full).then(() => {
        const orig = el.textContent;
        el.textContent = 'copied';
        setTimeout(() => { el.textContent = orig; }, 800);
      });
    });
  });
}

function formatHash(val) {
  if (val.length > 20) {
    return esc(val.slice(0, 14) + '...' + val.slice(-4));
  }
  return esc(val);
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
