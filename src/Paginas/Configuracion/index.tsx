import React, { useCallback, useEffect, useState } from 'react';
import Footer from '../../Componentes/footer';
import ProfileImage from '../../Componentes/ProfileImage';
import { usePageTitle } from '../../hooks/usePageTitle';
import api from '../../api';
import type { Perfil } from '../../Types/perfil';
import { estadoDeError, mensajeDeError } from '../../utils/apiError';
import { getUsuarioSesion, updateUsuarioSesion } from '../../utils/session';
import { setTema } from '../../utils/theme';
import ImagenPerfil from './secciones/ImagenPerfil';
import DatosPersonales from './secciones/DatosPersonales';
import Ubicacion from './secciones/Ubicacion';
import Preferencias from './secciones/Preferencias';
import Seguridad from './secciones/Seguridad';
import './configuracion.css';

/* ─────────────────────────────────────────────
   MI PERFIL — configuración de la cuenta.

   En pestañas y no en un scroll largo: son seis
   temas que se tocan en momentos distintos (la foto
   una vez, la contraseña casi nunca), y cada uno
   guarda por separado contra su propio endpoint.

   Las cuentas sin perfil en la tabla usuario
   (gestor / director) reciben 403: para ellas queda
   sólo Preferencias, guardadas localmente.
───────────────────────────────────────────── */

type TabId = 'imagen' | 'datos' | 'ubicacion' | 'preferencias' | 'seguridad';

/**
 * 'sin-perfil' es exclusivamente el 403 del backend (gestor / director).
 * 'error' es todo lo demás: un fallo de carga no puede disfrazarse de
 * "tu cuenta no admite perfil".
 */
type EstadoCarga = 'cargando' | 'listo' | 'sin-perfil' | 'error';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const trazo = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const TABS: Tab[] = [
  {
    id: 'imagen',
    label: 'Imagen',
    icon: (
      <svg viewBox="0 0 24 24" {...trazo}><circle cx="12" cy="8.5" r="4" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>
    ),
  },
  {
    id: 'datos',
    label: 'Datos personales',
    icon: (
      <svg viewBox="0 0 24 24" {...trazo}><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M8 10h.01M12 10h4M8 14h8" /></svg>
    ),
  },
  {
    id: 'ubicacion',
    label: 'Ubicación',
    icon: (
      <svg viewBox="0 0 24 24" {...trazo}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
    ),
  },
  {
    id: 'preferencias',
    label: 'Preferencias',
    icon: (
      <svg viewBox="0 0 24 24" {...trazo}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2.4" /><circle cx="10" cy="17" r="2.4" /></svg>
    ),
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
    icon: (
      <svg viewBox="0 0 24 24" {...trazo}><rect x="4" y="10" width="16" height="10" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
    ),
  },
];

const DESCRIPCIONES: Record<TabId, string> = {
  imagen: 'Elegí cómo te ven en el campus: un avatar NEXIA o tu propia foto.',
  datos: 'Tu información personal dentro de la plataforma.',
  ubicacion: 'Dónde estás. Es opcional y sólo lo ve tu institución.',
  preferencias: 'Cómo se ve NEXIA y qué avisos recibís.',
  seguridad: 'Cambiá la contraseña con la que entrás.',
};

const Configuracion: React.FC = () => {
  usePageTitle('Mi perfil');

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [errorCarga, setErrorCarga] = useState('');
  /** Se incrementa para reintentar la carga. */
  const [intento, setIntento] = useState(0);
  const [tab, setTab] = useState<TabId>('imagen');

  const sinPerfil = estado === 'sin-perfil';

  /**
   * Toda respuesta del backend pasa por acá: además del estado local,
   * refresca la sesión guardada para que la sidebar y el resto de la app
   * muestren el nombre y la imagen nuevos sin recargar.
   */
  const aplicarPerfil = useCallback((p: Perfil) => {
    setPerfil(p);
    updateUsuarioSesion({
      nombre: p.nombre,
      apellido: p.apellido,
      avatar_config: p.avatar_config ?? null,
      foto_perfil_url: p.foto_perfil_url ?? null,
    });
  }, []);

  useEffect(() => {
    let vivo = true;

    (async () => {
      try {
        const res = await api.get('/api/perfil/me');
        if (!vivo) return;
        const p: Perfil = res.data.data;
        aplicarPerfil(p);
        // El tema del backend manda: es la preferencia multi-dispositivo.
        if (p.tema === 'claro' || p.tema === 'oscuro') setTema(p.tema);
        setEstado('listo');
      } catch (err) {
        if (!vivo) return;
        // SÓLO el 403 significa "esta cuenta no tiene perfil" (gestor/director):
        // es lo único que el backend usa para decirlo. Cualquier otro fallo
        // —404 porque la ruta no existe, 500, red caída— es un error real y hay
        // que mostrarlo. Degradarlo a "no podés editar tu perfil" oculta el
        // problema y le miente al usuario.
        if (estadoDeError(err) === 403) {
          setEstado('sin-perfil');
          setTab('preferencias');
        } else {
          setErrorCarga(mensajeDeError(err, 'No pudimos cargar tu perfil'));
          setEstado('error');
        }
      }
    })();

    return () => { vivo = false; };
  }, [aplicarPerfil, intento]);

  const reintentar = () => {
    setEstado('cargando');
    setIntento((n) => n + 1);
  };

  if (estado === 'cargando') {
    return (
      <>
        <div className="main-wrapper">
          <main className="main-content">
            <div className="nexia-status-container">
              <div className="nexia-loading-spinner" />
              <span>Cargando tu perfil…</span>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (estado === 'error') {
    return (
      <>
        <div className="main-wrapper">
          <main className="main-content">
            <header className="page-header">
              <div>
                <h1 className="page-title">Mi perfil</h1>
              </div>
            </header>
            <div className="cfg-layout">
              <section className="cfg-card cfg-error">
                <svg viewBox="0 0 24 24" {...trazo} aria-hidden="true">
                  <circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16v.5" />
                </svg>
                <h2 className="cfg-error-titulo">No pudimos cargar tu perfil</h2>
                <p className="cfg-error-msg">{errorCarga}</p>
                <button type="button" className="cfg-btn cfg-btn--primary" onClick={reintentar}>
                  Reintentar
                </button>
              </section>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  const sesion = getUsuarioSesion();
  const nombre = perfil ? `${perfil.nombre} ${perfil.apellido}`.trim() : (sesion?.nombre as string) ?? 'Tu cuenta';
  const tabsVisibles = sinPerfil ? TABS.filter((t) => t.id === 'preferencias') : TABS;

  return (
    <>
      <div className="main-wrapper">
        <main className="main-content">
          <header className="page-header">
            <div>
              <h1 className="page-title">Mi perfil</h1>
              <p className="page-subtitle">
                Gestioná tu identidad y tus preferencias dentro del campus.
              </p>
            </div>
          </header>

          <div className="cfg-layout">
            {/* ── Identidad ── */}
            <section className="cfg-hero">
              <ProfileImage
                usuario={perfil}
                size={72}
                nombre={perfil?.nombre ?? (sesion?.nombre as string)}
                apellido={perfil?.apellido ?? (sesion?.apellido as string)}
              />
              <div className="cfg-hero-info">
                <h2 className="cfg-hero-nombre">{nombre}</h2>
                <p className="cfg-hero-meta">
                  {perfil?.email ?? 'Cuenta institucional'}
                  {perfil?.rol && <span className="cfg-hero-rol">{perfil.rol}</span>}
                </p>
              </div>
            </section>

            {sinPerfil && (
              <p className="cfg-aviso cfg-aviso--bloque">
                <svg viewBox="0 0 24 24" {...trazo} aria-hidden="true">
                  <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5v.5" />
                </svg>
                Tu cuenta no tiene un perfil personal editable. Podés ajustar la apariencia
                de la plataforma en este dispositivo.
              </p>
            )}

            {/* ── Navegación de secciones ── */}
            {!sinPerfil && (
              <nav className="cfg-tabs" role="tablist" aria-label="Secciones del perfil">
                {tabsVisibles.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    id={`cfg-tab-${t.id}`}
                    aria-selected={tab === t.id}
                    aria-controls={`cfg-panel-${t.id}`}
                    className={`cfg-tab${tab === t.id ? ' is-active' : ''}`}
                    onClick={() => setTab(t.id)}
                  >
                    <span className="cfg-tab-icon">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </nav>
            )}

            {/* ── Sección activa ── */}
            <section
              className="cfg-card"
              role="tabpanel"
              id={`cfg-panel-${tab}`}
              aria-labelledby={`cfg-tab-${tab}`}
              tabIndex={-1}
            >
              <div className="cfg-card-head">
                <h2 className="cfg-card-title">
                  {TABS.find((t) => t.id === tab)?.label}
                </h2>
                <p className="cfg-card-desc">{DESCRIPCIONES[tab]}</p>
              </div>

              {tab === 'imagen' && perfil && (
                <ImagenPerfil perfil={perfil} onActualizado={aplicarPerfil} />
              )}
              {tab === 'datos' && perfil && (
                <DatosPersonales key={perfil.usuario_id} perfil={perfil} onActualizado={aplicarPerfil} />
              )}
              {tab === 'ubicacion' && perfil && (
                <Ubicacion key={perfil.usuario_id} perfil={perfil} onActualizado={aplicarPerfil} />
              )}
              {tab === 'preferencias' && (
                <Preferencias perfil={perfil} onActualizado={aplicarPerfil} />
              )}
              {tab === 'seguridad' && perfil && <Seguridad />}
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Configuracion;
