import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { haySesion } from '../../utils/session';

/* ─────────────────────────────────────────────
   LAYOUT — shell único para toda ruta autenticada:
   Sidebar + Outlet. Antes cada página repetía su
   propio <Sidebar/>, lo que hacía casi imposible
   mantener consistencia (y el guard de sesión
   vive acá para que el Sidebar nunca llegue a
   montarse sin una sesión activa).
───────────────────────────────────────────── */

const Layout: React.FC = () => {
  const location = useLocation();

  if (!haySesion()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      <Sidebar />
      <Outlet />
    </>
  );
};

export default Layout;
