import React from 'react';
import { Link } from 'react-router-dom';
import type { typeTrabajoPracticoAlumno } from '../../../Types/profesores/types';
import './tarjetaTrabajoPractico.css';

function formatFecha(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

type Variant = 'sin-entrega' | 'vencido' | 'pendiente' | 'corregido';

interface EstadoInfo {
  variant: Variant;
  label: string;
  accion: string;
  icon: React.ReactNode;
}

const ICONS: Record<Variant, React.ReactNode> = {
  'sin-entrega': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  vencido: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  pendiente: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  corregido: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

function estadoInfo(tp: typeTrabajoPracticoAlumno): EstadoInfo {
  if (tp.estado === 'corregido') {
    return { variant: 'corregido', label: 'Corregido', accion: 'Ver corrección', icon: ICONS.corregido };
  }
  if (tp.estado === 'pendiente') {
    return { variant: 'pendiente', label: 'En corrección', accion: 'Ver mi entrega', icon: ICONS.pendiente };
  }
  const vencido = !!tp.fecha_limite && new Date(tp.fecha_limite).getTime() < Date.now();
  if (vencido) {
    return { variant: 'vencido', label: 'Vencido sin entregar', accion: 'Ver consigna', icon: ICONS.vencido };
  }
  return { variant: 'sin-entrega', label: 'Por entregar', accion: 'Entregar', icon: ICONS['sin-entrega'] };
}

type Props = {
  trabajo: typeTrabajoPracticoAlumno;
};

const TarjetaTrabajoPractico: React.FC<Props> = ({ trabajo }) => {
  const estado = estadoInfo(trabajo);

  return (
    <Link
      to={`/trabajo-practico/${trabajo.trabajo_practico_id}`}
      className={`ttp-card ttp-card--${estado.variant}`}
    >
      <div className="ttp-icon" aria-hidden="true">{estado.icon}</div>

      <div className="ttp-body">
        <div className="ttp-top">
          <span className="ttp-badge">{estado.label}</span>
          {estado.variant === 'corregido' && trabajo.nota != null && (
            <span className="ttp-nota">{trabajo.nota}</span>
          )}
        </div>

        <h3 className="ttp-title">{trabajo.titulo}</h3>

        <div className="ttp-meta">
          {trabajo.fecha_limite && (
            <p className="ttp-fecha">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {estado.variant === 'vencido' ? 'Venció el ' : 'Vence el '}
              {formatFecha(trabajo.fecha_limite)}
            </p>
          )}
          {(trabajo.profesor_nombre || trabajo.profesor_apellido) && (
            <p className="ttp-profe">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Prof. {[trabajo.profesor_nombre, trabajo.profesor_apellido].filter(Boolean).join(' ')}
            </p>
          )}
        </div>
      </div>

      <span className="ttp-accion">
        {estado.accion}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
    </Link>
  );
};

export default TarjetaTrabajoPractico;
