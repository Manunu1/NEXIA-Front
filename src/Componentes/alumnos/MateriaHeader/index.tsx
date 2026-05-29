import './materiaHeader.css';

interface Props {
  nombre: string;
  anio: number;
  division: string;
  profesorNombre?: string;
  profesorApellido?: string;
}

export default function MateriaHeader({ nombre, anio, division, profesorNombre, profesorApellido }: Props) {
  return (
    <div className="materia-header-container">
      <div className="breadcrumbs">
        <span>MIS MATERIAS</span> {'>'} <strong>{nombre.toUpperCase()}</strong>
      </div>
      
      <div className="title-row">
        <h1 className="materia-title">{nombre}</h1>
        <span className="badge-curso">{anio}TO {division}</span>
      </div>

      {profesorNombre && profesorApellido && (
        <div className="profesor-info">
          <div className="profesor-avatar">
            {profesorNombre.charAt(0)}{profesorApellido.charAt(0)}
          </div>
          <div className="profesor-detalles">
            <span className="profesor-nombre">{profesorNombre} {profesorApellido}</span>
            <span className="profesor-rol">Docente Titular</span>
          </div>
        </div>
      )}
    </div>
  );
}