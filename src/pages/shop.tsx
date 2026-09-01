import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  ShoppingCart, Plus, Minus, Trash2, MapPin, Truck, PackageCheck, CreditCard, ArrowRight,
  Search, CheckCircle2, Weight, Boxes, ShieldCheck,
} from "lucide-react";
import {
  Shirt as Tshirt, Keyboard, Mouse, BookOpen, CupSoda, Backpack, MousePointer, Sticker,
} from "lucide-react";
import { useApp } from "../lib/store";
import { fmtIDR, uid, type Order, type OrderItem, type Product, type ProductIcon } from "../lib/db";
import { Badge, Btn, cx, EmptyState, Field, Reveal, SearchInput, Select, TextInput } from "../components/ui";
import { NotFoundBlock } from "./public";
import { getProvinces, getCities, getShippingCosts, rajaMode, type City, type Province, type ShippingOption } from "../lib/rajaongkir";

// ─── Cart (localStorage + event sync) ───────────────────────────────────────
const CART_KEY = "kmsit_cart_v1";
type CartRow = { productId: string; qty: number };
const readCart = (): CartRow[] => { try { return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]"); } catch { return []; } };
const writeCart = (rows: CartRow[]) => { localStorage.setItem(CART_KEY, JSON.stringify(rows)); window.dispatchEvent(new Event("kmsit:cart-changed")); };
export const useCartCount = () => {
  const [n, setN] = useState(() => readCart().reduce((s, r) => s + r.qty, 0));
  useEffect(() => {
    const h = () => setN(readCart().reduce((s, r) => s + r.qty, 0));
    window.addEventListener("kmsit:cart-changed", h); window.addEventListener("storage", h);
    return () => { window.removeEventListener("kmsit:cart-changed", h); window.removeEventListener("storage", h); };
  }, []);
  return n;
};
export function cartAdd(productId: string, qty = 1) {
  const rows = readCart();
  const ex = rows.find((r) => r.productId === productId);
  if (ex) ex.qty += qty; else rows.push({ productId, qty });
  writeCart(rows);
}
export function cartSetQty(productId: string, qty: number) {
  const rows = readCart().map((r) => (r.productId === productId ? { ...r, qty: Math.max(1, qty) } : r));
  writeCart(rows);
}
export function cartRemove(productId: string) { writeCart(readCart().filter((r) => r.productId !== productId)); }
export function cartClear() { writeCart([]); }

// ─── Product art (SVG, tanpa file gambar) ───────────────────────────────────
const ICONS: Record<ProductIcon, React.ReactNode> = {
  tshirt: <Tshirt size={46} />, keyboard: <Keyboard size={46} />, mouse: <Mouse size={46} />,
  book: <BookOpen size={46} />, bottle: <CupSoda size={46} />, backpack: <Backpack size={46} />,
  mousepad: <MousePointer size={46} />, sticker: <Sticker size={46} />,
};
export function ProductArt({ p, className, iconSize }: { p: Pick<Product, "hue" | "icon" | "name">; className?: string; iconSize?: number }) {
  return (
    <div className={cx("relative w-full h-full overflow-hidden", className)} style={{ background: `linear-gradient(135deg, hsl(${p.hue} 42% 20%), hsl(${(p.hue + 50) % 360} 38% 11%))` }}>
      <div className="absolute inset-0 grid-bg opacity-70" />
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full" style={{ background: `hsl(${p.hue} 70% 55% / 0.18)`, filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white/90 [&>svg]:w-[46px] [&>svg]:h-[46px]" style={iconSize ? { ["--x" as string]: undefined } : undefined}>{ICONS[p.icon]}</span>
      </div>
      <span className="absolute bottom-2 left-3 font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: `hsl(${p.hue} 65% 70%)` }}>{p.name.slice(0, 22)}</span>
    </div>
  );
}

// ─── Shop catalog ───────────────────────────────────────────────────────────
export function ShopPage() {
  const { db, toast } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState("featured");
  if (!db) return null;
  const products = db.products.filter((p) => p.status === "published");
  const cats = [...new Set(products.map((p) => p.category))];
  let list = products.filter((p) => (!q || p.name.toLowerCase().includes(q.toLowerCase())) && (!cat || p.category === cat));
  if (sort === "cheap") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "expensive") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "best") list = [...list].sort((a, b) => b.sales - a.sales);
  return (
    <div>
      <div className="bg-ink-900 dark:bg-ink-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-accent-500/15 blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[12px] text-brand-300"><span className="text-accent-400">$</span> kmsit shop --list</p>
            <h1 className="mt-2 font-display text-3xl sm:text-[42px] font-bold tracking-tight leading-[1.05]">KMSIT <span className="text-accent-300">Shop</span></h1>
            <p className="mt-2 text-ink-200 max-w-lg">Merchandise & perlengkapan belajar resmi — ongkir dihitung live via <b className="text-white">RajaOngkir</b>, pembayaran via payment gateway aktif.</p>
          </div>
          <div className="flex gap-2 text-[11px] font-mono">
            <Badge tone="ok" className="bg-white/5 border-white/15 text-ink-100"><Truck size={12} />JNE · POS · TIKI</Badge>
            <Badge tone="ok" className="bg-white/5 border-white/15 text-ink-100"><ShieldCheck size={12} />{db.activeGateway}</Badge>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row gap-3 mb-7">
          <div className="grow"><SearchInput value={q} onChange={setQ} placeholder="Cari produk…" /></div>
          <div className="flex gap-3">
            <Select value={cat} onChange={(e) => setCat(e.target.value)} className="w-44"><option value="">Semua kategori</option>{cats.map((cc) => <option key={cc}>{cc}</option>)}</Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-44"><option value="featured">Unggulan</option><option value="best">Terlaris</option><option value="cheap">Harga terendah</option><option value="expensive">Harga tertinggi</option></Select>
          </div>
        </div>
        {list.length === 0 ? <EmptyState icon={<Boxes size={20} />} title="Produk tidak ditemukan" desc="Coba kata kunci atau kategori lain." /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {list.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 60}>
                <div className="group rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden hover:shadow-pop hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <Link to={`/shop/${p.slug}`} className="block relative" style={{ aspectRatio: "1" }}>
                    <ProductArt p={p} className="group-hover:scale-[1.03] transition-transform duration-500" />
                    {p.stock <= 10 && <span className="absolute top-2.5 left-2.5"><Badge tone="warn">stok {p.stock}</Badge></span>}
                  </Link>
                  <div className="p-4 grow flex flex-col">
                    <p className="text-[10.5px] font-mono uppercase tracking-wider text-ink-300">{p.category}</p>
                    <Link to={`/shop/${p.slug}`} className="mt-1 font-display font-semibold text-[14px] leading-snug text-ink-900 dark:text-white hover:text-brand-700 dark:hover:text-brand-300 line-clamp-2 transition-colors">{p.name}</Link>
                    <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-brand-700 dark:text-brand-300 text-[15px]">{fmtIDR(p.price)}</span>
                      <Btn size="xs" variant="soft" onClick={() => { cartAdd(p.id); toast(`${p.name} masuk keranjang`, "ok"); }}><ShoppingCart size={13} />Keranjang</Btn>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product detail ─────────────────────────────────────────────────────────
export function ProductDetailPage() {
  const { db, toast } = useApp();
  const { slug } = useParams();
  const [qty, setQty] = useState(1);
  const nav = useNavigate();
  if (!db) return null;
  const p = db.products.find((x) => x.slug === slug && x.status === "published");
  if (!p) return <NotFoundBlock label="Produk" />;
  const related = db.products.filter((x) => x.id !== p.id && x.category === p.category && x.status === "published").slice(0, 4);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/shop" className="text-[13px] font-mono text-brand-600 dark:text-brand-300 hover:underline">← /shop</Link>
      <div className="mt-4 grid lg:grid-cols-2 gap-8 items-start">
        <Reveal><div className="rounded-2xl overflow-hidden border border-ink-100 dark:border-ink-800" style={{ aspectRatio: "1" }}><ProductArt p={p} /></div></Reveal>
        <Reveal delay={100}>
          <Badge tone="brand">{p.category}</Badge>
          <h1 className="mt-3 font-display text-2xl sm:text-[32px] font-bold tracking-tight text-ink-900 dark:text-white leading-tight">{p.name}</h1>
          <p className="mt-3 font-display text-[26px] font-bold text-brand-700 dark:text-brand-300">{fmtIDR(p.price)}</p>
          <div className="mt-2 flex gap-2 text-[11px] font-mono">
            <Badge tone="neutral"><Weight size={11} />{p.weight} gr</Badge>
            <Badge tone={p.stock > 10 ? "ok" : "warn"}>{p.stock > 0 ? `Stok ${p.stock}` : "Habis"}</Badge>
            {p.sales > 0 && <Badge tone="accent">{p.sales} terjual</Badge>}
          </div>
          <p className="mt-5 text-[15px] text-ink-500 dark:text-ink-300 leading-relaxed">{p.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border border-ink-200 dark:border-ink-700 bg-card dark:bg-ink-900">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5 text-ink-400 hover:text-bad-500"><Minus size={15} /></button>
              <span className="w-10 text-center font-mono font-bold text-ink-800 dark:text-ink-50">{qty}</span>
              <button onClick={() => setQty(Math.min(p.stock, qty + 1))} className="px-3 py-2.5 text-ink-400 hover:text-brand-600"><Plus size={15} /></button>
            </div>
            <Btn size="lg" variant="soft" disabled={p.stock === 0} onClick={() => { cartAdd(p.id, qty); toast(`${qty}× ${p.name} masuk keranjang`, "ok"); }}><ShoppingCart size={16} />+ Keranjang</Btn>
            <Btn size="lg" variant="accent" disabled={p.stock === 0} onClick={() => { cartAdd(p.id, qty); nav("/checkout"); }}>Beli Sekarang<ArrowRight size={16} /></Btn>
          </div>
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            {[{ i: <Truck size={16} />, t: "Ongkir RajaOngkir", d: "JNE, POS, TIKI real-time" }, { i: <ShieldCheck size={16} />, t: `Pembayaran ${db.activeGateway}`, d: "QRIS, VA, kartu" }, { i: <PackageCheck size={16} />, t: "Kirim dari Jakarta", d: "1-2 hari kerja" }].map((x) => (
              <div key={x.t} className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-3.5">
                <span className="text-brand-600 dark:text-brand-300">{x.i}</span>
                <p className="mt-1.5 text-[13px] font-bold text-ink-800 dark:text-ink-50">{x.t}</p>
                <p className="text-[11.5px] text-ink-400">{x.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white mb-4">Produk sejenis</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link key={r.id} to={`/shop/${r.slug}`} className="group rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden hover:shadow-lift transition-all">
                <div style={{ aspectRatio: "16/10" }}><ProductArt p={r} /></div>
                <div className="p-3"><p className="text-[13px] font-bold text-ink-800 dark:text-ink-50 line-clamp-1">{r.name}</p><p className="text-[12px] font-mono text-brand-700 dark:text-brand-300 mt-0.5">{fmtIDR(r.price)}</p></div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Cart ───────────────────────────────────────────────────────────────────
export function CartPage() {
  const { db } = useApp();
  const [, force] = useState(0);
  const refresh = () => force((x) => x + 1);
  useEffect(() => { const h = () => refresh(); window.addEventListener("kmsit:cart-changed", h); return () => window.removeEventListener("kmsit:cart-changed", h); }, []);
  if (!db) return null;
  const rows = readCart().map((r) => ({ ...r, p: db.products.find((p) => p.id === r.productId)! })).filter((r) => r.p);
  const subtotal = rows.reduce((s, r) => s + r.p.price * r.qty, 0);
  const weight = rows.reduce((s, r) => s + r.p.weight * r.qty, 0);
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">Keranjang Belanja</h1>
      {rows.length === 0 ? (
        <div className="mt-8"><EmptyState icon={<ShoppingCart size={20} />} title="Keranjang kosong" desc="Isi dengan merchandise keren dari shop." action={<Link to="/shop"><Btn size="sm">Belanja Sekarang</Btn></Link>} /></div>
      ) : (
        <div className="mt-8 grid lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
          <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 overflow-hidden">
            {rows.map((r) => (
              <div key={r.productId} className="flex items-center gap-4 px-4 py-3.5 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
                <Link to={`/shop/${r.p.slug}`} className="w-16 h-16 rounded-lg overflow-hidden shrink-0"><ProductArt p={r.p} /></Link>
                <div className="grow min-w-0">
                  <Link to={`/shop/${r.p.slug}`} className="text-sm font-bold text-ink-800 dark:text-ink-50 hover:text-brand-700 dark:hover:text-brand-300 line-clamp-1">{r.p.name}</Link>
                  <p className="text-[11.5px] font-mono text-ink-400 mt-0.5">{fmtIDR(r.p.price)} · {r.p.weight * r.qty} gr</p>
                </div>
                <div className="flex items-center rounded-lg border border-ink-200 dark:border-ink-700">
                  <button onClick={() => cartSetQty(r.productId, r.qty - 1)} className="px-2.5 py-1.5 text-ink-400 hover:text-bad-500"><Minus size={13} /></button>
                  <span className="w-8 text-center font-mono text-[13px] font-bold text-ink-800 dark:text-ink-50">{r.qty}</span>
                  <button onClick={() => cartSetQty(r.productId, Math.min(r.p.stock, r.qty + 1))} className="px-2.5 py-1.5 text-ink-400 hover:text-brand-600"><Plus size={13} /></button>
                </div>
                <span className="w-24 text-right font-mono font-bold text-sm text-ink-800 dark:text-ink-50">{fmtIDR(r.p.price * r.qty)}</span>
                <button onClick={() => cartRemove(r.productId)} className="rounded-lg p-2 text-ink-300 hover:text-bad-500 hover:bg-bad-500/10"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-5 lg:sticky lg:top-24">
            <p className="font-display font-bold text-ink-900 dark:text-white">Ringkasan</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-ink-500 dark:text-ink-300"><span>Subtotal ({rows.reduce((s, r) => s + r.qty, 0)} produk)</span><span className="font-mono">{fmtIDR(subtotal)}</span></div>
              <div className="flex justify-between text-ink-500 dark:text-ink-300"><span>Total berat</span><span className="font-mono">{(weight / 1000).toFixed(1)} kg</span></div>
              <div className="flex justify-between text-ink-500 dark:text-ink-300"><span>Ongkir</span><span className="font-mono text-brand-600 dark:text-brand-300">dihitung saat checkout</span></div>
            </div>
            <Link to="/checkout" className="block mt-5"><Btn variant="accent" size="lg" className="w-full">Lanjut ke Checkout<ArrowRight size={16} /></Btn></Link>
            <Link to="/shop" className="block mt-2 text-center text-[13px] font-bold text-brand-600 dark:text-brand-300 hover:underline">Lanjut belanja</Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Checkout: alamat → RajaOngkir → payment gateway ────────────────────────
export function CheckoutPage() {
  const { db, user, update, toast, notify, log } = useApp();
  const nav = useNavigate();
  const [addr, setAddr] = useState({ name: user?.name ?? "", phone: "", address: "", provinceId: "", cityId: "" });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [options, setOptions] = useState<ShippingOption[] | null>(null);
  const [calcBusy, setCalcBusy] = useState(false);
  const [ship, setShip] = useState<ShippingOption | null>(null);
  const [methods] = useState<string[]>(db?.activeGateway === "stripe" ? ["Kartu Kredit / Debit", "LinkAja"] : db?.activeGateway === "xendit" ? ["Virtual Account BCA", "Virtual Account Mandiri", "OVO", "DANA"] : ["QRIS", "Virtual Account BCA", "Virtual Account Mandiri", "Alfamart"]);
  const [method, setMethod] = useState("");
  const [stage, setStage] = useState<"form" | "processing" | "done">("form");
  const [placed, setPlaced] = useState<Order | null>(null);
  const [err, setErr] = useState("");
  const calcRan = useRef("");

  const cartRows = useMemo(() => (db ? readCart().map((r) => ({ ...r, p: db.products.find((p) => p.id === r.productId)! })).filter((r) => r.p) : []), [db]);
  const subtotal = cartRows.reduce((s, r) => s + r.p.price * r.qty, 0);
  const weight = cartRows.reduce((s, r) => s + r.p.weight * r.qty, 0);

  useEffect(() => { if (db) void getProvinces(db).then(setProvinces); }, [db]);
  useEffect(() => { if (db && addr.provinceId) void getCities(db, addr.provinceId).then((cs) => { setCities(cs); setAddr((a) => ({ ...a, cityId: cs[0]?.id ?? "" })); setOptions(null); setShip(null); }); }, [db, addr.provinceId]);
  useEffect(() => {
    if (!db || !addr.cityId || !addr.provinceId || cartRows.length === 0) return;
    const key = `${addr.cityId}|${weight}`;
    if (calcRan.current === key) return;
    calcRan.current = key;
    setCalcBusy(true); setOptions(null); setShip(null);
    const t = window.setTimeout(() => {
      void getShippingCosts(db, addr.cityId, addr.provinceId, weight, db.integrations.rajaongkir.couriers).then((opts) => { setOptions(opts); setShip(opts[0] ?? null); setCalcBusy(false); });
    }, 600);
    return () => window.clearTimeout(t);
  }, [db, addr.cityId, addr.provinceId, weight, cartRows.length]);

  if (!db) return null;
  if (cartRows.length === 0 && stage !== "done") {
    return <div className="max-w-xl mx-auto px-6 py-20"><EmptyState icon={<ShoppingCart size={20} />} title="Tidak ada yang di-checkout" desc="Keranjangmu kosong." action={<Link to="/shop"><Btn size="sm">Ke Shop</Btn></Link>} /></div>;
  }
  const gateway = db.gateways.find((g) => g.provider === db.activeGateway && g.enabled);
  const provinceName = provinces.find((p) => p.id === addr.provinceId)?.name ?? "";
  const cityName = cities.find((p) => p.id === addr.cityId)?.name ?? "";

  const pay = () => {
    if (!user) { toast("Masuk dulu untuk checkout", "warn"); nav("/login"); return; }
    if (!addr.name.trim() || !addr.phone.trim() || addr.address.trim().length < 8) { setErr("Lengkapi nama, telepon, dan alamat pengiriman."); return; }
    if (!ship) { setErr("Pilih layanan pengiriman terlebih dahulu."); return; }
    if (!method) { setErr("Pilih metode pembayaran."); return; }
    setErr(""); setStage("processing");
    window.setTimeout(() => {
      const items: OrderItem[] = cartRows.map((r) => ({ productId: r.p.id, name: r.p.name, price: r.p.price, qty: r.qty, weight: r.p.weight, icon: r.p.icon, hue: r.p.hue }));
      const invoice = `SHOP-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 89999))}`;
      const order: Order = {
        id: uid(), invoice, userId: user.id, items, subtotal, shippingCost: ship.cost, total: subtotal + ship.cost,
        courier: ship.courierName, courierService: ship.service, eta: ship.eta,
        address: { name: addr.name, phone: addr.phone, address: addr.address, province: provinceName, city: cityName },
        payment: { provider: db.activeGateway, method, mode: gateway?.mode ?? "sandbox" },
        status: "processing", date: new Date().toISOString(),
      };
      update((d) => {
        d.orders.unshift(order);
        d.payments.unshift({ id: uid(), invoice, studentId: user.id, courseId: "", provider: db.activeGateway, mode: gateway?.mode ?? "sandbox", method, amount: order.total, fee: Math.round(order.total * 0.01), status: "paid", date: new Date().toISOString() });
        items.forEach((it) => { const p = d.products.find((x) => x.id === it.productId); if (p) { p.stock = Math.max(0, p.stock - it.qty); p.sales += it.qty; } });
      });
      cartClear();
      db.users.filter((u) => u.role === "super_admin" || u.role === "admin").forEach((a) => notify(a.id, "Pesanan shop baru", `${invoice} dari ${user.name} — ${fmtIDR(order.total)} via ${order.courier}.`));
      log("order_created", `Pesanan shop ${invoice} (${fmtIDR(order.total)}) dibuat`);
      setPlaced(order); setStage("done");
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.65 }, colors: ["#17a58c", "#eaa93f", "#ffffff"] });
    }, 1600);
  };

  if (stage === "processing") return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <div className="mx-auto w-12 h-12 rounded-full border-[3px] border-brand-500/25 border-t-brand-500 spin" />
      <p className="mt-4 font-display font-bold text-ink-900 dark:text-white">Memproses pembayaran…</p>
      <p className="text-sm text-ink-400 mt-1 font-mono">{db.activeGateway} · {method} · {fmtIDR(subtotal + (ship?.cost ?? 0))}</p>
    </div>
  );
  if (stage === "done" && placed) return (
    <div className="max-w-lg mx-auto px-6 py-16 text-center">
      <span className="mx-auto w-16 h-16 rounded-2xl bg-ok-500/15 text-ok-500 flex items-center justify-center"><CheckCircle2 size={32} /></span>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 dark:text-white">Pesanan Berhasil!</h1>
      <p className="mt-2 text-sm text-ink-400">Invoice <b className="font-mono text-ink-700 dark:text-ink-100">{placed.invoice}</b> · {fmtIDR(placed.total)} via {placed.courier} ({placed.courierService})</p>
      <div className="mt-5 rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-4 text-left text-sm space-y-1.5">
        {placed.items.map((it) => <p key={it.productId} className="flex justify-between text-ink-600 dark:text-ink-200"><span>{it.qty}× {it.name}</span><span className="font-mono">{fmtIDR(it.price * it.qty)}</span></p>)}
        <p className="flex justify-between text-ink-600 dark:text-ink-200 border-t border-ink-100 dark:border-ink-800 pt-1.5"><span>Ongkir {placed.courier} — {placed.courierService}</span><span className="font-mono">{fmtIDR(placed.shippingCost)}</span></p>
        <p className="flex justify-between font-bold text-ink-900 dark:text-white"><span>Total</span><span className="font-mono">{fmtIDR(placed.total)}</span></p>
      </div>
      <p className="mt-4 text-[12.5px] text-ink-400">Dikirim ke: {placed.address.name}, {placed.address.address}, {placed.address.city}, {placed.address.province} · estimasi {placed.eta}</p>
      <div className="mt-6 flex justify-center gap-2">
        {user?.role === "student" && <Link to="/dashboard/student/my-orders"><Btn variant="outline">Lacak Pesanan</Btn></Link>}
        <Link to="/shop"><Btn variant="accent">Belanja Lagi</Btn></Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">Checkout</h1>
      <p className="text-[13px] font-mono text-ink-400 mt-1">RajaOngkir: mode <b className={rajaMode(db) === "live" ? "text-ok-500" : "text-warn-600 dark:text-warn-500"}>{rajaMode(db) === "live" ? "LIVE (api key aktif)" : "SIMULASI (isi API key di Integrasi untuk tarif real)"}</b></p>
      {err && <p className="mt-4 rounded-lg bg-bad-500/10 border border-bad-500/30 px-3.5 py-2.5 text-[13px] font-semibold text-bad-500">{err}</p>}
      <div className="mt-6 grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
        <div className="space-y-5">
          {/* Alamat */}
          <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-5">
            <p className="font-display font-bold text-ink-900 dark:text-white flex items-center gap-2"><MapPin size={17} className="text-brand-600 dark:text-brand-300" />1 · Alamat Pengiriman</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <Field label="Nama penerima"><TextInput value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} /></Field>
              <Field label="No. telepon"><TextInput value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} placeholder="08xxxxxxxxxx" /></Field>
              <Field label="Provinsi"><Select value={addr.provinceId} onChange={(e) => setAddr({ ...addr, provinceId: e.target.value })}><option value="">— pilih provinsi —</option>{provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
              <Field label="Kota / Kabupaten"><Select value={addr.cityId} onChange={(e) => { setAddr({ ...addr, cityId: e.target.value }); calcRan.current = ""; }} disabled={!addr.provinceId}><option value="">{addr.provinceId ? "— pilih kota —" : "pilih provinsi dulu"}</option>{cities.map((cc) => <option key={cc.id} value={cc.id}>{cc.name}</option>)}</Select></Field>
              <Field label="Alamat lengkap" className="sm:col-span-2"><TextInput value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} placeholder="Jalan, nomor, RT/RW, kecamatan, kode pos" /></Field>
            </div>
          </div>
          {/* Pengiriman */}
          <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-5">
            <p className="font-display font-bold text-ink-900 dark:text-white flex items-center gap-2"><Truck size={17} className="text-brand-600 dark:text-brand-300" />2 · Pilih Pengiriman <span className="text-[11px] font-mono text-ink-400 font-sans">({(weight / 1000).toFixed(1)} kg)</span></p>
            <div className="mt-4 grid gap-2">
              {calcBusy && <p className="text-sm text-ink-400 font-mono py-4 text-center">menghitung ongkir via RajaOngkir…</p>}
              {!calcBusy && !options && <p className="text-sm text-ink-400 py-4 text-center">Lengkapi provinsi & kota untuk menghitung ongkir.</p>}
              {options?.map((o) => (
                <button key={`${o.courier}-${o.service}`} onClick={() => setShip(o)}
                  className={cx("flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all", ship?.service === o.service && ship.courier === o.courier ? "border-brand-500 bg-brand-50 dark:bg-brand-900/25" : "border-ink-200 dark:border-ink-700 hover:border-brand-300")}>
                  <span className="flex items-center gap-3">
                    <span className={cx("w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-[12px] shrink-0", ship?.service === o.service && ship.courier === o.courier ? "bg-brand-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500")}>{o.courier.slice(0, 3).toUpperCase()}</span>
                    <span><span className="block text-sm font-bold text-ink-800 dark:text-ink-50">{o.courierName} — {o.service}</span>
                      <span className="text-[11.5px] text-ink-400">{o.description} · estimasi {o.eta}</span></span>
                  </span>
                  <span className="font-mono font-bold text-sm text-ink-800 dark:text-ink-50">{fmtIDR(o.cost)}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Pembayaran */}
          <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-5">
            <p className="font-display font-bold text-ink-900 dark:text-white flex items-center gap-2"><CreditCard size={17} className="text-brand-600 dark:text-brand-300" />3 · Pembayaran <Badge tone="warn" className="ml-1 font-mono">{db.activeGateway} · {gateway?.mode}</Badge></p>
            <div className="mt-4 grid sm:grid-cols-2 gap-2">
              {methods.map((m) => (
                <button key={m} onClick={() => setMethod(m)} className={cx("rounded-lg border px-3.5 h-11 text-sm font-semibold transition-all text-left", method === m ? "border-brand-500 bg-brand-50 dark:bg-brand-900/25 text-brand-700 dark:text-brand-300" : "border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-200 hover:border-brand-300")}>{m}</button>
              ))}
            </div>
          </div>
        </div>
        {/* Ringkasan */}
        <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-card dark:bg-ink-900 p-5 lg:sticky lg:top-24">
          <p className="font-display font-bold text-ink-900 dark:text-white">Ringkasan Pesanan</p>
          <div className="mt-3 space-y-2.5">
            {cartRows.map((r) => (
              <div key={r.productId} className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0"><ProductArt p={r.p} /></div>
                <span className="grow text-[13px] font-semibold text-ink-700 dark:text-ink-100 truncate">{r.qty}× {r.p.name}</span>
                <span className="font-mono text-[12.5px] text-ink-500 dark:text-ink-300">{fmtIDR(r.p.price * r.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 text-sm border-t border-dashed border-ink-200 dark:border-ink-700 pt-3">
            <p className="flex justify-between text-ink-500 dark:text-ink-300"><span>Subtotal</span><span className="font-mono">{fmtIDR(subtotal)}</span></p>
            <p className="flex justify-between text-ink-500 dark:text-ink-300"><span>Ongkir {ship ? `${ship.courierName} ${ship.service}` : "—"}</span><span className="font-mono">{ship ? fmtIDR(ship.cost) : "…"}</span></p>
            <p className="flex justify-between font-bold text-[16px] text-ink-900 dark:text-white border-t border-ink-200 dark:border-ink-700 pt-2"><span>Total</span><span className="font-mono">{fmtIDR(subtotal + (ship?.cost ?? 0))}</span></p>
          </div>
          <Btn variant="accent" size="lg" className="w-full mt-5" onClick={pay} disabled={!user}>
            {user ? <>Bayar {fmtIDR(subtotal + (ship?.cost ?? 0))}<ArrowRight size={16} /></> : "Masuk untuk Checkout"}
          </Btn>
          {!user && <Link to="/login" className="block mt-2 text-center text-[13px] font-bold text-brand-600 dark:text-brand-300 hover:underline">Masuk / daftar →</Link>}
          <p className="mt-3 text-[11px] text-ink-400 leading-relaxed text-center">Diproses PaymentService → {db.activeGateway}. Stok & pesanan dicatat di database.</p>
        </div>
      </div>
    </div>
  );
}
