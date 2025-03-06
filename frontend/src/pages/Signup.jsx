import { auth } from "../firebase";
import { signInWithPopup, OAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const handleMicrosoftSignup = async () => {
    try {
      const provider = new OAuthProvider("microsoft.com");
      provider.setCustomParameters({ prompt: "login" });
  
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      if (!user.email.endsWith("@stu.upes.ac.in")) {
        alert("Signup is restricted to UPES students only!");
        return;
      }
  
      // ✅ Call registerUserInDB before navigating
      const success = await registerUserInDB(user);
  
      if (success) {
        navigate("/dashboard"); // Navigate only if signup was successful
      }
    } catch (error) {
      console.error("Microsoft Signup error:", error);
      alert("Signup failed! " + error.message);
    }
  };
  
  const registerUserInDB = async (user) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
        }),
      });
  
      const data = await response.json();
      alert(data.message); // Show success or error message
  
      return data.success; // Return success status
  
    } catch (error) {
      console.error("Error saving user to database:", error);
      return false;
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Signup for UniSale</h2>
        <button 
          onClick={handleMicrosoftSignup}
          className="w-full py-3 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition">
          Signup with Microsoft
        </button>
      </div>
    </div>
  );
};

export default Signup;
