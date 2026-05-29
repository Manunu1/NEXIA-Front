
import React, { useState } from "react";
import Contenido from "../Contenido";
import type { typeContenido } from "../../../Types/profesores/types";




const ListaContenido = ({idCurso: number}) => {

  const [trabajos, setTrabajos] = useState<typeContenido[]>([
    {
      id: 1,
      titulo: "Trabajo Práctico N°1: Estructuras de Datos y Tipado Estricto",
      descripcion: "Implementar componentes modulares aplicando interfaces y genéricos. Se evaluará la arquitectura y la eliminación de tipos implícitos 'any'.",
      tipo: "Tarea"
    },
    {
      id: 2,
      titulo: "Material Teórico: Modelado de Esquemas Relacionales",
      descripcion: "Apunte completo sobre restricciones de integridad, claves primarias (PK), claves foráneas (FK) y dependencias funcionales en bases de datos.",
      tipo: "Teoría"
    },
    {
      id: 3,
      titulo: "Guía Práctica: Optimización y Análisis Matemático",
      descripcion: "Resolución de problemas de aplicación práctica utilizando cálculo diferencial, límites y funciones complejas.",
      tipo: "Práctico"
    },
    {
      id: 4,
      titulo: "Lectura y Análisis: Comprensión Crítica y Argumentación",
      descripcion: "Análisis de textos contemporáneos asignados para el desarrollo del próximo panel de debate formal en clase.",
      tipo: "Lectura"
    },
    {
      id: 5,
      titulo: "Evaluación Parcial: Arquitectura de Software",
      descripcion: "Examen teórico-práctico escrito sobre los patrones de diseño y división de responsabilidades en aplicaciones multicapa.",
      tipo: "Evaluación"
    }
  ]);
  return (

        <div className="materias-grid">
                {trabajos.map((item) => (
                    <Contenido id={item.id} titulo={item.titulo} descripcion={item.descripcion} tipo={item.tipo}
                    />
                ))}
        </div>
  );
};

export default ListaContenido;