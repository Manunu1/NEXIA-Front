import type { ReactNode } from 'react';
import type { Rol } from '../../utils/session';

/* ─────────────────────────────────────────────
   NAVEGACIÓN POR ROL — fuente única de verdad.
   La Sidebar se renderiza siempre a partir de esta
   configuración según el rol de la sesión activa,
   de modo que ninguna página pueda mostrar la
   navegación de otro perfil.
───────────────────────────────────────────── */

export { getRolActual } from '../../utils/session';
export type { Rol } from '../../utils/session';

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  /** Rutas que activan el item. Sufijo '*' = coincidencia por prefijo. */
  match: string[];
  badge?: 'plus';
}

export interface NavSection {
  label: string | null;
  items: NavItem[];
}

/** Ruta de inicio de cada rol (destino del logo). */
export const HOME_BY_ROL: Record<Rol, string> = {
  alumno: '/alumnos',
  profesor: '/profesor',
  gestor: '/gestor',
};

/* ── Iconos (trazos estilo Lucide, stroke 2) ── */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const IconHome = (
  <svg viewBox="0 0 24 24" {...stroke}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconBoletin = (
  <svg viewBox="0 0 24 24" {...stroke}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const IconApuntes = (
  <svg viewBox="0 0 24 24" {...stroke}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconCursos = (
  <svg viewBox="0 0 24 24" {...stroke}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const IconCalendario = (
  <svg viewBox="0 0 24 24" {...stroke}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconMensajes = (
  <svg viewBox="0 0 24 24" {...stroke}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconComunicados = (
  <svg viewBox="0 0 24 24" {...stroke}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconNexia = (
  <svg viewBox="0 0 24 24" {...stroke}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconConfig = (
  <svg viewBox="0 0 24 24" {...stroke}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconPanel = (
  <svg viewBox="0 0 24 24" {...stroke}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconAlumnos = (
  <svg viewBox="0 0 24 24" {...stroke}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconAsignaciones = (
  <svg viewBox="0 0 24 24" {...stroke}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

/* ── Items compartidos entre alumno y profesor ── */

const ITEMS_GENERALES: NavItem[] = [
  { to: '/calendario', label: 'Calendario', icon: IconCalendario, match: ['/calendario'] },
  { to: '/mensajes', label: 'Mensajes', icon: IconMensajes, match: ['/mensajes'] },
  { to: '/comunicados', label: 'Comunicados', icon: IconComunicados, match: ['/comunicados'] },
  { to: '/nexia-ia', label: 'Nexia IA', icon: IconNexia, match: ['/nexia-ia'], badge: 'plus' },
  { to: '/configuracion', label: 'Configuración', icon: IconConfig, match: ['/configuracion'] },
];

export const NAV_BY_ROL: Record<Rol, NavSection[]> = {
  alumno: [
    {
      label: 'Académico',
      items: [
        {
          to: '/alumnos',
          label: 'Mis materias',
          icon: IconHome,
          match: ['/alumnos', '/materia/*', '/trabajo-practico/*', '/verContenido/*'],
        },
        { to: '/boletin', label: 'Mi boletín', icon: IconBoletin, match: ['/boletin'] },
        { to: '/apuntes', label: 'Apuntes', icon: IconApuntes, match: ['/apuntes'] },
      ],
    },
    { label: 'General', items: ITEMS_GENERALES },
  ],

  profesor: [
    {
      label: 'Académico',
      items: [
        {
          to: '/profesor',
          label: 'Mis cursos',
          icon: IconCursos,
          match: [
            '/profesor',
            '/contenidos/*',
            '/crear-contenido/*',
            '/editar-contenido/*',
            '/trabajos-practicos/*',
            '/crear-trabajo-practico/*',
            '/trabajo-practico/*',
            '/notas/*',
            '/verContenido/*',
          ],
        },
      ],
    },
    { label: 'General', items: ITEMS_GENERALES },
  ],

  gestor: [
    {
      label: 'Gestión',
      items: [
        { to: '/gestor', label: 'Panel principal', icon: IconPanel, match: ['/gestor'] },
        { to: '/gestor/alumnos', label: 'Alumnos', icon: IconAlumnos, match: ['/gestor/alumnos'] },
        { to: '/gestor/profesores', label: 'Profesores', icon: IconCursos, match: ['/gestor/profesores'] },
        { to: '/gestor/asignaciones', label: 'Asignaciones', icon: IconAsignaciones, match: ['/gestor/asignaciones'] },
      ],
    },
    {
      label: 'General',
      items: [
        { to: '/comunicados', label: 'Comunicados', icon: IconComunicados, match: ['/comunicados'] },
        { to: '/configuracion', label: 'Configuración', icon: IconConfig, match: ['/configuracion'] },
      ],
    },
  ],
};
