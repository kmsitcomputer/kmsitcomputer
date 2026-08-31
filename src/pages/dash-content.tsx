import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Copy, ExternalLink, FileImage, Pencil, Plus, Trash2, Upload, Eye, GripVertical, LayoutTemplate } from "lucide-react";
import { useApp } from "../lib/store";
import { fmtDate, fmtNum, slugify, uid, ytId, type Category, type HomeSection, type SectionType } from "../lib/db";
import { Badge, Btn, CoverArt, cx, Drawer, EmptyState, Field, Modal, SearchInput, Select, statusTone, TextInput, Toggle } from "../components/ui";
import { RichEditor } from "../components/editor";

export function DashHead({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div><h1 className="font-display text-[22px] font-bold text-ink-900 dark:text-white tracking-tight">{title}</h1>{desc && <p className="text-[13.5px] text-ink-400 mt-0.5">{desc}</p>}</div>
      {action}
    </div>
  );
}

// ─── Content manager (articles / news / tutorials) ─────────────────────────
type Kind = "articles" | "news" | "tutorials";
const KIND_CFG: Record<Kind, { label: string; catKey: "article" | "news" | "tutorial"; hasTags: boolean; hasVideo: boolean; descField: "excerpt" | "description"; path: string }> = {
  articles: { label: "Artikel", catKey: "article", hasTags: true, hasVideo: false, descField: "excerpt", path: "articles" },
  news: { label: "Berita", catKey: "news", hasTags: false, hasVideo: false, descField: "excerpt", path: "news" },
  tutorials: { label: "Tutorial", catKey: "tutorial", hasTags: true, hasVideo: true, descField: "description", path: "tutorials" },
};

export function ContentManager({ kind }: { kind: Kind }) {
  const { db, user, update, toast, log } = useApp();
  const cfg = KIND_CFG[kind];
  const [q, setQ] = useState("");
  const [fCat, setFCat] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  if (!db || !user) return null;

  const cats = db.categories[cfg.catKey];
  const items = (db[kind] as unknown as Record<string, unknown>[]).filter((x) =>
    (!q || String(x.title).toLowerCase().includes(q.toLowerCase())) &&
    (!fCat || x.categoryId === fCat) && (!fStatus || x.status === fStatus))
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));

  const remove = () => {
    if (!deleting) return;
    update((d) => {
      const rec = d as unknown as Record<string, { id: string }[]>;
      rec[kind] = rec[kind].filter((x) => x.id !== deleting.id);
    });
    log(kind === "articles" ? "article_deleted" : "content_deleted", `${cfg.label} “${deleting.title}” dihapus`);
    toast(`${cfg.label} dihapus`, "info"); setDeleting(null);
  };

  return (
    <div>
      <DashHead title={cfg.label} desc={`${items.length} konten · kelola ${cfg.label.toLowerCase()} website`}
        action={<Btn onClick={() => setEditing({ id: null })}><Plus size={16} />{cfg.label} Baru</Btn>} />
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="grow"><SearchInput value={q} onChange={setQ} placeholder={`Cari ${cfg.label.toLowerCase()}…`} /></div>
        <Select value={fCat} onChange={(e) => setFCat(e.target.value)} className="w-44"><option value="">Semua kategori</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
        <Select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="w-40"><option value="">Semua status</option><option value="published">Terbit</option><option value="draft">Draft</option><option value="scheduled">Terjadwal</option><option value="archived">Arsip</option></Select>
      </div>
      {items.length === 0 ? <EmptyState icon={<FileImage size={20} />} title={`Belum ada ${cfg.label.toLowerCase()}`} action={<Btn size="sm" onClick={() => setEditing({ id: null })}>Buat pertama</Btn>} /> : (
        <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
          {items.map((x) => {
            const cat = cats.find((c) => c.id === x.categoryId);
            return (
              <div key={String(x.id)} className="flex items-center gap-4 px-4 py-3 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0 hover:bg-brand-50/40 dark:hover:bg-ink-850 transition-colors">
                <div className="w-16 h-11 rounded-lg overflow-hidden shrink-0"><CoverArt hue={Number(x.hue)} seed={String(x.id)} /></div>
                <div className="min-w-0 grow">
                  <p className="text-sm font-bold text-ink-800 dark:text-ink-50 truncate">{String(x.title)}</p>
                  <p className="text-[11.5px] font-mono text-ink-400 mt-0.5">/{cfg.path}/{String(x.slug)} · {fmtDate(String(x.publishedAt))} · {fmtNum(Number(x.views))}x dilihat</p>
                </div>
                {cat && <span className="hidden md:block"><Badge tone="neutral" className="border-0" ><span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />{cat.name}</Badge></span>}
                <Badge tone={statusTone(String(x.status))}>{String(x.status)}</Badge>
                <div className="flex gap-1 shrink-0">
                  <Link to={`/${cfg.path}/${x.slug}`} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10" title="Lihat"><Eye size={15} /></Link>
                  <button onClick={() => setEditing(x)} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10" title="Ubah"><Pencil size={15} /></button>
                  <button onClick={() => setDeleting(x)} className="rounded-lg p-2 text-ink-400 hover:text-bad-500 hover:bg-bad-500/10" title="Hapus"><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && <EditorialDrawer kind={kind} initial={editing} onClose={() => setEditing(null)} />}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title={`Hapus ${cfg.label}?`}
        footer={<><Btn variant="ghost" onClick={() => setDeleting(null)}>Batal</Btn><Btn variant="danger" onClick={remove}>Hapus Permanen</Btn></>}>
        <p className="text-sm text-ink-500 dark:text-ink-300">“{deleting && String(deleting.title)}” akan dihapus permanen dari database. Tindakan tidak dapat dibatalkan.</p>
      </Modal>
    </div>
  );
}

function EditorialDrawer({ kind, initial, onClose }: { kind: Kind; initial: Record<string, unknown>; onClose: () => void }) {
  const { db, user, update, toast, log } = useApp();
  const cfg = KIND_CFG[kind];
  const isNew = !initial.id;
  const [f, setF] = useState(() => ({
    title: String(initial.title ?? ""), slug: String(initial.slug ?? ""),
    categoryId: String(initial.categoryId ?? db?.categories[cfg.catKey][0]?.id ?? ""),
    status: String(initial.status ?? "draft"), tags: Array.isArray(initial.tags) ? (initial.tags as string[]).join(", ") : "",
    youtubeId: String(initial.youtubeId ?? ""), desc: String(initial[cfg.descField] ?? ""), content: String(initial.content ?? ""),
    seoTitle: String(initial.seoTitle ?? ""), seoDesc: String(initial.seoDesc ?? ""), hue: Number(initial.hue ?? Math.floor(Math.random() * 360)),
  }));
  const [err, setErr] = useState("");
  if (!db || !user) return null;
  const cats = db.categories[cfg.catKey];
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  const save = () => {
    if (!f.title.trim()) { setErr("Judul wajib diisi."); return; }
    const slug = f.slug.trim() ? slugify(f.slug) : slugify(f.title);
    update((d) => {
      const list = d[kind] as unknown as Record<string, unknown>[];
      const base: Record<string, unknown> = {
        id: String(initial.id ?? uid()), slug, title: f.title.trim(), categoryId: f.categoryId, status: f.status,
        content: f.content, [cfg.descField]: f.desc, authorId: user.id, hue: f.hue,
        seoTitle: f.seoTitle, seoDesc: f.seoDesc,
        publishedAt: String(initial.publishedAt ?? new Date().toISOString()),
        views: Number(initial.views ?? 0),
      };
      if (cfg.hasTags) base.tags = f.tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (cfg.hasVideo && f.youtubeId) base.youtubeId = ytId(f.youtubeId) || f.youtubeId;
      if (isNew) list.unshift(base); else { const i = list.findIndex((x) => x.id === initial.id); if (i >= 0) list[i] = { ...list[i], ...base }; }
    });
    log(isNew ? "content_created" : "content_updated", `${cfg.label} “${f.title}” ${isNew ? "dibuat" : "diperbarui"}`);
    toast(isNew ? `${cfg.label} dibuat` : "Perubahan disimpan", "ok");
    onClose();
  };

  return (
    <Drawer open onClose={onClose} title={`${isNew ? "Buat" : "Ubah"} ${cfg.label}`}
      footer={<><Btn variant="ghost" onClick={onClose}>Batal</Btn><Btn onClick={save}>{isNew ? "Terbitkan Draft" : "Simpan Perubahan"}</Btn></>}>
      <div className="space-y-4">
        {err && <p className="rounded-lg bg-bad-500/10 border border-bad-500/30 px-3.5 py-2.5 text-[13px] font-semibold text-bad-500">{err}</p>}
        <Field label="Judul"><TextInput value={f.title} onChange={(e) => set("title", e.target.value)} placeholder={`Judul ${cfg.label.toLowerCase()}…`} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Slug" hint="URL ramah SEO"><TextInput value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder={slugify(f.title) || "slug-url"} /></Field>
          <Field label="Kategori"><Select value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)}>{cats.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status"><Select value={f.status} onChange={(e) => set("status", e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="scheduled">Scheduled</option><option value="archived">Archived</option></Select></Field>
          {cfg.hasTags && <Field label="Tags" hint="pisahkan dengan koma"><TextInput value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="react, mysql" /></Field>}
          {cfg.hasVideo && <Field label="YouTube URL" hint="Otomatis jadi embed"><TextInput value={f.youtubeId} onChange={(e) => set("youtubeId", e.target.value)} placeholder="https://youtu.be/…" /></Field>}
        </div>
        <Field label={kind === "tutorials" ? "Deskripsi singkat" : "Excerpt"}><TextInput value={f.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Ringkasan yang tampil di kartu…" /></Field>
        <Field label="Konten">
          <RichEditor value={f.content} onChange={(html) => set("content", html)} />
        </Field>
        <details className="rounded-xl border border-ink-200 dark:border-ink-700 p-4">
          <summary className="cursor-pointer text-[13px] font-bold text-ink-600 dark:text-ink-200">Pengaturan SEO</summary>
          <div className="grid gap-3 mt-3">
            <Field label="SEO Title"><TextInput value={f.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} /></Field>
            <Field label="Meta Description"><TextInput value={f.seoDesc} onChange={(e) => set("seoDesc", e.target.value)} /></Field>
          </div>
        </details>
      </div>
    </Drawer>
  );
}

// ─── Pages ──────────────────────────────────────────────────────────────────
export function PagesManager() {
  const { db, update, toast, log } = useApp();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  if (!db) return null;
  return (
    <div>
      <DashHead title="Halaman" desc="Halaman statis kustom (FAQ, kebijakan, dll.)" action={<Btn onClick={() => setEditing({ id: null })}><Plus size={16} />Halaman Baru</Btn>} />
      <div className="grid gap-3">
        {db.pages.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 px-4 py-3.5">
            <span className="w-9 h-9 rounded-lg bg-info-500/12 text-info-500 flex items-center justify-center shrink-0"><LayoutTemplate size={16} /></span>
            <div className="grow min-w-0">
              <p className="text-sm font-bold text-ink-800 dark:text-ink-50">{p.title}</p>
              <p className="text-[11.5px] font-mono text-ink-400">/page/{p.slug}</p>
            </div>
            <Badge tone={statusTone(p.status)}>{p.status}</Badge>
            <Link to={`/page/${p.slug}`} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10"><Eye size={15} /></Link>
            <button onClick={() => setEditing(p as unknown as Record<string, unknown>)} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10"><Pencil size={15} /></button>
            <button onClick={() => { if (db.pages.length <= 1) { toast("Minimal harus ada satu halaman.", "warn"); return; } update((d) => { d.pages = d.pages.filter((x) => x.id !== p.id); }); log("page_deleted", `Halaman “${p.title}” dihapus`); toast("Halaman dihapus", "info"); }} className="rounded-lg p-2 text-ink-400 hover:text-bad-500 hover:bg-bad-500/10"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      {editing && (
        <PageDrawer initial={editing} onClose={() => setEditing(null)} onSave={(pg) => {
          update((d) => {
            if (pg.id) { const i = d.pages.findIndex((x) => x.id === pg.id); if (i >= 0) d.pages[i] = pg as never; }
            else d.pages.push(pg as never);
          });
          log("page_saved", `Halaman “${(pg as { title: string }).title}” disimpan`);
          toast("Halaman disimpan", "ok"); setEditing(null);
        }} />
      )}
    </div>
  );
}
function PageDrawer({ initial, onClose, onSave }: { initial: Record<string, unknown>; onClose: () => void; onSave: (p: Record<string, unknown>) => void }) {
  const [f, setF] = useState({ id: initial.id as string | null, title: String(initial.title ?? ""), slug: String(initial.slug ?? ""), status: String(initial.status ?? "draft"), content: String(initial.content ?? ""), seoTitle: String(initial.seoTitle ?? ""), seoDesc: String(initial.seoDesc ?? "") });
  return (
    <Drawer open onClose={onClose} title={f.id ? "Ubah Halaman" : "Halaman Baru"}
      footer={<><Btn variant="ghost" onClick={onClose}>Batal</Btn><Btn onClick={() => { if (!f.title.trim()) return; onSave({ id: f.id ?? uid(), title: f.title, slug: f.slug.trim() ? slugify(f.slug) : slugify(f.title), status: f.status, content: f.content, seoTitle: f.seoTitle, seoDesc: f.seoDesc }); }}>Simpan</Btn></>}>
      <div className="space-y-4">
        <Field label="Judul"><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Slug"><TextInput value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder={slugify(f.title)} /></Field>
          <Field label="Status"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></Select></Field>
        </div>
        <Field label="Konten (Tiptap)"><RichEditor value={f.content} onChange={(html) => setF({ ...f, content: html })} /></Field>
        <Field label="SEO Title"><TextInput value={f.seoTitle} onChange={(e) => setF({ ...f, seoTitle: e.target.value })} /></Field>
        <Field label="Meta Description"><TextInput value={f.seoDesc} onChange={(e) => setF({ ...f, seoDesc: e.target.value })} /></Field>
      </div>
    </Drawer>
  );
}

// ─── Programs ───────────────────────────────────────────────────────────────
export function ProgramsManager() {
  const { db, update, toast, log } = useApp();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  if (!db) return null;
  return (
    <div>
      <DashHead title="Program" desc="Bundel kelas menjadi jalur belajar terstruktur" action={<Btn onClick={() => setEditing({ id: null })}><Plus size={16} />Program Baru</Btn>} />
      <div className="grid gap-3">
        {db.programs.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 px-4 py-3.5">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0"><CoverArt hue={p.hue} seed={p.id} /></div>
            <div className="grow min-w-0">
              <p className="text-sm font-bold text-ink-800 dark:text-ink-50">{p.title}</p>
              <p className="text-[11.5px] font-mono text-ink-400 mt-0.5">{p.duration} · {p.courseIds.length} kelas · /programs/{p.slug}</p>
            </div>
            <Badge tone={statusTone(p.status)}>{p.status}</Badge>
            <button onClick={() => setEditing(p as unknown as Record<string, unknown>)} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10"><Pencil size={15} /></button>
            <button onClick={() => { update((d) => { d.programs = d.programs.filter((x) => x.id !== p.id); }); log("program_deleted", `Program “${p.title}” dihapus`); toast("Program dihapus", "info"); }} className="rounded-lg p-2 text-ink-400 hover:text-bad-500 hover:bg-bad-500/10"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      {editing && (
        <Drawer open onClose={() => setEditing(null)} title={editing.id ? "Ubah Program" : "Program Baru"}
          footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Batal</Btn><Btn onClick={() => {
            const title = String(editing.title ?? "").trim();
            if (!title) { toast("Judul wajib diisi", "warn"); return; }
            update((d) => {
              const pg = { id: String(editing.id ?? uid()), slug: slugify(title), title, description: String(editing.description ?? ""), hue: Number(editing.hue ?? 180), categoryId: String(editing.categoryId ?? d.categories.program[0].id), duration: String(editing.duration ?? "8 minggu"), courseIds: (editing.courseIds as string[]) ?? [], status: (editing.status as "published" | "draft") ?? "draft" };
              if (editing.id) { const i = d.programs.findIndex((x) => x.id === pg.id); if (i >= 0) d.programs[i] = pg; } else d.programs.unshift(pg);
            });
            log("program_saved", `Program “${title}” disimpan`); toast("Program disimpan", "ok"); setEditing(null);
          }}>Simpan</Btn></>}>
          <ProgramForm value={editing} onChange={setEditing} />
        </Drawer>
      )}
    </div>
  );
}
function ProgramForm({ value, onChange }: { value: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) {
  const { db } = useApp();
  if (!db) return null;
  const courseIds = (value.courseIds as string[]) ?? [];
  return (
    <div className="space-y-4">
      <Field label="Judul Program"><TextInput value={String(value.title ?? "")} onChange={(e) => onChange({ ...value, title: e.target.value })} /></Field>
      <Field label="Deskripsi"><TextInput value={String(value.description ?? "")} onChange={(e) => onChange({ ...value, description: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Kategori"><Select value={String(value.categoryId ?? db.categories.program[0].id)} onChange={(e) => onChange({ ...value, categoryId: e.target.value })}>{db.categories.program.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        <Field label="Durasi"><TextInput value={String(value.duration ?? "")} onChange={(e) => onChange({ ...value, duration: e.target.value })} placeholder="12 minggu" /></Field>
        <Field label="Status"><Select value={String(value.status ?? "draft")} onChange={(e) => onChange({ ...value, status: e.target.value })}><option value="draft">Draft</option><option value="published">Published</option></Select></Field>
      </div>
      <Field label="Kelas dalam program">
        <div className="grid gap-2">
          {db.courses.map((c) => (
            <label key={c.id} className={cx("flex items-center gap-3 rounded-lg border px-3.5 py-2.5 cursor-pointer transition-colors", courseIds.includes(c.id) ? "border-brand-500 bg-brand-50 dark:bg-brand-900/25" : "border-ink-200 dark:border-ink-700")}>
              <input type="checkbox" checked={courseIds.includes(c.id)} onChange={() => onChange({ ...value, courseIds: courseIds.includes(c.id) ? courseIds.filter((x) => x !== c.id) : [...courseIds, c.id] })} className="accent-[#17a58c]" />
              <span className="text-sm font-semibold text-ink-700 dark:text-ink-100">{c.title}</span>
            </label>
          ))}
        </div>
      </Field>
    </div>
  );
}

// ─── Home CMS ───────────────────────────────────────────────────────────────
const SECTION_TYPES: { type: SectionType; label: string }[] = [
  { type: "hero", label: "Hero" }, { type: "stats", label: "Statistics" }, { type: "featured", label: "Featured Course" },
  { type: "categories", label: "Kategori" }, { type: "latest", label: "Latest Course" }, { type: "tutorials", label: "Tutorial" },
  { type: "articles", label: "Artikel" }, { type: "news", label: "Berita" }, { type: "programs", label: "Program" },
  { type: "instructors", label: "Instruktur" }, { type: "testimonials", label: "Testimonial" }, { type: "cta", label: "CTA" },
];
export function HomeCMS() {
  const { db, update, toast, log } = useApp();
  const [editing, setEditing] = useState<HomeSection | null>(null);
  if (!db) return null;
  const sections = [...db.homeSections].sort((a, b) => a.order - b.order);
  const move = (id: string, dir: -1 | 1) => update((d) => {
    const s = [...d.homeSections].sort((a, b) => a.order - b.order);
    const i = s.findIndex((x) => x.id === id);
    const j = i + dir;
    if (j < 0 || j >= s.length) return;
    const a = d.homeSections.find((x) => x.id === s[i].id)!, b = d.homeSections.find((x) => x.id === s[j].id)!;
    const t = a.order; a.order = b.order; b.order = t;
  });
  return (
    <div>
      <DashHead title="Home Page Builder" desc="Section homepage disimpan di database — urut, aktifkan, dan edit kontennya"
        action={<div className="flex gap-2"><Link to="/"><Btn variant="outline" size="sm"><ExternalLink size={14} />Lihat Situs</Btn></Link>
          <Select className="w-48 h-10" value="" onChange={(e) => {
            const type = e.target.value as SectionType; if (!type) return;
            const meta = SECTION_TYPES.find((x) => x.type === type);
            update((d) => { d.homeSections.push({ id: uid(), type, title: meta?.label ?? type, subtitle: "", enabled: true, order: d.homeSections.length + 1, settings: {} }); });
            log("cms_section_added", `Section “${meta?.label}” ditambahkan ke Home`); toast("Section ditambahkan", "ok");
          }}><option value="">+ Tambah section…</option>{SECTION_TYPES.filter((t) => !sections.some((s) => s.type === t.type)).map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}</Select></div>} />
      <div className="space-y-2">
        {sections.map((s, i) => (
          <div key={s.id} className={cx("flex items-center gap-3 rounded-xl border bg-card dark:bg-ink-900 px-4 py-3 transition-all", s.enabled ? "border-ink-100 dark:border-ink-800" : "border-dashed border-ink-200 dark:border-ink-700 opacity-60")}>
            <GripVertical size={15} className="text-ink-300 shrink-0" />
            <span className="w-7 h-7 rounded-lg bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
            <div className="grow min-w-0">
              <p className="text-sm font-bold text-ink-800 dark:text-ink-50">{s.title}</p>
              <p className="text-[11px] font-mono text-ink-400">tipe: {s.type}{s.subtitle ? ` · “${s.subtitle.slice(0, 60)}”` : ""}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => move(s.id, -1)} disabled={i === 0} className="rounded-lg p-1.5 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10 disabled:opacity-25"><ArrowUp size={15} /></button>
              <button onClick={() => move(s.id, 1)} disabled={i === sections.length - 1} className="rounded-lg p-1.5 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10 disabled:opacity-25"><ArrowDown size={15} /></button>
              <button onClick={() => setEditing(s)} className="rounded-lg p-1.5 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10"><Pencil size={15} /></button>
              <button onClick={() => { update((d) => { d.homeSections = d.homeSections.filter((x) => x.id !== s.id); }); toast("Section dihapus", "info"); }} className="rounded-lg p-1.5 text-ink-400 hover:text-bad-500 hover:bg-bad-500/10"><Trash2 size={15} /></button>
              <Toggle checked={s.enabled} onChange={(v) => update((d) => { const x = d.homeSections.find((y) => y.id === s.id); if (x) x.enabled = v; })} />
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <Modal open onClose={() => setEditing(null)} title={`Edit Section: ${editing.type}`}
          footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Batal</Btn><Btn onClick={() => { update((d) => { const x = d.homeSections.find((y) => y.id === editing.id); if (x) { x.title = editing.title; x.subtitle = editing.subtitle; } }); log("cms_section_edited", `Section “${editing.title}” diperbarui`); toast("Section disimpan", "ok"); setEditing(null); }}>Simpan</Btn></>}>
          <div className="space-y-4">
            <Field label="Judul section"><TextInput value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <Field label="Subjudul"><TextInput value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── About CMS ──────────────────────────────────────────────────────────────
export function AboutCMS() {
  const { db, update, toast, log } = useApp();
  const page = db?.pages.find((p) => p.slug === "about-us");
  const [content, setContent] = useState(page?.content ?? "");
  const [title, setTitle] = useState(page?.title ?? "Tentang KMSIT Computer");
  if (!db) return null;
  return (
    <div>
      <DashHead title="About Us" desc="Konten halaman Tentang — sepenuhnya editable via Tiptap" action={
        <Btn onClick={() => { update((d) => { const p = d.pages.find((x) => x.slug === "about-us"); if (p) { p.content = content; p.title = title; } else d.pages.push({ id: uid(), slug: "about-us", title, content, status: "published", seoTitle: "Tentang Kami", seoDesc: "" }); }); log("about_updated", "Halaman About Us diperbarui"); toast("About Us disimpan", "ok"); }}>Simpan Perubahan</Btn>} />
      <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-5 space-y-4">
        <Field label="Judul Halaman"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Konten (Visi, Misi, Sejarah, Tim…)"><RichEditor value={content} onChange={setContent} /></Field>
        <Link to="/about" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 dark:text-brand-300 hover:underline"><ExternalLink size={14} />Pratinjau halaman About</Link>
      </div>
    </div>
  );
}

// ─── Struktur Organisasi CMS ────────────────────────────────────────────────
const LEVEL_LABEL: Record<string, string> = { board: "Pimpinan / Dewan", division: "Divisi", team: "Tim / Unit" };
export function OrgCms() {
  const { db, update, toast, log } = useApp();
  const [unitModal, setUnitModal] = useState<{ id: string | null; name: string; tagline: string; level: string } | null>(null);
  const [memberModal, setMemberModal] = useState<{ unitId: string; id: string | null; name: string; position: string; email: string } | null>(null);
  if (!db) return null;
  const units = [...db.orgUnits].sort((a, b) => a.order - b.order);
  const moveUnit = (id: string, dir: -1 | 1) => update((d) => {
    const s = [...d.orgUnits].sort((a, b) => a.order - b.order);
    const i = s.findIndex((x) => x.id === id), j = i + dir;
    if (i < 0 || j < 0 || j >= s.length) return;
    const a = d.orgUnits.find((x) => x.id === s[i].id)!, b = d.orgUnits.find((x) => x.id === s[j].id)!;
    const t = a.order; a.order = b.order; b.order = t;
  });
  const moveMember = (unitId: string, id: string, dir: -1 | 1) => update((d) => {
    const s = d.orgMembers.filter((m) => m.unitId === unitId).sort((a, b) => a.order - b.order);
    const i = s.findIndex((x) => x.id === id), j = i + dir;
    if (i < 0 || j < 0 || j >= s.length) return;
    const a = d.orgMembers.find((x) => x.id === s[i].id)!, b = d.orgMembers.find((x) => x.id === s[j].id)!;
    const t = a.order; a.order = b.order; b.order = t;
  });
  return (
    <div>
      <DashHead title="Struktur Organisasi" desc="Blok CMS yang tampil di halaman Tentang Kami — unit & anggota bisa ditambah, diubah, dihapus, dan diurutkan"
        action={<div className="flex gap-2">
          <Link to="/about"><Btn variant="outline" size="sm"><ExternalLink size={14} />Lihat Halaman</Btn></Link>
          <Btn onClick={() => setUnitModal({ id: null, name: "", tagline: "", level: "division" })}><Plus size={16} />Unit Baru</Btn>
        </div>} />
      <div className="space-y-4">
        {units.map((u, ui) => {
          const members = db.orgMembers.filter((m) => m.unitId === u.id).sort((a, b) => a.order - b.order);
          return (
            <div key={u.id} className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5 bg-ink-50/60 dark:bg-ink-850 border-b border-ink-100 dark:border-ink-800">
                <span className={cx("w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-white shrink-0", u.level === "board" ? "bg-accent-500" : "bg-brand-600")}>{u.name[0]}</span>
                <div className="grow min-w-0">
                  <p className="text-sm font-bold text-ink-900 dark:text-white">{u.name}</p>
                  <p className="text-[11.5px] font-mono text-ink-400 truncate">{u.tagline || "—"} · {members.length} anggota</p>
                </div>
                <Badge tone={u.level === "board" ? "accent" : u.level === "division" ? "brand" : "neutral"}>{LEVEL_LABEL[u.level]}</Badge>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveUnit(u.id, -1)} disabled={ui === 0} className="rounded-lg p-1.5 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10 disabled:opacity-25"><ArrowUp size={14} /></button>
                  <button onClick={() => moveUnit(u.id, 1)} disabled={ui === units.length - 1} className="rounded-lg p-1.5 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10 disabled:opacity-25"><ArrowDown size={14} /></button>
                  <button onClick={() => setUnitModal({ id: u.id, name: u.name, tagline: u.tagline, level: u.level })} className="rounded-lg p-1.5 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10"><Pencil size={14} /></button>
                  <button onClick={() => { update((d) => { d.orgUnits = d.orgUnits.filter((x) => x.id !== u.id); d.orgMembers = d.orgMembers.filter((m) => m.unitId !== u.id); }); log("org_unit_deleted", `Unit “${u.name}” dihapus`); toast("Unit beserta anggotanya dihapus", "info"); }} className="rounded-lg p-1.5 text-ink-400 hover:text-bad-500 hover:bg-bad-500/10"><Trash2 size={14} /></button>
                </div>
              </div>
              {members.map((m, mi) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
                  <span className="w-7 h-7 rounded-lg bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">{mi + 1}</span>
                  <div className="grow min-w-0">
                    <p className="text-[13.5px] font-semibold text-ink-800 dark:text-ink-50">{m.name} <span className="text-ink-400 font-normal">· {m.position}</span></p>
                    {m.email && <p className="text-[10.5px] font-mono text-ink-400">{m.email}</p>}
                  </div>
                  <button onClick={() => moveMember(u.id, m.id, -1)} disabled={mi === 0} className="rounded p-1 text-ink-400 hover:text-brand-600 disabled:opacity-25"><ArrowUp size={13} /></button>
                  <button onClick={() => moveMember(u.id, m.id, 1)} disabled={mi === members.length - 1} className="rounded p-1 text-ink-400 hover:text-brand-600 disabled:opacity-25"><ArrowDown size={13} /></button>
                  <button onClick={() => setMemberModal({ unitId: u.id, id: m.id, name: m.name, position: m.position, email: m.email ?? "" })} className="rounded p-1 text-ink-400 hover:text-brand-600"><Pencil size={13} /></button>
                  <button onClick={() => { update((d) => { d.orgMembers = d.orgMembers.filter((x) => x.id !== m.id); }); toast("Anggota dihapus", "info"); }} className="rounded p-1 text-ink-400 hover:text-bad-500"><Trash2 size={13} /></button>
                </div>
              ))}
              <button onClick={() => setMemberModal({ unitId: u.id, id: null, name: "", position: "", email: "" })}
                className="w-full px-4 py-2.5 text-[13px] font-bold text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-ink-850 flex items-center gap-2 transition-colors"><Plus size={14} />Tambah Anggota</button>
            </div>
          );
        })}
        {units.length === 0 && <EmptyState icon={<LayoutTemplate size={20} />} title="Belum ada unit" desc="Tambahkan unit struktur organisasi pertama." action={<Btn size="sm" onClick={() => setUnitModal({ id: null, name: "", tagline: "", level: "division" })}>Tambah Unit</Btn>} />}
      </div>

      <Modal open={!!unitModal} onClose={() => setUnitModal(null)} title={unitModal?.id ? "Ubah Unit" : "Unit Baru"}
        footer={<><Btn variant="ghost" onClick={() => setUnitModal(null)}>Batal</Btn><Btn onClick={() => {
          if (!unitModal || !unitModal.name.trim()) { toast("Nama unit wajib diisi", "warn"); return; }
          update((d) => {
            if (unitModal.id) {
              const x = d.orgUnits.find((y) => y.id === unitModal.id);
              if (x) { x.name = unitModal.name.trim(); x.tagline = unitModal.tagline; x.level = unitModal.level as typeof x.level; }
            } else d.orgUnits.push({ id: uid(), name: unitModal.name.trim(), tagline: unitModal.tagline, level: unitModal.level as "board" | "division" | "team", order: d.orgUnits.length + 1 });
          });
          log("org_unit_saved", `Unit “${unitModal.name}” disimpan`); toast("Unit disimpan", "ok"); setUnitModal(null);
        }}>Simpan</Btn></>}>
        {unitModal && (
          <div className="space-y-4">
            <Field label="Nama unit"><TextInput autoFocus value={unitModal.name} onChange={(e) => setUnitModal({ ...unitModal, name: e.target.value })} placeholder="cth: Divisi Akademik" /></Field>
            <Field label="Deskripsi singkat"><TextInput value={unitModal.tagline} onChange={(e) => setUnitModal({ ...unitModal, tagline: e.target.value })} placeholder="Tugas & fungsi unit" /></Field>
            <Field label="Tingkat"><Select value={unitModal.level} onChange={(e) => setUnitModal({ ...unitModal, level: e.target.value })}><option value="board">Pimpinan / Dewan (ditampilkan besar)</option><option value="division">Divisi</option><option value="team">Tim / Unit kecil</option></Select></Field>
          </div>
        )}
      </Modal>
      <Modal open={!!memberModal} onClose={() => setMemberModal(null)} title={memberModal?.id ? "Ubah Anggota" : "Anggota Baru"}
        footer={<><Btn variant="ghost" onClick={() => setMemberModal(null)}>Batal</Btn><Btn onClick={() => {
          if (!memberModal || !memberModal.name.trim() || !memberModal.position.trim()) { toast("Nama & jabatan wajib diisi", "warn"); return; }
          update((d) => {
            if (memberModal.id) {
              const x = d.orgMembers.find((y) => y.id === memberModal.id);
              if (x) { x.name = memberModal.name.trim(); x.position = memberModal.position.trim(); x.email = memberModal.email.trim() || undefined; }
            } else d.orgMembers.push({ id: uid(), unitId: memberModal.unitId, name: memberModal.name.trim(), position: memberModal.position.trim(), email: memberModal.email.trim() || undefined, order: d.orgMembers.filter((m) => m.unitId === memberModal.unitId).length + 1 });
          });
          toast("Anggota disimpan", "ok"); setMemberModal(null);
        }}>Simpan</Btn></>}>
        {memberModal && (
          <div className="space-y-4">
            <Field label="Nama"><TextInput autoFocus value={memberModal.name} onChange={(e) => setMemberModal({ ...memberModal, name: e.target.value })} /></Field>
            <Field label="Jabatan"><TextInput value={memberModal.position} onChange={(e) => setMemberModal({ ...memberModal, position: e.target.value })} placeholder="cth: Kepala Divisi" /></Field>
            <Field label="Email (opsional)"><TextInput value={memberModal.email} onChange={(e) => setMemberModal({ ...memberModal, email: e.target.value })} placeholder="nama@kmsit.id" /></Field>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Menu manager ───────────────────────────────────────────────────────────
export function MenuManager() {
  const { db, update, toast, log } = useApp();
  const [active, setActive] = useState(db?.menus[0]?.id ?? "");
  const [adding, setAdding] = useState<{ parent: string | null } | null>(null);
  const [f, setF] = useState({ label: "", url: "" });
  if (!db) return null;
  const menu = db.menus.find((m) => m.id === active) ?? db.menus[0];
  const addItem = () => {
    if (!f.label.trim() || !f.url.trim()) { toast("Label dan URL wajib diisi", "warn"); return; }
    update((d) => {
      const m = d.menus.find((x) => x.id === menu.id); if (!m) return;
      if (adding?.parent) { const p = m.items.find((i) => i.id === adding.parent); p?.children.push({ id: uid(), label: f.label, url: f.url, children: [] }); }
      else m.items.push({ id: uid(), label: f.label, url: f.url, children: [] });
    });
    log("menu_updated", `Item “${f.label}” ditambahkan ke menu ${menu.name}`);
    toast("Item menu ditambahkan", "ok"); setAdding(null); setF({ label: "", url: "" });
  };
  const removeItem = (iid: string, parent: string | null) => update((d) => {
    const m = d.menus.find((x) => x.id === menu.id); if (!m) return;
    if (parent) { const p = m.items.find((i) => i.id === parent); if (p) p.children = p.children.filter((c) => c.id !== iid); }
    else m.items = m.items.filter((i) => i.id !== iid);
  });
  const moveItem = (iid: string, dir: -1 | 1) => update((d) => {
    const m = d.menus.find((x) => x.id === menu.id); if (!m) return;
    const i = m.items.findIndex((x) => x.id === iid); const j = i + dir;
    if (i < 0 || j < 0 || j >= m.items.length) return;
    [m.items[i], m.items[j]] = [m.items[j], m.items[i]];
  });
  const suggestions = [
    { label: "Kelas", url: "/courses" }, { label: "Artikel", url: "/articles" }, { label: "Berita", url: "/news" },
    { label: "Tutorial", url: "/tutorials" }, { label: "Program", url: "/programs" }, { label: "Tentang", url: "/about" },
  ];
  return (
    <div>
      <DashHead title="Menu Management" desc="Menu header & footer — nested item, internal page, atau URL eksternal" />
      <div className="flex flex-wrap gap-2 mb-5">
        {db.menus.map((m) => (
          <button key={m.id} onClick={() => setActive(m.id)} className={cx("px-4 h-9 rounded-lg text-[13px] font-bold transition-all", active === m.id ? "bg-brand-600 text-white" : "bg-card dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-200")}>{m.name} <span className="font-mono opacity-60">({m.location})</span></button>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5 items-start">
        <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
          {menu.items.map((it, i) => (
            <div key={it.id}>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-100/70 dark:border-ink-800/70">
                <div className="grow min-w-0">
                  <p className="text-sm font-bold text-ink-800 dark:text-ink-50">{it.label}</p>
                  <p className="text-[11px] font-mono text-ink-400 truncate">{it.url}</p>
                </div>
                <button onClick={() => moveItem(it.id, -1)} disabled={i === 0} className="rounded-lg p-1.5 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10 disabled:opacity-25"><ArrowUp size={14} /></button>
                <button onClick={() => moveItem(it.id, 1)} disabled={i === menu.items.length - 1} className="rounded-lg p-1.5 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10 disabled:opacity-25"><ArrowDown size={14} /></button>
                <button onClick={() => { setAdding({ parent: it.id }); setF({ label: "", url: "" }); }} className="rounded-lg p-1.5 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10" title="Tambah sub-menu"><Plus size={14} /></button>
                <button onClick={() => removeItem(it.id, null)} className="rounded-lg p-1.5 text-ink-400 hover:text-bad-500 hover:bg-bad-500/10"><Trash2 size={14} /></button>
              </div>
              {it.children.map((c) => (
                <div key={c.id} className="flex items-center gap-3 pl-12 pr-4 py-2.5 border-b border-ink-100/70 dark:border-ink-800/70 bg-ink-50/40 dark:bg-ink-850">
                  <span className="text-ink-300">↳</span>
                  <div className="grow min-w-0"><p className="text-[13px] font-bold text-ink-700 dark:text-ink-100">{c.label}</p><p className="text-[10.5px] font-mono text-ink-400 truncate">{c.url}</p></div>
                  <button onClick={() => removeItem(c.id, it.id)} className="rounded-lg p-1.5 text-ink-400 hover:text-bad-500 hover:bg-bad-500/10"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          ))}
          <button onClick={() => { setAdding({ parent: null }); setF({ label: "", url: "" }); }} className="w-full px-4 py-3.5 text-sm font-bold text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-ink-850 transition-colors flex items-center gap-2"><Plus size={15} />Tambah Item Menu</button>
        </div>
        <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-4">
          <p className="font-display font-semibold text-ink-900 dark:text-white mb-3">Tautan cepat internal</p>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((sug) => (
              <button key={sug.url} onClick={() => { setAdding({ parent: null }); setF(sug); }} className="rounded-lg border border-ink-200 dark:border-ink-700 px-3 py-2 text-[13px] font-semibold text-ink-600 dark:text-ink-200 hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors text-left">{sug.label}</button>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-400 leading-relaxed">Item dengan sub-item otomatis tampil sebagai dropdown di header website. URL eksternal (https://…) dibuka di tab baru.</p>
        </div>
      </div>
      <Modal open={!!adding} onClose={() => setAdding(null)} title={adding?.parent ? "Tambah Sub-menu" : "Tambah Item Menu"}
        footer={<><Btn variant="ghost" onClick={() => setAdding(null)}>Batal</Btn><Btn onClick={addItem}>Tambahkan</Btn></>}>
        <div className="space-y-4">
          <Field label="Label"><TextInput autoFocus value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder="cth: Kelas Online" /></Field>
          <Field label="URL" hint="Internal: /courses · Eksternal: https://…"><TextInput value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="/courses" /></Field>
        </div>
      </Modal>
    </div>
  );
}

// ─── Media manager ──────────────────────────────────────────────────────────
export function MediaManager() {
  const { db, update, toast, log } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  if (!db) return null;
  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast("Hanya file gambar yang diizinkan (MIME validation).", "bad"); return; }
    if (file.size > 4 * 1024 * 1024) { toast("Ukuran maksimal 4MB.", "bad"); return; }
    setBusy(true);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 900 / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      URL.revokeObjectURL(url);
      update((d) => { d.media.unshift({ id: uid(), name: file.name.replace(/\.[^.]+$/, "") + ".jpg", type: "image/jpeg", size: Math.round(dataUrl.length * 0.75), url: dataUrl, date: new Date().toISOString() }); });
      log("media_uploaded", `Media “${file.name}” diunggah`);
      toast("Media berhasil diunggah", "ok"); setBusy(false);
    };
    img.onerror = () => { toast("Gagal membaca file.", "bad"); setBusy(false); };
    img.src = url;
  };
  const copy = (url: string) => { navigator.clipboard?.writeText(url).then(() => toast("URL disalin — tempel di editor gambar", "ok")).catch(() => toast("Gagal menyalin", "bad")); };
  return (
    <div>
      <DashHead title="Media Manager" desc="Upload, pratinjau, dan kelola aset gambar (Laravel Storage)"
        action={<Btn onClick={() => fileRef.current?.click()} disabled={busy}><Upload size={16} />{busy ? "Mengunggah…" : "Upload Media"}</Btn>} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      {db.media.length === 0 ? <EmptyState icon={<FileImage size={20} />} title="Belum ada media" desc="Unggah gambar pertama Anda (maks. 4MB, otomatis dioptimasi)." /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {db.media.map((m) => (
            <div key={m.id} className="group rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
              <div className="relative" style={{ aspectRatio: "1" }}>
                <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-ink-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copy(m.url)} className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur text-white flex items-center justify-center hover:bg-brand-500 transition-colors" title="Salin URL"><Copy size={15} /></button>
                  <button onClick={() => { update((d) => { d.media = d.media.filter((x) => x.id !== m.id); }); toast("Media dihapus", "info"); }} className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur text-white flex items-center justify-center hover:bg-bad-500 transition-colors" title="Hapus"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-[12px] font-bold text-ink-700 dark:text-ink-100 truncate">{m.name}</p>
                <p className="text-[10px] font-mono text-ink-400">{(m.size / 1024).toFixed(0)} KB · {m.type}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
