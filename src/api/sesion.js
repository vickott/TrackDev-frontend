// Lee la fecha de vencimiento (exp) que viene dentro del token
export function tokenVencido(token) {
  try {
    const parteDelMedio = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const datos = JSON.parse(atob(parteDelMedio))
    return datos.exp * 1000 < Date.now()
  } catch {
    // Si el token está roto o no se puede leer, lo tratamos como vencido
    return true
  }
}

export function limpiarSesion() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}