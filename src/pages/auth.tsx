import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Terminal, ArrowRight, Mail, Lock, User as UserIcon, CheckCircle2 } from "lucide-react";
import { useApp } from "../lib/store";
import { Btn, Field, Logo, TextInput } from "../components/ui";
import { roleBase } from "../components/shell";

function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  const { db } = useApp();
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      <div className="hidden lg:flex flex-col justify-between bg-ink-900 dark:bg-ink-950 text-white p-10 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-500/15 blur-[100px]" />
        <div className="relative"><Link to="/"><Logo name={db?.settings.siteName ?? "KMSIT Computer"} dark /></Link></div>
        <div className="relative">
          <p className="font-mono text-[12px] text-brand-300"><span className="text-accent-400">$</span> kmsit auth --secure</p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight max-w-sm">Satu akun untuk belajar, mengajar, dan mengelola.</h2>
          <div className="mt-8 rounded-xl border border-ink-700 bg-ink-950/80 p-4 font-mono text-[12px] leading-6 max-w-sm scanline relative">
            <p className="text-ink-300"><span className="text-accent-400">role</span>      = super_admin | admin | instruktur | siswa</p>
            <p className="text-ink-300"><span className="text-accent-400">guard</span>     = laravel-sanctum</p>
            <p className="text-ink-300"><span className="text-accent-400">policy</span>    = authorize($user, $ability)</p>
            <p className="text-ok-500">✓ session aman · password ter-hash bcrypt</p>
          </div>
        </div>
        <p className="relative text-xs text-ink-400 font-mono">{db?.settings.footerText}</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8"><Link to="/"><Logo name={db?.settings.siteName ?? "KMSIT Computer"} /></Link></div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">{title}</h1>
          <p className="text-sm text-ink-400 mt-1.5">{sub}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

const DEMO = [
  { label: "Super Admin", email: "superadmin@kmsit.id", pw: "super123" },
  { label: "Admin", email: "admin@kmsit.id", pw: "admin123" },
  { label: "Instruktur", email: "instruktur@kmsit.id", pw: "guru123" },
  { label: "Siswa", email: "siswa@kmsit.id", pw: "siswa123" },
];

export function LoginPage() {
  const { login, db } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    window.setTimeout(() => {
      const res = login(email, pw);
      setBusy(false);
      if (res) { setErr(res); return; }
      const u = db?.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
      nav(u ? roleBase(u.role) : "/");
    }, 450);
  };
  return (
    <AuthShell title="Selamat datang kembali" sub="Masuk ke akun KMSIT Computer kamu.">
      <form onSubmit={submit} className="mt-6 space-y-4">
        {err && <p className="rounded-lg bg-bad-500/10 border border-bad-500/30 px-3.5 py-2.5 text-[13px] font-semibold text-bad-500">{err}</p>}
        <Field label="Email"><div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" /><TextInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="pl-9" /></div></Field>
        <Field label="Kata sandi"><div className="relative"><Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" /><TextInput type="password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" className="pl-9" /></div></Field>
        <div className="flex items-center justify-between text-[13px]">
          <Link to="/forgot" className="font-semibold text-brand-600 dark:text-brand-300 hover:underline">Lupa kata sandi?</Link>
        </div>
        <Btn type="submit" className="w-full" size="lg" disabled={busy}>{busy ? "Memverifikasi…" : <>Masuk<ArrowRight size={16} /></>}</Btn>
      </form>
      <div className="mt-6">
        <p className="text-[11px] font-mono uppercase tracking-wider text-ink-300 mb-2">Akun demo — klik untuk isi otomatis</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO.map((d) => (
            <button key={d.label} onClick={() => { setEmail(d.email); setPw(d.pw); setErr(""); }}
              className="rounded-lg border border-ink-200 dark:border-ink-700 px-3 py-2 text-left hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
              <span className="block text-[13px] font-bold text-ink-700 dark:text-ink-100">{d.label}</span>
              <span className="block text-[10px] font-mono text-ink-400 truncate">{d.email}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-6 text-sm text-ink-400">Belum punya akun? <Link to="/register" className="font-bold text-brand-600 dark:text-brand-300 hover:underline">Daftar gratis</Link></p>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { register, db } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", pw: "", pw2: "" });
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.pw.length < 6) { setErr("Kata sandi minimal 6 karakter."); return; }
    if (f.pw !== f.pw2) { setErr("Konfirmasi kata sandi tidak sama."); return; }
    const res = register(f.name, f.email, f.pw);
    if (res) { setErr(res); return; }
    nav("/dashboard/student");
  };
  return (
    <AuthShell title="Buat akun siswa" sub="Gratis — langsung bisa mengikuti kelas gratis.">
      {!db?.settings.registrationOpen ? (
        <p className="mt-6 rounded-lg bg-warn-500/10 border border-warn-500/30 px-3.5 py-2.5 text-[13px] font-semibold text-warn-600">Pendaftaran sedang ditutup. Hubungi admin.</p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          {err && <p className="rounded-lg bg-bad-500/10 border border-bad-500/30 px-3.5 py-2.5 text-[13px] font-semibold text-bad-500">{err}</p>}
          <Field label="Nama lengkap"><div className="relative"><UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" /><TextInput required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Nama kamu" className="pl-9" /></div></Field>
          <Field label="Email"><div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" /><TextInput type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="nama@email.com" className="pl-9" /></div></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kata sandi"><TextInput type="password" required value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} placeholder="min. 6 karakter" /></Field>
            <Field label="Konfirmasi"><TextInput type="password" required value={f.pw2} onChange={(e) => setF({ ...f, pw2: e.target.value })} placeholder="ulangi" /></Field>
          </div>
          <Btn type="submit" className="w-full" size="lg">Daftar Sekarang<ArrowRight size={16} /></Btn>
        </form>
      )}
      <p className="mt-6 text-sm text-ink-400">Sudah punya akun? <Link to="/login" className="font-bold text-brand-600 dark:text-brand-300 hover:underline">Masuk</Link></p>
    </AuthShell>
  );
}

export function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <AuthShell title="Lupa kata sandi" sub="Kami kirimkan tautan reset ke email kamu.">
      {sent ? (
        <div className="mt-6 rounded-xl border border-ok-500/30 bg-ok-500/8 p-5 text-center">
          <CheckCircle2 size={28} className="mx-auto text-ok-500" />
          <p className="mt-2 font-display font-bold text-ink-900 dark:text-white">Tautan terkirim</p>
          <p className="text-sm text-ink-400 mt-1">Jika <b>{email}</b> terdaftar, tautan reset sudah dikirim (simulasi mail queue Laravel).</p>
          <Link to="/login" className="inline-block mt-4"><Btn variant="outline" size="sm">Kembali ke login</Btn></Link>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); if (email) setSent(true); }}>
          <Field label="Email terdaftar"><div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" /><TextInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="pl-9" /></div></Field>
          <Btn type="submit" className="w-full" size="lg">Kirim Tautan Reset</Btn>
        </form>
      )}
      <p className="mt-6 text-sm text-ink-400"><Link to="/login" className="font-bold text-brand-600 dark:text-brand-300 hover:underline">← Kembali masuk</Link></p>
    </AuthShell>
  );
}
export { Terminal as _T };
