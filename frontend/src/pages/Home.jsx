import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-3xl font-bold">Welcome to UniSale 🎉</h1>
      <Link to="/login" className="px-4 py-2 bg-blue-500 text-white rounded">
        Login
      </Link>
      <Link to="/signup" className="px-4 py-2 bg-green-500 text-white rounded">
        Signup
      </Link>
    </div>
  );
};

export default Home;
