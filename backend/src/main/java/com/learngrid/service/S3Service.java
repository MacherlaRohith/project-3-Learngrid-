package com.learngrid.service;

import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.Date;
import java.util.UUID;

@Service
public class S3Service {
    @Autowired(required = false)
    private AmazonS3 s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    /**
     * Generates a pre-signed URL for direct upload from the frontend.
     * @param fileName The name of the file to upload.
     * @return The pre-signed URL.
     */
    public String generatePresignedUrl(String fileName) {
        if (s3Client == null) {
            return "https://mock-s3-upload-url.com/" + fileName + "?signature=mock";
        }
        
        String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;
        
        Date expiration = new Date();
        long expTimeMillis = expiration.getTime();
        expTimeMillis += 1000 * 60 * 15; // 15 minutes validity
        expiration.setTime(expTimeMillis);

        GeneratePresignedUrlRequest generatePresignedUrlRequest =
                new GeneratePresignedUrlRequest(bucketName, uniqueFileName)
                        .withMethod(HttpMethod.PUT)
                        .withExpiration(expiration);

        URL url = s3Client.generatePresignedUrl(generatePresignedUrlRequest);
        return url.toString();
    }
}
