// Muestra un número como plata: 144000 -> $144.000,00 y -500 -> -$500,00
export function plata(valor) {
  const numero = Number(valor ?? 0)
  const texto = Math.abs(numero).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return (numero < 0 ? '-$' : '$') + texto
}

// Verde si es positivo, rojo si es negativo
export function colorSigno(valor) {
  return Number(valor) < 0 ? 'text-danger' : 'text-success'
}

// Color de una barra según el % consumido (mismos umbrales que las alertas)
export function colorBarra(porcentaje) {
  if (porcentaje >= 100) return 'bg-danger'
  if (porcentaje >= 80) return 'bg-warning'
  return 'bg-success'
}

// Color de la etiqueta según el estado del proyecto
export const COLOR_ESTADO_PROYECTO = {
  PLANIFICADO: 'bg-secondary',
  EN_CURSO: 'bg-primary',
  FINALIZADO: 'bg-success',
  CANCELADO: 'bg-danger',
}