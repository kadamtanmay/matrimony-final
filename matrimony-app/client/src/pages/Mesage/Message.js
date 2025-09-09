import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Message.css";

const Message = () => {
  const user = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImages, setProfileImages] = useState({});

  useEffect(() => {
    if (user && user.id) {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      
      // Fetch conversations and unread count simultaneously
      Promise.all([
        axios.get(`http://localhost:8080/messages/conversations?userId=${user.id}`, { headers }),
        axios.get(`http://localhost:8080/messages/unreadCount/${user.id}`, { headers })
      ])
        .then(([convoRes, unreadRes]) => {
          
          // Handle the new response format: {success: true, conversations: [...]}
          let conversations = [];
          if (convoRes.data && convoRes.data.success && convoRes.data.conversations) {
            conversations = convoRes.data.conversations;
          } else if (Array.isArray(convoRes.data)) {
            // Fallback for old format
            conversations = convoRes.data;
          }
          
          // Handle unread count response format: {success: true, unreadCount: number}
          let unreadCount = 0;
          if (unreadRes.data && unreadRes.data.success && typeof unreadRes.data.unreadCount === 'number') {
            unreadCount = unreadRes.data.unreadCount;
          } else if (typeof unreadRes.data === 'number') {
            // Fallback for old format
            unreadCount = unreadRes.data;
          }
          
          
          setConversations(conversations);
          setUnreadCount(unreadCount);
        })
        .catch((error) => {
          console.error("Error fetching messages data:", error);
          if (error.response?.status === 401) {
          }
        });
    }
  }, [user]);

  // Fetch profile picture for each conversation
  useEffect(() => {
    if (conversations.length > 0) {
      const fetchProfileImages = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const images = {};
        for (let convo of conversations) {
          const receiverId = convo.receiver.id === user.id ? convo.sender.id : convo.receiver.id;
          try {
            const response = await axios.get('http://localhost:8080/profile-picture', { 
              params: { userId: receiverId },
              headers
            });
            images[receiverId] = response.data || "https://media.istockphoto.com/id/1681388313/vector/cute-baby-panda-cartoon-on-white-background.jpg?s=612x612&w=0&k=20&c=qFrzn8TqONiSfwevvkYhys1z80NAmDfw3o-HRdwX0d8="; // Fallback image
          } catch (error) {
            console.error("Error fetching profile picture:", error);
          }
        }
        setProfileImages(images);
      };

      fetchProfileImages();
    }
  }, [conversations, user]);

  const handleConversationClick = (receiverId) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    axios
      .post("http://localhost:8080/messages/markAsRead", null, {
        params: { user1Id: user.id, user2Id: receiverId },
        headers
      })
      .then(() => setUnreadCount((prev) => Math.max(prev - 1, 0))) // Decrease unread count
      .catch((error) => console.error("Error marking messages as read:", error));
  };

  // Group messages by user
  const groupConversations = (conversations) => {
    const grouped = {};
    conversations.forEach((msg) => {
      const otherUser = msg.receiver.id === user.id ? msg.sender : msg.receiver;
      if (!grouped[otherUser.id] || new Date(msg.timestamp) > new Date(grouped[otherUser.id].lastMessage.timestamp)) {
        grouped[otherUser.id] = { user: otherUser, lastMessage: msg };
      }
    });
    // Sort conversations by latest message timestamp (newest first)
    return Object.values(grouped).sort((a, b) => 
      new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
    );
  };

  return (
      <div className="container mt-4">
        <h1 className="mb-3">Messages</h1>
        {unreadCount > 0 && <p className="text-danger">You have {unreadCount} unread messages!</p>}
        
        <div className="list-group">
          {groupConversations(conversations).length === 0 ? (
            <p className="text-muted">No conversations yet.</p>
          ) : (
            groupConversations(conversations).map(({ user: receiver, lastMessage }) => (
              <Link
                to={`/messages/${receiver.id}`}
                key={receiver.id}
                className="list-group-item list-group-item-action d-flex align-items-center"
                onClick={() => handleConversationClick(receiver.id)}
              >
                <img
                  src={profileImages[receiver.id] || "https://media.istockphoto.com/id/1681388313/vector/cute-baby-panda-cartoon-on-white-background.jpg?s=612x612&w=0&k=20&c=qFrzn8TqONiSfwevvkYhys1z80NAmDfw3o-HRdwX0d8="} // Fallback image
                  alt={receiver.firstName}
                  className="rounded-circle me-3"
                  style={{ width: "50px", height: "50px" }}
                />
                <div className="w-100">
                  <div className="d-flex justify-content-between">
                    <h5 className="mb-1">{receiver.firstName}</h5>
                    <small className="text-muted">{new Date(lastMessage.timestamp).toLocaleString()}</small>
                  </div>
                  <p className="mb-0 text-muted">{lastMessage.content}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
  );
};

export default Message;
