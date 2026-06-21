"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api";
import { getToken, getUser, updateStoredUser } from "@/lib/auth";
import type { User } from "@/lib/types";

export function useUserAccount() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<User>("/auth/me");
      if (!res.success || !res.data) {
        const cached = getUser();
        if (cached) {
          setFirstName(cached.firstName);
          setLastName(cached.lastName);
          setEmail(cached.email);
        }
        setError(res.message || "Impossible de charger le compte.");
        return;
      }
      setFirstName(res.data.firstName);
      setLastName(res.data.lastName);
      setEmail(res.data.email);
      updateStoredUser(res.data);
    } catch {
      const cached = getUser();
      if (cached) {
        setFirstName(cached.firstName);
        setLastName(cached.lastName);
        setEmail(cached.email);
      }
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    void loadUser();
  }, [loadUser]);

  async function saveName(nextFirstName: string, nextLastName: string) {
    const trimmedFirst = nextFirstName.trim();
    const trimmedLast = nextLastName.trim();
    if (!trimmedFirst || !trimmedLast) {
      setError("Le prénom et le nom sont requis.");
      return false;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await apiPut<User>("/auth/me", {
        firstName: trimmedFirst,
        lastName: trimmedLast,
      });
      if (!res.success || !res.data) {
        setError(res.message || "Impossible de mettre à jour le nom.");
        return false;
      }
      setFirstName(res.data.firstName);
      setLastName(res.data.lastName);
      setEmail(res.data.email);
      updateStoredUser(res.data);
      setMessage("Nom mis à jour.");
      setTimeout(() => setMessage(""), 3000);
      return true;
    } catch {
      setError("Erreur de connexion.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    firstName,
    lastName,
    email,
    loading,
    saving,
    message,
    error,
    setError,
    setMessage,
    loadUser,
    saveName,
  };
}
