import { useEffect, useState } from "react";
import Select from "react-select";

interface Institucion {
    id: string;
    nombre: string;
}

interface Curso {
    curso_id: string;
    institucion_id: string;
    anio: number;
    division: string;
}

interface Option {
    value: string;
    label: string;
}

export default function FormCrearAlumno() {
    const [instituciones, setInstituciones] = useState<Option[]>([]);
    const [cursos, setCursos] = useState<Option[]>([]);

    const [selectedInstitucion, setSelectedInstitucion] = useState<Option | null>(null);
    const [selectedCurso, setSelectedCurso] = useState<Option | null>(null);

    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        dni: "",
        email: "",
        password: "",
    });

    // 🔹 Traer instituciones
    useEffect(() => {
        fetch("http://localhost:3000/api/instituciones")
            .then((res) => res.json())
            .then((data: Institucion[]) => {
                console.log("INSTITUCIONES:", data);

                const opciones = data.map((inst) => ({
                    value: inst.id,
                    label: inst.nombre,
                }));

                setInstituciones(opciones);
            })
            .catch((err) => console.error(err));
    }, []);

    // 🔹 Traer cursos cuando cambia institución
    useEffect(() => {
        if (!selectedInstitucion) return;

        fetch(
            `http://localhost:3000/api/cursos?institucionId=${selectedInstitucion.value}`
        )
            .then((res) => res.json())
            .then((response) => {
                console.log("CURSOS:", response);

                const opciones = (response.data || []).map((curso: Curso) => ({
                    value: curso.curso_id,
                    label: `${curso.anio}° ${curso.division}`,
                }));

                setCursos(opciones);
            })
            .catch((err) => console.error(err));
    }, [selectedInstitucion]);

    // 🔹 Manejo inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // 🔹 Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCurso || !selectedInstitucion) {
            alert("Seleccioná institución y curso");
            return;
        }

        const payload = {
            institucion_id: selectedInstitucion.value, // ✅ CLAVE
            nombre: form.nombre,
            apellido: form.apellido,
            email: form.email,
            password: form.password,
            dni: form.dni,
            curso_id: selectedCurso.value // ✅ CLAVE
        };

        console.log("ENVIANDO:", payload);

        try {
            const res = await fetch("http://localhost:3000/api/gestor/alumnos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                console.log("BACKEND:", data);
                throw new Error(data.message);
            }

            console.log("OK:", data);
            alert("Alumno creado 🚀");

        } catch (err) {
            console.error(err);
            alert("Error creando alumno");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Crear Alumno</h2>

            <input
                name="nombre"
                placeholder="Nombre"
                onChange={handleChange}
            />

            <input
                name="apellido"
                placeholder="Apellido"
                onChange={handleChange}
            />

            <input
                name="dni"
                placeholder="DNI"
                onChange={handleChange}
            />

            <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
            />

            <input
                type="text"
                name="password"
                placeholder="Contraseña"
                onChange={handleChange}
            />

            {/* 🔹 Select Instituciones */}
            <label>Institución</label>
            <Select
                options={instituciones}
                value={selectedInstitucion}
                onChange={(value) => {
                    setSelectedInstitucion(value);
                    setSelectedCurso(null);
                    setCursos([]); // 🔥 limpia cursos al cambiar institución
                }}
                placeholder="Seleccionar institución"
            />

            {/* 🔹 Select Cursos */}
            <label>Curso</label>
            <Select
                options={cursos}
                value={selectedCurso}
                onChange={(value) => setSelectedCurso(value)}
                placeholder="Seleccionar curso"
                isDisabled={!selectedInstitucion}
                noOptionsMessage={() => "No hay cursos disponibles"}
            />

            <button type="submit">Crear</button>
        </form>
    );
}