// ProfileViewRepository.java
package com.matrimony.Dao;

import com.matrimony.Entity.ProfileView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileViewRepository extends JpaRepository<ProfileView, Long> {
    
    // Count how many times a user's profile has been viewed
    @Query("SELECT COUNT(pv) FROM ProfileView pv WHERE pv.viewedUserId = :userId")
    long countByViewedUserId(@Param("userId") Long userId);
    
    // Check if a user has already viewed another user's profile recently
    @Query("SELECT COUNT(pv) FROM ProfileView pv WHERE pv.viewerUserId = :viewerId AND pv.viewedUserId = :viewedId AND pv.viewedAt > :since")
    long countRecentViews(@Param("viewerId") Long viewerId, @Param("viewedId") Long viewedId, @Param("since") java.time.LocalDateTime since);
}
