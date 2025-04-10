import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center animate-fadeIn"
      style={{ backgroundImage: "url('/home-bg.png')" }}
    >
      <div className="bg-transparent p-10 rounded-2xl text-center max-w-md w-full animate-slideUp">
        <h1 className="text-5xl font-bold text-fuchsia-200 mb-4 drop-shadow-[0_2px_5px_rgba(255,255,255,0.25)] hover:scale-110">
          UniSale
        </h1>
        <p className="text-lg text-pink-200 mb-8 drop-shadow-[0_1px_3px_rgba(255,255,255,0.2)]">
          The marketplace for university students.
        </p>

        <div className="flex justify-center space-x-4">
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg transition duration-300 border border-blue-700 hover:bg-blue-600 shadow-lg shadow-blue-500/50 hover:scale-110"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg transition duration-300 border hover:bg-green-700 border-green-700 shadow-lg shadow-green-500/50 hover:scale-110"
          >
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
