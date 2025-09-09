package com.matrimony.Service;

import com.matrimony.Dao.UserDao;
import com.matrimony.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserDao userDao;

    // Dashboard Statistics
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<User> allUsers = userDao.findAll();
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
        
        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream().filter(User::getIsActive).count();
        long recentlyRegistered = allUsers.stream()
                .filter(user -> user.getCreatedAt() != null && user.getCreatedAt().isAfter(sevenDaysAgo))
                .count();
        long approvedProfiles = allUsers.stream().filter(User::getProfileApproved).count();
        long pendingProfiles = totalUsers - approvedProfiles;
        
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("recentlyRegistered", recentlyRegistered);
        stats.put("approvedProfiles", approvedProfiles);
        stats.put("pendingProfiles", pendingProfiles);
        
        return stats;
    }

    // User Management
    public List<User> getAllUsers() {
        return userDao.findAll();
    }

    public List<User> searchUsers(String name, String email, String gender) {
        List<User> allUsers = userDao.findAll();
        
        return allUsers.stream()
                .filter(user -> {
                    boolean matchesName = name == null || name.isEmpty() || 
                        (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(name.toLowerCase())) ||
                        (user.getLastName() != null && user.getLastName().toLowerCase().contains(name.toLowerCase()));
                    
                    boolean matchesEmail = email == null || email.isEmpty() || 
                        (user.getEmail() != null && user.getEmail().toLowerCase().contains(email.toLowerCase()));
                    
                    boolean matchesGender = gender == null || gender.isEmpty() || 
                        (user.getGender() != null && user.getGender().name().equalsIgnoreCase(gender));
                    
                    return matchesName && matchesEmail && matchesGender;
                })
                .collect(Collectors.toList());
    }

    public User getUserById(Long id) {
        Optional<User> user = userDao.findById(id);
        if (user.isPresent()) {
            return user.get();
        } else {
            throw new RuntimeException("User not found with id: " + id);
        }
    }

    public User updateUser(Long id, User updatedUser) {
        Optional<User> existingUserOpt = userDao.findById(id);
        if (existingUserOpt.isEmpty()) {
            throw new RuntimeException("User not found with id: " + id);
        }
        
        User existingUser = existingUserOpt.get();
        
        // Update only non-null fields (excluding sensitive fields)
        if (updatedUser.getFirstName() != null) existingUser.setFirstName(updatedUser.getFirstName());
        if (updatedUser.getLastName() != null) existingUser.setLastName(updatedUser.getLastName());
        if (updatedUser.getPhone() != null) existingUser.setPhone(updatedUser.getPhone());
        if (updatedUser.getAddress() != null) existingUser.setAddress(updatedUser.getAddress());
        if (updatedUser.getMaritalStatus() != null) existingUser.setMaritalStatus(updatedUser.getMaritalStatus());
        if (updatedUser.getReligion() != null) existingUser.setReligion(updatedUser.getReligion());
        if (updatedUser.getCaste() != null) existingUser.setCaste(updatedUser.getCaste());
        if (updatedUser.getMotherTongue() != null) existingUser.setMotherTongue(updatedUser.getMotherTongue());
        if (updatedUser.getEducation() != null) existingUser.setEducation(updatedUser.getEducation());
        if (updatedUser.getProfession() != null) existingUser.setProfession(updatedUser.getProfession());
        if (updatedUser.getAnnualIncome() != null) existingUser.setAnnualIncome(updatedUser.getAnnualIncome());
        if (updatedUser.getBio() != null) existingUser.setBio(updatedUser.getBio());
        if (updatedUser.getHobbies() != null) existingUser.setHobbies(updatedUser.getHobbies());
        if (updatedUser.getAge() != null) existingUser.setAge(updatedUser.getAge());
        if (updatedUser.getLocation() != null) existingUser.setLocation(updatedUser.getLocation());
        if (updatedUser.getRole() != null) existingUser.setRole(updatedUser.getRole());
        if (updatedUser.getIsActive() != null) existingUser.setIsActive(updatedUser.getIsActive());
        if (updatedUser.getProfileApproved() != null) existingUser.setProfileApproved(updatedUser.getProfileApproved());
        
        return userDao.save(existingUser);
    }

    public void softDeleteUser(Long id) {
        Optional<User> userOpt = userDao.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with id: " + id);
        }
        
        User user = userOpt.get();
        user.setIsActive(false);
        userDao.save(user);
    }

    public void restoreUser(Long id) {
        Optional<User> userOpt = userDao.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with id: " + id);
        }
        
        User user = userOpt.get();
        user.setIsActive(true);
        userDao.save(user);
    }

    // Profile Management
    public List<User> getAllProfiles() {
        return userDao.findAll();
    }

    public List<User> getPendingProfiles() {
        return userDao.findAll().stream()
                .filter(user -> !user.getProfileApproved())
                .collect(Collectors.toList());
    }

    public void approveProfile(Long id) {
        Optional<User> userOpt = userDao.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with id: " + id);
        }
        
        User user = userOpt.get();
        user.setProfileApproved(true);
        userDao.save(user);
    }

    public void rejectProfile(Long id, String reason) {
        Optional<User> userOpt = userDao.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with id: " + id);
        }
        
        User user = userOpt.get();
        user.setProfileApproved(false);
        
        // You could add a rejection reason field to the User entity if needed
        userDao.save(user);
    }

    public void revokeProfile(Long id) {
        Optional<User> userOpt = userDao.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with id: " + id);
        }
        
        User user = userOpt.get();
        user.setProfileApproved(false);
        userDao.save(user);
    }

    // Admin Authentication
    public boolean isAdminUser(String email) {
        Optional<User> userOpt = userDao.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return user.getRole() == User.Role.ADMIN && user.getIsActive();
        }
        return false;
    }
}
