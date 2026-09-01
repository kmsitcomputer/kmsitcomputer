import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  Play, FileText, Clock, Users, Star, ArrowRight, GraduationCap, CheckCircle2, QrCode,
  ShieldCheck, ShieldX, Search, ChevronDown, CalendarDays, BookOpen, Newspaper, Briefcase, Award, Sparkles,
} from "lucide-react";
import { useApp } from "../lib/store";
import {
  fmtIDR, fmtDate, fmtNum, ytThumb, PLATFORM_FEE, uid, courseLessons, IMG,
  type Article, type Course, type NewsItem, type Program, type Tutorial,
} from "../lib/db";
import { Badge, Btn, CoverArt, cx, EmptyState, Reveal, SearchInput, Select, Stars, YouTubeEmbed } from "../components/ui";

const lessonTypeIcon = (t: string) => t === "video" ? <Play size={14} /> : t === "quiz" ? <QrCode size={14} /> : <FileText size={14} />;

// ─── Typing terminal ────────────────────────────────────────────────────────
const TERM_LINES = [
  { p: "$", txt: " kmsit enroll \"Full-Stack Bootcamp\"", c: "text-brand-300" },
  { p: "✓", txt: " akses kelas diberikan · 10 lesson", c: "text-ok-500" },
  { p: "$", txt: " kmsit quiz run --final", c: "text-brand-300" },
  { p: "✓", txt: " skor 92/100 · LULUS", c: "text-ok-500" },
  { p: "$", txt: " kmsit certificate issue", c: "text-brand-300" },
  { p: "✓", txt: " KMSIT-2025-8F42K1 · terverifikasi", c: "text-accent-300" },
];
function Terminal() {
  const [tick, setTick] = useState({ li: 0, ch: 0 });
  useEffect(() => {
    const iv = window.setInterval(() => {
      setTick((s) => {
        const line = TERM_LINES[s.li];
        if (!line) return { li: 0, ch: 0 };
        if (s.ch < line.txt.length) return { li: s.li, ch: s.ch + 1 };
        if (s.li === TERM_LINES.length - 1) return { li: TERM_LINES.length, ch: 0 };
        return { li: s.li + 1, ch: 0 };
      });
    }, 42);
    return () => window.clearInterval(iv);
  }, []);
  useEffect(() => {
    if (tick.li >= TERM_LINES.length) {
      const t = window.setTimeout(() => setTick({ li: 0, ch: 0 }), 3200);
      return () => window.clearTimeout(t);
    }
  }, [tick]);
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-950/95 shadow-pop overflow-hidden scanline relative">
      <div className="flex items-center gap-1.5 px-4 h-9 border-b border-white/5 bg-white/[0.03]">
        <span className="w-2.5 h-2.5 rounded-full bg-bad-500/80" /><span className="w-2.5 h-2.5 rounded-full bg-warn-500/80" /><span className="w-2.5 h-2.5 rounded-full bg-ok-500/80" />
        <span className="ml-3 text-[11px] font-mono text-ink-400">kmsit — learning shell</span>
      </div>
      <div className="p-5 font-mono text-[13px] leading-7 min-h-[196px]">
        {TERM_LINES.map((l, i) => {
          if (i > tick.li) return null;
          const shown = i < tick.li ? l.txt : l.txt.slice(0, tick.ch);
          return (
            <div key={i} className="flex gap-2 whitespace-pre-wrap">
              <span className={cx("shrink-0 font-bold", l.p === "$" ? "text-accent-400" : l.c)}>{l.p}</span>
              <span className={l.p === "$" ? "text-ink-100" : l.c}>{shown}{i === tick.li && <span className="cursor-blink text-brand-300">▊</span>}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Cards ──────────────────────────────────────────────────────────────────
export function CourseCard({ c, delay = 0 }: { c: Course; delay?: number }) {
  const { db } = useApp();
  if (!db) return null;
  const cat = db.categories.course.find((x) => x.id === c.categoryId);
  const ins = db.users.find((u) => u.id === c.instructorId);
  const students = db.enrollments.filter((e) => e.courseId === c.id).length;
  const lessons = courseLessons(c).length;
  return (
    <Reveal delay={delay}>
      <Link to={`/courses/${c.slug}`} className="group block rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden hover:shadow-pop hover:-translate-y-1 transition-all duration-300">
        <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <img src={c.thumbnail} alt={c.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
          <span className="absolute top-3 left-3"><Badge tone="brand" className="backdrop-blur bg-card/90">{cat?.name}</Badge></span>
          {c.price === 0
            ? <span className="absolute top-3 right-3"><Badge tone="ok" className="bg-ok-500 text-white border-ok-500">Gratis</Badge></span>
            : <span className="absolute bottom-3 right-3 font-display font-bold text-white text-[15px] drop-shadow">{fmtIDR(c.price)}</span>}
          <span className="absolute bottom-3 left-3 text-[11px] font-mono text-ink-100 bg-ink-950/60 rounded px-1.5 py-0.5">{lessons} lesson · {c.level}</span>
        </div>
        <div className="p-4">
          <h3 className="font-display font-semibold text-[15px] leading-snug text-ink-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors line-clamp-2">{c.title}</h3>
          <p className="mt-1.5 text-[13px] text-ink-400 line-clamp-2 leading-relaxed">{c.description}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
            <span className="font-semibold text-ink-600 dark:text-ink-200">{ins?.name}</span>
            <span className="flex items-center gap-1"><Star size={12} className="fill-accent-400 text-accent-400" />{c.rating} · <Users size={12} />{students}</span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

function SectionHead({ title, subtitle, more }: { title: string; subtitle?: string; more?: { to: string; label: string } }) {
  return (
    <Reveal className="flex flex-wrap items-end justify-between gap-3 mb-7">
      <div>
        <h2 className="font-display text-2xl sm:text-[28px] font-bold text-ink-900 dark:text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-[15px] text-ink-400 mt-1">{subtitle}</p>}
      </div>
      {more && <Link to={more.to} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 dark:text-brand-300 hover:gap-2.5 transition-all">{more.label}<ArrowRight size={15} /></Link>}
    </Reveal>
  );
}

// ─── Home (CMS-driven) ──────────────────────────────────────────────────────
export function HomePage() {
  const { db, user, t } = useApp();
  const [q, setQ] = useState("");
  const nav = useNavigate();
  if (!db) return null;
  const sections = [...db.homeSections].filter((s) => s.enabled).sort((a, b) => a.order - b.order);
  const s = db.settings;
  const published = db.courses.filter((c) => c.status === "published");
  const instructors = db.users.filter((u) => u.role === "instructor");
  const students = db.users.filter((u) => u.role === "student").length;

  const render = (sec: typeof sections[0]) => {
    switch (sec.type) {
      case "hero": return (
        <section key={sec.id} className="relative bg-ink-900 dark:bg-ink-950 text-white overflow-hidden">
          <div className="absolute inset-0 grid-bg" />
          <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-brand-500/15 blur-[110px]" />
          <div className="absolute -bottom-40 -left-24 w-[380px] h-[380px] rounded-full bg-accent-500/10 blur-[100px]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <Reveal>
              <p className="font-mono text-[12px] text-brand-300 mb-4"><span className="text-accent-400">$</span> ./start-learning --year 2025</p>
              <h1 className="font-display text-[38px] sm:text-[52px] leading-[1.05] font-bold tracking-tight">
                {sec.title.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="text-brand-300">{sec.title.split(" ").slice(-2).join(" ")}</span>
              </h1>
              <p className="mt-5 text-[16px] text-ink-200 leading-relaxed max-w-lg">{sec.subtitle}</p>
              <form className="mt-7 flex max-w-md rounded-xl bg-white/5 border border-white/10 p-1.5 focus-within:border-brand-400 transition-colors"
                onSubmit={(e) => { e.preventDefault(); nav(`/courses?q=${encodeURIComponent(q)}`); }}>
                <Search size={16} className="self-center ml-3 text-ink-300 shrink-0" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kelas: React, Mikrotik, Python…"
                  className="grow bg-transparent px-3 text-sm text-white placeholder:text-ink-400 focus:outline-none" />
                <Btn variant="accent" size="sm" type="submit">{t("act.search").replace("…", "")}</Btn>
              </form>
              <div className="mt-6 flex flex-wrap gap-2">
                {["React", "Mikrotik", "Python", "Figma"].map((tag) => (
                  <Link key={tag} to={`/courses?q=${tag}`} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-ink-200 hover:border-brand-400 hover:text-brand-300 transition-colors">#{tag}</Link>
                ))}
              </div>
            </Reveal>
            <Reveal delay={120} className="relative">
              <Terminal />
              <div className="absolute -bottom-5 -left-5 hidden sm:flex items-center gap-2.5 rounded-xl bg-card dark:bg-ink-850 text-ink-900 dark:text-white px-4 py-3 shadow-pop border border-ink-100 dark:border-ink-700">
                <span className="flex text-accent-400">{[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-current" />)}</span>
                <span className="text-xs font-bold">4.8/5 · 2.300+ ulasan alumni</span>
              </div>
            </Reveal>
          </div>
          <div className="relative border-t border-white/5 bg-ink-950/60 overflow-hidden py-3">
            <div className="ticker flex gap-10 w-max font-mono text-[12px] text-ink-400">
              {[...Array(2)].map((_, r) => (
                <span key={r} className="flex gap-10">
                  {["HTML & CSS", "JavaScript", "React", "Node.js", "MySQL", "Laravel", "Mikrotik", "Python", "Pandas", "Figma", "Git", "Linux Server"].map((x) => <span key={x} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-sm bg-brand-400" />{x}</span>)}
                </span>
              ))}
            </div>
          </div>
        </section>
      );
      case "stats": return (
        <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 -mt-0 pt-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: fmtNum(students + 4791), l: "Siswa terdaftar", d: "+120 bulan ini" },
              { n: String(published.length), l: "Kelas aktif", d: "4 kategori bidang" },
              { n: String(instructors.length + 9), l: "Instruktur praktisi", d: "rata-rata 6 th pengalaman" },
              { n: fmtNum(db.certificates.length + 1876), l: "Sertifikat terbit", d: "terverifikasi QR" },
            ].map((x, i) => (
              <Reveal key={x.l} delay={i * 80}>
                <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-5">
                  <p className="font-display text-[26px] sm:text-3xl font-bold text-brand-600 dark:text-brand-300">{x.n}</p>
                  <p className="text-sm font-bold text-ink-700 dark:text-ink-100 mt-1">{x.l}</p>
                  <p className="text-xs text-ink-400 mt-0.5 font-mono">{x.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      );
      case "featured": return (
        <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
          <SectionHead title={sec.title} subtitle={sec.subtitle} more={{ to: "/courses", label: "Semua kelas" }} />
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[...published].sort((a, b) => b.rating - a.rating).slice(0, 4).map((c, i) => <CourseCard key={c.id} c={c} delay={i * 70} />)}
          </div>
        </section>
      );
      case "categories": return (
        <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
          <SectionHead title={sec.title} subtitle={sec.subtitle} />
          <div className="flex flex-wrap gap-3">
            {db.categories.course.map((cat, i) => {
              const n = published.filter((c) => c.categoryId === cat.id).length;
              return (
                <Reveal key={cat.id} delay={i * 60}>
                  <Link to={`/courses?cat=${cat.slug}`} className="group flex items-center gap-3 rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 px-5 py-4 hover:border-brand-400 hover:shadow-lift transition-all">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-display font-bold" style={{ background: cat.color }}>{cat.name[0]}</span>
                    <span><span className="block text-sm font-bold text-ink-800 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300">{cat.name}</span>
                      <span className="text-xs text-ink-400 font-mono">{n} kelas</span></span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      );
      case "tutorials": return (
        <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
          <SectionHead title={sec.title} subtitle={sec.subtitle} more={{ to: "/tutorials", label: "Semua tutorial" }} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {db.tutorials.filter((x) => x.status === "published").slice(0, 3).map((x, i) => <TutorialCard key={x.id} x={x} delay={i * 70} />)}
          </div>
        </section>
      );
      case "articles": return (
        <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
          <SectionHead title={sec.title} subtitle={sec.subtitle} more={{ to: "/articles", label: "Semua artikel" }} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {db.articles.filter((x) => x.status === "published").slice(0, 3).map((x, i) => <ArticleCard key={x.id} a={x} delay={i * 70} />)}
          </div>
        </section>
      );
      case "news": return (
        <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
          <SectionHead title={sec.title} subtitle={sec.subtitle} more={{ to: "/news", label: "Semua berita" }} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {db.news.filter((x) => x.status === "published").slice(0, 3).map((x, i) => <NewsCard key={x.id} n={x} delay={i * 70} />)}
          </div>
        </section>
      );
      case "programs": return (
        <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
          <SectionHead title={sec.title} subtitle={sec.subtitle} more={{ to: "/programs", label: "Semua program" }} />
          <div className="grid md:grid-cols-2 gap-5">
            {db.programs.filter((p) => p.status === "published").slice(0, 2).map((p, i) => <ProgramCard key={p.id} p={p} delay={i * 80} />)}
          </div>
        </section>
      );
      case "instructors": return (
        <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
          <SectionHead title={sec.title} subtitle={sec.subtitle} />
          <div className="grid sm:grid-cols-3 gap-5">
            {instructors.map((ins, i) => {
              const n = published.filter((c) => c.instructorId === ins.id).length;
              return (
                <Reveal key={ins.id} delay={i * 80}>
                  <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-6 text-center hover:shadow-lift transition-all">
                    <span className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-white font-display font-bold text-xl" style={{ background: `linear-gradient(135deg, ${ins.color}, ${ins.color}bb)` }}>
                      {ins.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                    <p className="mt-3 font-display font-semibold text-ink-900 dark:text-white">{ins.name}</p>
                    <p className="text-xs text-ink-400 font-mono mt-0.5">{n} kelas aktif</p>
                    <p className="text-[13px] text-ink-500 dark:text-ink-300 mt-2 leading-relaxed">{ins.bio}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      );
      case "testimonials": return (
        <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
          <SectionHead title={sec.title} subtitle={sec.subtitle} />
          <div className="grid md:grid-cols-3 gap-5">
            {db.testimonials.map((ts, i) => (
              <Reveal key={ts.id} delay={i * 80}>
                <figure className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-6 flex flex-col h-full">
                  <Stars n={ts.rating} />
                  <blockquote className="mt-3 text-[14.5px] text-ink-600 dark:text-ink-200 leading-relaxed grow">“{ts.text}”</blockquote>
                  <figcaption className="mt-4 pt-4 border-t border-ink-100 dark:border-ink-800">
                    <p className="text-sm font-bold text-ink-900 dark:text-white">{ts.name}</p>
                    <p className="text-xs text-ink-400">{ts.role}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      );
      case "cta": return (
        <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-ink-900 dark:bg-ink-900 border border-ink-800 px-6 sm:px-12 py-12 sm:py-14 flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <div className="absolute inset-0 grid-bg opacity-60" />
              <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-brand-500/20 blur-[90px]" />
              <div className="relative grow">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">{sec.title}</h2>
                <p className="mt-2 text-ink-200 max-w-md">{sec.subtitle}</p>
                <p className="mt-4 font-mono text-[13px] text-brand-300"><span className="text-accent-400">$</span> kmsit register --free</p>
              </div>
              <div className="relative flex flex-wrap gap-3">
                {user ? <Link to={`/dashboard/${user.role === "super_admin" ? "super-admin" : user.role}`}><Btn variant="accent" size="lg">Buka Dashboard<ArrowRight size={16} /></Btn></Link>
                  : <>
                    <Link to="/register"><Btn variant="accent" size="lg">Daftar Gratis<ArrowRight size={16} /></Btn></Link>
                    <Link to="/courses"><Btn size="lg" className="bg-white/10 hover:bg-white/20 border border-white/15">{t("nav.courses")}</Btn></Link>
                  </>}
              </div>
            </div>
          </Reveal>
        </section>
      );
      default: return null;
    }
  };
  return <div className="pb-4">{sections.map(render)}</div>;
}

// ─── Editorial cards ────────────────────────────────────────────────────────
function TagPill({ label, color }: { label: string; color: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold" style={{ background: `${color}1a`, color }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />{label}</span>;
}
export function ArticleCard({ a, delay = 0 }: { a: Article; delay?: number }) {
  const { db } = useApp();
  const cat = db?.categories.article.find((c) => c.id === a.categoryId);
  return (
    <Reveal delay={delay}>
      <Link to={`/articles/${a.slug}`} className="group block rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden hover:shadow-pop hover:-translate-y-1 transition-all duration-300">
        <div style={{ aspectRatio: "16/9" }} className="overflow-hidden"><CoverArt hue={a.hue} seed={a.id} label={a.title} className="group-hover:scale-[1.04] transition-transform duration-500" /></div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-[11px] text-ink-400 font-mono"><CalendarDays size={11} />{fmtDate(a.publishedAt)} · {fmtNum(a.views)}x dibaca</div>
          <h3 className="mt-2 font-display font-semibold text-[15px] leading-snug text-ink-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors line-clamp-2">{a.title}</h3>
          <p className="mt-1.5 text-[13px] text-ink-400 line-clamp-2">{a.excerpt}</p>
          <div className="mt-3">{cat && <TagPill label={cat.name} color={cat.color} />}</div>
        </div>
      </Link>
    </Reveal>
  );
}
export function NewsCard({ n, delay = 0 }: { n: NewsItem; delay?: number }) {
  const { db } = useApp();
  const cat = db?.categories.news.find((c) => c.id === n.categoryId);
  return (
    <Reveal delay={delay}>
      <Link to={`/news/${n.slug}`} className="group flex gap-4 rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-3.5 hover:shadow-pop transition-all duration-300">
        <div className="w-28 sm:w-36 shrink-0 rounded-lg overflow-hidden" style={{ aspectRatio: "4/3" }}><CoverArt hue={n.hue} seed={n.id} label={n.title} /></div>
        <div className="min-w-0 py-0.5">
          <div className="flex items-center gap-2">{cat && <TagPill label={cat.name} color={cat.color} />}<span className="text-[11px] text-ink-400 font-mono">{fmtDate(n.publishedAt)}</span></div>
          <h3 className="mt-1.5 font-display font-semibold text-[14.5px] leading-snug text-ink-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors line-clamp-2">{n.title}</h3>
          <p className="mt-1 text-[12.5px] text-ink-400 line-clamp-2">{n.excerpt}</p>
        </div>
      </Link>
    </Reveal>
  );
}
export function TutorialCard({ x, delay = 0 }: { x: Tutorial; delay?: number }) {
  const { db } = useApp();
  const cat = db?.categories.tutorial.find((c) => c.id === x.categoryId);
  return (
    <Reveal delay={delay}>
      <Link to={`/tutorials/${x.slug}`} className="group block rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden hover:shadow-pop hover:-translate-y-1 transition-all duration-300">
        <div className="relative" style={{ aspectRatio: "16/9" }}>
          {x.youtubeId
            ? <img src={ytThumb(x.youtubeId)} alt={x.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
            : <CoverArt hue={x.hue} seed={x.id} label={x.title} className="group-hover:scale-[1.04] transition-transform duration-500" />}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-11 h-11 rounded-full bg-ink-950/70 backdrop-blur flex items-center justify-center text-white group-hover:bg-brand-600 group-hover:scale-110 transition-all"><Play size={17} className="ml-0.5" /></span>
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">{cat && <TagPill label={cat.name} color={cat.color} />}<span className="text-[11px] font-mono text-ink-400">{fmtNum(x.views)}x</span></div>
          <h3 className="mt-2 font-display font-semibold text-[15px] leading-snug text-ink-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">{x.title}</h3>
          <p className="mt-1 text-[13px] text-ink-400 line-clamp-2">{x.description}</p>
        </div>
      </Link>
    </Reveal>
  );
}
export function ProgramCard({ p, delay = 0 }: { p: Program; delay?: number }) {
  const { db } = useApp();
  const cat = db?.categories.program.find((c) => c.id === p.categoryId);
  return (
    <Reveal delay={delay}>
      <Link to={`/programs/${p.slug}`} className="group flex gap-5 rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-5 hover:shadow-pop transition-all duration-300">
        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden"><CoverArt hue={p.hue} seed={p.id} label={p.title} /></div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {cat && <TagPill label={cat.name} color={cat.color} />}
            <span className="text-[11px] font-mono text-ink-400 flex items-center gap-1"><Clock size={11} />{p.duration}</span>
            <span className="text-[11px] font-mono text-ink-400 flex items-center gap-1"><BookOpen size={11} />{p.courseIds.length} kelas</span>
          </div>
          <h3 className="mt-2 font-display font-semibold text-[16px] text-ink-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">{p.title}</h3>
          <p className="mt-1 text-[13px] text-ink-400 line-clamp-2">{p.description}</p>
        </div>
      </Link>
    </Reveal>
  );
}

// ─── Listing pages ──────────────────────────────────────────────────────────
function ListShell({ title, desc, children, icon }: { title: string; desc: string; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div>
      <div className="bg-ink-900 dark:bg-ink-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-brand-500/15 text-brand-300 border border-brand-500/25 mb-4">{icon}</span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-ink-200 max-w-xl">{desc}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">{children}</div>
    </div>
  );
}

export function CoursesPage() {
  const { db } = useApp();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [cat, setCat] = useState(sp.get("cat") ?? "");
  const [level, setLevel] = useState("");
  const [price, setPrice] = useState("");
  const [sort, setSort] = useState("popular");
  useEffect(() => {
    if (sp.get("focus") || sp.get("q")) {
      window.setTimeout(() => (document.querySelector<HTMLInputElement>('input[placeholder^="Cari kelas"]'))?.focus(), 60);
    }
  }, [sp]);
  if (!db) return null;
  let list = db.courses.filter((c) => c.status === "published");
  if (q) list = list.filter((c) => (c.title + c.description + c.tags.join(" ")).toLowerCase().includes(q.toLowerCase()));
  if (cat) list = list.filter((c) => c.categoryId === cat);
  if (level) list = list.filter((c) => c.level === level);
  if (price) list = list.filter((c) => (price === "free" ? c.price === 0 : c.price > 0));
  if (sort === "popular") list = [...list].sort((a, b) => db.enrollments.filter((e) => e.courseId === b.id).length - db.enrollments.filter((e) => e.courseId === a.id).length);
  if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
  if (sort === "priceAsc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "priceDesc") list = [...list].sort((a, b) => b.price - a.price);

  return (
    <ListShell title="Katalog Kelas" desc="Kelas online dengan kurikulum industri, quiz, dan sertifikat digital terverifikasi." icon={<GraduationCap size={20} />}>
      <div className="flex flex-col lg:flex-row gap-3 mb-7">
        <div className="grow"><SearchInput value={q} onChange={(v) => { setQ(v); setSp(v ? { q: v } : {}, { replace: true }); }} placeholder={"Cari kelas, topik, atau tag…"} /></div>
        <div className="flex flex-wrap gap-3">
          <Select value={cat} onChange={(e) => setCat(e.target.value)} className="w-44"><option value="">Semua kategori</option>{db.categories.course.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
          <Select value={level} onChange={(e) => setLevel(e.target.value)} className="w-36"><option value="">Semua level</option><option>Pemula</option><option>Menengah</option><option>Lanjutan</option></Select>
          <Select value={price} onChange={(e) => setPrice(e.target.value)} className="w-36"><option value="">Gratis & berbayar</option><option value="free">Gratis</option><option value="paid">Berbayar</option></Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-40"><option value="popular">Terpopuler</option><option value="rating">Rating tertinggi</option><option value="priceAsc">Harga terendah</option><option value="priceDesc">Harga tertinggi</option></Select>
        </div>
      </div>
      <p className="text-sm text-ink-400 mb-4 font-mono">{list.length} kelas ditemukan</p>
      {list.length === 0
        ? <EmptyState icon={<Search size={20} />} title="Tidak ada kelas yang cocok" desc="Coba kata kunci lain atau reset filter." action={<Btn variant="outline" size="sm" onClick={() => { setQ(""); setCat(""); setLevel(""); setPrice(""); }}>Reset filter</Btn>} />
        : <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{list.map((c, i) => <CourseCard key={c.id} c={c} delay={(i % 3) * 60} />)}</div>}
    </ListShell>
  );
}

function ArticleListPage({ kind }: { kind: "articles" | "news" | "tutorials" }) {
  const { db } = useApp();
  const [q, setQ] = useState("");
  if (!db) return null;
  const meta = {
    articles: { title: "Artikel", desc: "Insight, roadmap, dan panduan mendalam dari para praktisi.", icon: <FileText size={20} />, cats: db.categories.article },
    news: { title: "Berita", desc: "Kabar terbaru seputar kampus, kemitraan, dan prestasi siswa.", icon: <Newspaper size={20} />, cats: db.categories.news },
    tutorials: { title: "Tutorial", desc: "Panduan praktis step-by-step, lengkap dengan video.", icon: <BookOpen size={20} />, cats: db.categories.tutorial },
  }[kind];
  const [cat, setCat] = useState("");
  const items = (db[kind] as (Article | NewsItem | Tutorial)[]).filter((x) => x.status === "published")
    .filter((x) => !cat || x.categoryId === cat)
    .filter((x) => (x.title + ("excerpt" in x ? x.excerpt : "")).toLowerCase().includes(q.toLowerCase()));
  return (
    <ListShell title={meta.title} desc={meta.desc} icon={meta.icon}>
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        <div className="grow"><SearchInput value={q} onChange={setQ} placeholder={`Cari ${meta.title.toLowerCase()}…`} /></div>
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="w-48"><option value="">Semua kategori</option>{meta.cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
      </div>
      {kind === "news"
        ? <div className="grid gap-4">{items.map((x, i) => <NewsCard key={x.id} n={x as NewsItem} delay={(i % 3) * 60} />)}</div>
        : kind === "tutorials"
          ? <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{items.map((x, i) => <TutorialCard key={x.id} x={x as Tutorial} delay={(i % 3) * 60} />)}</div>
          : <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{items.map((x, i) => <ArticleCard key={x.id} a={x as Article} delay={(i % 3) * 60} />)}</div>}
      {items.length === 0 && <EmptyState icon={<Search size={20} />} title="Tidak ditemukan" desc="Tidak ada konten yang cocok dengan pencarianmu." />}
    </ListShell>
  );
}
export const ArticlesPage = () => <ArticleListPage kind="articles" />;
export const NewsPage = () => <ArticleListPage kind="news" />;
export const TutorialsPage = () => <ArticleListPage kind="tutorials" />;

export function ProgramsPage() {
  const { db } = useApp();
  if (!db) return null;
  return (
    <ListShell title="Program" desc="Jalur belajar terstruktur dengan target karir yang jelas dan pendampingan mentor." icon={<Briefcase size={20} />}>
      <div className="grid gap-5">{db.programs.filter((p) => p.status === "published").map((p, i) => <ProgramCard key={p.id} p={p} delay={i * 80} />)}</div>
    </ListShell>
  );
}

export function ProgramDetail() {
  const { db } = useApp();
  const { slug } = useParams();
  if (!db) return null;
  const p = db.programs.find((x) => x.slug === slug);
  if (!p) return <NotFoundBlock label="Program" />;
  const courses = db.courses.filter((c) => p.courseIds.includes(c.id) && c.status === "published");
  return (
    <ListShell title={p.title} desc={p.description} icon={<Briefcase size={20} />}>
      <div className="flex flex-wrap gap-2 mb-8">
        <Badge tone="brand"><Clock size={11} />{p.duration}</Badge>
        <Badge tone="neutral">{courses.length} kelas</Badge>
      </div>
      <SectionHead title="Kelas dalam program ini" subtitle="Selesaikan berurutan untuk hasil terbaik." />
      <div className="grid sm:grid-cols-2 gap-5">{courses.map((c, i) => <CourseCard key={c.id} c={c} delay={i * 70} />)}</div>
    </ListShell>
  );
}

// ─── Editorial detail ───────────────────────────────────────────────────────
function EditorialDetail({ kind }: { kind: "articles" | "news" | "tutorials" }) {
  const { db, update } = useApp();
  const { slug } = useParams();
  const counted = useRef(false);
  const item = db?.[kind].find((x) => x.slug === slug);
  useEffect(() => {
    if (item && !counted.current) {
      counted.current = true;
      update((d) => { const it = (d[kind] as { slug: string; views: number }[]).find((x) => x.slug === slug); if (it) it.views += 1; });
    }
  }, [item, kind, slug, update]);
  if (!db) return null;
  if (!item) return <NotFoundBlock label={kind === "articles" ? "Artikel" : kind === "news" ? "Berita" : "Tutorial"} />;
  const author = db.users.find((u) => u.id === item.authorId);
  const cats = db.categories[kind === "articles" ? "article" : kind === "news" ? "news" : "tutorial"];
  const cat = cats.find((c) => c.id === item.categoryId);
  const related = (db[kind] as (Article | NewsItem | Tutorial)[]).filter((x) => x.status === "published" && x.slug !== slug).slice(0, 3);
  return (
    <div>
      <div className="bg-ink-900 dark:bg-ink-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <Link to={`/${kind}`} className="text-[13px] font-mono text-brand-300 hover:text-brand-200">← /{kind}</Link>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight">{item.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[13px] text-ink-200">
            {cat && <TagPill label={cat.name} color={cat.color} />}
            <span className="flex items-center gap-1.5"><CalendarDays size={13} />{fmtDate(item.publishedAt)}</span>
            <span>·</span><span>{author?.name}</span>
            <span>·</span><span className="font-mono">{fmtNum(item.views)}x dibaca</span>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {"youtubeId" in item && item.youtubeId && <YouTubeEmbed id={item.youtubeId} className="mb-8" />}
        <article className="prose-cms text-ink-700 dark:text-ink-100" dangerouslySetInnerHTML={{ __html: item.content }} />
        {"tags" in item && item.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">{item.tags.map((tg: string) => <span key={tg} className="px-2.5 py-1 rounded-lg bg-ink-100 dark:bg-ink-800 text-xs font-mono text-ink-500 dark:text-ink-300">#{tg}</span>)}</div>
        )}
        <div className="mt-10 rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-4 flex items-center gap-3.5">
          <span className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold" style={{ background: author?.color }}>{author?.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
          <div><p className="text-sm font-bold text-ink-900 dark:text-white">{author?.name}</p><p className="text-xs text-ink-400">{author?.role === "instructor" ? "Instruktur KMSIT" : "Tim KMSIT"}</p></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <SectionHead title="Baca juga" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {related.map((x, i) => kind === "articles" ? <ArticleCard key={x.id} a={x as Article} delay={i * 60} /> : kind === "news" ? <NewsCard key={x.id} n={x as NewsItem} delay={i * 60} /> : <TutorialCard key={x.id} x={x as Tutorial} delay={i * 60} />)}
        </div>
      </div>
    </div>
  );
}
export const ArticleDetail = () => <EditorialDetail kind="articles" />;
export const NewsDetail = () => <EditorialDetail kind="news" />;
export const TutorialDetail = () => <EditorialDetail kind="tutorials" />;

function NotFoundBlock({ label }: { label: string }) {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <p className="font-mono text-brand-600 dark:text-brand-300 text-sm">404 · {label.toLowerCase()} not found</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink-900 dark:text-white">{label} tidak ditemukan</h1>
      <p className="mt-2 text-ink-400">Mungkin sudah dihapus atau slug-nya berubah.</p>
      <Link to="/" className="inline-block mt-6"><Btn>Kembali ke beranda</Btn></Link>
    </div>
  );
}
export { NotFoundBlock };

export function CustomPage() {
  const { db } = useApp();
  const { slug } = useParams();
  if (!db) return null;
  const page = db.pages.find((p) => p.slug === slug && p.status === "published");
  if (!page) return <NotFoundBlock label="Halaman" />;
  return (
    <ListShell title={page.title} desc="" icon={<FileText size={20} />}>
      <div className="max-w-3xl prose-cms text-ink-700 dark:text-ink-100" dangerouslySetInnerHTML={{ __html: page.content }} />
    </ListShell>
  );
}

// ─── About ──────────────────────────────────────────────────────────────────
export function AboutPage() {
  const { db } = useApp();
  if (!db) return null;
  const page = db.pages.find((p) => p.slug === "about-us");
  const instructors = db.users.filter((u) => u.role === "instructor");
  return (
    <div>
      <div className="bg-ink-900 dark:bg-ink-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <p className="font-mono text-[12px] text-brand-300 mb-3"><span className="text-accent-400">$</span> cat tentang-kami.md</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08]">Pabrik talenta digital sejak 2016.</h1>
            <p className="mt-4 text-ink-200 max-w-md leading-relaxed">{db.settings.description}</p>
          </Reveal>
          <Reveal delay={120}><div className="rounded-2xl overflow-hidden border border-ink-700 shadow-pop"><img src={IMG.lab} alt="Lab komputer KMSIT" className="w-full" style={{ aspectRatio: "16/10", objectFit: "cover" }} /><div className="bg-ink-950 px-4 py-2.5 font-mono text-[11px] text-ink-400 flex justify-between"><span>lab-utama.kmsit</span><span className="text-ok-500">● 40 workstation online</span></div></div></Reveal>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {page && <article className="prose-cms text-ink-700 dark:text-ink-100" dangerouslySetInnerHTML={{ __html: page.content }} />}
      </div>
      {db.orgUnits.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
          <SectionHead title="Struktur Organisasi" subtitle="Tata kelola lembaga yang transparan — dikelola langsung dari CMS." />
          <div className="space-y-6">
            {db.orgUnits.filter((u) => u.level === "board").sort((a, b) => a.order - b.order).map((u) => {
              const members = db.orgMembers.filter((m) => m.unitId === u.id).sort((a, b) => a.order - b.order);
              return (
                <Reveal key={u.id}>
                  <div className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-ink-900 dark:bg-ink-900 text-white overflow-hidden relative">
                    <div className="absolute inset-0 grid-bg opacity-40" />
                    <div className="relative px-6 py-5 flex flex-wrap items-center gap-4 border-b border-white/5">
                      <span className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-ink-900" style={{ background: db.settings.accentColor }}>{u.name[0]}</span>
                      <div><p className="font-display font-bold text-lg">{u.name}</p><p className="text-[12.5px] text-ink-300">{u.tagline}</p></div>
                      <span className="ml-auto text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md" style={{ background: `${db.settings.accentColor}22`, color: db.settings.accentColor }}>Pimpinan</span>
                    </div>
                    <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
                      {members.map((m) => (
                        <div key={m.id} className="px-6 py-4 hover:bg-white/[0.04] transition-colors">
                          <p className="font-bold text-[14px]">{m.name}</p>
                          <p className="text-[12px] font-mono" style={{ color: db.settings.accentColor }}>{m.position}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
            <div className="grid md:grid-cols-2 gap-5">
              {db.orgUnits.filter((u) => u.level !== "board").sort((a, b) => a.order - b.order).map((u, i) => {
                const members = db.orgMembers.filter((m) => m.unitId === u.id).sort((a, b) => a.order - b.order);
                return (
                  <Reveal key={u.id} delay={i * 70}>
                    <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden hover:shadow-lift transition-all h-full">
                      <div className="px-5 py-4 border-b border-ink-100 dark:border-ink-800 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-white shrink-0" style={{ background: db.settings.brandColor }}>{u.name[0]}</span>
                        <div className="min-w-0"><p className="font-display font-bold text-[14.5px] text-ink-900 dark:text-white truncate">{u.name}</p><p className="text-[11.5px] text-ink-400 truncate">{u.tagline}</p></div>
                      </div>
                      <div className="px-5 py-3 space-y-2.5">
                        {members.map((m) => (
                          <div key={m.id} className="flex items-center justify-between gap-3 text-[13px]">
                            <span className="font-semibold text-ink-700 dark:text-ink-100">{m.name}</span>
                            <span className="text-[11.5px] font-mono text-ink-400 text-right">{m.position}</span>
                          </div>
                        ))}
                        {members.length === 0 && <p className="text-xs text-ink-400 py-2">Belum ada anggota.</p>}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <SectionHead title="Tim Instruktur" subtitle="Praktisi aktif yang mengajar dari pengalaman nyata." />
        <div className="grid sm:grid-cols-3 gap-5">
          {instructors.map((ins, i) => (
            <Reveal key={ins.id} delay={i * 80}>
              <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-6 hover:shadow-lift transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: `linear-gradient(135deg, ${ins.color}, ${ins.color}bb)` }}>{ins.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                  <div><p className="font-display font-semibold text-ink-900 dark:text-white">{ins.name}</p><p className="text-xs font-mono text-ink-400">{ins.email}</p></div>
                </div>
                <p className="mt-3 text-[13.5px] text-ink-500 dark:text-ink-300 leading-relaxed">{ins.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Certificate verification ───────────────────────────────────────────────
export function VerifyCertificatePage() {
  const { db } = useApp();
  const { id } = useParams();
  const [code, setCode] = useState(id ?? "");
  const [searched, setSearched] = useState(!!id);
  if (!db) return null;
  const cert = searched ? db.certificates.find((c) => c.code.toLowerCase() === code.trim().toLowerCase()) : undefined;
  const student = cert && db.users.find((u) => u.id === cert.studentId);
  const course = cert && db.courses.find((c) => c.id === cert.courseId);
  return (
    <div className="bg-ink-900 dark:bg-ink-950 min-h-[70vh] text-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <Reveal className="text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500/15 border border-brand-500/25 text-brand-300 mb-4"><ShieldCheck size={22} /></span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Verifikasi Sertifikat</h1>
          <p className="mt-2 text-ink-200">Masukkan ID sertifikat untuk memastikan keasliannya. Contoh: <button className="font-mono text-brand-300 hover:underline" onClick={() => { setCode("KMSIT-2025-8F42K1"); setSearched(true); }}>KMSIT-2025-8F42K1</button></p>
        </Reveal>
        <form className="mt-8 flex gap-2" onSubmit={(e) => { e.preventDefault(); setSearched(true); }}>
          <input value={code} onChange={(e) => { setCode(e.target.value); setSearched(false); }} placeholder="KMSIT-2025-XXXXXX"
            className="grow h-12 rounded-xl bg-white/5 border border-white/15 px-4 font-mono text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-brand-400" />
          <Btn variant="accent" size="lg" type="submit">Verifikasi</Btn>
        </form>
        {searched && (
          <div className="mt-8">
            {cert && student && course ? (
              <div className="modal-in rounded-2xl border border-ok-500/40 bg-ok-500/10 p-6 sm:p-8">
                <div className="flex items-center gap-3 text-ok-500"><CheckCircle2 size={26} /><p className="font-display text-xl font-bold text-white">Sertifikat VALID</p></div>
                <div className="mt-6 grid sm:grid-cols-[1fr_auto] gap-6 items-center rounded-xl bg-ink-950/60 border border-white/10 p-5">
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-ink-300">ID Sertifikat</dt><dd className="font-mono font-bold text-brand-300">{cert.code}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-ink-300">Nama Peserta</dt><dd className="font-bold text-white">{student.name}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-ink-300">Kelas</dt><dd className="font-bold text-white text-right">{course.title}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-ink-300">Instruktur</dt><dd className="text-white">{cert.instructorName}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-ink-300">Tanggal Terbit</dt><dd className="text-white">{fmtDate(cert.issuedAt)}</dd></div>
                  </dl>
                  <div className="justify-self-center bg-white p-3 rounded-xl">
                    <FakeQr seed={cert.code} size={110} />
                  </div>
                </div>
                <Link to={`/certificate/${cert.code}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-300 hover:text-brand-200"><Award size={15} />Lihat sertifikat lengkap →</Link>
              </div>
            ) : (
              <div className="modal-in rounded-2xl border border-bad-500/40 bg-bad-500/10 p-6 sm:p-8">
                <div className="flex items-center gap-3 text-bad-500"><ShieldX size={26} /><p className="font-display text-xl font-bold text-white">Sertifikat TIDAK ditemukan</p></div>
                <p className="mt-3 text-sm text-ink-200 leading-relaxed">ID <span className="font-mono text-white">{code || "—"}</span> tidak terdaftar di sistem KMSIT. Pastikan penulisan sudah benar atau hubungi <span className="text-brand-300">{db.settings.email}</span>.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function FakeQr({ seed, size = 96 }: { seed: string; size?: number }) {
  const n = 17;
  let h = 2166136261;
  for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  const cells: boolean[] = [];
  for (let i = 0; i < n * n; i++) { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; cells.push(((h >>> 0) % 100) < 46); }
  const cs = size / n;
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x * cs} y={y * cs} width={cs * 5} height={cs * 5} fill="#0a1210" />
      <rect x={(x + 1) * cs} y={(y + 1) * cs} width={cs * 3} height={cs * 3} fill="#fff" />
      <rect x={(x + 2) * cs} y={(y + 2) * cs} width={cs} height={cs} fill="#0a1210" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <rect width={size} height={size} fill="#fff" />
      {cells.map((on, i) => {
        const x = i % n, y = Math.floor(i / n);
        const inFinder = (x < 6 && y < 6) || (x > n - 7 && y < 6) || (x < 6 && y > n - 7);
        if (!on || inFinder) return null;
        return <rect key={i} x={x * cs} y={y * cs} width={cs * 0.92} height={cs * 0.92} fill="#0a1210" />;
      })}
      {finder(0, 0)}{finder(n - 5, 0)}{finder(0, n - 5)}
    </svg>
  );
}

// ─── Course detail & checkout ───────────────────────────────────────────────
export function CourseDetailPage() {
  const { db, user, update, toast, notify, log } = useApp();
  const { slug } = useParams();
  const nav = useNavigate();
  const [tab, setTab] = useState("deskripsi");
  const [checkout, setCheckout] = useState(false);
  const [openMod, setOpenMod] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "processing" | "done">("form");
  const [method, setMethod] = useState("");
  const course = db?.courses.find((c) => c.slug === slug);
  if (!db) return null;
  if (!course || course.status !== "published") return <NotFoundBlock label="Kelas" />;

  const cat = db.categories.course.find((c) => c.id === course.categoryId);
  const ins = db.users.find((u) => u.id === course.instructorId);
  const enrollment = user && db.enrollments.find((e) => e.courseId === course.id && e.studentId === user.id);
  const students = db.enrollments.filter((e) => e.courseId === course.id).length;
  const lessons = courseLessons(course);
  const gateway = db.gateways.find((g) => g.provider === db.activeGateway && g.enabled);
  const methods = db.activeGateway === "stripe" ? ["Kartu Kredit / Debit", "LinkAja"] : db.activeGateway === "xendit" ? ["Virtual Account BCA", "Virtual Account Mandiri", "OVO", "DANA"] : ["QRIS", "Virtual Account BCA", "Virtual Account Mandiri", "Alfamart"];
  const firstLesson = lessons[0];

  const doEnrollFree = () => {
    if (!user) { nav("/login"); return; }
    update((d) => { d.enrollments.push({ id: uid(), courseId: course.id, studentId: user.id, date: new Date().toISOString(), completedLessons: [], status: "active" }); });
    notify(user.id, "Enroll berhasil", `Kamu terdaftar di kelas ${course.title}.`);
    log("enrollment", `Siswa enroll kelas gratis “${course.title}”`);
    toast("Berhasil terdaftar di kelas!", "ok");
    nav(`/learn/${course.id}`);
  };
  const pay = () => {
    if (!user) { nav("/login"); return; }
    setStep("processing");
    window.setTimeout(() => {
      const amount = course.price;
      const fee = Math.round(amount * 0.01);
      const net = Math.round((amount - fee) * (1 - PLATFORM_FEE));
      const invoice = `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
      const payId = uid();
      update((d) => {
        d.payments.unshift({ id: payId, invoice, studentId: user.id, courseId: course.id, provider: db.activeGateway, mode: gateway?.mode ?? "sandbox", method, amount, fee, status: "paid", date: new Date().toISOString() });
        d.enrollments.push({ id: uid(), courseId: course.id, studentId: user.id, date: new Date().toISOString(), completedLessons: [], status: "active" });
        d.walletTx.unshift({ id: uid(), instructorId: course.instructorId, type: "earning", amount: net, note: course.title, date: new Date().toISOString(), paymentId: payId });
      });
      notify(user.id, "Pembayaran berhasil", `${invoice} untuk kelas ${course.title} telah dikonfirmasi.`);
      notify(course.instructorId, "Penjualan baru", `${course.title} terjual 1x (${fmtIDR(amount)}).`);
      log("payment_received", `Pembayaran ${invoice} (${fmtIDR(amount)}) diterima`);
      setStep("done");
      confetti({ particleCount: 130, spread: 75, origin: { y: 0.7 }, colors: ["#17a58c", "#eaa93f", "#ffffff"] });
    }, 1500);
  };

  return (
    <div>
      <div className="bg-ink-900 dark:bg-ink-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-[1.5fr_1fr] gap-10">
          <div>
            <div className="flex flex-wrap gap-2 items-center text-[13px]">
              <Link to="/courses" className="font-mono text-brand-300 hover:text-brand-200">/kelas</Link>
              <span className="text-ink-500">/</span>
              {cat && <TagPill label={cat.name} color={cat.color} />}
              <Badge tone="neutral" className="bg-white/5 border-white/15 text-ink-200">{course.level}</Badge>
            </div>
            <h1 className="mt-4 font-display text-3xl sm:text-[40px] leading-[1.1] font-bold tracking-tight">{course.title}</h1>
            <p className="mt-3 text-ink-200 max-w-xl leading-relaxed">{course.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] text-ink-200">
              <span className="flex items-center gap-1.5"><Star size={14} className="fill-accent-400 text-accent-400" /><b className="text-white">{course.rating}</b> rating</span>
              <span className="flex items-center gap-1.5"><Users size={14} />{fmtNum(students)} siswa</span>
              <span className="flex items-center gap-1.5"><BookOpen size={14} />{lessons.length} lesson · {course.modules.length} modul</span>
              {course.certificateEnabled && <span className="flex items-center gap-1.5 text-brand-300"><Award size={14} />Sertifikat</span>}
            </div>
            <div className="mt-5 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: ins?.color }}>{ins?.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
              <div><p className="text-sm font-bold text-white">{ins?.name}</p><p className="text-xs text-ink-300">Instruktur · diperbarui {fmtDate(course.createdAt)}</p></div>
            </div>
          </div>
          <div className="lg:pt-2">
            <div className="rounded-2xl border border-ink-700 bg-ink-950/80 backdrop-blur overflow-hidden shadow-pop">
              <div className="relative">
                <img src={course.thumbnail} alt={course.title} className="w-full" style={{ aspectRatio: "16/9", objectFit: "cover" }} />
                {firstLesson?.free && (
                  <Link to={`/learn/${course.id}/${firstLesson.id}?preview=1`} className="absolute inset-0 flex items-center justify-center bg-ink-950/30 group">
                    <span className="flex items-center gap-2 rounded-xl bg-white text-ink-900 px-4 py-2.5 text-sm font-bold group-hover:bg-brand-300 transition-colors"><Play size={16} className="fill-current" />Coba lesson gratis</span>
                  </Link>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-baseline justify-between">
                  {course.price === 0
                    ? <span className="font-display text-2xl font-bold text-ok-500">Gratis</span>
                    : <><span className="font-display text-2xl font-bold text-white">{fmtIDR(course.price)}</span><Badge tone="warn" className="font-mono">{gateway?.mode === "production" ? "LIVE" : "SANDBOX"}</Badge></>}
                </div>
                <p className="text-xs text-ink-300 mt-1">{course.price === 0 ? "Akses langsung tanpa pembayaran." : `Sekali bayar · akses selamanya · via ${db.activeGateway}`}</p>
                <div className="mt-4 grid gap-2">
                  {enrollment ? (
                    <Link to={`/learn/${course.id}`}><Btn variant="accent" className="w-full" size="lg">Lanjutkan Belajar<ArrowRight size={16} /></Btn></Link>
                  ) : course.price === 0 ? (
                    <Btn variant="accent" size="lg" className="w-full" onClick={doEnrollFree}>Daftar Gratis Sekarang</Btn>
                  ) : (
                    <Btn variant="accent" size="lg" className="w-full" onClick={() => { if (!user) { nav("/login"); return; } setMethod(methods[0]); setStep("form"); setCheckout(true); }}>
                      <LandmarkMini />Beli Kelas Ini
                    </Btn>
                  )}
                  {!enrollment && firstLesson?.free && <p className="text-center text-[11px] font-mono text-ink-400">atau coba lesson gratis di atas</p>}
                </div>
                <ul className="mt-5 space-y-2 text-[13px] text-ink-200">
                  {[`${lessons.length} lesson video & materi`, "Quiz dengan nilai & passing grade", course.certificateEnabled ? "Sertifikat digital + QR verifikasi" : "Akses materi selamanya", "Sesi live Zoom / Google Meet"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5"><CheckCircle2 size={15} className="text-brand-300 shrink-0" />{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[1.5fr_1fr] gap-10">
        <div>
          <div className="flex gap-1 rounded-xl bg-ink-100/70 dark:bg-ink-900 p-1 w-fit mb-6">
            {[{ id: "deskripsi", l: "Deskripsi" }, { id: "kurikulum", l: "Kurikulum" }, { id: "instruktur", l: "Instruktur" }].map((tb) => (
              <button key={tb.id} onClick={() => setTab(tb.id)} className={cx("px-4 h-9 rounded-lg text-[13px] font-bold transition-all", tab === tb.id ? "bg-card dark:bg-ink-800 text-brand-700 dark:text-brand-300 shadow-sm" : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-100")}>{tb.l}</button>
            ))}
          </div>
          {tab === "deskripsi" && <article className="prose-cms text-ink-700 dark:text-ink-100" dangerouslySetInnerHTML={{ __html: course.longDescription }} />}
          {tab === "kurikulum" && <CurriculumList course={course} openMod={openMod} setOpenMod={setOpenMod} enrolled={!!enrollment} />}
          {tab === "instruktur" && ins && (
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-6 flex gap-5">
              <span className="w-16 h-16 shrink-0 rounded-full flex items-center justify-center text-white font-display font-bold text-xl" style={{ background: `linear-gradient(135deg, ${ins.color}, ${ins.color}bb)` }}>{ins.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
              <div>
                <p className="font-display font-semibold text-lg text-ink-900 dark:text-white">{ins.name}</p>
                <p className="text-xs font-mono text-ink-400 mt-0.5">{ins.email}</p>
                <p className="mt-2.5 text-sm text-ink-500 dark:text-ink-300 leading-relaxed">{ins.bio}</p>
                <p className="mt-3 text-xs font-bold text-brand-600 dark:text-brand-300 font-mono">{db.courses.filter((c) => c.instructorId === ins.id && c.status === "published").length} kelas · {fmtNum(db.enrollments.filter((e) => db.courses.some((c) => c.id === e.courseId && c.instructorId === ins.id)).length)} siswa</p>
              </div>
            </div>
          )}
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-5">
            <p className="font-display font-semibold text-ink-900 dark:text-white mb-3">Kelas lain dari {ins?.name.split(" ")[0]}</p>
            {db.courses.filter((c) => c.instructorId === course.instructorId && c.id !== course.id && c.status === "published").map((c) => (
              <Link key={c.id} to={`/courses/${c.slug}`} className="flex gap-3 py-2.5 group">
                <img src={c.thumbnail} alt="" className="w-16 h-11 rounded-lg object-cover shrink-0" />
                <span className="min-w-0"><span className="block text-[13px] font-bold text-ink-700 dark:text-ink-100 group-hover:text-brand-700 dark:group-hover:text-brand-300 line-clamp-2">{c.title}</span>
                  <span className="text-xs font-mono text-ink-400">{c.price === 0 ? "Gratis" : fmtIDR(c.price)}</span></span>
              </Link>
            ))}
            {db.courses.filter((c) => c.instructorId === course.instructorId && c.id !== course.id && c.status === "published").length === 0 && <p className="text-sm text-ink-400">Belum ada kelas lain.</p>}
          </div>
          <div className="rounded-xl border border-brand-500/25 bg-brand-50 dark:bg-brand-900/20 p-5">
            <p className="flex items-center gap-2 font-display font-semibold text-brand-800 dark:text-brand-200"><ShieldCheck size={16} />Garansi 7 hari</p>
            <p className="mt-1.5 text-[13px] text-brand-700/80 dark:text-brand-200/70 leading-relaxed">Tidak cocok? Dana kelas berbayar dikembalikan 100% dalam 7 hari tanpa syarat.</p>
          </div>
        </aside>
      </div>

      {checkout && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-[2px]" onClick={() => step === "form" && setCheckout(false)} />
          <div className="modal-in relative w-full max-w-md bg-card dark:bg-ink-900 border border-ink-100 dark:border-ink-700 sm:rounded-2xl rounded-t-2xl shadow-pop p-6">
            {step === "form" && (
              <>
                <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">Checkout Kelas</h3>
                <div className="mt-4 rounded-xl border border-ink-100 dark:border-ink-800 p-4 flex gap-3.5">
                  <img src={course.thumbnail} alt="" className="w-20 h-14 rounded-lg object-cover" />
                  <div><p className="text-sm font-bold text-ink-900 dark:text-white leading-snug">{course.title}</p><p className="text-xs text-ink-400 mt-1">{ins?.name} · {course.level}</p></div>
                </div>
                <div className="mt-4">
                  <p className="text-[13px] font-bold text-ink-600 dark:text-ink-200 mb-2">Metode pembayaran <Badge tone="warn" className="ml-1 font-mono">{db.activeGateway} · {gateway?.mode}</Badge></p>
                  <div className="grid gap-2">
                    {methods.map((m) => (
                      <button key={m} onClick={() => setMethod(m)} className={cx("flex items-center justify-between rounded-lg border px-3.5 h-11 text-sm font-semibold transition-all", method === m ? "border-brand-500 bg-brand-50 dark:bg-brand-900/25 text-brand-700 dark:text-brand-300" : "border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-200 hover:border-brand-300")}>
                        {m}<span className={cx("w-4 h-4 rounded-full border-2 flex items-center justify-center", method === m ? "border-brand-500" : "border-ink-200 dark:border-ink-600")}>{method === m && <span className="w-2 h-2 rounded-full bg-brand-500" />}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-sm border-t border-dashed border-ink-200 dark:border-ink-700 pt-3">
                  <div className="flex justify-between text-ink-500 dark:text-ink-300"><span>Harga kelas</span><span className="font-mono">{fmtIDR(course.price)}</span></div>
                  <div className="flex justify-between text-ink-500 dark:text-ink-300"><span>Biaya payment gateway</span><span className="font-mono">{fmtIDR(Math.round(course.price * 0.01))}</span></div>
                  <div className="flex justify-between font-bold text-ink-900 dark:text-white text-[15px]"><span>Total</span><span className="font-mono">{fmtIDR(course.price + Math.round(course.price * 0.01))}</span></div>
                </div>
                <Btn variant="accent" className="w-full mt-5" size="lg" onClick={pay}>Bayar {fmtIDR(course.price + Math.round(course.price * 0.01))}</Btn>
                <p className="mt-2.5 text-center text-[11px] text-ink-400 leading-relaxed">Transaksi diproses & divalidasi di backend (PaymentService → {db.activeGateway}). Akses kelas terbuka setelah webhook pembayaran sukses.</p>
              </>
            )}
            {step === "processing" && (
              <div className="py-10 text-center">
                <div className="mx-auto w-12 h-12 rounded-full border-[3px] border-brand-500/25 border-t-brand-500 spin" />
                <p className="mt-4 font-display font-bold text-ink-900 dark:text-white">Memproses pembayaran…</p>
                <p className="text-sm text-ink-400 mt-1 font-mono">{db.activeGateway} · {method}</p>
              </div>
            )}
            {step === "done" && (
              <div className="py-6 text-center">
                <span className="mx-auto w-14 h-14 rounded-full bg-ok-500/15 text-ok-500 flex items-center justify-center"><CheckCircle2 size={30} /></span>
                <p className="mt-4 font-display text-xl font-bold text-ink-900 dark:text-white">Pembayaran Berhasil!</p>
                <p className="text-sm text-ink-400 mt-1.5 leading-relaxed">Kamu resmi terdaftar di <b>{course.title}</b>.<br />Selamat belajar!</p>
                <Link to={`/learn/${course.id}`}><Btn variant="accent" className="w-full mt-5" size="lg">Mulai Belajar<ArrowRight size={16} /></Btn></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
const LandmarkMini = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>;

export function CurriculumList({ course, openMod, setOpenMod, enrolled, completed = [] }: { course: Course; openMod: string | null; setOpenMod: (v: string | null) => void; enrolled: boolean; completed?: string[] }) {
  const { user } = useApp();
  const nav = useNavigate();
  const isOwnerOrMod = !!user && (user.role === "super_admin" || user.role === "admin" || course.instructorId === user.id);
  return (
    <div className="space-y-3">
      {course.modules.map((m, mi) => (
        <div key={m.id} className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
          <button className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-ink-50 dark:hover:bg-ink-850 transition-colors" onClick={() => setOpenMod(openMod === m.id ? null : m.id)}>
            <span className="flex items-center gap-3"><span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-300 bg-brand-500/10 rounded-md px-2 py-1">{String(mi + 1).padStart(2, "0")}</span>
              <span className="font-display font-semibold text-[15px] text-ink-900 dark:text-white">{m.title}</span></span>
            <span className="flex items-center gap-2 text-xs text-ink-400 font-mono">{m.lessons.length} lesson<ChevronDown size={15} className={cx("transition-transform", openMod === m.id && "rotate-180")} /></span>
          </button>
          {(openMod === m.id || openMod === null) && (
            <div className="border-t border-ink-100 dark:border-ink-800">
              {m.lessons.map((l) => {
                // Kelas berbayar: hanya terbuka setelah pembayaran (enrolled), lesson preview gratis, atau owner/moderator.
                const accessible = enrolled || !!l.free || isOwnerOrMod;
                const done = completed.includes(l.id);
                return (
                  <div key={l.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-ink-100/60 dark:border-ink-800/60 last:border-0 text-sm">
                    <span className={cx("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", done ? "bg-ok-500/15 text-ok-500" : "bg-ink-100 dark:bg-ink-800 text-ink-400")}>
                      {done ? <CheckCircle2 size={14} /> : lessonTypeIcon(l.type)}
                    </span>
                    <span className="grow font-semibold text-ink-700 dark:text-ink-100 truncate">{l.title}</span>
                    {l.free && !enrolled && <Badge tone="ok">Preview</Badge>}
                    {l.type === "quiz" && <Badge tone="accent">Quiz</Badge>}
                    <span className="text-xs font-mono text-ink-300">{l.duration}</span>
                    {accessible ? (
                      <Link to={`/learn/${course.id}/${l.id}`} className="text-xs font-bold text-brand-600 dark:text-brand-300 hover:underline shrink-0">Buka →</Link>
                    ) : (
                      <span className="text-[11px] font-mono text-ink-300 shrink-0 flex items-center gap-1"><LockMini />terkunci</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
      {enrolled && <div className="flex justify-end"><Btn variant="soft" size="sm" onClick={() => nav(`/learn/${course.id}`)}>Buka mode belajar<ArrowRight size={14} /></Btn></div>}
    </div>
  );
}
const LockMini = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;

export function MaintenancePage() {
  const { db } = useApp();
  if (!db) return null;
  return (
    <div className="min-h-screen bg-ink-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="relative text-center max-w-md">
        <p className="font-mono text-sm text-warn-500">$ status: MAINTENANCE_MODE</p>
        <h1 className="mt-4 font-display text-3xl font-bold">Sedang dalam pemeliharaan</h1>
        <p className="mt-3 text-ink-300 leading-relaxed">{db.settings.siteName} sedang diperbarui agar lebih baik. Silakan kembali dalam beberapa saat.</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-ink-700 px-4 py-2 font-mono text-xs text-ink-400"><span className="w-2 h-2 rounded-full bg-warn-500 pulse-dot" />kmsit --maintenance</div>
      </div>
    </div>
  );
}

