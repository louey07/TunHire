"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getNotificationBadges,
  type NotificationBadges,
} from "@/lib/notifications/api";

const EMPTY_BADGES: NotificationBadges = {
  chatUnread: 0,
  newApplications: 0,
  applicationUpdates: 0,
};

const POLL_MS = 30_000;

export function useSidebarBadges(companyId?: number | null, enabled = true) {
  const [badges, setBadges] = useState<NotificationBadges>(EMPTY_BADGES);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setBadges(EMPTY_BADGES);
      return;
    }
    const res = await getNotificationBadges(companyId ?? undefined);
    if (res.success && res.data) {
      setBadges(res.data);
    }
  }, [companyId, enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;

    const interval = window.setInterval(() => {
      void refresh();
    }, POLL_MS);

    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled, refresh]);

  return { badges, refresh };
}
