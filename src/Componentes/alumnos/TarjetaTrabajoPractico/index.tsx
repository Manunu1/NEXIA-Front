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

function estadoInfo(tp: typeTrabajoPracticoAlumno): { label: string; className: string } {
  if (tp.estado === 'corregido') return { label: tp.nota != null ? `Corregido · ${tp.nota}` : 'Corregido', className: 'ttp-badge--corregido' };
  if (tp.estado === 'pendiente') return { label: 'Pendiente de corrección', className: 'ttp-badge--pendiente' };
  const vencido = !!tp.fecha_limite && new Date(tp.fecha_limite).getTime() < Date.now();
  return { label: vencido ? 'Vencido · sin entregar' : 'Sin entregar', className: vencido ? 'ttp-badge--vencido' : 'ttp-badge--sin-entrega' };
}

type Props = {
  trabajo: typeTrabajoPracticoAlumno;
};

const TarjetaTrabajoPractico: React.FC<Props> = ({ trabajo }) => {
  const estado = estadoInfo(trabajo);

  return (
    <Link to={`/trabajo-practico/${trabajo.trabajo_practico_id}`} className="ttp-card">
      <div className="ttp-card-top">
        <span className={`ttp-badge ${estado.className}`}>{estado.label}</span>
      </div>
      <h3 className="ttp-title">{trabajo.titulo}</h3>
      {trabajo.fecha_limite && (
        <p className="ttp-fecha">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          Vence {formatFecha(trabajo.fecha_limite)}
        </p>
      )}
    </Link>
  );
};

export default TarjetaTrabajoPractico;
