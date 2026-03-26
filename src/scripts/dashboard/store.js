// IndexedDB wrapper for Agent Ledger Dashboard
// Stores files as { path, content, type, created, modified }

const DB_NAME = 'agentledger';
const DB_VERSION = 1;
const STORE_NAME = 'files';

let db = null;

export async function initDB() {
  if (db) return db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORE_NAME)) {
        const store = d.createObjectStore(STORE_NAME, { keyPath: 'path' });
        store.createIndex('type', 'type', { unique: false });
      }
    };
    req.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

function tx(mode) {
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
}

function wrap(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getFile(path) {
  await initDB();
  return wrap(tx('readonly').get(path));
}

export async function getAllFiles() {
  await initDB();
  return wrap(tx('readonly').getAll());
}

export async function putFile(file) {
  await initDB();
  file.modified = Date.now();
  if (!file.created) file.created = Date.now();
  return wrap(tx('readwrite').put(file));
}

export async function deleteFile(path) {
  await initDB();
  return wrap(tx('readwrite').delete(path));
}

export async function seedIfEmpty(templates) {
  const files = await getAllFiles();
  if (files.length > 0) return;

  const { workflowTemplate, ledgerTemplate, trustTemplate } = templates;
  const now = Date.now();

  await putFile({
    path: 'WORKFLOW.md',
    content: workflowTemplate('code-review-and-deploy'),
    type: 'workflow',
    created: now,
    modified: now
  });

  await putFile({
    path: 'LEDGER.md',
    content: ledgerTemplate('code-review-and-deploy'),
    type: 'ledger',
    created: now,
    modified: now
  });

  await putFile({
    path: 'TRUST.md',
    content: trustTemplate('deploy-bot-trust'),
    type: 'trust',
    created: now,
    modified: now
  });
}

export async function exportAll() {
  const files = await getAllFiles();
  return JSON.stringify(files, null, 2);
}
