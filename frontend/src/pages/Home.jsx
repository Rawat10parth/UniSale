import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to UniSale 🎉</h1>
      <p className="text-lg text-gray-600 mb-8">The marketplace for university students.</p>

      <div className="space-x-4">
        <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition">
          Login
        </Link>
        <Link to="/signup" className="px-6 py-3 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition">
          Signup
        </Link>
      </div>
    </div>
  );
};

export default Home;
