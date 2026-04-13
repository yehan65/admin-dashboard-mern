import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/Auth";

export default function ProtectedRoute() {
  const { user, loading } = useContext(AuthContext);

  const cleanToken =
    typeof user === "string" ? user.replace(/^"|"$/g, "") : user;

  if (loading) return <div>Loading...</div>;

  return cleanToken ? <Outlet /> : <Navigate to="/login" replace />;
}
