<script setup>
import { ref, computed, onBeforeUnmount } from "vue";
import { formatoCOP, calcularValorConDescuento } from "../utils/formato.js";

const props = defineProps({
  producto: {
    type: Object,
    required: true,
    validator: (p) =>
      ["id", "imagen", "descripcion", "valor", "descuento"].every((campo) => campo in p) &&
      p.descuento >= 0 &&
      p.descuento <= 100,
  },
});

const emit = defineEmits(["agregar-al-carrito"]);

const tieneDescuento = computed(() => props.producto.descuento > 0);
const valorConDescuento = computed(() => calcularValorConDescuento(props.producto));
const ahorro = computed(() => props.producto.valor - valorConDescuento.value);
const tono = computed(() => `tono-${props.producto.id % 4}`);

// Estado SOLO visual y local (no es estado compartido): confirma el clic unos instantes.
const agregado = ref(false);
let temporizador;
function comprar() {
  emit("agregar-al-carrito", props.producto);
  agregado.value = true;
  clearTimeout(temporizador);
  temporizador = setTimeout(() => (agregado.value = false), 900);
}
onBeforeUnmount(() => clearTimeout(temporizador));
</script>

<template>
  <article class="tarjeta">
    <div class="tarjeta__foto" :class="tono">
      <img :src="producto.imagen" :alt="producto.descripcion" loading="lazy" />
      <span v-if="tieneDescuento" class="etiqueta">-{{ producto.descuento }}%</span>
    </div>

    <div class="tarjeta__cuerpo">
      <h3 class="tarjeta__titulo">{{ producto.descripcion }}</h3>

      <div class="precios">
        <p v-if="tieneDescuento" class="precio-tachado">
          <span class="solo-lectores">Precio regular </span>{{ formatoCOP(producto.valor) }}
        </p>
        <p v-else class="precio-regular-etiqueta">Precio regular</p>
        <p class="precio-final">{{ formatoCOP(valorConDescuento) }}</p>
        <p v-if="tieneDescuento" class="ahorro">Ahorras {{ formatoCOP(ahorro) }}</p>
      </div>

      <button class="btn tarjeta__boton" :class="{ 'btn--hecho': agregado }" type="button" @click="comprar">
        {{ agregado ? "¡Agregado!" : "Comprar" }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.tarjeta {
  display: flex; flex-direction: column;
  background: var(--blanco); border: var(--borde); border-radius: var(--radio);
  overflow: hidden; box-shadow: var(--sombra);
  /* --i llega desde ListaProductos (posición en la rejilla) y escalona la entrada */
  animation: entra 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2) backwards;
  animation-delay: calc(var(--i, 0) * 70ms);
  transition: transform 0.18s, box-shadow 0.18s;
}
.tarjeta:hover { transform: translate(-4px, -4px) rotate(-0.6deg); box-shadow: 10px 10px 0 var(--tinta); }
@keyframes entra {
  from { opacity: 0; transform: translateY(26px) scale(0.94); }
}

.tarjeta__foto { position: relative; aspect-ratio: 4 / 3; border-bottom: var(--borde); overflow: hidden; }
.tarjeta__foto img { width: 100%; height: 100%; object-fit: contain; padding: 0.5rem; transition: transform 0.35s cubic-bezier(0.3, 1.6, 0.5, 1); }
.tarjeta:hover .tarjeta__foto img { transform: scale(1.12) rotate(-5deg); }

.etiqueta {
  position: absolute; top: 12px; left: 12px;
  background: var(--coral); color: var(--tinta); font-weight: 800; font-size: 1rem;
  border: 2.5px solid var(--tinta); border-radius: 8px; padding: 0.1rem 0.55rem;
  transform: rotate(-9deg); box-shadow: 2px 2px 0 var(--tinta);
}
.tarjeta:hover .etiqueta { animation: meneo 0.5s; }
@keyframes meneo {
  0%, 100% { transform: rotate(-9deg); }
  30% { transform: rotate(6deg) scale(1.1); }
  60% { transform: rotate(-14deg) scale(1.1); }
}

.tarjeta__cuerpo { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; flex: 1; }
.tarjeta__titulo { font-size: 1rem; font-weight: 600; line-height: 1.3; }
.precios { margin-top: auto; }
.precio-tachado { color: var(--tinta-suave); text-decoration: line-through; font-size: 0.9rem; }
.precio-regular-etiqueta { color: var(--tinta-suave); font-size: 0.9rem; }
.precio-final { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; }
.ahorro {
  display: inline-block; margin-top: 0.2rem;
  background: var(--menta); border: 2px solid var(--tinta);
  font-size: 0.8rem; font-weight: 800; padding: 0 0.5rem; border-radius: 6px;
}
.tarjeta__boton { width: 100%; }
.btn--hecho { background: var(--menta); color: var(--tinta); animation: pulso 0.35s; }
@keyframes pulso { 50% { transform: scale(1.06); } }
</style>
