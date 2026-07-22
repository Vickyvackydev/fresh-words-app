import { createContext, useContext } from "react";

export interface AppContextType {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  hasLaunched: boolean;
  setHasLaunched: (launched: boolean) => void;
  permissionPromptDone: boolean;
  setPermissionPromptDone: (done: boolean) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  readingProgress: Record<string, number>;
  saveProgress: (id: string, progress: number) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  notificationTime: string;
  setNotificationTime: (time: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  feedbackSubmitted: boolean;
  setFeedbackSubmitted: (sub: boolean) => void;
  appSettings: any;
  deviceId: string;
  offlineDevotionals: Record<string, any[]>;
  syncOfflineDevotionals: () => Promise<void>;
  isSyncing: boolean;
  userName: string;
  setUserName: (name: string) => void;
  tappedDevotional: any | null;
  setTappedDevotional: (devotional: any | null) => void;
  devotionalPrefs: Record<string, boolean>;
  setDevotionalPref: (category: string, enabled: boolean) => void;
  activeDevotionalCategory: string;
  setActiveDevotionalCategory: (category: string) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
