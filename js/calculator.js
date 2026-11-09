/**
 * Guía interactiva de proporciones y extracción para cafetera doméstica.
 * Xochiapam Café — San Pedro Sochiapam, Oaxaca
 */

export const BREWING_RECIPES = {
  electrica: {
    name: 'Cafetera eléctrica / Filtro',
    ratio: 16,
    cupMl: 240,
    grindId: 'medio',
    grindName: 'Molienda Media (calibrada para filtro de papel o canastilla)',
    timeAdvice: 'Ciclo estándar de tu cafetera eléctrica (4 a 5 minutos)',
    tempAdvice: '90° a 93°C (temperatura automática o retira 1 min tras hervir)'
  },
  prensa: {
    name: 'Prensa Francesa',
    ratio: 15,
    cupMl: 220,
    grindId: 'medio',
    grindName: 'Molienda Media-Gruesa (mayor cuerpo y retención de sedimentos)',
    timeAdvice: '4 minutos de infusión antes de bajar el émbolo suavemente',
    tempAdvice: '92°C (espera 45 segundos después del hervor antes de verter)'
  },
  moka: {
    name: 'Cafetera Italiana Moka',
    ratio: 10,
    cupMl: 60,
    grindId: 'fino',
    grindName: 'Molienda Fina (sin llegar a polvo talco para no obstruir el filtro)',
    timeAdvice: 'Fuego medio-bajo; retira de la llama cuando empiece a borbotear',
    tempAdvice: 'Agua caliente en la base inferior para no sobrecalentar el grano'
  },
  taza: {
    name: 'Taza individual rápida',
    ratio: 15,
    cupMl: 250,
    grindId: 'medio',
    grindName: 'Molienda Media (goteo directo en filtro cónico de taza)',
    timeAdvice: '2.5 a 3 minutos vertiendo el agua en círculos pausados',
    tempAdvice: '91° a 93°C (retira 1 minuto después de hervir)'
  }
};

/**
 * Calcula cantidades de café y agua según método y número de tazas.
 * @param {string} methodKey
 * @param {number} cupsCount
 * @returns {object}
 */
export function calculateBrew(methodKey, cupsCount) {
  const recipe = BREWING_RECIPES[methodKey] || BREWING_RECIPES.electrica;
  const cups = Math.max(1, parseInt(cupsCount, 10) || 1);
  const totalWater = recipe.cupMl * cups;
  const coffeeGrams = Math.round(totalWater / recipe.ratio);
  const spoons = (coffeeGrams / 10).toFixed(1).replace('.0', '');

  return {
    methodKey,
    methodName: recipe.name,
    cups,
    totalWater,
    coffeeGrams,
    spoonsText: `~${spoons} ${spoons === '1' ? 'cucharada sopera' : 'cucharadas soperas'} copeteadas`,
    grindId: recipe.grindId,
    grindName: recipe.grindName,
    timeAdvice: recipe.timeAdvice,
    tempAdvice: recipe.tempAdvice
  };
}

/**
 * Inicializa los eventos de la calculadora interactiva en el DOM.
 * @param {ParentNode} [container=document]
 * @returns {object|null}
 */
export function initRatioCalculator(container = (typeof document !== 'undefined' ? document : null)) {
  if (!container || typeof container.querySelector !== 'function') return null;

  const calcEl = container.querySelector('#calculadora-proporcion');
  if (!calcEl) return null;

  let activeMethod = 'electrica';
  let activeCups = 1;

  const methodBtns = calcEl.querySelectorAll ? calcEl.querySelectorAll('.btn-ratio-method') : [];
  const cupBtns = calcEl.querySelectorAll ? calcEl.querySelectorAll('.btn-ratio-cup') : [];

  const recipeTagEl = calcEl.querySelector('#ratio-recipe-tag');
  const gramsEl = calcEl.querySelector('#calc-coffee-grams');
  const spoonsEl = calcEl.querySelector('#calc-coffee-spoons');
  const waterEl = calcEl.querySelector('#calc-water-ml');
  const waterTempEl = calcEl.querySelector('#calc-water-temp');
  const grindAdviceEl = calcEl.querySelector('#calc-grind-advice');
  const timeAdviceEl = calcEl.querySelector('#calc-time-advice');
  const shopLink = calcEl.querySelector('#btn-ratio-select-grind');

  const updateUI = () => {
    const res = calculateBrew(activeMethod, activeCups);

    if (recipeTagEl) {
      recipeTagEl.textContent = `Receta para ${res.cups} ${res.cups === 1 ? 'taza' : 'tazas'} (${res.methodName})`;
    }
    if (gramsEl) gramsEl.textContent = `${res.coffeeGrams} g`;
    if (spoonsEl) spoonsEl.textContent = res.spoonsText;
    if (waterEl) waterEl.textContent = `${res.totalWater} ml`;
    if (waterTempEl) waterTempEl.textContent = res.tempAdvice;
    if (grindAdviceEl) grindAdviceEl.textContent = res.grindName;
    if (timeAdviceEl) timeAdviceEl.textContent = res.timeAdvice;

    if (methodBtns && typeof methodBtns.forEach === 'function') {
      methodBtns.forEach(btn => {
        const isTarget = btn.dataset.method === activeMethod;
        btn.classList.toggle('is-active', isTarget);
        btn.setAttribute('aria-checked', isTarget ? 'true' : 'false');
      });
    }

    if (cupBtns && typeof cupBtns.forEach === 'function') {
      cupBtns.forEach(btn => {
        const isTarget = parseInt(btn.dataset.cups, 10) === activeCups;
        btn.classList.toggle('is-active', isTarget);
      });
    }

    if (shopLink) {
      shopLink.setAttribute('data-target-grind', res.grindId);
    }
  };

  if (methodBtns && typeof methodBtns.forEach === 'function') {
    methodBtns.forEach(btn => {
      if (btn && typeof btn.addEventListener === 'function') {
        btn.addEventListener('click', () => {
          if (btn.dataset.method) {
            activeMethod = btn.dataset.method;
            updateUI();
          }
        });
      }
    });
  }

  if (cupBtns && typeof cupBtns.forEach === 'function') {
    cupBtns.forEach(btn => {
      if (btn && typeof btn.addEventListener === 'function') {
        btn.addEventListener('click', () => {
          const cups = parseInt(btn.dataset.cups, 10);
          if (cups) {
            activeCups = cups;
            updateUI();
          }
        });
      }
    });
  }

  if (shopLink && typeof shopLink.addEventListener === 'function') {
    shopLink.addEventListener('click', () => {
      const targetGrind = shopLink.getAttribute('data-target-grind') || 'medio';
      const boutiqueCards = container.querySelectorAll ? container.querySelectorAll('.boutique-card') : [];
      if (boutiqueCards && typeof boutiqueCards.forEach === 'function') {
        boutiqueCards.forEach(card => {
          const radio = card.querySelector ? card.querySelector(`input[type="radio"][value="${targetGrind}"]`) : null;
          if (radio) {
            radio.checked = true;
            if (typeof radio.dispatchEvent === 'function') {
              radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
      }
    });
  }

  updateUI();
  return {
    setMethod: (m) => { activeMethod = m; updateUI(); },
    setCups: (c) => { activeCups = c; updateUI(); },
    getBrewState: () => calculateBrew(activeMethod, activeCups)
  };
}
