package com.learngrid.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    private String sender;
    private String content;
    private String timestamp;
    private MessageType type;

    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE,
        TYPING
    }
}
