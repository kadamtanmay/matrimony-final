package com.matrimony.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
//ProfileView.java
//package com.matrimony.Entity;

//import javax.persistence.*;
import java.time.LocalDateTime;

//import org.hibernate.annotations.Table;
import jakarta.persistence.Table;


@Entity
@Table(name = "profile_view")
public class ProfileView {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;
 
 @Column(name = "viewer_user_id")
 private Long viewerUserId;  // Who viewed the profile
 
 @Column(name = "viewed_user_id") 
 private Long viewedUserId;  // Whose profile was viewed
 
 @Column(name = "viewed_at")
 private LocalDateTime viewedAt;
 
 // Constructors
 public ProfileView() {}
 
 public ProfileView(Long viewerUserId, Long viewedUserId) {
     this.viewerUserId = viewerUserId;
     this.viewedUserId = viewedUserId;
     this.viewedAt = LocalDateTime.now();
 }
 
 // Getters and Setters
 public Long getId() { return id; }
 public void setId(Long id) { this.id = id; }
 
 public Long getViewerUserId() { return viewerUserId; }
 public void setViewerUserId(Long viewerUserId) { this.viewerUserId = viewerUserId; }
 
 public Long getViewedUserId() { return viewedUserId; }
 public void setViewedUserId(Long viewedUserId) { this.viewedUserId = viewedUserId; }
 
 public LocalDateTime getViewedAt() { return viewedAt; }
 public void setViewedAt(LocalDateTime viewedAt) { this.viewedAt = viewedAt; }
}
