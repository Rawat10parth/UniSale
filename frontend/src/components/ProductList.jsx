import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroll-component";
import ZoomableImage from "./ZoomableImage";

const ProductList = ({ products, userId, fetchProducts }) => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [editSuggestedPrice, setEditSuggestedPrice] = useState(null);
  const ITEMS_PER_LOAD = 12;

  // Calculate Suggested Price
  const calculateSuggestedPrice = (originalPrice, months, category) => {
    const DEPRECIATION_RATES = {
      "Books & Study Material": 0.5,
      "Electronics & Gadgets": 0.6,
      "Hostel & Room Essentials": 0.4,
      "Clothing & Accessories": 0.7,
      "Stationery & Supplies": 0.3,
      "Bicycles & Transport": 0.4,
      "Home Appliances": 0.5,
      "Furniture": 0.4,
      "Event & Fest Items": 0.6,
      "Gaming & Entertainment": 0.55,
      default: 0.5
    };
    
    const yearlyRate = DEPRECIATION_RATES[category] || DEPRECIATION_RATES.default;
    const monthlyRate = yearlyRate / 12;
    const depreciation = originalPrice * (monthlyRate * months);
    const suggestedPrice = Math.max(originalPrice - depreciation, originalPrice * 0.1);
    return Math.round(suggestedPrice);
  };

  // Fetch user's wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/get-wishlist?user_id=${userId}`);
        const data = await res.json();
        const wishlistImageUrls = data.map((item) => item.image_url);
        setWishlistItems(wishlistImageUrls);
      } catch (err) {
        console.error("❌ Error fetching wishlist:", err);
      }
    };
    if (userId) fetchWishlist();
  }, [userId]);

  // Infinite Scroll: Reset displayed products whenever products change
  useEffect(() => {
    setDisplayedProducts(products.slice(0, ITEMS_PER_LOAD));
    setHasMore(products.length > ITEMS_PER_LOAD);
  }, [products]);

  const fetchMoreData = () => {
    if (displayedProducts.length >= products.length) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      setDisplayedProducts(products.slice(0, displayedProducts.length + ITEMS_PER_LOAD));
    }, 500);
  };

  // Wishlist Toggle
  const toggleWishlist = async (image_url) => {
    if (!userId || !image_url) {
      console.error("❌ Missing userId or image_url", { userId, image_url });
      toast.error("Missing required data to update wishlist.");
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:5000/toggle-wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users_id: userId, image_url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to toggle wishlist");
      setWishlistItems((prev) =>
        prev.includes(image_url)
          ? prev.filter((item) => item !== image_url)
          : [...prev, image_url]
      );
    } catch (error) {
      console.error("❌ Wishlist Toggle Error:", error);
      toast.error("Something went wrong while updating wishlist.");
    }
  };

  // Delete Product
  const handleDelete = async (productId) => {
    const confirm = window.confirm("Are you sure you want to delete this product?");
    if (!confirm) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Product deleted");
        fetchProducts();
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting product");
    }
  };

  // Submit Edit Form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/products/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProduct),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Product updated!");
        setEditProduct(null);
        fetchProducts();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error updating product.");
      console.error("Edit error:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <InfiniteScroll
        dataLength={displayedProducts.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center py-6">
            <div className="elegant-spinner"></div>
          </div>
        }
        endMessage={
          <p className="text-center text-white/60 py-6">You have seen all products</p>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-white/80 text-lg">No products available matching your criteria.</p>
            </div>
          ) : (
            displayedProducts.map((product) => {
              const inWishlist = wishlistItems.includes(product.image_url);
              return (
                <div
                  key={product.id}
                  className="glass-effect rounded-xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div 
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="cursor-pointer"
                  >
                    {/* Product Image with Hover Effect */}
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <ZoomableImage 
                        src={product.image_url}
                        alt={product.name}
                        aspectRatio="4/3"
                      />
                      
                      {/* Category & Condition Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`badge ${product.state === 'New' ? 'badge-new' : 'badge-used'}`}>
                          {product.state}
                        </span>
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-medium text-white">{product.name}</h3>
                        <p className="text-lg font-bold text-green-400">₹{product.price}</p>
                      </div>
                      <p className="text-white/70 text-sm mb-2 line-clamp-2">{product.description}</p>
                      <p className="text-xs text-white/50 mb-2">{product.category}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => toggleWishlist(product.image_url)}
                      className={`w-full py-2.5 px-4 rounded-lg mb-2 transition-all duration-300 flex items-center justify-center gap-2 ${
                        inWishlist 
                          ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30" 
                          : "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                      </svg>
                      {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    </button>
                    
                    {product.user_id === userId && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditProduct(product)}
                          className="w-1/2 py-2.5 rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/30 transition-all duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="w-1/2 py-2.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-all duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </InfiniteScroll>

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <form
            onSubmit={handleEditSubmit}
            className="glass-effect border border-white/10 p-6 rounded-xl shadow-xl w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold mb-4 text-white">Edit Product</h3>
            <input
              type="text"
              value={editProduct.name}
              onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
              className="input-field w-full mb-3"
              placeholder="Product Name"
              required
            />
            <textarea
              value={editProduct.description}
              onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
              className="input-field w-full mb-3"
              placeholder="Description"
              rows="3"
              required
            />
            
            <select
              value={editProduct.state || ""}
              onChange={(e) => {
                if (e.target.value === "Used") {
                  setEditProduct({
                    ...editProduct,
                    state: e.target.value,
                    originalPrice: editProduct.price,
                    conditionDetails: "",
                  });
                  setEditSuggestedPrice(null);
                } else {
                  setEditProduct({
                    ...editProduct,
                    state: e.target.value,
                    originalPrice: "",
                    conditionDetails: "",
                    price: editProduct.price
                  });
                  setEditSuggestedPrice(null);
                }
              }}
              className="input-field w-full mb-3"
            >
              <option value="" className="bg-gray-800">Select Condition</option>
              <option value="New" className="bg-gray-800">New</option>
              <option value="Used" className="bg-gray-800">Used</option>
            </select>

            {/* Show price field for New products */}
            {editProduct.state === "New" && (
              <input
                type="number"
                value={editProduct.price || ""}
                onChange={(e) => setEditProduct({
                  ...editProduct,
                  price: e.target.value
                })}
                className="input-field w-full mb-3"
                placeholder="Price (₹)"
                min="0"
                required
              />
            )}

            {/* Show additional fields for Used products */}
            {editProduct.state === "Used" && (
              <>
                <input
                  type="number"
                  value={editProduct.originalPrice || ""}
                  onChange={(e) => {
                    const originalPrice = e.target.value;
                    const suggested = calculateSuggestedPrice(
                      Number(originalPrice),
                      Number(editProduct.conditionDetails) || 0,
                      editProduct.category
                    );
                    setEditSuggestedPrice(suggested);
                    setEditProduct({
                      ...editProduct,
                      originalPrice,
                      price: editProduct.price
                    });
                  }}
                  className="input-field w-full mb-3"
                  placeholder="Original Price (₹)"
                  min="0"
                  required
                />
                <input
                  type="number"
                  value={editProduct.conditionDetails || ""}
                  onChange={(e) => {
                    const months = e.target.value;
                    const suggested = calculateSuggestedPrice(
                      Number(editProduct.originalPrice),
                      Number(months),
                      editProduct.category
                    );
                    setEditSuggestedPrice(suggested);
                    setEditProduct({
                      ...editProduct,
                      conditionDetails: months,
                      price: editProduct.price
                    });
                  }}
                  className="input-field w-full mb-3"
                  placeholder="Months Used"
                  min="0"
                  required
                />
                <input
                  type="number"
                  value={editProduct.price || ""}
                  onChange={(e) => {
                    const newPrice = Number(e.target.value);
                    if (editSuggestedPrice && newPrice > editSuggestedPrice) {
                      setEditProduct({
                        ...editProduct,
                        price: editSuggestedPrice.toString()
                      });
                    } else {
                      setEditProduct({
                        ...editProduct,
                        price: e.target.value
                      });
                    }
                  }}
                  max={editSuggestedPrice}
                  className="input-field w-full mb-3"
                  placeholder="Selling Price (₹)"
                  min="0"
                  required
                />
                {editSuggestedPrice && (
                  <p className="text-sm text-white/70 mb-3">
                    Suggested maximum price: ₹{editSuggestedPrice}
                  </p>
                )}
              </>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition-colors duration-300"
                onClick={() => setEditProduct(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>  
      )}
    </div>
  );
};

ProductList.propTypes = {
  products: PropTypes.array.isRequired,
  userId: PropTypes.string.isRequired,
  fetchProducts: PropTypes.func.isRequired,
};

export default ProductList;