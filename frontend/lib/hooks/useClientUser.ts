"use client";

import { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import type { User } from "@/lib/types";

/** Reads auth from localStorage only after mount to avoid SSR hydration mismatches. */
export function useClientUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setReady(true);
  }, []);

  return { user, ready };
}
