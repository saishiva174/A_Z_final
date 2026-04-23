import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../../socket';
import { API_URL } from '../../apiConfig';
import { FiSend, FiChevronLeft } from 'react-icons/fi';
import './ChatPage.css'; 

export const ProChatPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [customerInfo, setCustomerInfo] = useState(null);
  const scrollRef = useRef();
  const textareaRef = useRef(null); // Added Ref
  const currentUserId = localStorage.getItem('userId');

  // Logic to handle auto-expanding textarea
  const handleInputChange = (e) => {
    const textarea = textareaRef.current;
    setInputText(e.target.value);

    // Reset height to base to calculate correctly
    textarea.style.height = "40px";
    
    const newHeight = textarea.scrollHeight;
    // Set height based on content (cap at 150px)
    textarea.style.height = e.target.value === "" ? "40px" : `${Math.min(newHeight, 150)}px`;
    textarea.style.overflowY = newHeight > 150 ? "auto" : "hidden";
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
        setCustomerInfo(detailRes.data);
      } catch (err) {
        console.error("Error loading professional chat", err);
      }
    };

    fetchChatData();
    socket.emit('join_booking', String(bookingId));

    const handleMessage = (newMessage) => {
      setMessages((prev) => {
        const isDuplicate = prev.some((msg) => msg.id === newMessage.id);
        if (isDuplicate) return prev;
        return [...prev, newMessage];
      });
    };

    socket.on('receive_message', handleMessage);
    return () => socket.off('receive_message', handleMessage);
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
      
      setInputText("");
      // Reset height after send
      if (textareaRef.current) {
        textareaRef.current.style.height = "40px";
      }
    } catch (err) {
      console.error("Send error", err);
    }
  };

  return (
    <div className="chat-page-wrapper pro-theme">
      {/* --- HEADER --- */}
      <header className="chat-header">
        <button className="back-icon-btn" onClick={() => navigate('/pro-dashboard?tab=jobs')}>
          <FiChevronLeft size={24} />
        </button>
        
        <div className="header-user-info">
          <img 
            src={customerInfo?.customer_avatar || `https://ui-avatars.com/api/?name=${customerInfo?.customer_name}`} 
            alt="avatar" 
            className="header-avatar"
          />
          <div>
            <h3>{customerInfo?.customer_name || "Client"}</h3>
            <span className="online-status">Client</span>
          </div>
        </div>
      </header>

      {/* --- MESSAGES --- */}
      <div className="messages-container">
        {messages.map((msg, index) => {
          const isMe = String(msg.sender_id) === String(currentUserId);
          return (
            <div key={index} className={`message-row ${isMe ? 'row-me' : 'row-them'}`}>
              {!isMe && (
                <img 
                  src={customerInfo?.customer_avatar || `https://ui-avatars.com/api/?name=${customerInfo?.customer_name}`} 
                  className="chat-bubble-avatar" 
                  alt="customer"
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

      {/* --- INPUT AREA --- */}
      <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
        <textarea 
          ref={textareaRef}
          placeholder="Reply to client..."
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