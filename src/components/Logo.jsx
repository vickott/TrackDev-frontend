// Logo de TrackDev: barras escalonadas ("bloques de tiempo") + nombre.
// fondo="oscuro" para el menú petróleo, fondo="claro" para fondos blancos.
function Logo({ fondo = 'claro', size = 30 }) {
  const oscuro = fondo === 'oscuro'
  const colorPrincipal = oscuro ? '#FFFFFF' : '#0F3D3E'
  const colorSecundario = oscuro ? '#5FB7BE' : '#14808A'

  return (
    <span className="d-inline-flex align-items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <rect x="6" y="10" width="26" height="12" rx="6" fill={colorPrincipal} />
        <rect x="18" y="26" width="32" height="12" rx="6" fill={colorSecundario} />
        <rect x="36" y="42" width="22" height="12" rx="6" fill="#F2A541" />
      </svg>
      <span style={{ fontSize: size * 0.72, letterSpacing: '-0.4px', lineHeight: 1 }}>
        <span style={{ fontWeight: 600, color: colorPrincipal }}>Track</span>
        <span style={{ fontWeight: 400, color: colorSecundario }}>Dev</span>
      </span>
    </span>
  )
}

export default Logo