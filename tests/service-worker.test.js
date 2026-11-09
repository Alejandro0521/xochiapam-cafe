import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { registerServiceWorker } from '../js/app.js';

const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

test('sw.js exists, defines versioned cache, and contains zero emojis', () => {
  assert.ok(fs.existsSync('sw.js'), 'sw.js file must exist in root');
  const content = fs.readFileSync('sw.js', 'utf8');

  assert.strictEqual(EMOJI_REGEX.test(content), false, 'sw.js must contain ZERO emojis');
  assert.ok(content.includes('CACHE_NAME'), 'sw.js must define CACHE_NAME');
  assert.ok(content.includes('xochiapam-v1'), 'sw.js must use xochiapam-v1 cache name');
  assert.ok(content.includes('install'), 'sw.js must have install event listener');
  assert.ok(content.includes('activate'), 'sw.js must have activate event listener');
  assert.ok(content.includes('fetch'), 'sw.js must have fetch event listener');
});

test('ALL precached assets listed in sw.js exist on disk', () => {
  const content = fs.readFileSync('sw.js', 'utf8');
  const precacheMatch = content.match(/const PRECACHE_ASSETS = \[([\s\S]*?)\];/);
  assert.ok(precacheMatch, 'PRECACHE_ASSETS array must be defined in sw.js');

  const assets = eval(`[${precacheMatch[1]}]`);
  assert.ok(Array.isArray(assets) && assets.length > 5, 'Must have at least 6 precached assets');

  assets.forEach((assetPath) => {
    if (assetPath === './') return; // root URL
    const cleanPath = assetPath.replace(/^\.\//, '');
    assert.ok(fs.existsSync(cleanPath), `Precached asset ${cleanPath} must exist on disk`);
  });
});

test('index.html contains #offline-status-banner with accessible attributes', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.ok(html.includes('id="offline-status-banner"'), 'index.html must have #offline-status-banner');
  assert.ok(html.includes('role="status"'), 'Banner must have role="status"');
  assert.ok(html.includes('aria-live="polite"'), 'Banner must have aria-live="polite"');
  assert.ok(html.includes('id="offline-banner-text"'), 'Banner must have text container');
});

test('registerServiceWorker attaches connectivity listeners and updates mock banner', () => {
  const listeners = {};
  const mockBanner = {
    classList: {
      classes: new Set(),
      add(...args) { args.forEach(c => this.classes.add(c)); },
      remove(...args) { args.forEach(c => this.classes.delete(c)); },
      contains(c) { return this.classes.has(c); }
    },
    hidden: true
  };
  const mockText = { textContent: '' };

  const mockWindow = {
    navigator: {
      onLine: true,
      serviceWorker: {
        register: () => Promise.resolve()
      }
    },
    location: { protocol: 'https:' },
    document: {
      querySelector: (sel) => {
        if (sel === '#offline-status-banner') return mockBanner;
        if (sel === '#offline-banner-text') return mockText;
        return null;
      }
    },
    addEventListener: (event, fn) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
    }
  };

  registerServiceWorker(mockWindow);

  assert.ok(listeners['load'], 'Must register load listener for SW registration');
  assert.ok(listeners['offline'], 'Must register offline event listener');
  assert.ok(listeners['online'], 'Must register online event listener');

  // Trigger offline
  listeners['offline'].forEach(fn => fn());
  assert.strictEqual(mockBanner.hidden, false, 'Banner must be visible when offline');
  assert.strictEqual(mockBanner.classList.contains('is-offline'), true);
  assert.ok(mockText.textContent.includes('Modo sin conexión'), 'Banner must inform offline status');
  assert.strictEqual(EMOJI_REGEX.test(mockText.textContent), false, 'Banner text must contain ZERO emojis');

  // Trigger online
  listeners['online'].forEach(fn => fn());
  assert.strictEqual(mockBanner.classList.contains('is-online'), true);
  assert.strictEqual(mockText.textContent, 'Conexión restablecida.');
});

