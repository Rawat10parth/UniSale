import { auth } from "../firebase";
import { signInWithPopup, OAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom"; 
import { toast } from "react-toastify";// Import useNavigate

const Login = () => {
  const navigate = useNavigate(); // Initialize navigation

  const handleMicrosoftLogin = async () => {
    try {
      const provider = new OAuthProvider("microsoft.com");
      
      // Force Microsoft to always ask for email & password
      provider.setCustomParameters({ prompt: "login" });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      toast.success(`Login successful! Welcome ${user.displayName}`);

      // Redirect to Dashboard after successful login
      navigate("/dashboard");
    } catch (error) {
      toast.error("Login failed! " + error.message);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/home-bg.png')" }}
    >
      <div className="bg-transparent p-10 rounded-2xl text-center max-w-md w-full">
        <h2 className="text-3xl font-bold text-fuchsia-200 mb-5 drop-shadow-[0_1px_3px_rgba(255,255,255,0.2)] hover:scale-105">Login to UniSale</h2>

        <button
          onClick={handleMicrosoftLogin}
          className="w-full bg-blue-700 shadow-lg shadow-blue-500/50 text-white py-2 rounded-lg font-medium hover:bg-blue-500 transition duration-200 hover:scale-105"
        >
          Login with Microsoft
        </button>
      </div>
    </div>
  );
};

export default Login;
