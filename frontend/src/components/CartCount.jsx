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

                const idToken = await user.getIdToken(true);
                const response = await fetch('http://127.0.0.1:5000/api/cart', {
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (response.ok) {
                    const items = await response.json();
                    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
                    setCount(totalItems);
                }
            } catch (error) {
                console.error('Error fetching cart count:', error);
            }
        };

        fetchCartCount();
    }, [auth]);

    if (count === 0) return null;

    return (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
            {count}
        </div>
    );
};

export default CartCount;