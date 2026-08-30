import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import {
  Users, GraduationCap, CreditCard, Award, BookOpen, Newspaper, FileText, Wallet,
  ArrowRight, Play, HelpCircle, TrendingUp, CheckCircle2,
} from "lucide-react";
import { useApp } from "../lib/store";
import { courseProgress, fmtDate, fmtIDR, fmtNum, walletBalance, ago } from "../lib/db";
import { Badge, Btn, Progress, StatCard, statusTone, cx } from "../components/ui";
import { roleBase } from "../components/shell";

function useMonthSeries() {
  const { db } = useApp();
  return useMemo(() => {
    const out: { m: string; enroll: number; revenue: number }[] = [];
    const baseEnroll = [11, 14, 12, 18, 16, 21];
    const baseRevenue = [3100, 4200, 3700, 5300, 4800, 6200];
    let idx = 0;
    for (let i = 5; i >= 0; i--, idx++) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleDateString("id-ID", { month: "short" });
      const enroll = db?.enrollments.filter((e) => { const x = new Date(e.date); return `${x.getFullYear()}-${x.getMonth()}` === key; }).length ?? 0;
      const revenue = db?.payments.filter((p) => p.status === "paid" && (() => { const x = new Date(p.date); return `${x.getFullYear()}-${x.getMonth()}` === key; })()).reduce((s, p) => s + p.amount, 0) ?? 0;
      out.push({ m: label, enroll: baseEnroll[idx] + enroll, revenue: baseRevenue[idx] + Math.round(revenue / 1000) });
    }
    return out;
  }, [db]);
}

const ChartTip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) =>
  active && payload?.length ? (
    <div className="rounded-lg border border-ink-100 dark:border-ink-700 bg-card dark:bg-ink-850 px-3 py-2 text-xs shadow-pop">
      <p className="font-bold text-ink-800 dark:text-white">{label}</p>
      {payload.map((p) => <p key={p.name} className="text-ink-500 dark:text-ink-300 font-mono">{p.name}: {fmtNum(p.value)}</p>)}
    </div>
  ) : null;

function PanelHead({ title, sub, to, toLabel }: { title: string; sub?: string; to?: string; toLabel?: string }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div><h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">{title}</h2>{sub && <p className="text-[13px] text-ink-400">{sub}</p>}</div>
      {to && <Link to={to} className="text-[13px] font-bold text-brand-600 dark:text-brand-300 flex items-center gap-1 hover:gap-2 transition-all">{toLabel ?? "Lihat"}<ArrowRight size={13} /></Link>}
    </div>
  );
}
const panel = "rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-5";

export function SuperAdminOverview() {
  const { db, user } = useApp();
  const series = useMonthSeries();
  if (!db || !user) return null;
  const revenue = db.payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-ink-900 dark:bg-ink-950 text-white p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute -right-16 -top-24 w-72 h-72 rounded-full bg-brand-500/20 blur-[90px]" />
        <p className="relative font-mono text-[12px] text-brand-300"><span className="text-accent-400">$</span> kmsit status --all</p>
        <h1 className="relative mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight">Selamat datang, {user.name.split(" ")[0]}.</h1>
        <p className="relative mt-1.5 text-ink-300 text-sm max-w-lg">Kontrol penuh platform: konten, LMS, transaksi, integrasi, dan pengaturan inti. {db.notifications.filter((n) => n.userId === user.id && !n.read).length} notifikasi belum dibaca.</p>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Siswa" value={fmtNum(db.users.filter((u) => u.role === "student").length)} sub={`+${db.users.filter((u) => u.role === "student" && Date.now() - new Date(u.joined).getTime() < 30 * 864e5).length} bulan ini`} icon={<Users size={19} />} />
        <StatCard label="Kelas Terbit" value={db.courses.filter((c) => c.status === "published").length} sub={`${db.courses.length} total kelas`} icon={<GraduationCap size={19} />} tone="accent" />
        <StatCard label="Pendapatan Kotor" value={fmtIDR(revenue)} sub={`${db.payments.filter((p) => p.status === "paid").length} transaksi sukses`} icon={<CreditCard size={19} />} tone="ok" />
        <StatCard label="Sertifikat Terbit" value={fmtNum(db.certificates.length)} sub="terverifikasi QR" icon={<Award size={19} />} tone="info" />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className={panel}>
          <PanelHead title="Pendaftaran & Pendapatan" sub="6 bulan terakhir" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#17a58c" stopOpacity={0.35} /><stop offset="100%" stopColor="#17a58c" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#eaa93f" stopOpacity={0.3} /><stop offset="100%" stopColor="#eaa93f" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#9daba1" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9daba1" }} axisLine={false} tickLine={false} width={34} />
                <Tooltip content={<ChartTip />} />
                <Area name="Enroll" dataKey="enroll" stroke="#17a58c" strokeWidth={2.2} fill="url(#ge)" />
                <Area name="Revenue (rb)" dataKey="revenue" stroke="#eaa93f" strokeWidth={2.2} fill="url(#gr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={panel}>
          <PanelHead title="Pembayaran Terbaru" to="payments" toLabel="Semua" />
          <div className="space-y-2.5">
            {db.payments.slice(0, 5).map((p) => {
              const stu = db.users.find((u) => u.id === p.studentId);
              const c = db.courses.find((x) => x.id === p.courseId);
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-3.5 py-2.5 hover:border-brand-300 dark:hover:border-ink-600 transition-colors">
                  <span className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0"><CreditCard size={15} /></span>
                  <div className="min-w-0 grow">
                    <p className="text-[13px] font-bold text-ink-800 dark:text-ink-50 truncate">{stu?.name} · {c?.title}</p>
                    <p className="text-[11px] font-mono text-ink-400">{p.invoice} · {p.provider} · {ago(p.date)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold font-mono text-ink-800 dark:text-ink-50">{fmtIDR(p.amount)}</p>
                    <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className={panel}>
        <PanelHead title="Aktivitas Terbaru" to="activity" toLabel="Log lengkap" />
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-2.5">
          {db.logs.slice(0, 6).map((l) => (
            <div key={l.id} className="flex items-center gap-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
              <p className="text-[13.5px] text-ink-600 dark:text-ink-200 grow truncate"><b>{l.userName}</b> — {l.detail}</p>
              <span className="text-[11px] font-mono text-ink-300 shrink-0">{ago(l.date)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminOverview() {
  const { db, user } = useApp();
  if (!db || !user) return null;
  const cards = [
    { label: "Artikel", v: db.articles.length, icon: <FileText size={19} />, to: "articles" },
    { label: "Berita", v: db.news.length, icon: <Newspaper size={19} />, to: "news" },
    { label: "Tutorial", v: db.tutorials.length, icon: <BookOpen size={19} />, to: "tutorials" },
    { label: "Kelas", v: db.courses.length, icon: <GraduationCap size={19} />, to: "courses" },
  ];
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-ink-900 dark:bg-ink-950 text-white p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <p className="relative font-mono text-[12px] text-brand-300"><span className="text-accent-400">$</span> role: admin · izin terbatas</p>
        <h1 className="relative mt-2 font-display text-2xl font-bold tracking-tight">Halo, {user.name.split(" ")[0]}.</h1>
        <p className="relative mt-1.5 text-ink-300 text-sm">Kelola konten, moderasi kelas & instruktur sesuai permission yang diberikan Super Admin.</p>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="block">
            <StatCard label={c.label} value={c.v} sub="kelola →" icon={c.icon} />
          </Link>
        ))}
      </div>
      <div className={panel}>
        <PanelHead title="Konten terbaru" />
        <div className="space-y-2">
          {[...db.articles.map((a) => ({ id: a.id, kind: "Artikel", t: a.title, s: a.status, d: a.publishedAt })),
          ...db.news.map((n) => ({ id: n.id, kind: "Berita", t: n.title, s: n.status, d: n.publishedAt })),
          ...db.tutorials.map((tu) => ({ id: tu.id, kind: "Tutorial", t: tu.title, s: tu.status, d: tu.publishedAt }))]
            .sort((a, b) => b.d.localeCompare(a.d)).slice(0, 6)
            .map((x) => (
              <div key={x.kind + x.id} className="flex items-center gap-3 py-1.5">
                <Badge tone="neutral">{x.kind}</Badge>
                <p className="text-[13.5px] font-semibold text-ink-700 dark:text-ink-100 grow truncate">{x.t}</p>
                <Badge tone={statusTone(x.s)}>{x.s}</Badge>
                <span className="text-[11px] font-mono text-ink-300 hidden sm:block">{fmtDate(x.d)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export function InstructorOverview() {
  const { db, user } = useApp();
  if (!db || !user) return null;
  const my = db.courses.filter((c) => c.instructorId === user.id);
  const myIds = my.map((c) => c.id);
  const students = db.enrollments.filter((e) => myIds.includes(e.courseId));
  const wb = walletBalance(db, user.id);
  const attempts = db.attempts.filter((a) => myIds.includes(a.courseId)).sort((a, b) => b.date.localeCompare(a.date));
  const barData = my.map((c) => ({ m: c.title.split(" ").slice(0, 2).join(" "), siswa: db.enrollments.filter((e) => e.courseId === c.id).length }));
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-ink-900 dark:bg-ink-950 text-white p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute -right-16 -top-24 w-72 h-72 rounded-full bg-accent-500/15 blur-[90px]" />
        <p className="relative font-mono text-[12px] text-brand-300"><span className="text-accent-400">$</span> instructor.dashboard --user {user.email}</p>
        <h1 className="relative mt-2 font-display text-2xl font-bold tracking-tight">Halo, {user.name.split(" ")[0]}.</h1>
        <p className="relative mt-1.5 text-ink-300 text-sm">Saldo tersedia <b className="text-accent-300">{fmtIDR(wb.available)}</b> · {students.length} siswa aktif di {my.length} kelas.</p>
        <Link to="wallet" className="relative inline-flex mt-4"><Btn variant="accent" size="sm"><Wallet size={15} />Kelola Saldo</Btn></Link>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Kelas Saya" value={my.length} icon={<GraduationCap size={19} />} />
        <StatCard label="Total Siswa" value={students.length} icon={<Users size={19} />} tone="info" />
        <StatCard label="Pendapatan Bersih" value={fmtIDR(wb.total)} sub="setelah biaya platform 15%" icon={<TrendingUp size={19} />} tone="ok" />
        <StatCard label="Quiz Dibuat" value={db.quizzes.filter((q) => myIds.includes(q.courseId)).length} icon={<HelpCircle size={19} />} tone="accent" />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className={panel}>
          <PanelHead title="Siswa per kelas" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#9daba1" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9daba1" }} axisLine={false} tickLine={false} width={26} allowDecimals={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(23,165,140,0.06)" }} />
                <Bar name="Siswa" dataKey="siswa" fill="#17a58c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={panel}>
          <PanelHead title="Hasil quiz terbaru" sub="Siswa di kelas Anda" />
          <div className="space-y-2.5">
            {attempts.slice(0, 5).map((a) => {
              const s = db.users.find((u) => u.id === a.studentId);
              const q = db.quizzes.find((x) => x.id === a.quizId);
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-3.5 py-2.5">
                  <span className={cx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", a.passed ? "bg-ok-500/12 text-ok-500" : "bg-bad-500/12 text-bad-500")}><CheckCircle2 size={15} /></span>
                  <div className="min-w-0 grow">
                    <p className="text-[13px] font-bold text-ink-800 dark:text-ink-50 truncate">{s?.name}</p>
                    <p className="text-[11px] font-mono text-ink-400 truncate">{q?.title} · {ago(a.date)}</p>
                  </div>
                  <Badge tone={a.passed ? "ok" : "bad"}>{a.percent}%</Badge>
                </div>
              );
            })}
            {attempts.length === 0 && <p className="text-sm text-ink-400 py-6 text-center">Belum ada percobaan quiz.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentOverview() {
  const { db, user } = useApp();
  if (!db || !user) return null;
  const mine = db.enrollments.filter((e) => e.studentId === user.id);
  const certs = db.certificates.filter((c) => c.studentId === user.id);
  const attempts = db.attempts.filter((a) => a.studentId === user.id).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-ink-900 dark:bg-ink-950 text-white p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute -right-16 -top-24 w-72 h-72 rounded-full bg-brand-500/20 blur-[90px]" />
        <p className="relative font-mono text-[12px] text-brand-300"><span className="text-accent-400">$</span> kmsit learn --continue</p>
        <h1 className="relative mt-2 font-display text-2xl font-bold tracking-tight">Semangat belajar, {user.name.split(" ")[0]}!</h1>
        <p className="relative mt-1.5 text-ink-300 text-sm">{mine.length} kelas diikuti · {certs.length} sertifikat diraih.</p>
        <Link to="/courses" className="relative inline-flex mt-4"><Btn variant="accent" size="sm">Jelajahi Kelas Baru<ArrowRight size={15} /></Btn></Link>
      </div>
      <div>
        <PanelHead title="Lanjutkan belajar" to="my-courses" toLabel="Semua kelas" />
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {mine.slice(0, 3).map((e) => {
            const c = db.courses.find((x) => x.id === e.courseId);
            if (!c) return null;
            const prog = courseProgress(c, e);
            return (
              <Link key={e.id} to={`/learn/${c.id}`} className="group rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden hover:shadow-pop hover:-translate-y-0.5 transition-all">
                <div className="relative" style={{ aspectRatio: "16/8" }}>
                  <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                  <span className="absolute inset-0 bg-ink-950/25 group-hover:bg-ink-950/10 transition-colors flex items-center justify-center">
                    <span className="w-10 h-10 rounded-full bg-white/90 text-ink-900 flex items-center justify-center group-hover:scale-110 transition-transform"><Play size={16} className="fill-current ml-0.5" /></span>
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-display font-semibold text-[14.5px] text-ink-900 dark:text-white leading-snug line-clamp-2 group-hover:text-brand-700 dark:group-hover:text-brand-300">{c.title}</p>
                  <div className="mt-3 flex items-center gap-2.5">
                    <div className="grow"><Progress value={prog} tone={prog === 100 ? "ok" : "brand"} /></div>
                    <span className="text-[11px] font-mono font-bold text-ink-500 dark:text-ink-300">{prog}%</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {mine.length === 0 && (
            <div className="sm:col-span-2 xl:col-span-3 rounded-xl border border-dashed border-ink-200 dark:border-ink-700 p-10 text-center">
              <p className="font-display font-semibold text-ink-700 dark:text-ink-100">Belum ada kelas yang diikuti</p>
              <p className="text-sm text-ink-400 mt-1">Mulai dari kelas gratis UI/UX Design dengan Figma.</p>
              <Link to="/courses" className="inline-block mt-4"><Btn size="sm">Cari Kelas</Btn></Link>
            </div>
          )}
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className={panel}>
          <PanelHead title="Nilai quiz" to="grades" />
          <div className="space-y-2.5">
            {attempts.slice(0, 5).map((a) => {
              const q = db.quizzes.find((x) => x.id === a.quizId);
              return (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-3.5 py-2.5">
                  <div className="min-w-0"><p className="text-[13px] font-bold text-ink-800 dark:text-ink-50 truncate">{q?.title}</p><p className="text-[11px] font-mono text-ink-400">{fmtDate(a.date)}</p></div>
                  <Badge tone={a.passed ? "ok" : "bad"}>{a.percent}% · {a.passed ? "LULUS" : "GAGAL"}</Badge>
                </div>
              );
            })}
            {attempts.length === 0 && <p className="text-sm text-ink-400 py-5 text-center">Belum pernah mengikuti quiz.</p>}
          </div>
        </div>
        <div className={panel}>
          <PanelHead title="Sertifikat saya" to="certificates" />
          <div className="space-y-2.5">
            {certs.map((ct) => {
              const c = db.courses.find((x) => x.id === ct.courseId);
              return (
                <Link key={ct.id} to={`/certificate/${ct.code}`} className="flex items-center gap-3 rounded-lg border border-accent-400/40 bg-accent-500/8 px-3.5 py-3 hover:bg-accent-500/15 transition-colors group">
                  <span className="w-9 h-9 rounded-lg bg-accent-500/20 text-accent-600 dark:text-accent-300 flex items-center justify-center"><Award size={17} /></span>
                  <div className="min-w-0 grow">
                    <p className="text-[13px] font-bold text-ink-800 dark:text-ink-50 truncate">{c?.title}</p>
                    <p className="text-[11px] font-mono text-ink-400">{ct.code} · {fmtDate(ct.issuedAt)}</p>
                  </div>
                  <ArrowRight size={15} className="text-accent-600 dark:text-accent-300 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              );
            })}
            {certs.length === 0 && <p className="text-sm text-ink-400 py-5 text-center">Selesaikan kelas untuk meraih sertifikat.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
export { roleBase as _rb };
