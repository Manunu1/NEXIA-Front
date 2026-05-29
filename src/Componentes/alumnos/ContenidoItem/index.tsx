import { type Contenido } from '../../../type'; // Ajustar ruta según donde pongas la interfaz
import './contenidoItem.css';

interface Props {
  contenido: Contenido;
}

export default function ContenidoItem({ contenido }: Props) {
  return (
    <div className="contenido-card">
      <div className="contenido-icon">
        {/* Placeholder de icono, se puede reemplazar por un SVG real de tu diseño */}
        📄
      </div>
      <div className="contenido-text">
        <h4 className="contenido-titulo">{contenido.titulo}</h4>
        <span className="contenido-desc">{contenido.descripcion} • {contenido.tipo_contenido}</span>
      </div>
      <a href={contenido.archivo_url} target="_blank" rel="noreferrer" className="contenido-download">
        ⬇️
      </a>
    </div>
  );
}

