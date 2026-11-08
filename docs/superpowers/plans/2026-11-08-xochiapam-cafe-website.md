# Xochiapam Casa Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el sitio web completo de Xochiapam Casa (landing page editorial, historia y orígenes de San Pedro Sochiapam, guía interactiva de comparación de café y boutique con pedido vía WhatsApp y drawer nativo accesible), implementando estrictamente su manual de marca.

**Architecture:** Sitio web en HTML5 semántico, CSS3 moderno con variables de diseño (tokens) y JavaScript modular vanilla (cero dependencias externas). Emplea fuentes locales (`Fredoka` y `Nunito`), transiciones en curva orgánica SVG y la API nativa de `<dialog>` con *light dismiss* para la bolsa de pedidos.

**Tech Stack:** HTML5 semántico, CSS3 (CSS Grid, Flexbox, Fluid Typography, @font-face, CSS Transitions), Vanilla JS (ES Modules), Node.js test runner (`node:test`, `node:assert`).

**Spec:** [`docs/superpowers/specs/2026-11-08-xochiapam-cafe-design.md`](file:///Users/alejandrobasilio/Desktop/xochiapam%20cafe%20/docs/superpowers/specs/2026-11-08-xochiapam-cafe-design.md)

## Global Constraints
- Colores oficiales: Marfil `#FFFAF3`, Cacao `#4A2113`, Terracota `#B54325`, Crema `#F3E3CA`.
- Tipografías: `Fredoka Semibold` para titulares (`h1`-`h4`); `Nunito Regular` y `Nunito Bold` para textos y datos.
- Divisores de sección: Ondas orgánicas vectoriales SVG extraídas de la identidad de `xochiapam-casa`.
- Cero CDNs o dependencias externas; todas las fuentes, logos e imágenes se sirven localmente en `assets/`.
- Accesibilidad WCAG AAA en texto principal (ratio > 7:1) y AA en acentos.

---

### Task 1: Estructura de Proyecto y Migración de Assets

**Files:**
- Create: `assets/fonts/` (copia de fuentes)
- Create: `assets/logos/` (copia de logotipos SVG)
- Create: `assets/images/` (copia de etiquetas y fotos de empaque)
- Create: `index.html` (esqueleto base)

**Interfaces:**
- Consumes: Archivos fuente de `xochiapam-casa/`
- Produces: Estructura limpia y estandarizada en `assets/` para consumo de las siguientes tareas.

- [ ] **Step 1: Crear directorios de assets**

```bash
mkdir -p assets/fonts assets/logos assets/images css js tests docs/superpowers/plans
```

- [ ] **Step 2: Copiar tipografías y gráficos maestros a assets/**

```bash
cp xochiapam-casa/05-tipografias/Fredoka-Semibold.ttf assets/fonts/
cp xochiapam-casa/05-tipografias/Nunito-Regular.ttf assets/fonts/
cp xochiapam-casa/05-tipografias/Nunito-Bold.ttf assets/fonts/

cp xochiapam-casa/01-logotipos/horizontal-color.svg assets/logos/
cp xochiapam-casa/01-logotipos/simbolo-color.svg assets/logos/
cp xochiapam-casa/01-logotipos/simbolo-cacao.svg assets/logos/
cp xochiapam-casa/01-logotipos/principal-color.svg assets/logos/

cp xochiapam-casa/02-etiquetas/frontal-250g.png assets/images/
cp xochiapam-casa/02-etiquetas/frontal-500g.png assets/images/
cp xochiapam-casa/04-aplicaciones/visualizacion-empaque.png assets/images/
cp xochiapam-casa/04-aplicaciones/tarjeta-agradecimiento.png assets/images/
cp xochiapam-casa/03-redes/avatar.png assets/images/
```

- [ ] **Step 3: Verificar integridad de los assets copiados**

Run: `ls -la assets/fonts assets/logos assets/images`
Expected: Todos los archivos presentes con tamaños mayores a 0 bytes.

- [ ] **Step 4: Commit**

```bash
git add assets/
git commit -m "chore: scaffold project structure and copy brand assets"
```

---

### Task 2: Sistema de Diseño y Tokens CSS (`css/tokens.css`)

**Files:**
- Create: `css/tokens.css`
- Test: `tests/tokens.test.js`

**Interfaces:**
- Consumes: Tipografías locales en `assets/fonts/` y valores HEX de la especificación.
- Produces: Variables CSS (`--color-marfil`, `--color-cacao`, `--color-terracota`, `--color-crema`, `--font-heading`, `--font-body`).

- [ ] **Step 1: Escribir el test que valida los tokens y fuentes**

Create `tests/tokens.test.js`:
```javascript
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('tokens.css contains official brand colors and font-face declarations', () => {
  const css = fs.readFileSync('css/tokens.css', 'utf8');
  assert.ok(css.includes('--color-terracota: #B54325;'), 'Must have terracota #B54325');
  assert.ok(css.includes('--color-crema: #F3E3CA;'), 'Must have crema #F3E3CA');
  assert.ok(css.includes('--color-cacao: #4A2113;'), 'Must have cacao #4A2113');
  assert.ok(css.includes('--color-marfil: #FFFAF3;'), 'Must have marfil #FFFAF3');
  assert.ok(css.includes('font-family: "Fredoka";'), 'Must declare Fredoka font-face');
  assert.ok(css.includes('font-family: "Nunito";'), 'Must declare Nunito font-face');
});
```

- [ ] **Step 2: Ejecutar test para verificar fallo**

Run: `node --test tests/tokens.test.js`
Expected: FAIL (file does not exist).

- [ ] **Step 3: Implementar `css/tokens.css`**

Create `css/tokens.css`:
```css
@font-face {
  font-family: "Fredoka";
  src: url("../assets/fonts/Fredoka-Semibold.ttf") format("truetype");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Nunito";
  src: url("../assets/fonts/Nunito-Regular.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Nunito";
  src: url("../assets/fonts/Nunito-Bold.ttf") format("truetype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

:root {
  /* Brand Colors */
  --color-terracota: #B54325;
  --color-terracota-hover: #98341b;
  --color-crema: #F3E3CA;
  --color-crema-light: #fbf5eb;
  --color-cacao: #4A2113;
  --color-cacao-soft: #63301f;
  --color-marfil: #FFFAF3;
  --color-marfil-card: #FFFFFF;

  /* Typography */
  --font-heading: "Fredoka", system-ui, -apple-system, sans-serif;
  --font-body: "Nunito", system-ui, -apple-system, sans-serif;

  /* Fluid Spacing Scale */
  --space-xs: clamp(0.25rem, 0.5vw, 0.5rem);
  --space-sm: clamp(0.5rem, 1vw, 0.75rem);
  --space-md: clamp(1rem, 2vw, 1.5rem);
  --space-lg: clamp(1.5rem, 3vw, 2.5rem);
  --space-xl: clamp(2.5rem, 5vw, 4.5rem);
  --space-2xl: clamp(4rem, 8vw, 7rem);

  /* Radius & Shadows */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-full: 9999px;
  --shadow-warm: 0 10px 30px -10px rgba(74, 33, 19, 0.08);
  --shadow-elevation: 0 20px 40px -15px rgba(74, 33, 19, 0.15);

  /* Layout Max Width */
  --container-max: 1200px;
}

/* Global Reset & Base */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
  color: var(--color-cacao);
  background-color: var(--color-marfil);
  font-family: var(--font-body);
  line-height: 1.6;
}

body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

h1, h2, h3, h4 {
  font-family: var(--font-heading);
  color: var(--color-cacao);
  line-height: 1.2;
}

a {
  color: inherit;
  text-decoration: none;
}

img, svg {
  max-width: 100%;
  height: auto;
  display: block;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}
```

- [ ] **Step 4: Ejecutar test para verificar éxito**

Run: `node --test tests/tokens.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add css/tokens.css tests/tokens.test.js
git commit -m "feat: add brand design tokens and font face declarations"
```

---

### Task 3: Modelo de Datos del Catálogo y Guía de Molienda (`js/catalog.js`)

**Files:**
- Create: `js/catalog.js`
- Test: `tests/catalog.test.js`

**Interfaces:**
- Produces:
  - `PRODUCTS`: Array de objetos de producto (`id`, `name`, `presentation`, `weightGrams`, `price`, `tagline`, `servings`, `badge`, `image`)
  - `GRIND_OPTIONS`: Array de tipos de molienda (`id`, `label`, `shortDesc`, `idealMethods`, `tasteProfile`, `waterRatio`)
  - `ORIGIN_FACTS`: Datos de trazabilidad (altura, municipio, variedad, proceso)

- [ ] **Step 1: Escribir el test que valida el catálogo de productos y moliendas**

Create `tests/catalog.test.js`:
```javascript
import { test } from 'node:test';
import assert from 'node:assert';
import { PRODUCTS, GRIND_OPTIONS, ORIGIN_FACTS } from '../js/catalog.js';

test('catalog contains the 250g and 500g official presentations', () => {
  assert.strictEqual(PRODUCTS.length, 2);
  const p250 = PRODUCTS.find(p => p.id === 'xochiapam-250');
  const p500 = PRODUCTS.find(p => p.id === 'xochiapam-500');
  assert.ok(p250, '250g product must exist');
  assert.ok(p500, '500g product must exist');
  assert.strictEqual(p250.price, 160);
  assert.strictEqual(p500.price, 290);
});

test('grind options include grano entero, molienda media and molienda fina', () => {
  assert.strictEqual(GRIND_OPTIONS.length, 3);
  const ids = GRIND_OPTIONS.map(g => g.id);
  assert.deepStrictEqual(ids, ['grano', 'medio', 'fino']);
});

test('origin facts contain San Pedro Sochiapam, Oaxaca data', () => {
  assert.strictEqual(ORIGIN_FACTS.municipality, 'San Pedro Sochiapam');
  assert.strictEqual(ORIGIN_FACTS.state, 'Oaxaca');
  assert.ok(ORIGIN_FACTS.altitude.includes('1,400'));
});
```

- [ ] **Step 2: Ejecutar test para verificar fallo**

Run: `node --test tests/catalog.test.js`
Expected: FAIL (Cannot find module '../js/catalog.js').

- [ ] **Step 3: Implementar `js/catalog.js`**

Create `js/catalog.js`:
```javascript
export const ORIGIN_FACTS = {
  name: 'Xochiapam Casa',
  tagline: 'Tu café de cada día',
  support: 'De Oaxaca a tu taza',
  municipality: 'San Pedro Sochiapam',
  state: 'Oaxaca',
  country: 'México',
  altitude: '1,400 a 1,750 msnm',
  variety: '100% Arábica (Pluma Hidalgo, Typica y Bourbon)',
  harvest: 'Cosecha manual selectiva',
  process: 'Lavado artesanal con secado en camas de montaña',
  roastProfile: 'Tueste medio equilibrado (acidez brillante, notas de cacao y miel)'
};

export const PRODUCTS = [
  {
    id: 'xochiapam-250',
    name: 'Café Xochiapam Casa',
    presentation: '250 g',
    weightGrams: 250,
    price: 160,
    tagline: 'Edición Frescura Individual',
    servings: '~16 tazas',
    badge: 'Consumo diario',
    description: 'Perfecto para quienes buscan frescura absoluta taza tras taza. Rendimiento óptimo para una a dos semanas de café recién preparado.',
    image: 'assets/images/frontal-250g.png'
  },
  {
    id: 'xochiapam-500',
    name: 'Café Xochiapam Casa',
    presentation: '500 g',
    weightGrams: 500,
    price: 290,
    tagline: 'Edición Hogar & Barista',
    servings: '~32 tazas',
    badge: 'Más popular',
    description: 'La presentación ideal para compartir en casa o disfrutar en la oficina. Mayor valor y suficiente grano para explorar diversos métodos.',
    image: 'assets/images/frontal-500g.png'
  }
];

export const GRIND_OPTIONS = [
  {
    id: 'grano',
    label: 'En Grano Entero',
    shortDesc: 'Para moler al momento',
    recommendation: 'Recomendado para entusiastas con molino manual o automático.',
    idealMethods: ['Espresso profesional', 'Chemex', 'V60 Pour-over', 'AeroPress'],
    tasteProfile: 'Máxima explosión aromática, notas vivas y mayor tiempo de conservación de aceites esenciales.',
    waterRatio: '1 g café : 15 ml agua'
  },
  {
    id: 'medio',
    label: 'Molienda Media',
    shortDesc: 'Calibrado para filtro y prensa',
    recommendation: 'Textura balanceada tipo sal de mar, perfecta para el uso diario sin complicaciones.',
    idealMethods: ['Prensa Francesa', 'Cafetera eléctrica de goteo', 'Sifón japonés', 'Cold Brew'],
    tasteProfile: 'Cuerpo redondo, dulzor prolongado con notas a chocolate amargo y nuez tostada.',
    waterRatio: '1 g café : 14-16 ml agua'
  },
  {
    id: 'fino',
    label: 'Molienda Fina',
    shortDesc: 'Calibrado para espresso y moka',
    recommendation: 'Granulometría fina y uniforme para extracciones a presión.',
    idealMethods: ['Cafetera Italiana Moka', 'Máquina de espresso casera', 'Café turco'],
    tasteProfile: 'Extracción densa, crema aterciopelada y sabor profundo con gran intensidad.',
    waterRatio: '1 g café : 10-12 ml agua'
  }
];
```

- [ ] **Step 4: Ejecutar test para verificar éxito**

Run: `node --test tests/catalog.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/catalog.js tests/catalog.test.js
git commit -m "feat: add coffee catalog, origin facts, and grind options"
```

---

### Task 4: Estado del Carrito y Generador de Pedido WhatsApp (`js/cart.js`)

**Files:**
- Create: `js/cart.js`
- Test: `tests/cart.test.js`

**Interfaces:**
- Produces:
  - `class Cart`: `addItem(product, grindId, qty)`, `removeItem(itemId)`, `updateQty(itemId, qty)`, `clear()`, `getItems()`, `getTotal()`, `getItemCount()`
  - `formatWhatsAppOrder(cart, customerInfo)`: Función pura que genera la URL de WhatsApp codificada.

- [ ] **Step 1: Escribir el test que valida la lógica del carrito y formateo de WhatsApp**

Create `tests/cart.test.js`:
```javascript
import { test } from 'node:test';
import assert from 'node:assert';
import { Cart, formatWhatsAppOrder } from '../js/cart.js';
import { PRODUCTS, GRIND_OPTIONS } from '../js/catalog.js';

test('Cart manages items, quantities and totals accurately', () => {
  const mockStorage = {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = v; },
    removeItem(k) { delete this.store[k]; }
  };

  const cart = new Cart(mockStorage);
  assert.strictEqual(cart.getItemCount(), 0);
  assert.strictEqual(cart.getTotal(), 0);

  // Add 1x 250g en grano
  cart.addItem(PRODUCTS[0], 'grano', 1);
  assert.strictEqual(cart.getItemCount(), 1);
  assert.strictEqual(cart.getTotal(), 160);

  // Add 1x 500g molienda media
  cart.addItem(PRODUCTS[1], 'medio', 2);
  assert.strictEqual(cart.getItemCount(), 3);
  assert.strictEqual(cart.getTotal(), 160 + (290 * 2)); // 740

  // Update quantity
  const items = cart.getItems();
  cart.updateQty(items[0].id, 2);
  assert.strictEqual(cart.getTotal(), (160 * 2) + (290 * 2)); // 900

  // Remove item
  cart.removeItem(items[0].id);
  assert.strictEqual(cart.getItems().length, 1);
  assert.strictEqual(cart.getTotal(), 580);
});

test('formatWhatsAppOrder creates structured readable WhatsApp message', () => {
  const mockStorage = { store: {}, getItem() { return null; }, setItem() {} };
  const cart = new Cart(mockStorage);
  cart.addItem(PRODUCTS[0], 'medio', 1);

  const customer = { name: 'Alejandro', city: 'Oaxaca, Centro', notes: 'Por favor entregar por la tarde' };
  const { url, rawText } = formatWhatsAppOrder(cart, customer, '5219510000000');

  assert.ok(url.startsWith('https://wa.me/5219510000000?text='), 'Must point to WhatsApp wa.me');
  assert.ok(rawText.includes('Café Xochiapam Casa 250 g'), 'Must contain product name');
  assert.ok(rawText.includes('Molienda Media'), 'Must contain grind');
  assert.ok(rawText.includes('Alejandro'), 'Must contain customer name');
  assert.ok(rawText.includes('$160 MXN'), 'Must contain total');
});
```

- [ ] **Step 2: Ejecutar test para verificar fallo**

Run: `node --test tests/cart.test.js`
Expected: FAIL (Cannot find module '../js/cart.js').

- [ ] **Step 3: Implementar `js/cart.js`**

Create `js/cart.js`:
```javascript
import { GRIND_OPTIONS } from './catalog.js';

export class Cart {
  constructor(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
    this.storage = storage;
    this.storageKey = 'xochiapam_cart_v1';
    this.items = this.load();
    this.listeners = [];
  }

  load() {
    if (!this.storage) return [];
    try {
      const data = this.storage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  save() {
    if (this.storage) {
      try {
        this.storage.setItem(this.storageKey, JSON.stringify(this.items));
      } catch (err) {
        console.warn('Could not save cart to storage', err);
      }
    }
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this));
  }

  addItem(product, grindId = 'medio', quantity = 1) {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const grindObj = GRIND_OPTIONS.find(g => g.id === grindId) || GRIND_OPTIONS[1];
    const itemId = `${product.id}_${grindId}`;

    const existingIndex = this.items.findIndex(item => item.id === itemId);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += qty;
    } else {
      this.items.push({
        id: itemId,
        productId: product.id,
        name: product.name,
        presentation: product.presentation,
        grindId: grindObj.id,
        grindLabel: grindObj.label,
        price: product.price,
        image: product.image,
        quantity: qty
      });
    }
    this.save();
  }

  updateQty(itemId, newQty) {
    const qty = parseInt(newQty, 10);
    if (qty <= 0) {
      this.removeItem(itemId);
      return;
    }
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = qty;
      this.save();
    }
  }

  removeItem(itemId) {
    this.items = this.items.filter(i => i.id !== itemId);
    this.save();
  }

  clear() {
    this.items = [];
    this.save();
  }

  getItems() {
    return [...this.items];
  }

  getItemCount() {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  getTotal() {
    return this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }
}

export function formatWhatsAppOrder(cart, customer = {}, phone = '5219511234567') {
  const items = cart.getItems();
  const total = cart.getTotal();

  if (items.length === 0) {
    return { url: '', rawText: '' };
  }

  let text = `☕ *Nuevo Pedido — Café Xochiapam Casa*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  items.forEach(item => {
    text += `• ${item.quantity}x ${item.name} ${item.presentation} (${item.grindLabel}) — $${item.price * item.quantity} MXN\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `*Total estimado:* $${total} MXN\n\n`;

  if (customer.name && customer.name.trim()) {
    text += `👤 *Cliente:* ${customer.name.trim()}\n`;
  }
  if (customer.city && customer.city.trim()) {
    text += `📍 *Entrega:* ${customer.city.trim()}\n`;
  }
  if (customer.notes && customer.notes.trim()) {
    text += `📝 *Notas:* ${customer.notes.trim()}\n`;
  }

  text += `💬 *Origen:* Pedido web oficial Xochiapam Casa`;

  const encoded = encodeURIComponent(text);
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${encoded}`;

  return { url, rawText: text };
}
```

- [ ] **Step 4: Ejecutar test para verificar éxito**

Run: `node --test tests/cart.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/cart.js tests/cart.test.js
git commit -m "feat: add shopping cart state manager and WhatsApp link generator"
```

---

### Task 5: Componentes Visuales de Header, Hero y Sección de Orígenes

**Files:**
- Create: `css/layout.css`
- Modify: `index.html` (implementar Header, Hero con onda orgánica y Sección de Origen)

**Interfaces:**
- Consumes: `css/tokens.css`, `assets/logos/horizontal-color.svg`, `assets/images/visualizacion-empaque.png`
- Produces: Header con navegación fluida y badge, Hero con lema editorial oficial y sección de San Pedro Sochiapam.

- [ ] **Step 1: Escribir las reglas de maquetación en `css/layout.css`**

Create `css/layout.css`:
```css
/* Container Helper */
.container {
  width: 100%;
  max-width: var(--container-max);
  margin-inline: auto;
  padding-inline: var(--space-md);
}

/* 1. Header Fijo con Glassmorphism Cálido */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(255, 250, 243, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(74, 33, 19, 0.08);
  transition: all 0.3s ease;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 76px;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.brand-logo {
  height: 48px;
  width: auto;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.nav-links {
  display: flex;
  list-style: none;
  gap: var(--space-md);
}

.nav-links a {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-cacao);
  position: relative;
  padding: 4px 8px;
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: var(--color-terracota);
}

.cart-button-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-terracota);
  color: #FFFFFF;
  padding: 10px 18px;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(181, 67, 37, 0.25);
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.cart-button-trigger:hover {
  background-color: var(--color-terracota-hover);
  transform: translateY(-1px);
}

.cart-badge {
  background-color: #FFFFFF;
  color: var(--color-terracota);
  border-radius: var(--radius-full);
  padding: 2px 8px;
  font-size: 0.8rem;
  font-weight: 800;
  min-width: 20px;
  text-align: center;
}

/* 2. Hero Editorial */
.hero-section {
  position: relative;
  background-color: var(--color-marfil);
  padding-top: var(--space-xl);
  padding-bottom: var(--space-2xl);
  overflow: hidden;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: var(--space-xl);
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-crema);
  color: var(--color-cacao);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
}

.hero-title {
  font-size: clamp(2.4rem, 5vw, 4rem);
  color: var(--color-cacao);
  margin-bottom: var(--space-sm);
  letter-spacing: -0.02em;
}

.hero-title span {
  color: var(--color-terracota);
}

.hero-subtitle {
  font-size: clamp(1.05rem, 1.8vw, 1.25rem);
  color: var(--color-cacao-soft);
  margin-bottom: var(--space-lg);
  max-width: 540px;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #FFFFFF;
  border: 1px solid var(--color-crema);
  padding: 6px 14px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-cacao);
  box-shadow: var(--shadow-warm);
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background-color: var(--color-terracota);
  color: #FFFFFF;
  padding: 14px 28px;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 8px 20px rgba(181, 67, 37, 0.3);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-terracota-hover);
  transform: translateY(-2px);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background-color: var(--color-crema);
  color: var(--color-cacao);
  padding: 14px 28px;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #e5d1b3;
}

.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
}

.hero-image-frame {
  position: relative;
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  background: radial-gradient(circle, var(--color-crema) 0%, rgba(243, 227, 202, 0.2) 70%);
}

.hero-image {
  max-width: 100%;
  height: auto;
  filter: drop-shadow(0 20px 30px rgba(74, 33, 19, 0.15));
  transition: transform 0.4s ease;
}

.hero-image:hover {
  transform: scale(1.02);
}

/* Divisor de Onda Orgánica */
.wave-divider {
  width: 100%;
  overflow: hidden;
  line-height: 0;
  transform: translateZ(0);
}

.wave-divider svg {
  display: block;
  width: calc(100% + 1.3px);
  height: 60px;
}

/* 3. Sección Orígenes e Historia */
.section-origins {
  background-color: var(--color-crema-light);
  padding-block: var(--space-2xl);
  position: relative;
}

.section-header {
  text-align: center;
  max-width: 680px;
  margin-inline: auto;
  margin-bottom: var(--space-xl);
}

.section-tag {
  color: var(--color-terracota);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.8rem;
  margin-bottom: var(--space-xs);
  display: block;
}

.section-title {
  font-size: clamp(2rem, 3.5vw, 2.8rem);
  margin-bottom: var(--space-sm);
}

.section-desc {
  color: var(--color-cacao-soft);
  font-size: 1.1rem;
}

.origins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
}

.origin-card {
  background-color: #FFFFFF;
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  box-shadow: var(--shadow-warm);
  border: 1px solid rgba(74, 33, 19, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.origin-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-elevation);
}

.origin-icon {
  font-size: 2rem;
  margin-bottom: var(--space-sm);
  color: var(--color-terracota);
}

.origin-card h3 {
  font-size: 1.35rem;
  margin-bottom: var(--space-xs);
}

.origin-card p {
  color: var(--color-cacao-soft);
  font-size: 0.95rem;
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero-subtitle {
    margin-inline: auto;
  }
  .hero-badges, .hero-ctas {
    justify-content: center;
  }
  .nav-links {
    display: none; /* Mobile navigation simplified */
  }
}
```

- [ ] **Step 2: Crear `index.html` con la estructura inicial**

Create `index.html` con doctype, meta tags, importación de tokens, layout y marcado semántico inicial.

- [ ] **Step 3: Verificar visualización en terminal o headless browser**

Run: `node -e "const fs = require('fs'); assert = require('assert'); const html = fs.readFileSync('index.html', 'utf8'); assert(html.includes('Tu café de cada día')); console.log('OK');"`
Expected: OK

- [ ] **Step 4: Commit**

```bash
git add css/layout.css index.html
git commit -m "feat: implement header, editorial hero, and origins section"
```

---

### Task 6: Guía y Tabla Comparativa Interactiva (`js/comparison.js` y `css/components.css`)

**Files:**
- Create: `js/comparison.js`
- Create: `css/components.css`
- Modify: `index.html` (agregar bloque de `#comparativa`)
- Test: `tests/comparison.test.js`

**Interfaces:**
- Consumes: `GRIND_OPTIONS`, `PRODUCTS` de `js/catalog.js`
- Produces: Controlador que alterna las pestañas de molienda y muestra la comparativa visual interactiva de métodos y proporciones.

- [ ] **Step 1: Escribir el test que valida la lógica de renderizado comparativo**

Create `tests/comparison.test.js`:
```javascript
import { test } from 'node:test';
import assert from 'node:assert';
import { GRIND_OPTIONS, PRODUCTS } from '../js/catalog.js';

test('every grind option has valid idealMethods and tasteProfile', () => {
  GRIND_OPTIONS.forEach(opt => {
    assert.ok(opt.idealMethods.length > 0, `${opt.id} must have ideal methods`);
    assert.ok(opt.tasteProfile.length > 10, `${opt.id} must have detailed taste profile`);
    assert.ok(opt.waterRatio.length > 0, `${opt.id} must have water ratio`);
  });
});
```

- [ ] **Step 2: Ejecutar test para verificar éxito**

Run: `node --test tests/comparison.test.js`
Expected: PASS

- [ ] **Step 3: Implementar `js/comparison.js` y estilos en `css/components.css`**

Create `js/comparison.js` con lógica para alternar pestañas táctiles con `aria-selected` y actualizar la tarjeta descriptiva de extracción en tiempo real.
Agregar a `css/components.css` los estilos de tabla comparativa de 250g vs 500g y el selector interactivo de moliendas.

- [ ] **Step 4: Integrar sección `#comparativa` en `index.html`**

Actualizar `index.html` vinculando los scripts y la tabla de comparación.

- [ ] **Step 5: Commit**

```bash
git add js/comparison.js css/components.css index.html tests/comparison.test.js
git commit -m "feat: implement interactive coffee comparison and grind guide"
```

---

### Task 7: Boutique de Producto, Drawer Nativo `<dialog>` y Checkout WhatsApp

**Files:**
- Create: `js/drawer.js`
- Create: `js/app.js`
- Modify: `css/components.css` (estilos de drawer, backdrop, inputs y tarjetas de boutique)
- Modify: `index.html` (agregar sección `#tienda` y elemento `<dialog id="cart-drawer">`)

**Interfaces:**
- Consumes: `Cart`, `formatWhatsAppOrder` de `js/cart.js`, `PRODUCTS` de `js/catalog.js`
- Produces: Tienda funcional interactiva con apertura/cierre de drawer nativo, persistencia y generación de enlaces de WhatsApp.

- [ ] **Step 1: Implementar `js/drawer.js`**

Controlador del elemento nativo `<dialog id="cart-drawer">` con soporte para:
- `dialog.showModal()` al pulsar el botón del carrito o al añadir un producto.
- `dialog.close()` al pulsar el botón de cerrar o la tecla `Escape`.
- *Light dismiss*: Detectar clics en el backdrop y cerrar suavemente.
- Renderizado reactivo de la lista de artículos, totales y formulario de cliente.
- Enlace dinámico `wa.me` y botón alternativo de copiar al portapapeles.

- [ ] **Step 2: Implementar estilos del drawer y tarjetas de producto en `css/components.css`**

Estilos con tokens oficiales:
- Backdrop en `rgba(74, 33, 19, 0.6)` con `backdrop-filter: blur(4px)`.
- Drawer deslizante desde la derecha a 60fps con `transform: translateX(0)`.
- Tarjetas de producto con selectores de molienda en píldora táctil y selector numérico de cantidad.

- [ ] **Step 3: Implementar `js/app.js` como punto de entrada de la aplicación**

Inicializar `Cart`, registrar escuchadores en botones "Agregar al pedido", renderizar catálogo dinámicamente y enlazar la barra de navegación flotante.

- [ ] **Step 4: Integrar boutique y drawer en `index.html`**

Insertar `<section id="tienda">` y `<dialog id="cart-drawer">` con accesibilidad ARIA completa (`aria-labelledby`, `aria-describedby`).

- [ ] **Step 5: Commit**

```bash
git add js/drawer.js js/app.js css/components.css index.html
git commit -m "feat: implement boutique configurator, native cart dialog and WhatsApp checkout"
```

---

### Task 8: Footer Institucional, Verificación Integral de Accesibilidad y Responsividad

**Files:**
- Modify: `index.html` (agregar `<footer class="site-footer">`)
- Modify: `css/layout.css` (estilos del footer y media queries para 360px a 1440px)
- Create: `tests/e2e.test.js` (verificación de carga, ausencia de enlaces rotos y cálculo de precios)

**Interfaces:**
- Consumes: Todo el sitio web construido.
- Produces: Sitio web 100% pulido, accesible, responsive y listo para producción.

- [ ] **Step 1: Escribir test integral de verificación**

Create `tests/e2e.test.js`:
```javascript
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

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
```

- [ ] **Step 2: Ejecutar test para verificar éxito**

Run: `node --test tests/e2e.test.js`
Expected: PASS

- [ ] **Step 3: Agregar Footer Institucional en `index.html` y estilos en `css/layout.css`**

Logotipo en cacao, datos de contacto, enlaces rápidos y lema de marca *"Tu café de cada día"*.

- [ ] **Step 4: Ejecutar suite completa de tests**

Run: `node --test tests/*.test.js`
Expected: Todos los tests pasan (5/5).

- [ ] **Step 5: Commit final**

```bash
git add .
git commit -m "feat: complete Xochiapam Casa website with full responsive and accessible experience"
```
