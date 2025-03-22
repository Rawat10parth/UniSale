import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!auth.currentUser) {
      console.error("User is not logged in.");
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
      alert("Phone number must be exactly 10 digits.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/update-phone-number", {
        user_id: user.id,
        phone_number: phoneNumber,
      });
  
      if (response.status === 200) {
        alert("Phone number updated successfully!");
      } else {
        alert("Error updating phone number.");
      }
    } catch (error) {
      console.error("Error updating phone number:", error.response?.data || error);
      alert("Failed to update phone number.");
    }
  };
  

  const handleNameUpdate = async () => {
    if (name.trim() === "") {
      alert("Name cannot be empty.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/update-name", {
        user_id: user.id,
        name,
      });
      alert("Name updated successfully!");
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
      const response = await axios.post("http://localhost:5000/update-profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(response.data.image_url);
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold">Profile</h2>
      {user ? (
        <>
          <img src={imageUrl} alt="Profile" className="w-24 h-24 rounded-full mt-4" />
          <p className="mt-2">Welcome, {user.email} 🎉</p>

          <input type="file" onChange={handleImageUpload} className="mt-2 border p-2" />

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 border p-2"
            placeholder="Enter name"
          />
          <button onClick={handleNameUpdate} className="mt-2 bg-green-500 text-white px-4 py-2 rounded">Update Name</button>

          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-2 border p-2"
            placeholder="Enter phone number"
            maxLength={10}
          />
          <button onClick={handlePhoneUpdate} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Update Phone</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;
