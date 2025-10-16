import { Navigate } from "react-router-dom";

export function ProtectedRoute({ isAuthenticated, children }: { isAuthenticated: boolean, children: JSX.Element }) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}
