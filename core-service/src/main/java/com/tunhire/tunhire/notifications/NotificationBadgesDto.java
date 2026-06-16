package com.tunhire.tunhire.notifications;

public record NotificationBadgesDto(
    long chatUnread,
    long newApplications,
    long applicationUpdates
) {}
