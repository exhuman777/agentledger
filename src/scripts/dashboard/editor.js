// Editor panel -- center textarea with auto-save

let saveTimer = null;

export function renderEditor(container, file, callbacks) {
  const { onChange } = callbacks;

  if (!file) {
    container.innerHTML = `
      <div class="panel-header">EDITOR</div>
      <div class="editor-empty">Select a file from the tree</div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="panel-header">EDITOR</div>
    <div class="editor-toolbar">
      <span class="editor-filename">${file.path}</span>
      <span class="editor-status" id="editor-status"></span>
      <span class="editor-status-label" id="editor-status-label">VALID</span>
    </div>
    <textarea class="editor-textarea" id="editor-textarea" spellcheck="false">${escapeHtml(file.content)}</textarea>
  `;

  const textarea = container.querySelector('#editor-textarea');
  textarea.addEventListener('input', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      onChange(textarea.value);
    }, 500);
  });

  // Tab key inserts spaces
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 2;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => onChange(textarea.value), 500);
    }
  });
}

export function setEditorStatus(container, valid) {
  const dot = container.querySelector('#editor-status');
  const label = container.querySelector('#editor-status-label');
  if (dot) dot.className = 'editor-status' + (valid ? '' : ' error');
  if (label) label.textContent = valid ? 'VALID' : 'PARSE ERROR';
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
