import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";


const Profile = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!auth.currentUser) {
      toast.error("User is not logged in.");
      return;
    }

    axios.get(`http://localhost:5000/get-profile?email=${auth.currentUser.email}`)
      .then(response => {
        console.log("Profile Data:", response.data);  // Debugging
        setUser(response.data);
        setName(response.data.name || "");
        setPhoneNumber(response.data.phoneNumber || "");
        setImageUrl(response.data.profilePic || "");
      })
      .catch(error => console.error("Error fetching profile:", error));
  }, [auth.currentUser]);

  const handlePhoneUpdate = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) { 
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }
  
    try {
      const response = await axios.post(`http://localhost:5000/update-phone-number`, {
        user_id: user.id,
        phone_number: phoneNumber,
      });
  
      if (response.status === 200) {
        toast.success("Phone number updated successfully!");
      } else {
        toast.error("Error updating phone number.");
      }
    } catch (error) {
      console.error("Error updating phone number:", error.response?.data || error);
      toast.error("Failed to update phone number.");
    }
  };
  

  const handleNameUpdate = async () => {
    if (name.trim() === "") {
      toast.error("Name cannot be empty.");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/update-name`, {
        user_id: user.id,
        name,
      });
      toast.success("Name updated successfully!");
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("image", file);

    try {
      const response = await axios.post(`http://localhost:5000/update-profile-picture`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(response.data.image_url);
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/home-bg.png')" }}
    >
      <button className="absolute top-6 left-6 flex items-center gap-2 bg-blue-500 shadow-lg shadow-blue-500/50 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-200 hover:scale-105"
        onClick={() => navigate("/dashboard")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-bar-left" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5"/>
        </svg>
        Go Back
      </button>

      <div className="flex justify-center items-center min-h-screen w-full px-4">
        <div className="bg-opacity-10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-white/20">
          <h2 className="text-3xl font-bold text-fuchsia-100 mb-6 drop-shadow-[0_2px_5px_rgba(255,255,255,0.25)]">
            Your Profile
          </h2>
  
          {user ? (
            <>
              <img
                src={imageUrl || "/logo.jpg"}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/30 shadow-md"
              />
              <p className="text-fuchsia-100 mb-6 text-xl">
                Welcome, <span className="font-semibold ">{user.email}</span>
              </p>
  
              <div className="mb-4 text-left">
                <label className="block text-sm font-semibold text-fuchsia-100 mb-1">
                  Profile Picture
                </label>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="w-full p-2 bg-white/40 bg-opacity-20 text-black placeholder-white border border-white/30 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                />
              </div>
  
              <div className="mb-4 text-left">
                <label className="block text-sm font-semibold text-fuchsia-100 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-white/40 bg-opacity-20 text-black placeholder-white border border-white/30 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                />
                <button
                  onClick={handleNameUpdate}
                  className="mt-3 w-full bg-green-500 shadow-lg shadow-green-500/50 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition hover:scale-105"
                >
                  Update Name
                </button>
              </div>
  
              <div className="mb-4 text-left">
                <label className="block text-sm font-semibold text-fuchsia-100 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={10}
                  className="w-full p-2 bg-white/40 bg-opacity-20 text-black placeholder-white border border-white/30 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                />
                <button
                  onClick={handlePhoneUpdate}
                  className="mt-3 w-full bg-blue-600 shadow-lg shadow-blue-500/50 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition hover:scale-105"
                >
                  Update Phone
                </button>
              </div>
            </>
          ) : (
            <p className="text-white">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
