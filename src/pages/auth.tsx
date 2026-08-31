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
        <div className="relative"><Link to="/"><Logo name={db?.settings.siteName ?? "KMSIT Computer"} dark logoUrl={db?.settings.logoUrl || undefined} /></Link></div>
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

export function GoogleIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.1 3.7-8.9z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5L1.3 17.4C3.3 21.3 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.1 14.4c-.3-.8-.4-1.6-.4-2.4s.2-1.6.4-2.4L1.3 6.6C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l3.8-3z" />
      <path fill="#EA4335" d="M12 4.7c2.3 0 3.8 1 4.7 1.8l3.3-3.2C18 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l3.8 3c1-2.9 3.7-4.9 6.9-4.9z" />
    </svg>
  );
}

export function GoogleButton({ label, onDone }: { label: string; onDone?: () => void }) {
  const { googleSignIn, db } = useApp();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [gName, setGName] = useState("");
  const [gEmail, setGEmail] = useState("");
  const [gErr, setGErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = () => {
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(gEmail.trim().toLowerCase())) { setGErr("Gunakan alamat @gmail.com yang valid."); return; }
    setGErr(""); setBusy(true);
    window.setTimeout(() => {
      const res = googleSignIn(gName, gEmail);
      setBusy(false);
      if (res) { setGErr(res); return; }
      const u = db?.users.find((x) => x.email.toLowerCase() === gEmail.trim().toLowerCase());
      setOpen(false); onDone?.();
      nav(u ? roleBase(u.role) : "/dashboard/student");
    }, 900);
  };
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="w-full h-12 rounded-lg border border-ink-200 dark:border-ink-700 bg-card dark:bg-ink-900 flex items-center justify-center gap-2.5 text-sm font-bold text-ink-700 dark:text-ink-100 hover:border-brand-400 hover:shadow-lift transition-all">
        <GoogleIcon />{label}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-[2px]" onClick={() => !busy && setOpen(false)} />
          <div className="modal-in relative w-full max-w-sm rounded-2xl bg-card dark:bg-ink-900 border border-ink-100 dark:border-ink-700 shadow-pop p-6">
            <div className="flex items-center gap-2.5">
              <GoogleIcon size={22} />
              <div>
                <p className="font-display font-bold text-ink-900 dark:text-white text-[15px]">Masuk dengan Google</p>
                <p className="text-[11px] text-ink-400 font-mono">accounts.google.com · OAuth 2.0</p>
              </div>
            </div>
            <p className="mt-4 text-[13px] text-ink-500 dark:text-ink-300 leading-relaxed">Pilih akun untuk melanjutkan ke <b className="text-ink-800 dark:text-white">{db?.settings.siteName}</b>. Akun Google baru otomatis terdaftar sebagai <b>Siswa</b>.</p>
            <div className="mt-4 space-y-3">
              <Field label="Nama"><TextInput autoFocus value={gName} onChange={(e) => setGName(e.target.value)} placeholder="Nama di akun Google" /></Field>
              <Field label="Akun Gmail"><TextInput type="email" value={gEmail} onChange={(e) => setGEmail(e.target.value)} placeholder="nama@gmail.com" onKeyDown={(e) => e.key === "Enter" && submit()} /></Field>
              {gErr && <p className="rounded-lg bg-bad-500/10 border border-bad-500/30 px-3 py-2 text-[12.5px] font-semibold text-bad-500">{gErr}</p>}
            </div>
            <div className="mt-5 flex gap-2">
              <Btn variant="ghost" className="grow" onClick={() => setOpen(false)} disabled={busy}>Batal</Btn>
              <Btn className="grow" onClick={submit} disabled={busy}>{busy ? "Memverifikasi…" : "Lanjutkan"}</Btn>
            </div>
            <p className="mt-3 text-[10.5px] text-ink-400 text-center font-mono">Alur OAuth — di produksi terhubung Google Identity Services</p>
          </div>
        </div>
      )}
    </>
  );
}

export function LoginPage() {
  const { login } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    window.setTimeout(async () => {
      const res = await login(email, pw);
      setBusy(false);
      if (res) { setErr(res); return; }
      nav("/dashboard"); // RoleRedirect mengarahkan ke dashboard sesuai role
    }, 450);
  };
  return (
    <AuthShell title="Selamat datang kembali" sub="Masuk dengan kredensial yang dibuat saat instalasi atau oleh Super Admin.">
      <GoogleButton label="Lanjutkan dengan Google" />
      <div className="my-5 flex items-center gap-3">
        <span className="h-px grow bg-ink-200 dark:bg-ink-700" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-300">atau</span>
        <span className="h-px grow bg-ink-200 dark:bg-ink-700" />
      </div>
      <form onSubmit={submit} className="space-y-4">
        {err && <p className="rounded-lg bg-bad-500/10 border border-bad-500/30 px-3.5 py-2.5 text-[13px] font-semibold text-bad-500">{err}</p>}
        <Field label="Email"><div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" /><TextInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="pl-9" /></div></Field>
        <Field label="Kata sandi"><div className="relative"><Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" /><TextInput type="password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" className="pl-9" /></div></Field>
        <div className="flex items-center justify-between text-[13px]">
          <Link to="/forgot" className="font-semibold text-brand-600 dark:text-brand-300 hover:underline">Lupa kata sandi?</Link>
        </div>
        <Btn type="submit" className="w-full" size="lg" disabled={busy}>{busy ? "Memverifikasi…" : <>Masuk<ArrowRight size={16} /></>}</Btn>
      </form>
      <p className="mt-5 rounded-lg bg-ink-100/60 dark:bg-ink-800/60 px-3.5 py-2.5 text-[12px] text-ink-500 dark:text-ink-300 leading-relaxed">
        <b className="text-ink-700 dark:text-ink-100">Info keamanan:</b> akun Super Admin dibuat saat instalasi. Akun Admin & Instruktur hanya dapat diterbitkan manual oleh Super Admin melalui dashboard.
      </p>
      <p className="mt-5 text-sm text-ink-400">Belum punya akun? <Link to="/register" className="font-bold text-brand-600 dark:text-brand-300 hover:underline">Daftar gratis</Link></p>
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
      <div className="my-5 flex items-center gap-3">
        <span className="h-px grow bg-ink-200 dark:bg-ink-700" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-300">atau</span>
        <span className="h-px grow bg-ink-200 dark:bg-ink-700" />
      </div>
      <GoogleButton label="Daftar dengan akun Google" />
      <p className="mt-4 rounded-lg bg-ink-100/60 dark:bg-ink-800/60 px-3.5 py-2.5 text-[12px] text-ink-500 dark:text-ink-300 leading-relaxed">
        Pendaftaran publik membuat akun <b className="text-ink-700 dark:text-ink-100">Siswa</b>. Akun Admin & Instruktur diterbitkan manual oleh Super Admin.
      </p>
      <p className="mt-5 text-sm text-ink-400">Sudah punya akun? <Link to="/login" className="font-bold text-brand-600 dark:text-brand-300 hover:underline">Masuk</Link></p>
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
