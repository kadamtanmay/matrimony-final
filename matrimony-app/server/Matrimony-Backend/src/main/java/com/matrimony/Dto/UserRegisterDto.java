package com.matrimony.Dto;

import java.time.LocalDate;

import com.matrimony.Entity.User.Gender;
import com.matrimony.Entity.User.MaritalStatus;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
public class UserRegisterDto extends BaseDto {

    private String firstName;
    
    private String lastName;
    
    private String email;
    
    private String password;
    
    private Gender gender;
    
    private LocalDate dateOfBirth;
    
    private String phone;
    
    private String address;
    
    private String profilePicture;
    
    private MaritalStatus maritalStatus;
    
    private String religion;
    
    private String caste;
    
    private String motherTongue;
    
    private String education;
    
    private String profession;
    
    private String annualIncome;
    
    private int age;
    
  
    
    private String location;
}
