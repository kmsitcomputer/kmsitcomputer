import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Pencil, Trash2, BookOpen, ExternalLink, ArrowUp, ArrowDown, Play, FileText, HelpCircle,
  GraduationCap, Users, Award, Layers, QrCode, CheckCircle2, Ban,
} from "lucide-react";
import { useApp } from "../lib/store";
import {
  courseLessons, fmtDate, fmtIDR, IMG, PLATFORM_FEE, slugify, uid, ytId,
  type Course, type Lesson, type Question, type Quiz,
} from "../lib/db";
import { Avatar, Badge, Btn, cx, Drawer, EmptyState, Field, Modal, SearchInput, Select, statusTone, TextInput, Toggle, YouTubeEmbed } from "../components/ui";
import { RichEditor } from "../components/editor";
import { DashHead } from "./dash-content";

const useScope = () => {
  const { db, user } = useApp();
  const mine = user?.role === "instructor";
  return { db, user, mine };
};

// ─── Courses ────────────────────────────────────────────────────────────────
export function CoursesManager() {
  const { db, user, mine } = useScope();
  const { update, toast, log } = useApp();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Course | null | "new">(null);
  const [curriculum, setCurriculum] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);
  if (!db || !user) return null;
  const list = db.courses
    .filter((c) => !mine || c.instructorId === user.id)
    .filter((c) => !q || c.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <DashHead title={mine ? "Kelas Saya" : "Kelas"} desc={`${list.length} kelas · struktur Course → Module → Lesson ala Tutor LMS`}
        action={<Btn onClick={() => setEditing("new")}><Plus size={16} />Kelas Baru</Btn>} />
      <div className="mb-5 max-w-sm"><SearchInput value={q} onChange={setQ} placeholder="Cari kelas…" /></div>
      {list.length === 0 ? <EmptyState icon={<GraduationCap size={20} />} title="Belum ada kelas" action={<Btn size="sm" onClick={() => setEditing("new")}>Buat kelas pertama</Btn>} /> : (
        <div className="grid gap-3">
          {list.map((c) => {
            const cat = db.categories.course.find((x) => x.id === c.categoryId);
            const ins = db.users.find((u) => u.id === c.instructorId);
            const students = db.enrollments.filter((e) => e.courseId === c.id).length;
            return (
              <div key={c.id} className="flex items-center gap-4 rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 px-4 py-3 hover:border-brand-300 dark:hover:border-ink-600 transition-colors">
                <img src={c.thumbnail} alt="" className="w-20 h-13 h-14 rounded-lg object-cover shrink-0" />
                <div className="min-w-0 grow">
                  <p className="text-sm font-bold text-ink-800 dark:text-ink-50 truncate">{c.title}</p>
                  <p className="text-[11.5px] font-mono text-ink-400 mt-0.5">/{c.slug} · {courseLessons(c).length} lesson · {students} siswa · {ins?.name}</p>
                </div>
                {cat && <span className="hidden lg:block"><Badge tone="neutral">{cat.name}</Badge></span>}
                <Badge tone={c.price === 0 ? "ok" : "accent"}>{c.price === 0 ? "Gratis" : fmtIDR(c.price)}</Badge>
                <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setCurriculum(c)} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10" title="Kurikulum"><Layers size={15} /></button>
                  <Link to={`/courses/${c.slug}`} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10" title="Lihat"><ExternalLink size={15} /></Link>
                  <button onClick={() => setEditing(c)} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10" title="Ubah"><Pencil size={15} /></button>
                  <button onClick={() => setDeleting(c)} className="rounded-lg p-2 text-ink-400 hover:text-bad-500 hover:bg-bad-500/10" title="Hapus"><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && <CourseDrawer initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      {curriculum && <CurriculumModal course={curriculum} onClose={() => setCurriculum(null)} />}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Hapus kelas?"
        footer={<><Btn variant="ghost" onClick={() => setDeleting(null)}>Batal</Btn><Btn variant="danger" onClick={() => {
          if (!deleting) return;
          update((d) => { d.courses = d.courses.filter((x) => x.id !== deleting.id); d.enrollments = d.enrollments.filter((e) => e.courseId !== deleting.id); });
          log("course_deleted", `Kelas “${deleting.title}” dihapus`); toast("Kelas dihapus", "info"); setDeleting(null);
        }}>Hapus</Btn></>}>
        <p className="text-sm text-ink-500 dark:text-ink-300">“{deleting?.title}” beserta enrollment terkait akan dihapus. Tindakan tidak dapat dibatalkan.</p>
      </Modal>
    </div>
  );
}

function CourseDrawer({ initial, onClose }: { initial: Course | null; onClose: () => void }) {
  const { db, user } = useScope();
  const { update, toast, log } = useApp();
  const [f, setF] = useState(() => ({
    title: initial?.title ?? "", slug: initial?.slug ?? "", description: initial?.description ?? "",
    longDescription: initial?.longDescription ?? "", categoryId: initial?.categoryId ?? db?.categories.course[0]?.id ?? "",
    price: initial ? String(initial.price) : "0", level: (initial?.level ?? "Pemula") as string, status: (initial?.status ?? "draft") as string,
    tags: initial?.tags.join(", ") ?? "", thumbnail: initial?.thumbnail ?? "", certificateEnabled: initial?.certificateEnabled ?? true,
  }));
  const [err, setErr] = useState("");
  if (!db || !user) return null;
  const price = Math.max(0, Number(f.price) || 0);
  const fee = Math.round(price * PLATFORM_FEE);
  const save = () => {
    if (!f.title.trim()) { setErr("Judul wajib diisi."); return; }
    const payload = {
      id: initial?.id ?? uid(), slug: f.slug.trim() ? slugify(f.slug) : slugify(f.title), title: f.title.trim(),
      description: f.description, longDescription: f.longDescription, categoryId: f.categoryId, instructorId: initial?.instructorId ?? user.id,
      price, level: f.level as Course["level"], status: f.status as Course["status"],
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean), thumbnail: f.thumbnail || IMG.web,
      certificateEnabled: f.certificateEnabled, rating: initial?.rating ?? 4.5, modules: initial?.modules ?? [], createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    update((d) => {
      if (initial) { const i = d.courses.findIndex((x) => x.id === initial.id); if (i >= 0) d.courses[i] = payload; }
      else d.courses.unshift(payload);
    });
    log(initial ? "course_updated" : "course_created", `Kelas “${payload.title}” ${initial ? "diperbarui" : "dibuat"}`);
    toast(initial ? "Kelas diperbarui" : "Kelas dibuat", "ok"); onClose();
  };
  return (
    <Drawer open onClose={onClose} title={initial ? "Ubah Kelas" : "Kelas Baru"}
      footer={<><Btn variant="ghost" onClick={onClose}>Batal</Btn><Btn onClick={save}>Simpan Kelas</Btn></>}>
      <div className="space-y-4">
        {err && <p className="rounded-lg bg-bad-500/10 border border-bad-500/30 px-3.5 py-2.5 text-[13px] font-semibold text-bad-500">{err}</p>}
        <Field label="Judul Kelas"><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="cth: Laravel Dasar hingga Mahir" /></Field>
        <Field label="Slug"><TextInput value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder={slugify(f.title)} /></Field>
        <Field label="Deskripsi singkat"><TextInput value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kategori"><Select value={f.categoryId} onChange={(e) => setF({ ...f, categoryId: e.target.value })}>{db.categories.course.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
          <Field label="Level"><Select value={f.level} onChange={(e) => setF({ ...f, level: e.target.value })}><option>Pemula</option><option>Menengah</option><option>Lanjutan</option></Select></Field>
          <Field label="Harga (Rp)" hint="0 = kelas gratis"><TextInput type="number" min={0} step={1000} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
          <Field label="Status"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="draft">Draft</option><option value="published">Published</option></Select></Field>
        </div>
        {price > 0 && (
          <div className="rounded-xl border border-accent-400/40 bg-accent-500/8 p-4 text-[13px]">
            <p className="font-bold text-accent-700 dark:text-accent-300 mb-2">Pembagian pendapatan per transaksi</p>
            <div className="space-y-1 font-mono text-ink-600 dark:text-ink-200">
              <p className="flex justify-between"><span>Harga kelas</span><b>{fmtIDR(price)}</b></p>
              <p className="flex justify-between"><span>Biaya platform (15%)</span><b className="text-bad-500">− {fmtIDR(fee)}</b></p>
              <p className="flex justify-between border-t border-accent-400/30 pt-1.5"><span>Bagian instruktur</span><b className="text-ok-500">{fmtIDR(price - fee)}</b></p>
            </div>
          </div>
        )}
        <Field label="Tags" hint="pisahkan dengan koma"><TextInput value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></Field>
        <Field label="Thumbnail">
          <div className="grid gap-2">
            <TextInput value={f.thumbnail} onChange={(e) => setF({ ...f, thumbnail: e.target.value })} placeholder="URL gambar atau pilih dari media" />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {db.media.map((m) => (
                <button key={m.id} onClick={() => setF({ ...f, thumbnail: m.url })} className={cx("w-16 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all", f.thumbnail === m.url ? "border-brand-500" : "border-transparent opacity-70 hover:opacity-100")}>
                  <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                </button>
              ))}
              {db.media.length === 0 && <p className="text-xs text-ink-400">Belum ada media — unggah di menu Media.</p>}
            </div>
          </div>
        </Field>
        <Field label="Deskripsi lengkap"><RichEditor value={f.longDescription} onChange={(html) => setF({ ...f, longDescription: html })} /></Field>
        <div className="flex items-center justify-between rounded-xl border border-ink-200 dark:border-ink-700 px-4 py-3">
          <div><p className="text-sm font-bold text-ink-800 dark:text-ink-50">Sertifikat digital</p><p className="text-xs text-ink-400">Terbit otomatis saat siswa lulus quiz akhir</p></div>
          <Toggle checked={f.certificateEnabled} onChange={(v) => setF({ ...f, certificateEnabled: v })} />
        </div>
      </div>
    </Drawer>
  );
}

function CurriculumModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const { update, toast } = useApp();
  const [lessonModal, setLessonModal] = useState<{ moduleId: string } | null>(null);
  const mutate = (fn: (c: Course) => void) => update((d) => { const c = d.courses.find((x) => x.id === course.id); if (c) fn(c); });
  const fresh = useApp().db?.courses.find((x) => x.id === course.id) ?? course;
  return (
    <Modal open onClose={onClose} wide title={<span>Kurikulum — <span className="text-brand-600 dark:text-brand-300">{fresh.title}</span></span>}
      footer={<Btn onClick={() => { toast("Kurikulum tersimpan", "ok"); onClose(); }}>Selesai</Btn>}>
      <div className="space-y-4">
        {fresh.modules.map((m, mi) => (
          <div key={m.id} className="rounded-xl border border-ink-200 dark:border-ink-700 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-ink-50 dark:bg-ink-850">
              <span className="font-mono text-[11px] font-bold text-brand-600 dark:text-brand-300">{String(mi + 1).padStart(2, "0")}</span>
              <TextInput defaultValue={m.title} onBlur={(e) => { if (e.target.value.trim()) mutate((c) => { const mm = c.modules.find((x) => x.id === m.id); if (mm) mm.title = e.target.value.trim(); }); }} className="h-8 text-[13px] font-bold" />
              <button onClick={() => mutate((c) => { c.modules = c.modules.filter((x) => x.id !== m.id); })} className="rounded-lg p-1.5 text-ink-400 hover:text-bad-500 hover:bg-bad-500/10 shrink-0"><Trash2 size={14} /></button>
            </div>
            {m.lessons.map((l, li) => (
              <div key={l.id} className="flex items-center gap-3 px-4 py-2.5 border-t border-ink-100 dark:border-ink-800">
                <span className="w-7 h-7 rounded-lg bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300 flex items-center justify-center shrink-0">
                  {l.type === "video" ? <Play size={13} /> : l.type === "quiz" ? <HelpCircle size={13} /> : l.type === "file" ? <FileText size={13} /> : <FileText size={13} />}
                </span>
                <div className="grow min-w-0">
                  <p className="text-[13px] font-semibold text-ink-700 dark:text-ink-100 truncate">{l.title}</p>
                  <p className="text-[10.5px] font-mono text-ink-400">{l.type}{l.free ? " · preview gratis" : ""} · {l.duration}</p>
                </div>
                <button onClick={() => mutate((c) => { const mm = c.modules.find((x) => x.id === m.id); if (!mm || li === 0) return; [mm.lessons[li - 1], mm.lessons[li]] = [mm.lessons[li], mm.lessons[li - 1]]; })} disabled={li === 0} className="rounded p-1 text-ink-400 hover:text-brand-600 disabled:opacity-25"><ArrowUp size={13} /></button>
                <button onClick={() => mutate((c) => { const mm = c.modules.find((x) => x.id === m.id); if (!mm || li >= mm.lessons.length - 1) return; [mm.lessons[li + 1], mm.lessons[li]] = [mm.lessons[li], mm.lessons[li + 1]]; })} disabled={li >= m.lessons.length - 1} className="rounded p-1 text-ink-400 hover:text-brand-600 disabled:opacity-25"><ArrowDown size={13} /></button>
                <button onClick={() => mutate((c) => { const mm = c.modules.find((x) => x.id === m.id); if (mm) mm.lessons = mm.lessons.filter((x) => x.id !== l.id); })} className="rounded p-1 text-ink-400 hover:text-bad-500"><Trash2 size={13} /></button>
              </div>
            ))}
            <button onClick={() => setLessonModal({ moduleId: m.id })} className="w-full px-4 py-2.5 text-[13px] font-bold text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-ink-850 border-t border-ink-100 dark:border-ink-800 flex items-center gap-2"><Plus size={14} />Tambah Lesson</button>
          </div>
        ))}
        <Btn variant="soft" className="w-full" onClick={() => mutate((c) => { c.modules.push({ id: uid(), title: `Modul ${c.modules.length + 1}`, lessons: [] }); })}><Plus size={15} />Tambah Module</Btn>
      </div>
      {lessonModal && <LessonModal onClose={() => setLessonModal(null)} onSave={(l) => {
        mutate((c) => { const m = c.modules.find((x) => x.id === lessonModal.moduleId); if (m) m.lessons.push(l); });
        toast("Lesson ditambahkan", "ok"); setLessonModal(null);
      }} hasQuiz />}
    </Modal>
  );
}

function LessonModal({ onClose, onSave, hasQuiz }: { onClose: () => void; onSave: (l: Lesson) => void; hasQuiz?: boolean }) {
  const [f, setF] = useState({ title: "", type: "video" as Lesson["type"], youtubeId: "", content: "", fileName: "", duration: "", free: false });
  return (
    <Modal open onClose={onClose} title="Tambah Lesson"
      footer={<><Btn variant="ghost" onClick={onClose}>Batal</Btn><Btn onClick={() => {
        if (!f.title.trim()) return;
        onSave({ id: uid(), title: f.title.trim(), type: f.type, youtubeId: f.youtubeId ? ytId(f.youtubeId) || f.youtubeId : undefined, content: f.content || undefined, fileName: f.fileName || undefined, duration: f.duration || "10 mnt", free: f.free });
      }}>Tambah</Btn></>}>
      <div className="space-y-4">
        <Field label="Judul lesson"><TextInput autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipe"><Select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as Lesson["type"] })}><option value="video">Video (YouTube)</option><option value="text">Teks / Bacaan</option><option value="file">File materi</option>{hasQuiz && <option value="quiz">Quiz</option>}</Select></Field>
          <Field label="Durasi"><TextInput value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })} placeholder="12:30 atau 10 mnt" /></Field>
        </div>
        {f.type === "video" && <Field label="URL YouTube" hint="youtube.com/watch atau youtu.be — otomatis jadi embed"><TextInput value={f.youtubeId} onChange={(e) => setF({ ...f, youtubeId: e.target.value })} placeholder="https://youtu.be/…" /></Field>}
        {f.type === "text" && <Field label="Konten"><RichEditor value={f.content} onChange={(html) => setF({ ...f, content: html })} compact /></Field>}
        {f.type === "file" && <Field label="Nama file"><TextInput value={f.fileName} onChange={(e) => setF({ ...f, fileName: e.target.value })} placeholder="modul-01.pdf" /></Field>}
        {f.type === "quiz" && <p className="rounded-lg bg-accent-500/10 border border-accent-400/30 px-3.5 py-2.5 text-[13px] text-accent-700 dark:text-accent-300 font-semibold">Buat soal quiz-nya di menu Quiz setelah lesson ini tersimpan.</p>}
        <div className="flex items-center justify-between rounded-lg border border-ink-200 dark:border-ink-700 px-3.5 py-2.5">
          <span className="text-sm font-semibold text-ink-700 dark:text-ink-100">Preview gratis (tanpa enroll)</span>
          <Toggle checked={f.free} onChange={(v) => setF({ ...f, free: v })} />
        </div>
      </div>
    </Modal>
  );
}

// ─── Quizzes ────────────────────────────────────────────────────────────────
export function QuizManager() {
  const { db, user, mine } = useScope();
  const { update, toast, log } = useApp();
  const [editing, setEditing] = useState<Quiz | null | "new">(null);
  if (!db || !user) return null;
  const myCourseIds = db.courses.filter((c) => !mine || c.instructorId === user.id).map((c) => c.id);
  const list = db.quizzes.filter((qz) => myCourseIds.includes(qz.courseId));
  return (
    <div>
      <DashHead title="Quiz" desc="Multiple choice, benar/salah, jawaban ganda · time limit · passing grade"
        action={<Btn onClick={() => setEditing("new")}><Plus size={16} />Quiz Baru</Btn>} />
      {list.length === 0 ? <EmptyState icon={<HelpCircle size={20} />} title="Belum ada quiz" desc="Buat quiz dan hubungkan ke lesson bertipe quiz." /> : (
        <div className="grid gap-3">
          {list.map((qz) => {
            const c = db.courses.find((x) => x.id === qz.courseId);
            const attempts = db.attempts.filter((a) => a.quizId === qz.id).length;
            return (
              <div key={qz.id} className="flex items-center gap-4 rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 px-4 py-3.5">
                <span className="w-10 h-10 rounded-lg bg-accent-500/12 text-accent-600 dark:text-accent-300 flex items-center justify-center shrink-0"><QrCode size={18} /></span>
                <div className="grow min-w-0">
                  <p className="text-sm font-bold text-ink-800 dark:text-ink-50">{qz.title}</p>
                  <p className="text-[11.5px] font-mono text-ink-400 mt-0.5">{c?.title} · {qz.questions.length} soal · {qz.timeLimit} mnt · passing {qz.passingGrade}% · {attempts} percobaan</p>
                </div>
                {qz.randomize && <Badge tone="info">acak</Badge>}
                <button onClick={() => setEditing(qz)} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10"><Pencil size={15} /></button>
                <button onClick={() => { update((d) => { d.quizzes = d.quizzes.filter((x) => x.id !== qz.id); }); log("quiz_deleted", `Quiz “${qz.title}” dihapus`); toast("Quiz dihapus", "info"); }} className="rounded-lg p-2 text-ink-400 hover:text-bad-500 hover:bg-bad-500/10"><Trash2 size={15} /></button>
              </div>
            );
          })}
        </div>
      )}
      {editing && <QuizEditor initial={editing === "new" ? null : editing} defaultCourseId={myCourseIds[0]} onClose={() => setEditing(null)} />}
    </div>
  );
}

function QuizEditor({ initial, defaultCourseId, onClose }: { initial: Quiz | null; defaultCourseId?: string; onClose: () => void }) {
  const { db } = useScope();
  const { update, toast, log } = useApp();
  const [f, setF] = useState(() => ({
    title: initial?.title ?? "", courseId: initial?.courseId ?? defaultCourseId ?? "", lessonId: initial?.lessonId ?? "",
    timeLimit: String(initial?.timeLimit ?? 10), passingGrade: String(initial?.passingGrade ?? 70),
    attemptLimit: String(initial?.attemptLimit ?? 3), randomize: initial?.randomize ?? false,
  }));
  const [questions, setQuestions] = useState<Question[]>(initial?.questions ?? []);
  const [adding, setAdding] = useState(false);
  if (!db) return null;
  const quizLessons = db.courses.find((c) => c.id === f.courseId)?.modules.flatMap((m) => m.lessons).filter((l) => l.type === "quiz") ?? [];
  const save = () => {
    if (!f.title.trim() || !f.courseId) { toast("Judul dan kelas wajib diisi", "warn"); return; }
    update((d) => {
      const payload: Quiz = { id: initial?.id ?? uid(), courseId: f.courseId, lessonId: f.lessonId, title: f.title.trim(), timeLimit: Number(f.timeLimit) || 10, passingGrade: Number(f.passingGrade) || 70, attemptLimit: Number(f.attemptLimit) || 3, randomize: f.randomize, questions };
      if (initial) { const i = d.quizzes.findIndex((x) => x.id === initial.id); if (i >= 0) d.quizzes[i] = payload; } else d.quizzes.push(payload);
    });
    log(initial ? "quiz_updated" : "quiz_created", `Quiz “${f.title}” disimpan`);
    toast("Quiz disimpan", "ok"); onClose();
  };
  return (
    <Drawer open onClose={onClose} title={initial ? "Ubah Quiz" : "Quiz Baru"}
      footer={<><Btn variant="ghost" onClick={onClose}>Batal</Btn><Btn onClick={save}>Simpan Quiz ({questions.length} soal)</Btn></>}>
      <div className="space-y-4">
        <Field label="Judul quiz"><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kelas"><Select value={f.courseId} onChange={(e) => setF({ ...f, courseId: e.target.value, lessonId: "" })}>{db.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</Select></Field>
          <Field label="Lesson (tipe quiz)"><Select value={f.lessonId} onChange={(e) => setF({ ...f, lessonId: e.target.value })}><option value="">— pilih lesson —</option>{quizLessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}</Select></Field>
          <Field label="Batas waktu (menit)"><TextInput type="number" min={1} value={f.timeLimit} onChange={(e) => setF({ ...f, timeLimit: e.target.value })} /></Field>
          <Field label="Passing grade (%)"><TextInput type="number" min={1} max={100} value={f.passingGrade} onChange={(e) => setF({ ...f, passingGrade: e.target.value })} /></Field>
          <Field label="Maks. percobaan"><TextInput type="number" min={1} value={f.attemptLimit} onChange={(e) => setF({ ...f, attemptLimit: e.target.value })} /></Field>
          <div className="flex items-end pb-2"><Toggle checked={f.randomize} onChange={(v) => setF({ ...f, randomize: v })} label="Acak soal" /></div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-bold text-ink-600 dark:text-ink-200">Bank soal ({questions.length})</p>
            <Btn size="xs" variant="soft" onClick={() => setAdding(true)}><Plus size={13} />Tambah soal</Btn>
          </div>
          <div className="space-y-2">
            {questions.map((qq, i) => (
              <div key={qq.id} className="rounded-lg border border-ink-200 dark:border-ink-700 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13.5px] font-semibold text-ink-800 dark:text-ink-50">{i + 1}. {qq.text}</p>
                  <button onClick={() => setQuestions(questions.filter((x) => x.id !== qq.id))} className="text-ink-300 hover:text-bad-500 shrink-0"><Trash2 size={14} /></button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone={qq.type === "multiple" ? "info" : qq.type === "boolean" ? "warn" : "brand"}>{qq.type}</Badge>
                  <Badge tone="neutral">{qq.points} poin</Badge>
                  {qq.options.map((op, oi) => <span key={oi} className={cx("text-[11px] font-mono px-2 py-0.5 rounded-md border", qq.correct.includes(oi) ? "border-ok-500/50 bg-ok-500/10 text-ok-600 dark:text-ok-500" : "border-ink-200 dark:border-ink-700 text-ink-400")}>{op}</span>)}
                </div>
              </div>
            ))}
            {questions.length === 0 && <p className="text-sm text-ink-400 text-center py-6 border border-dashed border-ink-200 dark:border-ink-700 rounded-lg">Belum ada soal.</p>}
          </div>
        </div>
        {adding && <QuestionBuilder onAdd={(qq) => { setQuestions([...questions, qq]); setAdding(false); }} onCancel={() => setAdding(false)} />}
      </div>
    </Drawer>
  );
}

function QuestionBuilder({ onAdd, onCancel }: { onAdd: (q: Question) => void; onCancel: () => void }) {
  const [f, setF] = useState({ type: "single" as Question["type"], text: "", points: "20", options: ["", ""] });
  const [correct, setCorrect] = useState<number[]>([0]);
  const toggleCorrect = (i: number) => {
    if (f.type === "multiple") setCorrect((c) => c.includes(i) ? c.filter((x) => x !== i) : [...c, i]);
    else setCorrect([i]);
  };
  const changeType = (t: Question["type"]) => {
    if (t === "boolean") { setF({ ...f, type: t, options: ["Benar", "Salah"] }); setCorrect([0]); }
    else { setF({ ...f, type: t, options: f.options.length >= 2 ? f.options : ["", ""] }); setCorrect([0]); }
  };
  return (
    <div className="rounded-xl border-2 border-brand-500/40 bg-brand-50/40 dark:bg-brand-900/15 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipe soal"><Select value={f.type} onChange={(e) => changeType(e.target.value as Question["type"])}><option value="single">Pilihan ganda</option><option value="boolean">Benar / Salah</option><option value="multiple">Jawaban ganda</option></Select></Field>
        <Field label="Poin"><TextInput type="number" min={1} value={f.points} onChange={(e) => setF({ ...f, points: e.target.value })} /></Field>
      </div>
      <Field label="Pertanyaan"><TextInput value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} placeholder="Tulis pertanyaan…" /></Field>
      <Field label="Opsi jawaban" hint={f.type === "multiple" ? "Tandai SEMUA jawaban benar" : "Tandai satu jawaban benar"}>
        <div className="space-y-2">
          {f.options.map((op, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => toggleCorrect(i)} className={cx("w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors", correct.includes(i) ? "border-ok-500 bg-ok-500 text-white" : "border-ink-300 dark:border-ink-600")}>{correct.includes(i) && <CheckCircle2 size={13} />}</button>
              <TextInput value={op} disabled={f.type === "boolean"} onChange={(e) => { const o = [...f.options]; o[i] = e.target.value; setF({ ...f, options: o }); }} placeholder={`Opsi ${i + 1}`} />
              {f.type !== "boolean" && f.options.length > 2 && <button onClick={() => { setF({ ...f, options: f.options.filter((_, x) => x !== i) }); setCorrect(correct.filter((c) => c !== i).map((c) => (c > i ? c - 1 : c))); }} className="text-ink-300 hover:text-bad-500"><Trash2 size={14} /></button>}
            </div>
          ))}
          {f.type !== "boolean" && f.options.length < 6 && <Btn size="xs" variant="ghost" onClick={() => setF({ ...f, options: [...f.options, ""] })}><Plus size={12} />Opsi</Btn>}
        </div>
      </Field>
      <div className="flex justify-end gap-2">
        <Btn size="sm" variant="ghost" onClick={onCancel}>Batal</Btn>
        <Btn size="sm" onClick={() => {
          if (!f.text.trim() || f.options.some((o) => !o.trim()) || correct.length === 0) return;
          onAdd({ id: uid(), type: f.type, text: f.text.trim(), options: f.options, correct, points: Number(f.points) || 10 });
        }}>Tambah Soal</Btn>
      </div>
    </div>
  );
}

// ─── Students & Instructors ─────────────────────────────────────────────────
export function StudentsManager() {
  const { db, update, toast, log } = useScopeAll();
  const [q, setQ] = useState("");
  if (!db) return null;
  const list = db.users.filter((u) => u.role === "student" && (!q || (u.name + u.email).toLowerCase().includes(q.toLowerCase())));
  return (
    <div>
      <DashHead title="Siswa" desc={`${list.length} siswa terdaftar`} />
      <div className="mb-5 max-w-sm"><SearchInput value={q} onChange={setQ} placeholder="Cari siswa…" /></div>
      <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
        {list.map((u) => {
          const enr = db.enrollments.filter((e) => e.studentId === u.id).length;
          const cert = db.certificates.filter((c) => c.studentId === u.id).length;
          return (
            <div key={u.id} className="flex items-center gap-3.5 px-4 py-3 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
              <Avatar user={u} />
              <div className="grow min-w-0">
                <p className="text-sm font-bold text-ink-800 dark:text-ink-50">{u.name}</p>
                <p className="text-[11.5px] font-mono text-ink-400">{u.email} · bergabung {fmtDate(u.joined)}</p>
              </div>
              <Badge tone="brand"><BookOpen size={11} />{enr} kelas</Badge>
              <Badge tone="accent" className="hidden sm:inline-flex"><Award size={11} />{cert} sertifikat</Badge>
              <Badge tone={statusTone(u.status)}>{u.status}</Badge>
              <button onClick={() => { update((d) => { const x = d.users.find((y) => y.id === u.id); if (x) x.status = x.status === "active" ? "suspended" : "active"; }); log("user_status", `Status siswa ${u.name} diubah`); toast("Status diperbarui", "ok"); }}
                className="rounded-lg p-2 text-ink-400 hover:text-warn-600 hover:bg-warn-500/10" title={u.status === "active" ? "Tangguhkan" : "Aktifkan"}><Ban size={15} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function useScopeAll() {
  const app = useApp();
  return app;
}

export function InstructorsManager() {
  const { db, user } = useApp();
  if (!db || !user) return null;
  const list = db.users.filter((u) => u.role === "instructor");
  return (
    <div>
      <DashHead title="Instruktur" desc="Moderasi dan pantau kinerja instruktur" />
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((ins) => {
          const courses = db.courses.filter((c) => c.instructorId === ins.id);
          const students = db.enrollments.filter((e) => courses.some((c) => c.id === e.courseId)).length;
          const earning = db.walletTx.filter((t) => t.instructorId === ins.id).reduce((s, t) => s + t.amount, 0);
          return (
            <div key={ins.id} className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-5 hover:shadow-lift transition-all">
              <div className="flex items-center gap-3">
                <Avatar user={ins} size={44} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink-900 dark:text-white">{ins.name}</p>
                  <p className="text-[11px] font-mono text-ink-400 truncate">{ins.email}</p>
                </div>
                <span className="ml-auto"><Badge tone={statusTone(ins.status)}>{ins.status}</Badge></span>
              </div>
              <p className="mt-3 text-[13px] text-ink-500 dark:text-ink-300 line-clamp-2">{ins.bio}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[{ l: "Kelas", v: String(courses.length) }, { l: "Siswa", v: String(students) }, { l: "Net", v: fmtIDR(Math.max(0, earning)).replace("Rp", "").trim() }].map((x) => (
                  <div key={x.l} className="rounded-lg bg-ink-50 dark:bg-ink-850 border border-ink-100 dark:border-ink-800 py-2">
                    <p className="font-display font-bold text-[13px] text-ink-800 dark:text-ink-50">{x.v}</p>
                    <p className="text-[9.5px] font-mono uppercase text-ink-400 mt-0.5">{x.l}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Certificates ───────────────────────────────────────────────────────────
export function CertificatesManager() {
  const { db } = useApp();
  const [q, setQ] = useState("");
  if (!db) return null;
  const list = db.certificates.filter((c) => {
    const s = db.users.find((u) => u.id === c.studentId);
    return !q || (c.code + (s?.name ?? "")).toLowerCase().includes(q.toLowerCase());
  });
  return (
    <div>
      <DashHead title="Sertifikat" desc={`${list.length} sertifikat digital terbit · terverifikasi QR & URL publik`} />
      <div className="mb-5 max-w-sm"><SearchInput value={q} onChange={setQ} placeholder="Cari kode atau nama…" /></div>
      {list.length === 0 ? <EmptyState icon={<Award size={20} />} title="Belum ada sertifikat" desc="Sertifikat terbit otomatis saat siswa lulus quiz dengan progress memadai." /> : (
        <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
          {list.map((c) => {
            const s = db.users.find((u) => u.id === c.studentId);
            const co = db.courses.find((x) => x.id === c.courseId);
            return (
              <div key={c.id} className="flex items-center gap-3.5 px-4 py-3 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
                <span className="w-9 h-9 rounded-lg bg-accent-500/15 text-accent-600 dark:text-accent-300 flex items-center justify-center shrink-0"><Award size={16} /></span>
                <div className="grow min-w-0">
                  <p className="text-sm font-bold text-ink-800 dark:text-ink-50 font-mono">{c.code}</p>
                  <p className="text-[11.5px] text-ink-400 truncate">{s?.name} · {co?.title} · {fmtDate(c.issuedAt)}</p>
                </div>
                <Link to={`/certificate/${c.code}`} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10" title="Lihat"><ExternalLink size={15} /></Link>
                <Link to={`/verify-certificate/${c.code}`} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10" title="Verifikasi"><CheckCircle2 size={15} /></Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Student dashboard extras ───────────────────────────────────────────────
export function MyCoursesPage() {
  const { db, user } = useApp();
  if (!db || !user) return null;
  const mine = db.enrollments.filter((e) => e.studentId === user.id);
  return (
    <div>
      <DashHead title="Kelas Saya" desc={`${mine.length} kelas diikuti`} action={<Link to="/courses"><Btn variant="outline" size="sm"><Plus size={14} />Jelajahi Kelas</Btn></Link>} />
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {mine.map((e) => {
          const c = db.courses.find((x) => x.id === e.courseId);
          if (!c) return null;
          const total = courseLessons(c).length;
          const prog = total ? Math.round((e.completedLessons.length / total) * 100) : 0;
          return (
            <Link key={e.id} to={`/learn/${c.id}`} className="group rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden hover:shadow-pop hover:-translate-y-0.5 transition-all">
              <div className="relative" style={{ aspectRatio: "16/8" }}>
                <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                {prog === 100 && <span className="absolute top-2 right-2"><Badge tone="ok" className="bg-ok-500 text-white border-ok-500">Selesai</Badge></span>}
              </div>
              <div className="p-4">
                <p className="font-display font-semibold text-[14.5px] text-ink-900 dark:text-white line-clamp-2 group-hover:text-brand-700 dark:group-hover:text-brand-300">{c.title}</p>
                <p className="text-[11px] font-mono text-ink-400 mt-1">{e.completedLessons.length}/{total} lesson · sejak {fmtDate(e.date)}</p>
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="grow h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden"><div className={cx("h-full rounded-full", prog === 100 ? "bg-ok-500" : "bg-brand-500")} style={{ width: `${prog}%` }} /></div>
                  <span className="text-[11px] font-mono font-bold text-ink-500 dark:text-ink-300">{prog}%</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {mine.length === 0 && <EmptyState icon={<GraduationCap size={20} />} title="Belum ada kelas" action={<Link to="/courses"><Btn size="sm">Cari Kelas</Btn></Link>} />}
    </div>
  );
}

export function GradesPage() {
  const { db, user } = useApp();
  if (!db || !user) return null;
  const attempts = db.attempts.filter((a) => a.studentId === user.id).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div>
      <DashHead title="Nilai Quiz" desc="Riwayat seluruh percobaan quiz kamu" />
      {attempts.length === 0 ? <EmptyState icon={<HelpCircle size={20} />} title="Belum ada nilai" desc="Ikuti quiz di kelas yang kamu ikuti." /> : (
        <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
          {attempts.map((a) => {
            const qz = db.quizzes.find((x) => x.id === a.quizId);
            const c = db.courses.find((x) => x.id === a.courseId);
            return (
              <div key={a.id} className="flex items-center gap-3.5 px-4 py-3 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
                <span className={cx("w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-[13px] shrink-0", a.passed ? "bg-ok-500/12 text-ok-500" : "bg-bad-500/12 text-bad-500")}>{a.percent}%</span>
                <div className="grow min-w-0">
                  <p className="text-sm font-bold text-ink-800 dark:text-ink-50">{qz?.title}</p>
                  <p className="text-[11.5px] font-mono text-ink-400 truncate">{c?.title} · {fmtDate(a.date)}</p>
                </div>
                <span className="text-[12px] font-mono text-ink-400 hidden sm:block">{a.score}/{a.total} poin</span>
                <Badge tone={a.passed ? "ok" : "bad"}>{a.passed ? "LULUS" : "GAGAL"}</Badge>
                <Link to={`/learn/${a.courseId}`} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10"><ExternalLink size={15} /></Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function StudentPaymentsPage() {
  const { db, user } = useApp();
  if (!db || !user) return null;
  const pays = db.payments.filter((p) => p.studentId === user.id);
  return (
    <div>
      <DashHead title="Riwayat Pembayaran" desc="Seluruh transaksi pembelian kelas kamu" />
      {pays.length === 0 ? <EmptyState icon={<QrCode size={20} />} title="Belum ada pembayaran" desc="Transaksi kelas berbayar akan muncul di sini." /> : (
        <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
          {pays.map((p) => {
            const c = db.courses.find((x) => x.id === p.courseId);
            return (
              <div key={p.id} className="flex items-center gap-3.5 px-4 py-3 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
                <span className="w-9 h-9 rounded-lg bg-brand-500/12 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0"><QrCode size={15} /></span>
                <div className="grow min-w-0">
                  <p className="text-sm font-bold text-ink-800 dark:text-ink-50 font-mono">{p.invoice}</p>
                  <p className="text-[11.5px] text-ink-400 truncate">{c?.title} · {p.method} · {fmtDate(p.date)}</p>
                </div>
                <span className="font-mono text-sm font-bold text-ink-800 dark:text-ink-50">{fmtIDR(p.amount)}</span>
                <Badge tone={statusTone(p.status)}>{p.status}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export { YouTubeEmbed as _Y };
