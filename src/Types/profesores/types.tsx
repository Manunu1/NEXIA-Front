export interface typeContenido {
  contenido_id: number;         
  titulo: string;      
  descripcion: string; 
  tipo_contenido: string;
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