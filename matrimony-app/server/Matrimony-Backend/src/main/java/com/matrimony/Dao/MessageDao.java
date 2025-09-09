package com.matrimony.Dao;

import com.matrimony.Entity.Message;
import com.matrimony.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MessageDao extends JpaRepository<Message, Long> {

    List<Message> findBySenderAndReceiverOrderByTimestampAsc(User sender, User receiver);

    List<Message> findByReceiverAndSenderOrderByTimestampAsc(User receiver, User sender);

    @Query("SELECT m FROM Message m WHERE (m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1) ORDER BY m.timestamp ASC")
    List<Message> findConversation(User user1, User user2);
    
    @Query("SELECT m FROM Message m WHERE m.sender = :user OR m.receiver = :user ORDER BY m.timestamp DESC")
    List<Message> findConversationsByUser(User user);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver = :user AND m.isRead = false")
    int countUnreadMessages(User user);
}
