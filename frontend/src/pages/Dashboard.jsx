import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import defaultProfilePic from "../assets/person-circle.svg";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import Footer from "../components/Footer";
import WishlistCount from "../components/wishlistcount";

const Dashboard = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest", "low-to-high", "high-to-low"

  // Function to fetch user profile from your backend
  const fetchUserProfile = async (email) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/get-profile?email=${email}`);
      const data = await response.json();
      if (response.ok) return data;
      throw new Error(data.error || "Failed to fetch profile");
    } catch (error) {
      console.error("Fetch Profile Error:", error);
      return null;
    }
  };

  // Fetch products from your backend
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get-products");
      const data = await response.json();
      console.log("📦 Products from API:", data);
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const email = auth.currentUser.email;
        const name = email.split("@")[0];
        const profileData = await fetchUserProfile(email);
        setUser({
          id: profileData?.id, // MySQL user id
          name: profileData?.name || name,
          profilePic: profileData?.profilePic || defaultProfilePic,
        });
      }
    };

    fetchUserData();
    fetchProducts();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Show a loading message until the user object is available
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Filter products based on search term, category, and condition ("state")
  let filteredProducts = products.filter((product) =>
    (selectedCategory === "All" || product.category === selectedCategory) &&
    (selectedCondition === "" || product.state === selectedCondition) &&
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort the filtered products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "low-to-high") {
      return a.price - b.price;
    } else if (sortOrder === "high-to-low") {
      return b.price - a.price;
    } else {
      return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow-md sticky top-0 z-10">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600 hover:scale-110 hover:cursor-pointer"
        onClick={() => navigate("/")}
        >
          🎓 UniSale
        </div>

        {/* Search Bar */}
        <div className="relative w-1/2 hover:scale-105">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search text-gray-400" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Wishlist & Profile */}
        <div className="flex items-center space-x-4 relative">
          <Link to="/wishlist" title="Wishlist" className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="red" className="hover:scale-110 transition-transform cursor-pointer" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M10.5 3.5a2.5 2.5 0 0 0-5 0V4h5zm1 0V4H15v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4h3.5v-.5a3.5 3.5 0 1 1 7 0M14 14V5H2v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1M8 7.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132"/>
            </svg>
            <WishlistCount userId={user.id} />
          </Link>
          <Link to="/cart" title="Cart" className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="orange" className="hover:scale-110 transition-transform cursor-pointer" viewBox="0 0 16 16">
              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
          </Link>
          <div className="relative">
            <img
              src={user.profilePic}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-blue-500 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setMenuOpen(!menuOpen)}
            />
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-2 z-50">
                <p className="px-4 py-2 text-gray-700 font-medium">{user.name}</p>
                <hr />
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => navigate("/profile")}>
                  View Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 px-6 py-4 bg-white shadow-md rounded-lg mx-4 mt-4">
        {/* Category Filter */}
        <div className="flex flex-col text-sm text-gray-600 hover:scale-105">
          <label htmlFor="category" className="mb-1 font-medium">Category</label>
          <select
            id="category"
            className="border px-4 py-2 rounded w-64 md:w-60"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Books & Study Material">Books & Study Material</option>
            <option value="Electronics & Gadgets">Electronics & Gadgets</option>
            <option value="Hostel & Room Essentials">Hostel & Room Essentials</option>
            <option value="Clothing & Accessories">Clothing & Accessories</option>
            <option value="Stationery & Supplies">Stationery & Supplies</option>
            <option value="Bicycles & Transport">Bicycles & Transport</option>
            <option value="Home Appliances">Home Appliances</option>
            <option value="Furniture">Furniture</option>
            <option value="Event & Fest Items">Event & Fest Items</option>
            <option value="Gaming & Entertainment">Gaming & Entertainment</option>
          </select>
        </div>

        {/* Condition Filter */}
        <div className="flex flex-col text-sm text-gray-600 hover:scale-105">
          <label htmlFor="condition" className="mb-1 font-medium">Condition</label>
          <select
            id="condition"
            className="border px-4 py-2 rounded w-64 md:w-60"
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
          >
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Used">Used</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="flex flex-col text-sm text-gray-600 hover:scale-105">
          <label htmlFor="sort" className="mb-1 font-medium">Sort By</label>
          <select
            id="sort"
            className="border px-4 py-2 rounded w-64 md:w-60"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
          </select>
        </div>

        {/* Sell Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 mt-2 md:mt-6 rounded hover:bg-blue-600 transition hover:scale-105"
          >
            + Sell Product
          </button>
        )}
      </div>

      {/* Greeting */}
      <div className="text-center mt-4">
        <h2 className="text-xl font-semibold text-gray-800">Welcome, {user.name}</h2>
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="flex justify-center mt-4">
          <ProductForm setShowForm={setShowForm} userId={user.id} onProductAdded={fetchProducts} />
        </div>
      )}

      {/* Product List */}
      <div className="px-4 md:px-20 mt-6">
        <ProductList products={filteredProducts} userId={user.id} fetchProducts={fetchProducts} />
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
