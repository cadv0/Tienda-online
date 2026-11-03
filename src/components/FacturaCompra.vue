<script setup>
import { computed } from "vue";
import { formatoCOP, calcularValorConDescuento, calcularTotales, TASA_IVA } from "../utils/formato.js";

const props = defineProps({
  items: { type: Array, required: true },
  numeroFactura: { type: String, required: true },
  fecha: { type: String, required: true },
});

const emit = defineEmits(["nueva-compra"]);

const totales = computed(() => calcularTotales(props.items));
const porcentajeIva = Math.round(TASA_IVA * 100);

// Confeti decorativo (valores fijos para que no cambie entre renders)
const colores = ["var(--coral)", "var(--sol)", "var(--menta)", "var(--cielo)", "var(--violeta)"];
const confeti = Array.from({ length: 22 }, (_, i) => ({
  i,
  izquierda: `${(i * 37) % 100}%`,
  color: colores[i % colores.length],
  retraso: `${(i % 7) * 0.12}s`,
  duracion: `${1.6 + (i % 5) * 0.25}s`,
}));
</script>

<template>
  <section class="factura" aria-labelledby="titulo-factura">
    <div class="confeti" aria-hidden="true">
      <span
        v-for="c in confeti"
        :key="c.i"
        :style="{ left: c.izquierda, background: c.color, animationDelay: c.retraso, animationDuration: c.duracion }"
      ></span>
    </div>

    <header class="factura__cabecera">
      <div>
        <h2 id="titulo-factura">Factura de compra</h2>
        <p class="factura__empresa">TecnoStore S.A.S. · NIT 900.000.000-0</p>
      </div>
      <div class="factura__meta">
        <p>N.º <strong>{{ numeroFactura }}</strong></p>
        <p>Fecha: {{ fecha }}</p>
      </div>
      <p class="sello" aria-hidden="true">¡Gracias por tu compra!</p>
    </header>

    <div class="factura__tabla-caja">
      <table class="tabla">
        <thead>
          <tr>
            <th scope="col">Descripción</th>
            <th scope="col" class="num">Cant.</th>
            <th scope="col" class="num">Valor unit.</th>
            <th scope="col" class="num">Desc.</th>
            <th scope="col" class="num">Valor c/desc.</th>
            <th scope="col" class="num">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="({ producto, cantidad }, indice) in items" :key="producto.id" :style="{ '--i': indice }">
            <td>{{ producto.descripcion }}</td>
            <td class="num">{{ cantidad }}</td>
            <td class="num">{{ formatoCOP(producto.valor) }}</td>
            <td class="num">{{ producto.descuento }}%</td>
            <td class="num">{{ formatoCOP(calcularValorConDescuento(producto)) }}</td>
            <td class="num"><strong>{{ formatoCOP(calcularValorConDescuento(producto) * cantidad) }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <dl class="resumen">
      <div><dt>Total sin descuento</dt><dd>{{ formatoCOP(totales.sinDescuento) }}</dd></div>
      <div class="resumen__desc"><dt>Total descuentos</dt><dd>− {{ formatoCOP(totales.descuentos) }}</dd></div>
      <div><dt>Subtotal</dt><dd>{{ formatoCOP(totales.subtotal) }}</dd></div>
      <div><dt>IVA ({{ porcentajeIva }} %)</dt><dd>{{ formatoCOP(totales.iva) }}</dd></div>
      <div class="resumen__total"><dt>Total a pagar</dt><dd>{{ formatoCOP(totales.total) }}</dd></div>
    </dl>

    <button class="btn btn--claro" type="button" @click="emit('nueva-compra')">Nueva compra</button>
  </section>
</template>

<style scoped>
.factura {
  position: relative; overflow: hidden;
  background: var(--blanco); border: var(--borde); border-radius: var(--radio);
  padding: 1.5rem; box-shadow: 8px 8px 0 var(--tinta);
  display: grid; gap: 1.25rem; margin-bottom: 3rem;
}
.factura__cabecera { position: relative; display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.factura__cabecera h2 { font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 800; letter-spacing: -0.03em; }
.factura__empresa { color: var(--tinta-suave); font-size: 0.92rem; }
.factura__meta { text-align: right; font-size: 0.92rem; color: var(--tinta-suave); }
.factura__meta strong { color: var(--tinta); }

/* Sello que "golpea" la factura al aparecer */
.sello {
  position: absolute; right: 9rem; top: -0.2rem;
  border: 4px solid var(--coral); color: var(--coral);
  border-radius: 10px; padding: 0.15rem 0.8rem; font-weight: 800; font-size: 1.1rem;
  transform: rotate(-10deg);
  animation: sello 0.5s 0.5s cubic-bezier(0.2, 1.8, 0.4, 1) backwards;
}
@keyframes sello { from { opacity: 0; transform: rotate(-30deg) scale(2.6); } }
@media (max-width: 700px) { .sello { position: static; align-self: flex-start; } }

.factura__tabla-caja { overflow-x: auto; border-top: 3px solid var(--tinta); border-bottom: 3px dashed var(--tinta); }
.tabla { width: 100%; min-width: 640px; border-collapse: collapse; font-size: 0.92rem; }
.tabla th { text-align: left; font-size: 0.82rem; color: var(--tinta-suave); padding: 0.7rem 0.5rem; }
.tabla td { padding: 0.7rem 0.5rem; border-top: 1.5px solid #e4def7; }
.tabla tbody tr { animation: fila-entra 0.4s backwards; animation-delay: calc(0.3s + var(--i, 0) * 0.1s); }
@keyframes fila-entra { from { opacity: 0; transform: translateX(-20px); } }
.num { text-align: right !important; white-space: nowrap; }

.resumen { margin: 0 0 0 auto; width: min(100%, 340px); display: grid; gap: 0.35rem; }
.resumen div { display: flex; justify-content: space-between; font-size: 0.95rem; }
.resumen dt, .resumen dd { margin: 0; }
.resumen__desc { color: #c4223a; font-weight: 600; }
.resumen__total {
  font-size: 1.25rem !important; font-weight: 800;
  background: var(--sol); border: var(--borde); border-radius: 10px; padding: 0.5rem 0.75rem; margin-top: 0.4rem;
}
.btn { justify-self: start; }

/* Confeti que cae una sola vez */
.confeti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.confeti span {
  position: absolute; top: -14px; width: 10px; height: 16px; border: 2px solid var(--tinta); border-radius: 2px;
  animation: cae linear forwards;
}
@keyframes cae {
  to { transform: translateY(520px) rotate(540deg); opacity: 0; }
}
</style>
