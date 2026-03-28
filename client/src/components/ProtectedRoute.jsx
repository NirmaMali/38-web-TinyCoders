import { Navigate } from 'react-router-dom';
import useAuthStore from '../features/authStore';

export default function ProtectedRoute({ children, role }) {
  const { isRoleAuthenticated } = useAuthStore();

  if (!isRoleAuthenticated(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
