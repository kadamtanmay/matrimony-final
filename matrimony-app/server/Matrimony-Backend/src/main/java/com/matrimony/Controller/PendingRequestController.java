package com.matrimony.Controller;

import com.matrimony.Entity.PendingRequest;
import com.matrimony.Entity.User;
import com.matrimony.Service.PendingRequestService;
import com.matrimony.Service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pending-requests")
@CrossOrigin(origins="http://localhost:3000")
public class PendingRequestController {

  @Autowired private PendingRequestService prs;
  @Autowired private UserService us;

  @PostMapping("/send")
  public ResponseEntity<?> send(@RequestParam Long senderId, 
                               @RequestParam Long receiverId,
                               HttpServletRequest request) {
    try {
      // Get authenticated user from Spring Security context
      String authenticatedUsername = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;
      
      if (authenticatedUsername == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("success", false, "error", "Authentication required"));
      }
      
      // Get the authenticated user from the database
      User authenticatedUser = us.getUserByEmail(authenticatedUsername);
      if (authenticatedUser == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("success", false, "error", "Invalid authentication"));
      }
      
      // Verify the sender ID matches the authenticated user (prevent impersonation)
      if (!authenticatedUser.getId().equals(senderId)) {
        Map<String, Object> errorResponse = Map.of("success", false, "error", "You can only send requests from your own account");
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(errorResponse);
      }
      
      // Validate input parameters
      if (senderId == null || receiverId == null) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "error", "Sender ID and Receiver ID are required"));
      }
      
      if (senderId.equals(receiverId)) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "error", "Cannot send request to yourself"));
      }
      
      // Check if request already exists
      if (prs.hasSentRequest(senderId, receiverId)) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "error", "Request already sent to this user"));
      }
      
      // Check if users exist
      User sender = us.getUserById(senderId);
      User receiver = us.getUserById(receiverId);
      
      if (sender == null || receiver == null) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "error", "Invalid sender or receiver ID"));
      }
      
      // Check if sender's profile is approved (NEW CHECK)
      if (!sender.getProfileApproved()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "error", "Your profile must be approved by admin before you can send connection requests"));
      }
      
      // Check if sender is active
      if (!sender.getIsActive()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "error", "Your account must be active to send connection requests"));
      }
      
      // Additional validation: Check if receiver is active and profile is approved
      if (!receiver.getIsActive()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "error", "Cannot send request to inactive user"));
      }
      
      if (!receiver.getProfileApproved()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "error", "Cannot send request to user with unapproved profile"));
      }
      
      // Create and save the request
      PendingRequest req = new PendingRequest();
      req.setSender(sender);
      req.setReceiver(receiver);
      req.setStatus(PendingRequest.STATUS_PENDING);
      req.setTimestamp(LocalDateTime.now());
      
      prs.saveRequest(req);
      
      return ResponseEntity.ok(Map.of("success", true, "message", "Request sent successfully"));
      
    } catch (Exception e) {
      System.err.println("Error sending pending request: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "error", "Failed to send request: " + e.getMessage()));
    }
  }

  @GetMapping("/pending/{userId}")
  public ResponseEntity<?> list(@PathVariable Long userId, HttpServletRequest request) {
    try {
      // Get authenticated user from Spring Security context
      String authenticatedUsername = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : null;
      
      if (authenticatedUsername == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("success", false, "error", "Authentication required"));
      }
      
      // Verify the user is authenticated
      User authenticatedUser = us.getUserByEmail(authenticatedUsername);
      if (authenticatedUser == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("success", false, "error", "Invalid authentication"));
      }
      
      // Check if user is trying to access their own pending requests
      if (!authenticatedUser.getId().equals(userId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("success", false, "error", "You can only view your own pending requests"));
      }
      
      List<PendingRequest> requests = prs.getPendingRequestsByUserId(userId);
      
      return ResponseEntity.ok(Map.of("success", true, "requests", requests));
      
    } catch (Exception e) {
      System.err.println("Error getting pending requests: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "error", "Failed to get pending requests"));
    }
  }

  @PostMapping("/accept/{id}")
  public ResponseEntity<?> accept(@PathVariable Long id, HttpServletRequest request) {
    try {
      // Authentication is handled by Spring Security filter
      prs.updateRequestStatus(id, PendingRequest.STATUS_ACCEPTED);
      return ResponseEntity.ok(Map.of("success", true, "message", "Request accepted"));
      
    } catch (Exception e) {
      System.err.println("Error accepting request: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "error", "Failed to accept request"));
    }
  }

  @PostMapping("/reject/{id}")
  public ResponseEntity<?> reject(@PathVariable Long id, HttpServletRequest request) {
    try {
      // Authentication is handled by Spring Security filter
      prs.updateRequestStatus(id, PendingRequest.STATUS_REJECTED);
      return ResponseEntity.ok(Map.of("success", true, "message", "Request rejected"));
      
    } catch (Exception e) {
      System.err.println("Error rejecting request: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "error", "Failed to reject request"));
    }
  }

  @GetMapping("/is-connected")
  public ResponseEntity<?> isConnected(@RequestParam Long userId1, 
                                     @RequestParam Long userId2,
                                     HttpServletRequest request) {
    try {
      // Authentication is handled by Spring Security filter
      boolean connected = prs.isConnected(userId1, userId2);
      return ResponseEntity.ok(Map.of("success", true, "connected", connected));
      
    } catch (Exception e) {
      System.err.println("Error checking connection: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "error", "Failed to check connection"));
    }
  }

  @GetMapping("/has-sent")
  public ResponseEntity<?> hasSent(@RequestParam Long senderId, 
                                  @RequestParam Long receiverId,
                                  HttpServletRequest request) {
    try {
      // Authentication is handled by Spring Security filter
      boolean hasSent = prs.hasSentRequest(senderId, receiverId);
      return ResponseEntity.ok(Map.of("success", true, "hasSent", hasSent));
      
    } catch (Exception e) {
      System.err.println("Error checking if request sent: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "error", "Failed to check request status"));
    }
  }


}
