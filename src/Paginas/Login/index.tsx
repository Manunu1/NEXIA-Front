import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { usePageTitle } from '../../hooks/usePageTitle';

function Login() {
  usePageTitle('Iniciar sesión');
  const navigate = useNavigate();
  const [institucionId, setInstitucionId] = useState("1");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!dni.trim()) { setError("Ingresá tu DNI"); return; }
    if (!password.trim()) { setError("Ingresá tu contraseña"); return; }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institucion_id: Number(institucionId), dni, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Institución, DNI o contraseña incorrectos");
        return;
      }
      const responseData = await response.json();
      const data = responseData.data;

      // Nuevo formato JWT: { token, refreshToken, user }
      // Formato legacy: objeto usuario directamente
      const token: string | null = data?.token ?? null;
      const refreshToken: string | null = data?.refreshToken ?? null;
      const usuario = data?.user ?? data;

      if (!usuario || typeof usuario !== 'object') {
        setError("Respuesta inesperada del servidor");
        return;
      }

      if (token) localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      if (usuario.rol) localStorage.setItem("rol", usuario.rol);
      if (usuario.institucion_id) localStorage.setItem("institucion_id", usuario.institucion_id);
      if (usuario.usuario_id) localStorage.setItem("usuario_id", usuario.usuario_id);
      if (usuario.gestor_id) localStorage.setItem("usuario_id", usuario.gestor_id);
      if (usuario.alumno_id) {
        localStorage.setItem("alumno_id", usuario.alumno_id);
        navigate("/alumnos"); return;
      }
      if (usuario.profesor_id) {
        localStorage.setItem("profesor_id", usuario.profesor_id);
        navigate("/profesor"); return;
      }
      if (usuario.gestor_id) {
        localStorage.setItem("gestor_id", usuario.gestor_id);
        navigate("/gestor"); return;
      }
      setError("No se pudo determinar el tipo de usuario");
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor. Verificá que esté corriendo en localhost:3000");
    } finally {
      setLoading(false);
    }
  };

  const [instituciones, setInstituciones] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    const fetchInstituciones = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/instituciones");
        const data = await res.json();
        setInstituciones(data);
      } catch {
        setError("Error al cargar instituciones");
      }
    };
    fetchInstituciones();
  }, []);


  return (
    <div className="login-page">
      {/* ── Left brand panel ── */}
      <div className="login-brand-panel">
        <div className="login-brand-content">
          <div className="login-logo">
            <div className="login-logo-mark">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="44" height="44">
                <rect width="500" height="500" fill="#0D1654" rx="80"/>
                <circle cx="270" cy="255" r="155" fill="#0A1248" opacity="0.7"/>
                <line x1="130" y1="365" x2="130" y2="115" stroke="white" strokeWidth="52" strokeLinecap="round"/>
                <line x1="130" y1="115" x2="370" y2="365" stroke="white" strokeWidth="52" strokeLinecap="round"/>
                <line x1="370" y1="115" x2="370" y2="365" stroke="#F5A020" strokeWidth="52" strokeLinecap="round"/>
                <circle cx="130" cy="115" r="14" fill="#F5A020"/>
              </svg>
            </div>
            <span className="login-logo-name">NEXIA</span>
          </div>

          <h1 className="login-brand-title">
            Tu campus virtual,<br />potenciado con <em>IA pedagógica</em>
          </h1>

          <p className="login-brand-tagline">
            La plataforma que transforma la forma en que alumnos, docentes y directivos gestionan la experiencia educativa.
          </p>

          <ul className="login-features">
            {[
              "IA Pedagógica que guía, no que da respuestas",
              "Gestión académica completa en un solo lugar",
              "Acceso a contenidos desde cualquier dispositivo",
              "Comunicación institucional integrada",
            ].map((feat) => (
              <li key={feat} className="login-feature">
                <span className="login-feature-check">✓</span>
                {feat}
              </li>
            ))}
          </ul>

          <div className="login-stats-row">
            <div className="login-stat-item">
              <span className="login-stat-n">+200<em>+</em></span>
              <span className="login-stat-l">Instituciones</span>
            </div>
            <div className="login-stat-item">
              <span className="login-stat-n">50<em>K+</em></span>
              <span className="login-stat-l">Alumnos</span>
            </div>
            <div className="login-stat-item">
              <span className="login-stat-n">−38<em>%</em></span>
              <span className="login-stat-l">Repitencia</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-form-panel">
        <div className="login-form-inner">
          <div className="login-form-header">
            <h2>Bienvenido de vuelta 👋</h2>
            <p className="login-form-tagline">Iniciá sesión en tu campus virtual</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="login-form-fields">
            <div className="login-field-group">
              <label className="login-label">Institución</label>
              <select
                className="login-field"
                value={institucionId}
                onChange={(e) => { setInstitucionId(e.target.value); setError(""); }}
              >
                {instituciones.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre}
                </option>
        ))}

              </select>
            </div>

            <div className="login-field-group">
              <label className="login-label">DNI</label>
              <input
                type="text"
                className="login-field"
                placeholder="Ej: 40123456"
                value={dni}
                onChange={(e) => { setDni(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div className="login-field-group">
              <label className="login-label">Contraseña</label>
              <div className="login-password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-field login-field--password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar sesión →"}
          </button>

          <p className="login-footer-note">
            ¿Problemas para acceder? Contactá a tu institución.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
