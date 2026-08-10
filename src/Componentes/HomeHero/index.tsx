import React from 'react';
import { Link } from 'react-router-dom';
import './homeHero.css';

/* ─────────────────────────────────────────────
   HOME HERO — encabezado de bienvenida de los
   inicios (Alumno / Profesor / Gestor).
   Saludo + fecha calculados acá para no duplicar
   la lógica en cada página.
───────────────────────────────────────────── */

export interface HeroStat {
  value: React.ReactNode;
  label: string;
  /**
   * Destino de la métrica. Un número que no lleva a ningún lado es
   * decoración: si el alumno lee "3 por entregar", lo que quiere es ver
   * cuáles son. Con `to`, la stat deja de ser un adorno y ahorra un clic.
   */
  to?: string;
}

interface HomeHeroProps {
  userName: string;
  /** Línea descriptiva bajo la fecha (rol / contexto) */
  tagline?: string;
  stats?: HeroStat[];
  /** Franja inferior para avisos accionables (ej: entregas pendientes) */
  notice?: React.ReactNode;
}

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function formatDate(): string {
  const d = new Date();
  const s = `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getSaludo(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

const HomeHero: React.FC<HomeHeroProps> = ({ userName, tagline, stats, notice }) => (
  <section className="hh" aria-label="Bienvenida">
    {/* Decoración de fondo */}
    <div className="hh-orb hh-orb--orange" aria-hidden="true" />
    <div className="hh-orb hh-orb--indigo" aria-hidden="true" />
    <div className="hh-ring" aria-hidden="true" />

    <div className="hh-main">
      <div className="hh-left">
        <span className="hh-saludo">{getSaludo()}</span>
        <h1 className="hh-name">{userName || 'Bienvenido'}</h1>
        <p className="hh-date">
          {formatDate()}
          {tagline && <span className="hh-tagline"> · {tagline}</span>}
        </p>
      </div>

      {stats && stats.length > 0 && (
        <div className="hh-stats" role="list">
          {stats.map((s) => {
            const cuerpo = (
              <>
                <span className="hh-stat-value">{s.value}</span>
                <span className="hh-stat-label">{s.label}</span>
              </>
            );

            // Un ancla de la misma página va con <a> nativo: React Router
            // actualiza el hash pero no scrollea, y el enlace no haría nada.
            if (s.to?.startsWith('#')) {
              return (
                <a href={s.to} className="hh-stat hh-stat--link" role="listitem" key={s.label}>
                  {cuerpo}
                </a>
              );
            }

            return s.to ? (
              <Link
                to={s.to}
                className="hh-stat hh-stat--link"
                role="listitem"
                key={s.label}
              >
                {cuerpo}
              </Link>
            ) : (
              <div className="hh-stat" role="listitem" key={s.label}>
                {cuerpo}
              </div>
            );
          })}
        </div>
      )}
    </div>

    {notice && <div className="hh-notice">{notice}</div>}
  </section>
);

export default HomeHero;
