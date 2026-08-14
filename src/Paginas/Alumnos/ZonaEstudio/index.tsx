import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Footer from '../../../Componentes/footer';
import Pomodoro from '../../../Componentes/Estudio/Pomodoro';
import Objetivos from '../../../Componentes/Estudio/Objetivos';
import PanelMazos from '../../../Componentes/Estudio/Mazos';
import PanelMapas from '../../../Componentes/Estudio/Mapas';
import PanelApuntes from '../../../Componentes/Estudio/Apuntes';
import Repaso from '../../../Componentes/Estudio/Repaso';
import api from '../../../api';
import { usePomodoro } from '../../../hooks/usePomodoro';
import { mensajeDeError } from '../../../utils/apiError';
import { usePageTitle } from '../../../hooks/usePageTitle';
import type { Objetivo, ResumenEstudio } from '../../../Types/estudio';
import './zonaEstudio.css';

/* ─────────────────────────────────────────────
   ZONA DE ESTUDIO.

   Cuatro herramientas, un solo lugar. La pregunta
   de diseño era si mostrarlas todas juntas o
   separarlas, y la respuesta salió de cómo se usan:

   - El Pomodoro es el marco. Corre MIENTRAS usás
     todo lo demás, así que no puede estar dentro
     de una pestaña que se desmonta.
   - Las tarjetas, los apuntes y los mapas son
     excluyentes: nadie edita un mapa y repasa
     tarjetas al mismo tiempo.

   De ahí el layout: el temporizador y los objetivos
   fijos arriba, y abajo un cambiador para las tres
   herramientas. Ponerlas todas a la vez habría dado
   el dashboard saturado que hay que evitar.

   El panel activo va en la URL para que el alumno
   pueda volver a "sus apuntes" con el botón atrás
   del navegador y guardar el enlace.
───────────────────────────────────────────── */

type Panel = 'tarjetas' | 'apuntes' | 'mapas';

const PANELES: { key: Panel; nombre: string; icono: React.ReactNode }[] = [
  {
    key: 'tarjetas',
    nombre: 'Tarjetas',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="14" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
      </svg>
    ),
  },
  {
    key: 'apuntes',
    nombre: 'Apuntes',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    key: 'mapas',
    nombre: 'Mapas',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="19" r="2.5" /><circle cx="19" cy="19" r="2.5" />
        <line x1="10.6" y1="7.3" x2="6.4" y2="16.7" /><line x1="13.4" y1="7.3" x2="17.6" y2="16.7" />
      </svg>
    ),
  },
];

function esPanel(v: string | null): v is Panel {
  return v === 'tarjetas' || v === 'apuntes' || v === 'mapas';
}

const ZonaEstudio: React.FC = () => {
  usePageTitle('Zona de estudio');

  const [params, setParams] = useSearchParams();
  const panel: Panel = esPanel(params.get('panel')) ? (params.get('panel') as Panel) : 'tarjetas';

  const [resumen, setResumen] = useState<ResumenEstudio | null>(null);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [error, setError] = useState('');
  const [repasoAbierto, setRepasoAbierto] = useState(false);

  const cargarResumen = useCallback(async () => {
    try {
      const res = await api.get('/api/estudio/resumen');
      const data: ResumenEstudio = res.data.data;
      setResumen(data);
      setObjetivos(data.objetivos || []);
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo cargar tu actividad de estudio.'));
    }
  }, []);

  useEffect(() => {
    let vigente = true;
    const cargar = async () => {
      try {
        const res = await api.get('/api/estudio/resumen');
        if (!vigente) return;
        const data: ResumenEstudio = res.data.data;
        setResumen(data);
        setObjetivos(data.objetivos || []);
      } catch (err) {
        if (vigente) setError(mensajeDeError(err, 'No se pudo cargar tu actividad de estudio.'));
      }
    };
    cargar();
    return () => { vigente = false; };
  }, []);

  /* Cada pomodoro terminado le suma al objetivo vinculado. Es lo que
     conecta el temporizador con la planificación: sin esto, la estimación
     en pomodoros nunca se contrastaría con la realidad.

     El id del objetivo llega por parámetro desde el hook, no leyendo
     `motor.objetivoId`: este callback se define antes que `motor`. */
  const alTerminarEnfoque = useCallback(async (_minutos: number, objetivoId: number | null) => {
    if (!objetivoId) return;
    try {
      const res = await api.post(`/api/estudio/objetivos/${objetivoId}/pomodoro`);
      setObjetivos((prev) => prev.map((o) => (o.id === objetivoId ? res.data.data : o)));
    } catch {
      /* Que no se registre el pomodoro no debe interrumpir el estudio. */
    }
  }, []);

  const motor = usePomodoro(alTerminarEnfoque);

  const terminarSesion = async () => {
    const sesion = motor.terminarSesion();
    if (sesion.minutos_enfoque === 0 && sesion.ciclos_completados === 0) return;

    try {
      await api.post('/api/estudio/sesiones', sesion);
      cargarResumen();
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo guardar la sesión.'));
    }
  };

  // ── Objetivos ─────────────────────────────

  const crearObjetivo = async (texto: string, estimados: number) => {
    const res = await api.post('/api/estudio/objetivos', { texto, pomodoros_estimados: estimados });
    setObjetivos((prev) => [...prev, res.data.data]);
  };

  const alternarObjetivo = async (o: Objetivo) => {
    // Optimista: tildar tiene que sentirse inmediato.
    setObjetivos((prev) => prev.map((x) => (x.id === o.id ? { ...x, completado: !x.completado } : x)));
    try {
      const res = await api.patch(`/api/estudio/objetivos/${o.id}`, { completado: !o.completado });
      setObjetivos((prev) => prev.map((x) => (x.id === o.id ? res.data.data : x)));
    } catch {
      setObjetivos((prev) => prev.map((x) => (x.id === o.id ? o : x)));
    }
  };

  const eliminarObjetivo = async (o: Objetivo) => {
    setObjetivos((prev) => prev.filter((x) => x.id !== o.id));
    if (motor.objetivoId === o.id) motor.setObjetivoId(null);
    try {
      await api.delete(`/api/estudio/objetivos/${o.id}`);
    } catch {
      setObjetivos((prev) => [...prev, o]);
    }
  };

  const limpiarCompletados = async () => {
    const previos = objetivos;
    setObjetivos((prev) => prev.filter((o) => !o.completado));
    try {
      await api.delete('/api/estudio/objetivos/completados');
    } catch {
      setObjetivos(previos);
    }
  };

  // ── Resumen ───────────────────────────────

  const maxMinutos = useMemo(
    () => Math.max(1, ...(resumen?.por_dia ?? []).map((d) => d.minutos)),
    [resumen]
  );

  const horasHoy = resumen ? Math.floor(resumen.totales.minutos_hoy / 60) : 0;
  const minutosHoy = resumen ? resumen.totales.minutos_hoy % 60 : 0;

  const cambiarPanel = (p: Panel) => {
    // replace: cambiar de herramienta no debería llenar el historial.
    setParams({ panel: p }, { replace: true });
  };

  return (
    <>
      <div className="main-wrapper">
        <main className="main-content">

          <div className="page-header">
            <div>
              <h1 className="page-title">Zona de estudio</h1>
              <p className="page-subtitle">
                Tu espacio para concentrarte, repasar y organizar lo que estás aprendiendo
              </p>
            </div>
          </div>

          {error && <div className="alert-error" role="alert">{error}</div>}

          {/* ── Métricas ── */}
          {resumen && (
            <section className="ze-metricas" aria-label="Tu actividad">
              <div className="ze-metrica">
                <span className="ze-metrica-valor">
                  {horasHoy > 0 ? `${horasHoy}h ${minutosHoy}m` : `${minutosHoy}m`}
                </span>
                <span className="ze-metrica-label">Hoy</span>
              </div>

              <div className="ze-metrica">
                <span className="ze-metrica-valor">{resumen.totales.ciclos_hoy}</span>
                <span className="ze-metrica-label">Pomodoros hoy</span>
              </div>

              <div className="ze-metrica">
                <span className="ze-metrica-valor">
                  {resumen.racha}
                  {resumen.racha > 0 && <span className="ze-metrica-fuego" aria-hidden="true">·</span>}
                </span>
                <span className="ze-metrica-label">
                  {resumen.racha === 1 ? 'Día seguido' : 'Días seguidos'}
                </span>
              </div>

              <button
                type="button"
                className={`ze-metrica ze-metrica--accion${resumen.tarjetas_pendientes > 0 ? ' ze-metrica--urgente' : ''}`}
                onClick={() => (resumen.tarjetas_pendientes > 0 ? setRepasoAbierto(true) : cambiarPanel('tarjetas'))}
              >
                <span className="ze-metrica-valor">{resumen.tarjetas_pendientes}</span>
                <span className="ze-metrica-label">
                  {resumen.tarjetas_pendientes > 0 ? 'Tarjetas · repasar' : 'Tarjetas para hoy'}
                </span>
              </button>

              {/* Gráfico de los últimos 14 días. Los días sin estudiar vienen
                  del backend como barras en cero: si se omitieran, dos días
                  salteados se verían como días consecutivos. */}
              <div className="ze-grafico" aria-hidden="true">
                {resumen.por_dia.map((d) => (
                  <div
                    className="ze-grafico-col"
                    key={d.dia}
                    title={`${new Date(d.dia).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}: ${d.minutos} min`}
                  >
                    <div
                      className={`ze-grafico-barra${d.minutos > 0 ? '' : ' ze-grafico-barra--vacia'}`}
                      style={{ height: `${Math.max((d.minutos / maxMinutos) * 100, 4)}%` }}
                    />
                  </div>
                ))}
              </div>
              <span className="ze-grafico-pie">Últimos 14 días</span>
            </section>
          )}

          {/* ── Sesión: temporizador + objetivos ── */}
          <section className="ze-sesion">
            <Pomodoro motor={motor} objetivos={objetivos} onTerminarSesion={terminarSesion} />
            <Objetivos
              objetivos={objetivos}
              onCrear={crearObjetivo}
              onAlternar={alternarObjetivo}
              onEliminar={eliminarObjetivo}
              onLimpiarCompletados={limpiarCompletados}
              objetivoActivoId={motor.objetivoId}
            />
          </section>

          {/* ── Herramientas ── */}
          <section className="ze-herramientas">
            <div className="ze-tabs" role="tablist" aria-label="Herramientas de estudio">
              {PANELES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  role="tab"
                  id={`ze-tab-${p.key}`}
                  aria-selected={panel === p.key}
                  aria-controls={`ze-panel-${p.key}`}
                  className={`ze-tab${panel === p.key ? ' ze-tab--activo' : ''}`}
                  onClick={() => cambiarPanel(p.key)}
                >
                  <span className="ze-tab-icono" aria-hidden="true">{p.icono}</span>
                  {p.nombre}
                  {p.key === 'tarjetas' && resumen && resumen.tarjetas_pendientes > 0 && (
                    <span className="ze-tab-badge">{resumen.tarjetas_pendientes}</span>
                  )}
                </button>
              ))}
            </div>

            <div
              className="ze-panel"
              role="tabpanel"
              id={`ze-panel-${panel}`}
              aria-labelledby={`ze-tab-${panel}`}
            >
              {panel === 'tarjetas' && <PanelMazos onCambio={cargarResumen} />}
              {panel === 'apuntes' && <PanelApuntes />}
              {panel === 'mapas' && <PanelMapas onCambio={cargarResumen} />}
            </div>
          </section>

        </main>
        <Footer />
      </div>

      {repasoAbierto && (
        <Repaso
          mazoId={null}
          onCerrar={() => setRepasoAbierto(false)}
          onTerminado={cargarResumen}
        />
      )}
    </>
  );
};

export default ZonaEstudio;
