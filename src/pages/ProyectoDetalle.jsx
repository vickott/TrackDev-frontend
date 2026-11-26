import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { obtenerProyecto } from '../api/proyectos'
import ResumenProyecto from '../components/ResumenProyecto'
import { COLOR_ESTADO_PROYECTO } from '../utils/formato'
import ModulosYTareas from '../components/ModulosYTareas'
import HorasProyecto from '../components/HorasProyecto'


function ProyectoDetalle() {
  const { id } = useParams()
  const [proyecto, setProyecto] = useState(null)
  const [error, setError] = useState('')
  const [solapa, setSolapa] = useState('resumen')

  useEffect(() => {
    obtenerProyecto(id)
      .then(setProyecto)
      .catch(() => setError('No se pudo cargar el proyecto'))
  }, [id])

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!proyecto) return <p className="text-muted">Cargando...</p>

  return (
    <div>
      <Link to="/proyectos" className="text-decoration-none small">
        <i className="bi bi-arrow-left me-1"></i>Volver a proyectos
      </Link>

      <div className="d-flex align-items-center gap-3 mt-2 mb-1">
        <h2 className="mb-0">{proyecto.nombre}</h2>
        <span className={`badge ${COLOR_ESTADO_PROYECTO[proyecto.estado]}`}>{proyecto.estado}</span>
      </div>
      <p className="text-muted mb-4">
        Cliente: <strong>{proyecto.cliente?.razonSocial}</strong> · Inicio: {proyecto.fechaInicio}
        {proyecto.fechaFinEstimada && <> · Fin estimada: {proyecto.fechaFinEstimada}</>}
        {proyecto.descripcion && <><br />{proyecto.descripcion}</>}
      </p>

           <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${solapa === 'resumen' ? 'active' : ''}`} onClick={() => setSolapa('resumen')}>
            <i className="bi bi-bar-chart me-1"></i>Resumen
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${solapa === 'modulos' ? 'active' : ''}`} onClick={() => setSolapa('modulos')}>
            <i className="bi bi-diagram-3 me-1"></i>Módulos y tareas
          </button>
        </li>
                <li className="nav-item">
          <button className={`nav-link ${solapa === 'horas' ? 'active' : ''}`} onClick={() => setSolapa('horas')}>
            <i className="bi bi-clock-history me-1"></i>Horas cargadas
          </button>
        </li>
      </ul>

      {solapa === 'resumen' && <ResumenProyecto proyectoId={id} />}
      {solapa === 'modulos' && <ModulosYTareas proyectoId={id} />}
      {solapa === 'horas' && <HorasProyecto proyectoId={id} />}
    </div>
  )
}

export default ProyectoDetalle