import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import styles from '../../stylesheets/General.module.css';

interface ChatRoomProps {
  roomId: string;
  userRole: string;
}

interface ChatMessage {
  userRole: string;
  message: string;
  timestamp: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, userRole }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState<string>('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  // const SERVER_URL = process.env.REACT_APP_SERVER_URL;

  useEffect(() => {
    const newSocket = io("https://moveo-codelingo-backend.onrender.com/");
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('joinRoom', roomId); // Join the room when the socket connects
    });

    newSocket.on('receiveMessage', (messageData: ChatMessage) => {
      console.log(messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && text.trim() !== '') {
      e.preventDefault();  
      sendMessage(text);  
    }
  };

  const sendMessage = (message: string) => {
    if (socket) {
      const messageData = {
        userRole,
        message,
        timestamp: new Date().toISOString(),
      };
      socket.emit('sendMessage', { roomId, userRole, message });
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setText('');
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageContainer}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.userRole}:</strong> {msg.message} 
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div className={styles.chatInputContainer}>
        <input
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.chatInput}
          value={text}
        />
        <button
          className={styles.linkButton}
          onClick={() => sendMessage(text)}
        >
          Send Message
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
