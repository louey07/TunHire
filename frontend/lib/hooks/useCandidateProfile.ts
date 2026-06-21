"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPostForm,
  apiPut,
} from "@/lib/api";
import { getToken, getUser, updateStoredUser } from "@/lib/auth";
import type { CandidateProfile, User } from "@/lib/types";

export function useCandidateProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [cvFileName, setCvFileName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    availableFrom: "",
    yearsOfExperience: 0,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [addingSkill, setAddingSkill] = useState(false);
  const [skillMsg, setSkillMsg] = useState("");
  const [cvParsing, setCvParsing] = useState(false);
  const [cvMsg, setCvMsg] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, userRes] = await Promise.all([
        apiGet<CandidateProfile>("/candidates/me"),
        apiGet<User>("/auth/me"),
      ]);

      if (userRes.success && userRes.data) {
        setFirstName(userRes.data.firstName);
        setLastName(userRes.data.lastName);
        updateStoredUser(userRes.data);
      }

      if (!profileRes.success || !profileRes.data) return;
      const data = profileRes.data;
      setProfile(data);
      const user = userRes.success && userRes.data ? userRes.data : getUser();
      setEditForm({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        bio: data.bio || "",
        location: data.location || "",
        availableFrom: data.availableFrom ? String(data.availableFrom) : "",
        yearsOfExperience: data.yearsOfExperience || 0,
      });
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    const user = getUser();
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName || "");
    }
    void loadProfile();
  }, [loadProfile, router]);

  async function saveProfile() {
    setSavingProfile(true);
    setProfileMsg("");
    try {
      const trimmedFirst = editForm.firstName.trim();
      const trimmedLast = editForm.lastName.trim();
      if (!trimmedFirst || !trimmedLast) {
        setProfileMsg("Le prénom et le nom sont requis.");
        return;
      }

      const nameRes = await apiPut<User>("/auth/me", {
        firstName: trimmedFirst,
        lastName: trimmedLast,
      });
      if (!nameRes.success || !nameRes.data) {
        setProfileMsg(nameRes.message || "Erreur lors de la mise à jour du nom.");
        return;
      }
      setFirstName(nameRes.data.firstName);
      setLastName(nameRes.data.lastName);
      updateStoredUser(nameRes.data);

      const payload = {
        bio: editForm.bio || null,
        location: editForm.location || null,
        availableFrom: editForm.availableFrom || null,
        yearsOfExperience:
          editForm.yearsOfExperience > 0 ? editForm.yearsOfExperience : null,
      };
      const res = await apiPut("/candidates/me", payload);
      if (!res.success) {
        setProfileMsg("Erreur lors de la mise à jour du profil.");
        return;
      }
      await loadProfile();
      setEditMode(false);
      setProfileMsg("Profil mis à jour.");
      setTimeout(() => setProfileMsg(""), 3000);
    } catch {
      setProfileMsg("Erreur de connexion.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function addSkills() {
    const names = newSkill
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!names.length || !profile) return;
    setAddingSkill(true);
    setSkillMsg("");
    const existing = profile.skills.map((s) => s.skillName.toLowerCase());
    const toAdd = names.filter((n) => !existing.includes(n.toLowerCase()));
    if (!toAdd.length) {
      setSkillMsg("Ces compétences existent déjà.");
      setNewSkill("");
      setAddingSkill(false);
      return;
    }
    let anyError = false;
    for (const name of toAdd) {
      const res = await apiPost<{ id: number; skillName: string }>(
        "/candidates/me/skills",
        { skillName: name },
      );
      if (!res.success || !res.data) anyError = true;
    }
    setNewSkill("");
    if (anyError) setSkillMsg("Erreur lors de l'ajout.");
    await loadProfile();
    setAddingSkill(false);
  }

  async function deleteSkill(id: number) {
    const res = await apiDelete(`/candidates/me/skills/${id}`);
    if (res.success) await loadProfile();
  }

  async function handleCVFile(file: File) {
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setCvMsg("Seuls les fichiers PDF sont acceptés.");
      return;
    }

    setCvParsing(true);
    setCvMsg("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await apiPostForm<CandidateProfile>(
        "/candidates/me/cv/parse",
        form,
      );
      if (res.success && res.data) {
        setProfile(res.data);
        setCvUploaded(true);
        setCvFileName(file.name);
        const skillCount = res.data.skills?.length ?? 0;
        if (skillCount > 0) {
          setCvMsg(
            `CV importé — ${skillCount} compétence${skillCount > 1 ? "s" : ""} ajoutée${skillCount > 1 ? "s" : ""}.`,
          );
        } else {
          setCvMsg(
            "CV importé, mais aucune compétence n'a été détectée. Vérifiez que le service IA tourne avec GROQ_API_KEY, ou ajoutez vos compétences manuellement.",
          );
        }
        setEditForm((prev) => ({
          ...prev,
          location: res.data?.location || prev.location,
          yearsOfExperience:
            res.data?.yearsOfExperience ?? prev.yearsOfExperience,
        }));
        await loadProfile();
      } else {
        setCvMsg(
          res.message ||
            "Erreur lors de l'import. Vérifiez que le service IA est démarré (port 8000).",
        );
      }
    } catch {
      setCvMsg("Erreur de connexion.");
    } finally {
      setCvParsing(false);
    }
  }

  const skills = profile?.skills || [];
  const cvLoaded = !!(profile?.hasResume || profile?.resumeUrl) || cvUploaded;
  const profileScore = Math.min(
    100,
    40 + skills.length * 6 + (cvLoaded ? 20 : 0) + (profile?.bio ? 10 : 0),
  );

  return {
    profile,
    firstName,
    lastName,
    loading,
    cvLoaded,
    cvFileName,
    editMode,
    setEditMode,
    editForm,
    setEditForm,
    savingProfile,
    profileMsg,
    setProfileMsg,
    saveProfile,
    newSkill,
    setNewSkill,
    addingSkill,
    skillMsg,
    addSkills,
    deleteSkill,
    cvParsing,
    cvMsg,
    handleCVFile,
    skills,
    profileScore,
  };
}
