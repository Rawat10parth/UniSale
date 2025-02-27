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
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold">Login</h2>
      <button
        onClick={handleMicrosoftLogin}
        className="p-2 bg-blue-600 text-white rounded mt-4"
      >
        Login with Microsoft
      </button>
    </div>
  );
};

export default Login;
