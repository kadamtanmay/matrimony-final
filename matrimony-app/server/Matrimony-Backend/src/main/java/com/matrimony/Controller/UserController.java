package com.matrimony.Controller;

import com.matrimony.Dao.ProfileViewRepository;
import com.matrimony.Entity.ProfileView;
import com.matrimony.Entity.User;
import com.matrimony.Service.UserService;

import jakarta.servlet.http.HttpServletRequest;

import com.matrimony.Service.MatchService;
import com.matrimony.Service.MessageService;
import com.matrimony.Service.PendingRequestService;
import com.matrimony.Service.ProfileViewService;
import com.matrimony.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private MatchService matchService;

    @Autowired
    private MessageService messageService;
    
    @Autowired private PendingRequestService prs;
    @Autowired private ProfileViewService pvs;  // implement similarly
    
    @Autowired
    private ProfileViewRepository profileViewRepository;

    // ✅ Sign Up (Registers a new user with password hashing)
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody User user) {
        try {
            return userService.addUser(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error during registration: " + e.getMessage());
        }
    }

    // ✅ Login (Authenticates user and returns JWT token)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        ResponseEntity<?> authResponse =
                userService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
        if (authResponse.getStatusCode() != HttpStatus.OK) {
            return authResponse;
        }

        User user = (User) authResponse.getBody();
        String token = jwtUtil.generateToken(user.getEmail());
        
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("token", token);
        responseBody.put("user", user);

        return ResponseEntity.ok(responseBody);
    }

    // ✅ Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }
    }

    // ✅ Update user details
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody User updatedUser) {
        return userService.updateUser(id, updatedUser);
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization");
            
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                
                String email = jwtUtil.extractEmail(jwt);
                
                User user = userService.getUserByEmail(email);
                return ResponseEntity.ok(user);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
    }



    // ✅ Dashboard stats endpoint
    @GetMapping("/dashboard-stats/{userId}")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@PathVariable Long userId) {
        try {
            Map<String, Object> stats = new HashMap<>();

            // Total matches - handle gracefully if preferences are missing
            try {
                List<User> matches = matchService.getMatches(userId);
                stats.put("totalMatches", matches != null ? matches.size() : 0);
            } catch (Exception e) {
                System.err.println("Error fetching matches for user " + userId + ": " + e.getMessage());
                stats.put("totalMatches", 0);
            }

            // Unread messages
            int unread = messageService.getUnreadMessageCount(userId);
            stats.put("newMessages", unread);
            
            // Pending requests
            int pendingRequests = prs.countPendingRequests(userId);
            stats.put("pendingRequests", pendingRequests);
            
            // Profile views
            long profileViews = pvs.countProfileViews(userId);
            stats.put("profileViews", profileViews);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error fetching dashboard stats for user " + userId + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to fetch dashboard stats"));
        }
    }
    


    // Add this new endpoint
    @PostMapping("/profile/view/{viewedUserId}")
    public ResponseEntity<?> recordProfileView(@PathVariable Long viewedUserId, HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                String email = jwtUtil.extractEmail(jwt);
                User viewer = userService.getUserByEmail(email);
                
                // Don't record if user views their own profile
                if (!viewer.getId().equals(viewedUserId)) {
                    // Check if already viewed recently (within last hour to avoid spam)
                    LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
                    long recentViews = profileViewRepository.countRecentViews(viewer.getId(), viewedUserId, oneHourAgo);
                    
                    if (recentViews == 0) {
                        ProfileView profileView = new ProfileView(viewer.getId(), viewedUserId);
                        profileViewRepository.save(profileView);
                        System.out.println("Profile view recorded: User " + viewer.getId() + " viewed User " + viewedUserId);
                    }
                }
                
                return ResponseEntity.ok("Profile view recorded");
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (Exception e) {
            System.out.println("Error recording profile view: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error recording profile view");
        }
    }
    
    // Utility endpoint to create preferences for all users who don't have them
    @PostMapping("/initialize-preferences")
    public ResponseEntity<?> initializePreferencesForAllUsers(HttpServletRequest request) {
        try {
            String token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                String email = jwtUtil.extractEmail(jwt);
                User adminUser = userService.getUserByEmail(email);
                
                // Only allow admins to run this
                if (adminUser.getRole() != User.Role.ADMIN) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
                }
                
                // This would need to be implemented in UserService
                // For now, return a message
                return ResponseEntity.ok("Preferences initialization endpoint - implement in UserService");
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (Exception e) {
            System.out.println("Error initializing preferences: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error initializing preferences");
        }
    }

}
