// Markdown/YAML parser for Agent Ledger spec files
// No external deps -- simple key:value parsing for spec format

export function parseFrontmatter(content) {
  const lines = content.split('\n');
  if (lines[0].trim() !== '---') return { meta: {}, body: content };

  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') { endIdx = i; break; }
  }
  if (endIdx === -1) return { meta: {}, body: content };

  const meta = {};
  for (let i = 1; i < endIdx; i++) {
    const line = lines[i];
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    // Strip quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    meta[key] = val;
  }

  const body = lines.slice(endIdx + 1).join('\n').trim();
  return { meta, body };
}

export function parseWorkflow(content) {
  const { meta, body } = parseFrontmatter(content);
  const steps = [];
  const lines = body.split('\n');
  let current = null;

  for (const line of lines) {
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      if (current) steps.push(current);
      current = { name: h3[1].trim(), skill: '', agent: '', gate: 'auto-pass' };
      continue;
    }
    if (!current) continue;

    const prop = line.match(/^-\s+(\w+):\s*(.+)/);
    if (prop) {
      const [, key, val] = prop;
      if (key === 'parallel') {
        // Parse [a, b] or [a,b]
        const inner = val.replace(/[\[\]]/g, '').trim();
        current.parallel = inner ? inner.split(',').map(s => s.trim()) : [];
      } else {
        current[key] = val.trim();
      }
    }
  }
  if (current) steps.push(current);

  return { meta, steps };
}

export function parseLedger(content) {
  const { meta, body } = parseFrontmatter(content);
  const entries = [];
  const lines = body.split('\n');
  let current = null;

  for (const line of lines) {
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      if (current) entries.push(current);
      const raw = h3[1].trim();
      // Parse "step-name (status)"
      const statusMatch = raw.match(/^(.+?)\s*\((\w[\w-]*)\)\s*$/);
      current = {
        step: statusMatch ? statusMatch[1].trim() : raw,
        status: statusMatch ? statusMatch[2] : 'pending'
      };
      continue;
    }
    if (!current) continue;

    const prop = line.match(/^-\s+([\w_]+):\s*(.+)/);
    if (prop) {
      const [, key, val] = prop;
      current[key] = val.trim();
    }
  }
  if (current) entries.push(current);

  return { meta, entries };
}

export function parseTrust(content) {
  const { meta, body } = parseFrontmatter(content);
  const permissions = [];
  const lines = body.split('\n');
  let currentAgent = '';
  let currentSection = ''; // requires, gates, denied

  for (const line of lines) {
    // Agent header: ## Agent: org/name
    const agentMatch = line.match(/^##\s+Agent:\s*(.+)/);
    if (agentMatch) {
      currentAgent = agentMatch[1].trim();
      continue;
    }

    // Section header: ### Requires / Gates / Denied
    const sectionMatch = line.match(/^###\s+(Requires|Gates|Denied)/i);
    if (sectionMatch) {
      currentSection = sectionMatch[1].toLowerCase();
      continue;
    }

    // Permission line: - capability: action (scope: ...)
    const permMatch = line.match(/^-\s+(.+)/);
    if (permMatch && currentAgent) {
      const raw = permMatch[1].trim();
      const colonIdx = raw.indexOf(':');
      if (colonIdx === -1) continue;

      const capability = raw.slice(0, colonIdx).trim();
      let rest = raw.slice(colonIdx + 1).trim();

      // Extract scope if present
      let scope = '';
      const scopeMatch = rest.match(/\((.+?)\)/);
      if (scopeMatch) {
        scope = scopeMatch[1].trim();
        rest = rest.replace(/\(.+?\)/, '').trim();
      }

      permissions.push({
        agent: currentAgent,
        capability,
        action: rest,
        scope,
        granted: currentSection !== 'denied',
        section: currentSection
      });
    }
  }

  return { meta, permissions };
}
