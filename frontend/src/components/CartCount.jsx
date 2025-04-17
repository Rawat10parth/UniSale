import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';

const CartCount = () => {
    const [count, setCount] = useState(0);
    const auth = getAuth();

    useEffect(() => {
        const fetchCartCount = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                // First get the user's numeric ID from the profile
                const profileResponse = await fetch(`http://127.0.0.1:5000/get-profile?email=${user.email}`);
                if (!profileResponse.ok) {
                    throw new Error('Failed to fetch user profile');
                }
                const userProfile = await profileResponse.json();
                const userId = userProfile.id;

                // Then fetch cart items using the numeric user ID
                const response = await fetch(`http://127.0.0.1:5000/api/cart/${userId}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch cart items');
                }

                const items = await response.json();
                const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                setCount(totalItems);
            } catch (error) {
                console.error('Error fetching cart count:', error);
                setCount(0);
            }
        };

        fetchCartCount();

        // Set up an interval to refresh the count every 30 seconds
        const intervalId = setInterval(fetchCartCount, 30000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, [auth]);

    if (count === 0) return null;

    return (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
            {count}
        </div>
    );
};

export default CartCount;