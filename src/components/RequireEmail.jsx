import { Navigate, useSearchParams } from "react-router-dom";

export default function RequireEmail({ children }) {
  const [searchParams] = useSearchParams();
  if (!searchParams.get("token")) return <Navigate to="/menu" replace />;
  return children;
}
