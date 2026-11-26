import { useEffect, useState } from 'react'
import { listarModulos } from '../api/modulos'
import { listarTareas } from '../api/tareas'
import { listarRegistrosPorTarea } from '../api/registros'
import { plata } from '../utils/formato'

function HorasProyecto({ proyectoId }) {
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Recorre módulos → tareas → registros y los junta en una sola lista
    async function cargar() {
      try {
        const lista = []
        const modulos = await listarModulos(proyectoId)
        for (const m of modulos) {
          const tareas = await listarTareas(m.id)
          for (const t of tareas) {
            const regs = await listarRegistrosPorTarea(t.id)
            regs.forEach((r) => lista.push({ ...r, moduloNombre: m.nombre }))
          }
        }
        // Los más nuevos primero
        lista.sort((a, b) => b.fecha.localeCompare(a.fecha))
        setRegistros(lista)
      } catch {
        setError('No se pudieron cargar las horas del proyecto')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [proyectoId])

  if (cargando) return <p className="text-muted">Cargando horas...</p>
  if (error) return <div className="alert alert-danger">{error}</div>
  if (registros.length === 0) return <p className="text-muted">Todavía no se cargaron horas en este proyecto.</p>

  // Resumen por persona: { "Victoria Peretti": { horas: 10, costo: 50000 } }
  const porPersona = {}
  registros.forEach((r) => {
    const nombre = `${r.usuario?.nombre} ${r.usuario?.apellido}`
    if (!porPersona[nombre]) porPersona[nombre] = { horas: 0, costo: 0 }
    porPersona[nombre].horas += Number(r.horasTrabajadas)
    porPersona[nombre].costo += Number(r.costoReal)
  })

  return (
    <>
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="card-title"><i className="bi bi-people me-2"></i>Por persona</h6>
          <table className="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Persona</th>
                <th>Horas</th>
                <th>Costo</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(porPersona).map(([nombre, datos]) => (
                <tr key={nombre}>
                  <td>{nombre}</td>
                  <td>{datos.horas} h</td>
                  <td>{plata(datos.costo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h6 className="card-title"><i className="bi bi-list-ul me-2"></i>Detalle de registros</h6>
          <table className="table table-sm table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Persona</th>
                <th>Módulo</th>
                <th>Tarea</th>
                <th>Horas</th>
                <th>Costo/hora</th>
                <th>Costo real</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id}>
                  <td>{r.fecha}</td>
                  <td>{r.usuario?.nombre} {r.usuario?.apellido}</td>
                  <td>{r.moduloNombre}</td>
                  <td>{r.tarea?.nombre}</td>
                  <td>{r.horasTrabajadas}</td>
                  <td>{plata(r.costoHoraAplicado)}</td>
                  <td>{plata(r.costoReal)}</td>
                  <td className="text-muted">{r.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default HorasProyecto