import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, setDoc, doc, getDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';
import { db } from '../firebase';

const Chat = ({ buyerId, sellerId, productId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Determine if current user is buyer or seller (needed for UI display)
  const currentUserId = localStorage.getItem('userId'); // Adjust based on how you store the current user ID
  const isBuyer = currentUserId === buyerId;
  
  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      // Create a chat room ID combining buyer and seller IDs
      const chatRoomId = `chat_${buyerId}_${sellerId}_${productId}`;
      
      try {
        // Check if the chat document exists
        const chatDocRef = doc(db, 'chats', chatRoomId);
        const chatDoc = await getDoc(chatDocRef);
        
        // If it doesn't exist, create it with the necessary fields
        if (!chatDoc.exists()) {
          await setDoc(chatDocRef, {
            buyerId,
            sellerId,
            productId,
            createdAt: new Date()
          });
          console.log('Chat document created');
        }
        
        // Listen to messages in real-time
        const q = query(
          collection(db, `chats/${chatRoomId}/messages`),
          orderBy('timestamp', 'asc')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const messageList = [];
          snapshot.forEach((doc) => {
            messageList.push({ id: doc.id, ...doc.data() });
          });
          setMessages(messageList);
          setIsLoading(false);
        }, (error) => {
          console.error("Error subscribing to messages:", error);
          setIsLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing chat:', error);
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, [buyerId, sellerId, productId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const chatRoomId = `chat_${buyerId}_${sellerId}_${productId}`;
    
    try {
      // Then add the message
      await addDoc(collection(db, `chats/${chatRoomId}/messages`), {
        text: newMessage,
        senderId: currentUserId, // Use the current user ID from localStorage
        timestamp: new Date(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (isLoading) {
    return <div className="glass-effect p-4 rounded-xl">Loading conversation...</div>;
  }

  return (
    <div className="glass-effect p-4 rounded-xl">
      <div className="h-80 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-white/50 py-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-2 p-2 rounded-lg ${
                message.senderId === currentUserId
                  ? 'bg-blue-600 ml-auto'
                  : 'bg-gray-600'
              } max-w-[70%]`}
            >
              <p className="text-white">{message.text}</p>
              <div className="text-xs text-white/70 text-right mt-1">
                {isBuyer 
                  ? (message.senderId === currentUserId ? "You" : "Seller") 
                  : (message.senderId === currentUserId ? "You" : "Buyer")} • 
                {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-white/10 text-white rounded-lg px-4 py-2"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

Chat.propTypes = {
  buyerId: PropTypes.string.isRequired,
  sellerId: PropTypes.string.isRequired,
  productId: PropTypes.string.isRequired,
};

export default Chat;