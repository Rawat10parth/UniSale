import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import '../styles/SharedBackground.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  const fetchCartItems = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('Please login to view cart');
        navigate('/login');
        return;
      }

      // Get fresh token
      const idToken = await user.getIdToken(true);
      
      const response = await fetch('http://127.0.0.1:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch cart items');
      }

      const data = await response.json();
      console.log('Cart items:', data); // Debug log
      setCartItems(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error(error.message || 'Failed to load cart items');
    } finally {
      setLoading(false);
    }
  }, [auth, navigate]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const removeFromCart = async (productId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('Please login to remove items');
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch('http://127.0.0.1:5000/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        setCartItems(cartItems.filter(item => item.product_id !== productId));
        toast.success('Item removed from cart');
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen p-4 md:p-6">
      {/* Background Elements */}
      <div className="geometric-pattern"></div>
      <div className="light-effects"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-white text-center drop-shadow-lg">
          Shopping Cart
        </h2>
        
        {cartItems.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-white text-xl mb-6">Your cart is empty</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/50 hover:bg-blue-700 transition duration-300 hover:scale-105"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={item.product_id} 
                  className="flex items-center bg-white/5 rounded-xl p-6 hover:bg-white/10 transition duration-300 border border-white/10"
                >
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-32 h-32 object-cover rounded-lg shadow-lg"
                  />
                  <div className="ml-6 flex-grow">
                    <h3 className="text-xl font-semibold text-white mb-2">{item.name}</h3>
                    <p className="text-gray-300 mb-2">{item.description}</p>
                    <p className="text-emerald-400 font-bold text-lg">₹{item.price}</p>
                    <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <p className="text-2xl font-bold text-white">₹{item.price * item.quantity}</p>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition duration-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-6">
                <span className="text-xl text-gray-300">Total Items:</span>
                <span className="text-2xl font-bold text-white">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl text-gray-300">Total Amount:</span>
                <span className="text-3xl font-bold text-white">
                  ₹{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                </span>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-6 py-3 rounded-lg border-2 border-white text-white hover:bg-white hover:text-purple-900 transition duration-300"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate('/checkout')}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/50 hover:bg-blue-700 transition duration-300 hover:scale-105"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;