export interface typeContenido {
  contenido_id: number;
  titulo: string;
  descripcion: string;
  tipo_contenido: string;
  tipo_contenido_id?: number;
  url: string
}

export interface typeCurso {
  id: number;
  materia_nombre: string;
  division: string;
  anio: number;
  materia_descripcion: string;
  profe_curso_materia_id: number;
}

export interface typeTipoContenido {
  id: number;
  nombre: string;
}


export interface typeContenidoForm {
  titulo: string;
  descripcion: string;
  tipo_contenido_id: number;
  archivo_url: string;
  profe_curso_materia_id: number
}

// ── Trabajos Prácticos ──────────────────────────────────────

export type EstadoEntrega = 'pendiente' | 'corregido' | null;

export interface typeTrabajoPractico {
  trabajo_practico_id: number;
  profe_curso_materia_id: number;
  titulo: string;
  descripcion: string;
  archivo_url: string | null;
  fecha_limite: string | null;
  activo: boolean;
  fecha_publicacion: string | null;
  cantidad_entregas?: number;
}

// Item de la lista del alumno: TP + su propia entrega fusionados
// (ver getByAlumnoAsync en trabajoPracticoRepository.js del backend).
export interface typeTrabajoPracticoAlumno extends typeTrabajoPractico {
  materia_id?: number;
  materia_nombre?: string;
  entrega_id?: number | null;
  estado?: EstadoEntrega;
  nota?: number | null;
  comentario_correccion?: string | null;
  fecha_correccion?: string | null;
  fecha_entrega?: string | null;
  entrega_archivo_url?: string | null;
  comentario_alumno?: string | null;
}

export interface typeEntregaRoster {
  alumno_id: number;
  alumno_nombre: string;
  alumno_apellido: string;
  entrega_id: number | null;
  archivo_url: string | null;
  comentario_alumno: string | null;
  fecha_entrega: string | null;
  estado: EstadoEntrega;
  nota: number | null;
  comentario_correccion: string | null;
  fecha_correccion: string | null;
}

// ── Bimestres / Calificaciones / Boletín ────────────────────

export interface typeBimestre {
  id: number;
  nombre: string;
  anio: number;
  orden: number;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
}

export interface typeCalificacionRoster {
  alumno_id: number;
  alumno_nombre: string;
  alumno_apellido: string;
  nota: number | null;
  observaciones: string | null;
}

export interface typeBoletinNotaFinal {
  materia_nombre: string;
  bimestre_id: number;
  bimestre_nombre: string;
  orden: number;
  nota: number | null;
  observaciones?: string | null;
}

export interface typeBoletinNotaTP {
  materia_nombre: string;
  titulo: string;
  nota: number | null;
  fecha_correccion: string | null;
  comentario_correccion?: string | null;
}

export interface typeBoletin {
  notas_finales: typeBoletinNotaFinal[];
  notas_trabajos_practicos: typeBoletinNotaTP[];
}