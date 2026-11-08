export const ORIGIN_FACTS = {
  name: 'Xochiapam',
  tagline: 'Tu café de cada día',
  support: 'De Oaxaca a tu taza',
  municipality: 'San Pedro Sochiapam',
  state: 'Oaxaca',
  country: 'México'
};

export const PRODUCTS = [
  {
    id: 'xochiapam-250',
    name: 'Café Xochiapam Casa',
    presentation: '250 g',
    weightGrams: 250,
    price: 160,
    tagline: 'Entrada y prueba — Bolsa Crema',
    servings: '~16 tazas',
    badge: 'Bolsa Crema',
    description: 'Para conocer el café o tomar una taza al día siempre recién abierta.',
    image: 'assets/empaque/frontal-250g.svg'
  },
  {
    id: 'xochiapam-500',
    name: 'Café Xochiapam Casa',
    presentation: '500 g',
    weightGrams: 500,
    price: 290,
    tagline: 'Recompra para casa — Bolsa Terracota',
    servings: '~32 tazas',
    badge: 'Bolsa Terracota',
    description: 'Pensado para quien ya lo hizo parte de su cocina o comparte cafetera todas las mañanas.',
    image: 'assets/empaque/frontal-500g.svg'
  }
];

export const GRIND_OPTIONS = [
  {
    id: 'grano',
    label: 'En Grano Entero',
    shortDesc: 'Para moler en casa',
    recommendation: 'Ideal si tienes molino en casa y disfrutas moler justo antes de calentar el agua.',
    idealMethods: ['Molino manual o eléctrico', 'Prensa Francesa', 'Filtro o V60', 'Cafetera Moka'],
    tasteProfile: 'Conserva su aroma natural por más tiempo dentro de la alacena y te deja ajustar el grosor a tu gusto.',
    waterRatio: '1 g café : 15 ml agua'
  },
  {
    id: 'medio',
    label: 'Molienda Media',
    shortDesc: 'Cafetera de filtro, prensa o jarra',
    recommendation: 'Textura equilibrada como arena fina, lista para preparar tu café de cada mañana sin complicaciones.',
    idealMethods: ['Cafetera eléctrica de filtro', 'Prensa Francesa', 'Cafetera de goteo / V60', 'Café de olla'],
    tasteProfile: 'Taza limpia, amable y constante todos los días. El punto exacto para la mayoría de cafeteras de casa.',
    waterRatio: '1 g café : 14-16 ml agua'
  },
  {
    id: 'fino',
    label: 'Molienda Fina',
    shortDesc: 'Moka italiana o máquina de presión',
    recommendation: 'Molienda más cerrada y suave al tacto, pensada para cafeteras donde el agua pasa rápido con presión.',
    idealMethods: ['Cafetera Italiana Moka', 'Máquina de espresso casera', 'AeroPress corto'],
    tasteProfile: 'Taza concentrada y con más cuerpo, ideal para tomar corta o acompañar con leche caliente.',
    waterRatio: '1 g café : 10-12 ml agua'
  }
];
