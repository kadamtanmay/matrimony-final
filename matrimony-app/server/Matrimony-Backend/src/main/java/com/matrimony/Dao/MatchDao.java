package com.matrimony.Dao;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.matrimony.Entity.User;

public interface MatchDao extends JpaRepository<User, Long> {
    
    @Query("SELECT u FROM User u WHERE u.age = :age " +
           "AND u.caste = :caste " +
           "AND u.religion = :religion " +  // Use camelCase for field names
           "AND u.gender = :gender " +
           "AND u.profession  = :profession " +
           "AND u.location = :location " +   // Fix field name case
           "AND u.role = 'USER' " +  // Only include regular users, exclude admins
           "AND u.isActive = true " +  // Only include active users
           "AND u.profileApproved = true")  // Only include approved profiles
    List<User> findMatchesByPreferences(
        @Param("age") int age,              // Match the query parameter name
        @Param("caste") String caste,
        @Param("religion") String religion,
        @Param("gender") String gender,
        @Param("profession") String profession,
        @Param("location") String location
    );

}
