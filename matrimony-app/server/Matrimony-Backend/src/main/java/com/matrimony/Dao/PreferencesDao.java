package com.matrimony.Dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.matrimony.Entity.Preferences;
import com.matrimony.Entity.User;

public interface PreferencesDao extends JpaRepository<Preferences, Long>
{
	 Preferences findByUserId(Long userId);
	 Optional<Preferences> findByUser(User user);
	 List<Preferences> findByAgeAndLocationAndReligionAndCasteAndEducationAndProfessionAndGender(
	            int age, String location, String religion, String caste,
	            String education, String profession, String gender);
	}


