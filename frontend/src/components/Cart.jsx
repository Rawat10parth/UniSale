import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.product_id} className="flex items-center border rounded-lg p-4 hover:shadow-lg">
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="ml-4 flex-grow">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">{item.description}</p>
                  <p className="text-green-600 font-bold">₹{item.price}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-bold">₹{item.price * item.quantity}</p>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold">
                ₹{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
              </span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;