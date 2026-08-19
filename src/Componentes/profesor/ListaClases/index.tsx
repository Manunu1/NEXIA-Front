import React from 'react';
import { Link } from 'react-router-dom';
import type { typeClaseHistorial } from '../../../Types/profesores/types';
import './listaClases.css';

/* `fecha` llega como string de fecha pura ("2026-08-19"), sin hora. Parsearla
   con `new Date(fecha)` la interpreta como medianoche UTC y en Argentina
   (UTC-3) muestra el día anterior — por eso se arma la fecha local a mano. */
function parseFechaLocal(fecha: string): Date {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fechaCorta(fecha: string) {
  const d = parseFechaLocal(fecha);
  return {
    dia: d.getDate(),
    mes: d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase(),
  };
}

type Props = {
  clases: typeClaseHistorial[];
};

const ListaClases: React.FC<Props> = ({ clases }) => (
  <div className="lc-list">
    {clases.map((c) => {
      const { dia, mes } = fechaCorta(c.fecha);
      const presentes = Number(c.presentes) || 0;
      const ausentes = Number(c.ausentes) || 0;
      const tardanzas = Number(c.tardanzas) || 0;
      const justificados = Number(c.justificados) || 0;
      const totalRegistrados = presentes + ausentes + tardanzas + justificados;

      return (
        <Link key={c.clase_id} to={`/clase/${c.clase_id}`} className="lc-row">
          <span className="lc-fecha">
            <span className="lc-fecha-dia">{dia}</span>
            <span className="lc-fecha-mes">{mes}</span>
          </span>
          <span className="lc-info">
            <span className="lc-tema">{c.tema || 'Sin tema registrado'}</span>
            <span className="lc-sub">
              {totalRegistrados === 0 ? 'Asistencia sin tomar' : `${totalRegistrados} alumnos registrados`}
            </span>
          </span>
          <span className="lc-badges">
            {ausentes > 0 && (
              <span className="lc-badge lc-badge--ausente">{ausentes} ausente{ausentes !== 1 ? 's' : ''}</span>
            )}
            {tardanzas > 0 && (
              <span className="lc-badge lc-badge--tardanza">{tardanzas} tardanza{tardanzas !== 1 ? 's' : ''}</span>
            )}
            {justificados > 0 && (
              <span className="lc-badge lc-badge--justificado">{justificados} justificado{justificados !== 1 ? 's' : ''}</span>
            )}
            <span className={`lc-badge ${c.lista_cerrada ? 'lc-badge--cerrada' : 'lc-badge--abierta'}`}>
              {c.lista_cerrada ? 'Cerrada' : 'Abierta'}
            </span>
          </span>
          <svg className="lc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      );
    })}
  </div>
);

export default ListaClases;
