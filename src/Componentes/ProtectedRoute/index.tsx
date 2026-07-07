import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AccesoDenegado from "../../Paginas/AccesoDenegado";
import { getRolActual, haySesion } from "../../utils/session";
import type { Rol } from "../../utils/session";

interface ProtectedRouteProps {
  children: JSX.Element;
  /** Roles que pueden acceder. Sin especificar = cualquier usuario autenticado. */
  roles?: Rol[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const location = useLocation();

  // Sin sesión → al login
  if (!haySesion()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Con sesión pero rol no autorizado → 403 (mantiene la URL para
  // evidenciar que la ruta existe pero está protegida)
  if (roles && !roles.includes(getRolActual())) {
    return <AccesoDenegado />;
  }

  return children;
};

export default ProtectedRoute;
