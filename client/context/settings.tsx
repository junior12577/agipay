import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Notifications = {
  email: boolean;
  sms: boolean;
  push: boolean;
};

export type Limits = {
  pixDaily: number;
  transferDaily: number;
  cardSingle: number;
};

export type Settings = {
  notifications: Notifications;
  limits: Limits;
  password: string; // demo only, stored local
  twoFactor: boolean;
};

const STORAGE_KEY = "agipay:settings";

const defaultSettings: Settings = {
  notifications: { email: true, sms: false, push: true },
  limits: { pixDaily: 2000, transferDaily: 5000, cardSingle: 1500 },
  password: "",
  twoFactor: false,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...(JSON.parse(raw) as Settings) };
  } catch {}
  return defaultSettings;
}

function save(v: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {}
}

export type SettingsContextValue = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  updateNotifications: (patch: Partial<Notifications>) => void;
  updateLimits: (patch: Partial<Limits>) => void;
  changePassword: (oldPwd: string, newPwd: string) => { ok: boolean; reason?: string };
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => load());

  useEffect(() => {
    save(settings);
  }, [settings]);

  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));
  const updateNotifications = (patch: Partial<Notifications>) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, ...patch } }));
  const updateLimits = (patch: Partial<Limits>) => setSettings((s) => ({ ...s, limits: { ...s.limits, ...patch } }));

  const changePassword = (oldPwd: string, newPwd: string) => {
    if (!newPwd) return { ok: false, reason: "Nova senha inválida" };
    if (settings.password && oldPwd !== settings.password) return { ok: false, reason: "Senha atual incorreta" };
    setSettings((s) => ({ ...s, password: newPwd }));
    return { ok: true };
  };

  const value = useMemo(() => ({ settings, update, updateNotifications, updateLimits, changePassword }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
