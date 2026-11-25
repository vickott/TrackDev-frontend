import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts'
import { obtenerRentabilidad, obtenerDesvioProyecto } from '../api/reportes'
import { plata, colorSigno } from '../utils/formato'

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

function ResumenProyecto({ proyectoId }) {
  const [rentabilidad, setRentabilidad] = useState(null)
  const [desvio, setDesvio] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([obtenerRentabilidad(proyectoId), obtenerDesvioProyecto(proyectoId)])
      .then(([rent, desv]) => {
        setRentabilidad(rent)
        setDesvio(desv)
      })
      .catch(() => setError('No se pudieron cargar los números del proyecto'))
  }, [proyectoId])

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!rentabilidad || !desvio) return <p className="text-muted">Cargando números...</p>

  const datosHoras = [{ nombre: 'Horas', Estimado: Number(rentabilidad.horasEstimadas), Real: Number(rentabilidad.horasReales) }]
  const datosCosto = [{ nombre: 'Costo', Estimado: Number(rentabilidad.costoEstimado), Real: Number(rentabilidad.costoReal) }]

  return (
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
              <ResponsiveContainer width="100%" height={220}>
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
              <ResponsiveContainer width="100%" height={220}>
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
    </>
  )
}

export default ResumenProyecto