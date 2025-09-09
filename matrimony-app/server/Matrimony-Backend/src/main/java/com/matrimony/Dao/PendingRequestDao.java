package com.matrimony.Dao;

import com.matrimony.Entity.PendingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PendingRequestDao extends JpaRepository<PendingRequest, Long> {

  // Count pending requests received by user
  @Query("SELECT COUNT(r) FROM PendingRequest r WHERE r.receiver.id = :userId AND r.status = :status")
  int countPendingByUserId(@Param("userId") Long userId, @Param("status") String status);

  // Does an accepted connection exist between two users?
  @Query("""
    SELECT CASE WHEN COUNT(r)>0 THEN true ELSE false END
      FROM PendingRequest r
     WHERE ((r.sender.id=:u1 AND r.receiver.id=:u2)
         OR (r.sender.id=:u2 AND r.receiver.id=:u1))
       AND r.status=:status
  """)
  boolean existsAcceptedConnection(@Param("u1") Long userId1, @Param("u2") Long userId2, @Param("status") String status);

  // Has sender already sent a request to receiver?
  @Query("SELECT CASE WHEN COUNT(r)>0 THEN true ELSE false END "
       + "FROM PendingRequest r "
       + "WHERE r.sender.id=:sender AND r.receiver.id=:receiver")
  boolean existsBySenderAndReceiver(@Param("sender") Long senderId,
                                    @Param("receiver") Long receiverId);
}
