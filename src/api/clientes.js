import api from './client'

export async function listarClientes() {
  const respuesta = await api.get('/clientes')
  return respuesta.data
}

export async function crearCliente(cliente) {
  const respuesta = await api.post('/clientes', cliente)
  return respuesta.data
}

export async function actualizarCliente(id, cliente) {
  const respuesta = await api.put(`/clientes/${id}`, cliente)
  return respuesta.data
}

export async function desactivarCliente(id) {
  await api.delete(`/clientes/${id}`)
}