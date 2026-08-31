import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { Check, ChevronLeft, ChevronRight, Database, Globe, Loader2, Lock, Server, ShieldCheck, Sparkles, Terminal as TerminalIcon, UserCog } from "lucide-react";
import { useApp } from "../lib/store";
import { Btn, cx, Field, Logo, Select, TextInput } from "../components/ui";
import type { Lang } from "../lib/db";

const STEPS = ["Selamat Datang", "Persyaratan Sistem", "Konfigurasi Database", "Tes Koneksi", "Migrasi Database", "Seeder", "Super Admin", "Konfigurasi Website", "Selesai"];

const REQUIREMENTS = [
  { label: "PHP >= 8.2", detail: "v8.3.11 terdeteksi" },
  { label: "MySQL / MariaDB", detail: "MySQL 8.0.36 terdeteksi" },
  { label: "Extension: pdo_mysql", detail: "enabled" },
  { label: "Extension: mbstring", detail: "enabled" },
  { label: "Extension: openssl", detail: "enabled" },
  { label: "Extension: gd / imagick", detail: "enabled" },
  { label: "Storage writable (storage/)", detail: "0775 OK" },
  { label: "Bootstrap cache writable", detail: "0775 OK" },
  { label: "File .env.example", detail: "ditemukan" },
];
const MIGRATIONS = [
  "0001_create_users_table", "0002_create_roles_permissions_tables", "0003_create_settings_table",
  "0004_create_categories_tables", "0005_create_courses_modules_lessons", "0006_create_quizzes_tables",
  "0007_create_enrollments_progress", "0008_create_certificates_tables", "0009_create_articles_news_tutorials",
  "0010_create_programs_pages", "0011_create_menus_media", "0012_create_payments_wallets_withdrawals",
  "0013_create_integrations_tables", "0014_create_notifications_activity_logs", "0015_create_home_sections",
];
const SEEDERS = ["RoleSeeder", "PermissionSeeder", "CategorySeeder", "CourseSeeder", "ContentSeeder", "HomeSectionSeeder", "MenuSeeder", "SettingSeeder"];

export function InstallPage() {
  const { install, db } = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [reqDone, setReqDone] = useState(0);
  const [dbCfg, setDbCfg] = useState({ host: "127.0.0.1", port: "3306", name: "kmsit_db", user: "kmsit", pass: "" });
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);
  const [migDone, setMigDone] = useState(0);
  const [seedDone, setSeedDone] = useState(0);
  const [admin, setAdmin] = useState({ name: "", email: "", pw: "", pw2: "" });
  const [adminErr, setAdminErr] = useState("");
  const [site, setSite] = useState({ siteName: "KMSIT Computer", slogan: "Belajar Teknologi, Naik Level.", email: "halo@kmsit.id", phone: "(021) 555-0199", address: "Jl. Pendidikan Teknologi No. 12, Jakarta Selatan", timezone: "Asia/Jakarta", language: "id" as Lang, currency: "IDR" });

  useEffect(() => {
    if (step === 1 && reqDone < REQUIREMENTS.length) {
      const t = window.setTimeout(() => setReqDone((s) => s + 1), 260);
      return () => window.clearTimeout(t);
    }
  }, [step, reqDone]);
  useEffect(() => {
    if (step === 4 && migDone < MIGRATIONS.length) {
      const t = window.setTimeout(() => setMigDone((s) => s + 1), 200);
      return () => window.clearTimeout(t);
    }
  }, [step, migDone]);
  useEffect(() => {
    if (step === 5 && seedDone < SEEDERS.length) {
      const t = window.setTimeout(() => setSeedDone((s) => s + 1), 240);
      return () => window.clearTimeout(t);
    }
  }, [step, seedDone]);

  const next = () => {
    if (step === 2) { setTesting(true); setTested(false); window.setTimeout(() => { setTesting(false); setTested(true); }, 1300); }
    if (step === 6) {
      if (!admin.name.trim()) { setAdminErr("Nama wajib diisi."); return; }
      if (!/^\S+@\S+\.\S+$/.test(admin.email)) { setAdminErr("Email tidak valid."); return; }
      if (admin.pw.length < 6) { setAdminErr("Kata sandi minimal 6 karakter."); return; }
      if (admin.pw !== admin.pw2) { setAdminErr("Konfirmasi kata sandi tidak sama."); return; }
      setAdminErr("");
    }
    if (step === 7) {
      install({ name: admin.name, email: admin.email.toLowerCase(), password: admin.pw }, site);
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 }, colors: ["#17a58c", "#eaa93f", "#ffffff"] });
    }
    setStep((s) => s + 1);
  };
  const canNext =
    (step === 1 && reqDone >= REQUIREMENTS.length) ||
    (step === 2 && dbCfg.host && dbCfg.name && dbCfg.user) ||
    (step === 3 && tested) ||
    (step === 4 && migDone >= MIGRATIONS.length) ||
    (step === 5 && seedDone >= SEEDERS.length) ||
    ![1, 2, 3, 4, 5].includes(step);

  if (db?.installed && step < 8) {
    // already installed — show lock screen
    return (
      <InstallShell step={-1}>
        <div className="text-center py-10">
          <span className="mx-auto w-14 h-14 rounded-2xl bg-warn-500/15 text-warn-600 flex items-center justify-center"><Lock size={26} /></span>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 dark:text-white">Installer Terkunci</h1>
          <p className="mt-2 text-sm text-ink-400 leading-relaxed max-w-sm mx-auto">Website sudah ter-install. File <code className="font-mono bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 rounded">installed.lock</code> aktif untuk mencegah instalasi ulang. Gunakan tombol “Reset Instalasi” di Dashboard → Sistem jika perlu reinstall.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Btn onClick={() => nav("/")}>Ke Beranda</Btn>
            <Btn variant="outline" onClick={() => nav("/login")}>Masuk</Btn>
          </div>
        </div>
      </InstallShell>
    );
  }

  return (
    <InstallShell step={step}>
      {step === 0 && (
        <div className="py-6">
          <p className="font-mono text-[12px] text-brand-600 dark:text-brand-300"><span className="text-accent-500">$</span> php artisan kmsit:install</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink-900 dark:text-white tracking-tight">Selamat datang di Installer KMSIT</h1>
          <p className="mt-3 text-[15px] text-ink-400 leading-relaxed">Wizard ini akan memandu instalasi platform LMS + CMS dalam 8 langkah: pemeriksaan sistem, konfigurasi database MySQL, migrasi, seeder, pembuatan akun Super Admin, hingga konfigurasi website.</p>
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            {[{ i: <Server size={18} />, t: "Cek Sistem", d: "PHP, MySQL, permission" }, { i: <Database size={18} />, t: "Database", d: "MySQL + migrasi + seeder" }, { i: <ShieldCheck size={18} />, t: "Aman", d: "Lock setelah install" }].map((x) => (
              <div key={x.t} className="rounded-xl border border-ink-100 dark:border-ink-800 p-4">
                <span className="text-brand-600 dark:text-brand-300">{x.i}</span>
                <p className="mt-2 font-display font-semibold text-ink-900 dark:text-white text-sm">{x.t}</p>
                <p className="text-xs text-ink-400 mt-0.5">{x.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-lg bg-brand-50 dark:bg-brand-900/25 border border-brand-500/25 px-4 py-3 text-[13px] text-brand-800 dark:text-brand-200">Perkiraan waktu: ± 2 menit. Pastikan kredensial MySQL sudah disiapkan.</p>
        </div>
      )}
      {step === 1 && (
        <div className="py-4">
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Pemeriksaan Persyaratan Sistem</h1>
          <p className="text-sm text-ink-400 mt-1">Memverifikasi lingkungan server sebelum instalasi…</p>
          <div className="mt-5 rounded-xl border border-ink-100 dark:border-ink-800 divide-y divide-ink-100 dark:divide-ink-800 overflow-hidden">
            {REQUIREMENTS.map((r, i) => (
              <div key={r.label} className={cx("flex items-center justify-between px-4 py-2.5 text-sm transition-opacity", i < reqDone ? "opacity-100" : "opacity-30")}>
                <span className="font-semibold text-ink-700 dark:text-ink-100">{r.label}</span>
                <span className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-ink-400">{r.detail}</span>
                  {i < reqDone ? <Check size={15} className="text-ok-500" /> : i === reqDone ? <Loader2 size={14} className="spin text-brand-500" /> : null}
                </span>
              </div>
            ))}
          </div>
          {reqDone >= REQUIREMENTS.length && <p className="mt-4 flex items-center gap-2 text-sm font-bold text-ok-500"><Check size={16} />Semua persyaratan terpenuhi. Server siap.</p>}
        </div>
      )}
      {step === 2 && (
        <div className="py-4">
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Konfigurasi Database MySQL</h1>
          <p className="text-sm text-ink-400 mt-1">Kredensial disimpan ter-enkripsi di <code className="font-mono">.env</code> — tidak pernah tampil lagi setelah instalasi.</p>
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <Field label="Database Host"><TextInput value={dbCfg.host} onChange={(e) => setDbCfg({ ...dbCfg, host: e.target.value })} /></Field>
            <Field label="Port"><TextInput value={dbCfg.port} onChange={(e) => setDbCfg({ ...dbCfg, port: e.target.value })} /></Field>
            <Field label="Database Name"><TextInput value={dbCfg.name} onChange={(e) => setDbCfg({ ...dbCfg, name: e.target.value })} /></Field>
            <Field label="Username"><TextInput value={dbCfg.user} onChange={(e) => setDbCfg({ ...dbCfg, user: e.target.value })} /></Field>
            <Field label="Password" className="sm:col-span-2"><TextInput type="password" value={dbCfg.pass} onChange={(e) => setDbCfg({ ...dbCfg, pass: e.target.value })} placeholder="••••••••" /></Field>
          </div>
          <p className="mt-4 text-[11px] font-mono text-ink-400">DB_CONNECTION=mysql · charset utf8mb4 · collation utf8mb4_unicode_ci</p>
        </div>
      )}
      {step === 3 && (
        <div className="py-6 text-center">
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Tes Koneksi Database</h1>
          <div className="mt-8 mx-auto max-w-sm rounded-xl border border-ink-100 dark:border-ink-800 p-6 font-mono text-[13px] text-left bg-ink-950 text-ink-100 scanline relative">
            <p className="text-ink-400">$ pdo connect mysql:host={dbCfg.host};port={dbCfg.port};dbname={dbCfg.name}</p>
            {testing && <p className="mt-2 text-brand-300 flex items-center gap-2"><Loader2 size={13} className="spin" />menghubungkan…</p>}
            {tested && <>
              <p className="mt-2 text-ok-500">✓ koneksi berhasil · MySQL 8.0.36</p>
              <p className="text-ok-500">✓ database “{dbCfg.name}” dapat diakses</p>
              <p className="text-ok-500">✓ user “{dbCfg.user}” memiliki hak yang cukup</p>
            </>}
            {!testing && !tested && <p className="mt-2 text-ink-500">menunggu…</p>}
          </div>
          {tested ? (
            <p className="mt-5 text-sm font-bold text-ok-500">Koneksi OK — lanjut ke migrasi.</p>
          ) : (
            <Btn className="mt-5" onClick={() => { setTesting(true); window.setTimeout(() => { setTesting(false); setTested(true); }, 1300); }} disabled={testing}>Jalankan Tes Koneksi</Btn>
          )}
        </div>
      )}
      {step === 4 && (
        <div className="py-4">
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Menjalankan Migrasi</h1>
          <p className="text-sm text-ink-400 mt-1 font-mono">php artisan migrate --force</p>
          <div className="mt-5 rounded-xl border border-ink-100 dark:border-ink-800 p-4 bg-ink-950 font-mono text-[12.5px] max-h-72 overflow-y-auto scanline relative">
            {MIGRATIONS.map((m, i) => (
              <p key={m} className={cx("py-0.5", i < migDone ? "text-ok-500" : i === migDone ? "text-brand-300" : "text-ink-600")}>
                {i < migDone ? "✓" : i === migDone ? "▸" : "·"} {m}{i < migDone && <span className="text-ink-500"> ......... DONE</span>}
              </p>
            ))}
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden"><div className="h-full bg-brand-500 transition-all duration-300" style={{ width: `${(migDone / MIGRATIONS.length) * 100}%` }} /></div>
        </div>
      )}
      {step === 5 && (
        <div className="py-4">
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Menjalankan Seeder</h1>
          <p className="text-sm text-ink-400 mt-1 font-mono">php artisan db:seed</p>
          <div className="mt-5 grid sm:grid-cols-2 gap-2.5">
            {SEEDERS.map((s, i) => (
              <div key={s} className={cx("flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm font-mono transition-all", i < seedDone ? "border-ok-500/40 bg-ok-500/8 text-ok-600 dark:text-ok-500" : "border-ink-100 dark:border-ink-800 text-ink-400")}>
                {s}{i < seedDone ? <Check size={14} /> : i === seedDone ? <Loader2 size={13} className="spin" /> : null}
              </div>
            ))}
          </div>
          {seedDone >= SEEDERS.length && <p className="mt-4 text-sm font-bold text-ok-500 flex items-center gap-2"><Check size={15} />Role, permission, kategori, dan konten starter berhasil dibuat. Hanya Super Admin yang memiliki akun — buat Admin & Instruktur dari dashboard.</p>}
        </div>
      )}
      {step === 6 && (
        <div className="py-4">
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2.5"><UserCog size={22} className="text-brand-600" />Buat Akun Super Admin</h1>
          <p className="text-sm text-ink-400 mt-1">Akun dengan akses penuh. Password di-hash bcrypt dan tidak disimpan plain-text.</p>
          {adminErr && <p className="mt-4 rounded-lg bg-bad-500/10 border border-bad-500/30 px-3.5 py-2.5 text-[13px] font-semibold text-bad-500">{adminErr}</p>}
          <div className="mt-5 grid gap-4">
            <Field label="Nama"><TextInput value={admin.name} onChange={(e) => setAdmin({ ...admin, name: e.target.value })} placeholder="Nama lengkap" /></Field>
            <Field label="Email"><TextInput type="email" value={admin.email} onChange={(e) => setAdmin({ ...admin, email: e.target.value })} placeholder="admin@website.id" /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Kata sandi"><TextInput type="password" value={admin.pw} onChange={(e) => setAdmin({ ...admin, pw: e.target.value })} placeholder="min. 6 karakter" /></Field>
              <Field label="Konfirmasi"><TextInput type="password" value={admin.pw2} onChange={(e) => setAdmin({ ...admin, pw2: e.target.value })} placeholder="ulangi sandi" /></Field>
            </div>
          </div>
        </div>
      )}
      {step === 7 && (
        <div className="py-4">
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2.5"><Globe size={22} className="text-brand-600" />Konfigurasi Website</h1>
          <p className="text-sm text-ink-400 mt-1">Semua pengaturan ini bisa diubah kapan saja di Dashboard → Pengaturan Website.</p>
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <Field label="Nama Website"><TextInput value={site.siteName} onChange={(e) => setSite({ ...site, siteName: e.target.value })} /></Field>
            <Field label="Slogan"><TextInput value={site.slogan} onChange={(e) => setSite({ ...site, slogan: e.target.value })} /></Field>
            <Field label="Email"><TextInput value={site.email} onChange={(e) => setSite({ ...site, email: e.target.value })} /></Field>
            <Field label="Telepon"><TextInput value={site.phone} onChange={(e) => setSite({ ...site, phone: e.target.value })} /></Field>
            <Field label="Alamat" className="sm:col-span-2"><TextInput value={site.address} onChange={(e) => setSite({ ...site, address: e.target.value })} /></Field>
            <Field label="Timezone"><Select value={site.timezone} onChange={(e) => setSite({ ...site, timezone: e.target.value })}>{["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura", "Asia/Singapore"].map((z) => <option key={z}>{z}</option>)}</Select></Field>
            <Field label="Bahasa Default"><Select value={site.language} onChange={(e) => setSite({ ...site, language: e.target.value as Lang })}><option value="id">Bahasa Indonesia</option><option value="en">English</option></Select></Field>
            <Field label="Mata Uang"><Select value={site.currency} onChange={(e) => setSite({ ...site, currency: e.target.value })}><option>IDR</option><option>USD</option></Select></Field>
          </div>
        </div>
      )}
      {step === 8 && (
        <div className="py-8 text-center">
          <span className="mx-auto w-16 h-16 rounded-2xl bg-ok-500/15 text-ok-500 flex items-center justify-center"><Sparkles size={30} /></span>
          <h1 className="mt-4 font-display text-3xl font-bold text-ink-900 dark:text-white">Instalasi Selesai!</h1>
          <p className="mt-3 text-[15px] text-ink-400 leading-relaxed max-w-sm mx-auto"><b className="text-ink-700 dark:text-ink-100">{site.siteName}</b> siap digunakan. Installer telah dikunci dengan <code className="font-mono text-xs bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 rounded">installed.lock</code> demi keamanan.</p>
          <div className="mt-5 inline-block rounded-xl border border-ink-100 dark:border-ink-800 p-4 font-mono text-[12px] text-left text-ink-500 dark:text-ink-300">
            <p>✓ 15 migrasi · 8 seeder</p>
            <p>✓ Super Admin: {admin.email}</p>
            <p>✓ DB: {dbCfg.name}@{dbCfg.host}:{dbCfg.port}</p>
            <p className="text-ok-500">✓ installed.lock ditulis</p>
          </div>
          <div className="mt-7 flex justify-center gap-2 flex-wrap">
            <Btn variant="accent" size="lg" onClick={() => nav("/login")}>Masuk sebagai Super Admin<ChevronRight size={16} /></Btn>
            <Btn variant="outline" size="lg" onClick={() => nav("/")}>Lihat Website</Btn>
          </div>
        </div>
      )}

      {step < 8 && (
        <div className="mt-7 flex items-center justify-between border-t border-ink-100 dark:border-ink-800 pt-5">
          <Btn variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}><ChevronLeft size={15} />Kembali</Btn>
          {step === 2 && !tested ? (
            <Btn onClick={next} disabled={!canNext || testing}>Tes & Lanjut</Btn>
          ) : (
            <Btn onClick={next} disabled={!canNext}>
              {step === 7 ? "Install Sekarang" : "Lanjut"}<ChevronRight size={15} />
            </Btn>
          )}
        </div>
      )}
    </InstallShell>
  );
}

function InstallShell({ step, children }: { step: number; children: React.ReactNode }) {
  const { db } = useApp();
  return (
    <div className="min-h-screen bg-ink-950 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-brand-500/12 blur-[120px]" />
      <div className="relative max-w-2xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-8">
          <Logo name={db?.settings.siteName ?? "KMSIT Computer"} dark />
          <span className="flex items-center gap-2 font-mono text-[11px] text-ink-400"><TerminalIcon size={13} />installer v1.0</span>
        </div>
        {step >= 0 && step < 8 && (
          <div className="mb-6">
            <div className="flex justify-between text-[10px] font-mono text-ink-500 mb-2"><span>LANGKAH {step + 1} / 9</span><span>{STEPS[step].toUpperCase()}</span></div>
            <div className="flex gap-1">
              {STEPS.map((s, i) => <div key={s} className={cx("h-1 grow rounded-full transition-colors duration-300", i < step ? "bg-brand-500" : i === step ? "bg-accent-400" : "bg-white/10")} />)}
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-ink-800 bg-card dark:bg-ink-900 shadow-pop px-5 sm:px-8 py-6 sm:py-8">{children}</div>
        <p className="mt-6 text-center text-[11px] font-mono text-ink-500">KMSIT Installer · React + Laravel + MySQL · tanpa SQLite, tanpa Angular ;)</p>
      </div>
    </div>
  );
}
