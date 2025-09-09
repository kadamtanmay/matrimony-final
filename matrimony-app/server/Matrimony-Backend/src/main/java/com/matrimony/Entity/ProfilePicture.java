package com.matrimony.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profile_pictures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfilePicture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_name")
    private String name;

    @Column(name = "image_type")
    private String type;

    @Column(name = "file_url" )  // Store URL instead of file path
    private String fileUrl;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
