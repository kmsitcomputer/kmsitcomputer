import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, ExternalLink, ShoppingBag, Package, Truck, MapPin, CreditCard, Ban, Box } from "lucide-react";
import { useApp } from "../lib/store";
import { fmtDate, fmtIDR, slugify, uid, type Order, type Product, type ProductIcon } from "../lib/db";
import { Badge, Btn, cx, Drawer, EmptyState, Field, Modal, SearchInput, Select, statusTone, TextArea, TextInput } from "../components/ui";
import { DashHead } from "./dash-content";
import { ProductArt } from "./shop";

const ICON_OPTS: { v: ProductIcon; l: string }[] = [
  { v: "tshirt", l: "Kaos / Hoodie" }, { v: "keyboard", l: "Keyboard" }, { v: "mouse", l: "Mouse" },
  { v: "book", l: "Buku" }, { v: "bottle", l: "Tumbler" }, { v: "backpack", l: "Tas" },
  { v: "mousepad", l: "Mousepad" }, { v: "sticker", l: "Stiker" },
];

// ─── Produk ─────────────────────────────────────────────────────────────────
export function ProductsManager() {
  const { db, update, toast, log } = useApp();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Product | null | "new">(null);
  if (!db) return null;
  const list = db.products.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <DashHead title="Produk Shop" desc={`${list.length} produk merchandise · stok & harga dikelola di sini`}
        action={<Btn onClick={() => setEditing("new")}><Plus size={16} />Produk Baru</Btn>} />
      <div className="mb-5 max-w-sm"><SearchInput value={q} onChange={setQ} placeholder="Cari produk…" /></div>
      {list.length === 0 ? <EmptyState icon={<ShoppingBag size={20} />} title="Belum ada produk" action={<Btn size="sm" onClick={() => setEditing("new")}>Tambah produk</Btn>} /> : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((p) => (
            <div key={p.id} className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden hover:shadow-lift transition-all">
              <div className="relative" style={{ aspectRatio: "16/8" }}><ProductArt p={p} />
                <span className="absolute top-2 right-2"><Badge tone={statusTone(p.status)}>{p.status}</Badge></span>
              </div>
              <div className="p-4">
                <p className="text-[10.5px] font-mono uppercase tracking-wider text-ink-300">{p.category} · /shop/{p.slug}</p>
                <p className="mt-1 text-sm font-bold text-ink-900 dark:text-white leading-snug line-clamp-1">{p.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display font-bold text-brand-700 dark:text-brand-300">{fmtIDR(p.price)}</span>
                  <span className="text-[11px] font-mono text-ink-400">{p.weight}gr · stok {p.stock} · {p.sales} terjual</span>
                </div>
                <div className="mt-3 flex gap-1.5">
                  <Link to={`/shop/${p.slug}`} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10"><ExternalLink size={15} /></Link>
                  <Btn size="xs" variant="soft" className="grow" onClick={() => setEditing(p)}><Pencil size={13} />Ubah</Btn>
                  <button onClick={() => { update((d) => { d.products = d.products.filter((x) => x.id !== p.id); }); log("product_deleted", `Produk “${p.name}” dihapus`); toast("Produk dihapus", "info"); }}
                    className="rounded-lg p-2 text-ink-400 hover:text-bad-500 hover:bg-bad-500/10"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && <ProductDrawer initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ProductDrawer({ initial, onClose }: { initial: Product | null; onClose: () => void }) {
  const { update, toast, log } = useApp();
  const [f, setF] = useState(() => ({
    name: initial?.name ?? "", slug: initial?.slug ?? "", category: initial?.category ?? "Aksesori",
    price: initial ? String(initial.price) : "50000", weight: initial ? String(initial.weight) : "300",
    stock: initial ? String(initial.stock) : "20", icon: initial?.icon ?? "sticker", hue: initial ? String(initial.hue) : "168",
    description: initial?.description ?? "", status: initial?.status ?? "draft",
  }));
  const [err, setErr] = useState("");
  const save = () => {
    if (!f.name.trim()) { setErr("Nama produk wajib diisi."); return; }
    const payload: Product = {
      id: initial?.id ?? uid(), slug: f.slug.trim() ? slugify(f.slug) : slugify(f.name), name: f.name.trim(),
      category: f.category, price: Math.max(0, Number(f.price) || 0), weight: Math.max(10, Number(f.weight) || 100),
      stock: Math.max(0, Number(f.stock) || 0), sales: initial?.sales ?? 0, description: f.description,
      hue: Number(f.hue) || 168, icon: f.icon as ProductIcon, status: f.status as Product["status"], createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    update((d) => { if (initial) { const i = d.products.findIndex((x) => x.id === initial.id); if (i >= 0) d.products[i] = payload; } else d.products.unshift(payload); });
    log(initial ? "product_updated" : "product_created", `Produk “${payload.name}” ${initial ? "diperbarui" : "dibuat"}`);
    toast(initial ? "Produk diperbarui" : "Produk dibuat", "ok"); onClose();
  };
  return (
    <Drawer open onClose={onClose} title={initial ? "Ubah Produk" : "Produk Baru"}
      footer={<><Btn variant="ghost" onClick={onClose}>Batal</Btn><Btn onClick={save}>Simpan Produk</Btn></>}>
      <div className="space-y-4">
        {err && <p className="rounded-lg bg-bad-500/10 border border-bad-500/30 px-3.5 py-2.5 text-[13px] font-semibold text-bad-500">{err}</p>}
        <div className="flex gap-4 items-start">
          <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-ink-100 dark:border-ink-800">
            <ProductArt p={{ hue: Number(f.hue) || 168, icon: f.icon as ProductIcon, name: f.name || "Preview" }} />
          </div>
          <div className="grow space-y-3">
            <Field label="Ikon produk"><Select value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value as ProductIcon })}>{ICON_OPTS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</Select></Field>
            <Field label="Warna (hue 0–360)"><TextInput type="number" min={0} max={360} value={f.hue} onChange={(e) => setF({ ...f, hue: e.target.value })} /></Field>
          </div>
        </div>
        <Field label="Nama produk"><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="cth: Hoodie KMSIT" /></Field>
        <Field label="Slug"><TextInput value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder={slugify(f.name)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kategori"><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{["Apparel", "Gadget", "Buku", "Aksesori"].map((cc) => <option key={cc}>{cc}</option>)}</Select></Field>
          <Field label="Status"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Product["status"] })}><option value="draft">Draft</option><option value="published">Published</option></Select></Field>
          <Field label="Harga (Rp)"><TextInput type="number" min={0} step={1000} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
          <Field label="Berat (gram)" hint="dipakai RajaOngkir"><TextInput type="number" min={10} value={f.weight} onChange={(e) => setF({ ...f, weight: e.target.value })} /></Field>
          <Field label="Stok"><TextInput type="number" min={0} value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} /></Field>
        </div>
        <Field label="Deskripsi"><TextArea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      </div>
    </Drawer>
  );
}

// ─── Pesanan (admin) ────────────────────────────────────────────────────────
const ORDER_FLOW: { from: Order["status"]; to: Order["status"]; label: string }[] = [
  { from: "processing", to: "packed", label: "Tandai Dikemas" },
  { from: "packed", to: "shipped", label: "Tandai Dikirim" },
  { from: "shipped", to: "completed", label: "Selesaikan" },
];
const ORDER_TONE = (s: Order["status"]) =>
  ({ pending_payment: "warn", processing: "info", packed: "brand", shipped: "accent", completed: "ok", cancelled: "bad" } as Record<Order["status"], "ok" | "warn" | "bad" | "info" | "brand" | "accent">)[s] ?? "info";

export function OrdersManager() {
  const { db, update, toast, notify, log } = useApp();
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);
  if (!db) return null;
  const list = db.orders.filter((o) => {
    const buyer = db.users.find((u) => u.id === o.userId);
    return (!q || (o.invoice + (buyer?.name ?? "") + o.address.name).toLowerCase().includes(q.toLowerCase())) && (!fStatus || o.status === fStatus);
  });
  const setStatus = (o: Order, status: Order["status"]) => {
    update((d) => { const x = d.orders.find((y) => y.id === o.id); if (x) x.status = status; });
    notify(o.userId, `Pesanan ${o.invoice}: ${status}`, `Pesanan kamu sekarang berstatus ${status}.`);
    log("order_status", `Pesanan ${o.invoice} → ${status}`);
    toast(`Status: ${status}`, "ok");
    setDetail((d) => (d && d.id === o.id ? { ...d, status } : d));
  };
  return (
    <div>
      <DashHead title="Pesanan Shop" desc={`${list.length} pesanan · kelola status dari pembayaran sampai pengiriman`} />
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="grow"><SearchInput value={q} onChange={setQ} placeholder="Cari invoice / pembeli…" /></div>
        <Select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="w-44"><option value="">Semua status</option>{["pending_payment", "processing", "packed", "shipped", "completed", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}</Select>
      </div>
      {list.length === 0 ? <EmptyState icon={<Package size={20} />} title="Belum ada pesanan" desc="Pesanan shop dari pelanggan akan muncul di sini." /> : (
        <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
          {list.map((o) => {
            const buyer = db.users.find((u) => u.id === o.userId);
            const nxt = ORDER_FLOW.find((fl) => fl.from === o.status);
            return (
              <div key={o.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0 hover:bg-brand-50/30 dark:hover:bg-ink-850 transition-colors">
                <span className="w-10 h-10 rounded-lg bg-brand-500/12 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0"><Package size={17} /></span>
                <div className="grow min-w-0">
                  <p className="text-sm font-bold text-ink-800 dark:text-ink-50 font-mono">{o.invoice} <span className="font-sans text-ink-500 dark:text-ink-300 font-semibold">· {buyer?.name ?? o.address.name}</span></p>
                  <p className="text-[11.5px] font-mono text-ink-400 mt-0.5">{o.items.reduce((s, i) => s + i.qty, 0)} item · {o.address.city}, {o.address.province} · {o.courier} {o.courierService} · {fmtDate(o.date)}</p>
                </div>
                <span className="font-mono font-bold text-sm text-ink-800 dark:text-ink-50">{fmtIDR(o.total)}</span>
                <Badge tone={ORDER_TONE(o.status)}>{o.status}</Badge>
                <div className="flex gap-1.5">
                  {nxt && <Btn size="xs" variant="soft" onClick={() => setStatus(o, nxt.to)}>{nxt.label}</Btn>}
                  {(o.status === "processing" || o.status === "packed") && (
                    <Btn size="xs" variant="ghost" className="text-bad-500" onClick={() => { setStatus(o, "cancelled"); }}>Batalkan</Btn>
                  )}
                  <button onClick={() => setDetail(o)} className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-500/10"><ExternalLink size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {detail && (
        <Drawer open onClose={() => setDetail(null)} title={`Pesanan ${detail.invoice}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><Badge tone={ORDER_TONE(detail.status)} className="text-[13px] px-3 py-1">{detail.status}</Badge><span className="font-mono text-[11px] text-ink-400">{fmtDate(detail.date)}</span></div>
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 overflow-hidden">
              {detail.items.map((it) => (
                <div key={it.productId} className="flex items-center gap-3 px-4 py-2.5 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
                  <span className="w-9 h-9 rounded-lg text-white flex items-center justify-center" style={{ background: `hsl(${it.hue} 45% 30%)` }}><Box size={15} /></span>
                  <span className="grow text-[13px] font-semibold text-ink-700 dark:text-ink-100">{it.qty}× {it.name}</span>
                  <span className="font-mono text-[12.5px] text-ink-500 dark:text-ink-300">{fmtIDR(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 p-4 space-y-1.5 text-sm font-mono">
              <p className="flex justify-between text-ink-600 dark:text-ink-200"><span>Subtotal</span><b>{fmtIDR(detail.subtotal)}</b></p>
              <p className="flex justify-between text-ink-600 dark:text-ink-200"><span>Ongkir {detail.courier} — {detail.courierService} ({detail.eta})</span><b>{fmtIDR(detail.shippingCost)}</b></p>
              <p className="flex justify-between text-ink-900 dark:text-white border-t border-ink-100 dark:border-ink-800 pt-1.5 text-[15px]"><span>Total</span><b>{fmtIDR(detail.total)}</b></p>
            </div>
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 p-4 text-sm space-y-2">
              <p className="flex items-center gap-2 font-bold text-ink-800 dark:text-ink-50"><MapPin size={14} className="text-brand-600" />Alamat Pengiriman</p>
              <p className="text-ink-600 dark:text-ink-200 leading-relaxed">{detail.address.name} · {detail.address.phone}<br />{detail.address.address}<br />{detail.address.city}, {detail.address.province}</p>
            </div>
            {detail.payment && (
              <p className="flex items-center gap-2 text-[12.5px] font-mono text-ink-400"><CreditCard size={13} />{detail.payment.provider} · {detail.payment.method} · {detail.payment.mode}</p>
            )}
          </div>
        </Drawer>
      )}
    </div>
  );
}

// ─── Pesanan saya (siswa) ───────────────────────────────────────────────────
const STEPS: Order["status"][] = ["processing", "packed", "shipped", "completed"];
export function MyOrdersPage() {
  const { db, user } = useApp();
  if (!db || !user) return null;
  const mine = db.orders.filter((o) => o.userId === user.id);
  return (
    <div>
      <DashHead title="Pesanan Saya" desc={`${mine.length} pesanan shop`} action={<Link to="/shop"><Btn variant="outline" size="sm"><ShoppingBag size={14} />Belanja Lagi</Btn></Link>} />
      {mine.length === 0 ? <EmptyState icon={<Package size={20} />} title="Belum ada pesanan" action={<Link to="/shop"><Btn size="sm">Ke Shop</Btn></Link>} /> : (
        <div className="grid gap-4">
          {mine.map((o) => {
            const idx = o.status === "cancelled" ? -1 : STEPS.indexOf(o.status);
            return (
              <div key={o.id} className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono font-bold text-ink-800 dark:text-ink-50">{o.invoice}</p>
                  <Badge tone={ORDER_TONE(o.status)}>{o.status}</Badge>
                </div>
                {o.status !== "cancelled" && (
                  <div className="mt-4 flex items-center gap-1">
                    {STEPS.map((s, i) => (
                      <div key={s} className="flex items-center grow last:grow-0">
                        <span className={cx("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors", i <= idx ? "bg-brand-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-400")}>{i + 1}</span>
                        {i < STEPS.length - 1 && <span className={cx("h-1 grow rounded-full mx-1", i < idx ? "bg-brand-600" : "bg-ink-100 dark:bg-ink-800")} />}
                      </div>
                    ))}
                  </div>
                )}
                {o.status === "cancelled" && <p className="mt-3 text-[13px] font-semibold text-bad-500 flex items-center gap-2"><Ban size={14} />Pesanan dibatalkan.</p>}
                <div className="mt-3 grid sm:grid-cols-[1fr_auto] gap-3 items-center">
                  <div className="flex flex-wrap gap-2">
                    {o.items.map((it) => (
                      <span key={it.productId} className="inline-flex items-center gap-2 rounded-lg border border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-850 px-2.5 py-1.5 text-[12px] font-semibold text-ink-600 dark:text-ink-200">
                        <span className="w-5 h-5 rounded flex items-center justify-center text-white" style={{ background: `hsl(${it.hue} 45% 35%)` }}><Box size={11} /></span>{it.qty}× {it.name}
                      </span>
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-mono text-ink-400 flex items-center justify-end gap-1"><Truck size={11} />{o.courier} {o.courierService} · {o.eta}</p>
                    <p className="font-display font-bold text-ink-900 dark:text-white">{fmtIDR(o.total)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
