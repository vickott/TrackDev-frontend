import { useEffect, useState } from 'react'
import { listarProyectos } from '../api/proyectos'
import { listarAlertas, obtenerRentabilidad, obtenerDesvioProyecto } from '../api/reportes'

// Muestra un número como plata: 144000 -> $144.000,00 y -500 -> -$500,00
function plata(valor) {
  const numero = Number(valor ?? 0)
  const texto = Math.abs(numero).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return (numero < 0 ? '-$' : '$') + texto
}

function Dashboard() {
  const [alertas, setAlertas] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [proyectoId, setProyectoId] = useState('')
  const [rentabilidad, setRentabilidad] = useState(null)
  const [desvio, setDesvio] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listarAlertas()
      .then(setAlertas)
      .catch(() => setError('No se pudieron cargar las alertas'))
    listarProyectos()
      .then(setProyectos)
      .catch(() => setError('No se pudieron cargar los proyectos'))
  }, [])

  // Cuando se elige un proyecto, se piden los dos reportes a la vez
  useEffect(() => {
    setRentabilidad(null)
    setDesvio(null)
    if (!proyectoId) return
    Promise.all([obtenerRentabilidad(proyectoId), obtenerDesvioProyecto(proyectoId)])
      .then(([rent, desv]) => {
        setRentabilidad(rent)
        setDesvio(desv)
      })
      .catch(() => setError('No se pudieron cargar los reportes del proyecto'))
  }, [proyectoId])

  return (
    <div>
      <h2>Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>Alertas</h3>
      {alertas.length === 0 ? (
        <p>No hay alertas: nada superó el 80% de lo estimado.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Nivel</th>
              <th>Tipo</th>
              <th>Nombre</th>
              <th>Métrica</th>
              <th>% consumido</th>
            </tr>
          </thead>
          <tbody>
            {alertas.map((a, i) => (
              <tr key={i} style={{ color: a.nivel === 'CRITICO' ? 'red' : 'darkorange' }}>
                <td>{a.nivel}</td>
                <td>{a.tipo}</td>
                <td>{a.nombre}</td>
                <td>{a.metrica}</td>
                <td>{a.porcentajeConsumido}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Proyecto</h3>
      <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)}>
        <option value="">-- Elegí un proyecto --</option>
        {proyectos.map((p) => (
          <option key={p.id} value={p.id}>{p.nombre} ({p.estado})</option>
        ))}
      </select>

      {rentabilidad && desvio && (
        <>
          <p>Presupuesto de venta: <strong>{plata(rentabilidad.presupuestoVenta)}</strong></p>
          <table border="1">
            <thead>
              <tr>
                <th></th>
                <th>Estimado</th>
                <th>Real</th>
                <th>Desvío (real − estimado)</th>
                <th>% consumido</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Horas</td>
                <td>{rentabilidad.horasEstimadas}</td>
                <td>{rentabilidad.horasReales}</td>
                <td>{desvio.desvioHoras}</td>
                <td>{desvio.porcentajeConsumidoHoras}%</td>
              </tr>
              <tr>
                <td>Costo</td>
                <td>{plata(rentabilidad.costoEstimado)}</td>
                <td>{plata(rentabilidad.costoReal)}</td>
                <td>{plata(desvio.desvioCosto)}</td>
                <td>{desvio.porcentajeConsumidoCosto}%</td>
              </tr>
              <tr>
                <td>Rentabilidad</td>
                <td>{plata(rentabilidad.rentabilidadEstimada)}</td>
                <td>{plata(rentabilidad.rentabilidadReal)}</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Margen</td>
                <td>{rentabilidad.margenEstimadoPorcentaje}%</td>
                <td>{rentabilidad.margenRealPorcentaje}%</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

export default Dashboard