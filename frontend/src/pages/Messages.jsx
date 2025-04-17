import { useState, useEffect } from 'react';
import { collection, query, where, or, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Chat from '../components/Chat';
import { getAuth } from 'firebase/auth';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [products, setProducts] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    
    // First get the user profile
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        try {
          const response = await fetch(`http://127.0.0.1:5000/get-profile?email=${auth.currentUser.email}`);
          if (!response.ok) throw new Error('Failed to fetch user profile');
          const userData = await response.json();
          setCurrentUser(userData);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    if (!currentUser?.id) return;

    // Query chats where user is either buyer or seller
    const chatsQuery = query(
      collection(db, 'chats'),
      or(
        where('sellerId', '==', currentUser.id),
        where('buyerId', '==', currentUser.id)
      )
    );

    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      const chats = [];
      const productIds = new Set();

      snapshot.forEach(doc => {
        const chatData = doc.data();
        chats.push({
          id: doc.id,
          ...chatData,
          lastMessage: null
        });
        productIds.add(chatData.productId);
      });

      const productsData = {};
      for (const productId of productIds) {
        try {
          const response = await fetch(`http://127.0.0.1:5000/product/${productId}`);
          const data = await response.json();
          productsData[productId] = data.product;
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }
      setProducts(productsData);

      // Set up listeners for last message in each chat
      chats.forEach(chat => {
        const messagesQuery = query(
          collection(db, `chats/${chat.id}/messages`)
        );

        onSnapshot(messagesQuery, (messagesSnapshot) => {
          const messages = [];
          messagesSnapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
          });
          const lastMessage = messages.sort((a, b) => 
            b.timestamp?.toDate() - a.timestamp?.toDate()
          )[0];

          setConversations(prev => 
            prev.map(conv => 
              conv.id === chat.id ? { ...conv, lastMessage } : conv
            )
          );
        });
      });

      setConversations(chats);
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  return (
    <div className="product-bg min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="geometric-pattern"></div>
      <div className="light-effects"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="glass-effect rounded-2xl overflow-hidden">
          <div className="md:flex h-[80vh]">
            {/* Conversations List */}
            <div className="md:w-1/3 border-r border-white/10">
              <div className="p-4">
                <h2 className="text-2xl font-bold text-white mb-4">Messages</h2>
                <div className="space-y-2">
                  {conversations.map(chat => {
                    const product = products[chat.productId];
                    return (
                      <button
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className={`w-full p-4 rounded-xl transition-colors duration-200 ${
                          selectedChat?.id === chat.id
                            ? 'bg-white/20'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start">
                          {product?.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover mr-3"
                            />
                          )}
                          <div className="text-left">
                            <p className="text-white font-medium">
                              {product?.name || 'Loading...'}
                            </p>
                            <p className="text-white/70 text-sm truncate">
                              {chat.lastMessage?.text || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="md:w-2/3 p-4">
              {selectedChat ? (
                <>
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-white">
                      {products[selectedChat.productId]?.name || 'Loading...'}
                    </h3>
                  </div>
                  <Chat
                    buyerId={selectedChat.buyerId}
                    sellerId={selectedChat.sellerId}
                    productId={selectedChat.productId}
                  />
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-white/50">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;