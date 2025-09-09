package com.matrimony.Service;

import com.matrimony.Dao.ProfilePictureDao;
import com.matrimony.Dao.UserDao;
import com.matrimony.Entity.ProfilePicture;
import com.matrimony.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Optional;

@Service
public class ProfilePictureService {

    private final ProfilePictureDao profilePictureDao;
    private final UserDao userDao;

    // Use relative path that works on any machine
    private static final String UPLOAD_DIR = "uploads/profile-pictures/";

    @Autowired
    public ProfilePictureService(ProfilePictureDao profilePictureDao, UserDao userDao) {
        this.profilePictureDao = profilePictureDao;
        this.userDao = userDao;
        // Ensure upload directory exists on service startup
        ensureUploadDirectoryExists();
    }
    
    /**
     * Ensure the upload directory exists
     */
    private void ensureUploadDirectoryExists() {
        try {
            String absolutePath = new File("").getAbsolutePath();
            String fullUploadPath = absolutePath + File.separator + UPLOAD_DIR;
            File directory = new File(fullUploadPath);
            
            if (!directory.exists()) {
                boolean dirCreated = directory.mkdirs();
                if (dirCreated) {
                    System.out.println("Created upload directory: " + fullUploadPath);
                } else {
                    System.err.println("Failed to create upload directory: " + fullUploadPath);
                }
            } else {
                System.out.println("Upload directory already exists: " + fullUploadPath);
            }
        } catch (Exception e) {
            System.err.println("Error ensuring upload directory exists: " + e.getMessage());
        }
    }

    public String saveProfilePicture(MultipartFile file, Long userId) throws IOException {
        // Validate file
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }
        
        // Validate file size (5MB limit)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 5MB limit");
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Invalid file type. Only images are allowed");
        }

        User user = userDao.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // Get absolute path for uploads directory
        String absolutePath = new File("").getAbsolutePath();
        String fullUploadPath = absolutePath + File.separator + UPLOAD_DIR;
        
        // Ensure the upload directory exists
        File directory = new File(fullUploadPath);
        if (!directory.exists()) {
            boolean dirCreated = directory.mkdirs();
            if (!dirCreated) {
                throw new IOException("Failed to create upload directory: " + fullUploadPath);
            }
        }

        // Generate a unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = System.currentTimeMillis() + "_" + userId + fileExtension;
        File destination = new File(directory, fileName);

        // Save the file
        System.out.println("Saving file to: " + destination.getAbsolutePath());
        file.transferTo(destination);

        // Generate file URL
        String fileUrl = "http://localhost:8080/uploads/profile-pictures/" + fileName;

        // Check if a profile picture already exists for the user
        ProfilePicture existingProfilePicture = profilePictureDao.findByUserId(userId);
        ProfilePicture profilePicture;
        
        if (existingProfilePicture == null) {
            profilePicture = new ProfilePicture();
            profilePicture.setUser(user);
        } else {
            profilePicture = existingProfilePicture;
            // Delete old file if it exists
            String oldFileName = existingProfilePicture.getName();
            if (oldFileName != null) {
                File oldFile = new File(directory, oldFileName);
                if (oldFile.exists()) {
                    oldFile.delete();
                }
            }
        }

        profilePicture.setName(fileName);
        profilePicture.setType(file.getContentType());
        profilePicture.setFileUrl(fileUrl);

        profilePictureDao.save(profilePicture);
        System.out.println("Profile picture saved: " + profilePicture);

        return fileUrl;
    }

    public String getProfilePictureUrl(Long userId) {
        ProfilePicture profilePicture = profilePictureDao.findByUserId(userId);
        return (profilePicture != null) ? profilePicture.getFileUrl() : null;
    }
    
    /**
     * Verify that the user is uploading a profile picture for their own account
     */
    public boolean verifyUserOwnership(String userEmail, Long userId) {
        try {
            User user = userDao.findByEmail(userEmail).orElse(null);
            if (user == null) {
                return false;
            }
            return user.getId().equals(userId);
        } catch (Exception e) {
            System.err.println("Error verifying user ownership: " + e.getMessage());
            return false;
        }
    }
}
