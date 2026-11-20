import api from './client'

export async function login(email, password) {
  const respuesta = await api.post('/auth/login', { email, password })
  return respuesta.data
}