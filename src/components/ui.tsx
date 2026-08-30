import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X, AlertTriangle, CheckCircle2, Info, XCircle, Star } from "lucide-react";
import type { User } from "../lib/db";
import { useApp } from "../lib/store";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

// ─── Buttons ────────────────────────────────────────────────────────────────
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "soft" | "outline" | "ghost" | "danger" | "accent" | "dark";
  size?: "xs" | "sm" | "md" | "lg";
};
export function Btn({ variant = "primary", size = "md", className, ...rest }: BtnProps) {
  const v = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm",
    accent: "bg-accent-500 text-ink-950 hover:bg-accent-400 active:bg-accent-600 shadow-sm font-semibold",
    soft: "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-200 dark:hover:bg-brand-900/60",
    outline: "border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-100 hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-300 bg-card dark:bg-ink-900",
    ghost: "text-ink-600 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800",
    danger: "bg-bad-500 text-white hover:bg-bad-600",
    dark: "bg-ink-900 text-brand-100 hover:bg-ink-800 dark:bg-brand-400 dark:text-ink-950 dark:hover:bg-brand-300",
  }[variant];
  const s = { xs: "h-7 px-2.5 text-xs", sm: "h-8.5 px-3.5 text-[13px]", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-[15px]" }[size];
  return (
    <button
      className={cx("inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 select-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]", v, s, className)}
      {...rest}
    />
  );
}

// ─── Badge ──────────────────────────────────────────────────────────────────
export function Badge({ tone = "neutral", children, className }: { tone?: "ok" | "warn" | "bad" | "info" | "brand" | "neutral" | "accent"; children: React.ReactNode; className?: string }) {
  const t = {
    ok: "bg-ok-500/12 text-ok-600 dark:text-ok-500 border-ok-500/25",
    warn: "bg-warn-500/12 text-warn-600 dark:text-warn-500 border-warn-500/25",
    bad: "bg-bad-500/12 text-bad-600 dark:text-bad-500 border-bad-500/25",
    info: "bg-info-500/12 text-info-600 dark:text-info-500 border-info-500/25",
    brand: "bg-brand-500/12 text-brand-700 dark:text-brand-300 border-brand-500/25",
    accent: "bg-accent-500/15 text-accent-700 dark:text-accent-300 border-accent-500/30",
    neutral: "bg-ink-500/10 text-ink-600 dark:text-ink-200 border-ink-500/20",
  }[tone];
  return <span className={cx("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap", t, className)}>{children}</span>;
}
export const statusTone = (s: string): "ok" | "warn" | "bad" | "info" | "neutral" | "brand" | "accent" =>
  ({ published: "ok", paid: "ok", completed: "ok", active: "ok", passed: "ok", approved: "ok", enabled: "ok" } as Record<string, "ok">)[s]
  ?? ({ pending: "warn", draft: "warn", scheduled: "warn", processing: "warn", expired: "warn" } as Record<string, "warn">)[s]
  ?? ({ failed: "bad", rejected: "bad", archived: "neutral", suspended: "bad" } as Record<string, "bad" | "neutral">)[s]
  ?? "info";

// ─── Form controls ──────────────────────────────────────────────────────────
export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 block text-[13px] font-bold text-ink-600 dark:text-ink-200">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}
const inputCls = "w-full h-10 rounded-lg border border-ink-200 dark:border-ink-700 bg-card dark:bg-ink-900 px-3 text-sm text-ink-900 dark:text-ink-50 placeholder:text-ink-300 dark:placeholder:text-ink-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 transition-shadow";
export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputCls, props.className)} />;
}
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(inputCls, "h-auto min-h-[90px] py-2.5", props.className)} />;
}
export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(inputCls, "cursor-pointer pr-8 appearance-none bg-no-repeat bg-[right_0.6rem_center] bg-[length:14px] bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2371816f%22 stroke-width=%222%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')]", props.className)}>{children}</select>;
}
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-2.5 group">
      <span className={cx("relative h-6 w-11 rounded-full transition-colors duration-200", checked ? "bg-brand-600" : "bg-ink-200 dark:bg-ink-700")}>
        <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200", checked ? "left-[22px]" : "left-0.5")} />
      </span>
      {label && <span className="text-sm font-semibold text-ink-600 dark:text-ink-200 group-hover:text-ink-900 dark:group-hover:text-white">{label}</span>}
    </button>
  );
}
export function SearchInput({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cx("relative", className)}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? "Cari…"} className={cx(inputCls, "pl-9")} />
      {value && <button onClick={() => onChange("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-bad-500"><X size={14} /></button>}
    </div>
  );
}

// ─── Modal & Drawer ─────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cx("modal-in relative w-full bg-card dark:bg-ink-900 border border-ink-100 dark:border-ink-800 sm:rounded-2xl rounded-t-2xl shadow-pop flex flex-col max-h-[92vh]", wide ? "max-w-3xl" : "max-w-lg")}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 dark:border-ink-800 shrink-0">
          <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-700 dark:hover:text-white transition-colors"><X size={17} /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4 grow">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-ink-100 dark:border-ink-800 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
export function Drawer({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="drawer-in absolute right-0 top-0 h-full w-full max-w-xl bg-card dark:bg-ink-900 border-l border-ink-100 dark:border-ink-800 shadow-pop flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 dark:border-ink-800 shrink-0">
          <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-700 dark:hover:text-white transition-colors"><X size={17} /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4 grow">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-ink-100 dark:border-ink-800 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
export function useOutside(onOut: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onOut(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onOut]);
  return ref;
}

// ─── Tabs ───────────────────────────────────────────────────────────────────
export function Tabs({ items, active, onChange }: { items: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 rounded-xl bg-ink-100/70 dark:bg-ink-900 p-1 w-fit max-w-full overflow-x-auto">
      {items.map((it) => (
        <button key={it.id} onClick={() => onChange(it.id)}
          className={cx("px-3.5 h-8.5 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all",
            active === it.id ? "bg-card dark:bg-ink-800 text-brand-700 dark:text-brand-300 shadow-sm" : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-100")}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

// ─── Data table ─────────────────────────────────────────────────────────────
export interface Column<T> { key: string; label: React.ReactNode; render?: (row: T) => React.ReactNode; className?: string; }
export function DataTable<T extends { id: string }>({ columns, rows, per = 8, onRowClick, emptyText }: { columns: Column<T>[]; rows: T[]; per?: number; onRowClick?: (row: T) => void; emptyText?: string }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / per));
  const cur = Math.min(page, pages - 1);
  const slice = rows.slice(cur * per, cur * per + per);
  useEffect(() => { if (page > pages - 1) setPage(0); }, [rows.length, page, pages]);
  return (
    <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 dark:border-ink-800 bg-ink-50/60 dark:bg-ink-850">
              {columns.map((c) => <th key={c.key} className={cx("text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-ink-400 dark:text-ink-300 whitespace-nowrap", c.className)}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr key={r.id} onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={cx("border-b border-ink-100/70 dark:border-ink-800/70 last:border-0 transition-colors", onRowClick && "cursor-pointer", "hover:bg-brand-50/40 dark:hover:bg-ink-850")}>
                {columns.map((c) => <td key={c.key} className={cx("px-4 py-3 text-ink-700 dark:text-ink-100", c.className)}>{c.render ? c.render(r) : (r as Record<string, React.ReactNode>)[c.key]}</td>)}
              </tr>
            ))}
            {slice.length === 0 && (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-ink-400">{emptyText ?? "Tidak ada data."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {rows.length > per && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-ink-100 dark:border-ink-800 bg-ink-50/40 dark:bg-ink-850">
          <span className="text-xs text-ink-400 font-semibold">{cur * per + 1}–{Math.min(rows.length, (cur + 1) * per)} dari {rows.length}</span>
          <div className="flex gap-1">
            <button disabled={cur === 0} onClick={() => setPage(cur - 1)} className="rounded-lg p-1.5 border border-ink-200 dark:border-ink-700 disabled:opacity-35 hover:bg-ink-100 dark:hover:bg-ink-800"><ChevronLeft size={15} /></button>
            <button disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} className="rounded-lg p-1.5 border border-ink-200 dark:border-ink-700 disabled:opacity-35 hover:bg-ink-100 dark:hover:bg-ink-800"><ChevronRight size={15} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Misc ───────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, tone = "brand" }: { label: string; value: React.ReactNode; sub?: React.ReactNode; icon: React.ReactNode; tone?: "brand" | "accent" | "info" | "ok" | "bad" }) {
  const t = { brand: "bg-brand-500/12 text-brand-600 dark:text-brand-300", accent: "bg-accent-500/15 text-accent-600 dark:text-accent-300", info: "bg-info-500/12 text-info-600 dark:text-info-500", ok: "bg-ok-500/12 text-ok-600 dark:text-ok-500", bad: "bg-bad-500/12 text-bad-600 dark:text-bad-500" }[tone];
  return (
    <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-4 flex items-start gap-3.5 hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200">
      <div className={cx("rounded-lg p-2.5 shrink-0", t)}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[12px] font-bold uppercase tracking-wide text-ink-400">{label}</p>
        <p className="font-display text-[22px] leading-7 font-bold text-ink-900 dark:text-white truncate">{value}</p>
        {sub && <p className="text-xs text-ink-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
export function EmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 dark:border-ink-700 py-14 px-6 text-center">
      <div className="mx-auto w-12 h-12 rounded-xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center text-ink-400 mb-3">{icon}</div>
      <p className="font-display font-semibold text-ink-700 dark:text-ink-100">{title}</p>
      {desc && <p className="text-sm text-ink-400 mt-1 max-w-sm mx-auto">{desc}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
export function Avatar({ user, size = 34 }: { user?: Pick<User, "name" | "color"> | null; size?: number }) {
  if (!user) return null;
  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="inline-flex items-center justify-center rounded-full font-bold text-white shrink-0 ring-2 ring-white/60 dark:ring-ink-800"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${user.color}, ${user.color}cc)`, fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
}
export function Progress({ value, tone = "brand" }: { value: number; tone?: "brand" | "accent" | "ok" }) {
  const c = { brand: "bg-brand-500", accent: "bg-accent-400", ok: "bg-ok-500" }[tone];
  return (
    <div className="h-1.5 w-full rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
      <div className={cx("h-full rounded-full transition-all duration-500", c)} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
export function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} className={i <= Math.round(n) ? "fill-accent-400 text-accent-400" : "text-ink-200 dark:text-ink-600"} />
      ))}
    </span>
  );
}
export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); ob.disconnect(); } }, { threshold: 0.12 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return <div ref={ref} className={cx("reveal", className)} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}

// ─── Brand ──────────────────────────────────────────────────────────────────
export function Logo({ name, dark }: { name: string; dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 32 32" className="shrink-0">
        <rect width="32" height="32" rx="7" className={dark ? "fill-brand-400" : "fill-ink-900"} />
        <path d="M9 11l5 5-5 5" stroke={dark ? "#0a1210" : "#2CC5B0"} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M16.5 21h7" stroke={dark ? "#0a1210" : "#E8A33D"} strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <span className={cx("font-display font-bold text-[17px] leading-none tracking-tight", dark ? "text-white" : "text-ink-900 dark:text-white")}>
        {name}<span className="block text-[10px] font-mono font-medium tracking-[0.22em] uppercase text-brand-600 dark:text-brand-300 mt-0.5">LMS · CMS</span>
      </span>
    </span>
  );
}

// ─── Cover art (generated SVG thumbnails for editorial content) ─────────────
export function CoverArt({ hue, seed, label, className }: { hue: number; seed: string; label?: string; className?: string }) {
  const h = hue;
  const n = seed.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const shapes = Array.from({ length: 6 }, (_, i) => ({
    x: ((n * (i + 3) * 37) % 340), y: ((n * (i + 5) * 23) % 150), r: 14 + ((n * (i + 7)) % 40), o: 0.10 + ((n * (i + 2)) % 14) / 100,
  }));
  return (
    <svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" className={cx("w-full h-full block", className)} role="img" aria-label={label}>
      <defs>
        <linearGradient id={`g-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${h} 45% 22%)`} />
          <stop offset="1" stopColor={`hsl(${(h + 40) % 360} 40% 12%)`} />
        </linearGradient>
      </defs>
      <rect width="360" height="200" fill={`url(#g-${seed})`} />
      <g stroke={`hsl(${h} 60% 55%)`} strokeOpacity="0.14">
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 32} y1="0" x2={i * 32 + 60} y2="200" />)}
      </g>
      {shapes.map((s, i) => (
        i % 3 === 0
          ? <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={`hsl(${h} 65% 60%)`} opacity={s.o} />
          : i % 3 === 1
            ? <rect key={i} x={s.x} y={s.y} width={s.r * 1.6} height={s.r * 1.6} rx="6" fill={`hsl(${(h + 160) % 360} 70% 62%)`} opacity={s.o} transform={`rotate(${(n * i) % 45} ${s.x} ${s.y})`} />
            : <path key={i} d={`M${s.x} ${s.y + s.r} L${s.x + s.r} ${s.y - s.r} L${s.x + s.r * 2} ${s.y + s.r} Z`} fill={`hsl(${(h + 40) % 360} 75% 60%)`} opacity={s.o} />
      ))}
      <rect x="24" y="140" width="56" height="6" rx="3" fill={`hsl(${h} 70% 65%)`} opacity="0.9" />
      <rect x="24" y="154" width="92" height="6" rx="3" fill="#fff" opacity="0.35" />
    </svg>
  );
}

export function YouTubeEmbed({ id, className }: { id: string; className?: string }) {
  return (
    <div className={cx("relative w-full overflow-hidden rounded-xl bg-ink-950", className)} style={{ aspectRatio: "16/9" }}>
      <iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title="YouTube video" className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    </div>
  );
}

// ─── Toast host ─────────────────────────────────────────────────────────────
export function ToastHost() {
  const { toasts, dismissToast } = useApp();
  const icon = { ok: <CheckCircle2 size={17} className="text-ok-500" />, bad: <XCircle size={17} className="text-bad-500" />, info: <Info size={17} className="text-info-500" />, warn: <AlertTriangle size={17} className="text-warn-500" /> };
  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col gap-2 max-w-[92vw] w-[360px]">
      {toasts.map((t) => (
        <div key={t.id} className="toast-in flex items-start gap-3 rounded-xl border border-ink-100 dark:border-ink-700 bg-card dark:bg-ink-850 px-4 py-3 shadow-pop">
          <span className="mt-0.5 shrink-0">{icon[t.tone]}</span>
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-50 grow">{t.msg}</p>
          <button onClick={() => dismissToast(t.id)} className="text-ink-300 hover:text-ink-600 dark:hover:text-white shrink-0"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}
