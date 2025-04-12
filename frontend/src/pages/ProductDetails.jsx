import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import ProductImageCarousel from "../components/ProductImageCarousel";


const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/product/${productId}`);
        
        if (!response.ok) {
          throw new Error("Product not found");
        }
        
        const data = await response.json();
        setProduct(data.product);
        setSeller(data.seller);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Failed to load product details");
        navigate("/dashboard");
      }
    };

    // Get current user info
    const fetchCurrentUser = async () => {
      try {
        const auth = getAuth();
        if (auth.currentUser) {
          const email = auth.currentUser.email;
          const response = await fetch(`http://127.0.0.1:5000/get-profile?email=${email}`);
          const userData = await response.json();
          setCurrentUser(userData);
          
          // Check if product is in user's wishlist
          if (userData.id) {
            const wishlistRes = await fetch(`http://127.0.0.1:5000/get-wishlist?user_id=${userData.id}`);
            const wishlistData = await wishlistRes.json();
            const isInWishlist = wishlistData.some(item => item.image_url === product?.image_url);
            setInWishlist(isInWishlist);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchProductDetails();
    fetchCurrentUser();
  }, [productId, navigate, product?.image_url]);

  const toggleWishlist = async () => {
    if (!currentUser?.id || !product?.image_url) return;
    
    try {
      const response = await fetch("http://127.0.0.1:5000/toggle-wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users_id: currentUser.id, image_url: product.image_url }),
      });
      
      if (response.ok) {
        setInWishlist(!inWishlist);
        toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Product Not Found</h2>
        <button 
          onClick={() => navigate("/dashboard")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleContactSeller = () => {
    setShowContactInfo(true);
  };

  const isOwner = currentUser?.id === product.users_id;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Product Image */}
            <div className="md:w-1/2 p-4">
              <ProductImageCarousel 
                mainImage={product.image_url}
                // In the future, you can pass an array of images if your API provides multiple product images
                // images={product.images} 
              />
            </div>
          
          {/* Product Details */}
          <div className="md:w-1/2 p-8">
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-bold text-gray-800">{product.name}</h2>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                {product.state}
              </span>
            </div>
            
            <div className="mt-4">
              <span className="text-3xl font-bold text-green-600">₹{product.price}</span>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700">Description</h3>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700">Details</h3>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium text-gray-800">{product.category}</p>
                </div>
                <div>
                  <span className="text-gray-500">Condition:</span>
                  <p className="font-medium text-gray-800">{product.state}</p>
                </div>
                <div>
                  <span className="text-gray-500">Listed On:</span>
                  <p className="font-medium text-gray-800">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              {/* Don't show contact button if user is the owner */}
              {!isOwner && (
                <button
                  onClick={handleContactSeller}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                >
                  Contact Seller
                </button>
              )}

              <button
                onClick={toggleWishlist}
                className={`w-full py-3 px-4 rounded-lg font-medium transition shadow-md hover:shadow-lg ${
                  inWishlist
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Back
              </button>

            </div>
          </div>
        </div>
        
        {/* Seller Contact Info (Conditional) */}
        {showContactInfo && seller && (
          <div className="border-t border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Seller Information</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <img
                  src={seller.profilePic || "/person-circle.svg"}
                  alt={seller.name}
                  className="w-12 h-12 rounded-full mr-4 border-2 border-gray-300"
                />
                <div>
                  <p className="font-semibold text-lg">{seller.name}</p>
                </div>
              </div>
              
              {/* {seller.phoneNumber && (
                <div className="mt-4">
                  <p className="text-gray-700">
                    <span className="font-medium">Phone: </span>
                    {seller.phoneNumber}
                  </p>
                </div>
              )} */}
              
              <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> When contacting the seller, reference this product listing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;