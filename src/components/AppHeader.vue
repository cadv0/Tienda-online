<script setup>
// Props: datos que llegan desde App.vue (solo lectura).
defineProps({
  nombreTienda: { type: String, required: true },
  cantidadItems: { type: Number, default: 0 },
});

// Emits: avisamos al padre que el usuario quiere ver el carrito.
const emit = defineEmits(["ver-carrito"]);

// Enlaces de ancla a secciones de la misma página (no son eventos ni props).
const enlaces = [
  { href: "#inicio", texto: "Inicio" },
  { href: "#catalogo", texto: "Catálogo" },
  { href: "#contacto", texto: "Contacto" },
];
</script>

<template>
  <header class="header">
    <div class="header__interior">
      <a class="marca" href="#inicio" aria-label="Ir al inicio">
        <span class="marca__logo" aria-hidden="true">{{ nombreTienda.charAt(0) }}</span>
        <span class="marca__nombre">{{ nombreTienda }}</span>
      </a>

      <nav class="nav" aria-label="Principal">
        <a v-for="enlace in enlaces" :key="enlace.href" class="nav__enlace" :href="enlace.href">
          {{ enlace.texto }}
        </a>
      </nav>

      <button class="carrito-btn" type="button" @click="emit('ver-carrito')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" />
          <path d="M2 3h3l2.6 11.5a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H6" />
        </svg>
        <span class="carrito-btn__texto">Carrito</span>
        <!-- :key remonta la insignia en cada cambio y repite la animación de salto -->
        <span :key="cantidadItems" class="insignia" :class="{ 'insignia--salto': cantidadItems > 0 }" aria-live="polite">
          {{ cantidadItems }}<span class="solo-lectores"> unidades en el carrito</span>
        </span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky; top: 0; z-index: 20;
  background: var(--blanco);
  border-bottom: var(--borde);
}
.header__interior {
  max-width: 1200px; margin: 0 auto; padding: 0.7rem 1.25rem;
  display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;
}
.marca {
  display: flex; align-items: center; gap: 0.6rem;
  text-decoration: none; color: var(--tinta);
}
.marca__logo {
  width: 40px; height: 40px; border-radius: 12px; border: var(--borde);
  display: grid; place-items: center;
  background: var(--coral); font-weight: 800; font-size: 1.2rem;
  box-shadow: 3px 3px 0 var(--tinta);
  transform: rotate(-6deg);
  transition: transform 0.25s;
}
.marca:hover .marca__logo { transform: rotate(8deg) scale(1.08); }
.marca__nombre { font-size: 1.35rem; font-weight: 800; letter-spacing: -0.02em; }

.nav { display: flex; gap: 0.4rem; margin-left: auto; }
.nav__enlace {
  background: transparent; border: 2.5px solid transparent; border-radius: 999px;
  padding: 0.35rem 0.95rem; font-weight: 600; color: var(--tinta); text-decoration: none;
  transition: background 0.15s, border-color 0.15s;
}
.nav__enlace:hover { border-color: var(--tinta); }
.nav__enlace:hover { background: var(--sol); }

.carrito-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background: var(--menta); color: var(--tinta);
  border: var(--borde); border-radius: 999px; padding: 0.4rem 0.5rem 0.4rem 0.9rem; font-weight: 800;
  box-shadow: 3px 3px 0 var(--tinta);
  transition: transform 0.12s, box-shadow 0.12s;
}
.carrito-btn:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 var(--tinta); }
.carrito-btn:active { transform: translate(2px, 2px); box-shadow: 0 0 0 var(--tinta); }

.insignia {
  min-width: 28px; height: 28px; padding: 0 7px;
  display: grid; place-items: center;
  background: var(--tinta); color: #fff; border-radius: 999px; font-size: 0.85rem;
}
.insignia--salto { animation: salto 0.45s cubic-bezier(0.3, 1.6, 0.5, 1); }
@keyframes salto {
  0% { transform: scale(0.4); }
  60% { transform: scale(1.35); background: var(--coral); }
  100% { transform: scale(1); }
}

@media (max-width: 700px) {
  .header__interior { gap: 0.5rem 1rem; padding: 0.55rem 1rem; }
  .carrito-btn { margin-left: auto; }
  /* En celular el botón queda como ícono + contador; el texto sigue disponible para lectores de pantalla */
  .carrito-btn__texto { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .carrito-btn { padding: 0.4rem 0.5rem 0.4rem 0.7rem; }
  .nav { order: 3; width: 100%; margin-left: 0; justify-content: space-between; }
  .nav__enlace { padding: 0.25rem 0.7rem; font-size: 0.95rem; }
}
</style>
