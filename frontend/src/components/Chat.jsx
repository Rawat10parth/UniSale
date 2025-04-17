import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, setDoc, doc, getDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

const Chat = ({ buyerId, sellerId, productId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const auth = getAuth();
      if (!auth.currentUser) {
        console.error("No authenticated user found");
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:5000/get-profile?email=${auth.currentUser.email}`);
        if (!response.ok) throw new Error('Failed to fetch user profile');
        const userData = await response.json();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const isBuyer = currentUser?.id === buyerId;
  const isSeller = currentUser?.id === sellerId;

  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      const chatRoomId = `chat_${buyerId}_${sellerId}_${productId}`;

      try {
        const chatDocRef = doc(db, 'chats', chatRoomId);
        const chatDoc = await getDoc(chatDocRef);

        if (!chatDoc.exists()) {
          await setDoc(chatDocRef, {
            buyerId,
            sellerId,
            productId,
            createdAt: new Date()
          });
          console.log('Chat document created');
        }

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

    if (currentUser) {
      initializeChat();
    }
  }, [buyerId, sellerId, productId, currentUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const chatRoomId = `chat_${buyerId}_${sellerId}_${productId}`;

    try {
      if (!isBuyer && !isSeller) {
        throw new Error('Unauthorized to send messages in this chat');
      }

      await addDoc(collection(db, `chats/${chatRoomId}/messages`), {
        text: newMessage,
        senderId: currentUser.id,
        timestamp: new Date(),
        senderType: isBuyer ? 'buyer' : 'seller'
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (isLoading || !currentUser) {
    return <div className="glass-effect p-4 rounded-xl text-white/70">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-2">Loading conversation...</span>
      </div>
    </div>;
  }

  return (
    <div className="glass-effect p-4 rounded-xl">
      <div className="h-80 overflow-y-auto mb-4 scroll-smooth" id="chat-messages">
        {messages.length === 0 ? (
          <div className="text-center text-white/50 py-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-2 p-2 rounded-lg ${
                message.senderId === currentUser.id
                  ? 'bg-blue-600 ml-auto text-right' 
                  : 'bg-emerald-600 mr-auto'
              } max-w-[70%]`}
            >
              <p className="text-white break-words">{message.text}</p>
              <div className="text-xs text-white/70 mt-1">
                {message.senderId === currentUser.id ? "You" : (isBuyer ? "Seller" : "Buyer")} • 
                {message.timestamp?.toDate().toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
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
          disabled={!isBuyer && !isSeller}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || (!isBuyer && !isSeller)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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