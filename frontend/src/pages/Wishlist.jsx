import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import ZoomableImage from "../components/ZoomableImage";
import "../styles/SharedBackground.css";


const Wishlist = ({ userId }) => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        console.log(`Fetching wishlist for user ID: ${userId}`);
        const res = await fetch(`http://127.0.0.1:5000/get-wishlist?user_id=${userId}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch wishlist (Status: ${res.status})`);
        }
        
        const data = await res.json();
        console.log("Wishlist data received:", data);
        
        if (Array.isArray(data)) {
          setWishlist(data);
        } else {
          console.error("Unexpected response format:", data);
          setError("Invalid data format received");
        }
      } catch (err) {
        console.error("❌ Error fetching wishlist:", err);
        setError(err.message || "Failed to load wishlist");
        showToast("Failed to load wishlist items ❌");
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, [userId]);

  const removeFromWishlist = async (image_url) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/toggle-wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users_id: userId, image_url }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove");
      }
      
      // Update wishlist state by removing the item with matching image_url
      setWishlist(wishlist.filter((item) => item.image_url !== image_url));
      showToast("Removed from wishlist ✅");
    } catch (error) {
      console.error("❌ Remove error:", error);
      showToast("Failed to remove ❌");
    }
  };

  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Filter wishlist items based on selected category and condition
  const filteredWishlist = wishlist.filter((item) => {
    const categoryMatch = selectedCategory === "All" || item.category === selectedCategory;
    const conditionMatch = selectedCondition === "" || item.state === selectedCondition;
    return categoryMatch && conditionMatch;
  });

  const handleProductClick = (productId) => {
    if (!productId) {
      console.error("❌ Invalid product ID:", productId);
      showToast("Product details not available");
      return;
    }
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-6">
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Your Wishlist</h2>
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl mb-6">
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition duration-300 hover:scale-105 shadow-lg shadow-blue-500/25"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen p-4 md:p-6">
      {/* Background Elements */}
      <div className="geometric-pattern"></div>
      <div className="light-effects"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button 
            className="flex items-center gap-2 glass-effect text-white py-2.5 px-5 rounded-xl font-medium hover:bg-white/10 transition duration-300"
            onClick={() => navigate("/dashboard")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5"/>
            </svg>
            Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-white drop-shadow-xl">Your Wishlist</h2>
        </div>

        {/* Enhanced Filters */}
        <div className="glass-effect rounded-xl p-4 mb-8">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-white/80 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-64 bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2.5 hover:bg-white/10 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-white/80 mb-2">Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full md:w-64 bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2.5 hover:bg-white/10 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Conditions</option>
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>
          </div>
        </div>

        {filteredWishlist.length === 0 ? (
          <div className="glass-effect rounded-xl p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-white/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-white/70 text-lg">Your wishlist is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWishlist.map((item, index) => (
              <div
                key={index}
                className="group glass-effect rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300"
              >
                <div onClick={() => handleProductClick(item.id)} className="cursor-pointer">
                  <div className="relative">
                    <ZoomableImage 
                      src={item.image_url}
                      alt={item.name || "Product"}
                      aspectRatio="4/3"
                      className="group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm text-white">
                        {item.state || "Unknown"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{item.name || "Unnamed Product"}</h3>
                    <p className="text-white/70 text-sm mb-2 line-clamp-2">{item.description || "No description available"}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">{item.category || "Uncategorized"}</span>
                      <span className="text-lg font-bold text-emerald-400">₹{item.price || "N/A"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 pt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(item.image_url);
                    }}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 px-4 rounded-lg transition duration-300 border border-red-500/30"
                  >
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Updated Toast */}
        {toastMsg && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 glass-effect text-white px-6 py-3 rounded-xl z-50 animate-fade-in">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
};

Wishlist.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default Wishlist;