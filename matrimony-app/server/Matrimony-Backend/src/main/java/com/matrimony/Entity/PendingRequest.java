package com.matrimony.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pendingrequest")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PendingRequest {
    
    // Status constants
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_ACCEPTED = "ACCEPTED";
    public static final String STATUS_REJECTED = "REJECTED";
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(nullable = false)
    private String status; // e.g. "PENDING", "ACCEPTED", "REJECTED"

    @Column(nullable = false)
    private LocalDateTime timestamp;

    // Constructors
    public PendingRequest(User sender, User receiver, String status) {
        this.sender = sender;
        this.receiver = receiver;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }
}
