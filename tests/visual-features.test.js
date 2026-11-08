import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('index.html contains the 4 visual design identity upgrades with zero emojis', () => {
  const html = fs.readFileSync('index.html', 'utf8');

  // 1. Marquee ribbon
  assert.ok(html.includes('class="marquee-ribbon"'), 'Must have .marquee-ribbon');
  assert.ok(html.includes('class="marquee-track"'), 'Must have .marquee-track');
  assert.ok(html.includes('San Pedro Sochiapam'), 'Marquee must reference origin');

  // 2. Botanical coffee branch SVG graphic
  assert.ok(html.includes('class="botanical-branch-svg"'), 'Must have botanical branch SVG');
  assert.ok(html.includes('class="passport-botanical-graphic"'), 'Must have botanical graphic wrapper');

  // 3. Geographic coordinates and elevation passport strip
  assert.ok(html.includes('class="origin-passport-bar"'), 'Must have .origin-passport-bar');
  assert.ok(html.includes('17°43′N'), 'Must have GPS latitude coordinate');
  assert.ok(html.includes('96°52′O'), 'Must have GPS longitude coordinate');
  assert.ok(html.includes('1,400 a 1,800 msnm'), 'Must have Sierra elevation');

  // 4. Optical focal reticle on macro grind photo
  assert.ok(html.includes('class="grind-optical-reticle"'), 'Must have .grind-optical-reticle');
  assert.ok(html.includes('class="reticle-lens"'), 'Must have .reticle-lens');

  // 5. Zero emojis check
  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  assert.strictEqual(emojiRegex.test(html), false, 'index.html must contain ZERO emojis');
});
