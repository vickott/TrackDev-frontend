import api from './client'

export async function listarMisRegistros() {
  const respuesta = await api.get('/registros-tiempo/mios')
  return respuesta.data
}

export async function crearRegistro(registro) {
  const respuesta = await api.post('/registros-tiempo', registro)
  return respuesta.data
}

export async function actualizarRegistro(id, registro) {
  const respuesta = await api.put(`/registros-tiempo/${id}`, registro)
  return respuesta.data
}

export async function eliminarRegistro(id) {
  await api.delete(`/registros-tiempo/${id}`)
}