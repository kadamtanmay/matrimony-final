package com.matrimony.Dao;


import com.matrimony.Entity.ProfilePicture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfilePictureDao extends JpaRepository<ProfilePicture, Long> {
    // Custom queries if necessary, for example:
     ProfilePicture findByUserId(Long userId);
}
