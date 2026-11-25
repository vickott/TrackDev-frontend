import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarProyectos } from '../api/proyectos'
import { listarClientes } from '../api/clientes'
import { listarUsuarios } from '../api/usuarios'
import { listarPerfiles } from '../api/perfiles'
import { listarAlertas, obtenerRentabilidad, obtenerDesvioProyecto } from '../api/reportes'
import { plata, colorSigno, colorBarra, COLOR_ESTADO_PROYECTO } from '../utils/formato'

// Botón grande con ícono que lleva a una sección
function Acceso({ to, icono, titulo, detalle }) {
  return (
    <div className="col-6 col-md-3">
      <Link to={to} className="card acceso text-center h-100">
        <div className="card-body py-4">
          <i className={`bi ${icono} icono`}></i>
          <div className="fw-semibold mt-2">{titulo}</div>
          <div className="text-muted small">{detalle}</div>
        </div>
      </Link>
    </div>
  )
}

// Barrita de % consumido
function Barra({ porcentaje }) {
  return (
    <div className="progress" style={{ height: '16px', minWidth: '90px' }}>
      <div className={`progress-bar ${colorBarra(porcentaje)}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}>
        {porcentaje}%
      </div>
    </div>
  )
}

// "1 activo" / "2 activos"
function activos(cantidad) {
  return `${cantidad} ${cantidad === 1 ? 'activo' : 'activos'}`
}

function Dashboard() {
  const [cantidades, setCantidades] = useState({ proyectos: 0, clientes: 0, usuarios: 0, perfiles: 0 })
  const [alertas, setAlertas] = useState([])
  const [resumen, setResumen] = useState([]) // proyectos activos con sus números
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      try {
        // Pedimos todo a la vez
        const [proyectos, clientes, usuarios, perfiles, alertasDelBack] = await Promise.all([
          listarProyectos(),
          listarClientes(),
          listarUsuarios(),
          listarPerfiles(),
          listarAlertas(),
        ])

        const proyectosActivos = proyectos.filter((p) => p.estado === 'PLANIFICADO' || p.estado === 'EN_CURSO')

        setCantidades({
          proyectos: proyectosActivos.length,
          clientes: clientes.filter((c) => c.activo).length,
          usuarios: usuarios.filter((u) => u.activo).length,
          perfiles: perfiles.filter((p) => p.activo).length,
        })
        setAlertas(alertasDelBack)

        // Para cada proyecto activo, sus números de rentabilidad y desvío
        const conNumeros = await Promise.all(
          proyectosActivos.map(async (p) => {
            const [rentabilidad, desvio] = await Promise.all([obtenerRentabilidad(p.id), obtenerDesvioProyecto(p.id)])
            return { ...p, rentabilidad, desvio }
          })
        )
        setResumen(conNumeros)
      } catch {
        setError('No se pudo cargar el tablero')
      }
    }
    cargar()
  }, [])

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Botones grandes */}
      <div className="row g-3 mb-4">
        <Acceso to="/proyectos" icono="bi-folder2-open" titulo="Proyectos" detalle={activos(cantidades.proyectos)} />
        <Acceso to="/clientes" icono="bi-building" titulo="Clientes" detalle={activos(cantidades.clientes)} />
        <Acceso to="/equipo" icono="bi-people" titulo="Usuarios" detalle={activos(cantidades.usuarios)} />
        <Acceso to="/equipo?solapa=perfiles" icono="bi-person-badge" titulo="Perfiles" detalle={activos(cantidades.perfiles)} />
      </div>

      {/* Alertas */}
      <h5 className="mb-3"><i className="bi bi-exclamation-triangle me-2"></i>Alertas</h5>
      {alertas.length === 0 ? (
        <div className="alert alert-success">Todo en orden: nada superó el 80% de lo estimado.</div>
      ) : (
        alertas.map((a, i) => (
          <div key={i} className={`alert ${a.nivel === 'CRITICO' ? 'alert-danger' : 'alert-warning'} py-2 d-flex justify-content-between align-items-center`}>
            <span>
              <strong>{a.nivel === 'CRITICO' ? 'Crítico' : 'Advertencia'}:</strong>{' '}
              {a.tipo === 'TAREA' ? 'la tarea' : 'el proyecto'} <strong>{a.nombre}</strong> consumió el{' '}
              <strong>{a.porcentajeConsumido}%</strong> de {a.metrica === 'HORAS' ? 'las horas estimadas' : 'el costo estimado'}.
            </span>
            {a.tipo === 'PROYECTO' && (
              <Link to={`/proyectos/${a.id}`} className="alert-link text-nowrap ms-3">
                Ver proyecto <i className="bi bi-arrow-right"></i>
              </Link>
            )}
          </div>
        ))
      )}

      {/* Proyectos activos de un vistazo */}
      <h5 className="mt-4 mb-3"><i className="bi bi-folder2-open me-2"></i>Proyectos activos</h5>
      <div className="card">
        <div className="card-body">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Horas</th>
                <th>Horas consumidas</th>
                <th>Costo consumido</th>
                <th>Rentabilidad real</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resumen.length === 0 && (
                <tr><td colSpan="8" className="text-center text-muted">No hay proyectos activos</td></tr>
              )}
              {resumen.map((p) => (
                <tr key={p.id}>
                  <td className="fw-semibold">{p.nombre}</td>
                  <td>{p.cliente?.razonSocial}</td>
                  <td><span className={`badge ${COLOR_ESTADO_PROYECTO[p.estado]}`}>{p.estado}</span></td>
                  <td>{p.rentabilidad.horasReales} / {p.rentabilidad.horasEstimadas} h</td>
                  <td><Barra porcentaje={p.desvio.porcentajeConsumidoHoras} /></td>
                  <td><Barra porcentaje={p.desvio.porcentajeConsumidoCosto} /></td>
                  <td className={colorSigno(p.rentabilidad.rentabilidadReal)}>{plata(p.rentabilidad.rentabilidadReal)}</td>
                  <td className="text-end">
                    <Link to={`/proyectos/${p.id}`} className="btn btn-sm btn-primary">
                      <i className="bi bi-eye me-1"></i>Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard