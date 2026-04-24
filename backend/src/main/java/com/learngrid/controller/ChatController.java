package com.learngrid.controller;

import com.learngrid.model.ChatMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    // Track active users per course room: courseId -> Set<username>
    private final Map<String, Set<String>> activeUsers = new ConcurrentHashMap<>();

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.sendMessage/{courseId}")
    @SendTo("/topic/course/{courseId}")
    public ChatMessage sendMessage(@DestinationVariable String courseId, @Payload ChatMessage chatMessage) {
        chatMessage.setType(ChatMessage.MessageType.CHAT);
        return chatMessage;
    }

    @MessageMapping("/chat.join/{courseId}")
    @SendTo("/topic/course/{courseId}")
    public ChatMessage joinRoom(@DestinationVariable String courseId, @Payload ChatMessage chatMessage) {
        chatMessage.setType(ChatMessage.MessageType.JOIN);
        chatMessage.setContent(chatMessage.getSender() + " joined the study group!");

        // Track the user
        activeUsers.computeIfAbsent(courseId, k -> ConcurrentHashMap.newKeySet()).add(chatMessage.getSender());
        broadcastActiveUsers(courseId);

        return chatMessage;
    }

    @MessageMapping("/chat.leave/{courseId}")
    @SendTo("/topic/course/{courseId}")
    public ChatMessage leaveRoom(@DestinationVariable String courseId, @Payload ChatMessage chatMessage) {
        chatMessage.setType(ChatMessage.MessageType.LEAVE);
        chatMessage.setContent(chatMessage.getSender() + " left the study group.");

        // Remove user
        Set<String> users = activeUsers.get(courseId);
        if (users != null) {
            users.remove(chatMessage.getSender());
            if (users.isEmpty()) {
                activeUsers.remove(courseId);
            }
        }
        broadcastActiveUsers(courseId);

        return chatMessage;
    }

    @MessageMapping("/chat.typing/{courseId}")
    public void typingIndicator(@DestinationVariable String courseId, @Payload ChatMessage chatMessage) {
        // Broadcast typing event to everyone except sender (handled client-side)
        messagingTemplate.convertAndSend("/topic/course/" + courseId + "/typing", chatMessage);
    }

    private void broadcastActiveUsers(String courseId) {
        Set<String> users = activeUsers.getOrDefault(courseId, Collections.emptySet());
        messagingTemplate.convertAndSend("/topic/course/" + courseId + "/users", new ArrayList<>(users));
    }
}
