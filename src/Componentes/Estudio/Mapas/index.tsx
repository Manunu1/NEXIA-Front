import React, { useCallback, useEffect, useRef, useState } from 'react';
import EmptyState from '../../EmptyState';
import ConfirmDialog from '../../ConfirmDialog';
import MapaConceptual from '../MapaConceptual';
import api from '../../../api';
import { mensajeDeError } from '../../../utils/apiError';
import type { GrafoMapa, Mapa, MapaResumen } from '../../../Types/estudio';
import './mapas.css';

/* ─────────────────────────────────────────────
   MAPAS CONCEPTUALES — listado y edición.

   El guardado es automático con retardo: dibujar
   un mapa son decenas de micro-cambios (arrastrar
   un nodo dispara uno por píxel) y mandarlos todos
   al servidor sería insostenible. Se espera a que
   el alumno pare un segundo y recién ahí se guarda.

   Igual queda el botón de guardar: el autoguardado
   silencioso genera desconfianza si no hay ninguna
   señal de que el trabajo está a salvo.
───────────────────────────────────────────── */

const RETARDO_GUARDADO = 1200;
const GRAFO_VACIO: GrafoMapa = { nodos: [], conexiones: [] };

interface PanelMapasProps {
  onCambio: () => void;
}

type EstadoGuardado = 'guardado' | 'pendiente' | 'guardando' | 'error';

const PanelMapas: React.FC<PanelMapasProps> = ({ onCambio }) => {
  const [mapas, setMapas] = useState<MapaResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [abierto, setAbierto] = useState<Mapa | null>(null);
  const [grafo, setGrafo] = useState<GrafoMapa>(GRAFO_VACIO);
  const [estado, setEstado] = useState<EstadoGuardado>('guardado');
  const [aEliminar, setAEliminar] = useState<MapaResumen | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const temporizador = useRef<number | null>(null);

  const cargarLista = useCallback(async () => {
    try {
      const res = await api.get('/api/mapas');
      setMapas(res.data.data || []);
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudieron cargar tus mapas.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const res = await api.get('/api/mapas');
        if (vigente) setMapas(res.data.data || []);
      } catch (err) {
        if (vigente) setError(mensajeDeError(err, 'No se pudieron cargar tus mapas.'));
      } finally {
        if (vigente) setCargando(false);
      }
    })();
    return () => { vigente = false; };
  }, []);

  const guardar = useCallback(async (id: number, datos: GrafoMapa, titulo?: string) => {
    setEstado('guardando');
    try {
      await api.put(`/api/mapas/${id}`, { datos, ...(titulo !== undefined ? { titulo } : {}) });
      setEstado('guardado');
      setMapas((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, cantidad_nodos: datos.nodos.length, ...(titulo !== undefined ? { titulo } : {}) }
            : m
        )
      );
    } catch {
      setEstado('error');
    }
  }, []);

  /* Guardado con retardo. Cada cambio reinicia la espera; si el alumno sigue
     moviendo cosas, no se manda nada hasta que se detiene. */
  const alCambiarGrafo = useCallback((nuevo: GrafoMapa) => {
    setGrafo(nuevo);
    setEstado('pendiente');

    if (temporizador.current) window.clearTimeout(temporizador.current);
    if (!abierto) return;

    temporizador.current = window.setTimeout(() => {
      guardar(abierto.id, nuevo);
    }, RETARDO_GUARDADO);
  }, [abierto, guardar]);

  /* Al salir del editor se cancela el guardado pendiente y se guarda ya:
     si el componente se desmontara con el temporizador vivo, el último
     cambio se perdería. */
  const cerrarEditor = useCallback(async () => {
    if (temporizador.current) {
      window.clearTimeout(temporizador.current);
      temporizador.current = null;
    }
    if (abierto && estado !== 'guardado') {
      await guardar(abierto.id, grafo);
    }
    setAbierto(null);
    onCambio();
    cargarLista();
  }, [abierto, estado, grafo, guardar, onCambio, cargarLista]);

  useEffect(() => () => {
    if (temporizador.current) window.clearTimeout(temporizador.current);
  }, []);

  const crear = async () => {
    setError('');
    try {
      const res = await api.post('/api/mapas', { titulo: 'Mapa sin título', datos: GRAFO_VACIO });
      const mapa: Mapa = res.data.data;
      setMapas((prev) => [{ ...mapa, cantidad_nodos: 0 }, ...prev]);
      setAbierto(mapa);
      setGrafo(mapa.datos ?? GRAFO_VACIO);
      setEstado('guardado');
      onCambio();
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo crear el mapa.'));
    }
  };

  const abrir = async (resumen: MapaResumen) => {
    setError('');
    try {
      const res = await api.get(`/api/mapas/${resumen.id}`);
      const mapa: Mapa = res.data.data;
      setAbierto(mapa);
      setGrafo(mapa.datos ?? GRAFO_VACIO);
      setEstado('guardado');
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo abrir el mapa.'));
    }
  };

  const renombrar = (titulo: string) => {
    if (!abierto) return;
    setAbierto({ ...abierto, titulo });
    setEstado('pendiente');

    if (temporizador.current) window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => {
      guardar(abierto.id, grafo, titulo);
    }, RETARDO_GUARDADO);
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    try {
      await api.delete(`/api/mapas/${aEliminar.id}`);
      setMapas((prev) => prev.filter((m) => m.id !== aEliminar.id));
      setAEliminar(null);
      onCambio();
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo eliminar el mapa.'));
      setAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  // ── Editor ────────────────────────────────

  if (abierto) {
    const rotulo: Record<EstadoGuardado, string> = {
      guardado: 'Guardado',
      pendiente: 'Sin guardar…',
      guardando: 'Guardando…',
      error: 'No se pudo guardar',
    };

    return (
      <div className="mp">
        <header className="mp-editor-top">
          <button type="button" className="mp-volver" onClick={cerrarEditor}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Mis mapas
          </button>

          <input
            className="mp-titulo-input"
            type="text"
            maxLength={160}
            value={abierto.titulo}
            onChange={(e) => renombrar(e.target.value)}
            aria-label="Título del mapa"
          />

          <span className={`mp-estado mp-estado--${estado}`} role="status">
            {estado === 'guardando' && <span className="mp-estado-spinner" aria-hidden="true" />}
            {rotulo[estado]}
          </span>
        </header>

        <MapaConceptual grafo={grafo} onCambio={alCambiarGrafo} />

        {grafo.nodos.length === 0 && (
          <p className="mp-pista">
            Empezá por el <strong>concepto central</strong> y desprendé de ahí las ideas
            relacionadas. Seleccioná un concepto y usá <strong>Conectar</strong> para unirlo con otro.
          </p>
        )}
      </div>
    );
  }

  // ── Listado ───────────────────────────────

  return (
    <div className="mp">
      <header className="mp-top">
        <div>
          <h2 className="mp-titulo">Mapas conceptuales</h2>
          <p className="mp-sub">
            Relacionar las ideas en un esquema visual ayuda a ver la estructura de un
            tema — sobre todo en historia, biología y literatura.
          </p>
        </div>
        <button type="button" className="mp-nuevo" onClick={crear}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo mapa
        </button>
      </header>

      {error && <div className="alert-error" role="alert">{error}</div>}

      {cargando ? (
        <div className="nexia-status-container">
          <div className="nexia-loading-spinner" />
          <p>Cargando tus mapas…</p>
        </div>
      ) : mapas.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="3" /><circle cx="5" cy="19" r="3" /><circle cx="19" cy="19" r="3" />
              <line x1="10.5" y1="7.5" x2="6.5" y2="16.5" /><line x1="13.5" y1="7.5" x2="17.5" y2="16.5" />
            </svg>
          }
          title="Todavía no tenés mapas"
          description="Armá un esquema con los conceptos de un tema y las relaciones entre ellos."
          action={<button className="mp-nuevo" onClick={crear}>Crear mi primer mapa</button>}
        />
      ) : (
        <ul className="mp-grid stagger-in">
          {mapas.map((m) => (
            <li key={m.id} className="mp-card">
              <button type="button" className="mp-card-abrir" onClick={() => abrir(m)}>
                <span className="mp-card-icono" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="19" r="2.5" /><circle cx="19" cy="19" r="2.5" />
                    <line x1="10.6" y1="7.3" x2="6.4" y2="16.7" /><line x1="13.4" y1="7.3" x2="17.6" y2="16.7" />
                  </svg>
                </span>
                <span className="mp-card-nombre">{m.titulo}</span>
                <span className="mp-card-meta">
                  {m.cantidad_nodos} {m.cantidad_nodos === 1 ? 'concepto' : 'conceptos'}
                </span>
              </button>

              <button
                type="button"
                className="mp-card-borrar"
                onClick={() => setAEliminar(m)}
                aria-label={`Eliminar mapa ${m.titulo}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={aEliminar !== null}
        danger
        busy={eliminando}
        title="Eliminar mapa"
        message={<>¿Eliminar <strong>{aEliminar?.titulo}</strong>? Esta acción no se puede deshacer.</>}
        confirmLabel="Eliminar"
        onConfirm={confirmarEliminar}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  );
};

export default PanelMapas;
