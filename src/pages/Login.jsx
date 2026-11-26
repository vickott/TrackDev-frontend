import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import Logo from '../components/Logo'

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
  const navigate = useNavigate()  

  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')
    setMensaje('')
    try {
      const datos = await login(email, password)
      localStorage.setItem('token', datos.token)
      localStorage.setItem('usuario', JSON.stringify(datos.usuario))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo conectar con el servidor')
    }
  }

      return (
    <div className="container-fluid pantalla-login">
      <div className="row justify-content-center mt-5">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
                           <h1 className="text-center mb-2">
                <Logo size={44} />
              </h1>
              <p className="text-center text-muted mb-4">Control de horas y costos</p>

              <form onSubmit={manejarSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">Ingresar</button>
              </form>

              {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login