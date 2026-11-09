import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { initLegalDialog } from '../js/app.js';

const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

test('manifest.json exists, parses cleanly, links existing assets, and contains zero emojis', () => {
  assert.ok(fs.existsSync('manifest.json'), 'manifest.json must exist');
  const raw = fs.readFileSync('manifest.json', 'utf8');

  assert.strictEqual(EMOJI_REGEX.test(raw), false, 'manifest.json must contain zero emojis');

  const manifest = JSON.parse(raw);
  assert.strictEqual(manifest.name, 'Xochiapam Café');
  assert.strictEqual(manifest.short_name, 'Xochiapam');
  assert.strictEqual(manifest.theme_color, '#4A2113');
  assert.strictEqual(manifest.background_color, '#FFFAF3');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);

  manifest.icons.forEach(icon => {
    assert.ok(fs.existsSync(icon.src), `Manifest icon ${icon.src} must exist on disk`);
  });
});

test('index.html contains canonical, manifest link, Open Graph, and Twitter Card metadata', () => {
  const html = fs.readFileSync('index.html', 'utf8');

  // Canonical and manifest
  assert.ok(html.includes('<link rel="canonical" href="https://xochiapam.mx/">'), 'Must have canonical link');
  assert.ok(html.includes('<link rel="manifest" href="manifest.json">'), 'Must link manifest.json');

  // Open Graph
  assert.ok(html.includes('property="og:title"'), 'Must have og:title');
  assert.ok(html.includes('property="og:description"'), 'Must have og:description');
  assert.ok(html.includes('property="og:image"'), 'Must have og:image');
  assert.ok(html.includes('property="og:url"'), 'Must have og:url');
  assert.ok(html.includes('property="og:type"'), 'Must have og:type');

  // Twitter Card
  assert.ok(html.includes('name="twitter:card"'), 'Must have twitter:card');
  assert.ok(html.includes('name="twitter:title"'), 'Must have twitter:title');
  assert.ok(html.includes('name="twitter:image"'), 'Must have twitter:image');
});

test('index.html contains valid Schema.org JSON-LD with Organization and Product data', () => {
  const html = fs.readFileSync('index.html', 'utf8');

  const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(schemaMatch, 'index.html must have Schema.org script tag');

  const schema = JSON.parse(schemaMatch[1]);
  assert.strictEqual(schema['@context'], 'https://schema.org');
  assert.ok(Array.isArray(schema['@graph']), 'Schema must use @graph array');

  const org = schema['@graph'].find(item => item['@type'] === 'Organization');
  assert.ok(org, 'Schema must define Organization');
  assert.strictEqual(org.name, 'Xochiapam Café');
  assert.strictEqual(org.address.addressLocality, 'San Pedro Sochiapam');
  assert.strictEqual(org.address.addressRegion, 'Oaxaca');

  const prod250 = schema['@graph'].find(item => item['@id'] && item['@id'].includes('250g'));
  assert.ok(prod250, 'Schema must define 250g product');
  assert.strictEqual(prod250.offers.price, '160.00');

  const prod500 = schema['@graph'].find(item => item['@id'] && item['@id'].includes('500g'));
  assert.ok(prod500, 'Schema must define 500g product');
  assert.strictEqual(prod500.offers.price, '290.00');
});

test('index.html contains accessible legal dialog (<dialog id="legal-dialog">) with LFPDPPP and shipping policy', () => {
  const html = fs.readFileSync('index.html', 'utf8');

  assert.ok(html.includes('<dialog'), 'Must contain <dialog>');
  assert.ok(html.includes('id="legal-dialog"'), 'Must have id="legal-dialog"');

  // Tabs and tabpanels
  assert.ok(html.includes('id="tab-btn-privacidad"'), 'Must have privacy tab button');
  assert.ok(html.includes('id="tab-btn-envios"'), 'Must have shipping tab button');
  assert.ok(html.includes('id="tab-panel-privacidad"'), 'Must have privacy panel');
  assert.ok(html.includes('id="tab-panel-envios"'), 'Must have shipping panel');

  // LFPDPPP content
  assert.ok(html.includes('LFPDPPP'), 'Must reference LFPDPPP law');
  assert.ok(html.includes('ARCO'), 'Must explain ARCO rights');
  assert.ok(html.includes('San Pedro Sochiapam'), 'Must reference domicile');

  // Shipping policy content
  assert.ok(html.includes('24 a 48 horas'), 'Must state dispatch times');
  assert.ok(html.includes('reposición sin costo adicional'), 'Must offer freshness guarantee');

  // Footer trigger buttons
  assert.ok(html.includes('data-legal-tab="privacidad"'), 'Footer must have privacy trigger');
  assert.ok(html.includes('data-legal-tab="envios"'), 'Footer must have shipping trigger');
});

test('404.html page exists, has brand links, is accessible, and contains zero emojis', () => {
  assert.ok(fs.existsSync('404.html'), '404.html must exist');
  const html = fs.readFileSync('404.html', 'utf8');

  assert.strictEqual(EMOJI_REGEX.test(html), false, '404.html must contain ZERO emojis');
  assert.ok(html.includes('404'), 'Must mention 404');
  assert.ok(html.includes('San Pedro Sochiapam'), 'Must mention brand origin');
  assert.ok(html.includes('index.html'), 'Must link back to home');
  assert.ok(html.includes('tokens.css'), 'Must link tokens.css');
  assert.ok(html.includes('layout.css'), 'Must link layout.css');
  assert.ok(html.includes('components.css'), 'Must link components.css');
});

test('initLegalDialog switches tabs and manages open/close lifecycle cleanly in mock DOM', () => {
  // Mock DOM container
  const listeners = {};
  const createMockElement = (id, dataset = {}, attrs = {}) => ({
    id,
    dataset: { ...dataset },
    classList: {
      classes: new Set(),
      add(cls) { this.classes.add(cls); },
      remove(cls) { this.classes.delete(cls); },
      toggle(cls, force) {
        if (force === undefined) {
          if (this.classes.has(cls)) { this.classes.delete(cls); return false; }
          this.classes.add(cls); return true;
        }
        if (force) { this.classes.add(cls); } else { this.classes.delete(cls); }
        return force;
      },
      contains(cls) { return this.classes.has(cls); }
    },
    hidden: false,
    open: false,
    attributes: { ...attrs },
    setAttribute(name, val) { this.attributes[name] = val; },
    removeAttribute(name) { delete this.attributes[name]; },
    getAttribute(name) { return this.attributes[name]; },
    showModal() { this.open = true; },
    close() { this.open = false; },
    addEventListener(event, fn) {
      if (!listeners[id]) listeners[id] = {};
      if (!listeners[id][event]) listeners[id][event] = [];
      listeners[id][event].push(fn);
    },
    dispatch(event, e = {}) {
      if (listeners[id] && listeners[id][event]) {
        listeners[id][event].forEach(fn => fn(e));
      }
    }
  });

  const dialog = createMockElement('legal-dialog');
  const closeBtn = createMockElement('legal-close-btn');
  const footerCloseBtn = createMockElement('legal-close-btn-footer');
  const tabPriv = createMockElement('tab-btn-privacidad', { tab: 'privacidad' });
  const tabEnv = createMockElement('tab-btn-envios', { tab: 'envios' });
  const panelPriv = createMockElement('tab-panel-privacidad', { tabPanel: 'privacidad' });
  const panelEnv = createMockElement('tab-panel-envios', { tabPanel: 'envios' });
  const triggerPriv = createMockElement('trigger-priv', { legalTab: 'privacidad' });
  const triggerEnv = createMockElement('trigger-env', { legalTab: 'envios' });

  dialog.querySelector = (sel) => {
    if (sel === '#legal-close-btn') return closeBtn;
    if (sel === '#legal-close-btn-footer') return footerCloseBtn;
    return null;
  };
  dialog.querySelectorAll = (sel) => {
    if (sel === '.legal-tab-btn') return [tabPriv, tabEnv];
    if (sel === '.legal-tab-panel') return [panelPriv, panelEnv];
    return [];
  };

  const mockContainer = {
    querySelector: (sel) => (sel === '#legal-dialog' ? dialog : null),
    querySelectorAll: (sel) => (sel === '[data-legal-tab]' ? [triggerPriv, triggerEnv] : [])
  };

  const legal = initLegalDialog(mockContainer);
  assert.ok(legal, 'initLegalDialog must return controller');

  // Trigger click on envios trigger
  triggerEnv.dispatch('click');
  assert.strictEqual(dialog.open, true, 'Dialog must be open');
  assert.strictEqual(dialog.classList.contains('is-open'), true, 'Dialog must have is-open');
  assert.strictEqual(tabEnv.classList.contains('is-active'), true, 'Envios tab must be active');
  assert.strictEqual(panelEnv.hidden, false, 'Envios panel must be visible');
  assert.strictEqual(panelPriv.hidden, true, 'Privacidad panel must be hidden');

  // Trigger switchTab to privacidad
  tabPriv.dispatch('click');
  assert.strictEqual(tabPriv.classList.contains('is-active'), true, 'Privacidad tab must be active');
  assert.strictEqual(panelPriv.hidden, false, 'Privacidad panel must be visible');
  assert.strictEqual(panelEnv.hidden, true, 'Envios panel must be hidden');

  // Close via button
  closeBtn.dispatch('click');
  assert.strictEqual(dialog.open, false, 'Dialog must close on closeBtn click');
  assert.strictEqual(dialog.classList.contains('is-open'), false);
});

test('ALL codebase files contain ZERO emojis (strict brand constraint)', () => {
  const filesToCheck = [
    'index.html',
    '404.html',
    'manifest.json',
    'js/app.js',
    'js/bundle.js',
    'js/catalog.js',
    'js/cart.js',
    'js/drawer.js',
    'js/comparison.js',
    'css/tokens.css',
    'css/layout.css',
    'css/components.css'
  ];

  filesToCheck.forEach(file => {
    assert.ok(fs.existsSync(file), `File ${file} must exist`);
    const content = fs.readFileSync(file, 'utf8');
    assert.strictEqual(EMOJI_REGEX.test(content), false, `File ${file} must contain ZERO emojis`);
  });
});

