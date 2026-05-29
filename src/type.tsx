export interface Contenido {
  contenido_id: number;
  titulo: string;
  descripcion: string;
  archivo_url: string;
  fecha_creacion: string;
  tipo_contenido_id: number;
  tipo_contenido: string;
  profesor_id: number;
  profesor_nombre: string;
  profesor_apellido: string;
}

export interface Materia {
  materia_id: number;
  materia_nombre: string;
  materia_descripcion: string;
  curso_id: number;
  anio: number;
  division: string;
  contenidos: Contenido[];
}

