import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-2xl">
            <p className="text-white text-lg mb-4">No orders found</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Order #{order.id}
                    </h3>
                    <p className="text-fuchsia-200">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">₹{order.total_amount}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                      order.status === 'delivered' ? 'bg-green-500' :
                      order.status === 'shipped' ? 'bg-blue-500' :
                      order.status === 'confirmed' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    } text-white`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-grow">
                        <h4 className="text-white font-semibold">{item.name}</h4>
                        <p className="text-fuchsia-200">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-white font-semibold">₹{item.price}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/20">
                  <button
                    onClick={() => navigate(`/order-confirmation/${order.id}`)}
                    className="text-blue-300 hover:text-blue-400 transition"
                  >
                    View Details →
                  </button>
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