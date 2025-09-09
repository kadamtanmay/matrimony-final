package com.matrimony.Controller;

import com.matrimony.Service.ProfilePictureService;
import com.matrimony.Entity.ProfilePicture;
import com.matrimony.Entity.User;
import com.matrimony.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/profile-picture")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfilePictureController {

    private final ProfilePictureService profilePictureService;
    private final JwtUtil jwtUtil;

    @Autowired
    public ProfilePictureController(ProfilePictureService profilePictureService, JwtUtil jwtUtil) {
        this.profilePictureService = profilePictureService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file,
                                               @RequestParam("userId") Long userId,
                                               HttpServletRequest request) {
        try {
            // Authenticate user
            String token = request.getHeader("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
            }
            
            String jwt = token.substring(7);
            String userEmail = jwtUtil.extractEmail(jwt);
            
            // Verify the user is uploading for themselves
            if (!profilePictureService.verifyUserOwnership(userEmail, userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only upload profile pictures for your own account");
            }
            
            System.out.println("Controller received file: " + file.getOriginalFilename() + " for user: " + userId);
            
            String fileUrl = profilePictureService.saveProfilePicture(file, userId);
            System.out.println("File uploaded successfully: " + fileUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("fileUrl", fileUrl);
            response.put("message", "Profile picture uploaded successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            System.err.println("Upload error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to upload profile picture: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping
    public ResponseEntity<String> getProfilePicture(@RequestParam("userId") Long userId) {
        try {
            String profilePictureUrl = profilePictureService.getProfilePictureUrl(userId);
            if (profilePictureUrl != null) {
                return ResponseEntity.ok(profilePictureUrl);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No profile picture found.");
        } catch (Exception e) {
            System.err.println("Error getting profile picture: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving profile picture");
        }
    }
}
