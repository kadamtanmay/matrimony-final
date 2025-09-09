package com.matrimony.Controller;

import com.matrimony.Entity.User;
import com.matrimony.Service.AdminService;
import com.matrimony.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    // Dashboard Overview
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(@RequestHeader("Authorization") String token) {
        try {
            if (!isAdminUser(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
            }
            Map<String, Object> stats = adminService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching dashboard stats: " + e.getMessage());
        }
    }

    // User Management
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String token) {
        try {
            if (!isAdminUser(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
            }
            List<User> users = adminService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching users: " + e.getMessage());
        }
    }

    @GetMapping("/users/search")
    public ResponseEntity<?> searchUsers(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String gender) {
        try {
            if (!isAdminUser(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
            }
            List<User> users = adminService.searchUsers(name, email, gender);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error searching users: " + e.getMessage());
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        try {
            if (!isAdminUser(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
            }
            User user = adminService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching user: " + e.getMessage());
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody User updatedUser) {
        try {
            if (!isAdminUser(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
            }
            User user = adminService.updateUser(id, updatedUser);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating user: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> softDeleteUser(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        try {
            if (!isAdminUser(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
            }
            adminService.softDeleteUser(id);
            return ResponseEntity.ok("User soft deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting user: " + e.getMessage());
        }
    }

    @PostMapping("/users/{id}/restore")
    public ResponseEntity<?> restoreUser(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        try {
            if (!isAdminUser(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
            }
            adminService.restoreUser(id);
            return ResponseEntity.ok("User restored successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error restoring user: " + e.getMessage());
        }
    }

    // Profile Management
    @GetMapping("/profiles")
    public ResponseEntity<?> getAllProfiles(@RequestHeader("Authorization") String token) {
        try {
            if (!isAdminUser(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
            }
            List<User> profiles = adminService.getAllProfiles();
            return ResponseEntity.ok(profiles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching profiles: " + e.getMessage());
        }
    }

    @GetMapping("/profiles/pending")
    public ResponseEntity<?> getPendingProfiles(@RequestHeader("Authorization") String token) {
        try {
            if (!isAdminUser(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
            }
            List<User> profiles = adminService.getPendingProfiles();
            return ResponseEntity.ok(profiles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching pending profiles: " + e.getMessage());
        }
    }

    @PostMapping("/profiles/{id}/approve")
    public ResponseEntity<?> approveProfile(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        try {
            if (!isAdminUser(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
            }
            adminService.approveProfile(id);
            return ResponseEntity.ok("Profile approved successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error approving profile: " + e.getMessage());
        }
    }

    @PostMapping("/profiles/{id}/reject")
    public ResponseEntity<?> rejectProfile(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody Map<String, String> rejectionReason) {
        try {
            if (!isAdminUser(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
            }
            String reason = rejectionReason != null && rejectionReason.containsKey("reason") ? 
                rejectionReason.get("reason") : "Profile rejected by admin";
            adminService.rejectProfile(id, reason);
            return ResponseEntity.ok("Profile rejected successfully");
        } catch (RuntimeException e) {
            System.err.println("Profile not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
        } catch (Exception e) {
            System.err.println("Error rejecting profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error rejecting profile: " + e.getMessage());
        }
    }

    @PostMapping("/profiles/{id}/revoke")
    public ResponseEntity<?> revokeProfile(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        try {
            if (!isAdminUser(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
            }
            adminService.revokeProfile(id);
            return ResponseEntity.ok("Profile approval revoked successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error revoking profile approval: " + e.getMessage());
        }
    }



    // Helper method to check if user is admin
    private boolean isAdminUser(String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            String email = jwtUtil.extractUsername(token);
            return adminService.isAdminUser(email);
        } catch (Exception e) {
            return false;
        }
    }
}
