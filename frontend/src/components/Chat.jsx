import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import { startChat, subscribeToMessages, sendMessage } from '../services/chatService';

const Chat = ({ currentUser, seller, productId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const auth = getAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Authentication required to chat');
          setLoading(false);
          return;
        }

        console.log('Initializing chat:', {
          currentUser: user.uid,
          seller: seller.id,
          productId
        });

        // Pass seller.id to startChat
        const chatData = await startChat(productId, seller.id);
        setChatId(chatData.id);

        // Subscribe to messages
        const unsubscribe = subscribeToMessages(chatData.id, (newMessages) => {
          setMessages(newMessages);
          scrollToBottom();
        });

        setLoading(false);

        return () => unsubscribe();
      } catch (error) {
        console.error('Chat initialization error:', error);
        setError('Failed to initialize chat. Please try again.');
        setLoading(false);
      }
    };

    initializeChat();
  }, [auth.currentUser, productId, seller.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageText = newMessage.trim();
    if (!messageText) return;

    const user = auth.currentUser;
    if (!user || !chatId) {
      toast.error('Unable to send message');
      return;
    }

    try {
      setNewMessage(''); // Clear input early for better UX
      await sendMessage(chatId, messageText);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageText); // Restore message if failed
    }
  };

  return (
    <div className="border rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold mb-4">
        {currentUser.id === seller.id ? 'Chat with Buyer' : 'Chat with Seller'}
      </h3>
      
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
            {currentUser.id === seller.id ? 
              'No messages from buyers yet.' : 
              'No messages yet. Start the conversation!'}
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 p-2 rounded-lg max-w-[80%] ${
                  msg.sender.id === auth.currentUser?.uid
                    ? 'ml-auto bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                <div className="text-xs opacity-75 mb-1">
                  {msg.sender.id === auth.currentUser?.uid ? 'You' : msg.sender.name}
                </div>
                <div>{msg.text}</div>
                <div className="text-xs opacity-75 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Type your message..."
          disabled={!!error || !auth.currentUser || !chatId}
        />
        <button
          type="submit"
          className={`px-4 py-2 rounded-lg ${
            error || !auth.currentUser || !chatId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
          disabled={!!error || !auth.currentUser || !chatId}
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