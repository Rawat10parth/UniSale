import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const Wishlist = ({ userId }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/get-wishlist?user_id=${userId}`);
        const data = await res.json();
        setWishlist(data);
      } catch (err) {
        console.error("❌ Error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchWishlist();
    }
  }, [userId]);

  const removeFromWishlist = async (image_url) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/toggle-wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users_id: userId, image_url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove");
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

  // Filter wishlist based on selected category and condition
  const filteredWishlist = wishlist.filter((item) => {
    const categoryMatch = selectedCategory === "All" || item.category === selectedCategory;
    const conditionMatch = selectedCondition === "" || item.state === selectedCondition;
    return categoryMatch && conditionMatch;
  });

  if (loading) return <p className="text-center">Loading wishlist...</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Wishlist</h2>

      {/* Filters for Wishlist */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
        <div className="flex flex-col">
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
        <div className="flex flex-col">
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
              <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600 text-sm mt-1 truncate">{item.description}</p>
                <p className="text-sm italic text-gray-500">{item.category}</p>
                <p className="text-sm italic text-gray-500">{item.state}</p>
                <p className="text-green-600 font-bold mt-2">₹ {item.price}</p>
                <button
                  onClick={() => removeFromWishlist(item.image_url)}
                  className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
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
