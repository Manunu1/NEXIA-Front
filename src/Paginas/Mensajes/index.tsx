import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../../Componentes/Sidebar';
import EmptyState from '../../Componentes/EmptyState';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getRolActual } from '../../utils/session';
import './mensajes.css';

/* ─────────────────────────────────────────────
   MENSAJES — front listo para conectar al backend.
   Los mensajes se manejan en estado local; los
   puntos de integración están marcados con TODO(api).
───────────────────────────────────────────── */

interface Mensaje {
  id: string;
  propio: boolean;
  texto: string;
  hora: string;
}

interface Conversacion {
  id: string;
  /** id real del usuario destinatario (para el backend) */
  destinatarioId?: string;
  nombre: string;
  mensajes: Mensaje[];
  /** Conversación de muestra para demostrar el estilo del chat */
  demo?: boolean;
}

let msgSeq = 0;
const nextId = () => `m-${++msgSeq}`;

/* Conversaciones de muestra según el rol — se eliminan al conectar el backend.
   TODO(api): reemplazar por GET /api/mensajes/conversaciones */
function conversacionesDemo(): Conversacion[] {
  const rol = getRolActual();

  if (rol === 'profesor' || rol === 'gestor') {
    return [
      {
        id: 'demo-1',
        nombre: 'Lucas Fernández',
        demo: true,
        mensajes: [
          { id: nextId(), propio: false, texto: 'Hola profe, ¿el TP de ecuaciones se puede entregar en PDF?', hora: '09:12' },
          { id: nextId(), propio: true, texto: 'Hola Lucas, sí, PDF está perfecto. Acordate de incluir el desarrollo, no solo los resultados.', hora: '09:15' },
          { id: nextId(), propio: false, texto: '¡Genial! Lo subo hoy a la tarde entonces. Gracias 🙌', hora: '09:16' },
        ],
      },
      {
        id: 'demo-2',
        nombre: 'Sofía Martínez',
        demo: true,
        mensajes: [
          { id: nextId(), propio: true, texto: 'Sofía, vi que todavía no entregaste el TP N°2. ¿Necesitás una mano con algo?', hora: 'Ayer' },
          { id: nextId(), propio: false, texto: 'Sí profe, me trabé con la parte de gráficos. ¿Puedo consultarle mañana en el recreo?', hora: 'Ayer' },
        ],
      },
    ];
  }

  return [
    {
      id: 'demo-1',
      nombre: 'Prof. María García',
      demo: true,
      mensajes: [
        { id: nextId(), propio: true, texto: 'Hola profe, ¿la fotosíntesis entra en la evaluación del jueves?', hora: '10:41' },
        { id: nextId(), propio: false, texto: 'Hola, sí, entra todo lo que vimos hasta la clase pasada. Repasá el material que subí a Contenidos.', hora: '10:52' },
        { id: nextId(), propio: true, texto: '¡Perfecto, gracias! Ya lo estoy repasando con Nexia IA 💪', hora: '10:53' },
      ],
    },
    {
      id: 'demo-2',
      nombre: 'Prof. Jorge Ruiz',
      demo: true,
      mensajes: [
        { id: nextId(), propio: false, texto: 'Les recuerdo que mañana traigan la carpeta con los ejercicios resueltos.', hora: 'Ayer' },
      ],
    },
  ];
}

function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function horaActual(): string {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

const Mensajes: React.FC = () => {
  usePageTitle('Mensajes');
  const [searchParams] = useSearchParams();

  const [conversaciones, setConversaciones] = useState<Conversacion[]>(conversacionesDemo);
  const [activaId, setActivaId] = useState<string | null>(null);
  const [texto, setTexto] = useState('');
  const [escribiendoEn, setEscribiendoEn] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  // TODO(api): reemplazar por GET /api/mensajes/conversaciones al conectar el backend

  // Si llegamos desde "Alumnos a acompañar" (?alumno=..&nombre=..), se abre
  // una conversación con ese alumno (ajuste de estado en render, sin efecto)
  const alumnoParam = searchParams.get('alumno');
  const nombreParam = searchParams.get('nombre');
  const [paramProcesado, setParamProcesado] = useState<string | null>(null);

  if (alumnoParam && nombreParam && paramProcesado !== alumnoParam) {
    setParamProcesado(alumnoParam);
    setConversaciones((prev) =>
      prev.some((c) => c.destinatarioId === alumnoParam)
        ? prev
        : [{ id: `c-${alumnoParam}`, destinatarioId: alumnoParam, nombre: nombreParam, mensajes: [] }, ...prev]
    );
    setActivaId(`c-${alumnoParam}`);
  }

  const activa = useMemo(
    () => conversaciones.find((c) => c.id === activaId) ?? null,
    [conversaciones, activaId]
  );

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activa?.mensajes.length, escribiendoEn]);

  const enviar = () => {
    const contenido = texto.trim();
    if (!contenido || !activa) return;

    // TODO(api): POST /api/mensajes { destinatario_id: activa.destinatarioId, texto: contenido }
    const mensaje: Mensaje = {
      id: nextId(),
      propio: true,
      texto: contenido,
      hora: horaActual(),
    };

    const convId = activa.id;
    setConversaciones((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, mensajes: [...c.mensajes, mensaje] } : c))
    );
    setTexto('');

    // En conversaciones de muestra, simula que el otro responde
    if (activa.demo) {
      setEscribiendoEn(convId);
      setTimeout(() => {
        setConversaciones((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  mensajes: [
                    ...c.mensajes,
                    { id: nextId(), propio: false, texto: '¡Recibido! Te respondo en un rato. (respuesta simulada)', hora: horaActual() },
                  ],
                }
              : c
          )
        );
        setEscribiendoEn(null);
      }, 1600);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <>
      <Sidebar />
      <div className="iv-page">

        {/* ── Header ── */}
        <header className="iv-header">
          <div className="iv-header-center">
            <h1 className="iv-title">Mensajes</h1>
            {conversaciones.length > 0 && (
              <span className="iv-count">
                {conversaciones.length} {conversaciones.length === 1 ? 'conversación' : 'conversaciones'}
              </span>
            )}
          </div>
          <span className="msj-beta-badge">Vista previa</span>
        </header>

        <div className="iv-body">

          {/* ── Lista de conversaciones ── */}
          <div className="iv-list-panel">
            <div className="iv-list-header">
              <span className="iv-list-label">Conversaciones</span>
            </div>

            {conversaciones.length === 0 ? (
              <div className="msj-lista-vacia">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p>Todavía no tenés conversaciones.</p>
              </div>
            ) : (
              <ul className="msj-conv-list">
                {conversaciones.map((c) => {
                  const ultimo = c.mensajes[c.mensajes.length - 1];
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        className={`msj-conv${c.id === activaId ? ' msj-conv--activa' : ''}`}
                        onClick={() => setActivaId(c.id)}
                      >
                        <span className="msj-conv-avatar" aria-hidden="true">{iniciales(c.nombre)}</span>
                        <span className="msj-conv-info">
                          <span className="msj-conv-nombre">
                            {c.nombre}
                            {c.demo && <span className="msj-demo-chip">Demo</span>}
                          </span>
                          <span className="msj-conv-preview">
                            {ultimo ? ultimo.texto : 'Escribí el primer mensaje…'}
                          </span>
                        </span>
                        {ultimo && <span className="msj-conv-hora">{ultimo.hora}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ── Hilo ── */}
          <div className="msj-chat">
            {!activa ? (
              <div className="msj-chat-vacio">
                <EmptyState
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  }
                  title="Tus mensajes"
                  description="Elegí una conversación de la lista, o llegá acá desde el panel de alumnos a acompañar para escribirle a un alumno."
                />
              </div>
            ) : (
              <>
                <div className="msj-chat-header">
                  <span className="msj-conv-avatar" aria-hidden="true">{iniciales(activa.nombre)}</span>
                  <div className="msj-chat-header-info">
                    <span className="msj-chat-nombre">
                      {activa.nombre}
                      {activa.demo && <span className="msj-demo-chip">Demo</span>}
                    </span>
                    <span className="msj-chat-sub">
                      {activa.demo ? 'Conversación de muestra' : 'Conversación directa'}
                    </span>
                  </div>
                </div>

                <div className="msj-hilo">
                  {activa.mensajes.length === 0 ? (
                    <p className="msj-hilo-vacio">
                      Este es el comienzo de tu conversación con <strong>{activa.nombre}</strong>.
                    </p>
                  ) : (
                    <>
                      <div className="msj-divider" aria-hidden="true"><span>Hoy</span></div>
                      {activa.mensajes.map((m) => (
                        <div key={m.id} className={`msj-burbuja${m.propio ? ' msj-burbuja--propia' : ''}`}>
                          <p className="msj-burbuja-texto">{m.texto}</p>
                          <span className="msj-burbuja-hora">{m.hora}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {escribiendoEn === activa.id && (
                    <div className="msj-burbuja msj-burbuja--typing" aria-label={`${activa.nombre} está escribiendo`}>
                      <span /><span /><span />
                    </div>
                  )}

                  <div ref={finRef} />
                </div>

                <div className="msj-composer">
                  <div className="msj-composer-aviso" role="note">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Vista previa — los mensajes todavía no se envían al servidor.
                  </div>
                  <div className="msj-input-row">
                    <textarea
                      className="msj-input"
                      placeholder={`Escribile a ${activa.nombre}…`}
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      aria-label={`Mensaje para ${activa.nombre}`}
                    />
                    <button
                      type="button"
                      className="msj-enviar"
                      onClick={enviar}
                      disabled={!texto.trim()}
                      aria-label="Enviar mensaje"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Mensajes;
