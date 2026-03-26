// Dashboard init -- boots store, wires panels, event bus

import { initDB, getAllFiles, getFile, putFile, deleteFile, seedIfEmpty, exportAll } from './store.js';
import { parseWorkflow, parseLedger, parseTrust } from './parser.js';
import { workflowTemplate, ledgerTemplate, trustTemplate } from './templates.js';
import { renderFileTree } from './file-tree.js';
import { renderEditor, setEditorStatus } from './editor.js';
import { renderPipeline, destroyPipeline } from './pipeline.js';
import { renderTimeline } from './timeline.js';
import { renderTrustMatrix } from './trust-matrix.js';

let state = {
  selectedPath: null,
  files: []
};

let els = {};

function detectType(path) {
  const upper = path.toUpperCase();
  if (upper.includes('WORKFLOW')) return 'workflow';
  if (upper.includes('LEDGER')) return 'ledger';
  if (upper.includes('TRUST')) return 'trust';
  return 'other';
}

async function refreshTree() {
  state.files = await getAllFiles();
  renderFileTree(els.tree, state.files, state.selectedPath, {
    onSelect: selectFile,
    onDelete: handleDelete,
    onNew: handleNew,
    onExport: handleExport
  });
}

async function selectFile(path) {
  state.selectedPath = path;
  const file = await getFile(path);
  if (!file) return;

  renderFileTree(els.tree, state.files, state.selectedPath, {
    onSelect: selectFile,
    onDelete: handleDelete,
    onNew: handleNew,
    onExport: handleExport
  });

  renderEditor(els.editor, file, {
    onChange: (content) => handleContentChange(path, content)
  });

  updateVisualization(file);
  updateStatusBar(file);
}

async function handleContentChange(path, content) {
  const file = await getFile(path);
  if (!file) return;

  file.content = content;
  await putFile(file);

  // Parse and update viz
  const valid = updateVisualization(file);
  setEditorStatus(els.editor, valid);
  updateStatusBar(file);
}

function updateVisualization(file) {
  destroyPipeline();
  const type = file.type || detectType(file.path);
  const vizContent = els.viz.querySelector('.viz-content');

  try {
    if (type === 'workflow') {
      els.viz.querySelector('.panel-header').textContent = '';
      els.viz.querySelector('.panel-header').innerHTML = '<span></span>PIPELINE';
      vizContent.innerHTML = '<canvas class="pipeline-canvas" id="pipeline-canvas"></canvas>';
      const { steps } = parseWorkflow(file.content);
      const canvas = vizContent.querySelector('#pipeline-canvas');
      // Set canvas size from parent
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.width = vizContent.offsetWidth;
      canvas.height = vizContent.offsetHeight;
      renderPipeline(canvas, steps);
      return true;
    }

    if (type === 'ledger') {
      els.viz.querySelector('.panel-header').textContent = '';
      els.viz.querySelector('.panel-header').innerHTML = '<span></span>TIMELINE';
      const { entries } = parseLedger(file.content);
      renderTimeline(vizContent, entries);
      return true;
    }

    if (type === 'trust') {
      els.viz.querySelector('.panel-header').textContent = '';
      els.viz.querySelector('.panel-header').innerHTML = '<span></span>TRUST MATRIX';
      const { permissions } = parseTrust(file.content);
      renderTrustMatrix(vizContent, permissions);
      return true;
    }

    vizContent.innerHTML = '<div class="viz-empty">No visualization for this file type</div>';
    return true;
  } catch (e) {
    vizContent.innerHTML = `<div class="viz-empty">Parse error: ${e.message}</div>`;
    return false;
  }
}

function updateStatusBar(file) {
  const type = file.type || detectType(file.path);
  const modified = file.modified ? new Date(file.modified).toLocaleString() : '--';

  els.statusPath.textContent = file.path;
  els.statusType.textContent = type.toUpperCase();
  els.statusType.className = 'status-type';
  els.statusModified.textContent = `Modified: ${modified}`;
}

async function handleDelete(path) {
  await deleteFile(path);
  if (state.selectedPath === path) {
    state.selectedPath = null;
    renderEditor(els.editor, null, {});
    destroyPipeline();
    const vizContent = els.viz.querySelector('.viz-content');
    vizContent.innerHTML = '<div class="viz-empty">Select a file</div>';
    els.statusPath.textContent = '--';
    els.statusType.textContent = '--';
    els.statusModified.textContent = '';
  }
  await refreshTree();
  // Auto-select first file if available
  if (!state.selectedPath && state.files.length > 0) {
    selectFile(state.files[0].path);
  }
}

async function handleNew(type) {
  const templates = { workflow: workflowTemplate, ledger: ledgerTemplate, trust: trustTemplate };
  const prefixes = { workflow: 'WORKFLOW', ledger: 'LEDGER', trust: 'TRUST' };
  const fn = templates[type];
  if (!fn) return;

  // Generate unique name
  const existing = state.files.map(f => f.path);
  let name = `${prefixes[type]}.md`;
  let i = 2;
  while (existing.includes(name)) {
    name = `${prefixes[type]}-${i}.md`;
    i++;
  }

  const now = Date.now();
  await putFile({
    path: name,
    content: fn(name.replace('.md', '').toLowerCase()),
    type,
    created: now,
    modified: now
  });

  await refreshTree();
  selectFile(name);
}

async function handleExport() {
  const json = await exportAll();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'agentledger-files.json';
  a.click();
  URL.revokeObjectURL(url);
}

export async function initDashboard() {
  // Grab DOM refs
  els.tree = document.getElementById('file-tree');
  els.editor = document.getElementById('editor-panel');
  els.viz = document.getElementById('viz-panel');
  els.statusPath = document.getElementById('status-path');
  els.statusType = document.getElementById('status-type');
  els.statusModified = document.getElementById('status-modified');

  // Boot store
  await initDB();
  await seedIfEmpty({ workflowTemplate, ledgerTemplate, trustTemplate });

  // Initial render
  await refreshTree();

  // Select first file
  if (state.files.length > 0) {
    selectFile(state.files[0].path);
  }
}
