import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import '../styles/SharedBackground.css';

const Checkout = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    hostelRoom: '',
    deliveryInstructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          toast.error('Please login to checkout');
          navigate('/login');
          return;
        }

        // Get ID token for authentication
        const idToken = await user.getIdToken(true);
        const response = await fetch('http://127.0.0.1:5000/get-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            email: user.email
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const profileData = await response.json();
        
        // Auto-fill form with user data
        setFormData(prevData => ({
          ...prevData,
          fullName: profileData.name || '',
          email: user.email || '',
          phone: profileData.phoneNumber || ''
        }));

      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [auth, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      const idToken = await user.getIdToken();

      // Check if user is logged in
      if (!user) {
        toast.error('Please login to place order');
        navigate('/login');
        return;
      }

      // Validate form data
      if (!formData.fullName || !formData.phone || !formData.address || 
          !formData.city || !formData.state || !formData.pincode) {
        toast.error('Please fill all required fields');
        return;
      }

      const response = await fetch('http://127.0.0.1:5000/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          ...formData,
          userId: user.uid
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }

      const data = await response.json();
      
      if (data.orderId) {
        toast.success('Order placed successfully!');
        // Clear cart and navigate to order confirmation
        navigate(`/order-confirmation/${data.orderId}`);
      } else {
        throw new Error('No order ID received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
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
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 space-y-8 text-white"
        >
          <h2 className="text-3xl font-bold text-center drop-shadow-lg text-fuchsia-100">Checkout</h2>

          {/* Personal Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-fuchsia-200">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="bg-white/40 bg-opacity-20 text-black placeholder-gray-700 px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-white/40 bg-opacity-20 text-black placeholder-gray-700 px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="bg-white/40 bg-opacity-20 text-black placeholder-gray-700 px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-fuchsia-200">Delivery Address</h3>
            <textarea
              name="address"
              placeholder="Full Address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="3"
              className="w-full bg-white/40 bg-opacity-20 text-black placeholder-gray-700 px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
                className="bg-white/40 bg-opacity-20 text-black placeholder-gray-700 px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                required
                className="bg-white/40 bg-opacity-20 text-black placeholder-gray-700 px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
              />
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                className="bg-white/40 bg-opacity-20 text-black placeholder-gray-700 px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-fuchsia-200">Additional Information</h3>
            <input
              type="text"
              name="hostelRoom"
              placeholder="Hostel & Room Number (optional)"
              value={formData.hostelRoom}
              onChange={handleChange}
              className="w-full bg-white/40 bg-opacity-20 text-black placeholder-gray-700 px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 mb-4"
            />
            <textarea
              name="deliveryInstructions"
              placeholder="Delivery Instructions (optional)"
              value={formData.deliveryInstructions}
              onChange={handleChange}
              rows="2"
              className="w-full bg-white/40 bg-opacity-20 text-black placeholder-gray-700 px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="px-6 py-2 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-700 font-semibold transition duration-300"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/50 hover:bg-blue-700 transition duration-300 hover:scale-105 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;