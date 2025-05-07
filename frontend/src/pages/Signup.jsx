import { auth } from "../firebase";
import { signInWithPopup, OAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


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
      toast.error("Signup failed! " + error.message);
    }
  };
  
  const registerUserInDB = async (user) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
        }),
      });
  
      const data = await response.json();
      toast.success(data.message); // Show success or error message
  
      return data.success; // Return success status
  
    } catch (error) {
      console.error("Error saving user to database:", error);
      return false;
    }
  };
  

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/home-bg.png')" }}
    >
    <div className="bg-transparent p-10 rounded-2xl text-center max-w-md w-full">
      <h2 className="text-3xl font-bold text-fuchsia-200 mb-5 drop-shadow-[0_1px_3px_rgba(255,255,255,0.2)] hover:scale-105">Sign up for UniSale</h2>
    <button 
      onClick={handleMicrosoftSignup}
      className="w-full py-3 bg-green-700 shadow-lg shadow-green-500/50 text-white rounded-md hover:bg-green-600 transition font-medium hover:scale-110">
      Signup with Microsoft
    </button>
  </div>
</div>
  );
};

export default Signup;
