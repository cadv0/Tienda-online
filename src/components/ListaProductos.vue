<script setup>
import ProductoCard from "./ProductoCard.vue";

defineProps({
  productos: { type: Array, required: true },
});

// Reenvío de eventos: ProductoCard -> ListaProductos -> App.vue
const emit = defineEmits(["agregar-producto"]);
</script>

<template>
  <section class="catalogo" aria-labelledby="titulo-catalogo">
    <div class="catalogo__cabecera">
      <h2 id="titulo-catalogo">Catálogo</h2>
      <p class="catalogo__cuenta">{{ productos.length }} productos</p>
    </div>

    <p v-if="productos.length === 0" class="catalogo__vacio">
      No encontramos productos con esos filtros. Prueba con otra búsqueda o limpia los filtros.
    </p>

    <TransitionGroup tag="div" name="tarjeta" class="catalogo__rejilla" :duration="{ enter: 600, leave: 1 }">
      <ProductoCard
        v-for="(producto, indice) in productos"
        :key="producto.id"
        :style="{ '--i': indice }"
        :producto="producto"
        @agregar-al-carrito="emit('agregar-producto', $event)"
      />
    </TransitionGroup>
  </section>
</template>

<style scoped>
.catalogo__cabecera {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem;
  margin-bottom: 1.5rem;
}
.catalogo__cabecera h2 { font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.catalogo__desc { color: var(--tinta-suave); margin-top: 0.3rem; max-width: 52ch; }
.catalogo__cuenta {
  background: var(--sol); border: 2.5px solid var(--tinta); border-radius: 999px;
  padding: 0.1rem 0.8rem; font-weight: 800; font-size: 0.9rem; white-space: nowrap;
}
.catalogo__rejilla {
  display: grid; gap: 1.6rem;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  padding-right: 6px; padding-bottom: 6px; /* espacio para la sombra dura */
}
.catalogo__vacio {
  background: var(--blanco); border: var(--borde); border-radius: var(--radio);
  box-shadow: var(--sombra-s); padding: 1.25rem; font-weight: 600; margin-bottom: 1rem;
}
.tarjeta-move { transition: transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.1); }
.tarjeta-leave-active { display: none; }
</style>
