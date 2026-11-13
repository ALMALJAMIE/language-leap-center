"use client";

import { create } from "zustand";
import { supabase } from "./auth";

/** Everything the learner fills in on the "Complete Your Profile" page */
export interface ProfileData {
  // Personal info
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  // Location & languages
  country?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  address1?: string;
  address2?: string;
  languages?: { name: string; level: string }[];
  // Profile & interests
  about?: string;
  occupation?: string;
  education?: string;
  interests?: string[];
  website?: string;
  socials?: { platform: string; url: string }[];
  // Advanced
  currentLevel?: string;
  motivation?: string;
  classType?: string;
  learningPath?: string;
  goals?: string;
  targetLevel?: string;
  targetDate?: string;
  learningStyles?: string[];
  topics?: string[];
  methods?: string[];
  instructorQualities?: string[];
  timeSlots?: { day: string; from: string; to: string }[];
  needsAccommodation?: boolean;
  accommodationNotes?: string;
}

interface ProfileState {
  data: ProfileData;
  avatar: string | null;
  loaded: boolean;
  /** "cloud" = saved in Supabase, "local" = table missing, saved on this device only */
  storage: "cloud" | "local";
  userId: string | null;
}

export const useProfile = create<ProfileState>(() => ({ data: {}, avatar: null, loaded: false, storage: "cloud", userId: null }));

const localKey = (id: string) => `llc-profile-${id}`;

export async function loadProfile(userId: string | null) {
  if (!userId) {
    useProfile.setState({ data: {}, avatar: null, loaded: true, userId: null });
    return;
  }
  const { data, error } = await supabase.from("learner_profiles").select("data, avatar").eq("user_id", userId).maybeSingle();
  if (error) {
    let local: { data: ProfileData; avatar: string | null } = { data: {}, avatar: null };
    try {
      local = JSON.parse(localStorage.getItem(localKey(userId)) ?? "") ?? local;
    } catch {}
    useProfile.setState({ ...local, loaded: true, storage: "local", userId });
    return;
  }
  useProfile.setState({ data: (data?.data as ProfileData) ?? {}, avatar: data?.avatar ?? null, loaded: true, storage: "cloud", userId });
}

export async function saveProfile(patch: Partial<ProfileData>, avatar?: string | null): Promise<{ ok: boolean; local?: boolean; error?: string }> {
  const s = useProfile.getState();
  if (!s.userId) return { ok: false, error: "Please sign in first." };
  const data = { ...s.data, ...patch };
  const nextAvatar = avatar === undefined ? s.avatar : avatar;
  useProfile.setState({ data, avatar: nextAvatar });

  // keep the display name in the auth account in step with first/last name
  if (patch.firstName !== undefined || patch.lastName !== undefined) {
    const full = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
    if (full) await supabase.auth.updateUser({ data: { full_name: full } });
  }

  const { error } = await supabase
    .from("learner_profiles")
    .upsert({ user_id: s.userId, data, avatar: nextAvatar, updated_at: new Date().toISOString() });
  if (error) {
    try {
      localStorage.setItem(localKey(s.userId), JSON.stringify({ data, avatar: nextAvatar }));
    } catch {}
    useProfile.setState({ storage: "local" });
    return { ok: true, local: true };
  }
  useProfile.setState({ storage: "cloud" });
  return { ok: true };
}

/** Shrinks a photo to a 256px square JPEG so it can be stored with the profile */
export function resizeImage(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d")!;
      const s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/** Which fields count toward "% complete" */
const tracked: (keyof ProfileData)[] = [
  "firstName", "lastName", "username", "phone", "dob", "gender",
  "country", "city", "languages",
  "about", "occupation", "education", "interests",
  "currentLevel", "motivation", "classType", "learningPath", "goals", "targetLevel", "learningStyles", "topics",
];

const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && String(v).trim() !== "");

export function completion(data: ProfileData, avatar: string | null) {
  const n = tracked.filter((k) => filled(data[k])).length + (avatar ? 1 : 0);
  return Math.round((n / (tracked.length + 1)) * 100);
}

export const sectionDone = {
  personal: (d: ProfileData) => ["firstName", "lastName", "username"].every((k) => filled(d[k as keyof ProfileData])),
  location: (d: ProfileData) => filled(d.country) && filled(d.languages),
  interests: (d: ProfileData) => filled(d.about) || filled(d.interests),
  advanced: (d: ProfileData) => filled(d.currentLevel) && filled(d.learningPath),
};
