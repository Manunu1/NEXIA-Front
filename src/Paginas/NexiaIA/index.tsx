import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../../Componentes/alumnos/Sidebar';
import api from '../../api';
import './nexiaIA.css';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  error?: boolean;
}

const SUGGESTED_PROMPTS = [
  '¿Cuál es la diferencia entre una función y un procedimiento?',
  'Explicame el concepto de fotosíntesis paso a paso',
  '¿Cuáles fueron las causas de la Primera Guerra Mundial?',
  'Ayudame a entender las ecuaciones de segundo grado',
];

const NexiaIA: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const res = await api.post('/api/ia/chat', { mensaje: text.trim() });
      const aiContent =
        res.data.respuesta ||
        res.data.response ||
        res.data.message ||
        'No pude generar una respuesta. Intentá nuevamente.';

      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'ai',
          content: aiContent,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'ai',
          content:
            'No se pudo conectar con Nexia IA en este momento. Verificá tu conexión e intentá nuevamente.',
          timestamp: new Date(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const clearChat = () => {
    setMessages([]);
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <Sidebar />
      <div className="nia-wrapper">

        {/* ── Header ── */}
        <header className="nia-header">
          <div className="nia-header-left">
            <div className="nia-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="nia-header-info">
              <span className="nia-header-title">Nexia IA</span>
              <span className="nia-header-sub">Asistente pedagógico inteligente</span>
            </div>
          </div>
          <div className="nia-header-right">
            {messages.length > 0 && (
              <button className="nia-clear-btn" onClick={clearChat}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
                Nueva conversación
              </button>
            )}
            <span className="nia-status-badge">
              <span className="nia-status-dot" />
              Activa
            </span>
          </div>
        </header>

        {/* ── Messages ── */}
        <div className="nia-messages" ref={messagesRef}>
          {messages.length === 0 ? (
            <div className="nia-welcome">
              <div className="nia-welcome-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h2 className="nia-welcome-title">Hola, soy Nexia IA</h2>
              <p className="nia-welcome-sub">
                Estoy aquí para acompañarte en tu aprendizaje. No te daré respuestas directas
                a las consignas, sino que te guiaré para que construyas tu propio conocimiento.
              </p>
              <div className="nia-prompts-grid">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    className="nia-prompt-card"
                    onClick={() => sendMessage(prompt)}
                  >
                    <span className="nia-prompt-text">{prompt}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nia-prompt-arrow">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                ))}
              </div>
              <p className="nia-welcome-disclaimer">
                Nexia IA tiene acceso al material publicado por tus docentes para brindarte una ayuda contextualizada.
              </p>
            </div>
          ) : (
            <div className="nia-msg-list">
              {messages.map(msg => (
                <div key={msg.id} className={`nia-msg nia-msg--${msg.role}`}>
                  {msg.role === 'ai' && (
                    <div className="nia-ai-avatar" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </div>
                  )}
                  <div className={`nia-bubble${msg.error ? ' nia-bubble--error' : ''}`}>
                    <p className="nia-bubble-text">{msg.content}</p>
                    <span className="nia-bubble-time">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="nia-msg nia-msg--ai">
                  <div className="nia-ai-avatar" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <div className="nia-bubble nia-bubble--typing" aria-label="Nexia IA está escribiendo">
                    <span /><span /><span />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input ── */}
        <div className="nia-input-area">
          <div className="nia-input-wrap">
            <textarea
              ref={inputRef}
              className="nia-input"
              placeholder="Preguntale algo a Nexia IA… (Enter para enviar, Shift+Enter para nueva línea)"
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
              aria-label="Mensaje para Nexia IA"
            />
            <button
              className="nia-send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              aria-label="Enviar mensaje"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="nia-input-hint">
            Nexia IA guía tu aprendizaje — no entrega respuestas directas a consignas escolares.
          </p>
        </div>

      </div>
    </>
  );
};

export default NexiaIA;
