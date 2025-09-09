package com.matrimony.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.matrimony.CustomExceptions.ResourceNotFoundException;
import com.matrimony.Dao.MatchDao;
import com.matrimony.Dao.PreferencesDao;
import com.matrimony.Dao.UserDao;
import com.matrimony.Dto.PreferencesDto;
import com.matrimony.Dto.UserRegisterDto;
import com.matrimony.Entity.Preferences;
import com.matrimony.Entity.User;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class MatchServiceImpl implements MatchService {

    @Autowired
    private UserDao userDao;
    
    @Autowired
    private PreferencesDao preferencesDao;
    
    @Override
    public List<User> getMatches(Long userId) {
        // First, check if user exists
        User user = userDao.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        // Check if preferences exist, if not create default ones
        Preferences preferences = preferencesDao.findByUserId(userId);
        if (preferences == null) {
            System.out.println("Preferences not found for user " + userId + ", creating default preferences");
            preferences = createDefaultPreferences(user);
        }
        
        System.out.println("Fetching matches for user: " + userId + " with preferences: " + preferences);

        List<User> matches = userDao.findMatchesByPreferences(
            preferences.getAge(),
            preferences.getCaste(),
            convertGenderStringToEnum(preferences.getGender()),  // Convert String to User.Gender enum
            preferences.getLocation(),
            preferences.getProfession(),
            preferences.getReligion(),
            userId  // Exclude current user
        );
        
        // Debug: Check if any admin users are in the results
        long adminCount = matches.stream().filter(u -> u.getRole() == User.Role.ADMIN).count();
        if (adminCount > 0) {
            System.out.println("WARNING: Found " + adminCount + " admin users in matches for user " + userId);
        } else {
            System.out.println("✅ No admin users found in matches for user " + userId);
        }
        
        System.out.println("Total matches found: " + matches.size());
        
        return matches;
    }
    
    /**
     * Create default preferences for a user based on their profile information
     */
    private Preferences createDefaultPreferences(User user) {
        // Double-check if preferences already exist to prevent duplicates
        Preferences existingPreferences = preferencesDao.findByUserId(user.getId());
        if (existingPreferences != null) {
            System.out.println("Preferences already exist for user " + user.getId() + ", returning existing ones");
            return existingPreferences;
        }
        
        Preferences defaultPreferences = new Preferences();
        
        // Set default values based on user's own profile
        defaultPreferences.setAge(user.getAge() != null ? user.getAge() : 25);
        defaultPreferences.setLocation(user.getLocation() != null ? user.getLocation() : "Any");
        defaultPreferences.setReligion(user.getReligion() != null ? user.getReligion() : "Any");
        defaultPreferences.setCaste(user.getCaste() != null ? user.getCaste() : "Any");
        defaultPreferences.setEducation(user.getEducation() != null ? user.getEducation() : "Any");
        defaultPreferences.setProfession(user.getProfession() != null ? user.getProfession() : "Any");
        
        // Set gender preference to opposite of user's gender
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
        
        // Save the default preferences
        Preferences savedPreferences = preferencesDao.save(defaultPreferences);
        System.out.println("Created default preferences for user " + user.getId() + ": " + savedPreferences);
        
        return savedPreferences;
    }

    /**
     * Convert gender string from preferences to User.Gender enum
     */
    private User.Gender convertGenderStringToEnum(String genderString) {
        if (genderString == null || genderString.trim().isEmpty()) {
            return null;
        }
        
        try {
            return User.Gender.valueOf(genderString.toUpperCase());
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid gender value in preferences: " + genderString + ", defaulting to null");
            return null;
        }
    }
}
