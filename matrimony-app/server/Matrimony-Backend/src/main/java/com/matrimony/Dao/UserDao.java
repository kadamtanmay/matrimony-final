package com.matrimony.Dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.matrimony.Entity.User;

public interface UserDao extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE " +
           "( (:age IS NULL OR u.age = :age) " +
           "OR (:caste IS NULL OR u.caste = :caste) " +
           "OR (:gender IS NULL OR u.gender = :gender) " +
           "OR (:location IS NULL OR u.location = :location) " +
           "OR (:profession IS NULL OR u.profession = :profession) " +
           "OR (:religion IS NULL OR u.religion = :religion) ) " +  // Group all OR conditions
           "AND u.id != :userId " +  // Exclude the current user after matching preferences
           "AND u.role = 'USER' " +  // Only include regular users, exclude admins
           "AND u.isActive = true " +  // Only include active users
           "AND u.profileApproved = true")  // Only include approved profiles
    List<User> findMatchesByPreferences(@Param("age") Integer age,
                                        @Param("caste") String caste,
                                        @Param("gender") User.Gender gender,
                                        @Param("location") String location,
                                        @Param("profession") String profession,
                                        @Param("religion") String religion,
                                        @Param("userId") Long userId);  // Added userId parameter
}
	