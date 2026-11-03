<script setup>
defineProps({
  nombreTienda: { type: String, required: true },
  anio: { type: Number, required: true },
  contacto: { type: String, default: "" },
});
</script>

<template>
  <footer id="contacto" class="footer">
    <div class="footer__interior">
      <div>
        <p class="footer__titulo">{{ nombreTienda }}</p>
        <p>Proyecto académico · Fundamentos de programación con Vue 3</p>
      </div>
      <div v-if="contacto">
        <p class="footer__titulo">Contacto</p>
        <p>{{ contacto }}</p>
        <p>Montería, Córdoba</p>
      </div>
      <div class="footer__derechos">
        <p>© {{ anio }} {{ nombreTienda }}</p>
        <p>Todos los derechos reservados</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer { background: var(--tinta); color: #e9e5ff; margin-top: 4rem; border-top: var(--borde); }
.footer__interior {
  max-width: 1200px; margin: 0 auto; padding: 1.75rem 1.25rem;
  display: flex; flex-wrap: wrap; gap: 1.5rem 3rem; justify-content: space-between;
  font-size: 0.92rem;
}
.footer__titulo { color: var(--sol); font-weight: 800; font-size: 1.05rem; }
.footer__derechos { text-align: right; }
@media (max-width: 560px) { .footer__derechos { text-align: left; } }
</style>
