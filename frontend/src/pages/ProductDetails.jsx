import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import ProductImageCarousel from "../components/ProductImageCarousel";
import Chat from '../components/Chat';
import '../styles/SharedBackground.css';
import '../styles/ProductDetails.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showChat, setShowChat] = useState(false);
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

    fetchProductDetails();
  }, [productId, navigate]);

  useEffect(() => {
    // If product is loaded but sellerId is missing, try to extract it
    if (product && seller && !product.users_id) {
      console.log("Attempting to extract seller ID from seller data:", seller);
      // Update the product object with the seller ID if available
      if (seller.id) {
        setProduct(prev => ({
          ...prev,
          users_id: seller.id
        }));
      }
    }
  }, [product, seller]);

  // Add authentication state monitoring
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/get-profile?email=${user.email}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user profile');
                }
                const userData = await response.json();
                console.log("User data loaded:", userData); // Debug log
                setCurrentUser(userData);
            } catch (error) {
                console.error("Error fetching user data:", error);
                toast.error("Failed to load user profile");
            }
        } else {
            setCurrentUser(null);
        }
    });

    return () => unsubscribe();
  }, []);

  // Check wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!currentUser?.id || !productId) return;

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/wishlist/check/${productId}`,
          {
            method: 'POST',
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
              userId: currentUser.id 
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          setInWishlist(data.status === "exists");
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [currentUser?.id, productId]);

  const toggleWishlist = async () => {
    if (!currentUser?.id) {
      toast.error("Please login to use wishlist feature");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: currentUser.id,
          productId: productId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setInWishlist(!inWishlist);
        toast.success(data.message);
      } else {
        throw new Error(data.error || "Failed to update wishlist");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error(error.message || "Failed to update wishlist");
    }
  };

  const handleAddToCart = async () => {
    if (!currentUser?.id) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const userId = parseInt(currentUser.id); // Ensure numeric ID
      const response = await fetch("http://127.0.0.1:5000/api/cart/add", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          productId: parseInt(productId),
          quantity: 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add to cart");
      }

      toast.success("Added to cart successfully");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <div className="geometric-pattern"></div>
        <div className="light-effects"></div>
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-bg min-h-screen flex flex-col items-center justify-center">
        <div className="geometric-pattern"></div>
        <div className="light-effects"></div>
        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Product Not Found</h2>
          <button 
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition duration-300 hover:scale-105 shadow-lg shadow-blue-500/25"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleContactSeller = () => {
    // Check if the user is logged in
    const auth = getAuth();
    if (!auth.currentUser) {
      toast.error("Please login to contact the seller");
      navigate("/login");
      return;
    }
    
    setShowContactInfo(true);
    setShowChat(true);
  };

  const isOwner = currentUser?.id === product.users_id;

  console.log("Debug info:", {
    currentUser: currentUser,
    sellerId: product?.users_id || (seller?.id ? seller.id : "No seller ID available"),
    sellerObject: seller,
    productId: productId,
    isOwner: isOwner
  });

  return (
    <div className="product-bg min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="geometric-pattern"></div>
      <div className="light-effects"></div>

      {/* New Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="floating-back-button glass-effect text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors duration-300 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Dashboard
      </button>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="glass-effect rounded-2xl overflow-hidden">
          <div className="md:flex">
            {/* Product Image Section */}
            <div className="md:w-1/2 p-6">
              <div className="product-image-container">
                <ProductImageCarousel 
                  mainImage={product.image_url}
                  images={product.images ? product.images.map((img, index) => ({
                    id: index,
                    src: img,
                    alt: `${product.name} view ${index + 1}`
                  })) : null}
                />
              </div>
            </div>
            
            {/* Product Details Section */}
            <div className="md:w-1/2 p-8">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-bold text-white">{product.name}</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-sm font-medium px-4 py-1.5 rounded-full border border-emerald-500/30">
                  {product.state}
                </span>
              </div>
              
              <div className="mt-4">
                <span className="price-tag text-4xl font-bold text-emerald-400">
                  ₹{product.price}
                </span>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white/90">Description</h3>
                <p className="mt-2 text-white/70 leading-relaxed">{product.description}</p>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white/90">Details</h3>
                <div className="mt-4 grid grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <span className="text-white/60">Category</span>
                    <p className="font-medium text-white mt-1">{product.category}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <span className="text-white/60">Condition</span>
                    <p className="font-medium text-white mt-1">{product.state}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 col-span-2">
                    <span className="text-white/60">Listed On</span>
                    <p className="font-medium text-white mt-1">
                      {new Date(product.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                {!isOwner && (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-blue-600 text-white py-3.5 px-4 rounded-xl font-medium hover:bg-blue-700 transition duration-300 hover:scale-105 shadow-lg shadow-blue-500/25"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={handleContactSeller}
                      className="w-full bg-emerald-600 text-white py-3.5 px-4 rounded-xl font-medium hover:bg-emerald-700 transition duration-300 hover:scale-105 shadow-lg shadow-emerald-500/25"
                    >
                      Contact Seller
                    </button>
                  </>
                )}

                <button
                  onClick={toggleWishlist}
                  className={`w-full py-3.5 px-4 rounded-xl font-medium transition duration-300 hover:scale-105 ${
                    inWishlist
                      ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
                      : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                </button>
              </div>
            </div>
          </div>
          
          {/* Seller Contact Info Section */}
          {showContactInfo && seller && (
            <div className="border-t border-white/10 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Seller Information</h3>
              <div className="glass-effect p-6 rounded-xl">
                <div className="flex items-center mb-6">
                  <img
                    src={seller.profilePic || "/person-circle.svg"}
                    alt={seller.name}
                    className="w-14 h-14 rounded-full mr-4 border-2 border-white/20"
                  />
                  <div>
                    <p className="font-semibold text-xl text-white">{seller.name}</p>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                  <p className="text-sm text-blue-300">
                    <strong>Note:</strong> When contacting the seller, please be respectful and reference this product listing.
                  </p>
                </div>
                
                {/* Chat section for buyers */}
                {showChat && currentUser && !isOwner && (product?.users_id || seller?.id) && (
                  <div className="mt-6">
                    <h4 className="text-xl font-semibold text-white/90 mb-4">Chat with Seller</h4>
                    <Chat 
                      buyerId={currentUser.id}
                      sellerId={product?.users_id || seller?.id}
                      productId={productId}
                    />
                  </div>
                )}    
                
                {/* Chat section for sellers/product owners 
                Add a fallback for when seller ID is not available*/}
                {showChat && currentUser && !isOwner && !product.users_id && (
                  <div className="mt-6">
                    <h4 className="text-xl font-semibold text-white/90 mb-4">Chat with Seller</h4>
                    <p className="text-white/70">Unable to initialize chat. Seller information is unavailable.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;