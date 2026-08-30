import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  Play, FileText, CheckCircle2, ChevronLeft, ChevronRight, Clock, Award, Download,
  AlertTriangle, XCircle, QrCode, FileDown, HelpCircle, GraduationCap, Printer, ShieldCheck, ArrowLeft,
} from "lucide-react";
import { useApp } from "../lib/store";
import { courseLessons, courseProgress, fmtDate, uid, ytThumb, type Lesson, type Quiz } from "../lib/db";
import { Badge, Btn, cx, Modal, Progress, YouTubeEmbed } from "../components/ui";
import { FakeQr } from "./public";

function useEnrollmentGuard(courseId: string) {
  const { db, user } = useApp();
  const course = db?.courses.find((c) => c.id === courseId);
  const enrollment = user && db?.enrollments.find((e) => e.courseId === courseId && e.studentId === user.id);
  return { course, enrollment, user };
}

export function LearnPlayer() {
  const { courseId, lessonId } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const { db, update, toast } = useApp();
  const { course, enrollment, user } = useEnrollmentGuard(courseId ?? "");
  const preview = sp.get("preview") === "1";
  const [modOpen, setModOpen] = useState<string | null>(null);
  const courseIdDep = course?.id;
  useEffect(() => { if (courseIdDep && course) setModOpen(course.modules[0]?.id ?? null); // eslint-disable-line
  }, [courseIdDep]);

  if (!db || !course) return <BlockMsg title="Kelas tidak ditemukan" back="/courses" />;
  const isStudent = user?.role === "student";
  if (isStudent && !enrollment && !preview) return <BlockMsg title="Kamu belum terdaftar di kelas ini" desc="Enroll terlebih dahulu untuk mengakses materi." back={`/courses/${course.slug}`} />;
  if (!user) return <BlockMsg title="Silakan masuk terlebih dahulu" back="/login" />;

  const lessons = courseLessons(course);
  const current = lessons.find((l) => l.id === lessonId) ?? lessons[0];
  const idx = lessons.indexOf(current);
  const accessible = !isStudent || !!enrollment || current.free;
  const completed = enrollment?.completedLessons ?? [];
  const progress = enrollment ? courseProgress(course, enrollment) : 0;

  const toggleDone = (lid: string) => {
    if (!enrollment) { toast("Lesson preview — daftar untuk menyimpan progress.", "info"); return; }
    update((d) => {
      const e = d.enrollments.find((x) => x.id === enrollment.id);
      if (!e) return;
      e.completedLessons = e.completedLessons.includes(lid) ? e.completedLessons.filter((x) => x !== lid) : [...e.completedLessons, lid];
      const c = d.courses.find((x) => x.id === course.id);
      if (c) e.status = e.completedLessons.length >= courseLessons(c).length ? "completed" : "active";
    });
    if (!completed.includes(lid)) toast("Lesson ditandai selesai ✓", "ok");
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-950 lg:flex">
      {/* Sidebar */}
      <aside className="lg:w-[340px] shrink-0 bg-ink-900 dark:bg-ink-950 text-white lg:min-h-screen border-r border-ink-800 lg:sticky lg:top-0 lg:h-screen flex flex-col">
        <div className="p-5 border-b border-white/5">
          <Link to={`/courses/${course.slug}`} className="flex items-center gap-1.5 text-[12px] font-mono text-ink-300 hover:text-brand-300 mb-2.5"><ArrowLeft size={12} />kembali ke detail kelas</Link>
          <h2 className="font-display font-semibold text-[16px] leading-snug">{course.title}</h2>
          {enrollment && (
            <div className="mt-3">
              <div className="flex justify-between text-[11px] font-mono text-ink-300 mb-1.5"><span>PROGRESS</span><span className="text-brand-300">{progress}%</span></div>
              <div className="h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-brand-400 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
            </div>
          )}
        </div>
        <div className="grow overflow-y-auto p-3">
          {course.modules.map((m, mi) => (
            <div key={m.id} className="mb-2">
              <button onClick={() => setModOpen(modOpen === m.id ? null : m.id)} className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-white/5 text-left">
                <span className="text-[13px] font-bold text-ink-100"><span className="font-mono text-brand-300 mr-2">{String(mi + 1).padStart(2, "0")}</span>{m.title}</span>
                <ChevronRight size={13} className={cx("text-ink-400 transition-transform", modOpen === m.id && "rotate-90")} />
              </button>
              {modOpen === m.id && m.lessons.map((l) => {
                const locked = isStudent && !enrollment && !l.free;
                const active = l.id === current.id;
                const done = completed.includes(l.id);
                return (
                  <button key={l.id} disabled={locked}
                    onClick={() => nav(`/learn/${course.id}/${l.id}`)}
                    className={cx("w-full flex items-center gap-2.5 pl-4 pr-2.5 py-2 rounded-lg text-left text-[13px] transition-colors mb-0.5",
                      active ? "bg-brand-500/20 text-brand-200" : "text-ink-300 hover:bg-white/5 hover:text-white", locked && "opacity-40 cursor-not-allowed")}>
                    <span className={cx("w-6 h-6 shrink-0 rounded-md flex items-center justify-center", done ? "bg-ok-500/20 text-ok-500" : active ? "bg-brand-400/20 text-brand-300" : "bg-white/5 text-ink-400")}>
                      {done ? <CheckCircle2 size={13} /> : l.type === "video" ? <Play size={12} /> : l.type === "quiz" ? <HelpCircle size={12} /> : <FileText size={12} />}
                    </span>
                    <span className="grow truncate font-semibold">{l.title}</span>
                    <span className="text-[10px] font-mono text-ink-500 shrink-0">{l.duration}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/5 text-[11px] font-mono text-ink-400">
          {completed.length}/{lessons.length} lesson selesai
        </div>
      </aside>

      {/* Main */}
      <main className="grow min-w-0">
        <div className="max-w-3xl mx-auto p-5 sm:p-8">
          {!accessible ? (
            <div className="rounded-2xl border border-dashed border-ink-200 dark:border-ink-700 py-20 text-center">
              <p className="font-display text-xl font-bold text-ink-800 dark:text-white">Materi terkunci</p>
              <p className="text-sm text-ink-400 mt-2">Selesaikan pembayaran untuk membuka seluruh materi.</p>
              <Link to={`/courses/${course.slug}`} className="inline-block mt-5"><Btn>Buka halaman kelas</Btn></Link>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge tone={current.type === "quiz" ? "accent" : "brand"}>{current.type === "video" ? "Video" : current.type === "quiz" ? "Quiz" : current.type === "file" ? "File Materi" : "Bacaan"}</Badge>
                <span className="text-xs font-mono text-ink-400">{current.duration}</span>
                {current.free && <Badge tone="ok">Gratis</Badge>}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">{current.title}</h1>

              <div className="mt-6">
                {current.type === "video" && current.youtubeId && (
                  <>
                    <YouTubeEmbed id={current.youtubeId} />
                    <p className="mt-4 text-sm text-ink-400 leading-relaxed">Tonton sampai selesai lalu tandai lesson ini selesai untuk mencatat progress-mu.</p>
                  </>
                )}
                {current.type === "text" && <article className="prose-cms text-ink-700 dark:text-ink-100 rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-6" dangerouslySetInnerHTML={{ __html: current.content ?? "" }} />}
                {current.type === "file" && (
                  <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-8 text-center">
                    <span className="mx-auto w-14 h-14 rounded-xl bg-accent-500/15 text-accent-600 dark:text-accent-300 flex items-center justify-center"><FileDown size={26} /></span>
                    <p className="mt-3 font-display font-semibold text-ink-900 dark:text-white">{current.fileName}</p>
                    <p className="text-xs font-mono text-ink-400 mt-1">Materi pendukung · PDF</p>
                    <Btn variant="soft" className="mt-4" onClick={() => toast("Materi diunduh (simulasi storage Laravel).", "info")}><Download size={15} />Unduh Materi</Btn>
                  </div>
                )}
                {current.type === "quiz" && enrollment && <QuizBlock course={course} lesson={current} enrollmentId={enrollment.id} onPassed={() => toggleDone(current.id)} />}
                {current.type === "quiz" && !enrollment && <p className="mt-4 rounded-xl bg-warn-500/10 border border-warn-500/30 text-warn-600 text-sm font-semibold px-4 py-3">Quiz hanya bisa diikuti oleh siswa yang terdaftar.</p>}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 dark:border-ink-800 pt-5">
                {idx > 0 ? (
                  <Link to={`/learn/${course.id}/${lessons[idx - 1].id}`}><Btn variant="outline" size="sm"><ChevronLeft size={15} />Sebelumnya</Btn></Link>
                ) : <span />}
                <Btn variant={completed.includes(current.id) ? "outline" : "primary"} size="sm" onClick={() => toggleDone(current.id)}>
                  {completed.includes(current.id) ? <><CheckCircle2 size={15} className="text-ok-500" />Selesai</> : "Tandai Selesai"}
                </Btn>
                {idx < lessons.length - 1 ? (
                  <Link to={`/learn/${course.id}/${lessons[idx + 1].id}`}><Btn variant="outline" size="sm">Selanjutnya<ChevronRight size={15} /></Btn></Link>
                ) : <span />}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function BlockMsg({ title, desc, back }: { title: string; desc?: string; back: string }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <p className="font-mono text-sm text-brand-600 dark:text-brand-300">akses ditolak</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink-900 dark:text-white">{title}</h1>
        {desc && <p className="mt-2 text-sm text-ink-400">{desc}</p>}
        <Link to={back} className="inline-block mt-6"><Btn>Kembali</Btn></Link>
      </div>
    </div>
  );
}

// ─── Quiz engine ────────────────────────────────────────────────────────────
function QuizBlock({ course, lesson, enrollmentId, onPassed }: { course: { id: string; title: string; certificateEnabled: boolean }; lesson: Lesson; enrollmentId: string; onPassed: () => void }) {
  const { db, user, update, toast, notify } = useApp();
  const quiz = db?.quizzes.find((q) => q.courseId === course.id && q.lessonId === lesson.id);
  const [running, setRunning] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [qi, setQi] = useState(0);
  const [left, setLeft] = useState(0);
  const [result, setResult] = useState<{ percent: number; passed: boolean; score: number; total: number; certCode?: string } | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submitRef = useRef<(auto?: boolean) => void>(() => {});
  const questions = useMemo(() => {
    if (!quiz) return [];
    if (!quiz.randomize) return quiz.questions;
    return [...quiz.questions].sort(() => Math.random() - 0.5);
  }, [quiz]);
  useEffect(() => {
    if (!running) return;
    const iv = window.setInterval(() => setLeft((s) => {
      if (s <= 1) { window.clearInterval(iv); submitRef.current(true); return 0; }
      return s - 1;
    }), 1000);
    return () => window.clearInterval(iv);
  }, [running]);
  if (!db || !user) return null;
  if (!quiz) return (
    <div className="mt-6 rounded-2xl border border-dashed border-ink-200 dark:border-ink-700 p-8 text-center">
      <HelpCircle size={24} className="mx-auto text-ink-300" />
      <p className="mt-3 font-display font-semibold text-ink-800 dark:text-white">Quiz belum dibuat</p>
      <p className="text-sm text-ink-400 mt-1">Instruktur belum menautkan bank soal ke lesson ini.</p>
    </div>
  );

  const attempts = db.attempts.filter((a) => a.quizId === quiz.id && a.studentId === user.id);
  const attemptsLeft = quiz.attemptLimit - attempts.length;

  const start = () => {
    setAnswers({}); setQi(0); setLeft(quiz.timeLimit * 60); setResult(null); setRunning(true);
  };
  const submit = (auto = false) => {
    let score = 0, total = 0;
    quiz.questions.forEach((q) => {
      total += q.points;
      const a = [...(answersRef.current[q.id] ?? [])].sort().join(",");
      const c = [...q.correct].sort().join(",");
      if (a === c && a !== "") score += q.points;
    });
    const percent = Math.round((score / total) * 100);
    const passed = percent >= quiz.passingGrade;
    let certCode: string | undefined;
    update((d) => {
      d.attempts.unshift({ id: uid(), quizId: quiz.id, courseId: course.id, studentId: user.id, score, total, percent, passed, date: new Date().toISOString() });
      const e = d.enrollments.find((x) => x.id === enrollmentId);
      const c2 = d.courses.find((x) => x.id === course.id);
      if (passed && c2?.certificateEnabled && e) {
        const done = new Set([...e.completedLessons, lesson.id]);
        const prog = Math.round((done.size / courseLessons(c2).length) * 100);
        const already = d.certificates.some((ct) => ct.studentId === user.id && ct.courseId === course.id);
        if (prog >= 60 && !already) {
          certCode = `KMSIT-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
          const insName = d.users.find((u) => u.id === c2.instructorId)?.name ?? "Instruktur";
          d.certificates.unshift({ id: uid(), code: certCode, studentId: user.id, courseId: course.id, instructorName: insName, issuedAt: new Date().toISOString(), template: "modern" });
        }
      }
    });
    setRunning(false);
    setResult({ percent, passed, score, total, certCode });
    if (passed) {
      onPassed();
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 }, colors: ["#17a58c", "#eaa93f", "#ffffff"] });
      if (certCode) notify(user.id, "Sertifikat terbit 🎓", `Selamat! Sertifikat ${certCode} untuk kelas ${course.title} siap diunduh.`);
      toast(passed ? `LULUS dengan skor ${percent}!` : "", "ok");
    } else {
      toast(`Belum lulus — skor ${percent} (minimal ${quiz.passingGrade}).`, "warn");
    }
    if (auto) toast("Waktu habis — jawaban dikumpulkan otomatis.", "warn");
  };
  submitRef.current = submit;

  if (result) {
    const mm = String(Math.floor(quiz.timeLimit)).padStart(2, "0");
    return (
      <div className={cx("mt-6 rounded-2xl border p-7 text-center", result.passed ? "border-ok-500/40 bg-ok-500/8" : "border-bad-500/40 bg-bad-500/8")}>
        {result.passed
          ? <span className="mx-auto w-16 h-16 rounded-full bg-ok-500/15 text-ok-500 flex items-center justify-center"><Award size={32} /></span>
          : <span className="mx-auto w-16 h-16 rounded-full bg-bad-500/15 text-bad-500 flex items-center justify-center"><XCircle size={32} /></span>}
        <h3 className="mt-4 font-display text-2xl font-bold text-ink-900 dark:text-white">{result.passed ? "Selamat, kamu LULUS!" : "Belum berhasil"}</h3>
        <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-300">Skor kamu <b className={result.passed ? "text-ok-500" : "text-bad-500"}>{result.score}/{result.total}</b> ({result.percent}%) · passing grade {quiz.passingGrade}%</p>
        {result.certCode && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-accent-400/50 bg-accent-500/10 px-4 py-2.5 text-sm font-bold text-accent-700 dark:text-accent-300">
            <Award size={16} />Sertifikat {result.certCode} terbit!
            <Link to={`/certificate/${result.certCode}`} className="underline underline-offset-2">Lihat →</Link>
          </div>
        )}
        <div className="mt-5 flex justify-center gap-2">
          {attemptsLeft > 0 && !result.passed && <Btn variant="outline" size="sm" onClick={start}>Coba lagi ({attemptsLeft}x kesempatan)</Btn>}
          <Link to={`/learn/${course.id}`}><Btn size="sm">Kembali ke kelas</Btn></Link>
        </div>
        <p className="mt-4 text-[11px] font-mono text-ink-400">durasi tersedia {mm}:00 menit · percobaan terpakai {attempts.length + 1}/{quiz.attemptLimit}</p>
      </div>
    );
  }

  if (!running) {
    return (
      <div className="mt-6 rounded-2xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-7">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-accent-500/15 text-accent-600 dark:text-accent-300 flex items-center justify-center shrink-0"><QrCode size={24} /></span>
          <div>
            <h3 className="font-display text-xl font-bold text-ink-900 dark:text-white">{quiz.title}</h3>
            <p className="text-sm text-ink-400 mt-1">Uji pemahamanmu sebelum lanjut ke materi berikutnya.</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[{ l: "Soal", v: `${quiz.questions.length}` }, { l: "Durasi", v: `${quiz.timeLimit} mnt` }, { l: "Passing", v: `${quiz.passingGrade}%` }, { l: "Kesempatan", v: `${Math.max(0, attemptsLeft)}x` }].map((x) => (
            <div key={x.l} className="rounded-lg bg-ink-50 dark:bg-ink-850 border border-ink-100 dark:border-ink-800 px-3 py-2.5 text-center">
              <p className="font-display font-bold text-ink-900 dark:text-white">{x.v}</p><p className="text-[10px] font-mono uppercase text-ink-400 mt-0.5">{x.l}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-ink-400">Tipe soal: pilihan ganda, benar/salah, jawaban ganda.</p>
          {attemptsLeft > 0
            ? <Btn variant="accent" onClick={start}>Mulai Quiz<Play size={15} className="fill-current" /></Btn>
            : <Badge tone="bad">Kesempatan habis</Badge>}
        </div>
        {attempts.length > 0 && (
          <div className="mt-4 border-t border-ink-100 dark:border-ink-800 pt-3">
            <p className="text-[11px] font-mono text-ink-400 mb-1.5">RIWAYAT PERCOBAAN</p>
            {attempts.slice(0, 3).map((a) => (
              <div key={a.id} className="flex justify-between text-[13px] py-1"><span className="text-ink-500 dark:text-ink-300">{fmtDate(a.date)}</span><Badge tone={a.passed ? "ok" : "bad"}>{a.percent}%</Badge></div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const q = questions[qi];
  const sel = answers[q.id] ?? [];
  const toggle = (oi: number) => {
    setAnswers((prev) => {
      const cur = prev[q.id] ?? [];
      if (q.type === "multiple") return { ...prev, [q.id]: cur.includes(oi) ? cur.filter((x) => x !== oi) : [...cur, oi] };
      return { ...prev, [q.id]: [oi] };
    });
  };
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  const answered = questions.filter((x) => (answers[x.id] ?? []).length > 0).length;

  return (
    <div className="mt-6 rounded-2xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-ink-100 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-850">
        <span className="text-[13px] font-bold text-ink-600 dark:text-ink-200">Soal {qi + 1} / {questions.length} · {answered} dijawab</span>
        <span className={cx("flex items-center gap-1.5 font-mono text-sm font-bold", left < 60 ? "text-bad-500" : "text-ink-700 dark:text-ink-100")}><Clock size={14} />{mm}:{ss}</span>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge tone={q.type === "multiple" ? "info" : q.type === "boolean" ? "warn" : "brand"}>{q.type === "multiple" ? "Jawaban ganda" : q.type === "boolean" ? "Benar / Salah" : "Pilihan ganda"}</Badge>
          <span className="text-[11px] font-mono text-ink-400">{q.points} poin</span>
        </div>
        <p className="font-display font-semibold text-lg text-ink-900 dark:text-white leading-relaxed">{q.text}</p>
        <div className="mt-5 grid gap-2.5">
          {q.options.map((op, oi) => {
            const on = sel.includes(oi);
            return (
              <button key={oi} onClick={() => toggle(oi)}
                className={cx("flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all",
                  on ? "border-brand-500 bg-brand-50 dark:bg-brand-900/25 text-brand-800 dark:text-brand-200 shadow-sm" : "border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-200 hover:border-brand-300")}>
                <span className={cx("shrink-0 flex items-center justify-center border-2", q.type === "multiple" ? "w-5 h-5 rounded-md" : "w-5 h-5 rounded-full", on ? "border-brand-500 bg-brand-500 text-white" : "border-ink-300 dark:border-ink-600")}>
                  {on && <CheckCircle2 size={12} />}
                </span>
                {op}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between px-6 py-4 border-t border-ink-100 dark:border-ink-800">
        <Btn variant="ghost" size="sm" disabled={qi === 0} onClick={() => setQi(qi - 1)}><ChevronLeft size={15} />Sebelumnya</Btn>
        <div className="flex gap-1.5">{questions.map((x, i) => <button key={x.id} onClick={() => setQi(i)} className={cx("w-7 h-7 rounded-lg text-[11px] font-bold transition-colors", i === qi ? "bg-brand-600 text-white" : (answers[x.id] ?? []).length ? "bg-brand-500/15 text-brand-700 dark:text-brand-300" : "bg-ink-100 dark:bg-ink-800 text-ink-400")}>{i + 1}</button>)}</div>
        {qi < questions.length - 1
          ? <Btn variant="soft" size="sm" onClick={() => setQi(qi + 1)}>Selanjutnya<ChevronRight size={15} /></Btn>
          : <Btn variant="accent" size="sm" onClick={() => submit(false)}>Kumpulkan Jawaban</Btn>}
      </div>
    </div>
  );
}

// ─── Certificate ────────────────────────────────────────────────────────────
export function CertificatePage() {
  const { db } = useApp();
  const { code } = useParams();
  if (!db) return null;
  const cert = db.certificates.find((c) => c.code.toLowerCase() === (code ?? "").toLowerCase());
  if (!cert) return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div><p className="font-mono text-sm text-bad-500">certificate not found</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink-900 dark:text-white">Sertifikat tidak ditemukan</h1>
        <Link to="/verify-certificate" className="inline-block mt-5"><Btn>Cek verifikasi</Btn></Link></div>
    </div>
  );
  const student = db.users.find((u) => u.id === cert.studentId);
  const course = db.courses.find((c) => c.id === cert.courseId);
  return (
    <div className="min-h-screen bg-ink-950 py-10 px-4">
      <style>{`@media print { body * { visibility: hidden; } .cert-print, .cert-print * { visibility: visible; } .cert-print { position: fixed; inset: 0; background: white !important; } .no-print { display: none !important; } }`}</style>
      <div className="no-print max-w-3xl mx-auto flex items-center justify-between mb-5">
        <Link to="/" className="text-sm font-mono text-ink-300 hover:text-brand-300">← kmsit.id</Link>
        <div className="flex gap-2">
          <Link to={`/verify-certificate/${cert.code}`}><Btn variant="outline" size="sm"><ShieldCheck size={15} />Verifikasi</Btn></Link>
          <Btn variant="accent" size="sm" onClick={() => window.print()}><Printer size={15} />Cetak / PDF</Btn>
        </div>
      </div>
      <div className="cert-print max-w-3xl mx-auto bg-white rounded-2xl overflow-hidden shadow-pop">
        <div className="border-[10px] border-double border-brand-700 m-3 rounded-xl relative">
          <div className="absolute inset-3 border border-brand-200 rounded-lg pointer-events-none" />
          <div className="px-8 sm:px-14 py-10 sm:py-12 text-center relative">
            <div className="flex items-center justify-center gap-3">
              <svg width="38" height="38" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#101a17" /><path d="M9 11l5 5-5 5" stroke="#2CC5B0" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M16.5 21h7" stroke="#E8A33D" strokeWidth="2.6" strokeLinecap="round" /></svg>
              <div className="text-left"><p className="font-display font-bold text-ink-900 leading-none">{db.settings.siteName}</p><p className="font-mono text-[9px] tracking-[0.25em] text-brand-700 mt-1">LEMBAGA PENDIDIKAN TEKNOLOGI</p></div>
            </div>
            <p className="mt-8 font-mono text-[11px] tracking-[0.4em] text-accent-600 uppercase">Sertifikat Kelulusan</p>
            <p className="mt-5 text-sm text-ink-400">dengan bangga diberikan kepada</p>
            <h1 className="mt-2 font-display text-3xl sm:text-[42px] font-bold text-ink-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', serif" }}>{student?.name}</h1>
            <div className="mx-auto mt-2 h-[3px] w-40 bg-gradient-to-r from-brand-600 to-accent-400 rounded-full" />
            <p className="mt-5 text-[15px] text-ink-500 leading-relaxed max-w-md mx-auto">telah menyelesaikan seluruh materi dan lulus evaluasi pada kelas</p>
            <p className="mt-2 font-display text-xl sm:text-2xl font-semibold text-brand-800">{course?.title}</p>
            <div className="mt-10 grid grid-cols-3 items-end gap-4 text-left">
              <div>
                <p className="font-mono text-[10px] text-ink-400 uppercase">Tanggal Terbit</p>
                <p className="mt-1 text-sm font-bold text-ink-800">{fmtDate(cert.issuedAt)}</p>
                <div className="mt-3 border-t border-ink-300 pt-1 text-[11px] text-ink-400">{db.settings.timezone}</div>
              </div>
              <div className="justify-self-center">
                <FakeQr seed={cert.code} size={92} />
                <p className="mt-1.5 font-mono text-[10px] text-center text-ink-500 font-bold">{cert.code}</p>
              </div>
              <div className="text-right">
                <p className="font-display italic text-2xl text-ink-800" style={{ fontFamily: "cursive" }}>{cert.instructorName}</p>
                <div className="border-t border-ink-300 pt-1 text-[11px] text-ink-400">Instruktur · {cert.instructorName}</div>
              </div>
            </div>
            <p className="mt-8 text-[10px] font-mono text-ink-400">Verifikasi keaslian: kmsit.id/verify-certificate/{cert.code}</p>
          </div>
        </div>
      </div>
      <p className="no-print text-center mt-4 text-xs text-ink-400 font-mono flex items-center justify-center gap-1.5"><GraduationCap size={13} />Sertifikat digital · tersimpan di database & dapat diverifikasi publik</p>
    </div>
  );
}
export { Progress as _P };
