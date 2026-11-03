# TecnoStore · Tienda virtual con Vue 3 (props y emits)

Actividad de *Fundamentos de programación*. Página de venta con catálogo, carrito y factura,
construida con componentes que se comunican **solo con props (padre → hijo) y emits (hijo → padre)**.

## Cómo ejecutarlo

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm run build     # genera la carpeta dist/ para desplegar
```

Requisitos: Node.js LTS.

## Estructura

```
src/
├── App.vue                  ← ÚNICO dueño del estado compartido
├── main.js
├── style.css                ← variables de color y estilos base
├── utils/formato.js         ← funciones puras (moneda COP, descuento, totales, IVA)
└── components/
    ├── AppHeader.vue
    ├── ListaProductos.vue
    ├── ProductoCard.vue     (se repite con v-for dentro de ListaProductos)
    ├── CarritoCompra.vue
    ├── FacturaCompra.vue    (se muestra con v-if)
    └── AppFooter.vue
public/img/                  ← 8 ilustraciones SVG de los productos
```

## Estado en App.vue (lifting state up)

| Estado | Tipo | Para qué sirve |
|---|---|---|
| `productos` | `ref([])` | Catálogo: 8 productos, 6 con descuento. Cada uno trae además un campo `categoria` (dato extra, no cambia el contrato) |
| `carrito` | `ref([])` | `[{ producto, cantidad }]` |
| `mostrarFactura` | `ref(false)` | Decide si se muestra la factura |
| `itemsFactura` | `ref([])` | Copia del carrito al finalizar (la factura no cambia si luego se edita el carrito) |
| `busqueda`, `categoriaActiva`, `soloOfertas`, `precioMin`, `precioMax`, `orden` | `ref` | Estado de los filtros del catálogo |
| `consecutivo` / `numeroFactura` | `ref` / `computed` | Número de factura `FAC-0001`, `FAC-0002`… |
| `fechaFactura` | `ref("")` | Fecha en que se finalizó la compra |

## Contrato de comunicación

| Componente | Props | Emits |
|---|---|---|
| `AppHeader` | `nombreTienda` (String), `cantidadItems` (Number) | `ver-carrito` |
| `ListaProductos` | `productos` (Array) | `agregar-producto` (producto) |
| `ProductoCard` | `producto` (Object con id, imagen, descripcion, valor, descuento) | `agregar-al-carrito` (producto) |
| `CarritoCompra` | `items` (Array) | `incrementar` (id), `decrementar` (id), `eliminar` (id), `finalizar-compra` |
| `FacturaCompra` | `items` (Array), `numeroFactura` (String), `fecha` (String) | `nueva-compra` |
| `AppFooter` | `nombreTienda` (String), `anio` (Number), `contacto` (String) | — |

El contrato es **exactamente el del enunciado**: no se agregó ninguna prop, evento ni componente extra.

### Cadena de eventos al pulsar "Comprar"

```
ProductoCard  --agregar-al-carrito-->  ListaProductos  --agregar-producto-->  App.vue
                                       (lo reenvía)                          (actualiza carrito)
```

`ListaProductos` escucha el evento de cada tarjeta y lo vuelve a emitir hacia arriba. Es intencional:
muestra por qué en apps grandes se usa un manejo centralizado de estado.

## Fórmulas

- `valorConDescuento = Math.round(valor × (1 − descuento / 100))` → `computed` en `ProductoCard`.
- Subtotal sin descuento = Σ (valor × cantidad).
- Descuentos = subtotal sin descuento − Σ (valorConDescuento × cantidad).
- Subtotal = Σ (valorConDescuento × cantidad).
- IVA = `Math.round(subtotal × 0.19)`.  Total a pagar = subtotal + IVA.

Comprobación con el ejemplo de la maqueta (portátil ×1, audífonos ×2, mouse ×1):
sin descuento $3.834.000 · descuentos $663.850 · subtotal $3.170.150 · IVA $602.329 · **total $3.772.479**.
El resultado coincide con la Figura 1 del enunciado.

## Filtros del catálogo (estilo tienda en línea)

El enunciado no menciona ni prohíbe filtros, así que se agregaron **sin tocar el contrato de props y emits**:

- Búsqueda por texto (ignora tildes y mayúsculas: "audifonos" encuentra "Audífonos").
- Categorías (chips): Todas, Computadores, Celulares, Audio, Wearables, Accesorios.
- Precio mínimo y máximo (se compara con el **valor con descuento**, que es lo que paga el cliente).
- Interruptor "Solo ofertas" y orden (relevancia, menor precio, mayor precio, mayor descuento).
- Botón "Limpiar filtros" (aparece solo cuando hay algún filtro activo) y mensaje cuando no hay resultados.

Dónde vive cada cosa: el **estado** de los filtros y el `computed productosFiltrados` están en `App.vue`
(regla: el estado compartido vive en App.vue). `ListaProductos` sigue recibiendo solo `productos`; simplemente le
llega la lista ya filtrada.

## Factura como pantalla aparte (y por qué no con Nuxt)

La factura se muestra como una **pantalla independiente** con su propia dirección (`#factura`): al finalizar la
compra se oculta la tienda y se muestra solo la factura. El botón **Atrás** del navegador vuelve a la tienda, y los
enlaces del encabezado (Inicio, Catálogo, Contacto) y el botón Carrito también te sacan de la factura.
"Nueva compra" vacía el carrito y limpia la dirección.

No se hizo con una página de Nuxt porque el enunciado fija como herramientas Node.js, Vite y Vue 3 (Nuxt no está
en la lista) y estructura la app alrededor de `App.vue`; Nuxt la reemplaza por `app.vue` y `pages/`. La misma idea
(una "página" de factura con URL propia) se logra con solo Vue y la API estándar del navegador
(`location.hash` + evento `hashchange`), sin librerías ni variables globales de la aplicación.

## Navegación y secciones

Enlaces de ancla (HTML puro): **Inicio** (portada animada dentro de `App.vue`), **Catálogo** (filtros +
`ListaProductos`) y **Contacto** (`AppFooter`). El botón Carrito usa el evento `ver-carrito`.

## Tema visual y animaciones

Estilo "pegatina pop": bordes gruesos de tinta índigo, sombras duras desplazadas, colores vivos
(violeta, coral, sol, menta, cielo) y tipografía Bricolage Grotesque (Google Fonts; si no hay internet usa
la fuente del sistema). Animaciones solo con CSS y `<Transition>`/`<TransitionGroup>` de Vue:

- Filtros: chips que rebotan al activarse, interruptor animado y tarjetas que se reacomodan con deslizamiento.
- Portada: entrada escalonada del texto, pegatinas de productos flotando y cinta de texto en movimiento.
- Tarjetas: entrada escalonada (`--i` desde `ListaProductos`), elevación y giro al pasar el cursor,
  etiqueta de descuento que se menea, botón que confirma con "¡Agregado!".
- Encabezado: la insignia del carrito "salta" cada vez que cambia la cantidad.
- Carrito: las filas entran, salen y se reacomodan; los números rebotan al cambiar.
- Tienda ↔ factura con transición, y factura con sello "¡Gracias por tu compra!", filas escalonadas y confeti.
- Se respeta `prefers-reduced-motion` (se desactivan las animaciones).

## Decisiones de diseño (por si el docente pregunta)

1. **Las props nunca se modifican.** El carrito se actualiza en `App.vue` reemplazando el arreglo con
   `map` / `filter` / spread, no mutando objetos en sitio.
2. **Producto repetido = suma cantidad**, no duplica la fila (`agregarAlCarrito` en `App.vue`).
3. **La cantidad no baja de 1.** El botón "−" se deshabilita en 1; para quitar el producto se usa ✕.
4. **Carrito vacío:** muestra un mensaje y "Finalizar compra" queda deshabilitado.
5. **La factura es una copia** (`itemsFactura`) del carrito al finalizar. "Nueva compra" vacía el carrito,
   oculta la factura y aumenta el consecutivo.
6. **`utils/formato.js`** contiene funciones puras (sin estado), por eso no viola la prohibición de variables
   globales. Evita repetir el cálculo en carrito y factura.
7. **Estado local solo visual:** `ProductoCard` usa un `ref` interno (`agregado`) únicamente para mostrar
   "¡Agregado!" un instante. No es estado compartido ni modifica props.
8. **Ilustraciones SVG propias** (estilo cartoon, dibujadas a mano en código) en `public/img/`: sin derechos de autor, sin depender de internet y sin librerías.
9. Los productos sin descuento (`descuento: 0`) no muestran etiqueta ni precio tachado.

## Cumplimiento de restricciones

- `<script setup>` con `defineProps` y `defineEmits` explícitos en todos los componentes.
- Sin Pinia, Vuex, provide/inject, event bus ni variables globales.
- Eventos en kebab-case; componentes en PascalCase.
- Todos los `v-for` con `:key` único (`producto.id`).
- Moneda con `Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })` (más `minimumFractionDigits/maximumFractionDigits: 0` para mostrar `$ 2.464.150` como en la maqueta; sin esto algunos navegadores agregan `,00`).
- Diseño responsive: rejilla adaptable, carrito lateral fijo en computador y debajo en celular/tableta.
- Sin librerías extra: solo `vue` (y `vite` + `@vitejs/plugin-vue` como herramientas). Sin vue-router ni Nuxt.
- Accesibilidad básica: foco visible, `aria-label` en botones de iconos, `prefers-reduced-motion`.

## Correspondencia con la rúbrica

| Criterio | Dónde se cumple |
|---|---|
| Descomposición (15 %) | Los 6 componentes pedidos, cada uno con una sola responsabilidad |
| Props (20 %) | `defineProps` con tipo + `required`/`default` (+ `validator` en `ProductoCard`) |
| Emits (20 %) | `defineEmits` en kebab-case con payload; reenvío en `ListaProductos` |
| Tarjeta (10 %) | Imagen, descripción, valor tachado, etiqueta, valor con descuento (`computed`), botón |
| Carrito (20 %) | Agrega sin duplicar, +/−/eliminar, vacío, totales, contador en el encabezado |
| Factura (10 %) | Número, fecha, detalle, descuentos, IVA 19 %, total, "Nueva compra" |
| Interfaz (5 %) | Responsive y en COP |

## Lo que falta de tu parte (entregables)

1. **Crear el repositorio en GitHub** y subir el código.
2. **Commits por fases** (el enunciado pide evidencia del avance). Sugerencia de mensajes:
   - `feat: fase 1 - proyecto Vite y arreglo de productos en App.vue`
   - `feat: fase 2 - AppHeader, AppFooter, ProductoCard y ListaProductos con props`
   - `feat: fase 3 - botón Comprar con emits y cadena de eventos`
   - `feat: fase 4 - carrito con cantidades, eliminar y totales`
   - `feat: fase 5 - factura con IVA y total a pagar`
   - `feat: fase 6 - nueva compra, README y pruebas finales`

   Ve haciendo cada commit a medida que repasas cada fase, así el historial refleja tu trabajo real.
3. **(Opcional)** Desplegar en Netlify, Vercel o GitHub Pages (`npm run build` → carpeta `dist/`).
4. **Video de sustentación** (lo menciona la fase 6): ten claro explicar la cadena de eventos y por qué
   las props no se modifican.

## Autores

Camilo de la cruz, Brayan taime, Keyner ramos, jesus saez, Edward sibaja.
