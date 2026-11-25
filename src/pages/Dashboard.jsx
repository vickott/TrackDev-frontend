import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts'
import { listarProyectos } from '../api/proyectos'
import { listarAlertas, obtenerRentabilidad, obtenerDesvioProyecto } from '../api/reportes'

// Muestra un número como plata: 144000 -> $144.000,00 y -500 -> -$500,00
function plata(valor) {
  const numero = Number(valor ?? 0)
  const texto = Math.abs(numero).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return (numero < 0 ? '-$' : '$') + texto
}

// Verde si es positivo, rojo si es negativo
function colorSigno(valor) {
  return Number(valor) < 0 ? 'text-danger' : 'text-success'
}

// Tarjetita de indicador (se usa 4 veces)
function Indicador({ titulo, valor, claseColor = '' }) {
  return (
    <div className="col-md-3">
      <div className="card text-center h-100">
        <div className="card-body">
          <div className="text-muted small text-uppercase">{titulo}</div>
          <div className={`fs-4 fw-bold ${claseColor}`}>{valor}</div>
        </div>
      </div>
    </div>
  )
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

  // Datos para los gráficos (Recharts necesita una lista de objetos)
  const datosHoras = rentabilidad
    ? [{ nombre: 'Horas', Estimado: Number(rentabilidad.horasEstimadas), Real: Number(rentabilidad.horasReales) }]
    : []
  const datosCosto = rentabilidad
    ? [{ nombre: 'Costo', Estimado: Number(rentabilidad.costoEstimado), Real: Number(rentabilidad.costoReal) }]
    : []

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}

      <h5 className="mb-3">Alertas</h5>
      {alertas.length === 0 ? (
        <div className="alert alert-success">Todo en orden: nada superó el 80% de lo estimado.</div>
      ) : (
        alertas.map((a, i) => (
          <div key={i} className={`alert ${a.nivel === 'CRITICO' ? 'alert-danger' : 'alert-warning'} py-2`}>
            <strong>{a.nivel === 'CRITICO' ? 'Crítico' : 'Advertencia'}:</strong>{' '}
            {a.tipo === 'TAREA' ? 'la tarea' : 'el proyecto'} <strong>{a.nombre}</strong> consumió el{' '}
            git <strong>{a.porcentajeConsumido}%</strong> de {a.metrica === 'HORAS' ? 'las horas estimadas' : 'el costo estimado'}.
          </div>
        ))
      )}

      <h5 className="mt-4 mb-3">Proyecto</h5>
      <select className="form-select mb-4" value={proyectoId} onChange={(e) => setProyectoId(e.target.value)}>
        <option value="">-- Elegí un proyecto para ver sus números --</option>
        {proyectos.map((p) => (
          <option key={p.id} value={p.id}>{p.nombre} ({p.estado})</option>
        ))}
      </select>

      {rentabilidad && desvio && (
        <>
          <div className="row g-3 mb-4">
            <Indicador titulo="Presupuesto de venta" valor={plata(rentabilidad.presupuestoVenta)} />
            <Indicador titulo="Costo real" valor={plata(rentabilidad.costoReal)} />
            <Indicador titulo="Rentabilidad real" valor={plata(rentabilidad.rentabilidadReal)} claseColor={colorSigno(rentabilidad.rentabilidadReal)} />
            <Indicador titulo="Margen real" valor={`${rentabilidad.margenRealPorcentaje}%`} claseColor={colorSigno(rentabilidad.margenRealPorcentaje)} />
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="card-title">Horas: estimado vs. real</h6>
                  <p className="text-muted small mb-2">
                    Desvío: {desvio.desvioHoras} h · Consumido: {desvio.porcentajeConsumidoHoras}%
                  </p>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={datosHoras}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nombre" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Estimado" fill="#9DB8B9" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Real" fill="#14808A" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="card-title">Costo: estimado vs. real</h6>
                  <p className="text-muted small mb-2">
                    Desvío: {plata(desvio.desvioCosto)} · Consumido: {desvio.porcentajeConsumidoCosto}%
                  </p>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={datosCosto}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nombre" />
                      <YAxis />
                      <Tooltip formatter={(valor) => plata(valor)} />
                      <Legend />
                      <Bar dataKey="Estimado" fill="#9DB8B9" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Real" fill="#F2A541" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Rentabilidad</h6>
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th></th>
                    <th>Estimado</th>
                    <th>Real</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Costo</td>
                    <td>{plata(rentabilidad.costoEstimado)}</td>
                    <td>{plata(rentabilidad.costoReal)}</td>
                  </tr>
                  <tr>
                    <td>Rentabilidad</td>
                    <td className={colorSigno(rentabilidad.rentabilidadEstimada)}>{plata(rentabilidad.rentabilidadEstimada)}</td>
                    <td className={colorSigno(rentabilidad.rentabilidadReal)}>{plata(rentabilidad.rentabilidadReal)}</td>
                  </tr>
                  <tr>
                    <td>Margen</td>
                    <td className={colorSigno(rentabilidad.margenEstimadoPorcentaje)}>{rentabilidad.margenEstimadoPorcentaje}%</td>
                    <td className={colorSigno(rentabilidad.margenRealPorcentaje)}>{rentabilidad.margenRealPorcentaje}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard