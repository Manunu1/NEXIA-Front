import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [institucionId, setInstitucionId] = useState("1");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("ALUMNO");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      if (!dni.trim()) {
        setError("Ingresá tu DNI");
        return;
      }

      if (!password.trim()) {
        setError("Ingresá tu contraseña");
        return;
      }
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          institucion_id: Number(institucionId),
          dni,
          password,
          rol,
        }),
      });

      if (!response.ok) {
        setError("Institución, DNI, contraseña o rol incorrectos");
        return;
      }

      const responseData = await response.json();

      const usuario = responseData.data;

      localStorage.setItem("usuario", JSON.stringify(usuario));

      localStorage.setItem("rol", usuario.rol);

      localStorage.setItem("institucion_id", usuario.institucion_id);

      if (usuario.alumno_id) {
        localStorage.setItem("alumno_id", usuario.alumno_id);

        navigate("/alumnos");
        return;
      }

      if (usuario.profesor_id) {
        localStorage.setItem("profesor_id", usuario.profesor_id);

        navigate("/profesor");
        return;
      }

      if (usuario.gestor_id) {
        localStorage.setItem("gestor_id", usuario.gestor_id);

        navigate("/gestor");
        return;
      }

      setError("No se pudo determinar el rol del usuario");
    } catch (error) {
      console.error(error);
      setError("Error conectando con el servidor");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>NEXIA</h1>
        {error && <div className="error-message">{error}</div>}
        <select
          className="login-field"
          value={institucionId}
          onChange={(e) => {
            setInstitucionId(e.target.value);
            setError("");
          }}
        >
          <option value="1">San Martin</option>
          <option value="2">ORT</option>
          <option value="3">Instituto Técnico Aurora</option>
        </select>

        <select
          className="login-field"
          value={rol}
          onChange={(e) => {
            setRol(e.target.value);
            setError("");
          }}
        >
          <option value="ALUMNO">Alumno</option>
          <option value="PROFESOR">Profesor</option>
          <option value="GESTOR">Gestor</option>
        </select>

        <input
          type="text"
          className="login-field"
          placeholder="DNI"
          value={dni}
          onChange={(e) => {
            setDni(e.target.value);
            setError("");
          }}
        />

        <input
          type="password"
          className="login-field"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />

        <button className="login-btn" onClick={handleLogin}>
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}

export default Login;
