import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Footer from '../../../Componentes/footer';
import Pomodoro from '../../../Componentes/Estudio/Pomodoro';
import Objetivos from '../../../Componentes/Estudio/Objetivos';
import PanelApuntes from '../../../Componentes/Estudio/Apuntes';
import api from '../../../api';
import { usePomodoro } from '../../../hooks/usePomodoro';
import { mensajeDeError } from '../../../utils/apiError';
import { usePageTitle } from '../../../hooks/usePageTitle';
import type { Objetivo, ResumenEstudio } from '../../../Types/estudio';
import './zonaEstudio.css';

/* ─────────────────────────────────────────────
   ZONA DE ESTUDIO.

   El Pomodoro y los objetivos quedan disponibles
   durante toda la sesión, mientras que los apuntes
   ocupan la sección de herramientas.
───────────────────────────────────────────── */

const ZonaEstudio: React.FC = () => {
  usePageTitle('Zona de estudio');

  const [resumen, setResumen] = useState<ResumenEstudio | null>(null);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [error, setError] = useState('');

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

  return (
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

          {/* ── Apuntes ── */}
          <section className="ze-herramientas">
            <div className="ze-panel">
              <PanelApuntes />
            </div>
          </section>

        </main>
        <Footer />
    </div>
  );
};

export default ZonaEstudio;
