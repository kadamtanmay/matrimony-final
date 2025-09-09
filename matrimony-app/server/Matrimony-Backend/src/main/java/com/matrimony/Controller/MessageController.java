package com.matrimony.Controller;

import com.matrimony.Entity.Message;
import com.matrimony.Entity.User;
import com.matrimony.Service.MessageService;
import com.matrimony.Service.UserService;
import com.matrimony.Service.PendingRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class MessageController {

    @Autowired
    private MessageService messageService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PendingRequestService pendingRequestService;

    // Endpoint to send a message
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestParam Long senderId, 
                                       @RequestParam Long receiverId, 
                                       @RequestParam String content,
                                       HttpServletRequest request) {
        try {
            // Get authenticated user from Spring Security context
            String authenticatedUsername = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;
            
            if (authenticatedUsername == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Authentication required"));
            }
            
            // Get the authenticated user from the database
            User authenticatedUser = userService.getUserByEmail(authenticatedUsername);
            if (authenticatedUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Invalid authentication"));
            }
            
            // Verify the sender ID matches the authenticated user (prevent impersonation)
            if (!authenticatedUser.getId().equals(senderId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "You can only send messages from your own account"));
            }
            
            // Check if sender's profile is approved
            if (!authenticatedUser.getProfileApproved()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Your profile must be approved by admin before you can send messages"));
            }
            
            // Check if sender is active
            if (!authenticatedUser.getIsActive()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Your account must be active to send messages"));
            }
            
            // Check if users are connected (have accepted pending request)
            boolean isConnected = pendingRequestService.isConnected(senderId, receiverId);
            System.out.println("=== MESSAGE SEND DEBUG ===");
            System.out.println("Sender ID: " + senderId);
            System.out.println("Receiver ID: " + receiverId);
            System.out.println("Are connected: " + isConnected);
            System.out.println("==========================");
            
            if (!isConnected) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "You can only send messages to users you are connected with"));
            }
            
            // Call the service layer to send the message
            Message message = messageService.sendMessage(senderId, receiverId, content);

            return ResponseEntity.ok(Map.of("success", true, "message", message));
            
        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Failed to send message: " + e.getMessage()));
        }
    }

    // Endpoint to get a conversation between two users
    @GetMapping("/conversation")
    public ResponseEntity<?> getConversation(@RequestParam Long user1Id, 
                                           @RequestParam Long user2Id,
                                           HttpServletRequest request) {
        try {
            // Get authenticated user from Spring Security context
            String authenticatedUsername = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;
            
            if (authenticatedUsername == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Authentication required"));
            }
            
            // Get the authenticated user from the database
            User authenticatedUser = userService.getUserByEmail(authenticatedUsername);
            if (authenticatedUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Invalid authentication"));
            }
            
            // Verify the authenticated user is one of the conversation participants
            if (!authenticatedUser.getId().equals(user1Id) && !authenticatedUser.getId().equals(user2Id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "You can only view conversations you are part of"));
            }
            
            List<Message> conversation = messageService.getConversation(user1Id, user2Id);
            return ResponseEntity.ok(Map.of("success", true, "conversation", conversation));
            
        } catch (Exception e) {
            System.err.println("Error getting conversation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Failed to get conversation"));
        }
    }

    // Endpoint to get all conversations for a user
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(@RequestParam Long userId, HttpServletRequest request) {
        try {
            // Get authenticated user from Spring Security context
            String authenticatedUsername = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;
            
            if (authenticatedUsername == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Authentication required"));
            }
            
            // Get the authenticated user from the database
            User authenticatedUser = userService.getUserByEmail(authenticatedUsername);
            if (authenticatedUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Invalid authentication"));
            }
            
            // Verify the authenticated user is requesting their own conversations
            if (!authenticatedUser.getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "You can only view your own conversations"));
            }
            
            List<Message> conversations = messageService.getConversations(userId);
            System.out.println("=== CONVERSATIONS DEBUG ===");
            System.out.println("User ID: " + userId);
            System.out.println("Authenticated user ID: " + authenticatedUser.getId());
            System.out.println("Conversations found: " + conversations.size());
            System.out.println("==========================");
            return ResponseEntity.ok(Map.of("success", true, "conversations", conversations));
            
        } catch (Exception e) {
            System.err.println("Error getting conversations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Failed to get conversations"));
        }
    }
    
    @PostMapping("/markAsRead")
    public ResponseEntity<?> markMessagesAsRead(@RequestParam Long user1Id, 
                                              @RequestParam Long user2Id,
                                              HttpServletRequest request) {
        try {
            // Get authenticated user from Spring Security context
            String authenticatedUsername = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;
            
            if (authenticatedUsername == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Authentication required"));
            }
            
            // Get the authenticated user from the database
            User authenticatedUser = userService.getUserByEmail(authenticatedUsername);
            if (authenticatedUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Invalid authentication"));
            }
            
            // Verify the authenticated user is one of the conversation participants
            if (!authenticatedUser.getId().equals(user1Id) && !authenticatedUser.getId().equals(user2Id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "You can only mark messages as read for conversations you are part of"));
            }
            
        messageService.markMessagesAsRead(user1Id, user2Id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Messages marked as read"));
            
        } catch (Exception e) {
            System.err.println("Error marking messages as read: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Failed to mark messages as read"));
        }
    }

    // Endpoint to get unread message count
    @GetMapping("/unreadCount/{userId}")
    public ResponseEntity<?> getUnreadMessages(@PathVariable Long userId, HttpServletRequest request) {
        try {
            // Get authenticated user from Spring Security context
            String authenticatedUsername = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;
            
            if (authenticatedUsername == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Authentication required"));
            }
            
            // Get the authenticated user from the database
            User authenticatedUser = userService.getUserByEmail(authenticatedUsername);
            if (authenticatedUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Invalid authentication"));
            }
            
            // Verify the authenticated user is requesting their own unread count
            if (!authenticatedUser.getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "You can only view your own unread message count"));
            }
            
            int unreadCount = messageService.getUnreadMessageCount(userId);
            return ResponseEntity.ok(Map.of("success", true, "unreadCount", unreadCount));
            
        } catch (Exception e) {
            System.err.println("Error getting unread message count: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Failed to get unread message count"));
        }
    }
}
