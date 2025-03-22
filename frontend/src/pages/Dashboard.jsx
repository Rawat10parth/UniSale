import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import defaultProfilePic from "../assets/person-circle.svg";
import ProductForm from "../components/ProductForm"; // Import the ProductForm component


const Dashboard = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false); // ✅ Added missing state for showForm

  // Function to fetch user profile from Flask backend
  const fetchUserProfile = async (email) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/get-profile?email=${email}`);
      const data = await response.json();
      if (response.ok) return data;
      throw new Error(data.error || "Failed to fetch profile");
    } catch (error) {
      console.error("Fetch Profile Error:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const email = auth.currentUser.email;
        const name = email.split("@")[0]; // Extract name from email
        
        try {
          const profileData = await fetchUserProfile(email);
          setUser({
            name: profileData?.name || name,
            profilePic: profileData?.profilePic || defaultProfilePic,
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser({ name, profilePic: defaultProfilePic });
        }
      }
    };

    fetchUserData();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 relative">
      {/* Profile Picture & Dropdown */}
      <div className="absolute top-5 right-5">
        <div className="relative">
          <img
            src={user?.profilePic}
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer border"
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-2">
              <p className="px-4 py-2 text-gray-700 font-medium">{user?.name}</p>
              <hr />
              <button 
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => navigate("/profile")}
              >
                View Profile
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard UI */}
      <h1 className="text-2xl font-bold text-center mb-6">Welcome to Your Dashboard 🎉</h1>
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-lg font-semibold">Logged in as:</p>
        <p className="text-xl font-bold text-gray-800">{user?.name}</p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4"
        >
          Logout
        </button>

        {/* Create Product Button & Form */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 ml-2"
          >
            + Create Product
          </button>
        ) : (
          <ProductForm />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
