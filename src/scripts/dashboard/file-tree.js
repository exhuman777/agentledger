// File tree panel -- left sidebar

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${mo}/${day}`;
}

function detectType(path) {
  const upper = path.toUpperCase();
  if (upper.includes('WORKFLOW')) return 'workflow';
  if (upper.includes('LEDGER')) return 'ledger';
  if (upper.includes('TRUST')) return 'trust';
  return 'other';
}

const GROUP_ORDER = ['workflow', 'ledger', 'trust', 'other'];
const GROUP_LABELS = { workflow: 'WORKFLOWS', ledger: 'LEDGERS', trust: 'TRUST', other: 'OTHER' };

export function renderFileTree(container, files, selectedPath, callbacks) {
  const { onSelect, onDelete, onNew } = callbacks;

  // Group files by type
  const groups = {};
  for (const type of GROUP_ORDER) groups[type] = [];
  for (const f of files) {
    const t = f.type || detectType(f.path);
    (groups[t] || groups.other).push(f);
  }

  let html = '';
  for (const type of GROUP_ORDER) {
    const items = groups[type];
    if (items.length === 0) continue;
    html += `<div class="file-group">`;
    html += `<div class="file-group-label">${GROUP_LABELS[type]}</div>`;
    for (const f of items) {
      const active = f.path === selectedPath ? ' active' : '';
      const badge = f.type || detectType(f.path);
      html += `<div class="file-item${active}" data-path="${f.path}">`;
      html += `<span class="file-badge ${badge}">${badge.slice(0, 3)}</span>`;
      html += `<span class="file-name">${f.path}</span>`;
      html += `<span class="file-date">${formatDate(f.modified)}</span>`;
      html += `<button class="file-delete" data-delete="${f.path}" title="Delete">x</button>`;
      html += `</div>`;
    }
    html += `</div>`;
  }

  // Actions bar
  html += `<div class="file-tree-actions">`;
  html += `<button id="btn-new-file">+ NEW</button>`;
  html += `<button id="btn-export">EXPORT</button>`;
  html += `</div>`;

  // Dropdown
  html += `<div class="new-file-dropdown" id="new-file-dropdown">`;
  html += `<button data-new="workflow">New Workflow</button>`;
  html += `<button data-new="ledger">New Ledger</button>`;
  html += `<button data-new="trust">New Trust</button>`;
  html += `</div>`;

  container.innerHTML = html;

  // Event delegation
  container.addEventListener('click', (e) => {
    const item = e.target.closest('.file-item');
    const delBtn = e.target.closest('.file-delete');
    const newBtn = e.target.closest('[data-new]');

    if (delBtn) {
      e.stopPropagation();
      const path = delBtn.dataset.delete;
      if (confirm(`Delete ${path}?`)) onDelete(path);
      return;
    }

    if (item) {
      onSelect(item.dataset.path);
      return;
    }

    if (newBtn) {
      const dropdown = container.querySelector('#new-file-dropdown');
      if (dropdown) dropdown.classList.remove('open');
      onNew(newBtn.dataset.new);
      return;
    }

    if (e.target.id === 'btn-new-file') {
      const dropdown = container.querySelector('#new-file-dropdown');
      if (dropdown) dropdown.classList.toggle('open');
      return;
    }

    if (e.target.id === 'btn-export') {
      callbacks.onExport && callbacks.onExport();
      return;
    }
  });
}
