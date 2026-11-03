<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import AppHeader from "./components/AppHeader.vue";
import ListaProductos from "./components/ListaProductos.vue";
import CarritoCompra from "./components/CarritoCompra.vue";
import FacturaCompra from "./components/FacturaCompra.vue";
import AppFooter from "./components/AppFooter.vue";
import { calcularValorConDescuento } from "./utils/formato.js";

// ───────────── ESTADO COMPARTIDO (lifting state up) ─────────────
// Solo App.vue guarda estos datos; los hijos los reciben por props y piden cambios con emits.
const img = (nombre) => `${import.meta.env.BASE_URL}img/${nombre}.svg`;

const productos = ref([
  { id: 1, imagen: img("portatil"), descripcion: 'Portátil 14" Ryzen 5, 16 GB RAM', valor: 2899000, descuento: 15, categoria: "Computadores" },
  { id: 2, imagen: img("smartphone"), descripcion: "Smartphone 128 GB, cámara 50 MP", valor: 1150000, descuento: 10, categoria: "Celulares" },
  { id: 3, imagen: img("audifonos"), descripcion: "Audífonos inalámbricos con cancelación de ruido", valor: 420000, descuento: 25, categoria: "Audio" },
  { id: 4, imagen: img("reloj"), descripcion: "Reloj inteligente deportivo con GPS", valor: 560000, descuento: 0, categoria: "Wearables" },
  { id: 5, imagen: img("mouse"), descripcion: "Mouse ergonómico inalámbrico", valor: 95000, descuento: 20, categoria: "Accesorios" },
  { id: 6, imagen: img("tablet"), descripcion: 'Tablet 10" 64 GB con lápiz', valor: 980000, descuento: 5, categoria: "Computadores" },
  { id: 7, imagen: img("teclado"), descripcion: "Teclado mecánico inalámbrico, switches rojos", valor: 245000, descuento: 30, categoria: "Accesorios" },
  { id: 8, imagen: img("parlante"), descripcion: "Parlante Bluetooth resistente al agua", valor: 189000, descuento: 0, categoria: "Audio" },
]);

const carrito = ref([]); // [{ producto, cantidad }]
const mostrarFactura = ref(false);
const itemsFactura = ref([]); // copia del carrito al finalizar: la factura no cambia si luego se edita el carrito
const consecutivo = ref(1);
const fechaFactura = ref("");

// Estado de los filtros: también vive aquí, los hijos solo reciben la lista ya filtrada.
const busqueda = ref("");
const categoriaActiva = ref("Todas");
const soloOfertas = ref(false);
const precioMin = ref("");
const precioMax = ref("");
const orden = ref("relevancia");

const nombreTienda = "TecnoStore";
const anio = new Date().getFullYear();
const contacto = "contacto@tecnostore.edu.co";

// ───────────── VALORES DERIVADOS ─────────────
const cantidadItems = computed(() => carrito.value.reduce((suma, item) => suma + item.cantidad, 0));
const numeroFactura = computed(() => `FAC-${String(consecutivo.value).padStart(4, "0")}`);
const mayorDescuento = computed(() => Math.max(0, ...productos.value.map((p) => p.descuento)));
const destacados = computed(() => productos.value.slice(0, 3));
const categorias = computed(() => ["Todas", ...new Set(productos.value.map((p) => p.categoria))]);

// Quita tildes y mayúsculas para que "audifonos" encuentre "Audífonos".
const normalizar = (texto) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const hayValor = (v) => v !== "" && v !== null && v !== undefined;

const productosFiltrados = computed(() => {
  const texto = normalizar(busqueda.value.trim());
  const lista = productos.value.filter((p) => {
    const final = calcularValorConDescuento(p); // el precio se compara con lo que realmente paga el cliente
    return (
      (!texto || normalizar(`${p.descripcion} ${p.categoria}`).includes(texto)) &&
      (categoriaActiva.value === "Todas" || p.categoria === categoriaActiva.value) &&
      (!soloOfertas.value || p.descuento > 0) &&
      (!hayValor(precioMin.value) || final >= precioMin.value) &&
      (!hayValor(precioMax.value) || final <= precioMax.value)
    );
  });
  const ordenar = {
    "precio-asc": (a, b) => calcularValorConDescuento(a) - calcularValorConDescuento(b),
    "precio-desc": (a, b) => calcularValorConDescuento(b) - calcularValorConDescuento(a),
    descuento: (a, b) => b.descuento - a.descuento,
  }[orden.value];
  return ordenar ? [...lista].sort(ordenar) : lista;
});

const hayFiltros = computed(
  () =>
    busqueda.value !== "" ||
    categoriaActiva.value !== "Todas" ||
    soloOfertas.value ||
    hayValor(precioMin.value) ||
    hayValor(precioMax.value) ||
    orden.value !== "relevancia"
);

function limpiarFiltros() {
  busqueda.value = "";
  categoriaActiva.value = "Todas";
  soloOfertas.value = false;
  precioMin.value = "";
  precioMax.value = "";
  orden.value = "relevancia";
}

const frases = [
  "Compra en pocos clics",
  "Precios en pesos colombianos",
  "Factura al instante",
  "Descuentos en tecnología",
];
const cinta = [...frases, ...frases];

const zonaCarrito = ref(null);

// ───────────── MANEJADORES DE EVENTOS ─────────────
// Se reemplaza el arreglo (map/filter) en lugar de mutar objetos en sitio.
function agregarAlCarrito(producto) {
  const existe = carrito.value.some((item) => item.producto.id === producto.id);
  carrito.value = existe
    ? carrito.value.map((item) =>
        item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    : [...carrito.value, { producto, cantidad: 1 }];
}

function incrementar(id) {
  carrito.value = carrito.value.map((item) =>
    item.producto.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
  );
}

function decrementar(id) {
  // La cantidad nunca baja de 1; para quitar el producto se usa "eliminar".
  carrito.value = carrito.value.map((item) =>
    item.producto.id === id && item.cantidad > 1 ? { ...item, cantidad: item.cantidad - 1 } : item
  );
}

function eliminar(id) {
  carrito.value = carrito.value.filter((item) => item.producto.id !== id);
}

// ───────────── FACTURA COMO PANTALLA APARTE ─────────────
// La factura tiene su propia "página" (#factura) sin librerías: el botón Atrás del navegador vuelve a la tienda
// y los enlaces del encabezado (#inicio, #catalogo, #contacto) también te sacan de la factura.
function finalizarCompra() {
  if (carrito.value.length === 0) return;
  itemsFactura.value = carrito.value.map((item) => ({ ...item }));
  fechaFactura.value = new Date().toLocaleDateString("es-CO");
  mostrarFactura.value = true;
  location.hash = "factura";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function nuevaCompra() {
  carrito.value = [];
  itemsFactura.value = [];
  mostrarFactura.value = false;
  consecutivo.value += 1;
  history.replaceState(null, "", location.pathname + location.search); // quita #factura de la dirección
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function alCambiarHash() {
  const estabaEnFactura = mostrarFactura.value;
  mostrarFactura.value = location.hash === "#factura" && itemsFactura.value.length > 0;
  if (estabaEnFactura && !mostrarFactura.value) {
    // Salimos de la factura hacia una sección: esperamos a que la tienda se dibuje y bajamos hasta ella.
    await nextTick();
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function verCarrito() {
  if (mostrarFactura.value) {
    mostrarFactura.value = false;
    history.replaceState(null, "", location.pathname + location.search);
    await nextTick();
  }
  zonaCarrito.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

onMounted(() => window.addEventListener("hashchange", alCambiarHash));
onBeforeUnmount(() => window.removeEventListener("hashchange", alCambiarHash));
</script>

<template>
  <AppHeader
    :nombre-tienda="nombreTienda"
    :cantidad-items="cantidadItems"
    @ver-carrito="verCarrito"
  />

  <main class="principal">
    <Transition name="pagina" mode="out-in">
      <div v-if="mostrarFactura" key="factura" class="zona-factura">
        <FacturaCompra
          :items="itemsFactura"
          :numero-factura="numeroFactura"
          :fecha="fechaFactura"
          @nueva-compra="nuevaCompra"
        />
      </div>

      <div v-else key="tienda">
    <!-- Portada: solo markup y estilos, sin props ni eventos nuevos -->
        <section id="inicio" class="hero" aria-labelledby="titulo-hero">
          <div class="hero__cuerpo">
            <div class="hero__texto">
              <p class="hero__aviso">Ofertas de {{ nombreTienda }} · hasta {{ mayorDescuento }} % menos</p>
              <h1 id="titulo-hero">Tecnología con descuento, sin vueltas.</h1>
              <p class="hero__sub">
                Portátiles, audífonos y más. Elige, suma al carrito y recibe tu factura al instante.
              </p>
              <a class="btn btn--claro hero__boton" href="#catalogo">Ver el catálogo</a>
            </div>

            <div class="escena" aria-hidden="true">
              <span class="forma forma--1"></span>
              <span class="forma forma--2"></span>
              <div
                v-for="(producto, i) in destacados"
                :key="producto.id"
                class="pegatina"
                :class="[`pegatina--${i + 1}`, `tono-${producto.id % 4}`]"
              >
                <img :src="producto.imagen" alt="" />
              </div>
            </div>
          </div>

          <div class="cinta" aria-hidden="true">
            <div class="cinta__pista">
              <span v-for="(frase, i) in cinta" :key="i">{{ frase }} <b>✦</b></span>
            </div>
          </div>
        </section>

        <div class="disposicion">
          <div id="catalogo" class="columna">
            <section class="filtros" aria-label="Filtros del catálogo">
              <label class="busqueda">
                <span class="solo-lectores">Buscar productos</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
                </svg>
                <input v-model="busqueda" type="search" placeholder="Busca portátil, audífonos, mouse…" />
              </label>

              <div class="chips" role="group" aria-label="Categorías">
                <button
                  v-for="categoria in categorias"
                  :key="categoria"
                  type="button"
                  class="chip"
                  :class="{ 'chip--activo': categoria === categoriaActiva }"
                  :aria-pressed="categoria === categoriaActiva"
                  @click="categoriaActiva = categoria"
                >
                  {{ categoria }}
                </button>
              </div>

              <div class="filtros__fila">
                <label class="campo">
                  <span>Precio mínimo</span>
                  <input v-model.number="precioMin" type="number" min="0" step="50000" inputmode="numeric" placeholder="$ 0" />
                </label>
                <label class="campo">
                  <span>Precio máximo</span>
                  <input v-model.number="precioMax" type="number" min="0" step="50000" inputmode="numeric" placeholder="Sin límite" />
                </label>
                <label class="campo">
                  <span>Ordenar por</span>
                  <select v-model="orden">
                    <option value="relevancia">Relevancia</option>
                    <option value="precio-asc">Menor precio</option>
                    <option value="precio-desc">Mayor precio</option>
                    <option value="descuento">Mayor descuento</option>
                  </select>
                </label>
                <label class="interruptor">
                  <input v-model="soloOfertas" type="checkbox" />
                  <span class="interruptor__caja" aria-hidden="true"></span>
                  Solo ofertas
                </label>
                <button v-if="hayFiltros" class="btn btn--claro filtros__limpiar" type="button" @click="limpiarFiltros">
                  Limpiar filtros
                </button>
              </div>
            </section>

            <ListaProductos :productos="productosFiltrados" @agregar-producto="agregarAlCarrito" />
          </div>

          <div ref="zonaCarrito" class="disposicion__carrito">
            <CarritoCompra
              :items="carrito"
              @incrementar="incrementar"
              @decrementar="decrementar"
              @eliminar="eliminar"
              @finalizar-compra="finalizarCompra"
            />
          </div>
        </div>
      </div>
    </Transition>
  </main>

  <AppFooter :nombre-tienda="nombreTienda" :anio="anio" :contacto="contacto" />
</template>

<style scoped>
.principal { max-width: 1200px; margin: 0 auto; padding: 2rem 1.25rem 0; }
.zona-factura { margin-top: 3rem; }
.disposicion { display: grid; gap: 2.5rem; grid-template-columns: 1fr; align-items: start; }
.disposicion__carrito { scroll-margin-top: 90px; padding-right: 6px; padding-bottom: 6px; }

@media (min-width: 980px) {
  .disposicion { grid-template-columns: minmax(0, 1fr) 350px; }
  .disposicion__carrito { position: sticky; top: 90px; }
}


/* ───── Portada ───── */
.hero {
  background: var(--violeta); color: #fff;
  border: var(--borde); border-radius: 24px; box-shadow: 8px 8px 0 var(--tinta);
  overflow: hidden; margin-bottom: 3rem;
}
.hero__cuerpo {
  display: grid; grid-template-columns: 1.1fr 1fr; gap: 1rem; align-items: center;
  padding: clamp(1.5rem, 4vw, 3rem);
}
.hero__aviso {
  display: inline-block; background: var(--sol); color: var(--tinta);
  border: 2.5px solid var(--tinta); border-radius: 999px;
  padding: 0.15rem 0.9rem; font-weight: 800; font-size: 0.9rem; margin-bottom: 1rem;
  animation: baja 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.3) both;
}
.hero h1 {
  font-size: clamp(2.2rem, 5.2vw, 3.9rem); font-weight: 800;
  line-height: 1.02; letter-spacing: -0.035em; max-width: 14ch;
  animation: baja 0.6s 0.1s cubic-bezier(0.2, 0.9, 0.3, 1.3) both;
}
.hero__sub { margin: 1rem 0 1.5rem; max-width: 42ch; font-size: 1.1rem; color: #ece8ff; animation: baja 0.6s 0.2s both; }
.hero__boton { animation: baja 0.6s 0.3s both; }
@keyframes baja { from { opacity: 0; transform: translateY(-18px); } }

/* Escena con pegatinas flotantes */
.escena { position: relative; min-height: 320px; }
.pegatina {
  position: absolute; width: 46%; aspect-ratio: 1;
  border: var(--borde); border-radius: 22px; box-shadow: 6px 6px 0 var(--tinta);
  display: grid; place-items: center; padding: 0.6rem;
  animation: flota 4.5s ease-in-out infinite;
}
.pegatina img { width: 100%; }
.pegatina--1 { top: 2%; left: 4%; --giro: -8deg; }
.pegatina--2 { top: 8%; right: 0; --giro: 7deg; animation-delay: -1.5s; }
.pegatina--3 { bottom: 0; left: 28%; --giro: -3deg; animation-delay: -3s; }
@keyframes flota {
  0%, 100% { transform: translateY(0) rotate(var(--giro)); }
  50% { transform: translateY(-14px) rotate(calc(var(--giro) * -0.5)); }
}
.forma { position: absolute; border: var(--borde); border-radius: 50%; }
.forma--1 { width: 90px; height: 90px; background: var(--coral); top: 52%; left: 0; animation: gira 14s linear infinite; border-radius: 30% 70% 60% 40%; }
.forma--2 { width: 60px; height: 60px; background: var(--menta); top: 0; left: 46%; animation: flota 5s ease-in-out infinite; --giro: 0deg; }
@keyframes gira { to { transform: rotate(360deg); } }

/* Cinta con texto que se desplaza */
.cinta { background: var(--tinta); color: var(--sol); border-top: var(--borde); overflow: hidden; }
.cinta__pista { display: flex; width: max-content; animation: desplaza 30s linear infinite; }
.cinta__pista span { padding: 0.55rem 1.4rem; font-weight: 800; white-space: nowrap; }
.cinta__pista b { color: var(--coral); margin-left: 1.4rem; }
@keyframes desplaza { to { transform: translateX(-50%); } }

@media (max-width: 800px) {
  .hero__cuerpo { grid-template-columns: 1fr; }
  .escena { min-height: 260px; }
}

/* Transición entre tienda y factura */
.pagina-enter-active { transition: opacity 0.35s, transform 0.45s cubic-bezier(0.2, 1.2, 0.4, 1); }
.pagina-leave-active { transition: opacity 0.18s, transform 0.18s; }
.pagina-enter-from { opacity: 0; transform: translateY(24px) scale(0.98); }
.pagina-leave-to { opacity: 0; transform: translateY(-10px); }

/* ───── Filtros ───── */
.columna { min-width: 0; }
.filtros {
  background: var(--blanco); border: var(--borde); border-radius: var(--radio);
  box-shadow: var(--sombra); padding: 1.1rem; margin: 0 6px 2rem 0;
  display: grid; gap: 1rem;
}
.busqueda {
  display: flex; align-items: center; gap: 0.6rem;
  border: var(--borde); border-radius: 14px; padding: 0 0.9rem; background: var(--fondo);
  transition: box-shadow 0.15s, transform 0.15s;
}
.busqueda:focus-within { box-shadow: var(--sombra-s); transform: translate(-2px, -2px); background: #fff; }
.busqueda input {
  flex: 1; min-width: 0; border: 0; background: transparent; padding: 0.75rem 0;
  font: inherit; font-weight: 600; color: var(--tinta); outline: none;
}
.busqueda input::placeholder { color: var(--tinta-suave); font-weight: 400; }

.chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.chip {
  border: 2.5px solid var(--tinta); border-radius: 999px; background: var(--blanco);
  padding: 0.25rem 0.9rem; font-weight: 700; color: var(--tinta);
  transition: transform 0.12s, box-shadow 0.12s, background 0.12s;
}
.chip:hover { transform: translateY(-2px); box-shadow: 0 3px 0 var(--tinta); }
.chip--activo { background: var(--sol); box-shadow: 3px 3px 0 var(--tinta); animation: pulso-chip 0.3s; }
@keyframes pulso-chip { 50% { transform: scale(1.08); } }

.filtros__fila { display: flex; flex-wrap: wrap; gap: 0.9rem 1.1rem; align-items: flex-end; }
.campo { display: grid; gap: 0.2rem; font-size: 0.8rem; font-weight: 700; color: var(--tinta-suave); }
.campo input, .campo select {
  font: inherit; font-weight: 600; color: var(--tinta); background: var(--fondo);
  border: 2.5px solid var(--tinta); border-radius: 10px; padding: 0.45rem 0.65rem; width: 150px;
}
.campo input:focus-visible, .campo select:focus-visible { background: #fff; }

.interruptor { display: flex; align-items: center; gap: 0.55rem; font-weight: 700; cursor: pointer; padding-bottom: 0.4rem; }
.interruptor input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.interruptor__caja {
  width: 44px; height: 26px; border: 2.5px solid var(--tinta); border-radius: 999px; background: var(--blanco);
  position: relative; transition: background 0.2s;
}
.interruptor__caja::after {
  content: ""; position: absolute; top: 2px; left: 2px; width: 17px; height: 17px;
  border: 2.5px solid var(--tinta); border-radius: 50%; background: var(--sol);
  transition: transform 0.25s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.interruptor input:checked + .interruptor__caja { background: var(--menta); }
.interruptor input:checked + .interruptor__caja::after { transform: translateX(18px); background: var(--blanco); }
.interruptor input:focus-visible + .interruptor__caja { outline: 4px solid var(--violeta); outline-offset: 3px; }

.filtros__limpiar { padding: 0.4rem 0.9rem; font-size: 0.9rem; animation: entra-limpiar 0.3s cubic-bezier(0.3, 1.6, 0.5, 1); }
@keyframes entra-limpiar { from { opacity: 0; transform: scale(0.7); } }

@media (max-width: 560px) { .campo input, .campo select { width: 100%; } .campo { flex: 1 1 140px; } }
</style>
