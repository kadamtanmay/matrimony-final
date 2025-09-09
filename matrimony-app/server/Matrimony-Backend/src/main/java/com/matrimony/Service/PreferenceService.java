package com.matrimony.Service;

import java.util.List;

import com.matrimony.Dto.ApiResponse;
import com.matrimony.Dto.PreferencesDto;
import com.matrimony.Dto.UserRegisterDto;
import com.matrimony.Entity.Preferences;
import com.matrimony.Entity.User;

public interface PreferenceService {

	Preferences savePreferences(Preferences preferences, Long id);

//	List<UserRegisterDto> findMatchingUsers(Long userId);

}
