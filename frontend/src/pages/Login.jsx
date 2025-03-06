import { auth } from "../firebase";
import { signInWithPopup, OAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Login = () => {
  const navigate = useNavigate(); // Initialize navigation

  const handleMicrosoftLogin = async () => {
    try {
      const provider = new OAuthProvider("microsoft.com");
      
      // Force Microsoft to always ask for email & password
      provider.setCustomParameters({ prompt: "login" });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User Info:", user);

      alert("Login successful! Welcome " + user.email);

      // Redirect to Dashboard after successful login
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed! " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Login to UniSale</h2>
        <button 
          onClick={handleMicrosoftLogin}
          className="w-full py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition">
          Login with Microsoft
        </button>
      </div>
    </div>
  );
};

export default Login;
