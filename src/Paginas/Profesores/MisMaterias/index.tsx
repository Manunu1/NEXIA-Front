import React, { useEffect, useState } from 'react';
import Materia from '../../../Componentes/profesor/Materia';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import './misCursos.css';
import type { typeCurso } from '../../../Types/profesores/types';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MisCursos: React.FC = () => {
  const [listaMaterias, setListaMaterias] = useState<typeCurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        const profesorId = localStorage.getItem('profesor_id');
        if (!profesorId) {
          setError('No se encontró el ID del profesor.');
          return;
        }
        const res = await axios.get(`http://localhost:3000/api/profesores/${profesorId}/materias`);
        setListaMaterias(res.data.data || []);
      } catch (err) {
        console.error('Error al obtener los cursos:', err);
        setError('Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    traerMaterias();
  }, []);

  const getSaludo = () => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Buenos días', emoji: '☀️' };
    if (h < 19) return { text: 'Buenas tardes', emoji: '🌤️' };
    return { text: 'Buenas noches', emoji: '🌙' };
  };

  const DAYS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const formatDate = () => {
    const d = new Date();
    const s = `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

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
                  📚 {listaMaterias.length} {listaMaterias.length === 1 ? 'curso' : 'cursos'}
                </span>
              )}
              <span className="wb-badge wb-badge--ia">⚡ Nexia IA activa</span>
            </div>
          </div>

          <div className="page-header">
            <div>
              <h1 className="page-title">Mis Cursos</h1>
              <p className="page-subtitle">Gestioná el contenido de tus materias asignadas</p>
            </div>
            <div className="page-badge">
              <span>{listaMaterias.length} materias</span>
            </div>
          </div>

          {error && <div className="alert-error">{error}</div>}

          {loading ? (
            <div className="nexia-status-container">
              <div className="nexia-loading-spinner" />
              <p>Cargando cursos...</p>
            </div>
          ) : listaMaterias.length === 0 && !error ? (
            <div className="no-materias-fallback">
              <div className="fallback-icon">🏫</div>
              <h3>Sin cursos asignados</h3>
              <p>No tenés materias asignadas para este ciclo lectivo.</p>
            </div>
          ) : (
            <div className="materias-grid">
              {listaMaterias.map((item) => (
                <Link
                  key={item.profe_curso_materia_id}
                  to={`/contenidos/${item.profe_curso_materia_id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Materia
                    materia={item.materia_nombre}
                    grado={item.division}
                    anio={item.anio}
                    descripcion={item.materia_descripcion}
                  />
                </Link>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default MisCursos;
