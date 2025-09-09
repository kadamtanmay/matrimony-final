package com.matrimony.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors().configurationSource(corsConfigurationSource())
            .and()
            .csrf().disable() // Disable CSRF for simplicity (adjust if needed)
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests(auth -> auth
                .requestMatchers("/user/signup", "/user/login", "/user/update/**", "/user/matches/find/**").permitAll() // Allow signup and login without authentication
                .requestMatchers("/user/preferences/matches/**").permitAll() // Allow public access to match finding
                .requestMatchers("/profile-picture/**","/uploads/**").permitAll() // Profile picture endpoints require authentication
                .requestMatchers("/api/admin/**").authenticated() // Admin routes require authentication
                .requestMatchers("/user/**").authenticated() // All other user endpoints require authentication
                .requestMatchers("/user/preferences/**").authenticated() // Preferences endpoints require authentication
                .requestMatchers("/messages/**").authenticated() // All message endpoints require authentication
                .requestMatchers("/pending-requests/**").authenticated() // Pending requests require authentication
                .anyRequest().authenticated() // All other routes require authentication
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    // Bean to enable CORS configuration
    @Bean
    public WebConfig corsConfig() {
        return new WebConfig();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
