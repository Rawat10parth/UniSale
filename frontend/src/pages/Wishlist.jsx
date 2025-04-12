import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import ZoomableImage from "../components/ZoomableImage";

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
      const res = await fetch("http://127.0.0.1:5000/toggle-wishlist", {
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Your Wishlist</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button className="flex items-center gap-2 bg-blue-500 shadow-lg shadow-blue-500/50 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-200 hover:scale-105"
        onClick={() => navigate("/dashboard")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-bar-left" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5"/>
        </svg>
        Go Back
      </button>
      <h2 className="text-3xl font-bold mb-6 text-center">Your Wishlist</h2>   

      {/* Filters for Wishlist */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
        <div className="flex flex-col hover:scale-105">
          <label className="text-sm font-medium text-gray-600 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border px-4 py-2 rounded"
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
        <div className="flex flex-col hover:scale-105">
          <label className="text-sm font-medium text-gray-600 mb-1">Condition</label>
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="border px-4 py-2 rounded"
          >
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Used">Used</option>
          </select>
        </div>
      </div>

      {filteredWishlist.length === 0 ? (
        <p className="text-gray-500 text-center">No items in your wishlist.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredWishlist.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Add onClick to navigate to product detail */}
              <div 
                onClick={() => handleProductClick(item.id)} 
                className="cursor-pointer"
              >
                <ZoomableImage 
                  src={item.image_url}
                  alt={item.name || "Product"}
                  aspectRatio="4/3"
                />
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{item.name || "Unnamed Product"}</h3>
                  <p className="text-gray-600 text-sm mt-1 truncate">{item.description || "No description available"}</p>
                  <p className="text-sm italic text-gray-500">{item.category || "Uncategorized"}</p>
                  <p className="text-sm italic text-gray-500">{item.state || "Unknown condition"}</p>
                  <p className="text-green-600 font-bold mt-2">₹ {item.price || "N/A"}</p>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation
                    removeFromWishlist(item.image_url);
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
                >
                  Remove from Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg z-50 transition-all duration-500">
          {toastMsg}
        </div>
      )}
    </div>
  );
};

Wishlist.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default Wishlist;