import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { calculateBrew, initRatioCalculator, BREWING_RECIPES } from '../js/calculator.js';

const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

test('BREWING_RECIPES defines all 4 domestic brewing methods with zero emojis', () => {
  assert.ok(BREWING_RECIPES.electrica, 'Must define electrica');
  assert.ok(BREWING_RECIPES.prensa, 'Must define prensa');
  assert.ok(BREWING_RECIPES.moka, 'Must define moka');
  assert.ok(BREWING_RECIPES.taza, 'Must define taza');

  const raw = fs.readFileSync('js/calculator.js', 'utf8');
  assert.strictEqual(EMOJI_REGEX.test(raw), false, 'js/calculator.js must contain zero emojis');
});

test('calculateBrew calculates coffee grams, water and household spoons accurately', () => {
  // Electrica: 1 cup = 240 ml, ratio 1:16 -> 15 g coffee
  const e1 = calculateBrew('electrica', 1);
  assert.strictEqual(e1.cups, 1);
  assert.strictEqual(e1.totalWater, 240);
  assert.strictEqual(e1.coffeeGrams, 15);
  assert.strictEqual(e1.grindId, 'medio');
  assert.ok(e1.spoonsText.includes('1.5 cucharadas soperas'));

  // Electrica: 4 cups = 960 ml, ratio 1:16 -> 60 g coffee
  const e4 = calculateBrew('electrica', 4);
  assert.strictEqual(e4.cups, 4);
  assert.strictEqual(e4.totalWater, 960);
  assert.strictEqual(e4.coffeeGrams, 60);

  // Prensa: 2 cups = 440 ml, ratio 1:15 -> 29 g coffee
  const p2 = calculateBrew('prensa', 2);
  assert.strictEqual(p2.cups, 2);
  assert.strictEqual(p2.totalWater, 440);
  assert.strictEqual(p2.coffeeGrams, 29);
  assert.strictEqual(p2.grindId, 'medio');

  // Moka: 1 cup = 60 ml, ratio 1:10 -> 6 g coffee
  const m1 = calculateBrew('moka', 1);
  assert.strictEqual(m1.cups, 1);
  assert.strictEqual(m1.totalWater, 60);
  assert.strictEqual(m1.coffeeGrams, 6);
  assert.strictEqual(m1.grindId, 'fino');

  // Taza: 1 cup = 250 ml, ratio 1:15 -> 17 g coffee
  const t1 = calculateBrew('taza', 1);
  assert.strictEqual(t1.cups, 1);
  assert.strictEqual(t1.totalWater, 250);
  assert.strictEqual(t1.coffeeGrams, 17);
});

test('initRatioCalculator initializes DOM and handles method/cups switching and shop linking', () => {
  // Create mock DOM structure matching index.html
  const listeners = new Map();
  const makeElem = (id, tag = 'div', dataset = {}) => {
    const classList = new Set();
    const attrs = new Map();
    const elem = {
      id,
      dataset: { ...dataset },
      textContent: '',
      classList: {
        add: (c) => classList.add(c),
        remove: (c) => classList.delete(c),
        toggle: (c, force) => {
          if (force === undefined) {
            classList.has(c) ? classList.delete(c) : classList.add(c);
          } else if (force) {
            classList.add(c);
          } else {
            classList.delete(c);
          }
        },
        contains: (c) => classList.has(c)
      },
      setAttribute: (k, v) => attrs.set(k, String(v)),
      getAttribute: (k) => attrs.get(k) || null,
      addEventListener: (evt, fn) => {
        if (!listeners.has(elem)) listeners.set(elem, {});
        listeners.get(elem)[evt] = fn;
      },
      dispatchEvent: (evt) => {
        const handler = listeners.get(elem) && listeners.get(elem)[evt.type];
        if (handler) handler(evt);
      }
    };
    return elem;
  };

  const calcEl = makeElem('calculadora-proporcion');
  const recipeTagEl = makeElem('ratio-recipe-tag');
  const gramsEl = makeElem('calc-coffee-grams');
  const spoonsEl = makeElem('calc-coffee-spoons');
  const waterEl = makeElem('calc-water-ml');
  const waterTempEl = makeElem('calc-water-temp');
  const grindAdviceEl = makeElem('calc-grind-advice');
  const timeAdviceEl = makeElem('calc-time-advice');
  const shopLink = makeElem('btn-ratio-select-grind');

  const methodElectrica = makeElem('m-elec', 'button', { method: 'electrica' });
  const methodPrensa = makeElem('m-prensa', 'button', { method: 'prensa' });
  const methodMoka = makeElem('m-moka', 'button', { method: 'moka' });
  const methodBtns = [methodElectrica, methodPrensa, methodMoka];

  const cup1 = makeElem('c-1', 'button', { cups: '1' });
  const cup2 = makeElem('c-2', 'button', { cups: '2' });
  const cupBtns = [cup1, cup2];

  const cardRadioMedio = makeElem('r-medio', 'input');
  cardRadioMedio.value = 'medio';
  cardRadioMedio.checked = false;

  const cardRadioFino = makeElem('r-fino', 'input');
  cardRadioFino.value = 'fino';
  cardRadioFino.checked = false;

  const boutiqueCard = makeElem('b-card');
  boutiqueCard.querySelector = (sel) => {
    if (sel.includes('value="medio"')) return cardRadioMedio;
    if (sel.includes('value="fino"')) return cardRadioFino;
    return null;
  };

  calcEl.querySelector = (sel) => {
    if (sel === '#ratio-recipe-tag') return recipeTagEl;
    if (sel === '#calc-coffee-grams') return gramsEl;
    if (sel === '#calc-coffee-spoons') return spoonsEl;
    if (sel === '#calc-water-ml') return waterEl;
    if (sel === '#calc-water-temp') return waterTempEl;
    if (sel === '#calc-grind-advice') return grindAdviceEl;
    if (sel === '#calc-time-advice') return timeAdviceEl;
    if (sel === '#btn-ratio-select-grind') return shopLink;
    return null;
  };

  calcEl.querySelectorAll = (sel) => {
    if (sel === '.btn-ratio-method') return methodBtns;
    if (sel === '.btn-ratio-cup') return cupBtns;
    return [];
  };

  const mockContainer = {
    querySelector: (sel) => {
      if (sel === '#calculadora-proporcion') return calcEl;
      return null;
    },
    querySelectorAll: (sel) => {
      if (sel === '.boutique-card') return [boutiqueCard];
      return [];
    }
  };

  const controller = initRatioCalculator(mockContainer);
  assert.ok(controller, 'Controller must initialize cleanly');

  // Verify initial state
  assert.strictEqual(gramsEl.textContent, '15 g');
  assert.strictEqual(waterEl.textContent, '240 ml');
  assert.strictEqual(methodElectrica.classList.contains('is-active'), true);
  assert.strictEqual(cup1.classList.contains('is-active'), true);
  assert.strictEqual(shopLink.getAttribute('data-target-grind'), 'medio');

  // Switch to Moka via click
  const clickMoka = listeners.get(methodMoka) && listeners.get(methodMoka)['click'];
  assert.ok(clickMoka, 'Moka button must have click listener');
  clickMoka();

  assert.strictEqual(gramsEl.textContent, '6 g');
  assert.strictEqual(waterEl.textContent, '60 ml');
  assert.strictEqual(methodMoka.classList.contains('is-active'), true);
  assert.strictEqual(methodElectrica.classList.contains('is-active'), false);
  assert.strictEqual(shopLink.getAttribute('data-target-grind'), 'fino');

  // Switch to 2 cups via click
  const clickCup2 = listeners.get(cup2) && listeners.get(cup2)['click'];
  assert.ok(clickCup2, 'Cup 2 button must have click listener');
  clickCup2();

  assert.strictEqual(gramsEl.textContent, '12 g');
  assert.strictEqual(waterEl.textContent, '120 ml');

  // Click shop link -> should set matching radio in boutique card to true
  const clickShop = listeners.get(shopLink) && listeners.get(shopLink)['click'];
  assert.ok(clickShop, 'Shop link must have click listener');
  clickShop();

  assert.strictEqual(cardRadioFino.checked, true, 'Card radio for fino must be checked');
  assert.strictEqual(boutiqueCard.classList.contains('is-highlighted'), true, 'Boutique card should be highlighted');
});
