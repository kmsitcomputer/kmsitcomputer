import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  buildSeedDB, isValidHex, loadDB, loadSession, saveDB, saveSession, shadeScale, uid, wipeAll,
  type DB, type Lang, type Role, type User,
} from "./db";
import { translate } from "./i18n";
import { API_URL, apiConfigured, checkApiHealth } from "./api";
import { AuthApi, InstallApi } from "./services";

export interface Toast { id: string; msg: string; tone: "ok" | "bad" | "info" | "warn"; }
export interface ApiState { enabled: boolean; baseUrl: string; online: boolean | null; detail: string; }

interface Store {
  db: DB | null;
  user: User | null;
  theme: "light" | "dark";
  lang: Lang;
  toasts: Toast[];
  api: ApiState;
  checkApi: () => Promise<ApiState>;
  setTheme: (t: "light" | "dark") => void;
  setLang: (l: Lang) => void;
  update: (fn: (d: DB) => void) => void;
  login: (email: string, pw: string) => Promise<string | null>;
  register: (name: string, email: string, pw: string) => string | null;
  googleSignIn: (name: string, email: string) => string | null;
  logout: () => void;
  toast: (msg: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: string) => void;
  t: (key: string) => string;
  can: (perm: string) => boolean;
  notify: (userId: string, title: string, body: string) => void;
  log: (action: string, detail: string) => void;
  install: (admin: { name: string; email: string; password: string }, site: { siteName: string; slogan: string; email: string; phone: string; address: string; timezone: string; language: Lang; currency: string }) => void;
  reset: () => void;
}

const Ctx = createContext<Store>(null!);
export const useApp = () => useContext(Ctx);

const PALETTE = ["#0e8a75", "#3e8fc4", "#dd8f22", "#8a5cc0", "#c04f7e", "#2f9e63", "#b57708", "#b53943"];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB | null>(() => loadDB());
  const [sessionId, setSessionId] = useState<string | null>(() => loadSession());
  const [theme, setThemeState] = useState<"light" | "dark">(() => (localStorage.getItem("kmsit_theme") as "light" | "dark") || "light");
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("kmsit_lang") as Lang) || "id");
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("kmsit_theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("kmsit_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    if (!db) return;
    document.title = db.settings.seo.title || `${db.settings.siteName} — LMS & CMS Platform`;
    const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (link && db.settings.faviconUrl) link.href = db.settings.faviconUrl;
    else if (link) link.href = "icon.svg";
  }, [db?.settings.siteName, db?.settings.seo.title, db?.settings.faviconUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Warna identitas website → override CSS variables tema secara live
  useEffect(() => {
    const el = document.documentElement;
    const brand = shadeScale(isValidHex(db?.settings.brandColor ?? "") ? db!.settings.brandColor : "#17a58c");
    const accent = shadeScale(isValidHex(db?.settings.accentColor ?? "") ? db!.settings.accentColor : "#e8a33d");
    for (const [k, v] of Object.entries(brand)) el.style.setProperty(`--color-brand-${k}`, v);
    for (const [k, v] of Object.entries(accent)) el.style.setProperty(`--color-accent-${k}`, v);
  }, [db?.settings.brandColor, db?.settings.accentColor]); // eslint-disable-line react-hooks/exhaustive-deps

  const toast = useCallback((msg: string, tone: Toast["tone"] = "ok") => {
    const id = uid();
    setToasts((p) => [...p, { id, msg, tone }]);
    window.setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3800);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const update = useCallback((fn: (d: DB) => void) => {
    setDb((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      fn(next);
      saveDB(next);
      return next;
    });
  }, []);

  const user = useMemo(() => (db && sessionId ? db.users.find((u) => u.id === sessionId) ?? null : null), [db, sessionId]);

  // ── Status koneksi Laravel API + MySQL (dari VITE_API_URL di .env) ───────
  const [api, setApi] = useState<ApiState>({ enabled: apiConfigured(), baseUrl: API_URL, online: null, detail: "" });
  const checkApi = useCallback(async () => {
    const r = await checkApiHealth();
    const next: ApiState = { enabled: apiConfigured(), baseUrl: API_URL, online: r.online, detail: r.detail };
    setApi(next);
    return next;
  }, []);
  useEffect(() => { if (apiConfigured()) void checkApi(); }, [checkApi]);

  const login = useCallback(async (email: string, pw: string): Promise<string | null> => {
    if (!db) return "not-installed";

    // Mode API: otentikasi lewat Laravel (Sanctum) → MySQL.
    if (api.online) {
      try {
        const remote = await AuthApi.login(email, pw);
        const role = (["super_admin", "admin", "instructor", "student"].includes(remote.role) ? remote.role : "student") as Role;
        const mirror: User = {
          id: String(remote.id), name: remote.name, email: remote.email.toLowerCase(),
          password: `api:${remote.id}`, role, color: remote.color ?? "#0e8a75",
          joined: new Date().toISOString(), status: (remote.status as "active" | "suspended") ?? "active",
        };
        update((d) => {
          const i = d.users.findIndex((x) => x.email.toLowerCase() === mirror.email);
          if (i >= 0) d.users[i] = { ...d.users[i], ...mirror, password: d.users[i].password };
          else d.users.push(mirror);
        });
        saveSession(mirror.id); setSessionId(mirror.id);
        toast(translate(lang, "toast.loginOk"), "ok");
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : translate(lang, "toast.loginFail");
      }
    }

    // Mode lokal tertanam (tanpa backend / VITE_API_URL kosong)
    const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || u.password !== pw) return translate(lang, "toast.loginFail");
    if (u.status === "suspended") return "Akun ditangguhkan. Hubungi administrator.";
    saveSession(u.id); setSessionId(u.id);
    toast(translate(lang, "toast.loginOk"), "ok");
    return null;
  }, [db, api.online, lang, toast, update]);

  const register = useCallback((name: string, email: string, pw: string): string | null => {
    if (!db) return "not-installed";
    if (!db.settings.registrationOpen) return "Pendaftaran sedang ditutup oleh administrator.";
    if (db.users.some((x) => x.email.toLowerCase() === email.trim().toLowerCase())) return "Email sudah terdaftar.";
    const nu: User = {
      id: uid(), name: name.trim(), email: email.trim().toLowerCase(), password: pw,
      role: "student", color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      joined: new Date().toISOString(), status: "active",
    };
    update((d) => {
      d.users.push(nu);
      d.logs.unshift({ id: uid(), userId: nu.id, userName: nu.name, action: "user_created", detail: `Akun siswa “${nu.name}” dibuat`, date: new Date().toISOString() });
    });
    saveSession(nu.id); setSessionId(nu.id);
    toast("Akun berhasil dibuat. Selamat belajar!", "ok");
    return null;
  }, [db, update, toast]);

  const googleSignIn = useCallback((name: string, email: string): string | null => {
    // Alur OAuth Google: di produksi tukar dengan redirect OAuth + token verification di backend.
    // Role donatur tidak ada di platform — akun Google publik dipetakan ke role Siswa.
    if (!db) return "not-installed";
    const clean = email.trim().toLowerCase();
    const existing = db.users.find((x) => x.email.toLowerCase() === clean);
    if (existing) {
      if (existing.status === "suspended") return "Akun ditangguhkan. Hubungi administrator.";
      saveSession(existing.id); setSessionId(existing.id);
      toast(`Selamat datang kembali, ${existing.name.split(" ")[0]}!`, "ok");
      return null;
    }
    if (!db.settings.registrationOpen) return "Pendaftaran sedang ditutup oleh administrator.";
    const nu: User = {
      id: uid(), name: name.trim() || clean.split("@")[0], email: clean, password: `gauth:${uid()}`,
      role: "student", color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      joined: new Date().toISOString(), status: "active",
    };
    update((d) => {
      d.users.push(nu);
      d.logs.unshift({ id: uid(), userId: nu.id, userName: nu.name, action: "user_created", detail: `Akun siswa “${nu.name}” dibuat via Google`, date: new Date().toISOString() });
    });
    saveSession(nu.id); setSessionId(nu.id);
    toast("Login Google berhasil. Selamat belajar!", "ok");
    return null;
  }, [db, update, toast]);

  const logout = useCallback(() => {
    saveSession(null); setSessionId(null);
    toast(translate(lang, "toast.logout"), "info");
  }, [lang, toast]);

  const t = useCallback((key: string) => translate(lang, key), [lang]);
  const can = useCallback((perm: string) => {
    if (!db || !user) return false;
    if (user.role === "super_admin") return true;
    return db.roles.find((r) => r.role === user.role)?.permissions.includes(perm) ?? false;
  }, [db, user]);

  const notify = useCallback((userId: string, title: string, body: string) => {
    update((d) => { d.notifications.unshift({ id: uid(), userId, title, body, date: new Date().toISOString(), read: false }); });
  }, [update]);

  const log = useCallback((action: string, detail: string) => {
    if (!user) return;
    update((d) => { d.logs.unshift({ id: uid(), userId: user.id, userName: user.name, action, detail, date: new Date().toISOString() }); });
  }, [user, update]);

  const install = useCallback((admin: { name: string; email: string; password: string }, site: { siteName: string; slogan: string; email: string; phone: string; address: string; timezone: string; language: Lang; currency: string }) => {
    const fresh = buildSeedDB(admin);
    fresh.settings = { ...fresh.settings, ...site };
    fresh.locked = true;
    localStorage.setItem("kmsit_installed_lock", new Date().toISOString());
    saveDB(fresh); setDb(fresh);
    // Sinkronkan instalasi ke Laravel + MySQL bila Mode API aktif (best-effort).
    if (api.online) {
      InstallApi.run({ admin, site: site as unknown as Record<string, string>, database: { driver: "mysql" } }).catch(() => { /* tetap sukses lokal */ });
    }
  }, [api.online]);

  const reset = useCallback(() => {
    wipeAll(); setDb(null); setSessionId(null);
  }, []);

  const value: Store = {
    db, user, theme, lang, toasts, api, checkApi,
    setTheme: setThemeState, setLang: setLangState,
    update, login, register, googleSignIn, logout, toast, dismissToast, t, can, notify, log, install, reset,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
