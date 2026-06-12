import { useEffect, useState } from "react";
import Select from "react-select";
import "./formAsignarMateriaProfesor.css"

interface Option {
    value: number;
    label: string;
}

const FormAsignarMateriaProfesor = () => {
    const [profesores, setProfesores] = useState<Option[]>([]);
    const [materias, setMaterias] = useState<Option[]>([]);
    const [cursos, setCursos] = useState<Option[]>([]);

    const [profesorSeleccionado, setProfesorSeleccionado] = useState<Option | null>(null);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState<Option | null>(null);
    const [cursoSeleccionado, setCursoSeleccionado] = useState<Option | null>(null);

    const [loading, setLoading] = useState(false);

    const institucionId = localStorage.getItem("institucion_id");

    // 🔹 PROFESORES
    useEffect(() => {
        const fetchProfesores = async () => {
            try {
                const res = await fetch(
                    `http://localhost:3000/api/profesores?institucion_id=${institucionId}`
                );

                const result = await res.json();

                const options = result.data.map((p: any) => ({
                    value: p.profesor_id,
                    label: `${p.apellido}, ${p.nombre}`,
                }));

                setProfesores(options);
            } catch (error) {
                console.error("Error cargando profesores:", error);
            }
        };

        if (institucionId) fetchProfesores();
    }, [institucionId]);

    // 🔹 MATERIAS
    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const res = await fetch(
                    `http://localhost:3000/api/materias?institucion_id=${institucionId}`
                );

                const result = await res.json();

                const options = result.data.map((m: any) => ({
                    value: m.materia_id,
                    label: `${m.nombre} (${m.especialidad_nombre || "General"})`,
                }));

                setMaterias(options);
            } catch (error) {
                console.error("Error cargando materias:", error);
            }
        };

        if (institucionId) fetchMaterias();
    }, [institucionId]);

    // 🔹 CURSOS
    useEffect(() => {
        const fetchCursos = async () => {
            try {
                const res = await fetch(
                    `http://localhost:3000/api/cursos?institucion_id=${institucionId}`
                );

                const result = await res.json();

                const options = result.data.map((c: any) => ({
                    value: c.curso_id,
                    label: `${c.anio}° ${c.division}`,
                }));

                setCursos(options);
            } catch (error) {
                console.error("Error cargando cursos:", error);
            }
        };

        if (institucionId) fetchCursos();
    }, [institucionId]);

    // 🔹 SUBMIT
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profesorSeleccionado || !materiaSeleccionada || !cursoSeleccionado) {
            alert("Seleccioná profesor, materia y curso");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(
                "http://localhost:3000/api/gestor/profesores/asignar-materia",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        profesor_id: profesorSeleccionado.value,
                        materia_id: materiaSeleccionada.value,
                        curso_id: cursoSeleccionado.value,
                    }),
                }
            );

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Error en la asignación");
            }

            alert("Asignación correcta");

            setProfesorSeleccionado(null);
            setMateriaSeleccionada(null);
            setCursoSeleccionado(null);
        } catch (error) {
            console.error(error);
            alert("Error al asignar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-assignment-wrapper"> {/* Nuevo contenedor para centrar */}
            <form onSubmit={handleSubmit}>
                <h3>Asignar materia a profesor</h3>

                {/* PROFESOR */}
                <div>
                    <label>Profesor</label>
                    <Select
                        options={profesores}
                        value={profesorSeleccionado}
                        onChange={(opt) => setProfesorSeleccionado(opt)}
                        placeholder="Buscar profesor..."
                        isClearable
                    />
                </div>

                {/* CURSO */}
                <div>
                    <label>Curso</label>
                    <Select
                        options={cursos}
                        value={cursoSeleccionado}
                        onChange={(opt) => setCursoSeleccionado(opt)}
                        placeholder="Seleccionar curso..."
                        isClearable
                    />
                </div>

                {/* MATERIA */}
                <div>
                    <label>Materia</label>
                    <Select
                        options={materias}
                        value={materiaSeleccionada}
                        onChange={(opt) => setMateriaSeleccionada(opt)}
                        placeholder="Seleccionar materia..."
                        isClearable
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Asignando..." : "Asignar"}
                </button>
            </form>
        </div>
    );
};

export default FormAsignarMateriaProfesor;