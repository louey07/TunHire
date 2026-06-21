package com.tunhire.tunhire.chat.controller;

import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.chat.ChatConversationDto;
import com.tunhire.tunhire.chat.ChatMessageDto;
import com.tunhire.tunhire.chat.ChatService;
import com.tunhire.tunhire.chat.CreateDirectConversationRequest;
import com.tunhire.tunhire.common.ApiResponse;
import java.security.Principal;
import java.time.Instant;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ChatService chatService;
    private final AuthService authService;

    public ChatController(ChatService chatService, AuthService authService) {
        this.chatService = chatService;
        this.authService = authService;
    }

    @GetMapping("/conversations")
    @PreAuthorize("hasAnyRole('CANDIDATE','RECRUITER','ADMIN')")
    public ApiResponse<List<ChatConversationDto>> listConversations(
        Principal principal
    ) {
        Long userId = authService.getUserIdByEmail(principal.getName());
        return ApiResponse.ok(
            "Conversations fetched",
            chatService.listConversations(userId)
        );
    }

    @PostMapping("/conversations/company/{companyId}")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public ApiResponse<ChatConversationDto> openCompanyConversation(
        @PathVariable Long companyId,
        Principal principal
    ) {
        Long userId = authService.getUserIdByEmail(principal.getName());
        return ApiResponse.ok(
            "Company conversation ready",
            chatService.getOrCreateCompanyConversation(companyId, userId)
        );
    }

    @PostMapping("/conversations/direct")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public ApiResponse<ChatConversationDto> openDirectConversation(
        @RequestBody CreateDirectConversationRequest request,
        Principal principal
    ) {
        Long userId = authService.getUserIdByEmail(principal.getName());
        return ApiResponse.ok(
            "Direct conversation ready",
            chatService.getOrCreateDirectConversation(
                userId,
                request.targetUserId(),
                request.companyId()
            )
        );
    }

    @GetMapping("/conversations/{conversationId}/messages")
    @PreAuthorize("hasAnyRole('CANDIDATE','RECRUITER','ADMIN')")
    public ApiResponse<List<ChatMessageDto>> getMessages(
        @PathVariable Long conversationId,
        @RequestParam(required = false) Instant before,
        @RequestParam(defaultValue = "30") int size,
        Principal principal
    ) {
        Long userId = authService.getUserIdByEmail(principal.getName());
        return ApiResponse.ok(
            "Messages fetched",
            chatService.getMessages(conversationId, userId, before, size)
        );
    }

    @PostMapping("/conversations/{conversationId}/read")
    @PreAuthorize("hasAnyRole('CANDIDATE','RECRUITER','ADMIN')")
    public ApiResponse<Void> markConversationAsRead(
        @PathVariable Long conversationId,
        Principal principal
    ) {
        Long userId = authService.getUserIdByEmail(principal.getName());
        chatService.markConversationAsRead(conversationId, userId);
        return ApiResponse.ok("Conversation marked as read", null);
    }
}
