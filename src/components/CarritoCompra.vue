<script setup>
import { computed } from "vue";
import { formatoCOP, calcularValorConDescuento, calcularTotales } from "../utils/formato.js";

const props = defineProps({
  items: { type: Array, default: () => [] },
});

const emit = defineEmits(["incrementar", "decrementar", "eliminar", "finalizar-compra"]);

const vacio = computed(() => props.items.length === 0);
const totales = computed(() => calcularTotales(props.items));
</script>

<template>
  <aside id="carrito" class="carrito" aria-labelledby="titulo-carrito">
    <h2 id="titulo-carrito">Tu carrito</h2>

    <p v-if="vacio" class="carrito__vacio">
      <span class="carrito__emoji" aria-hidden="true">🛒</span>
      Tu carrito está vacío. Elige un producto del catálogo para empezar.
    </p>

    <TransitionGroup v-else tag="ul" name="fila" class="lista">
      <li v-for="{ producto, cantidad } in items" :key="producto.id" class="item">
        <img class="item__foto" :class="`tono-${producto.id % 4}`" :src="producto.imagen" alt="" />
        <div class="item__info">
          <p class="item__nombre">{{ producto.descripcion }}</p>
          <p class="item__precio">{{ formatoCOP(calcularValorConDescuento(producto)) }} c/u</p>
        </div>

        <div class="item__acciones">
          <div class="cantidad" role="group" :aria-label="`Cantidad de ${producto.descripcion}`">
            <button type="button" :disabled="cantidad <= 1" aria-label="Disminuir cantidad"
                    @click="emit('decrementar', producto.id)">−</button>
            <span :key="cantidad" class="cantidad__valor">{{ cantidad }}</span>
            <button type="button" aria-label="Aumentar cantidad"
                    @click="emit('incrementar', producto.id)">+</button>
          </div>
          <button class="quitar" type="button" :aria-label="`Eliminar ${producto.descripcion}`"
                  @click="emit('eliminar', producto.id)">✕</button>
        </div>
      </li>
    </TransitionGroup>

    <dl class="totales">
      <div><dt>Subtotal sin descuento</dt><dd>{{ formatoCOP(totales.sinDescuento) }}</dd></div>
      <div class="totales__desc"><dt>Descuentos</dt><dd>− {{ formatoCOP(totales.descuentos) }}</dd></div>
      <div class="totales__total"><dt>Total</dt><dd :key="totales.subtotal" class="cifra">{{ formatoCOP(totales.subtotal) }}</dd></div>
    </dl>

    <button class="btn carrito__final" type="button" :disabled="vacio" @click="emit('finalizar-compra')">
      Finalizar compra
    </button>
  </aside>
</template>

<style scoped>
.carrito {
  background: var(--blanco); border: var(--borde); border-radius: var(--radio);
  padding: 1.25rem; box-shadow: var(--sombra);
}
.carrito h2 { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 1rem; }
.carrito__vacio { color: var(--tinta-suave); padding: 0.5rem 0 1rem; text-align: center; }
.carrito__emoji { display: block; font-size: 2.6rem; animation: balanceo 2.4s ease-in-out infinite; }
@keyframes balanceo { 50% { transform: translateX(10px) rotate(8deg); } }

.lista { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.9rem; position: relative; }
.item { display: grid; grid-template-columns: 54px 1fr auto; gap: 0.75rem; align-items: center; }
.item__foto { width: 54px; height: 54px; border-radius: 10px; border: 2.5px solid var(--tinta); object-fit: contain; padding: 3px; }
.item__nombre { font-size: 0.88rem; font-weight: 600; line-height: 1.25; }
.item__precio { font-size: 0.8rem; color: var(--tinta-suave); }
.item__acciones { display: flex; align-items: center; gap: 0.4rem; }
.cantidad { display: flex; align-items: center; border: 2.5px solid var(--tinta); border-radius: 10px; overflow: hidden; }
.cantidad button { width: 28px; height: 28px; border: 0; background: var(--sol); font-weight: 800; font-size: 1rem; }
.cantidad button:hover:not(:disabled) { background: var(--menta); }
.cantidad button:disabled { background: #ece9f7; color: #9a93bd; }
.cantidad__valor { min-width: 28px; text-align: center; font-weight: 800; animation: salto-num 0.3s; }
@keyframes salto-num { 40% { transform: translateY(-5px) scale(1.25); } }
.quitar { border: 0; background: transparent; color: var(--coral); font-weight: 800; font-size: 1rem; padding: 0.25rem; transition: transform 0.15s; }
.quitar:hover { transform: rotate(90deg) scale(1.2); }

.totales { margin: 1.25rem 0 1rem; padding-top: 1rem; border-top: 3px dashed var(--tinta); display: grid; gap: 0.4rem; }
.totales div { display: flex; justify-content: space-between; font-size: 0.92rem; }
.totales dt, .totales dd { margin: 0; }
.totales__desc { color: #c4223a; font-weight: 600; }
.totales__total { font-size: 1.2rem !important; font-weight: 800; padding-top: 0.4rem; }
.cifra { animation: salto-num 0.35s; }
.carrito__final { width: 100%; }

/* Animación de filas: entran deslizando, salen aplastándose, el resto se reacomoda */
.fila-enter-active, .fila-leave-active, .fila-move { transition: all 0.35s ease; }
.fila-enter-from { opacity: 0; transform: translateX(40px) scale(0.9); }
.fila-leave-to { opacity: 0; transform: translateX(-40px) scale(0.9); }
.fila-leave-active { position: absolute; left: 0; right: 0; }
</style>
