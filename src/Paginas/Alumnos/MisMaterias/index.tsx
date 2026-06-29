import React, { useEffect, useState } from 'react';
import CardMateria from '../../../Componentes/alumnos/CardMaterias';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import './misMaterias.css';
import api from '../../../api';
import { Link } from 'react-router-dom';

interface MateriaBackend {
  materia_id: string;
  materia_nombre: string;
  curso_id: string;
  anio: number;
  division: string;
  profesor_nombre: string;
  profesor_apellido: string;
  profe_curso_materia_id?: string;
  avatar_url?: string;
}

const DAYS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatDate(): string {
  const d = new Date();
  const s = `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getSaludo(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Buenos días', emoji: '☀️' };
  if (h < 19) return { text: 'Buenas tardes', emoji: '🌤️' };
  return { text: 'Buenas noches', emoji: '🌙' };
}

const MisMaterias: React.FC = () => {
  const [materias, setMaterias] = useState<MateriaBackend[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const session = localStorage.getItem('usuario');
      if (session) {
        const user = JSON.parse(session);
        setUserName(user.nombre || '');
      }
    } catch {}
  }, []);

  useEffect(() => {
    const traerMaterias = async () => {
      try {
        const session = localStorage.getItem('usuario');
        if (!session) { setError('No se detectó una sesión activa.'); return; }
        const userParsed = JSON.parse(session);
        const alumnoId = userParsed.alumno_id;
        if (!alumnoId) { setError('El perfil no corresponde a un alumno válido.'); return; }
        const res = await api.get(`http://localhost:3000/api/alumnos/${alumnoId}/materias`);
        setMaterias(res.data.data);
      } catch {
        setError('Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    traerMaterias();
  }, []);

  const { text: saludo, emoji } = getSaludo();

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">

          {/* ── Welcome banner ── */}
          <div className="welcome-banner">
            <div className="wb-body">
              <span className="wb-saludo">{emoji} {saludo}</span>
              <h2 className="wb-name">
                {userName || 'Bienvenido'} <span className="wb-star">✦</span>
              </h2>
              <p className="wb-date">{formatDate()}</p>
            </div>
            <div className="wb-badges">
              {!loading && (
                <span className="wb-badge wb-badge--count">
                  📚 {materias.length} {materias.length === 1 ? 'materia' : 'materias'}
                </span>
              )}
              <span className="wb-badge wb-badge--ia">⚡ Nexia IA activa</span>
            </div>
          </div>

          {/* ── Page header ── */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Mis Materias</h1>
              <p className="page-subtitle">Accedé a tus materias y contenidos del ciclo lectivo</p>
            </div>
            {!loading && (
              <div className="page-badge">
                <span>{materias.length} materias</span>
              </div>
            )}
          </div>

          {error && <div className="alert-error">{error}</div>}

          {loading ? (
            <div className="nexia-status-container">
              <div className="nexia-loading-spinner" />
              <p>Cargando materias...</p>
            </div>
          ) : materias.length === 0 && !error ? (
            <div className="no-materias-fallback">
              <div className="fallback-icon">📚</div>
              <h3>Sin materias asignadas</h3>
              <p>No te encontrás inscrito en ninguna materia para este ciclo lectivo.</p>
            </div>
          ) : (
            <div className="materias-grid">
              {materias.map((item) => {
                const destino = item.profe_curso_materia_id || item.materia_id;
                const profe = [item.profesor_nombre, item.profesor_apellido]
                  .filter(x => x && x !== 'undefined')
                  .join(' ');
                return (
                  <Link key={item.materia_id} to={`/materia/${destino}`} style={{ textDecoration: 'none' }}>
                    <CardMateria
                      titulo={item.materia_nombre}
                      curso={`${item.anio}° "${item.division}"`}
                      profesor={profe}
                      avatarUrl={item.avatar_url || ''}
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default MisMaterias;
