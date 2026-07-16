import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../Componentes/Sidebar';
import Footer from '../../Componentes/footer';
import { usePageTitle } from '../../hooks/usePageTitle';
import api from '../../api';
import { setTema, getTemaGuardado, type Tema } from '../../utils/theme';
import { getUsuarioSesion } from '../../utils/session';
import './configuracion.css';

/* ─────────────────────────────────────────────
   CONFIGURACIÓN — el usuario personaliza su perfil
   (nombre, email, foto) y sus preferencias (tema,
   idioma, notificaciones). El tema se aplica al
   instante; el resto se guarda al confirmar.
───────────────────────────────────────────── */

interface Perfil {
  usuario_id: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  rol: string;
  foto_perfil_url: string | null;
  tema: Tema;
  idioma: string;
  notificaciones_email: boolean;
}

type Estado = 'idle' | 'loading' | 'success' | 'error';

const IDIOMAS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
];

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const IconSun = (
  <svg viewBox="0 0 24 24" {...stroke} aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const IconMoon = (
  <svg viewBox="0 0 24 24" {...stroke} aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

const IconCamera = (
  <svg viewBox="0 0 24 24" {...stroke} aria-hidden="true">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const iniciales = (nombre: string, apellido: string) =>
  `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase() || 'US';

const Configuracion: React.FC = () => {
  usePageTitle('Configuración');
  const fileRef = useRef<HTMLInputElement>(null);

  const [cargando, setCargando] = useState(true);
  // Gestor/Directivo no tienen perfil en la tabla usuario: sólo pueden
  // ajustar apariencia, que se persiste localmente.
  const [sinPerfil, setSinPerfil] = useState(false);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [rol, setRol] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [tema, setTemaState] = useState<Tema>(getTemaGuardado());
  const [idioma, setIdioma] = useState('es');
  const [notiEmail, setNotiEmail] = useState(true);

  // Estado de guardado del bloque perfil/preferencias
  const [estado, setEstado] = useState<Estado>('idle');
  const [mensaje, setMensaje] = useState('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  // Estado del bloque de contraseña
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [estadoPass, setEstadoPass] = useState<Estado>('idle');
  const [mensajePass, setMensajePass] = useState('');

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const res = await api.get('/api/usuarios/me');
        if (!vivo) return;
        const p: Perfil = res.data.data;
        setNombre(p.nombre ?? '');
        setApellido(p.apellido ?? '');
        setEmail(p.email ?? '');
        setDni(p.dni ?? '');
        setRol(p.rol ?? '');
        setFotoUrl(p.foto_perfil_url ?? null);
        setIdioma(p.idioma ?? 'es');
        setNotiEmail(p.notificaciones_email ?? true);
        // El tema del backend manda sobre el local (persistencia multi-dispositivo)
        if (p.tema === 'claro' || p.tema === 'oscuro') {
          setTemaState(p.tema);
          setTema(p.tema);
        }
      } catch (err: unknown) {
        if (!vivo) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          // Cuenta sin perfil editable (gestor/directivo): modo apariencia
          setSinPerfil(true);
          const sesion = getUsuarioSesion();
          setNombre((sesion?.nombre as string) ?? '');
          setApellido((sesion?.apellido as string) ?? '');
        }
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => { vivo = false; };
  }, []);

  // El tema se aplica de inmediato al tocarlo (feedback instantáneo)
  const elegirTema = (t: Tema) => {
    setTemaState(t);
    setTema(t);
  };

  const abrirSelectorFoto = () => fileRef.current?.click();

  const onFotoSeleccionada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setSubiendoFoto(true);
    setEstado('idle');
    setMensaje('');
    try {
      const form = new FormData();
      form.append('imagen', file);
      // Sin fijar Content-Type: axios agrega el boundary del multipart solo.
      const res = await api.post('/api/usuarios/me/foto', form);
      setFotoUrl(res.data.data.url);
    } catch (err: unknown) {
      setEstado('error');
      setMensaje(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'No se pudo subir la imagen'
      );
    } finally {
      setSubiendoFoto(false);
    }
  };

  const quitarFoto = () => setFotoUrl(null);

  const guardar = async () => {
    setEstado('loading');
    setMensaje('');

    // Cuentas sin perfil: sólo persistimos apariencia localmente
    if (sinPerfil) {
      setTema(tema);
      localStorage.setItem('idioma', idioma);
      setEstado('success');
      setMensaje('Preferencias guardadas');
      return;
    }

    try {
      const res = await api.put('/api/usuarios/me', {
        nombre,
        apellido,
        email,
        foto_perfil_url: fotoUrl,
        tema,
        idioma,
        notificaciones_email: notiEmail,
      });
      const p: Perfil = res.data.data;

      // Reflejar los cambios en la sesión local (Sidebar, saludos, etc.)
      const sesion = getUsuarioSesion() ?? {};
      localStorage.setItem(
        'usuario',
        JSON.stringify({
          ...sesion,
          nombre: p.nombre,
          apellido: p.apellido,
          email: p.email,
          foto_perfil_url: p.foto_perfil_url,
        })
      );
      localStorage.setItem('idioma', p.idioma);

      setEstado('success');
      setMensaje('Configuración actualizada correctamente');
    } catch (err: unknown) {
      setEstado('error');
      setMensaje(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'No se pudieron guardar los cambios'
      );
    }
  };

  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstadoPass('idle');
    setMensajePass('');

    if (passNueva.length < 6) {
      setEstadoPass('error');
      setMensajePass('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (passNueva !== passConfirm) {
      setEstadoPass('error');
      setMensajePass('Las contraseñas no coinciden');
      return;
    }

    setEstadoPass('loading');
    try {
      await api.put('/api/usuarios/me/password', {
        passwordActual: passActual,
        passwordNueva: passNueva,
      });
      setEstadoPass('success');
      setMensajePass('Contraseña actualizada correctamente');
      setPassActual('');
      setPassNueva('');
      setPassConfirm('');
    } catch (err: unknown) {
      setEstadoPass('error');
      setMensajePass(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'No se pudo cambiar la contraseña'
      );
    }
  };

  if (cargando) {
    return (
      <>
        <Sidebar />
        <div className="main-wrapper">
          <main className="main-content">
            <div className="nexia-status-container">
              <div className="nexia-loading-spinner" />
              <span>Cargando tu configuración…</span>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <header className="page-header">
            <div>
              <h1 className="page-title">Configuración</h1>
              <p className="page-subtitle">
                Personalizá tu perfil y las preferencias de la plataforma.
              </p>
            </div>
          </header>

          <div className="cfg-layout">
            {/* ── Perfil ── */}
            {!sinPerfil && (
              <section className="cfg-card">
                <div className="cfg-card-head">
                  <h2 className="cfg-card-title">Perfil</h2>
                  <p className="cfg-card-desc">
                    Tu información visible en la plataforma.
                  </p>
                </div>

                <div className="cfg-profile">
                  <div className="cfg-avatar-block">
                    <div className="cfg-avatar">
                      {fotoUrl ? (
                        <img src={fotoUrl} alt="Foto de perfil" />
                      ) : (
                        <span className="cfg-avatar-fallback">
                          {iniciales(nombre, apellido)}
                        </span>
                      )}
                      <button
                        type="button"
                        className="cfg-avatar-btn"
                        onClick={abrirSelectorFoto}
                        disabled={subiendoFoto}
                        aria-label="Cambiar foto de perfil"
                      >
                        {subiendoFoto ? <span className="cfg-mini-spinner" /> : IconCamera}
                      </button>
                    </div>
                    <div className="cfg-avatar-actions">
                      <button
                        type="button"
                        className="cfg-link-btn"
                        onClick={abrirSelectorFoto}
                        disabled={subiendoFoto}
                      >
                        {subiendoFoto ? 'Subiendo…' : 'Cambiar foto'}
                      </button>
                      {fotoUrl && (
                        <button
                          type="button"
                          className="cfg-link-btn cfg-link-btn--danger"
                          onClick={quitarFoto}
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      hidden
                      onChange={onFotoSeleccionada}
                    />
                  </div>

                  <div className="cfg-fields">
                    <div className="cfg-row">
                      <div className="nx-field">
                        <label className="nx-label" htmlFor="cfg-nombre">Nombre</label>
                        <input
                          id="cfg-nombre"
                          className="nx-control"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                        />
                      </div>
                      <div className="nx-field">
                        <label className="nx-label" htmlFor="cfg-apellido">Apellido</label>
                        <input
                          id="cfg-apellido"
                          className="nx-control"
                          value={apellido}
                          onChange={(e) => setApellido(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="nx-field">
                      <label className="nx-label" htmlFor="cfg-email">Email</label>
                      <input
                        id="cfg-email"
                        type="email"
                        className="nx-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="cfg-row">
                      <div className="nx-field">
                        <label className="nx-label">DNI</label>
                        <input className="nx-control" value={dni} disabled />
                        <p className="nx-hint">Lo gestiona la institución.</p>
                      </div>
                      <div className="nx-field">
                        <label className="nx-label">Rol</label>
                        <input className="nx-control" value={rol} disabled />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── Apariencia ── */}
            <section className="cfg-card">
              <div className="cfg-card-head">
                <h2 className="cfg-card-title">Apariencia</h2>
                <p className="cfg-card-desc">
                  Elegí cómo se ve NEXIA para vos.
                </p>
              </div>

              <div className="cfg-setting">
                <div className="cfg-setting-info">
                  <span className="cfg-setting-label">Tema</span>
                  <span className="cfg-setting-sub">Se aplica al instante.</span>
                </div>
                <div className="cfg-theme-toggle" role="radiogroup" aria-label="Tema">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={tema === 'claro'}
                    className={`cfg-theme-opt${tema === 'claro' ? ' is-active' : ''}`}
                    onClick={() => elegirTema('claro')}
                  >
                    {IconSun} Claro
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={tema === 'oscuro'}
                    className={`cfg-theme-opt${tema === 'oscuro' ? ' is-active' : ''}`}
                    onClick={() => elegirTema('oscuro')}
                  >
                    {IconMoon} Oscuro
                  </button>
                </div>
              </div>

              <div className="cfg-divider" />

              <div className="cfg-setting">
                <div className="cfg-setting-info">
                  <span className="cfg-setting-label">Idioma</span>
                  <span className="cfg-setting-sub">Idioma de la interfaz.</span>
                </div>
                <select
                  className="nx-control cfg-select"
                  value={idioma}
                  onChange={(e) => setIdioma(e.target.value)}
                >
                  {IDIOMAS.map((i) => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                </select>
              </div>
            </section>

            {/* ── Notificaciones ── */}
            {!sinPerfil && (
              <section className="cfg-card">
                <div className="cfg-card-head">
                  <h2 className="cfg-card-title">Notificaciones</h2>
                  <p className="cfg-card-desc">
                    Controlá qué avisos recibís.
                  </p>
                </div>

                <div className="cfg-setting">
                  <div className="cfg-setting-info">
                    <span className="cfg-setting-label">Notificaciones por email</span>
                    <span className="cfg-setting-sub">
                      Novedades, comunicados y recordatorios en tu correo.
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notiEmail}
                    className={`cfg-switch${notiEmail ? ' is-on' : ''}`}
                    onClick={() => setNotiEmail((v) => !v)}
                  >
                    <span className="cfg-switch-knob" />
                  </button>
                </div>
              </section>
            )}

            {/* ── Barra de guardado ── */}
            <div className="cfg-savebar">
              {mensaje && (
                <span className={`cfg-msg cfg-msg--${estado === 'error' ? 'error' : 'ok'}`}>
                  {mensaje}
                </span>
              )}
              <button
                type="button"
                className="cfg-btn cfg-btn--primary"
                onClick={guardar}
                disabled={estado === 'loading'}
              >
                {estado === 'loading' ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>

            {/* ── Seguridad ── */}
            {!sinPerfil && (
              <section className="cfg-card">
                <div className="cfg-card-head">
                  <h2 className="cfg-card-title">Seguridad</h2>
                  <p className="cfg-card-desc">
                    Cambiá tu contraseña de acceso.
                  </p>
                </div>

                <form className="cfg-fields" onSubmit={cambiarPassword}>
                  <div className="nx-field">
                    <label className="nx-label" htmlFor="cfg-pass-actual">
                      Contraseña actual
                    </label>
                    <input
                      id="cfg-pass-actual"
                      type="password"
                      className="nx-control"
                      autoComplete="current-password"
                      value={passActual}
                      onChange={(e) => setPassActual(e.target.value)}
                    />
                  </div>
                  <div className="cfg-row">
                    <div className="nx-field">
                      <label className="nx-label" htmlFor="cfg-pass-nueva">
                        Nueva contraseña
                      </label>
                      <input
                        id="cfg-pass-nueva"
                        type="password"
                        className="nx-control"
                        autoComplete="new-password"
                        value={passNueva}
                        onChange={(e) => setPassNueva(e.target.value)}
                      />
                    </div>
                    <div className="nx-field">
                      <label className="nx-label" htmlFor="cfg-pass-confirm">
                        Repetir contraseña
                      </label>
                      <input
                        id="cfg-pass-confirm"
                        type="password"
                        className="nx-control"
                        autoComplete="new-password"
                        value={passConfirm}
                        onChange={(e) => setPassConfirm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="cfg-savebar cfg-savebar--inline">
                    {mensajePass && (
                      <span className={`cfg-msg cfg-msg--${estadoPass === 'error' ? 'error' : 'ok'}`}>
                        {mensajePass}
                      </span>
                    )}
                    <button
                      type="submit"
                      className="cfg-btn cfg-btn--ghost"
                      disabled={estadoPass === 'loading'}
                    >
                      {estadoPass === 'loading' ? 'Actualizando…' : 'Actualizar contraseña'}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Configuracion;
