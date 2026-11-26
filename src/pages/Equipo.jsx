import { useSearchParams } from 'react-router-dom'
import Usuarios from './Usuarios'
import Perfiles from './Perfiles'

function Equipo() {
  // La solapa elegida viaja en la dirección: /equipo?solapa=perfiles
  const [parametros, setParametros] = useSearchParams()
  const solapa = parametros.get('solapa') || 'usuarios'

  return (
    <div>
      <h2 className="mb-4">Equipo</h2>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${solapa === 'usuarios' ? 'active' : ''}`} onClick={() => setParametros({ solapa: 'usuarios' })}>
            <i className="bi bi-people me-1"></i>Usuarios
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${solapa === 'perfiles' ? 'active' : ''}`} onClick={() => setParametros({ solapa: 'perfiles' })}>
            <i className="bi bi-person-badge me-1"></i>Perfiles
          </button>
        </li>
      </ul>

      {solapa === 'usuarios' ? <Usuarios /> : <Perfiles />}
    </div>
  )
}

export default Equipo