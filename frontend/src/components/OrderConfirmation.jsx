import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import '../styles/SharedBackground.css';


const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        const idToken = await user.getIdToken(true);
        const response = await fetch(`http://127.0.0.1:5000/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrderDetails(data);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, auth, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen p-4 md:p-6">
      {/* Background Elements */}
      <div className="geometric-pattern"></div>
      <div className="light-effects"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h2>
            <p className="text-fuchsia-200">Thank you for your purchase</p>
          </div>

          <div className="space-y-6 text-white">
            <div className="border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-fuchsia-200">Order Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <p>Order ID:</p>
                <p className="font-mono">{orderDetails?.id}</p>
                <p>Order Date:</p>
                <p>{new Date(orderDetails?.created_at).toLocaleString()}</p>
                <p>Total Amount:</p>
                <p>₹{orderDetails?.total_amount}</p>
                <p>Status:</p>
                <p className="capitalize">{orderDetails?.status}</p>
              </div>
            </div>

            <div className="border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-fuchsia-200">Delivery Address</h3>
              <div className="space-y-2">
                <p>{orderDetails?.delivery_address?.full_name}</p>
                <p>{orderDetails?.delivery_address?.address}</p>
                <p>{orderDetails?.delivery_address?.city}, {orderDetails?.delivery_address?.state}</p>
                <p>PIN: {orderDetails?.delivery_address?.pincode}</p>
                <p>Phone: {orderDetails?.delivery_address?.phone}</p>
              </div>
            </div>

            <div className="border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-fuchsia-200">Items Ordered</h3>
              <div className="space-y-4">
                {orderDetails?.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-grow">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-fuchsia-200">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">₹{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-2 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-700 font-semibold transition"
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;