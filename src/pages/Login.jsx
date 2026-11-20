import { useState } from 'react'
import { login } from '../api/auth'

//useState guarda el estado de las variables email, password, error y mensaje. 
// Cuando el usuario ingresa sus credenciales y envía el formulario, 
// la función manejarSubmit se encarga de llamar a la función login del archivo auth.js, 
// que realiza la solicitud al servidor para autenticar al usuario.
//  Si la autenticación es exitosa, se almacenan el token
//  y los datos del usuario en localStorage y se muestra un mensaje de bienvenida.
//  Si ocurre un error, se muestra un mensaje de error correspondiente.
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')
    setMensaje('')
    try {
      const datos = await login(email, password)
      localStorage.setItem('token', datos.token)
      localStorage.setItem('usuario', JSON.stringify(datos.usuario))
      setMensaje('Bienvenido/a ' + datos.usuario.nombre)
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo conectar con el servidor')
    }
  }

  return (
    <div>
      <h2>Iniciar sesión</h2>
      <form onSubmit={manejarSubmit}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Ingresar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
    </div>
  )
}

export default Login