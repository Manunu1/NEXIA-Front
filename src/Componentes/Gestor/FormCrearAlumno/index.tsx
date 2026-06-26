import { useEffect, useState } from "react";
import Select from "react-select";
import "./formAlumno.css";

interface Institucion { id: string; nombre: string; }
interface Curso { curso_id: string; institucion_id: string; anio: number; division: string; }
interface Option { value: string; label: string; }

export default function FormCrearAlumno() {
  const [instituciones, setInstituciones] = useState<Option[]>([]);
  const [cursos, setCursos] = useState<Option[]>([]);
  const [selectedInstitucion, setSelectedInstitucion] = useState<Option | null>(null);
  const [selectedCurso, setSelectedCurso] = useState<Option | null>(null);
  const [form, setForm] = useState({ nombre: "", apellido: "", dni: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/instituciones")
      .then((res) => res.json())
      .then((data: Institucion[]) => {
        setInstituciones(data.map((inst) => ({ value: inst.id, label: inst.nombre })));
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedInstitucion) return;
    fetch(`http://localhost:3000/api/cursos?institucionId=${selectedInstitucion.value}`)
      .then((res) => res.json())
      .then((response) => {
        setCursos((response.data || []).map((curso: Curso) => ({
          value: curso.curso_id,
          label: `${curso.anio}° ${curso.division}`,
        })));
      })
      .catch((err) => console.error(err));
  }, [selectedInstitucion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCurso || !selectedInstitucion) { alert("Seleccioná institución y curso"); return; }

    const payload = {
      institucion_id: selectedInstitucion.value,
      nombre: form.nombre, apellido: form.apellido,
      email: form.email, password: form.password,
      dni: form.dni, curso_id: selectedCurso.value,
    };

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/gestor/alumnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
      setForm({ nombre: "", apellido: "", dni: "", email: "", password: "" });
      setSelectedInstitucion(null);
      setSelectedCurso(null);
      setCursos([]);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Error creando alumno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="gestor-form-card">

      <div className="gestor-form-header">
        <div className="gestor-form-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div className="gestor-form-header-text">
          <span className="gestor-form-header-title">Nuevo alumno</span>
          <span className="gestor-form-header-sub">Completá los datos del estudiante</span>
        </div>
      </div>

      <div className="gestor-form-body">

        <div className="gestor-form-row">
          <div className="form-field">
            <label htmlFor="a-nombre">Nombre</label>
            <input id="a-nombre" name="nombre" type="text" placeholder="Ej: Lucas" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label htmlFor="a-apellido">Apellido</label>
            <input id="a-apellido" name="apellido" type="text" placeholder="Ej: Martínez" value={form.apellido} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="a-dni">DNI</label>
          <input id="a-dni" name="dni" type="text" placeholder="Ej: 45678901" value={form.dni} onChange={handleChange} required />
        </div>

        <div className="form-field">
          <label htmlFor="a-email">Email</label>
          <input id="a-email" name="email" type="email" placeholder="alumno@institución.edu.ar" value={form.email} onChange={handleChange} required />
        </div>

        <div className="form-field">
          <label htmlFor="a-password">Contraseña</label>
          <input id="a-password" name="password" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={handleChange} required />
        </div>

        <div className="form-field">
          <label>Institución</label>
          <Select
            options={instituciones}
            value={selectedInstitucion}
            onChange={(value) => { setSelectedInstitucion(value); setSelectedCurso(null); setCursos([]); }}
            placeholder="Seleccionar institución..."
            noOptionsMessage={() => "Sin resultados"}
          />
        </div>

        <div className="form-field">
          <label>Curso</label>
          <Select
            options={cursos}
            value={selectedCurso}
            onChange={(value) => setSelectedCurso(value)}
            placeholder="Seleccionar curso..."
            isDisabled={!selectedInstitucion}
            noOptionsMessage={() => "No hay cursos disponibles"}
          />
        </div>

      </div>

      <div className="gestor-form-footer">
        {success && (
          <div style={{ marginBottom: '0.75rem', padding: '0.625rem 0.875rem', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 'var(--r2)', fontSize: '0.82rem', color: '#16A34A', fontWeight: 600 }}>
            ✓ Alumno creado exitosamente
          </div>
        )}
        <button type="submit" className="form-submit" disabled={loading}>
          {loading ? "Creando..." : "Crear alumno"}
        </button>
      </div>

    </form>
  );
}
