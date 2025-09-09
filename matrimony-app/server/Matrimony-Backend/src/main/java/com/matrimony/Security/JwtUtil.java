package com.matrimony.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import io.jsonwebtoken.security.Keys;
import java.util.Date;

@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secretKey;
    
    @Value("${jwt.expiration}")
    private long expiration;

    // Create JWT token
    public String generateToken(String email) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
        String token = Jwts.builder()
                   .setSubject(email)
                   .setIssuedAt(new Date())
                   .setExpiration(new Date(System.currentTimeMillis() + expiration))
                   .signWith(key)
                   .compact();
        
        
        return token;
    }

    // Get email from token
    public String extractEmail(String token) {
        try {
            Claims claims = getClaims(token);
            String email = claims.getSubject();
            
            return email;
        } catch (Exception e) {
            throw e;
        }
    }

    // Check if token is valid
    public boolean validateToken(String token, String email) {
        try {
            String extractedEmail = extractEmail(token);
            boolean emailMatches = extractedEmail.equals(email);
            boolean notExpired = !isTokenExpired(token);
            boolean isValid = emailMatches && notExpired;
            
            return isValid;
        } catch (Exception e) {
            return false;
        }
    }

    // Check token expiration
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getClaims(token).getExpiration();
            boolean expired = expiration.before(new Date());
            
            
            return expired;
        } catch (Exception e) {
            return true; // Consider expired if can't parse
        }
    }

    // Parse token claims
    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(Keys.hmacShaKeyFor(secretKey.getBytes()))
                .parseClaimsJws(token)
                .getBody();
    }

    // Helper methods
    
    // Same as extractEmail
    public String extractUsername(String token) {
        return extractEmail(token);
    }
    
    // Get token expiration date
    public Date getExpirationDateFromToken(String token) {
        return getClaims(token).getExpiration();
    }
    
    // Get token issued date
    public Date getIssuedAtDateFromToken(String token) {
        return getClaims(token).getIssuedAt();
    }
    
    // Generate token with custom expiration
    public String generateTokenWithCustomExpiration(String email, long customExpiration) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
        return Jwts.builder()
                   .setSubject(email)
                   .setIssuedAt(new Date())
                   .setExpiration(new Date(System.currentTimeMillis() + customExpiration))
                   .signWith(key)
                   .compact();
    }
}
