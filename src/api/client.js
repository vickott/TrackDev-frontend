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

export default api