import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { Cart } from '../js/cart.js';
import { PRODUCTS } from '../js/catalog.js';
import { formatWhatsAppOrder } from '../js/cart.js';

test('index.html contains all required sections and semantic elements', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.ok(html.includes('id="hero"'), 'Must have hero section');
  assert.ok(html.includes('id="origen"'), 'Must have origen section');
  assert.ok(html.includes('id="comparativa"'), 'Must have comparativa section');
  assert.ok(html.includes('id="tienda"'), 'Must have tienda section');
  assert.ok(html.includes('id="cart-drawer"'), 'Must have cart dialog');
  assert.ok(html.includes('<footer'), 'Must have footer element');
  assert.ok(html.includes('San Pedro Sochiapam'), 'Must reference origin municipality');
});

test('footer contains official brand elements, lema, trazabilidad and links', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.ok(html.includes('site-footer'), 'Must have site-footer class');
  assert.ok(
    html.includes('simbolo-color.svg') || html.includes('principal-color.svg') || html.includes('simbolo-cacao.svg'),
    'Must include official brand logo/symbol'
  );
  assert.ok(html.includes('Tu café de cada día'), 'Must include brand motto');
  assert.ok(html.includes('De Oaxaca a tu taza'), 'Must include supporting tagline');
  assert.ok(html.includes('San Pedro Sochiapam, Sierra de Oaxaca, México'), 'Must include complete traceability');
  assert.ok(html.includes('href="#hero"'), 'Must have link to #hero');
  assert.ok(html.includes('href="#origen"'), 'Must have link to #origen');
  assert.ok(html.includes('href="#comparativa"'), 'Must have link to #comparativa');
  assert.ok(html.includes('href="#tienda"'), 'Must have link to #tienda');
  assert.ok(html.includes('wa.me') || html.includes('WhatsApp'), 'Must have WhatsApp order information');
  assert.ok(html.includes('&copy;') || html.includes('©') || html.includes('Todos los derechos reservados'), 'Must have copyright');
});

test('accessibility requirements are met in index.html', () => {
  const html = fs.readFileSync('index.html', 'utf8');

  // Trigger button accessibility
  assert.ok(
    html.includes('id="cart-open-btn"') && html.includes('aria-controls="cart-drawer"'),
    '#cart-open-btn must have aria-controls="cart-drawer"'
  );
  assert.ok(
    html.includes('aria-haspopup="dialog"'),
    '#cart-open-btn must have aria-haspopup="dialog"'
  );

  // Dialog accessibility
  assert.ok(html.includes('id="cart-drawer"'), 'Must have #cart-drawer element');
  assert.ok(html.includes('aria-labelledby="drawer-title"'), 'Dialog must have aria-labelledby');
  assert.ok(html.includes('aria-describedby="drawer-desc"'), 'Dialog must have aria-describedby');

  // Verify all img tags have alt attribute
  const imgTags = html.match(/<img[^>]+>/g) || [];
  assert.ok(imgTags.length > 0, 'Should have img tags');
  imgTags.forEach(tag => {
    assert.ok(tag.includes('alt="'), `Image tag must have alt attribute: ${tag}`);
  });
});

test('all referenced local assets in index.html exist on disk', () => {
  const html = fs.readFileSync('index.html', 'utf8');

  // Check CSS links
  const cssMatches = [...html.matchAll(/href="([^"#]+\.css)"/g)].map(m => m[1]);
  assert.ok(cssMatches.length >= 3, 'Must reference css files');
  cssMatches.forEach(relPath => {
    assert.ok(fs.existsSync(relPath), `CSS file must exist: ${relPath}`);
  });

  // Check JS scripts
  const jsMatches = [...html.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]);
  assert.ok(jsMatches.length >= 1, 'Must reference js files');
  jsMatches.forEach(relPath => {
    assert.ok(fs.existsSync(relPath), `JS file must exist: ${relPath}`);
  });

  // Check images and svgs
  const imgMatches = [...html.matchAll(/src="([^"]+\.(?:svg|png|jpg|webp))"/g)].map(m => m[1]);
  assert.ok(imgMatches.length >= 3, 'Must reference image/svg files');
  imgMatches.forEach(relPath => {
    assert.ok(fs.existsSync(relPath), `Image asset must exist: ${relPath}`);
  });
});

test('e2e order calculation and WhatsApp message match expectations', () => {
  const mockStorage = { store: {}, getItem() { return null; }, setItem() {} };
  const cart = new Cart(mockStorage);

  // Add 2x 250g (Grano Entero) + 1x 500g (Molienda Media)
  cart.addItem(PRODUCTS[0], 'grano', 2); // 2 * $160 = $320
  cart.addItem(PRODUCTS[1], 'medio', 1); // 1 * $290 = $290

  assert.strictEqual(cart.getItemCount(), 3);
  assert.strictEqual(cart.getTotal(), 610);

  const customer = {
    name: 'Sofia Mendoza',
    city: 'Oaxaca de Juárez',
    notes: 'Favor de entregar por la mañana'
  };

  const { url, rawText } = formatWhatsAppOrder(cart, customer, '5219511234567');
  assert.ok(url.startsWith('https://wa.me/5219511234567?text='));
  assert.ok(rawText.includes('Sofia Mendoza'));
  assert.ok(rawText.includes('Oaxaca de Juárez'));
  assert.ok(rawText.includes('$610 MXN'));
  assert.ok(rawText.includes('Total estimado'));
  assert.ok(rawText.includes('250 g'));
  assert.ok(rawText.includes('500 g'));
});
