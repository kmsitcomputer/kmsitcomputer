import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Newspaper, BookOpen, FileStack, FolderOpen, GraduationCap, HelpCircle,
  Users, UserCog, Award, Briefcase, Home, Info, Menu as MenuIcon, Wallet, CreditCard, ArrowLeftRight,
  Banknote, Youtube, Video, CalendarCheck, Landmark, Globe, Settings, Search as SearchIcon, Bell,
  LogOut, Moon, Sun, ChevronDown, ChevronRight, X, Shield, Languages, Activity, Terminal, PanelLeft, Network,
  ShoppingBag, Package, ShoppingCart, Truck,
} from "lucide-react";
import { useCartCount } from "../pages/shop";
import { useApp } from "../lib/store";
import { ago, type MenuItem, type Role } from "../lib/db";
import { Avatar, Btn, cx, Logo, SearchInput, useOutside } from "./ui";

export const isExternal = (url: string) => /^https?:\/\//.test(url);

function SmartLink({ to, children, className, onClick }: { to: string; children: React.ReactNode; className?: string; onClick?: () => void }) {
  if (isExternal(to) || to === "#") return <a href={isExternal(to) ? to : undefined} target={isExternal(to) ? "_blank" : undefined} rel="noreferrer" className={className} onClick={onClick}>{children}</a>;
  return <Link to={to} className={className} onClick={onClick}>{children}</Link>;
}

// ─── Theme & language toggles ───────────────────────────────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useApp();
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Ganti tema"
      className="rounded-lg p-2 text-ink-400 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
function LangToggle({ dark }: { dark?: boolean }) {
  const { lang, setLang } = useApp();
  return (
    <button onClick={() => setLang(lang === "id" ? "en" : "id")} title="Bahasa / Language"
      className={cx("rounded-lg px-2 py-1.5 font-mono text-[11px] font-bold tracking-wider transition-colors",
        dark ? "text-ink-300 hover:text-white hover:bg-white/5" : "text-ink-400 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-ink-100 dark:hover:bg-ink-800")}>
      <Languages size={13} className="inline mr-1 -mt-0.5" />{lang.toUpperCase()}
    </button>
  );
}

// ─── Public header ──────────────────────────────────────────────────────────
function NavItem({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  if (item.children.length) {
    return (
      <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-ink-600 dark:text-ink-200 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
          {item.label}<ChevronDown size={13} className={cx("transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="absolute left-0 top-full pt-1 w-48 z-40">
            <div className="rounded-xl border border-ink-100 dark:border-ink-700 bg-card dark:bg-ink-850 shadow-pop p-1.5">
              {item.children.map((c) => (
                <SmartLink key={c.id} to={c.url} className="block px-3 py-2 rounded-lg text-sm font-semibold text-ink-600 dark:text-ink-200 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-ink-800 dark:hover:text-brand-300 transition-colors">{c.label}</SmartLink>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  return <SmartLink to={item.url} className="px-3 py-2 rounded-lg text-sm font-semibold text-ink-600 dark:text-ink-200 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">{item.label}</SmartLink>;
}

function CartButton() {
  const n = useCartCount();
  return (
    <Link to="/cart" title="Keranjang belanja" className="relative rounded-lg p-2 text-ink-500 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
      <ShoppingCart size={18} />
      {n > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-accent-500 text-ink-950 text-[10px] font-bold flex items-center justify-center shadow-sm">{n > 99 ? "99+" : n}</span>}
    </Link>
  );
}

export function PublicShell({ children }: { children?: React.ReactNode }) {
  const { db, user, t, logout } = useApp();
  const [mobile, setMobile] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const profileRef = useOutside(() => setProfOpen(false));
  const [profOpen, setProfOpen] = useState(false);
  if (!db) return null;
  const headerMenu = db.menus.find((m) => m.location === "header");
  const footerMenu = db.menus.find((m) => m.location === "footer");
  const dashPath = `/dashboard/${user?.role === "super_admin" ? "super-admin" : user?.role}`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-ink-100 dark:border-ink-800 bg-paper/85 dark:bg-ink-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-2">
          <Link to="/"><Logo name={db.settings.siteName} logoUrl={db.settings.logoUrl || undefined} /></Link>
          <nav className="hidden lg:flex items-center gap-0.5 ml-6">
            {headerMenu?.items.map((it) => <NavItem key={it.id} item={it} />)}
          </nav>
          <div className="grow" />
          <button onClick={() => nav("/courses?focus=1")} title={t("act.search")}
            className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-ink-200 dark:border-ink-700 text-sm text-ink-400 hover:border-brand-400 transition-colors bg-card dark:bg-ink-900">
            <SearchIcon size={14} /><span className="pr-4">{t("act.search")}</span>
          </button>
          <CartButton />
          <LangToggle />
          <ThemeToggle />
          {user ? (
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfOpen(!profOpen)} className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
                <Avatar user={user} size={30} /><ChevronDown size={13} className="text-ink-400 hidden sm:block" />
              </button>
              {profOpen && (
                <div className="absolute right-0 top-full pt-2 w-56 z-40">
                  <div className="rounded-xl border border-ink-100 dark:border-ink-700 bg-card dark:bg-ink-850 shadow-pop p-1.5">
                    <div className="px-3 py-2 border-b border-ink-100 dark:border-ink-800 mb-1">
                      <p className="text-sm font-bold text-ink-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-ink-400 truncate">{user.email}</p>
                    </div>
                    <Link to={dashPath} onClick={() => setProfOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-ink-600 dark:text-ink-200 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-ink-800"><LayoutDashboard size={15} />{t("nav.dashboard")}</Link>
                    <button onClick={() => { logout(); setProfOpen(false); nav("/"); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-bad-500 hover:bg-bad-500/10"><LogOut size={15} />{t("nav.logout")}</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="hidden sm:inline-flex"><Btn variant="ghost" size="sm">{t("nav.login")}</Btn></Link>
              <Link to="/register"><Btn size="sm">{t("nav.register")}</Btn></Link>
            </div>
          )}
          <button className="lg:hidden rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800" onClick={() => setMobile(true)}><MenuIcon size={20} /></button>
        </div>
      </header>

      {mobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setMobile(false)} />
          <div className="drawer-in absolute right-0 top-0 h-full w-72 bg-card dark:bg-ink-900 border-l border-ink-100 dark:border-ink-800 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <Logo name={db.settings.siteName} logoUrl={db.settings.logoUrl || undefined} />
              <button onClick={() => setMobile(false)} className="p-2 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 rounded-lg"><X size={18} /></button>
            </div>
            {headerMenu?.items.map((it) => (
              <div key={it.id} className="mb-1">
                {it.children.length ? (
                  <div>
                    <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink-300">{it.label}</p>
                    {it.children.map((c) => <SmartLink key={c.id} to={c.url} onClick={() => setMobile(false)} className="block px-4 py-2 rounded-lg text-sm font-semibold text-ink-600 dark:text-ink-200 hover:bg-brand-50 dark:hover:bg-ink-800">{c.label}</SmartLink>)}
                  </div>
                ) : (
                  <SmartLink to={it.url} onClick={() => setMobile(false)} className="block px-3 py-2.5 rounded-lg text-sm font-bold text-ink-700 dark:text-ink-100 hover:bg-brand-50 dark:hover:bg-ink-800">{it.label}</SmartLink>
                )}
              </div>
            ))}
            {!user && <div className="mt-4 grid gap-2"><Link to="/login" onClick={() => setMobile(false)}><Btn variant="outline" className="w-full">{t("nav.login")}</Btn></Link><Link to="/register" onClick={() => setMobile(false)}><Btn className="w-full">{t("nav.register")}</Btn></Link></div>}
          </div>
        </div>
      )}

      <main className="grow">{loc.pathname === "/" && <div className="pointer-events-none fixed inset-0 grid-bg opacity-60 -z-10" />}{children ?? <Outlet />}</main>

      <footer className="mt-20 bg-ink-900 dark:bg-ink-950 border-t border-ink-800 text-ink-200 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1.2fr_1fr]">
          <div>
            <Logo name={db.settings.siteName} dark logoUrl={db.settings.logoUrl || undefined} />
            <p className="mt-4 text-sm text-ink-300 leading-relaxed max-w-xs">{db.settings.description}</p>
            <div className="flex gap-2 mt-5">
              {Object.entries(db.settings.social).map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-500 hover:text-white flex items-center justify-center transition-colors text-[11px] font-mono font-bold uppercase">{k.slice(0, 2)}</a>
              ))}
            </div>
          </div>
          <div>
            <p className="font-display font-semibold text-white mb-4">Navigasi</p>
            {footerMenu?.items.map((it) => <SmartLink key={it.id} to={it.url} className="block py-1.5 text-sm text-ink-300 hover:text-brand-300 transition-colors">{it.label}</SmartLink>)}
          </div>
          <div>
            <p className="font-display font-semibold text-white mb-4">Kontak & Lokasi</p>
            <div className="rounded-xl overflow-hidden border border-ink-700 mb-3" style={{ height: 120 }}>
              <iframe title={db.settings.mapLabel || "Lokasi kami"} loading="lazy"
                src={`https://maps.google.com/maps?q=${db.settings.mapLat},${db.settings.mapLng}&z=15&output=embed`}
                className="w-full h-full border-0 grayscale-[35%] contrast-[1.05]" />
            </div>
            <p className="text-[13px] text-ink-300 leading-relaxed">{db.settings.address}</p>
            <a href={`https://www.google.com/maps?q=${db.settings.mapLat},${db.settings.mapLng}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-[12px] font-bold text-brand-300 hover:text-brand-200">Buka di Google Maps →</a>
            <p className="text-[13px] text-ink-300 mt-2">{db.settings.email}</p>
            <p className="text-[13px] text-ink-300 mt-0.5">{db.settings.phone}</p>
          </div>
          <div>
            <p className="font-display font-semibold text-white mb-4">Platform</p>
            <Link to="/verify-certificate" className="block py-1.5 text-sm text-ink-300 hover:text-brand-300 transition-colors">Verifikasi Sertifikat</Link>
            <Link to="/courses" className="block py-1.5 text-sm text-ink-300 hover:text-brand-300 transition-colors">Semua Kelas</Link>
            <Link to="/login" className="block py-1.5 text-sm text-ink-300 hover:text-brand-300 transition-colors">Masuk</Link>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-ink-400">
              <span className="w-2 h-2 rounded-full bg-ok-500 pulse-dot" />SEMUA SISTEM NORMAL
            </div>
          </div>
        </div>
        <div className="relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-400">
            <span>{db.settings.footerText}</span>
            <span className="font-mono">v1.0.0 · React + Laravel API + MySQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Dashboard shell ────────────────────────────────────────────────────────
export interface DashItem { to: string; labelKey: string; icon: React.ReactNode; end?: boolean; }
export interface DashGroup { group: string | null; items: DashItem[]; }

export function dashMenu(role: Role): DashGroup[] {
  const g = (group: string | null, items: DashItem[]): DashGroup => ({ group, items });
  if (role === "super_admin") return [
    g(null, [{ to: "", labelKey: "dash.dashboard", icon: <LayoutDashboard size={17} />, end: true }]),
    g("dash.content", [
      { to: "articles", labelKey: "dash.articles", icon: <FileText size={17} /> },
      { to: "news", labelKey: "dash.news", icon: <Newspaper size={17} /> },
      { to: "tutorials", labelKey: "dash.tutorials", icon: <BookOpen size={17} /> },
      { to: "pages", labelKey: "dash.pages", icon: <FileStack size={17} /> },
      { to: "media", labelKey: "dash.media", icon: <FolderOpen size={17} /> },
    ]),
    g("dash.lms", [
      { to: "courses", labelKey: "dash.courses", icon: <GraduationCap size={17} /> },
      { to: "quizzes", labelKey: "dash.quizzes", icon: <HelpCircle size={17} /> },
      { to: "students", labelKey: "dash.students", icon: <Users size={17} /> },
      { to: "instructors", labelKey: "dash.instructors", icon: <UserCog size={17} /> },
      { to: "certificates", labelKey: "dash.certificates", icon: <Award size={17} /> },
    ]),
    g("dash.program", [{ to: "programs", labelKey: "dash.program", icon: <Briefcase size={17} /> }]),
    g("dash.cms", [
      { to: "home-cms", labelKey: "dash.home", icon: <Home size={17} /> },
      { to: "about-cms", labelKey: "dash.about", icon: <Info size={17} /> },
      { to: "org-cms", labelKey: "dash.org", icon: <Network size={17} /> },
      { to: "menus", labelKey: "dash.menus", icon: <MenuIcon size={17} /> },
    ]),
    g("dash.shop", [
      { to: "products", labelKey: "dash.products", icon: <ShoppingBag size={17} /> },
      { to: "orders", labelKey: "dash.orders", icon: <Package size={17} /> },
    ]),
    g("dash.transactions", [
      { to: "payments", labelKey: "dash.payments", icon: <CreditCard size={17} /> },
      { to: "transactions", labelKey: "dash.courseTx", icon: <ArrowLeftRight size={17} /> },
      { to: "withdrawals", labelKey: "dash.withdrawals", icon: <Banknote size={17} /> },
    ]),
    g("dash.integration", [
      { to: "youtube", labelKey: "dash.youtube", icon: <Youtube size={17} /> },
      { to: "zoom", labelKey: "dash.zoom", icon: <Video size={17} /> },
      { to: "gmeet", labelKey: "dash.gmeet", icon: <CalendarCheck size={17} /> },
      { to: "rajaongkir", labelKey: "dash.rajaongkir", icon: <Truck size={17} /> },
      { to: "gateway", labelKey: "dash.gateway", icon: <Landmark size={17} /> },
    ]),
    g("dash.settings", [
      { to: "website", labelKey: "dash.website", icon: <Settings size={17} /> },
      { to: "seo", labelKey: "dash.seo", icon: <SearchIcon size={17} /> },
      { to: "language", labelKey: "dash.language", icon: <Globe size={17} /> },
      { to: "users", labelKey: "dash.users", icon: <Users size={17} /> },
      { to: "roles", labelKey: "dash.roles", icon: <Shield size={17} /> },
      { to: "system", labelKey: "dash.system", icon: <Terminal size={17} /> },
      { to: "activity", labelKey: "dash.activity", icon: <Activity size={17} /> },
    ]),
  ];
  if (role === "admin") return [
    g(null, [{ to: "", labelKey: "dash.dashboard", icon: <LayoutDashboard size={17} />, end: true }]),
    g("dash.content", [
      { to: "articles", labelKey: "dash.articles", icon: <FileText size={17} /> },
      { to: "news", labelKey: "dash.news", icon: <Newspaper size={17} /> },
      { to: "tutorials", labelKey: "dash.tutorials", icon: <BookOpen size={17} /> },
      { to: "pages", labelKey: "dash.pages", icon: <FileStack size={17} /> },
      { to: "media", labelKey: "dash.media", icon: <FolderOpen size={17} /> },
    ]),
    g("dash.lms", [
      { to: "courses", labelKey: "dash.courses", icon: <GraduationCap size={17} /> },
      { to: "quizzes", labelKey: "dash.quizzes", icon: <HelpCircle size={17} /> },
      { to: "students", labelKey: "dash.students", icon: <Users size={17} /> },
      { to: "instructors", labelKey: "dash.instructors", icon: <UserCog size={17} /> },
      { to: "certificates", labelKey: "dash.certificates", icon: <Award size={17} /> },
    ]),
    g("dash.program", [{ to: "programs", labelKey: "dash.program", icon: <Briefcase size={17} /> }]),
    g("dash.cms", [
      { to: "home-cms", labelKey: "dash.home", icon: <Home size={17} /> },
      { to: "about-cms", labelKey: "dash.about", icon: <Info size={17} /> },
      { to: "org-cms", labelKey: "dash.org", icon: <Network size={17} /> },
    ]),
    g("dash.shop", [
      { to: "products", labelKey: "dash.products", icon: <ShoppingBag size={17} /> },
      { to: "orders", labelKey: "dash.orders", icon: <Package size={17} /> },
    ]),
    g("dash.transactions", [
      { to: "payments", labelKey: "dash.payments", icon: <CreditCard size={17} /> },
      { to: "transactions", labelKey: "dash.courseTx", icon: <ArrowLeftRight size={17} /> },
    ]),
    g(null, [{ to: "activity", labelKey: "dash.activity", icon: <Activity size={17} /> }]),
  ];
  if (role === "instructor") return [
    g(null, [{ to: "", labelKey: "dash.dashboard", icon: <LayoutDashboard size={17} />, end: true }]),
    g("dash.lms", [
      { to: "courses", labelKey: "dash.courses", icon: <GraduationCap size={17} /> },
      { to: "quizzes", labelKey: "dash.quizzes", icon: <HelpCircle size={17} /> },
      { to: "students", labelKey: "dash.students", icon: <Users size={17} /> },
      { to: "certificates", labelKey: "dash.certificates", icon: <Award size={17} /> },
    ]),
    g("dash.transactions", [{ to: "wallet", labelKey: "dash.wallet", icon: <Wallet size={17} /> }]),
  ];
  return [
    g(null, [{ to: "", labelKey: "dash.dashboard", icon: <LayoutDashboard size={17} />, end: true }]),
    g("dash.lms", [
      { to: "my-courses", labelKey: "dash.courses", icon: <GraduationCap size={17} /> },
      { to: "grades", labelKey: "dash.quizzes", icon: <HelpCircle size={17} /> },
      { to: "certificates", labelKey: "dash.certificates", icon: <Award size={17} /> },
    ]),
    g("dash.transactions", [{ to: "payments", labelKey: "dash.payments", icon: <CreditCard size={17} /> }]),
    g("dash.shop", [{ to: "my-orders", labelKey: "dash.myOrders", icon: <Package size={17} /> }]),
  ];
}

const rolePath: Record<Role, string> = { super_admin: "super-admin", admin: "admin", instructor: "instructor", student: "student" };
export const roleBase = (r: Role) => `/dashboard/${rolePath[r]}`;

export function DashShell({ children }: { children?: React.ReactNode }) {
  const { db, user, t, logout, lang, update } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const [side, setSide] = useState(false);
  const [bell, setBell] = useState(false);
  const [prof, setProf] = useState(false);
  const bellRef = useOutside(() => setBell(false));
  const profRef = useOutside(() => setProf(false));
  if (!db || !user) return null;

  const base = roleBase(user.role);
  const groups = dashMenu(user.role);
  const seg = loc.pathname.replace(base, "").replace(/^\//, "");
  const flat = groups.flatMap((g) => g.items);
  const current = flat.find((i) => (i.end ? seg === "" : seg.startsWith(i.to)));
  const notices = db.notifications.filter((n) => n.userId === user.id);
  const unread = notices.filter((n) => !n.read).length;

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center px-5 border-b border-white/5 shrink-0">
        <Link to="/"><Logo name={db.settings.siteName} dark logoUrl={db.settings.logoUrl || undefined} /></Link>
      </div>
      <div className="grow overflow-y-auto px-3 py-4">
        {groups.map((g, gi) => (
          <div key={gi} className="mb-5">
            {g.group && <p className="px-3 mb-1.5 text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-ink-500">{t(g.group)}</p>}
            {g.items.map((it) => {
              const active = it.end ? seg === "" : seg === it.to || seg.startsWith(it.to + "/");
              return (
                <Link key={it.to} to={`${base}/${it.to}`} onClick={() => setSide(false)}
                  className={cx("group flex items-center gap-2.5 px-3 h-9.5 rounded-lg text-[13.5px] font-semibold mb-0.5 transition-all relative",
                    active ? "bg-brand-500/15 text-brand-300" : "text-ink-300 hover:text-white hover:bg-white/5")}>
                  {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-brand-400" />}
                  <span className={cx(active ? "text-brand-300" : "text-ink-400 group-hover:text-brand-300 transition-colors")}>{it.icon}</span>
                  {t(it.labelKey)}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-white/5 shrink-0">
        <button onClick={() => { logout(); nav("/"); }} className="w-full flex items-center gap-2.5 px-3 h-10 rounded-lg text-[13.5px] font-semibold text-ink-300 hover:text-bad-500 hover:bg-bad-500/10 transition-colors">
          <LogOut size={16} />{t("nav.logout")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-paper dark:bg-ink-950">
      <aside className="hidden lg:block w-60 shrink-0 bg-ink-900 dark:bg-ink-950 border-r border-ink-800 sticky top-0 h-screen">{sidebar}</aside>
      {side && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/70" onClick={() => setSide(false)} />
          <aside className="drawer-in absolute left-0 top-0 h-full w-64 bg-ink-900">{sidebar}</aside>
        </div>
      )}

      <div className="grow flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-card/85 dark:bg-ink-900/85 backdrop-blur-md border-b border-ink-100 dark:border-ink-800 flex items-center gap-2 px-4 sm:px-6">
          <button className="lg:hidden rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800" onClick={() => setSide(true)}><PanelLeft size={18} /></button>
          <div className="flex items-center gap-1.5 text-sm min-w-0">
            <Link to={base} className="text-ink-400 hover:text-brand-600 dark:hover:text-brand-300 font-semibold shrink-0">{t("nav.dashboard")}</Link>
            {current && <><ChevronRight size={13} className="text-ink-300 shrink-0" /><span className="font-bold text-ink-800 dark:text-white truncate">{t(current.labelKey)}</span></>}
          </div>
          <div className="grow" />
          <div className="hidden md:block w-56">
            <SearchInput value="" onChange={(v) => v && nav(`/courses?q=${encodeURIComponent(v)}`)} placeholder={t("act.search")} />
          </div>
          <LangToggle />
          <ThemeToggle />
          <div className="relative" ref={bellRef}>
            <button onClick={() => setBell(!bell)} className="relative rounded-lg p-2 text-ink-400 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
              <Bell size={17} />
              {unread > 0 && <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-bad-500 text-white text-[9px] font-bold flex items-center justify-center">{unread}</span>}
            </button>
            {bell && (
              <div className="absolute right-0 top-full pt-2 w-80 z-40">
                <div className="rounded-xl border border-ink-100 dark:border-ink-700 bg-card dark:bg-ink-850 shadow-pop overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-800">
                    <p className="font-display font-semibold text-sm">Notifikasi</p>
                    <button className="text-xs font-bold text-brand-600 dark:text-brand-300 hover:underline"
                      onClick={() => update((d) => { d.notifications.forEach((n) => { if (n.userId === user.id) n.read = true; }); })}>
                      Tandai dibaca
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notices.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-400">Belum ada notifikasi.</p>}
                    {notices.slice(0, 12).map((n) => (
                      <div key={n.id} className={cx("px-4 py-3 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0", !n.read && "bg-brand-50/50 dark:bg-brand-900/15")}>
                        <div className="flex items-center gap-2"><span className={cx("w-1.5 h-1.5 rounded-full shrink-0", n.read ? "bg-ink-200 dark:bg-ink-700" : "bg-brand-500 pulse-dot")} /><p className="text-[13px] font-bold text-ink-800 dark:text-ink-50">{n.title}</p></div>
                        <p className="text-xs text-ink-500 dark:text-ink-300 mt-1 leading-relaxed">{n.body}</p>
                        <p className="text-[10px] font-mono text-ink-300 mt-1">{ago(n.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={profRef}>
            <button onClick={() => setProf(!prof)} className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
              <Avatar user={user} size={30} />
              <span className="hidden sm:block text-left">
                <span className="block text-[13px] font-bold leading-4 text-ink-800 dark:text-white">{user.name.split(" ")[0]}</span>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-400">{db.roles.find((r) => r.role === user.role)?.label}</span>
              </span>
            </button>
            {prof && (
              <div className="absolute right-0 top-full pt-2 w-52 z-40">
                <div className="rounded-xl border border-ink-100 dark:border-ink-700 bg-card dark:bg-ink-850 shadow-pop p-1.5">
                  <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-ink-600 dark:text-ink-200 hover:bg-brand-50 dark:hover:bg-ink-800"><Home size={15} />Lihat Situs</Link>
                  <button onClick={() => { logout(); nav("/"); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-bad-500 hover:bg-bad-500/10"><LogOut size={15} />{t("nav.logout")}</button>
                </div>
              </div>
            )}
          </div>
        </header>

        {db.settings.maintenanceMode && user.role !== "super_admin" && (
          <div className="bg-warn-500/15 border-b border-warn-500/30 px-6 py-2 text-[13px] font-semibold text-warn-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-warn-500 pulse-dot" />Mode pemeliharaan aktif — pengunjung publik melihat halaman maintenance.
          </div>
        )}

        <main className="grow p-4 sm:p-6 max-w-[1400px] w-full mx-auto">
          {children ?? <Outlet />}
        </main>
        <footer className="px-6 py-4 text-[11px] font-mono text-ink-300 border-t border-ink-100 dark:border-ink-800">
          {db.settings.siteName} · {new Date().getFullYear()} · zona waktu {db.settings.timezone} · bahasa {lang.toUpperCase()}
        </footer>
      </div>
    </div>
  );
}


