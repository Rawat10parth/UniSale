import { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/profile", { withCredentials: true })
      .then(response => setUser(response.data))
      .catch(error => console.error("Error fetching profile:", error));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold">Profile</h2>
      {user ? <p>Welcome, {user.email} 🎉</p> : <p>Loading...</p>}
    </div>
  );
};

export default Profile;
