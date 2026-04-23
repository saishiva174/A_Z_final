import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../../socket';
import { API_URL } from '../../apiConfig';
import { FiSend, FiChevronLeft } from 'react-icons/fi';
import './ChatPage.css';

export const ChatPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [proInfo, setProInfo] = useState(null);
  const scrollRef = useRef();
  const textareaRef = useRef(null);
  const currentUserId = localStorage.getItem('userId');

  // Handle Input Auto-Expansion (Gemini style)
  const handleInputChange = (e) => {
    const textarea = textareaRef.current;
    setInputText(e.target.value);

    // Reset height to base size to allow shrinking
    textarea.style.height = "40px";

    // Measure and set new height (cap at 150px)
    const newHeight = textarea.scrollHeight;
    if (e.target.value === "") {
      textarea.style.height = "40px";
      textarea.style.overflowY = "hidden";
    } else {
      textarea.style.height = `${Math.min(newHeight, 150)}px`;
      textarea.style.overflowY = newHeight > 150 ? "auto" : "hidden";
    }
  };

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/bookings/messages/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);

        const detailRes = await axios.get(`${API_URL}/api/bookings/details/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProInfo(detailRes.data);
      } catch (err) {
        console.error("Error loading chat", err);
      }
    };

    fetchChatData();
    socket.emit('join_booking', bookingId);

    socket.on('receive_message', (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [bookingId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const messageData = {
      booking_id: bookingId,
      message_text: inputText,
      sender_id: currentUserId
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/bookings/send`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset input state and physical height
      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "40px";
        textareaRef.current.style.overflowY = "hidden";
      }
    } catch (err) {
      console.error("Send error", err);
    }
  };

  return (
    <div className="chat-page-wrapper">
      <header className="chat-header">
        <button className="back-icon-btn" onClick={() => navigate('/customer-dashboard?tab=bookings')}>
          <FiChevronLeft size={24} />
        </button>
        <div className="header-user-info">
          <img 
            src={proInfo?.pro_avatar || `https://ui-avatars.com/api/?name=${proInfo?.pro_name || 'User'}`} 
            alt="avatar" 
            className="header-avatar"
          />
          <div>
            <h3>{proInfo?.pro_name || "Chat"}</h3>
            <span className="online-status">Service Expert</span>
          </div>
        </div>
      </header>

      <div className="messages-container">
        {messages.map((msg, index) => {
          const isMe = String(msg.sender_id) === String(currentUserId);
          return (
            <div key={index} className={`message-row ${isMe ? 'row-me' : 'row-them'}`}>
              {!isMe && (
                <img 
                  src={proInfo?.pro_avatar || `https://ui-avatars.com/api/?name=${proInfo?.pro_name}`} 
                  className="chat-bubble-avatar" 
                  alt="pro"
                />
              )}
              <div className={`message-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                <p>{msg.message_text}</p>
                <span className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
        <textarea 
          ref={textareaRef}
          placeholder="Type a message..."
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          rows="1"
        />
        <button type="submit" className="send-btn" disabled={!inputText.trim()}>
          <FiSend />
        </button>
      </form>
    </div>
  );
};