package com.matrimony.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.matrimony.Dao.PreferencesDao;
import com.matrimony.Dao.UserDao;
import com.matrimony.Entity.Preferences;
import com.matrimony.Entity.User;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class PreferenceServiceImpl implements PreferenceService {

    @Autowired
    private PreferencesDao preferenceDao;
    
    @Autowired
    private UserDao userDao;

    @Override
    public Preferences savePreferences(Preferences preferences, Long id) {
        User user = userDao.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if preferences exist for the user
        Preferences existingPreferences = preferenceDao.findByUser(user)
                .orElse(new Preferences()); // If not found, create a new one

        // Update preferences
        existingPreferences.setAge(preferences.getAge());
        existingPreferences.setLocation(preferences.getLocation());
        existingPreferences.setReligion(preferences.getReligion());
        existingPreferences.setCaste(preferences.getCaste());
        existingPreferences.setEducation(preferences.getEducation());
        existingPreferences.setProfession(preferences.getProfession());
        existingPreferences.setGender(preferences.getGender());
        existingPreferences.setUser(user);

        return preferenceDao.save(existingPreferences);
    }
}
