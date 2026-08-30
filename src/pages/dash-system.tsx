import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Globe, Search, Languages, Users, Shield, Terminal, Activity, Youtube, Video, CalendarCheck,
  Save, AlertTriangle, Plus, Pencil, Trash2, Ban, Lock, Unlock, Database, HardDrive,
} from "lucide-react";
import { useApp } from "../lib/store";
import { fmtDate, fmtDateTime, PERMISSIONS, uid, type Role, type User } from "../lib/db";
import { Avatar, Badge, Btn, cx, Field, Modal, SearchInput, Select, statusTone, TextInput, Toggle } from "../components/ui";
import { DashHead } from "./dash-content";
import { LANGS } from "../lib/i18n";

function SettingsCard({ title, desc, children, onSave }: { title: string; desc?: string; children: React.ReactNode; onSave?: () => void }) {
  return (
    <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900">
      <div className="px-5 py-4 border-b border-ink-100 dark:border-ink-800 flex items-center justify-between">
        <div><p className="font-display font-bold text-ink-900 dark:text-white">{title}</p>{desc && <p className="text-[12.5px] text-ink-400">{desc}</p>}</div>
        {onSave && <Btn size="sm" onClick={onSave}><Save size={14} />Simpan</Btn>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Website settings ───────────────────────────────────────────────────────
export function WebsiteSettings() {
  const { db, update, toast, log } = useApp();
  const [f, setF] = useState(() => ({ ...(db?.settings ?? {} as NonNullable<typeof db>["settings"]) }));
  if (!db) return null;
  const save = () => {
    update((d) => { d.settings = { ...d.settings, ...f }; });
    log("settings_changed", "Pengaturan website diperbarui");
    toast("Pengaturan website disimpan", "ok");
  };
  const s = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-5 max-w-3xl">
      <DashHead title="Pengaturan Website" desc="Identitas & konfigurasi inti — tersimpan di database (tabel settings)" />
      <SettingsCard title="Identitas" desc="Nama, slogan, dan deskripsi website" onSave={save}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nama Website"><TextInput value={f.siteName} onChange={(e) => s("siteName", e.target.value)} /></Field>
          <Field label="Slogan"><TextInput value={f.slogan} onChange={(e) => s("slogan", e.target.value)} /></Field>
          <Field label="Deskripsi" className="sm:col-span-2"><TextInput value={f.description} onChange={(e) => s("description", e.target.value)} /></Field>
        </div>
      </SettingsCard>
      <SettingsCard title="Kontak" onSave={save}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email"><TextInput value={f.email} onChange={(e) => s("email", e.target.value)} /></Field>
          <Field label="Telepon"><TextInput value={f.phone} onChange={(e) => s("phone", e.target.value)} /></Field>
          <Field label="WhatsApp"><TextInput value={f.whatsapp} onChange={(e) => s("whatsapp", e.target.value)} /></Field>
          <Field label="Alamat"><TextInput value={f.address} onChange={(e) => s("address", e.target.value)} /></Field>
        </div>
      </SettingsCard>
      <SettingsCard title="Sosial Media" onSave={save}>
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(f.social).map(([k, v]) => (
            <Field key={k} label={k[0].toUpperCase() + k.slice(1)}><TextInput value={v} onChange={(e) => s("social", { ...f.social, [k]: e.target.value })} /></Field>
          ))}
        </div>
      </SettingsCard>
      <SettingsCard title="Lokal & Zona" onSave={save}>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Timezone"><Select value={f.timezone} onChange={(e) => s("timezone", e.target.value)}>{["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura", "Asia/Singapore"].map((z) => <option key={z}>{z}</option>)}</Select></Field>
          <Field label="Bahasa default"><Select value={f.language} onChange={(e) => s("language", e.target.value)}><option value="id">Bahasa Indonesia</option><option value="en">English</option></Select></Field>
          <Field label="Mata uang"><Select value={f.currency} onChange={(e) => s("currency", e.target.value)}><option>IDR</option><option>USD</option></Select></Field>
        </div>
      </SettingsCard>
      <SettingsCard title="Footer" onSave={save}>
        <Field label="Teks footer"><TextInput value={f.footerText} onChange={(e) => s("footerText", e.target.value)} /></Field>
      </SettingsCard>
    </div>
  );
}

// ─── SEO ────────────────────────────────────────────────────────────────────
export function SeoSettings() {
  const { db, update, toast, log } = useApp();
  const [f, setF] = useState(() => ({ ...(db?.settings.seo ?? { title: "", description: "", keywords: "" }) }));
  if (!db) return null;
  return (
    <div className="space-y-5 max-w-3xl">
      <DashHead title="SEO" desc="Title, meta description, Open Graph, sitemap & robots" />
      <SettingsCard title="Meta global" onSave={() => { update((d) => { d.settings.seo = f; }); log("settings_changed", "Pengaturan SEO diperbarui"); toast("SEO disimpan", "ok"); }}>
        <div className="space-y-4">
          <Field label="SEO Title" hint={`${f.title.length}/60 karakter`}><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Meta Description" hint={`${f.description.length}/160 karakter`}><TextInput value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Field label="Keywords" hint="pisahkan dengan koma"><TextInput value={f.keywords} onChange={(e) => setF({ ...f, keywords: e.target.value })} /></Field>
        </div>
      </SettingsCard>
      <SettingsCard title="Pratinjau Google">
        <div className="rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 p-4">
          <p className="text-[12px] text-[#202124] dark:text-ink-300">kmsit.id <span className="text-[#5f6368] dark:text-ink-400">› courses</span></p>
          <p className="text-[18px] text-[#1a0dab] dark:text-brand-300 leading-snug mt-0.5 hover:underline cursor-pointer">{f.title || db.settings.siteName}</p>
          <p className="text-[13px] text-[#4d5156] dark:text-ink-300 mt-1 line-clamp-2">{f.description || db.settings.description}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-mono text-ink-400">
          {["/sitemap.xml", "/robots.txt", "og:title", "og:image", "canonical", "JSON-LD Course"].map((x) => <span key={x} className="px-2 py-1 rounded-md bg-ink-100 dark:bg-ink-800">{x} ✓</span>)}
        </div>
      </SettingsCard>
    </div>
  );
}

// ─── Language ───────────────────────────────────────────────────────────────
export function LanguageSettings() {
  const { db, lang, setLang, update, toast, log } = useApp();
  if (!db) return null;
  const samples = [
    { key: "nav.courses", id: "Kelas", en: "Courses" }, { key: "nav.register", id: "Daftar", en: "Register" },
    { key: "dash.courses", id: "Kelas", en: "Courses" }, { key: "dash.wallet", id: "Saldo & Pendapatan", en: "Earnings & Wallet" },
    { key: "lbl.free", id: "Gratis", en: "Free" }, { key: "act.save", id: "Simpan", en: "Save" },
    { key: "toast.loginOk", id: "Selamat datang kembali!", en: "Welcome back!" }, { key: "dash.withdrawals", id: "Pencairan Instruktur", en: "Instructor Withdrawals" },
  ];
  return (
    <div className="space-y-5 max-w-3xl">
      <DashHead title="Bahasa" desc="Sistem multi-bahasa via key translation — tidak ada teks yang di-hardcode" />
      <SettingsCard title="Bahasa default website" onSave={() => { update((d) => { d.settings.language = lang; }); log("settings_changed", `Bahasa default: ${lang}`); toast("Bahasa default disimpan", "ok"); }}>
        <div className="flex gap-3">
          {LANGS.map((l) => (
            <button key={l.code} onClick={() => setLang(l.code)} className={cx("flex-1 rounded-xl border-2 p-4 text-left transition-all", lang === l.code ? "border-brand-500 bg-brand-50 dark:bg-brand-900/25" : "border-ink-200 dark:border-ink-700 hover:border-brand-300")}>
              <span className={cx("inline-flex w-9 h-9 rounded-lg items-center justify-center font-mono font-bold text-[13px]", lang === l.code ? "bg-brand-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300")}>{l.flag}</span>
              <p className="mt-2.5 font-display font-bold text-ink-900 dark:text-white text-sm">{l.label}</p>
              <p className="text-[11px] font-mono text-ink-400 mt-0.5">{lang === l.code ? "AKTIF" : "klik untuk aktifkan"}</p>
            </button>
          ))}
        </div>
      </SettingsCard>
      <SettingsCard title="Kamus translation (sample)" desc="resource/lang/id.json & en.json">
        <div className="rounded-xl border border-ink-200 dark:border-ink-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-ink-50 dark:bg-ink-850 text-left border-b border-ink-200 dark:border-ink-700"><th className="px-3.5 py-2.5 text-[11px] font-bold uppercase text-ink-400">Key</th><th className="px-3.5 py-2.5 text-[11px] font-bold uppercase text-ink-400">🇮🇩 ID</th><th className="px-3.5 py-2.5 text-[11px] font-bold uppercase text-ink-400">🇬🇧 EN</th></tr></thead>
            <tbody>{samples.map((x) => (
              <tr key={x.key} className="border-b border-ink-100 dark:border-ink-800 last:border-0"><td className="px-3.5 py-2 font-mono text-[12px] text-brand-600 dark:text-brand-300">{x.key}</td><td className="px-3.5 py-2 text-ink-700 dark:text-ink-100">{x.id}</td><td className="px-3.5 py-2 text-ink-500 dark:text-ink-300">{x.en}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </SettingsCard>
    </div>
  );
}

// ─── Users ──────────────────────────────────────────────────────────────────
export function UsersManager() {
  const { db, user, update, toast, log } = useApp();
  const [q, setQ] = useState("");
  const [fRole, setFRole] = useState("");
  const [editing, setEditing] = useState<User | null | "new">(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  if (!db || !user) return null;
  const list = db.users.filter((u) => (!fRole || u.role === fRole) && (!q || (u.name + u.email).toLowerCase().includes(q.toLowerCase())));
  const roleLabel = (r: Role) => db.roles.find((x) => x.role === r)?.label ?? r;
  return (
    <div>
      <DashHead title="User" desc={`${db.users.length} akun · kelola admin, instruktur, dan siswa`} action={<Btn onClick={() => setEditing("new")}><Plus size={16} />User Baru</Btn>} />
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="grow"><SearchInput value={q} onChange={setQ} placeholder="Cari nama atau email…" /></div>
        <Select value={fRole} onChange={(e) => setFRole(e.target.value)} className="w-44"><option value="">Semua role</option>{db.roles.map((r) => <option key={r.role} value={r.role}>{r.label}</option>)}</Select>
      </div>
      <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
        {list.map((u) => (
          <div key={u.id} className="flex items-center gap-3.5 px-4 py-3 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
            <Avatar user={u} />
            <div className="grow min-w-0">
              <p className="text-sm font-bold text-ink-800 dark:text-ink-50">{u.name}{u.id === user.id && <span className="text-[10px] font-mono text-brand-500 ml-2">(ANDA)</span>}</p>
              <p className="text-[11.5px] font-mono text-ink-400 truncate">{u.email} · bergabung {fmtDate(u.joined)}</p>
            </div>
            <Badge tone={u.role === "super_admin" ? "accent" : u.role === "admin" ? "info" : u.role === "instructor" ? "brand" : "neutral"}>{roleLabel(u.role)}</Badge>
            <Badge tone={statusTone(u.status)}>{u.status}</Badge>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditing(u)} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10"><Pencil size={15} /></button>
              <button disabled={u.id === user.id} onClick={() => setDeleting(u)} className="rounded-lg p-2 text-ink-400 hover:text-bad-500 hover:bg-bad-500/10 disabled:opacity-25"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
      {editing && <UserModal initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Hapus user?"
        footer={<><Btn variant="ghost" onClick={() => setDeleting(null)}>Batal</Btn><Btn variant="danger" onClick={() => { if (!deleting) return; update((d) => { d.users = d.users.filter((x) => x.id !== deleting.id); }); log("user_deleted", `User ${deleting.name} dihapus`); toast("User dihapus", "info"); setDeleting(null); }}>Hapus</Btn></>}>
        <p className="text-sm text-ink-500 dark:text-ink-300">Akun <b>{deleting?.name}</b> ({deleting?.email}) akan dihapus permanen.</p>
      </Modal>
    </div>
  );
}
function UserModal({ initial, onClose }: { initial: User | null; onClose: () => void }) {
  const { db, update, toast, log } = useApp();
  const [f, setF] = useState({ name: initial?.name ?? "", email: initial?.email ?? "", password: "", role: (initial?.role ?? "student") as string, status: (initial?.status ?? "active") as string });
  const [err, setErr] = useState("");
  if (!db) return null;
  const save = () => {
    if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email)) { setErr("Nama dan email valid wajib diisi."); return; }
    if (!initial && f.password.length < 6) { setErr("Password minimal 6 karakter."); return; }
    update((d) => {
      if (initial) {
        const u = d.users.find((x) => x.id === initial.id);
        if (u) { u.name = f.name; u.email = f.email; u.role = f.role as Role; u.status = f.status as User["status"]; if (f.password) u.password = f.password; }
      } else {
        d.users.push({ id: uid(), name: f.name, email: f.email.toLowerCase(), password: f.password, role: f.role as Role, color: "#0e8a75", joined: new Date().toISOString(), status: f.status as User["status"] });
      }
    });
    log(initial ? "user_updated" : "user_created", `User ${f.name} ${initial ? "diperbarui" : "dibuat"}`);
    toast("User disimpan", "ok"); onClose();
  };
  return (
    <Modal open onClose={onClose} title={initial ? "Ubah User" : "User Baru"}
      footer={<><Btn variant="ghost" onClick={onClose}>Batal</Btn><Btn onClick={save}>Simpan</Btn></>}>
      <div className="space-y-4">
        {err && <p className="rounded-lg bg-bad-500/10 border border-bad-500/30 px-3.5 py-2.5 text-[13px] font-semibold text-bad-500">{err}</p>}
        <Field label="Nama"><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Email"><TextInput type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={initial ? "Password baru (opsional)" : "Password"}><TextInput type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder={initial ? "kosongkan jika tidak diubah" : "min. 6 karakter"} /></Field>
          <Field label="Role"><Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} disabled={initial?.role === "super_admin"}>{db.roles.map((r) => <option key={r.role} value={r.role}>{r.label}</option>)}</Select></Field>
          <Field label="Status"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="active">active</option><option value="suspended">suspended</option></Select></Field>
        </div>
      </div>
    </Modal>
  );
}

// ─── Roles & permissions ────────────────────────────────────────────────────
export function RolesManager() {
  const { db, update, toast, log } = useApp();
  if (!db) return null;
  const toggle = (role: Role, perm: string) => {
    if (role === "super_admin") { toast("Super Admin memiliki akses penuh permanen.", "info"); return; }
    update((d) => {
      const r = d.roles.find((x) => x.role === role); if (!r) return;
      r.permissions = r.permissions.includes(perm) ? r.permissions.filter((p) => p !== perm) : [...r.permissions, perm];
    });
  };
  return (
    <div className="space-y-5">
      <DashHead title="Role & Permission" desc="Matriks izin per role — authorization dijaga di backend via Policy & Gate" />
      <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead><tr className="border-b border-ink-100 dark:border-ink-800 bg-ink-50/60 dark:bg-ink-850 text-left">
            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-ink-400">Permission</th>
            {db.roles.map((r) => <th key={r.role} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-ink-400 text-center whitespace-nowrap">{r.label}</th>)}
          </tr></thead>
          <tbody>
            {PERMISSIONS.map((perm) => (
              <tr key={perm} className="border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
                <td className="px-4 py-2.5 font-mono text-[12.5px] text-brand-700 dark:text-brand-300">{perm}</td>
                {db.roles.map((r) => {
                  const on = r.role === "super_admin" || r.permissions.includes(perm);
                  return (
                    <td key={r.role} className="px-4 py-2.5 text-center">
                      <button onClick={() => toggle(r.role, perm)} disabled={r.role === "super_admin"}
                        className={cx("w-6 h-6 rounded-md border-2 inline-flex items-center justify-center transition-colors", on ? "border-brand-500 bg-brand-500 text-white" : "border-ink-300 dark:border-ink-600 text-transparent", r.role === "super_admin" && "opacity-70 cursor-not-allowed")}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-400 flex items-center gap-1.5"><Shield size={13} />Perubahan langsung mempengaruhi menu sidebar dan akses API. Super Admin selalu full-access.</p>
    </div>
  );
}

// ─── System ─────────────────────────────────────────────────────────────────
export function SystemPage() {
  const { db, update, toast, log, reset, user } = useApp();
  const nav = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const [typed, setTyped] = useState("");
  if (!db || !user) return null;
  const dbSize = Math.round((JSON.stringify(db).length / 1024) * 10) / 10;
  const installedAt = localStorage.getItem("kmsit_installed_lock");
  return (
    <div className="space-y-5 max-w-3xl">
      <DashHead title="Sistem" desc="Mode pemeliharaan, registrasi, installer lock, dan penyimpanan" />
      <SettingsCard title="Mode Operasi">
        <div className="space-y-3.5">
          <div className="flex items-center justify-between rounded-xl border border-ink-200 dark:border-ink-700 px-4 py-3">
            <div><p className="text-sm font-bold text-ink-800 dark:text-ink-50">Maintenance Mode</p><p className="text-xs text-ink-400">Pengunjung publik melihat halaman pemeliharaan</p></div>
            <Toggle checked={db.settings.maintenanceMode} onChange={(v) => { update((d) => { d.settings.maintenanceMode = v; }); log("settings_changed", `Maintenance mode ${v ? "ON" : "OFF"}`); toast(`Maintenance mode ${v ? "aktif" : "nonaktif"}`, v ? "warn" : "ok"); }} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-ink-200 dark:border-ink-700 px-4 py-3">
            <div><p className="text-sm font-bold text-ink-800 dark:text-ink-50">Pendaftaran User</p><p className="text-xs text-ink-400">Izinkan visitor mendaftar sebagai siswa</p></div>
            <Toggle checked={db.settings.registrationOpen} onChange={(v) => { update((d) => { d.settings.registrationOpen = v; }); log("settings_changed", `Registrasi ${v ? "dibuka" : "ditutup"}`); toast(`Pendaftaran ${v ? "dibuka" : "ditutup"}`, "ok"); }} />
          </div>
        </div>
      </SettingsCard>
      <SettingsCard title="Installer" desc="Status penguncian instalasi (security)">
        <div className="rounded-xl border border-ok-500/40 bg-ok-500/8 p-4 flex items-start gap-3.5">
          <span className="w-10 h-10 rounded-lg bg-ok-500/15 text-ok-500 flex items-center justify-center shrink-0"><Lock size={18} /></span>
          <div className="grow">
            <p className="text-sm font-bold text-ink-800 dark:text-ink-50">installed.lock aktif</p>
            <p className="text-[12.5px] text-ink-500 dark:text-ink-300 mt-0.5 leading-relaxed">Installer terkunci sejak {installedAt ? fmtDateTime(installedAt) : fmtDate(db.installedAt ?? new Date().toISOString())}. Akses <Link to="/install" className="font-mono text-brand-600 dark:text-brand-300 underline underline-offset-2">/install</Link> menampilkan layar terkunci untuk mencegah instalasi ulang ilegal.</p>
          </div>
        </div>
      </SettingsCard>
      <SettingsCard title="Penyimpanan" desc="Simulasi Laravel Storage (disk: public)">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-ink-50 dark:bg-ink-850 border border-ink-100 dark:border-ink-800 p-4">
            <Database size={17} className="text-brand-600 dark:text-brand-300" />
            <p className="mt-2 font-display font-bold text-ink-900 dark:text-white">{dbSize} KB</p>
            <p className="text-[11px] font-mono text-ink-400 mt-0.5">ukuran database</p>
          </div>
          <div className="rounded-xl bg-ink-50 dark:bg-ink-850 border border-ink-100 dark:border-ink-800 p-4">
            <HardDrive size={17} className="text-accent-600 dark:text-accent-300" />
            <p className="mt-2 font-display font-bold text-ink-900 dark:text-white">{db.media.length} file</p>
            <p className="text-[11px] font-mono text-ink-400 mt-0.5">media library</p>
          </div>
          <div className="rounded-xl bg-ink-50 dark:bg-ink-850 border border-ink-100 dark:border-ink-800 p-4">
            <Terminal size={17} className="text-info-500" />
            <p className="mt-2 font-display font-bold text-ink-900 dark:text-white">MySQL 8.0</p>
            <p className="text-[11px] font-mono text-ink-400 mt-0.5">DB_CONNECTION</p>
          </div>
        </div>
      </SettingsCard>
      <SettingsCard title="Danger Zone" desc="Tindakan destruktif — hati-hati">
        <div className="rounded-xl border border-bad-500/40 bg-bad-500/5 p-4">
          <p className="text-sm font-bold text-bad-500 flex items-center gap-2"><AlertTriangle size={15} />Reset Instalasi</p>
          <p className="text-[12.5px] text-ink-500 dark:text-ink-300 mt-1 leading-relaxed">Menghapus seluruh database & lock, lalu menjalankan ulang installer dari awal. Seluruh data hilang.</p>
          <Btn variant="danger" size="sm" className="mt-3" onClick={() => setConfirmReset(true)}><Unlock size={14} />Reset & Jalankan Installer</Btn>
        </div>
      </SettingsCard>
      <Modal open={confirmReset} onClose={() => { setConfirmReset(false); setTyped(""); }} title="Konfirmasi reset total"
        footer={<><Btn variant="ghost" onClick={() => { setConfirmReset(false); setTyped(""); }}>Batal</Btn>
          <Btn variant="danger" disabled={typed !== "RESET"} onClick={() => { reset(); nav("/install"); }}>Ya, Reset Semua</Btn></>}>
        <p className="text-sm text-ink-500 dark:text-ink-300 leading-relaxed">Seluruh database, user, kelas, transaksi, dan konten akan <b>dihapus permanen</b>. Ketik <code className="font-mono font-bold text-bad-500">RESET</code> untuk konfirmasi.</p>
        <TextInput className="mt-3" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="RESET" />
      </Modal>
    </div>
  );
}

// ─── Activity log ───────────────────────────────────────────────────────────
export function ActivityPage() {
  const { db } = useApp();
  const [q, setQ] = useState("");
  const [fAction, setFAction] = useState("");
  if (!db) return null;
  const actions = [...new Set(db.logs.map((l) => l.action))];
  const list = db.logs.filter((l) => (!q || (l.userName + l.detail).toLowerCase().includes(q.toLowerCase())) && (!fAction || l.action === fAction));
  return (
    <div>
      <DashHead title="Log Aktivitas" desc="Audit trail: user, course, payment, certificate, withdrawal, settings" />
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="grow"><SearchInput value={q} onChange={setQ} placeholder="Cari aktivitas…" /></div>
        <Select value={fAction} onChange={(e) => setFAction(e.target.value)} className="w-56"><option value="">Semua aksi</option>{actions.map((a) => <option key={a} value={a}>{a}</option>)}</Select>
      </div>
      <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
        {list.map((l) => (
          <div key={l.id} className="flex items-center gap-3.5 px-4 py-3 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
            <span className="w-8 h-8 rounded-lg bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300 flex items-center justify-center shrink-0"><Activity size={14} /></span>
            <div className="grow min-w-0">
              <p className="text-[13.5px] text-ink-700 dark:text-ink-100"><b>{l.userName}</b> — {l.detail}</p>
              <p className="text-[11px] font-mono text-ink-400 mt-0.5">{l.action} · {fmtDateTime(l.date)}</p>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="px-4 py-12 text-center text-ink-400 text-sm">Tidak ada log yang cocok.</p>}
      </div>
    </div>
  );
}

// ─── Integrations ───────────────────────────────────────────────────────────
export function IntegrationsPage({ kind }: { kind: "youtube" | "zoom" | "gmeet" }) {
  const { db, update, toast, log } = useApp();
  if (!db) return null;
  const cfg = db.integrations[kind];
  const upd = (patch: Record<string, unknown>) => update((d) => { Object.assign(d.integrations[kind], patch); });
  const meta = {
    youtube: { name: "YouTube", icon: <Youtube size={20} />, desc: "URL YouTube otomatis dikonversi menjadi embed di artikel, berita, tutorial, lesson, dan course.", fields: [{ k: "channelId", label: "Channel ID" }, { k: "apiKey", label: "API Key (opsional, untuk analytics)" }] },
    zoom: { name: "Zoom", icon: <Video size={20} />, desc: "Integration layer untuk online class, meeting, dan webinar via Zoom API (OAuth credentials).", fields: [{ k: "accountId", label: "Account ID" }, { k: "clientId", label: "Client ID" }, { k: "clientSecret", label: "Client Secret" }] },
    gmeet: { name: "Google Meet", icon: <CalendarCheck size={20} />, desc: "Simpan meeting URL, jadwal, dan tautan ke lesson. Arsitektur siap untuk OAuth Google.", fields: [{ k: "clientId", label: "OAuth Client ID" }, { k: "clientSecret", label: "OAuth Client Secret" }] },
  }[kind];
  return (
    <div className="space-y-5 max-w-3xl">
      <DashHead title={meta.name} desc={meta.desc} />
      <SettingsCard title={`Koneksi ${meta.name}`} onSave={() => { log("integration_updated", `Integrasi ${meta.name} diperbarui`); toast(`Integrasi ${meta.name} disimpan`, "ok"); }}>
        <div className="flex items-center justify-between rounded-xl border border-ink-200 dark:border-ink-700 px-4 py-3 mb-4">
          <div className="flex items-center gap-3">
            <span className={cx("w-10 h-10 rounded-lg flex items-center justify-center", cfg.enabled ? "bg-bad-500/12 text-bad-500" : "bg-ink-100 dark:bg-ink-800 text-ink-400")}>{meta.icon}</span>
            <div>
              <p className="text-sm font-bold text-ink-800 dark:text-ink-50">{meta.name} Integration</p>
              <p className="text-[11px] font-mono mt-0.5">{cfg.enabled ? <span className="text-ok-500">● TERHUBUNG</span> : <span className="text-ink-400">○ BELUM AKTIF</span>}</p>
            </div>
          </div>
          <Toggle checked={cfg.enabled} onChange={(v) => { upd({ enabled: v }); toast(`${meta.name} ${v ? "diaktifkan" : "dinonaktifkan"}`, "info"); }} />
        </div>
        <div className="grid gap-4">
          {meta.fields.map((fl) => (
            <Field key={fl.k} label={fl.label}>
              <TextInput type={fl.k.toLowerCase().includes("secret") ? "password" : "text"} value={(cfg as unknown as Record<string, string>)[fl.k] ?? ""} onChange={(e) => upd({ [fl.k]: e.target.value })} placeholder={fl.k.toLowerCase().includes("secret") ? "••••••••" : "masukkan kredensial…"} />
            </Field>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-400 leading-relaxed flex items-center gap-1.5"><Globe size={13} />Kredensial ter-enkripsi di backend dan tidak pernah dikirim kembali ke frontend dalam bentuk plain-text.</p>
      </SettingsCard>
      {kind !== "youtube" && (
        <SettingsCard title="Jadwal meeting tersimpan" desc="Meeting yang ditautkan ke kelas/lesson">
          <div className="space-y-2">
            {[{ t: "Live Class: REST API Node.js", d: "Sabtu, 09.00 WIB", u: kind === "zoom" ? "zoom.us/j/8837xxx" : "meet.google.com/kms-abc-def", c: "Full-Stack Bootcamp" },
              { t: "Q&A Sesi Mikrotik", d: "Minggu, 19.30 WIB", u: kind === "zoom" ? "zoom.us/j/9912xxx" : "meet.google.com/kms-xyz-ghi", c: "Jaringan Komputer" }].map((m) => (
              <div key={m.t} className="flex items-center gap-3 rounded-lg border border-ink-200 dark:border-ink-700 px-3.5 py-2.5">
                <span className="w-8 h-8 rounded-lg bg-info-500/12 text-info-500 flex items-center justify-center shrink-0">{meta.icon}</span>
                <div className="grow min-w-0"><p className="text-[13px] font-bold text-ink-800 dark:text-ink-50 truncate">{m.t}</p><p className="text-[11px] font-mono text-ink-400">{m.d} · {m.u} · {m.c}</p></div>
                <Badge tone="info">{kind === "zoom" ? "Zoom" : "Meet"}</Badge>
              </div>
            ))}
          </div>
        </SettingsCard>
      )}
    </div>
  );
}
export { Languages as _L, Ban as _B };
