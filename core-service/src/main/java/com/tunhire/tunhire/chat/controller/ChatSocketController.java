package com.tunhire.tunhire.chat.controller;

import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.chat.ChatSendMessageRequest;
import com.tunhire.tunhire.chat.ChatService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatSocketController {

    private final ChatService chatService;
    private final AuthService authService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatSocketController(
        ChatService chatService,
        AuthService authService,
        SimpMessagingTemplate messagingTemplate
    ) {
        this.chatService = chatService;
        this.authService = authService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat/conversations/{conversationId}/send")
    public void sendMessage(
        @DestinationVariable Long conversationId,
        @Payload ChatSendMessageRequest request,
        Principal principal
    ) {
        Long senderUserId = authService.getUserIdByEmail(principal.getName());
        var message = chatService.sendMessage(
            conversationId,
            senderUserId,
            request.body()
        );
        messagingTemplate.convertAndSend(
            "/topic/chat/conversations/" + conversationId,
            message
        );
    }
}
