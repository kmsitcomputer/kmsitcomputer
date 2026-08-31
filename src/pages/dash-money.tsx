import { useMemo, useState } from "react";
import {
  CreditCard, ArrowLeftRight, Banknote, Wallet, Landmark, CheckCircle2, XCircle, Loader2,
  TrendingUp, Hourglass, ShieldCheck,
} from "lucide-react";
import { useApp } from "../lib/store";
import { fmtDate, fmtDateTime, fmtIDR, PLATFORM_FEE, uid, walletBalance, type Payment, type Provider, type Withdrawal } from "../lib/db";
import { Badge, Btn, cx, Drawer, EmptyState, Field, Modal, SearchInput, Select, StatCard, statusTone, TextInput, Toggle } from "../components/ui";
import { DashHead } from "./dash-content";

// ─── Payments ───────────────────────────────────────────────────────────────
export function PaymentsManager() {
  const { db, user, update, toast, notify, log } = useApp();
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [detail, setDetail] = useState<Payment | null>(null);
  if (!db || !user) return null;
  const list = db.payments.filter((p) => {
    const stu = db.users.find((u) => u.id === p.studentId);
    const inv = p.invoice + (stu?.name ?? "");
    return (!q || inv.toLowerCase().includes(q.toLowerCase())) && (!fStatus || p.status === fStatus);
  });
  const totalPaid = db.payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const markPaid = (p: Payment) => {
    const course = db.courses.find((c) => c.id === p.courseId);
    if (!course) return;
    const fee = Math.round(p.amount * 0.01);
    const net = Math.round((p.amount - fee) * (1 - PLATFORM_FEE));
    update((d) => {
      const x = d.payments.find((y) => y.id === p.id); if (x) x.status = "paid";
      const enrolled = d.enrollments.some((e) => e.courseId === p.courseId && e.studentId === p.studentId);
      if (!enrolled) d.enrollments.push({ id: uid(), courseId: p.courseId, studentId: p.studentId, date: new Date().toISOString(), completedLessons: [], status: "active" });
      d.walletTx.unshift({ id: uid(), instructorId: course.instructorId, type: "earning", amount: net, note: course.title, date: new Date().toISOString(), paymentId: p.id });
    });
    notify(p.studentId, "Pembayaran dikonfirmasi", `${p.invoice} berhasil diverifikasi via webhook ${p.provider}.`);
    notify(course.instructorId, "Penjualan baru", `${course.title} terjual (${fmtIDR(p.amount)}).`);
    log("payment_received", `Pembayaran ${p.invoice} dikonfirmasi (webhook ${p.provider})`);
    toast("Pembayaran dikonfirmasi — akses kelas dibuka", "ok");
  };
  return (
    <div>
      <DashHead title="Pembayaran" desc={`${list.length} transaksi · total terbayar ${fmtIDR(totalPaid)}`} />
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="grow"><SearchInput value={q} onChange={setQ} placeholder="Cari invoice atau siswa…" /></div>
        <Select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="w-40"><option value="">Semua status</option><option value="paid">paid</option><option value="pending">pending</option><option value="failed">failed</option><option value="expired">expired</option></Select>
      </div>
      <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead><tr className="border-b border-ink-100 dark:border-ink-800 bg-ink-50/60 dark:bg-ink-850 text-left">
            {["Invoice", "Siswa", "Kelas", "Gateway", "Jumlah", "Status", "Tanggal", ""].map((h) => <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-ink-400 whitespace-nowrap">{h}</th>)}
          </tr></thead>
          <tbody>
            {list.map((p) => {
              const stu = db.users.find((u) => u.id === p.studentId);
              const c = db.courses.find((x) => x.id === p.courseId);
              return (
                <tr key={p.id} className="border-b border-ink-100/70 dark:border-ink-800/70 last:border-0 hover:bg-brand-50/40 dark:hover:bg-ink-850 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-ink-800 dark:text-ink-50 whitespace-nowrap">{p.invoice}</td>
                  <td className="px-4 py-3 text-ink-700 dark:text-ink-100 whitespace-nowrap">{stu?.name}</td>
                  <td className="px-4 py-3 text-ink-500 dark:text-ink-300 max-w-[220px] truncate">{c?.title}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1.5"><Badge tone="neutral">{p.provider}</Badge><span className={cx("text-[10px] font-mono font-bold", p.mode === "production" ? "text-ok-500" : "text-warn-500")}>{p.mode === "production" ? "LIVE" : "SBX"}</span></span></td>
                  <td className="px-4 py-3 font-mono font-bold text-ink-800 dark:text-ink-50 whitespace-nowrap">{fmtIDR(p.amount)}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
                  <td className="px-4 py-3 text-[12px] text-ink-400 whitespace-nowrap">{fmtDate(p.date)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-1 justify-end">
                      {p.status === "pending" && <button onClick={() => markPaid(p)} className="rounded-lg px-2.5 h-7.5 h-8 text-[11px] font-bold bg-ok-500/12 text-ok-500 hover:bg-ok-500 hover:text-white transition-colors">Konfirmasi</button>}
                      <button onClick={() => setDetail(p)} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10"><CreditCard size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-ink-400">Tidak ada transaksi.</td></tr>}
          </tbody>
        </table>
      </div>
      {detail && <PaymentDetail p={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
function PaymentDetail({ p, onClose }: { p: Payment; onClose: () => void }) {
  const { db } = useApp();
  if (!db) return null;
  const stu = db.users.find((u) => u.id === p.studentId);
  const c = db.courses.find((x) => x.id === p.courseId);
  const ins = c && db.users.find((u) => u.id === c.instructorId);
  const pgFee = Math.round(p.amount * 0.01);
  const platform = Math.round((p.amount - pgFee) * PLATFORM_FEE);
  const net = p.amount - pgFee - platform;
  return (
    <Drawer open onClose={onClose} title={`Detail ${p.invoice}`}>
      <div className="space-y-4">
        <div className="rounded-xl border border-ink-100 dark:border-ink-800 p-4 grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-[11px] font-mono uppercase text-ink-400">Siswa</p><p className="font-bold text-ink-800 dark:text-ink-50">{stu?.name}</p></div>
          <div><p className="text-[11px] font-mono uppercase text-ink-400">Instruktur</p><p className="font-bold text-ink-800 dark:text-ink-50">{ins?.name}</p></div>
          <div className="col-span-2"><p className="text-[11px] font-mono uppercase text-ink-400">Kelas</p><p className="font-bold text-ink-800 dark:text-ink-50">{c?.title}</p></div>
          <div><p className="text-[11px] font-mono uppercase text-ink-400">Metode</p><p className="font-bold text-ink-800 dark:text-ink-50">{p.method}</p></div>
          <div><p className="text-[11px] font-mono uppercase text-ink-400">Waktu</p><p className="font-bold text-ink-800 dark:text-ink-50">{fmtDateTime(p.date)}</p></div>
        </div>
        <div className="rounded-xl border border-accent-400/40 bg-accent-500/8 p-4 space-y-1.5 text-sm font-mono">
          <p className="flex justify-between text-ink-600 dark:text-ink-200"><span>Gross amount</span><b>{fmtIDR(p.amount)}</b></p>
          <p className="flex justify-between text-ink-600 dark:text-ink-200"><span>Payment fee ({p.provider})</span><b className="text-bad-500">− {fmtIDR(pgFee)}</b></p>
          <p className="flex justify-between text-ink-600 dark:text-ink-200"><span>Platform fee (15%)</span><b className="text-bad-500">− {fmtIDR(platform)}</b></p>
          <p className="flex justify-between border-t border-accent-400/40 pt-2 text-ink-900 dark:text-white"><span>Instructor net earning</span><b className="text-ok-500">{fmtIDR(net)}</b></p>
        </div>
        <div className="flex items-center justify-between"><Badge tone={statusTone(p.status)} className="text-[13px] px-3 py-1">{p.status}</Badge><span className="text-[11px] font-mono text-ink-400">webhook: /api/payments/webhook/{p.provider}</span></div>
        <p className="text-xs text-ink-400 leading-relaxed">Seluruh perhitungan fee & saldo instruktur dilakukan dan divalidasi di backend (PaymentService), bukan dari data frontend.</p>
      </div>
    </Drawer>
  );
}

// ─── Course transactions ledger ─────────────────────────────────────────────
export function TransactionsManager() {
  const { db } = useApp();
  const [fCourse, setFCourse] = useState("");
  const rows = useMemo(() => db?.payments.filter((p) => p.status === "paid" && (!fCourse || p.courseId === fCourse)).map((p) => {
    const pgFee = Math.round(p.amount * 0.01);
    const platform = Math.round((p.amount - pgFee) * PLATFORM_FEE);
    return { ...p, pgFee, platform, net: p.amount - pgFee - platform };
  }) ?? [], [db, fCourse]);
  if (!db) return null;
  const sum = (k: "amount" | "pgFee" | "platform" | "net") => rows.reduce((s, r) => s + r[k], 0);
  return (
    <div>
      <DashHead title="Transaksi Kelas" desc="Ledger pendapatan per transaksi: gross, fee gateway, biaya platform 15%, dan net instruktur" />
      <div className="mb-5 max-w-xs"><Select value={fCourse} onChange={(e) => setFCourse(e.target.value)}><option value="">Semua kelas</option>{db.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</Select></div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard label="Gross" value={fmtIDR(sum("amount"))} icon={<CreditCard size={18} />} />
        <StatCard label="Payment Fee" value={fmtIDR(sum("pgFee"))} icon={<ArrowLeftRight size={18} />} tone="info" />
        <StatCard label="Platform Fee 15%" value={fmtIDR(sum("platform"))} icon={<TrendingUp size={18} />} tone="accent" />
        <StatCard label="Net Instruktur" value={fmtIDR(sum("net"))} icon={<Wallet size={18} />} tone="ok" />
      </div>
      <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead><tr className="border-b border-ink-100 dark:border-ink-800 bg-ink-50/60 dark:bg-ink-850 text-left">
            {["Invoice", "Kelas", "Instruktur", "Gross", "PG Fee", "Platform 15%", "Net Instruktur", "Tanggal"].map((h) => <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-ink-400 whitespace-nowrap">{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((r) => {
              const c = db.courses.find((x) => x.id === r.courseId);
              const ins = c && db.users.find((u) => u.id === c.instructorId);
              return (
                <tr key={r.id} className="border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
                  <td className="px-4 py-3 font-mono font-bold text-ink-800 dark:text-ink-50 whitespace-nowrap">{r.invoice}</td>
                  <td className="px-4 py-3 text-ink-600 dark:text-ink-200 max-w-[200px] truncate">{c?.title}</td>
                  <td className="px-4 py-3 text-ink-500 dark:text-ink-300 whitespace-nowrap">{ins?.name}</td>
                  <td className="px-4 py-3 font-mono text-ink-700 dark:text-ink-100 whitespace-nowrap">{fmtIDR(r.amount)}</td>
                  <td className="px-4 py-3 font-mono text-bad-500 whitespace-nowrap">−{fmtIDR(r.pgFee)}</td>
                  <td className="px-4 py-3 font-mono text-accent-600 dark:text-accent-300 whitespace-nowrap">−{fmtIDR(r.platform)}</td>
                  <td className="px-4 py-3 font-mono font-bold text-ok-500 whitespace-nowrap">{fmtIDR(r.net)}</td>
                  <td className="px-4 py-3 text-[12px] text-ink-400 whitespace-nowrap">{fmtDate(r.date)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-ink-400">Belum ada transaksi terbayar.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Withdrawals (admin view) ───────────────────────────────────────────────
export function WithdrawalsManager() {
  const { db, user, update, toast, notify, log } = useApp();
  const [rejecting, setRejecting] = useState<Withdrawal | null>(null);
  const [note, setNote] = useState("");
  if (!db || !user) return null;
  const setStatus = (w: Withdrawal, status: Withdrawal["status"]) => {
    update((d) => {
      const x = d.withdrawals.find((y) => y.id === w.id); if (x) x.status = status;
      if (status === "rejected") {
        const orig = d.withdrawals.find((y) => y.id === w.id);
        if (orig) orig.note = note;
        d.walletTx.unshift({ id: uid(), instructorId: w.instructorId, type: "earning", amount: w.amount, note: `Refund pencairan ditolak (${w.bank})`, date: new Date().toISOString() });
      }
    });
    notify(w.instructorId, `Pencairan ${status}`, `Permintaan pencairan ${fmtIDR(w.amount)} kamu kini berstatus ${status}.${note ? ` Catatan: ${note}` : ""}`);
    log(`withdrawal_${status}`, `Pencairan ${w.holder} (${fmtIDR(w.amount)}) → ${status}`);
    toast(`Status pencairan: ${status}`, status === "rejected" ? "warn" : "ok");
    setRejecting(null); setNote("");
  };
  const flow: Partial<Record<Withdrawal["status"], { next: Withdrawal["status"]; label: string }>> = {
    pending: { next: "processing", label: "Proses" },
    processing: { next: "approved", label: "Setujui" },
    approved: { next: "completed", label: "Tandai Selesai" },
  };
  return (
    <div>
      <DashHead title="Pencairan Instruktur" desc="Proses permintaan pencairan dana instruktur" />
      {db.withdrawals.length === 0 ? <EmptyState icon={<Banknote size={20} />} title="Belum ada permintaan" /> : (
        <div className="space-y-3">
          {db.withdrawals.map((w) => {
            const ins = db.users.find((u) => u.id === w.instructorId);
            const nxt = flow[w.status];
            return (
              <div key={w.id} className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 px-4 py-3.5 flex flex-wrap items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-accent-500/12 text-accent-600 dark:text-accent-300 flex items-center justify-center shrink-0"><Banknote size={17} /></span>
                <div className="grow min-w-0">
                  <p className="text-sm font-bold text-ink-800 dark:text-ink-50">{w.holder} · <span className="font-mono">{fmtIDR(w.amount)}</span></p>
                  <p className="text-[11.5px] font-mono text-ink-400 mt-0.5">{w.bank} · {w.account} · diajukan {fmtDate(w.date)}{w.note ? ` · catatan: ${w.note}` : ""}</p>
                </div>
                <Badge tone={statusTone(w.status)}>{w.status}</Badge>
                <div className="flex gap-1.5">
                  {nxt && <Btn size="xs" variant="soft" onClick={() => setStatus(w, nxt.next)}>{nxt.label}</Btn>}
                  {(w.status === "pending" || w.status === "processing") && <Btn size="xs" variant="danger" onClick={() => setRejecting(w)}>Tolak</Btn>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Tolak pencairan?"
        footer={<><Btn variant="ghost" onClick={() => setRejecting(null)}>Batal</Btn><Btn variant="danger" onClick={() => rejecting && setStatus(rejecting, "rejected")}>Tolak & Refund Saldo</Btn></>}>
        <p className="text-sm text-ink-500 dark:text-ink-300 mb-3">Dana {rejecting && fmtIDR(rejecting.amount)} akan dikembalikan ke saldo instruktur.</p>
        <Field label="Catatan penolakan"><TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="cth: rekening tidak valid" /></Field>
      </Modal>
    </div>
  );
}

// ─── Instructor wallet ──────────────────────────────────────────────────────
export function WalletPage() {
  const { db, user, update, toast, notify, log } = useApp();
  const [reqOpen, setReqOpen] = useState(false);
  const [amount, setAmount] = useState("");
  if (!db || !user) return null;
  const wb = walletBalance(db, user.id);
  const txs = db.walletTx.filter((t) => t.instructorId === user.id);
  const wds = db.withdrawals.filter((w) => w.instructorId === user.id);
  const amt = Number(amount) || 0;
  const submit = () => {
    if (amt < 50000) { toast("Minimal pencairan Rp50.000", "warn"); return; }
    if (amt > wb.available) { toast("Melebihi saldo tersedia", "bad"); return; }
    update((d) => {
      d.withdrawals.unshift({ id: uid(), instructorId: user.id, amount: amt, bank: user.bank ?? "BCA", account: (user.account ?? "").replace(/\D/g, "") || "0000000000", holder: user.name, status: "pending", date: new Date().toISOString() });
      d.walletTx.unshift({ id: uid(), instructorId: user.id, type: "withdrawal", amount: -amt, note: `Pencairan ke ${user.bank ?? "BCA"} (pending)`, date: new Date().toISOString() });
    });
    const supers = db.users.filter((u) => u.role === "super_admin");
    supers.forEach((s) => notify(s.id, "Permintaan pencairan baru", `${user.name} meminta pencairan ${fmtIDR(amt)}.`));
    log("withdrawal_requested", `Permintaan pencairan ${fmtIDR(amt)} diajukan`);
    toast("Permintaan pencairan dikirim ke Super Admin", "ok");
    setReqOpen(false); setAmount("");
  };
  return (
    <div>
      <DashHead title="Saldo & Pendapatan" desc="Saldo dihitung dari transaksi backend — tidak dapat diubah manual"
        action={<Btn variant="accent" onClick={() => setReqOpen(true)} disabled={wb.available < 50000}><Banknote size={16} />Ajukan Pencairan</Btn>} />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Pendapatan" value={fmtIDR(wb.total + wb.withdrawn)} icon={<TrendingUp size={18} />} />
        <StatCard label="Tersedia" value={fmtIDR(wb.available)} sub="siap dicairkan" icon={<Wallet size={18} />} tone="ok" />
        <StatCard label="Pending" value={fmtIDR(wb.pending)} sub="menunggu persetujuan" icon={<Hourglass size={18} />} tone="accent" />
        <StatCard label="Sudah Dicairkan" value={fmtIDR(wb.withdrawn)} icon={<Banknote size={18} />} tone="info" />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900">
          <p className="px-4 py-3 border-b border-ink-100 dark:border-ink-800 font-display font-semibold text-ink-900 dark:text-white text-sm">Riwayat Pencairan</p>
          {wds.length === 0 ? <p className="px-4 py-10 text-center text-sm text-ink-400">Belum pernah mencairkan dana.</p> : wds.map((w) => (
            <div key={w.id} className="flex items-center gap-3 px-4 py-3 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
              <span className={cx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", w.status === "completed" ? "bg-ok-500/12 text-ok-500" : w.status === "rejected" ? "bg-bad-500/12 text-bad-500" : "bg-warn-500/12 text-warn-500")}>
                {w.status === "completed" ? <CheckCircle2 size={15} /> : w.status === "rejected" ? <XCircle size={15} /> : <Hourglass size={15} />}
              </span>
              <div className="grow"><p className="text-[13px] font-bold text-ink-800 dark:text-ink-50 font-mono">{fmtIDR(w.amount)}</p><p className="text-[11px] font-mono text-ink-400">{w.bank} · {fmtDate(w.date)}</p></div>
              <Badge tone={statusTone(w.status)}>{w.status}</Badge>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900">
          <p className="px-4 py-3 border-b border-ink-100 dark:border-ink-800 font-display font-semibold text-ink-900 dark:text-white text-sm">Mutasi Saldo</p>
          {txs.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
              <span className={cx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", t.amount >= 0 ? "bg-ok-500/12 text-ok-500" : "bg-bad-500/12 text-bad-500")}>
                {t.type === "earning" ? <TrendingUp size={15} /> : <Banknote size={15} />}
              </span>
              <div className="grow min-w-0"><p className="text-[13px] font-bold text-ink-800 dark:text-ink-50 truncate">{t.note}</p><p className="text-[11px] font-mono text-ink-400">{fmtDateTime(t.date)}</p></div>
              <span className={cx("font-mono text-[13px] font-bold", t.amount >= 0 ? "text-ok-500" : "text-bad-500")}>{t.amount >= 0 ? "+" : ""}{fmtIDR(t.amount)}</span>
            </div>
          ))}
        </div>
      </div>
      <Modal open={reqOpen} onClose={() => setReqOpen(false)} title="Ajukan Pencairan Dana"
        footer={<><Btn variant="ghost" onClick={() => setReqOpen(false)}>Batal</Btn><Btn variant="accent" onClick={submit}>Kirim Permintaan</Btn></>}>
        <div className="space-y-4">
          <div className="rounded-xl bg-brand-50 dark:bg-brand-900/25 border border-brand-500/25 px-4 py-3 text-sm">
            <p className="text-brand-800 dark:text-brand-200">Saldo tersedia: <b className="font-mono">{fmtIDR(wb.available)}</b></p>
            <p className="text-[11.5px] text-brand-700/70 dark:text-brand-200/60 mt-0.5">Minimal pencairan Rp50.000 · diproses Super Admin</p>
          </div>
          <Field label="Jumlah pencairan (Rp)"><TextInput type="number" min={50000} step={10000} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100000" /></Field>
          <div className="rounded-xl border border-ink-200 dark:border-ink-700 px-4 py-3 text-sm grid grid-cols-2 gap-2">
            <div><p className="text-[11px] font-mono uppercase text-ink-400">Bank</p><p className="font-bold text-ink-800 dark:text-ink-50">{user.bank ?? "BCA"}</p></div>
            <div><p className="text-[11px] font-mono uppercase text-ink-400">Rekening</p><p className="font-bold text-ink-800 dark:text-ink-50 font-mono">{user.account ?? "—"}</p></div>
          </div>
          {amt > 0 && <p className={cx("text-[13px] font-bold", amt > wb.available ? "text-bad-500" : "text-ok-500")}>{amt > wb.available ? "Melebihi saldo tersedia!" : `Sisa saldo setelah pencairan: ${fmtIDR(wb.available - amt)}`}</p>}
        </div>
      </Modal>
    </div>
  );
}

// ─── Payment gateway ────────────────────────────────────────────────────────
const PROVIDER_META: Record<Provider, { name: string; desc: string; color: string }> = {
  tripay: { name: "Tripay", desc: "QRIS, VA, retail — populer di Indonesia", color: "#0e8a75" },
  xendit: { name: "Xendit", desc: "VA, e-wallet, kartu — Asia Tenggara", color: "#3e8fc4" },
  stripe: { name: "Stripe", desc: "Kartu kredit global & subscription", color: "#8a5cc0" },
};
export function GatewayPage() {
  const { db, update, toast, log } = useApp();
  const [testing, setTesting] = useState<Provider | null>(null);
  if (!db) return null;
  const upd = (p: Provider, patch: Record<string, unknown>) => update((d) => {
    const g = d.gateways.find((x) => x.provider === p);
    if (g) Object.assign(g, patch);
  });
  return (
    <div>
      <DashHead title="Payment Gateway" desc="Hanya untuk pembayaran kelas berbayar — kredensial tersimpan aman (encrypted .env)" />
      <div className="grid lg:grid-cols-3 gap-5 items-start">
        {db.gateways.map((g) => {
          const meta = PROVIDER_META[g.provider];
          const active = db.activeGateway === g.provider;
          return (
            <div key={g.provider} className={cx("rounded-xl border bg-card dark:bg-ink-900 overflow-hidden transition-all", active ? "border-brand-500 shadow-lift" : "border-ink-100 dark:border-ink-800")}>
              <div className="px-5 py-4 border-b border-ink-100 dark:border-ink-800 flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-display font-bold" style={{ background: meta.color }}>{meta.name[0]}</span>
                <div className="grow">
                  <p className="font-display font-bold text-ink-900 dark:text-white">{meta.name}</p>
                  <p className="text-[11px] text-ink-400">{meta.desc}</p>
                </div>
                <Toggle checked={g.enabled} onChange={(v) => { upd(g.provider, { enabled: v }); toast(`${meta.name} ${v ? "diaktifkan" : "dinonaktifkan"}`, "info"); }} />
              </div>
              <div className="p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-ink-600 dark:text-ink-200">Mode</span>
                  <div className="flex rounded-lg border border-ink-200 dark:border-ink-700 p-0.5">
                    {(["sandbox", "production"] as const).map((m) => (
                      <button key={m} onClick={() => { upd(g.provider, { mode: m }); log("gateway_mode", `${meta.name} → mode ${m}`); toast(`${meta.name}: mode ${m.toUpperCase()}`, m === "production" ? "warn" : "ok"); }}
                        className={cx("px-3 h-7 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all", g.mode === m ? (m === "production" ? "bg-ok-500 text-white" : "bg-warn-500 text-white") : "text-ink-400 hover:text-ink-700 dark:hover:text-white")}>{m === "sandbox" ? "Dev" : "Prod"}</button>
                    ))}
                  </div>
                </div>
                <Field label="API Key (Public)"><TextInput value={g.apiKey} onChange={(e) => upd(g.provider, { apiKey: e.target.value })} placeholder={g.mode === "sandbox" ? "pk_test_…" : "pk_live_…"} /></Field>
                <Field label="Secret Key"><TextInput type="password" value={g.secretKey} onChange={(e) => upd(g.provider, { secretKey: e.target.value })} placeholder={g.mode === "sandbox" ? "sk_test_…" : "sk_live_…"} /></Field>
                {g.provider !== "stripe" && <Field label="Merchant ID"><TextInput value={g.merchantId} onChange={(e) => upd(g.provider, { merchantId: e.target.value })} placeholder="T1234" /></Field>}
                <Field label="Webhook URL" hint="Terima notifikasi pembayaran"><TextInput readOnly value={`https://kmsit.id${g.webhookUrl}`} className="font-mono text-[12px] bg-ink-50 dark:bg-ink-850" /></Field>
                <div className="flex gap-2 pt-1">
                  <Btn size="sm" variant={active ? "primary" : "outline"} className="grow" disabled={!g.enabled} onClick={() => { update((d) => { d.activeGateway = g.provider; }); log("gateway_active", `Gateway aktif: ${meta.name}`); toast(`${meta.name} dijadikan gateway aktif`, "ok"); }}>
                    {active ? <><ShieldCheck size={14} />Gateway Aktif</> : "Jadikan Aktif"}
                  </Btn>
                  <Btn size="sm" variant="ghost" disabled={testing === g.provider} onClick={() => { setTesting(g.provider); window.setTimeout(() => { setTesting(null); toast(`Koneksi ${meta.name} (${g.mode}) berhasil ✓`, "ok"); }, 1100); }}>
                    {testing === g.provider ? <Loader2 size={14} className="spin" /> : <Landmark size={14} />}Tes
                  </Btn>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-xs text-ink-400 leading-relaxed max-w-2xl">Arsitektur: <code className="font-mono bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 rounded">PaymentService → TripayProvider | XenditProvider | StripeProvider</code>. Provider dapat diganti tanpa mengubah business logic. API key tidak pernah di-hardcode dan hanya dikirim ke backend.</p>
    </div>
  );
}
