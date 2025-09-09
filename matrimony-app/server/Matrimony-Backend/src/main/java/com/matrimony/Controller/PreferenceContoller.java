package com.matrimony.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.matrimony.Entity.Preferences;
import com.matrimony.Entity.User;
import com.matrimony.Service.PreferenceService;
import com.matrimony.Service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/user/preferences")
@CrossOrigin(origins = "http://localhost:3000")
public class PreferenceContoller {

    @Autowired
    private PreferenceService preferenceService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/save/{id}")
    public ResponseEntity<?> savePreferences(@RequestBody Preferences preferences, 
                                           @PathVariable Long id,
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
            
            // Verify the user ID matches the authenticated user (prevent impersonation)
            if (!authenticatedUser.getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "You can only save preferences for your own account"));
            }
            
            // Check if user's profile is approved
            if (!authenticatedUser.getProfileApproved()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Your profile must be approved by admin before you can save preferences"));
            }
            
            // Check if user is active
            if (!authenticatedUser.getIsActive()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", "Your account must be active to save preferences"));
            }
            
            Preferences savedPreferences = preferenceService.savePreferences(preferences, id);
            return ResponseEntity.ok(Map.of("success", true, "preferences", savedPreferences));
            
        } catch (Exception e) {
            System.err.println("Error saving preferences: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Failed to save preferences: " + e.getMessage()));
        }
    }
}
