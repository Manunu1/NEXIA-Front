import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ConexionMapa, GrafoMapa, NodoMapa } from '../../../Types/estudio';
import './mapaConceptual.css';

/* ─────────────────────────────────────────────
   MAPA CONCEPTUAL — el canvas.

   Los nodos son elementos HTML posicionados en
   absoluto y las conexiones se dibujan en un SVG
   por debajo. La alternativa —todo en SVG— parece
   más natural, pero <text> no envuelve líneas: cada
   concepto habría necesitado que le calculáramos
   los saltos a mano, y el texto largo se saldría
   de la caja. Con HTML el texto fluye solo, y de
   paso los nodos son botones reales: foco, teclado
   y lector de pantalla funcionan sin trabajo extra.

   El lienzo tiene tamaño fijo y el contenedor
   scrollea. Un canvas infinito con paneo obligaría
   a construir minimapa y controles de zoom para no
   perderse, que es mucha maquinaria para mapear un
   tema de historia.
───────────────────────────────────────────── */

const ANCHO = 1600;
const ALTO = 1000;
const NODO_ANCHO = 168;
const NODO_ALTO = 64;

interface MapaConceptualProps {
  grafo: GrafoMapa;
  onCambio: (grafo: GrafoMapa) => void;
}

/** Centro del nodo — de donde salen y a donde llegan las conexiones. */
const centro = (n: NodoMapa) => ({ x: n.x + NODO_ANCHO / 2, y: n.y + NODO_ALTO / 2 });

const nuevoId = () => `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const MapaConceptual: React.FC<MapaConceptualProps> = ({ grafo, onCambio }) => {
  const lienzoRef = useRef<HTMLDivElement>(null);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [conectandoDesde, setConectandoDesde] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);

  /* El arrastre se lleva en una ref y no en estado: se actualiza en cada
     pointermove y pasar por setState en cada evento dispararía un render
     por píxel movido. */
  const arrastre = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const nodoSeleccionado = useMemo(
    () => grafo.nodos.find((n) => n.id === seleccionado) ?? null,
    [grafo.nodos, seleccionado]
  );

  const actualizarNodo = useCallback((id: string, cambios: Partial<NodoMapa>) => {
    onCambio({
      ...grafo,
      nodos: grafo.nodos.map((n) => (n.id === id ? { ...n, ...cambios } : n)),
    });
  }, [grafo, onCambio]);

  const agregarNodo = useCallback((tipo: NodoMapa['tipo'] = 'secundario') => {
    /* El nodo nuevo aparece en el centro de lo que el alumno está mirando,
       no en el centro del lienzo: si estuviera scrolleado, aparecería fuera
       de la vista y parecería que el botón no hizo nada. */
    const cont = lienzoRef.current;
    const x = cont ? cont.scrollLeft + cont.clientWidth / 2 - NODO_ANCHO / 2 : ANCHO / 2;
    const y = cont ? cont.scrollTop + cont.clientHeight / 2 - NODO_ALTO / 2 : ALTO / 2;

    const nodo: NodoMapa = {
      id: nuevoId(),
      texto: tipo === 'principal' ? 'Concepto central' : 'Nuevo concepto',
      x: Math.max(0, Math.min(x, ANCHO - NODO_ANCHO)),
      y: Math.max(0, Math.min(y, ALTO - NODO_ALTO)),
      tipo,
    };

    onCambio({ ...grafo, nodos: [...grafo.nodos, nodo] });
    setSeleccionado(nodo.id);
    setEditando(nodo.id);
  }, [grafo, onCambio]);

  const eliminarNodo = useCallback((id: string) => {
    onCambio({
      nodos: grafo.nodos.filter((n) => n.id !== id),
      // Se van también sus conexiones: si quedaran, apuntarían a la nada.
      conexiones: grafo.conexiones.filter((c) => c.de !== id && c.a !== id),
    });
    setSeleccionado(null);
    setEditando(null);
  }, [grafo, onCambio]);

  const alternarConexion = useCallback((destino: string) => {
    if (!conectandoDesde || conectandoDesde === destino) {
      setConectandoDesde(null);
      return;
    }

    const yaExiste = grafo.conexiones.some(
      (c) =>
        (c.de === conectandoDesde && c.a === destino) ||
        (c.de === destino && c.a === conectandoDesde)
    );

    if (!yaExiste) {
      const conexion: ConexionMapa = { de: conectandoDesde, a: destino, etiqueta: '' };
      onCambio({ ...grafo, conexiones: [...grafo.conexiones, conexion] });
    }

    setConectandoDesde(null);
  }, [conectandoDesde, grafo, onCambio]);

  const quitarConexion = useCallback((de: string, a: string) => {
    onCambio({
      ...grafo,
      conexiones: grafo.conexiones.filter((c) => !(c.de === de && c.a === a)),
    });
  }, [grafo, onCambio]);

  // ── Arrastre ──────────────────────────────

  const onPointerDown = (e: React.PointerEvent, nodo: NodoMapa) => {
    if (editando === nodo.id) return;

    const cont = lienzoRef.current;
    if (!cont) return;

    const rect = cont.getBoundingClientRect();
    // Coordenadas dentro del lienzo, no de la ventana: el contenedor puede
    // estar scrolleado y en cualquier parte de la página.
    const px = e.clientX - rect.left + cont.scrollLeft;
    const py = e.clientY - rect.top + cont.scrollTop;

    arrastre.current = { id: nodo.id, dx: px - nodo.x, dy: py - nodo.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setSeleccionado(nodo.id);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const a = arrastre.current;
    const cont = lienzoRef.current;
    if (!a || !cont) return;

    const rect = cont.getBoundingClientRect();
    const px = e.clientX - rect.left + cont.scrollLeft;
    const py = e.clientY - rect.top + cont.scrollTop;

    actualizarNodo(a.id, {
      x: Math.max(0, Math.min(px - a.dx, ANCHO - NODO_ANCHO)),
      y: Math.max(0, Math.min(py - a.dy, ALTO - NODO_ALTO)),
    });
  };

  const onPointerUp = () => { arrastre.current = null; };

  // Escape cancela lo que esté en curso, que es lo que uno espera.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (editando) setEditando(null);
      else if (conectandoDesde) setConectandoDesde(null);
      else setSeleccionado(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editando, conectandoDesde]);

  return (
    <div className="mc">
      {/* ── Barra de herramientas ── */}
      <div className="mc-barra">
        <button type="button" className="mc-herr" onClick={() => agregarNodo('principal')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Concepto central
        </button>

        <button type="button" className="mc-herr" onClick={() => agregarNodo('secundario')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="7" width="18" height="10" rx="2" />
            <line x1="12" y1="10" x2="12" y2="14" /><line x1="10" y1="12" x2="14" y2="12" />
          </svg>
          Concepto
        </button>

        <div className="mc-barra-sep" aria-hidden="true" />

        <span className="mc-ayuda">
          {conectandoDesde
            ? 'Elegí el concepto con el que se relaciona · Esc para cancelar'
            : 'Arrastrá para mover · Doble clic para renombrar'}
        </span>

        <span className="mc-conteo">
          {grafo.nodos.length} {grafo.nodos.length === 1 ? 'concepto' : 'conceptos'}
        </span>
      </div>

      {/* ── Lienzo ── */}
      <div
        className={`mc-lienzo${conectandoDesde ? ' mc-lienzo--conectando' : ''}`}
        ref={lienzoRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="mc-plano" style={{ width: ANCHO, height: ALTO }}>

          {/* Conexiones, por debajo de los nodos */}
          <svg className="mc-svg" width={ANCHO} height={ALTO} aria-hidden="true">
            {grafo.conexiones.map((c) => {
              const de = grafo.nodos.find((n) => n.id === c.de);
              const a = grafo.nodos.find((n) => n.id === c.a);
              if (!de || !a) return null;

              const p1 = centro(de);
              const p2 = centro(a);
              const medio = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
              const resaltada = seleccionado === c.de || seleccionado === c.a;

              return (
                <g key={`${c.de}-${c.a}`} className={`mc-conexion${resaltada ? ' mc-conexion--activa' : ''}`}>
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />
                  {c.etiqueta && (
                    <text x={medio.x} y={medio.y - 6} textAnchor="middle">{c.etiqueta}</text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodos */}
          {grafo.nodos.map((n) => {
            const esOrigen = conectandoDesde === n.id;
            const activo = seleccionado === n.id;

            return (
              <div
                key={n.id}
                className={`mc-nodo mc-nodo--${n.tipo}${activo ? ' mc-nodo--activo' : ''}${esOrigen ? ' mc-nodo--origen' : ''}`}
                style={{ left: n.x, top: n.y, width: NODO_ANCHO, minHeight: NODO_ALTO }}
                onPointerDown={(e) => onPointerDown(e, n)}
                onClick={() => { if (conectandoDesde) alternarConexion(n.id); }}
                onDoubleClick={() => setEditando(n.id)}
                tabIndex={0}
                role="button"
                aria-label={`Concepto: ${n.texto}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); setEditando(n.id); }
                  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); eliminarNodo(n.id); }
                }}
              >
                {editando === n.id ? (
                  <textarea
                    className="mc-nodo-input"
                    value={n.texto}
                    maxLength={160}
                    autoFocus
                    onChange={(e) => actualizarNodo(n.id, { texto: e.target.value })}
                    onBlur={() => setEditando(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditando(null); }
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label="Texto del concepto"
                  />
                ) : (
                  <span className="mc-nodo-texto">{n.texto}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Panel del nodo seleccionado ── */}
      {nodoSeleccionado && (
        <div className="mc-panel">
          <div className="mc-panel-top">
            <span className="mc-panel-titulo">{nodoSeleccionado.texto || 'Sin título'}</span>
            <button type="button" className="mc-panel-cerrar" onClick={() => setSeleccionado(null)} aria-label="Cerrar panel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="mc-panel-acciones">
            <button type="button" className="mc-panel-btn" onClick={() => setEditando(nodoSeleccionado.id)}>
              Renombrar
            </button>
            <button
              type="button"
              className={`mc-panel-btn${conectandoDesde === nodoSeleccionado.id ? ' mc-panel-btn--activo' : ''}`}
              onClick={() =>
                setConectandoDesde(conectandoDesde === nodoSeleccionado.id ? null : nodoSeleccionado.id)
              }
            >
              {conectandoDesde === nodoSeleccionado.id ? 'Cancelar' : 'Conectar'}
            </button>
            <button
              type="button"
              className="mc-panel-btn"
              onClick={() =>
                actualizarNodo(nodoSeleccionado.id, {
                  tipo: nodoSeleccionado.tipo === 'principal' ? 'secundario' : 'principal',
                })
              }
            >
              {nodoSeleccionado.tipo === 'principal' ? 'Hacer secundario' : 'Hacer central'}
            </button>
            <button
              type="button"
              className="mc-panel-btn mc-panel-btn--danger"
              onClick={() => eliminarNodo(nodoSeleccionado.id)}
            >
              Eliminar
            </button>
          </div>

          {/* Las conexiones se listan para poder quitarlas: hacerlo sobre la
              línea misma exigiría apuntarle a un trazo de 2px. */}
          {(() => {
            const suyas = grafo.conexiones.filter(
              (c) => c.de === nodoSeleccionado.id || c.a === nodoSeleccionado.id
            );
            if (suyas.length === 0) return null;

            return (
              <div className="mc-panel-conexiones">
                <span className="mc-panel-rotulo">Relaciones</span>
                <ul>
                  {suyas.map((c) => {
                    const otroId = c.de === nodoSeleccionado.id ? c.a : c.de;
                    const otro = grafo.nodos.find((n) => n.id === otroId);
                    return (
                      <li key={`${c.de}-${c.a}`}>
                        <input
                          className="mc-panel-etiqueta"
                          type="text"
                          maxLength={80}
                          placeholder="cómo se relacionan"
                          value={c.etiqueta}
                          onChange={(e) =>
                            onCambio({
                              ...grafo,
                              conexiones: grafo.conexiones.map((x) =>
                                x.de === c.de && x.a === c.a ? { ...x, etiqueta: e.target.value } : x
                              ),
                            })
                          }
                          aria-label={`Etiqueta de la relación con ${otro?.texto ?? ''}`}
                        />
                        <span className="mc-panel-otro" title={otro?.texto}>{otro?.texto}</span>
                        <button
                          type="button"
                          className="mc-panel-quitar"
                          onClick={() => quitarConexion(c.de, c.a)}
                          aria-label={`Quitar relación con ${otro?.texto ?? ''}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default MapaConceptual;
