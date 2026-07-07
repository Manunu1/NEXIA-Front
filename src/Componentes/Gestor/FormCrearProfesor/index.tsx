"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import "./formProfesor.css";
import api from '../../../api';

interface Institucion {
  id: string;
  nombre: string;
}

interface Option {
  value: string;
  label: string;
}

export default function FormCrearProfesor() {
  const [instituciones, setInstituciones] = useState<Option[]>([]);
  const [selectedInstitucion, setSelectedInstitucion] = useState<Option | null>(null);
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", password: "", dni: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstituciones = async () => {
      try {
        const res = await api.get("/api/instituciones");
        const lista: Institucion[] = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const opciones = lista.map((inst) => ({ value: String(inst.id), label: inst.nombre }));
        setInstituciones(opciones);
        // Preseleccionar la institución del gestor logueado
        const propia = opciones.find((o) => o.value === String(localStorage.getItem("institucion_id")));
        if (propia) setSelectedInstitucion((prev) => prev ?? propia);
      } catch (err) {
        console.error("Error cargando instituciones", err);
      }
    };
    fetchInstituciones();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitucion) {
      setError("Seleccioná una institución antes de continuar.");
      return;
    }

    const payload = {
      institucion_id: selectedInstitucion.value,
      nombre: form.nombre, apellido: form.apellido,
      email: form.email, password: form.password, dni: form.dni,
    };

    try {
      setLoading(true);
      setError("");
      await api.post("/api/gestor/profesores", payload);
      setSuccess(true);
      setForm({ nombre: "", apellido: "", email: "", password: "", dni: "" });
      setSelectedInstitucion(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al crear el profesor. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="gestor-form-card">

      <div className="gestor-form-header">
        <div className="gestor-form-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <div className="gestor-form-header-text">
          <span className="gestor-form-header-title">Nuevo profesor</span>
          <span className="gestor-form-header-sub">Completá los datos del docente</span>
        </div>
      </div>

      <div className="gestor-form-body stagger-in">

        <div className="gestor-form-row">
          <div className="form-field">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" type="text" placeholder="Ej: María" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label htmlFor="apellido">Apellido</label>
            <input id="apellido" name="apellido" type="text" placeholder="Ej: García" value={form.apellido} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="dni">DNI</label>
          <input id="dni" name="dni" type="text" placeholder="Ej: 30123456" value={form.dni} onChange={handleChange} required />
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="docente@institución.edu.ar" value={form.email} onChange={handleChange} required />
        </div>

        <div className="form-field">
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={handleChange} required />
        </div>

        <div className="form-field">
          <label>Institución</label>
          <Select
            options={instituciones}
            value={selectedInstitucion}
            onChange={(option) => { setSelectedInstitucion(option); if (error) setError(""); }}
            placeholder="Seleccionar institución..."
            noOptionsMessage={() => "Sin resultados"}
          />
        </div>

      </div>

      <div className="gestor-form-footer">
        {success && (
          <div className="form-success-msg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Profesor creado exitosamente
          </div>
        )}
        {error && (
          <div className="form-error-msg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}
        <button type="submit" className="form-submit" disabled={loading}>
          {loading ? "Creando..." : "Crear profesor"}
        </button>
      </div>

    </form>
  );
}
