package com.matrimony.Security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Override
	public void addCorsMappings(CorsRegistry registry) {
	    registry.addMapping("/**")
	            .allowedOrigins("http://localhost:3000")
	            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Add OPTIONS method for preflight requests
	            .allowedHeaders("*")
	            .allowCredentials(true);
	}
	
	@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get the current working directory
        String currentDir = System.getProperty("user.dir");
        String uploadPath = "file:" + currentDir + "/uploads/";
        
        System.out.println("Configuring resource handler for uploads at: " + uploadPath);
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}
