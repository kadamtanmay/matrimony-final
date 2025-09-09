import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../redux/actions";
import axios from "axios";

const MessageScreen = () => {
  const { id } = useParams();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [person, setPerson] = useState(null);
  const [profileImage, setProfileImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('token');

  // All hooks at top-level
  useEffect(() => {
    const restoreUserFromToken = async () => {
      if (!user && token) {
        try {
          setIsLoading(true);
          const response = await axios.get('http://localhost:8080/user/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          dispatch(setUser(response.data));
          setIsLoading(false);
        } catch (error) {
          localStorage.removeItem('token');
          setIsLoading(false);
        }
      }
    };
    restoreUserFromToken();
  }, [user, token, dispatch]);

  useEffect(() => {
    if (user && id) {
      const fetchConversation = async () => {
        try {
          const headers = { Authorization: `Bearer ${token}` };

          const conversationResponse = await axios.get(
            `http://localhost:8080/messages/conversation?user1Id=${user.id}&user2Id=${id}`,
            { headers }
          );

          // Handle the new response format: {success: true, conversation: [...]}
          let messages = [];
          if (conversationResponse.data && conversationResponse.data.success && conversationResponse.data.conversation) {
            messages = conversationResponse.data.conversation;
          } else if (Array.isArray(conversationResponse.data)) {
            // Fallback for old format
            messages = conversationResponse.data;
          }
          
          const sortedMessages = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          setChatMessages(sortedMessages);

          const personResponse = await axios.get(`http://localhost:8080/user/${id}`, { headers });
          setPerson(personResponse.data);

          const profileResponse = await axios.get("http://localhost:8080/profile-picture", {
            params: { userId: id },
            headers
          });
          setProfileImage(profileResponse.data || "https://media.istockphoto.com/id/1681388313/vector/cute-baby-panda-cartoon-on-white-background.jpg?s=612x612&w=0&k=20&c=qFrzn8TqONiSfwevvkYhys1z80NAmDfw3o-HRdwX0d8=");
        } catch (error) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            // handle token expiration or unauthorized
          }
        }
      };
      fetchConversation();
    }
  }, [id, user, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handlers for sending messages
  const sendMessage = async () => {
    if (newMessage.trim() && user) {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.post(
          "http://localhost:8080/messages/send",
          null,
          {
            params: {
              senderId: user.id,
              receiverId: id,
              content: newMessage,
            },
            headers
          }
        );
        
        // Handle the new response format: {success: true, message: messageObject}
        if (response.data && response.data.success && response.data.message) {
          const message = response.data.message;
          setChatMessages((prevMessages) =>
            [...prevMessages, message].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          );
          setNewMessage("");
          
          // Trigger sidebar refresh for unread count
          window.dispatchEvent(new CustomEvent('refreshUnreadCount'));
        } else if (response.data && response.data.error) {
          // Handle error response
          alert(response.data.error);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        if (error.response?.status === 403) {
          alert('You are not connected to this user. Please send a connection request first.');
        } else if (error.response?.data?.error) {
          alert(error.response.data.error);
        } else {
          alert('Failed to send message. Please try again.');
        }
      }
    }
  };

  if (isLoading || (!user && token)) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border" role="status" />
          <p className="ms-3">Restoring user session...</p>
        </div>
    );
  }

  return (
      <div className="container mt-4">
        <div className="d-flex align-items-center mb-3">
          <img
            src={profileImage}
            alt={person?.firstName || "User"}
            className="rounded-circle me-3"
            style={{ width: "50px", height: "50px" }}
          />
          <h3>{person?.firstName || "User"}</h3>
        </div>

        <div
          className="border rounded p-3 mb-3"
          style={{ height: "400px", overflowY: "auto", scrollBehavior: "smooth" }}
        >
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender?.id === user?.id ? "sent" : "received"}`}
              style={{
                display: "flex",
                flexDirection: message.sender?.id === user?.id ? "row-reverse" : "row",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  backgroundColor: message.sender?.id === user?.id ? "#d1f7c4" : "#e0e0e0",
                  borderRadius: "10px",
                  padding: "10px",
                  maxWidth: "70%",
                }}
              >
                <div className="message-text">{message.content}</div>
                <small style={{ fontSize: "10px", color: "#666" }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </small>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            disabled={!user}
          />
          <button className="btn btn-primary" onClick={sendMessage} disabled={!user}>
            Send
          </button>
        </div>
      </div>
  );
};

export default MessageScreen;
