import { auth } from "../firebase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "../components/ProductForm";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-gray-800">Welcome to Your Dashboard 🎉</h1>
      
      {user ? (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-lg text-center w-96">
          <p className="text-lg font-medium text-gray-700">Logged in as: <span className="font-bold">{user.email}</span></p>
          
          <button 
            onClick={handleLogout}
            className="w-full mt-4 py-3 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition">
            Logout
          </button>

          <button 
            onClick={() => setShowForm(true)}
            className="w-full mt-4 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition">
            + Create Product
          </button>

          {showForm && <ProductForm />}
        </div>
      ) : (
        <p className="text-lg text-gray-600 mt-4">Loading user info...</p>
      )}
    </div>
  );
};

export default Dashboard;