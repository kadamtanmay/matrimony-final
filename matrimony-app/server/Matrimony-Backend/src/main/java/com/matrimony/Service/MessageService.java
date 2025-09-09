package com.matrimony.Service;

import com.matrimony.Dao.MessageDao;
import com.matrimony.Dao.UserDao;
import com.matrimony.Entity.Message;
import com.matrimony.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageDao messageDao;

    @Autowired
    private UserDao userDao;

    // Send message
    public Message sendMessage(Long senderId, Long receiverId, String content) {
        User sender = userDao.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userDao.findById(receiverId).orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);

        return messageDao.save(message);
    }

    // Get conversation between two users
    public List<Message> getConversation(Long user1Id, Long user2Id) {
        User user1 = userDao.findById(user1Id).orElseThrow(() -> new RuntimeException("User 1 not found"));
        User user2 = userDao.findById(user2Id).orElseThrow(() -> new RuntimeException("User 2 not found"));
        return messageDao.findConversation(user1, user2);
    }

    // Get all conversations for a user
    public List<Message> getConversations(Long userId) {
        User user = userDao.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return messageDao.findConversationsByUser(user);
    }

    // Mark messages as read when opened
    public void markMessagesAsRead(Long receiverId, Long senderId) {
        User receiver = userDao.findById(receiverId).orElseThrow(() -> new RuntimeException("Receiver not found"));
        User sender = userDao.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));

        List<Message> messages = messageDao.findConversation(sender, receiver);

        messages.forEach(message -> {
            if (!message.isRead() && message.getReceiver().getId().equals(receiverId)) {
                message.setRead(true);
                messageDao.save(message);
            }
        });
    }

    // Get unread message count for a user
    public int getUnreadMessageCount(Long userId) {
        User user = userDao.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return messageDao.countUnreadMessages(user);
    }
}
