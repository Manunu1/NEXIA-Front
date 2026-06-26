import { useEffect, useState } from "react";
import Select from "react-select";
import "./formAsignarMateriaProfesor.css";

interface Option { value: number; label: string; }

const FormAsignarMateriaProfesor = () => {
  const [profesores, setProfesores] = useState<Option[]>([]);
  const [materias, setMaterias] = useState<Option[]>([]);
  const [cursos, setCursos] = useState<Option[]>([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState<Option | null>(null);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<Option | null>(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Option | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const institucionId = localStorage.getItem("institucion_id");

  useEffect(() => {
    if (!institucionId) return;
    fetch(`http://localhost:3000/api/profesores?institucion_id=${institucionId}`)
      .then(r => r.json())
      .then(result => {
        setProfesores(result.data.map((p: any) => ({ value: p.profesor_id, label: `${p.apellido}, ${p.nombre}` })));
      })
      .catch(err => console.error("Error cargando profesores:", err));
  }, [institucionId]);

  useEffect(() => {
    if (!institucionId) return;
    fetch(`http://localhost:3000/api/materias?institucion_id=${institucionId}`)
      .then(r => r.json())
      .then(result => {
        setMaterias(result.data.map((m: any) => ({ value: m.materia_id, label: `${m.nombre} (${m.especialidad_nombre || "General"})` })));
      })
      .catch(err => console.error("Error cargando materias:", err));
  }, [institucionId]);

  useEffect(() => {
    if (!institucionId) return;
    fetch(`http://localhost:3000/api/cursos?institucion_id=${institucionId}`)
      .then(r => r.json())
      .then(result => {
        setCursos(result.data.map((c: any) => ({ value: c.curso_id, label: `${c.anio}° ${c.division}` })));
      })
      .catch(err => console.error("Error cargando cursos:", err));
  }, [institucionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profesorSeleccionado || !materiaSeleccionada || !cursoSeleccionado) {
      alert("Seleccioná profesor, materia y curso");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/gestor/profesores/asignar-materia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profesor_id: profesorSeleccionado.value,
          materia_id: materiaSeleccionada.value,
          curso_id: cursoSeleccionado.value,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error en la asignación");
      }
      setSuccess(true);
      setProfesorSeleccionado(null);
      setMateriaSeleccionada(null);
      setCursoSeleccionado(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Error al asignar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="gestor-form-card">

      <div className="gestor-form-header">
        <div className="gestor-form-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </div>
        <div className="gestor-form-header-text">
          <span className="gestor-form-header-title">Asignar materia</span>
          <span className="gestor-form-header-sub">Vinculá un docente a su materia y curso</span>
        </div>
      </div>

      <div className="gestor-form-body">

        <div className="form-field">
          <label>Profesor</label>
          <Select
            options={profesores}
            value={profesorSeleccionado}
            onChange={(opt) => setProfesorSeleccionado(opt)}
            placeholder="Buscar profesor..."
            isClearable
            noOptionsMessage={() => "Sin resultados"}
          />
        </div>

        <div className="form-field">
          <label>Curso</label>
          <Select
            options={cursos}
            value={cursoSeleccionado}
            onChange={(opt) => setCursoSeleccionado(opt)}
            placeholder="Seleccionar curso..."
            isClearable
            noOptionsMessage={() => "Sin resultados"}
          />
        </div>

        <div className="form-field">
          <label>Materia</label>
          <Select
            options={materias}
            value={materiaSeleccionada}
            onChange={(opt) => setMateriaSeleccionada(opt)}
            placeholder="Seleccionar materia..."
            isClearable
            noOptionsMessage={() => "Sin resultados"}
          />
        </div>

      </div>

      <div className="gestor-form-footer">
        {success && (
          <div style={{ marginBottom: '0.75rem', padding: '0.625rem 0.875rem', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 'var(--r2)', fontSize: '0.82rem', color: '#16A34A', fontWeight: 600 }}>
            ✓ Asignación realizada exitosamente
          </div>
        )}
        <button type="submit" className="form-submit" disabled={loading}>
          {loading ? "Asignando..." : "Confirmar asignación"}
        </button>
      </div>

    </form>
  );
};

export default FormAsignarMateriaProfesor;
