import { useState, useEffect } from "react";
import PropTypes from "prop-types";


const WishlistCount = ({ userId }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchWishlistCount = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/get-wishlist?user_id=${userId}`);
        const data = await res.json();
        setCount(data.length);
      } catch (error) {
        console.error("Error fetching wishlist count:", error);
      }
    };

    if (userId) {
      fetchWishlistCount();
      const interval = setInterval(fetchWishlistCount, 2000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  return (
    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {count}
    </span>
  );
};

WishlistCount.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default WishlistCount;
