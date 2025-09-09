package com.matrimony.Service;

import com.matrimony.Dao.UserDao;
import com.matrimony.Entity.User;
import com.matrimony.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import com.matrimony.Dao.PreferencesDao;
import com.matrimony.Entity.Preferences;

@Service
public class UserService {
    @Autowired
    private UserDao userDao;

    @Autowired
    private PreferencesDao preferencesDao;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Add new user
    public ResponseEntity<?> addUser(User user) {
        if (userDao.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Email already registered.");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userDao.save(user);
        
        // Set up default preferences
        createDefaultPreferences(savedUser);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }
    
    // Set default preferences for new users
    private void createDefaultPreferences(User user) {
        try {
            Preferences defaultPreferences = new Preferences();
            
            // Use user's own info as defaults
            defaultPreferences.setAge(user.getAge() != null ? user.getAge() : 25);
            defaultPreferences.setLocation(user.getLocation() != null ? user.getLocation() : "Any");
            defaultPreferences.setReligion(user.getReligion() != null ? user.getReligion() : "Any");
            defaultPreferences.setCaste(user.getCaste() != null ? user.getCaste() : "Any");
            defaultPreferences.setEducation(user.getEducation() != null ? user.getEducation() : "Any");
            defaultPreferences.setProfession(user.getProfession() != null ? user.getProfession() : "Any");
            
            // Look for opposite gender
            if (user.getGender() != null) {
                if (user.getGender() == User.Gender.MALE) {
                    defaultPreferences.setGender("FEMALE");
                } else if (user.getGender() == User.Gender.FEMALE) {
                    defaultPreferences.setGender("MALE");
                } else {
                    defaultPreferences.setGender("ANY");
                }
            } else {
                defaultPreferences.setGender("ANY");
            }
            
            defaultPreferences.setUser(user);
            
            // Save preferences
            Preferences savedPreferences = preferencesDao.save(defaultPreferences);
            
        } catch (Exception e) {
            System.err.println("Error creating default preferences for user " + user.getId() + ": " + e.getMessage());
            // Continue even if preferences fail
        }
    }

    // Login user
    public ResponseEntity<?> authenticateUser(String email, String password) {
        Optional<User> userOpt = userDao.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }
        return ResponseEntity.ok(user);
    }

    // Update user info
    public ResponseEntity<?> updateUser(Long userId, User updatedUser) {
        
        try {
            Optional<User> existingUserOpt = userDao.findById(userId);
            if (existingUserOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
            }
            User existingUser = existingUserOpt.get();

            // Update only provided fields
            if (updatedUser.getFirstName() != null)    existingUser.setFirstName(updatedUser.getFirstName());
            if (updatedUser.getLastName() != null)     existingUser.setLastName(updatedUser.getLastName());
            if (updatedUser.getEmail() != null)        existingUser.setEmail(updatedUser.getEmail());
            if (updatedUser.getPhone() != null)        existingUser.setPhone(updatedUser.getPhone());
            if (updatedUser.getAddress() != null)      existingUser.setAddress(updatedUser.getAddress());
            if (updatedUser.getDateOfBirth() != null)  existingUser.setDateOfBirth(updatedUser.getDateOfBirth());
            if (updatedUser.getMaritalStatus() != null)existingUser.setMaritalStatus(updatedUser.getMaritalStatus());
            if (updatedUser.getGender() != null)       existingUser.setGender(updatedUser.getGender());
            if (updatedUser.getReligion() != null)     existingUser.setReligion(updatedUser.getReligion());
            if (updatedUser.getCaste() != null)        existingUser.setCaste(updatedUser.getCaste());
            if (updatedUser.getMotherTongue() != null) existingUser.setMotherTongue(updatedUser.getMotherTongue());
            if (updatedUser.getEducation() != null)    existingUser.setEducation(updatedUser.getEducation());
            if (updatedUser.getProfession() != null)   existingUser.setProfession(updatedUser.getProfession());
            if (updatedUser.getAnnualIncome() != null) existingUser.setAnnualIncome(updatedUser.getAnnualIncome());
            if (updatedUser.getBio() != null)          existingUser.setBio(updatedUser.getBio());
            if (updatedUser.getHobbies() != null)      existingUser.setHobbies(updatedUser.getHobbies());

            // Handle age and location
            if (updatedUser.getAge() != null)          existingUser.setAge(updatedUser.getAge());
            if (updatedUser.getLocation() != null)     existingUser.setLocation(updatedUser.getLocation());

            User savedUser = userDao.save(existingUser);
            
            // Make sure user has preferences
            ensureUserHasPreferences(savedUser);
            
            
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            System.err.println("Error updating user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating user: " + e.getMessage());
        }
    }
    
    // Create preferences if missing
    private void ensureUserHasPreferences(User user) {
        try {
            Preferences existingPreferences = preferencesDao.findByUserId(user.getId());
            if (existingPreferences == null) {
                createDefaultPreferences(user);
            } else {
            }
        } catch (Exception e) {
            System.err.println("Error ensuring preferences for user " + user.getId() + ": " + e.getMessage());
        }
    }
    
    public User getUserByEmail(String email) {
        Optional<User> userOpt = userDao.findByEmail(email);
        if (userOpt.isPresent()) {
            return userOpt.get();
        } else {
            throw new RuntimeException("User not found with email: " + email);
        }
    }

    // Get user by ID
    public User getUserById(Long id) {
        Optional<User> user = userDao.findById(id);
        if (user.isPresent()) {
            return user.get();
        } else {
            throw new RuntimeException("User not found");
        }
    }
}
