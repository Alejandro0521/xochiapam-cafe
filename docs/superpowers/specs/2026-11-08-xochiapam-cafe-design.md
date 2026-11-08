# Especificación de Diseño: Sitio Web de Xochiapam Casa

- **Fecha:** 2026-11-08
- **Estado:** Propuesto / En revisión
- **Marca:** Xochiapam Casa (Café de especialidad)
- **Origen:** San Pedro Sochiapam, Oaxaca, México
- **Lema:** *Tu café de cada día · De Oaxaca a tu taza*

---

## 1. Contexto y Objetivos

### 1.1 Contexto
Xochiapam Casa cuenta con un paquete de identidad visual normalizado (`xochiapam-casa`) que incluye maestros vectoriales, logotipos en múltiples formatos, paleta de colores oficial, tipografías Open Font License (`Fredoka` y `Nunito`), etiquetas de empaque para 250 g y 500 g, y lineamientos de dirección artística. 

Se requiere construir el sitio web oficial de la marca desde cero. El cliente especificó expresamente que la experiencia debe integrar **landing page, historia, orígenes, comparador interactivo de café y canal de compra**, evitando a toda costa la estética genérica de plantillas comerciales o generadas por IA.

### 1.2 Objetivos Principales
1. **Identidad Artesanal Editorial:** Proyectar la atmósfera cálida, humana y sensorial del café de altura de Oaxaca mediante la paleta oficial (Marfil, Cacao, Terracota, Crema) y las tipografías locales.
2. **Narrativa de Origen y Trazabilidad:** Comunicar con elegancia el origen de San Pedro Sochiapam, el cultivo a más de 1,400 msnm, la cosecha manual selectiva y el comercio directo con caficultores.
3. **Guía y Comparador Interactivo:** Brindar una herramienta visual y educativa que compare las presentaciones (250 g vs. 500 g) y los tipos de molienda (grano entero, media, fina) con sus respectivos métodos de preparación recomendados (prensa francesa, cafetera de goteo, moka/espresso).
4. **Boutique y Pedido sin Fricción:** Permitir al usuario configurar su café (tamaño, molienda, cantidad) y completar su pedido directamente vía un drawer nativo `<dialog>` conectado a WhatsApp con mensaje preformateado.
5. **Rendimiento y Cero Dependencias:** Construir la solución en HTML5 semántico, CSS3 moderno y JavaScript vanilla modular. Carga instantánea, accesible (WCAG AAA) y 100% funcional sin requerir compiladores pesados ni servidores Node.js.

### 1.3 No-Objetivos (YAGNI)
- Pasarelas bancarias complejas con registro de usuario obligatorio y contraseñas (el canal prioritario y de mayor conversión directa es WhatsApp).
- Frameworks pesados de JavaScript (React/Angular/Vue) innecesarios para una experiencia fluida de alta velocidad.
- Librerías externas de CSS de terceros que impongan estilos genéricos.

---

## 2. Sistema Visual y Tokens de Marca

El diseño implementa estrictamente las directrices del archivo `direccion-visual.md` y `colores.json`:

### 2.1 Paleta Cromática Oficial
| Nombre Token | Valor HEX | Rol en el Sistema | Ratio de Contraste |
| :--- | :--- | :--- | :--- |
| `--color-marfil` | `#FFFAF3` | Fondo base principal (luz natural, papel artesanal) | N/A (Fondo) |
| `--color-cacao` | `#4A2113` | Tipografía principal, títulos estructurados y bordes sutiles | 11.5:1 sobre Marfil (AAA) |
| `--color-terracota` | `#B54325` | Acento enérgico, botones principales (CTAs), badges y precios | 5.1:1 sobre Marfil (AA) |
| `--color-crema` | `#F3E3CA` | Fondos de descanso, tarjetas de producto y contenedores | 7.8:1 con Cacao (AAA) |

### 2.2 Tipografía
- **Titulares (`h1`, `h2`, `h3`, `h4`)**: `Fredoka Semibold` (fuente local en `assets/fonts/Fredoka-Semibold.ttf`). Aporta cercanía, formas redondeadas y una personalidad artesanal cálida.
- **Cuerpo y Datos de Lectura (`p`, `span`, `button`, `input`)**: `Nunito Regular` y `Nunito Bold` (fuentes locales en `assets/fonts/Nunito-Regular.ttf` y `Nunito-Bold.ttf`). Aporta claridad y legibilidad en pantallas de cualquier densidad.
- **Escala Fluida**: Textos adaptables mediante `clamp()` en CSS para transición suave móvil/escritorio.

### 2.3 Rasgo Distintivo de Marca: Onda Orgánica
En lugar de cortes horizontales rectos y predecibles, las transiciones entre secciones emplean divisores vectoriales en curva continua inspirados en el gesto curvo de las etiquetas de Xochiapam y el contorno de la sierra oaxaqueña.

---

## 3. Arquitectura de Componentes y Secciones

### 3.1 Header Flotante con Desenfoque Cálido (`<header class="site-header">`)
- **Logotipo:** SVG vectorial oficial `horizontal-color.svg` con enlace al inicio.
- **Navegación:** Enlaces con scroll suave hacia `#origen`, `#historia`, `#comparativa`, `#tienda`.
- **Botón de la Bolsa:** Acceso directo al drawer de pedido con badge numérico reactivo en terracota que muestra el conteo de artículos.

### 3.2 Sección 1: Hero Editorial (`#hero`)
- **Titular Principal:** *"Tu café de cada día"* (H1 en Fredoka).
- **Subtítulo:** *"De Oaxaca a tu taza. Café de especialidad cultivado en las alturas de San Pedro Sochiapam."*
- **Visual:** Render/composición del empaque oficial (`visualizacion-empaque.png` o etiquetas maestras vectoriales) con fondo curvo en crema.
- **Píldoras de Calidad (Badges):**
  - *100% Arábica de Altura*
  - *1,400+ msnm · Sierra Madre de Oaxaca*
  - *Cosecha Manual Selectiva*
- **Botones de Acción:**
  - Principal: *"Pedir Café"* (scroll hacia boutique).
  - Secundario: *"Conocer el Origen"* (scroll hacia historia).

### 3.3 Sección 2: Historia y Orígenes (`#origen`)
- **Narrativa Sensorial:** Descripción del microclima de San Pedro Sochiapam, la neblina constante, los suelos volcánicos ricos en minerales y el respeto por los tiempos de maduración del fruto.
- **Cuadrícula de Pilares de Valor (3 columnas responsivas):**
  1. *El Terroir:* La combinación de sombra natural y altitud que concentra la dulzura del grano.
  2. *El Proceso de Secado:* Selección cereza por cereza y secado en camas africanas para un perfil limpio y balanceado.
  3. *Comercio con Raíz:* Trato directo y digno con familias caficultoras oaxaqueñas.

### 3.4 Sección 3: Guía y Tabla Comparativa Interactiva (`#comparativa`)
- **Comparativa de Presentaciones (Bolsa 250 g vs. Bolsa 500 g):**
  - Tabla de atributos: Rendimiento en tazas, perfil de consumo (individual vs. hogar/oficina), conservación de aroma y precio relativo.
- **Selector Interactivo de Molienda:**
  - Pestañas táctiles:
    1. *Grano Entero:* Ideal para quienes disfrutan moler en casa con molino manual o eléctrico; máxima retención de aceites.
    2. *Molienda Media:* Textura granulada como sal marina; optimizada para cafetera de goteo, Chemex y prensa francesa.
    3. *Molienda Fina:* Textura fina y uniforme; optimizada para cafetera italiana Moka y máquina de espresso casera.
  - Al interactuar con cada pestaña, se actualizan dinámicamente las notas de cata y las proporciones recomendadas (ej. 1:15 para goteo, 1:12 para prensa).

### 3.5 Sección 4: Boutique y Configurador de Producto (`#tienda`)
- **Tarjetas de Producto Dinámicas:**
  - Opción A: *Café Xochiapam Casa — 250 g ($160 MXN)*
  - Opción B: *Café Xochiapam Casa — 500 g ($290 MXN)*
- **Controles de Configuración en Tarjeta:**
  - Selector de molienda (Grano, Media, Fina).
  - Selector de cantidad (+ / -).
  - Botón *"Agregar al pedido"* con feedback visual inmediato (pulso sutil en el botón del carrito).

### 3.6 Sección 5: Drawer Lateral Nativo de Pedido (`<dialog id="cart-drawer">`)
- **Implementación:** Elemento nativo `<dialog>` de HTML5 con backdrop translúcido en color cacao.
- **Comportamiento Moderno:** Soporte nativo para *light dismiss* (cerrar al hacer clic en el backdrop o con tecla `Escape`), bloqueando el scroll de fondo mientras esté abierto.
- **Contenido del Drawer:**
  - Listado de artículos con presentación, molienda elegida, precio unitario y selector de cantidad.
  - Botón de eliminación de artículo.
  - Cálculo instantáneo del subtotal.
  - Campos opcionales para personalizar el pedido: *Nombre* y *Ciudad/Dirección de Entrega*.
  - **Botón Primario de Checkout:** *"Pedir por WhatsApp"*, que abre enlace `https://wa.me/...` con el mensaje codificado.
  - **Botón Secundario de Respaldo:** *"Copiar datos del pedido"* (usa la Clipboard API nativa con toast de confirmación).

### 3.7 Sección 6: Footer Institucional (`<footer class="site-footer">`)
- Símbolo maestro oficial en versión cacao/color.
- Lema de marca: *"Tu café de cada día"*.
- Datos de trazabilidad: *San Pedro Sochiapam, Oaxaca, México*.
- Notas de autenticidad, aviso sobre moliendas y créditos de diseño.

---

## 4. Flujo de Datos y Lógica JavaScript

### 4.1 Módulos
```
js/
├── catalog.js     # Definición del catálogo de productos, moliendas y textos
├── cart.js        # Gestión del estado del carrito con persistencia en localStorage
└── app.js         # Inicialización, eventos del DOM, drawer nativo y generador WhatsApp
```

### 4.2 Esquema del Estado del Carrito (`cart.js`)
```typescript
interface CartItem {
  id: string;          // `${productId}-${grindId}`
  productId: string;   // 'xochiapam-250' | 'xochiapam-500'
  name: string;        // 'Café Xochiapam Casa 250g'
  presentation: string;// '250 g' | '500 g'
  grind: string;       // 'En Grano Entero' | 'Molienda Media' | 'Molienda Fina'
  price: number;       // 160 | 290
  quantity: number;
}
```

### 4.3 Formato del Mensaje de WhatsApp
```text
☕ *Nuevo Pedido — Café Xochiapam Casa*
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 1x Café 500g (Molienda Media) — $290 MXN
• 1x Café 250g (En Grano Entero) — $160 MXN
━━━━━━━━━━━━━━━━━━━━━━━━━━
*Total estimado:* $450 MXN

👤 *Cliente:* [Nombre del cliente]
📍 *Entrega:* [Ciudad / Dirección]
💬 *Origen:* Pedido web oficial Xochiapam
```

---

## 5. Accesibilidad, Rendimiento y Compatibilidad

1. **Accesibilidad (a11y):**
   - Ratios de contraste WCAG AAA para texto principal y AA para elementos destacados.
   - Navegación por teclado completa (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`).
   - Atributos ARIA necesarios en botones interactivos (`aria-expanded`, `aria-controls`, `aria-label`).
2. **Rendimiento:**
   - Cero dependencias externas ni CDNs de terceros; todas las fuentes y vectores se sirven en local.
   - Animaciones ejecutadas exclusivamente en propiedades transformadas por el compositor (`transform`, `opacity`) a 60 fps.
   - Respeto a `@media (prefers-reduced-motion: reduce)`.
3. **Compatibilidad:**
   - Navegadores modernos (Chrome, Safari, Firefox, Edge, iOS Safari, Android Chrome).
   - Uso de APIs Baseline modernas con fallbacks adecuados.

---

## 6. Plan de Verificación y Criterios de Aceptación

- [ ] **Identidad visual:** Fuentes `Fredoka` y `Nunito` cargadas correctamente; colores oficiales idénticos a `colores.json`.
- [ ] **Diseño no genérico:** Los divisores de onda orgánica y el estilo editorial diferencian claramente la web de una plantilla prediseñada.
- [ ] **Comparador interactivo:** El cambio de molienda y la tabla 250g vs 500g responden de forma inmediata y clara.
- [ ] **Configurador y Carrito:** Agregar artículos actualiza el badge del header y el contenido del drawer. Modificar cantidades recalcula el total al instante.
- [ ] **Drawer accesible:** El `<dialog>` abre y cierra con teclado (`Esc`), clic en el backdrop o botón de cerrar.
- [ ] **Checkout WhatsApp:** El enlace generado contiene todos los detalles del pedido formateados y listos para enviar.
- [ ] **Responsividad:** Experiencia impecable en pantallas de 375px (iPhone), 768px (iPad) y 1440px+ (Desktop).
