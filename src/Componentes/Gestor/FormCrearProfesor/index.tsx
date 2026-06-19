"use client";

import { useEffect, useState } from "react";
import Select from "react-select";

interface Institucion {
    id: string;
    nombre: string;
}

export default function FormCrearProfesor() {
    const [instituciones, setInstituciones] = useState<any[]>([]);
    const [selectedInstitucion, setSelectedInstitucion] = useState<any>(null);

    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        dni: "",
    });

    const [loading, setLoading] = useState(false);

    // 🔹 TRAER INSTITUCIONES
    useEffect(() => {
        const fetchInstituciones = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/instituciones");
                const data = await res.json();

                console.log("INSTITUCIONES:", data);

                setInstituciones(
                    data.map((inst: Institucion) => ({
                        value: inst.id,
                        label: inst.nombre,
                    }))
                );
            } catch (err) {
                console.error("Error cargando instituciones", err);
            }
        };

        fetchInstituciones();
    }, []);

    // 🔹 HANDLE INPUTS
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // 🔹 SUBMIT
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedInstitucion) {
            alert("Seleccioná una institución");
            return;
        }

        const payload = {
            institucion_id: selectedInstitucion.value,
            nombre: form.nombre,
            apellido: form.apellido,
            email: form.email,
            password: form.password,
            dni: form.dni,
        };

        console.log("ENVIANDO:", payload);

        try {
            setLoading(true);

            const res = await fetch(
                "http://localhost:3000/api/gestor/profesores",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                console.log("BACKEND ERROR:", data);
                throw new Error(data.message);
            }

            alert("Profesor creado 🚀");

            // reset
            setForm({
                nombre: "",
                apellido: "",
                email: "",
                password: "",
                dni: "",
            });
            setSelectedInstitucion(null);

        } catch (err) {
            console.error(err);
            alert("Error creando profesor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
            <h2>Crear Profesor</h2>

            <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={form.nombre}
                onChange={handleChange}
            />

            <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={form.apellido}
                onChange={handleChange}
            />

            <input
                type="text"
                name="dni"
                placeholder="DNI"
                value={form.dni}
                onChange={handleChange}
            />

            <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
            />

            <input
                type="text"
                name="password"
                placeholder="Contraseña"
                value={form.password}
                onChange={handleChange}
            />

            <div style={{ marginTop: 10 }}>
                <label>Institución</label>
                <Select
                    options={instituciones}
                    value={selectedInstitucion}
                    onChange={(option) => setSelectedInstitucion(option)}
                    placeholder="Seleccionar institución"
                />
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: 20 }}>
                {loading ? "Creando..." : "Crear Profesor"}
            </button>
        </form>
    );
}