import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import '../styles/SharedBackground.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const user = auth.currentUser;
        if (!user) {
          toast.error('Please login to view orders');
          navigate('/login');
          return;
        }

        // Get user profile to get numeric ID
        const profileResponse = await fetch(`http://localhost:5000/get-profile?email=${user.email}`);
        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch user profile: ${profileResponse.status}`);
        }
        const userProfile = await profileResponse.json();
        
        if (!userProfile || !userProfile.id) {
          throw new Error('Invalid user profile data');
        }
        
        console.log('Fetching orders for user ID:', userProfile.id);
        
        // Fetch orders with numeric user ID
        const response = await fetch(`http://localhost:5000/api/orders/user/${userProfile.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Orders data:', data);
        
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data.error) {
          throw new Error(`API error: ${data.error}`);
        } else {
          console.warn('Unexpected data format from API:', data);
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.message || 'Failed to load orders');
        toast.error(error.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [auth, navigate]);

  // Add a retry function
  const retryFetch = () => {
    setLoading(true);
    setError(null);
    // This will trigger the useEffect again
    navigate(0); // Refresh the page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 shadow-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-bg min-h-screen p-4 md:p-6">
        <div className="geometric-pattern"></div>
        <div className="light-effects"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">My Orders</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg font-semibold hover:bg-white/20 transition duration-300 border border-white/20"
            >
              Continue Shopping
            </button>
          </div>
          
          <div className="text-center py-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
            <div className="mb-6 text-red-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-white text-xl mb-2">Failed to load orders</p>
            <p className="text-white/70 mb-6">{error}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={retryFetch}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/50 hover:bg-blue-700 transition duration-300"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition duration-300"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
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
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">My Orders</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg font-semibold hover:bg-white/20 transition duration-300 border border-white/20"
          >
            Continue Shopping
          </button>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-white text-xl mb-6">You have not placed any orders yet</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/50 hover:bg-blue-700 transition duration-300 hover:scale-105"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-white/30 transition duration-300 shadow-xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white">
                        Order #{order.id}
                      </h3>
                      <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        order.status === 'shipped' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        order.status === 'confirmed' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-fuchsia-200">
                      Ordered on {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white mb-1">₹{order.total_amount}</p>
                    <p className="text-sm text-fuchsia-200">{order.items?.length || 0} items</p>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.id}`} className="flex items-center gap-6 bg-white/5 rounded-xl p-4 hover:bg-white/10 transition duration-300">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg shadow-lg"
                          onError={(e) => {e.target.src = 'https://via.placeholder.com/80?text=Product'}}
                        />
                        <div className="flex-grow">
                          <h4 className="text-lg font-semibold text-white">{item.name}</h4>
                          <p className="text-fuchsia-200">Quantity: {item.quantity}</p>
                        </div>
                        <p className="text-lg font-semibold text-white">₹{item.price}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <button
                    onClick={() => navigate(`/order-confirmation/${order.id}`)}
                    className="text-blue-300 hover:text-blue-400 transition flex items-center gap-2 group"
                  >
                    View Details 
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  {order.status === 'pending' && (
                    <span className="text-sm text-fuchsia-200">Processing your order</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;