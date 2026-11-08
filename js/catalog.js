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
