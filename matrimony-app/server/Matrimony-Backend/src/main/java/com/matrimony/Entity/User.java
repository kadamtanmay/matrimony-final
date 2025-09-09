package com.matrimony.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "Users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @com.fasterxml.jackson.annotation.JsonProperty("id")
    private Long id;

    @NotBlank(message = "First name is mandatory")
    @Size(max = 255, message = "First name must be less than 255 characters")
    @Column(name = "first_name", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("firstName")
    private String firstName;

    @NotBlank(message = "Last name is mandatory")
    @Size(max = 255, message = "Last name must be less than 255 characters")
    @Column(name = "last_name", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("lastName")
    private String lastName;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Invalid email format")
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Password is mandatory")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Column(name = "password", nullable = false)
    private String password;

    @NotNull(message = "Gender is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @NotNull(message = "Date of birth is mandatory")
    @Column(name = "date_of_birth", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    @Size(max = 15, message = "Phone number must be less than 15 characters")
    @Column(name = "phone")
    private String phone;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @NotNull(message = "Marital status is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "marital_status", nullable = false)
    private MaritalStatus maritalStatus;

    @Column(name = "religion", length = 50)
    private String religion;

    @Column(name = "caste", length = 50)
    private String caste;

    @Column(name = "mother_tongue", length = 50)
    private String motherTongue;

    @Column(name = "education", length = 255)
    private String education;

    @Column(name = "profession", length = 255)
    private String profession;

    @Column(name = "annual_income", length = 50)
    private String annualIncome;

    @Column(name = "hobbies", length = 500)  // Add hobbies field
    private String hobbies;  // Can store as a single string, or use JSON for a list
    
    @Column(name = "bio", length = 500) // Add bio field
    private String bio;  // Store a brief description or bio of the user
  
    @Column(name = "age")
    private Integer age;
    
    @Column(name = "location")
    private String location;  // Define location field in User entity

    @Column(name = "subscription_status")
    private Integer subscriptionStatus = 0; // Default value is 0 (Inactive)

    // Admin Panel additions
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role = Role.USER; // Default role is USER

    @Column(name = "is_active", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    private Boolean isActive = true; // Default is active

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "profile_approved")
    @com.fasterxml.jackson.annotation.JsonProperty("profileApproved")
    private Boolean profileApproved = false; // Default is not approved

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDate.now();
        }
        if (role == null) {
            role = Role.USER;
        }
        if (isActive == null) {
            isActive = true;
        }
        if (profileApproved == null) {
            profileApproved = false;
        }
        if (subscriptionStatus == null) {  // Add this line
            subscriptionStatus = 0;         // Add this line
        }
    }

    public enum Gender {
        MALE, FEMALE, OTHER;
        
        @JsonCreator
        public static Gender forValue(String value) {
            return value != null ? Gender.valueOf(value.toUpperCase()) : null;
        }

        @JsonValue
        public String toValue() {
            return this.name();
        }
    }

    public enum MaritalStatus {
        SINGLE, MARRIED, DIVORCED, WIDOWED;

        @JsonCreator
        public static MaritalStatus forValue(String value) {
            return value != null ? MaritalStatus.valueOf(value.toUpperCase()) : null;
        }

        @JsonValue
        public String toValue() {
            return this.name();
        }
    }

    public enum Role {
        USER, ADMIN;

        @JsonCreator
        public static Role forValue(String value) {
            return value != null ? Role.valueOf(value.toUpperCase()) : null;
        }

        @JsonValue
        public String toValue() {
            return this.name();
        }
    }
}
