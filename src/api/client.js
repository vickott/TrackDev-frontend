import { tokenVencido, limpiarSesion } from './sesion'
import axios from 'axios'
//#conexion con el backend
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})
//busca el token en el localStorage y lo agrega a la cabecera de la solicitud
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const token = localStorage.getItem('token')
    const esLogin = error.config?.url?.includes('/auth/login')
    if (!esLogin && (error.response?.status === 401 || (token && tokenVencido(token)))) {
      limpiarSesion()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api