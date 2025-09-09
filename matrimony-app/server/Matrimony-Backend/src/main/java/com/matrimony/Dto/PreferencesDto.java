package com.matrimony.Dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PreferencesDto extends BaseDto{
	
	private int age;
	private String location;
	private String religion;
	private String caste;
	private String education;
	private String profession;
	private String gender;

}
