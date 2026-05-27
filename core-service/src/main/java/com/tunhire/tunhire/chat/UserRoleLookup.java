package com.tunhire.tunhire.chat;

import com.tunhire.tunhire.auth.entity.Role;

public interface UserRoleLookup {
    Role getRole(Long userId);
}
