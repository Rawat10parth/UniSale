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
  const ITEMS_PER_LOAD = 9;

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
    <InfiniteScroll
      dataLength={displayedProducts.length}
      next={fetchMoreData}
      hasMore={hasMore}
      loader={<h4 className="text-center">Loading...</h4>}
      endMessage={<p className="text-center">No more products.</p>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {displayedProducts.length === 0 ? (
          <p>No products available.</p>
        ) : (
          displayedProducts.map((product) => {
            const inWishlist = wishlistItems.includes(product.image_url);
            return (
              <div
                key={product.id}
                className="border p-4 rounded-lg shadow-md hover:scale-105 transition"
              >
                 <div 
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="cursor-pointer"
                >
                {/* Replace the previous image container with EnhancedImage */}
                <ZoomableImage 
                  src={product.image_url}
                  alt={product.name}
                  aspectRatio="4/3"
                />
                
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-600 text-sm">{product.description}</p>
                <p className="text-sm italic text-gray-500">{product.category}</p>
                <p className="text-sm italic text-gray-500">{product.state}</p>
                <p className="text-green-600 font-bold mt-1">₹{product.price}</p>
                </div>
                <button
                  onClick={() => toggleWishlist(product.image_url)}
                  className={`mt-2 px-4 py-2 rounded text-white w-full ${
                    inWishlist ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                </button>
                {product.user_id === userId && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setEditProduct(product)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded w-full"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded w-full"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4">Edit Product</h3>
            <input
              type="text"
              value={editProduct.name}
              onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
              placeholder="Product Name"
              required
            />
            <textarea
              value={editProduct.description}
              onChange={(e) =>
                setEditProduct({ ...editProduct, description: e.target.value })
              }
              className="border p-2 w-full mb-2 rounded"
              placeholder="Description"
              required
            />
            <input
              type="number"
              value={editProduct.price}
              onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
              placeholder="Price"
              required
            />
            <select
              value={editProduct.state || ""}
              onChange={(e) => setEditProduct({ ...editProduct, state: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
            >
              <option value="">Select Condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setEditProduct(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </InfiniteScroll>
  );
};

ProductList.propTypes = {
  products: PropTypes.array.isRequired,
  userId: PropTypes.string.isRequired,
  fetchProducts: PropTypes.func.isRequired,
};

export default ProductList;