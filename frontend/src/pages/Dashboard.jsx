import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import defaultProfilePic from "../assets/person-circle.svg";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import Footer from "../components/Footer";
import WishlistCount from "../components/wishlistcount";
import CartCount from "../components/CartCount";
import "../styles/SharedBackground.css";

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
    <div className="page-bg min-h-screen">
      <div className="geometric-pattern"></div>
      <div className="light-effects"></div>

      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 glass-effect">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Left Side - Logo */}
          <div className="flex items-center gap-4">
            <div 
              onClick={() => navigate("/")}
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <div className="relative">
                <span className="text-3xl animate-pulse">🎓</span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              </div>
              <span>UniSale</span>
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" 
                     className="text-white/50 group-hover:text-blue-400 transition-colors duration-300" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Right Side - Action Icons & Profile */}
          <div className="flex items-center gap-6">
            {/* Welcome Message */}
            <div className="hidden lg:block">
              <h2 className="text-white font-medium">Welcome, {user?.name}</h2>
            </div>

            {/* Wishlist Icon */}
            <Link to="/wishlist" className="relative group hover:-translate-y-1 transition-all duration-300">
              <div className="p-2 rounded-full bg-white/5 hover:bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="red" 
              className="text-red-400 group-hover:text-red-300 transition-colors duration-300" viewBox="0 0 16 16" >
              <path fillRule="evenodd" d="M10.5 3.5a2.5 2.5 0 0 0-5 0V4h5zm1 0V4H15v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4h3.5v-.5a3.5 3.5 0 1 1 7 0M14 14V5H2v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1M8 7.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132"/>
            </svg>
              </div>
              <WishlistCount userId={user?.id} />
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative group hover:-translate-y-1 transition-all duration-300">
              <div className="p-2 rounded-full bg-white/5 hover:bg-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" 
                     className="text-orange-400 group-hover:text-orange-300 transition-colors duration-300" viewBox="0 0 16 16">
                  <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
              </div>
              <CartCount userId={user?.id} />
            </Link>

            {/* Notification Icon */}
            <Link
              to="/messages"
              className="text-white hover:text-blue-400 transition-colors duration-200"
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Messages
              </div>
            </Link>

            {/* Profile Menu */}
            <div className="relative">
              <div 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 cursor-pointer hover:scale-105 transition-all duration-300"
              >
                <img
                  src={user?.profilePic}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              </div>
              {menuOpen && (
                <div className="dropdown-menu absolute right-0 mt-4 w-56 p-2">
                  <div className="flex items-center gap-3 p-3 border-b border-white/10 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user?.name}</p>
                      <p className="text-white/60 text-sm">Student</p>
                    </div>
                  </div>
                  
                  <button className="w-full text-left px-4 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center gap-2 mb-1" 
                          onClick={() => navigate("/profile")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-blue-400" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    View Profile
                  </button>

                  <button className="w-full text-left px-4 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center gap-2 mb-1" 
                          onClick={() => navigate("/orders")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-green-400" viewBox="0 0 16 16">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
                    </svg>
                    My Orders
                  </button>

                  <div className="border-t border-white/10 my-2"></div>
                  
                  <button className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200 flex items-center gap-2" 
                          onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-red-400" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                      <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            {/* Category Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-white mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-4 pr-8 py-3 rounded-xl bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/20"
              >
                <option value="All" className="bg-gray-800">All Categories</option>
                <option value="Books & Study Material" className="bg-gray-800">Books & Study Material</option>
                <option value="Electronics & Gadgets" className="bg-gray-800">Electronics & Gadgets</option>
                <option value="Hostel & Room Essentials" className="bg-gray-800">Hostel & Room Essentials</option>
                <option value="Clothing & Accessories" className="bg-gray-800">Clothing & Accessories</option>
                <option value="Stationery & Supplies" className="bg-gray-800">Stationery & Supplies</option>
                <option value="Bicycles & Transport" className="bg-gray-800">Bicycles & Transport</option>
                <option value="Home Appliances" className="bg-gray-800">Home Appliances</option>
                <option value="Furniture" className="bg-gray-800">Furniture</option>
                <option value="Event & Fest Items" className="bg-gray-800">Event & Fest Items</option>
                <option value="Gaming & Entertainment" className="bg-gray-800">Gaming & Entertainment</option>
              </select>
            </div>

            {/* Condition Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-white mb-2">Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full pl-4 pr-8 py-3 rounded-xl bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/20"
              >
                <option value="" className="bg-gray-800">All Conditions</option>
                <option value="New" className="bg-gray-800">New</option>
                <option value="Used" className="bg-gray-800">Used</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-white mb-2">Sort By</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full pl-4 pr-8 py-3 rounded-xl bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/20"
              >
                <option value="newest" className="bg-gray-800">Newest First</option>
                <option value="low-to-high" className="bg-gray-800">Price: Low to High</option>
                <option value="high-to-low" className="bg-gray-800">Price: High to Low</option>
              </select>
            </div>

            {/* Sell Button */}
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center justify-center gap-2 py-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Sell Product
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <div className="glass-effect rounded-xl p-6">
            <ProductForm setShowForm={setShowForm} userId={user.id} onProductAdded={fetchProducts} />
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <ProductList products={filteredProducts} userId={user.id} fetchProducts={fetchProducts} />
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;