// Funciones puras de formato y cálculo. No guardan estado: solo reciben datos y devuelven resultados.

// Formato pedido en el enunciado. Se fijan 0 decimales (como en la maqueta: $ 2.464.150) porque,
// según el navegador, Intl muestra COP con ",00" por defecto.
const moneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatoCOP = (valor) => moneda.format(valor);

export const TASA_IVA = 0.19;

// valorConDescuento = valor × (1 − descuento / 100)
export const calcularValorConDescuento = (producto) =>
  Math.round(producto.valor * (1 - producto.descuento / 100));

// Totales de una lista de items [{ producto, cantidad }]
export function calcularTotales(items) {
  const sinDescuento = items.reduce((acc, { producto, cantidad }) => acc + producto.valor * cantidad, 0);
  const conDescuento = items.reduce(
    (acc, { producto, cantidad }) => acc + calcularValorConDescuento(producto) * cantidad,
    0
  );
  const descuentos = sinDescuento - conDescuento;
  const subtotal = conDescuento;
  const iva = Math.round(subtotal * TASA_IVA);
  return { sinDescuento, descuentos, subtotal, iva, total: subtotal + iva };
}
