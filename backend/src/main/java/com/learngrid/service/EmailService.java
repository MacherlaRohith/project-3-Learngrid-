package com.learngrid.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        System.out.println("--------------------------------------------------");
        System.out.println("SENDING EMAIL TO: " + to);
        System.out.println("SUBJECT: " + subject);
        System.out.println("BODY: " + body);
        System.out.println("--------------------------------------------------");

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                System.out.println("Email sent successfully via JavaMailSender.");
            } catch (Exception e) {
                System.err.println("Failed to send email via SMTP: " + e.getMessage());
            }
        } else {
            System.out.println("SMTP not configured. Email logged to console.");
        }
    }

    public void sendPasswordResetEmail(String to, String resetLink) {
        String subject = "LearnGrid - Password Reset Request";
        String body = "You requested a password reset for your LearnGrid account.\n\n" +
                      "Click the link below to reset your password:\n" +
                      resetLink + "\n\n" +
                      "If you did not request this, please ignore this email.";
        sendEmail(to, subject, body);
    }
}
