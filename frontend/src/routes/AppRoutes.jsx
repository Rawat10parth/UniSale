import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import PrivateRoute from "../components/PrivateRoute";
import ProductForm from "../components/ProductForm";
import Wishlist from "../pages/Wishlist";
import ProductDetail from "../pages/ProductDetails"; // Import the new component
import Cart from "../components/Cart";
import Checkout from "../components/Checkout";
import OrderConfirmation from "../components/OrderConfirmation"; // Import the new component
import Orders from "../pages/Orders"; // Import the new component

const AppRoutes = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe(); // clean up listener
  }, []);

  return (
    <Router>
      {/* Toast container must be outside Routes */}
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-product" element={<ProductForm />} />
          <Route path="/wishlist" element={<Wishlist userId={user?.uid} />} />
          <Route path="/product/:productId" element={<ProductDetail />} /> {/* New product detail route */}
        </Route>

        {/* Public Routes */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} /> {/* New order confirmation route */}
        <Route path="/orders" element={<Orders />} /> {/* New orders route */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;