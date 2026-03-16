import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Gender = "male" | "female";
export type Ethnicity = "caucasian" | "african" | "asian" | "hispanic" | "middle-eastern" | "south-asian";

export interface UserProfile {
  gender: Gender;
  ethnicity: Ethnicity;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
  hasCompletedOnboarding: boolean;
}

const STORAGE_KEY = "glowmax_user_profile";

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setProfile = (p: UserProfile) => {
    setProfileState(p);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  };

  const clearProfile = () => {
    setProfileState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <UserProfileContext.Provider value={{ profile, setProfile, clearProfile, hasCompletedOnboarding: !!profile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
};
