import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

const Chat = ({ currentUser, seller, productId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // Ensure consistent chatId format
  const generateChatId = (userId1, userId2, prodId) => {
    return [userId1, userId2, prodId].sort().join('_');
  };

  useEffect(() => {
    const user = auth.currentUser; // Store current user in a variable
    if (!user) {
      setError('Authentication required to chat');
      setLoading(false);
      return;
    }

    const chatId = generateChatId(user.uid, seller?.id, productId);

    try {
      const q = query(
        collection(db, 'chats'),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log("Query successful - messages:", snapshot.docs.length);
          const messageList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(messageList);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          console.error('Full error:', error);
          
          if (error.code === 'permission-denied') {
            setError('Permission denied. You may not have access to this conversation.');
          } else {
            setError('Failed to load messages. Please try again.');
          }
          setLoading(false);
          toast.error('Failed to load messages');
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up chat:', error);
      setError('Failed to initialize chat');
      setLoading(false);
      toast.error('Failed to initialize chat');
    }
  }, [seller?.id, productId, auth.currentUser]); // Added auth.currentUser to dependencies

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (!auth.currentUser) {
      toast.error('Please login to send messages');
      return;
    }

    const chatId = generateChatId(auth.currentUser.uid, seller.id, productId);

    try {
      await addDoc(collection(db, 'chats'), {
        chatId,
        buyerId: currentUser.id === seller.id ? seller.id : auth.currentUser.uid,
        sellerId: seller.id,
        productId,
        productName: "Product", // Set proper product name if available
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        senderId: auth.currentUser.uid,
        senderName: currentUser.name || 'Anonymous',
        receiverName: seller.name || 'Seller',
        read: false
      });
      
      setNewMessage('');
      setError(null);
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setError('Failed to send message');
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="border rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold mb-4">Chat with Seller</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="h-64 overflow-y-auto mb-4 p-2 bg-gray-50 rounded">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 p-2 rounded-lg max-w-[80%] ${
                msg.senderId === auth.currentUser?.uid
                  ? 'ml-auto bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              <div className="text-xs opacity-75 mb-1">
                {msg.senderId === auth.currentUser?.uid ? 'You' : msg.senderName}
              </div>
              {msg.text}
            </div>
          ))
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Type your message..."
          disabled={!!error || !auth.currentUser}
        />
        <button
          type="submit"
          className={`px-4 py-2 rounded-lg ${
            error || !auth.currentUser
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
          disabled={!!error || !auth.currentUser}
        >
          Send
        </button>
      </form>
    </div>
  );
};

Chat.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string
  }).isRequired,
  seller: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string
  }).isRequired,
  productId: PropTypes.string.isRequired
};

export default Chat;