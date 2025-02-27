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
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold">Signup</h2>
      <button
        onClick={handleMicrosoftSignup}
        className="p-2 bg-blue-600 text-white rounded mt-4"
      >
        Signup with Microsoft
      </button>
    </div>
  );
};

export default Signup;
