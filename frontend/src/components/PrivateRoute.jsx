import { Outlet, Navigate } from "react-router-dom";
import { auth } from "../firebase"; // Import Firebase auth

const PrivateRoute = () => {
  const user = auth.currentUser; // Check if user is logged in

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
