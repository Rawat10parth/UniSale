import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";


const CartCount = () => {
  const [count, setCount] = useState(0);
  const auth = getAuth();

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        if (!auth.currentUser) return;

        // Fetch user profile to get numeric ID
        const profileResponse = await fetch(`http://127.0.0.1:5000/get-profile?email=${auth.currentUser.email}`);
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }
        const userProfile = await profileResponse.json();
        
        // Use numeric ID for cart API
        const response = await fetch(`http://127.0.0.1:5000/api/cart/${userProfile.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }
        
        const cartItems = await response.json();
        setCount(cartItems.length);
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    };

    if (auth.currentUser) {
      fetchCartCount();
      const interval = setInterval(fetchCartCount, 5000);
      return () => clearInterval(interval);
    }
  }, [auth.currentUser]);

  return count > 0 ? (
    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {count}
    </span>
  ) : null;
};

export default CartCount;