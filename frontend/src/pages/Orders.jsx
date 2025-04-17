import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import '../styles/SharedBackground.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        console.log('Fetching orders...'); // Debug log
        const idToken = await user.getIdToken(true);
        const response = await fetch('http://127.0.0.1:5000/api/orders', {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch orders');
        }

        const data = await response.json();
        console.log('Orders received:', data); // Debug log
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [auth, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 shadow-lg"></div>
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

        {orders.length === 0 ? (
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
                    <p className="text-sm text-fuchsia-200">{order.items.length} items</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-6 bg-white/5 rounded-xl p-4 hover:bg-white/10 transition duration-300">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg shadow-lg"
                      />
                      <div className="flex-grow">
                        <h4 className="text-lg font-semibold text-white">{item.name}</h4>
                        <p className="text-fuchsia-200">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-lg font-semibold text-white">₹{item.price}</p>
                    </div>
                  ))}
                </div>

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