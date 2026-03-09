import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // If there is no token, redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If there is a token, show the requested page (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;