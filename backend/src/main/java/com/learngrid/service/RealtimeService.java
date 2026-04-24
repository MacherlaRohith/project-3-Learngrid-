package com.learngrid.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class RealtimeService {

    private static final Logger logger = LoggerFactory.getLogger(RealtimeService.class);
    private final SimpMessagingTemplate messagingTemplate;

    public RealtimeService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Notify all admins connected to the dashboard that data has changed.
     */
    public void notifyAdminDashboard() {
        try {
            messagingTemplate.convertAndSend("/topic/admin/updates", "UPDATE_AVAILABLE");
            logger.debug("Broadcasted admin dashboard update.");
        } catch (Exception e) {
            logger.error("Failed to broadcast admin update", e);
        }
    }

    /**
     * Notify a specific instructor that their dashboard data has changed.
     */
    public void notifyInstructorDashboard(Long instructorId) {
        try {
            messagingTemplate.convertAndSend("/topic/instructor/" + instructorId + "/updates", "UPDATE_AVAILABLE");
            logger.debug("Broadcasted instructor dashboard update for instructor {}", instructorId);
        } catch (Exception e) {
            logger.error("Failed to broadcast instructor update for {}", instructorId, e);
        }
    }
}
