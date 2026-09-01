// ─── KMSIT Computer — data layer ────────────────────────────────────────────
// Simulated MySQL persistence (localStorage) mirroring the Laravel schema:
// users, roles/permissions, courses, modules, lessons, quizzes, attempts,
// certificates, payments, instructor wallets, withdrawals, CMS entities,
// home_sections, menus, media, integrations, notifications, activity_logs.

export type Role = "super_admin" | "admin" | "instructor" | "student";
export type Lang = "id" | "en";
export type ContentStatus = "draft" | "published" | "scheduled" | "archived";

export interface User {
  id: string; name: string; email: string; password: string; role: Role;
  color: string; phone?: string; bio?: string; joined: string;
  status: "active" | "suspended"; bank?: string; account?: string;
}
export interface RolePerm { role: Role; label: string; permissions: string[]; }
export interface Category { id: string; name: string; slug: string; color: string; }
export interface SeoMeta { title: string; description: string; keywords: string; }
export interface Settings {
  siteName: string; slogan: string; description: string; email: string; phone: string;
  whatsapp: string; address: string; timezone: string; language: Lang; currency: string;
  maintenanceMode: boolean; registrationOpen: boolean; footerText: string;
  logoUrl: string; faviconUrl: string; mapLat: string; mapLng: string; mapLabel: string;
  brandColor: string; accentColor: string;
  social: { instagram: string; youtube: string; facebook: string; github: string };
  seo: SeoMeta;
}
export interface OrgUnit { id: string; name: string; tagline: string; level: "board" | "division" | "team"; order: number; }
export interface OrgMember { id: string; unitId: string; name: string; position: string; email?: string; order: number; }
export type Provider = "tripay" | "xendit" | "stripe";
export interface PaymentGateway {
  provider: Provider; enabled: boolean; mode: "sandbox" | "production";
  apiKey: string; secretKey: string; merchantId: string; webhookUrl: string;
}
export interface Integrations {
  youtube: { enabled: boolean; channelId: string; apiKey: string };
  zoom: { enabled: boolean; accountId: string; clientId: string; clientSecret: string };
  gmeet: { enabled: boolean; clientId: string; clientSecret: string };
  rajaongkir: { enabled: boolean; apiKey: string; originProvinceId: string; originCityId: string; couriers: string[] };
}
export interface Question {
  id: string; type: "single" | "boolean" | "multiple"; text: string;
  options: string[]; correct: number[]; points: number;
}
export interface Quiz {
  id: string; courseId: string; lessonId: string; title: string;
  timeLimit: number; passingGrade: number; attemptLimit: number; randomize: boolean;
  questions: Question[];
}
export interface Lesson {
  id: string; title: string; type: "video" | "text" | "file" | "quiz";
  youtubeId?: string; content?: string; fileName?: string; duration: string; free?: boolean;
}
export interface Module { id: string; title: string; lessons: Lesson[]; }
export interface Course {
  id: string; slug: string; title: string; description: string; longDescription: string;
  thumbnail: string; categoryId: string; instructorId: string; price: number;
  level: "Pemula" | "Menengah" | "Lanjutan"; status: "published" | "draft";
  rating: number; tags: string[]; modules: Module[]; certificateEnabled: boolean; createdAt: string;
}
export interface Enrollment {
  id: string; courseId: string; studentId: string; date: string;
  completedLessons: string[]; status: "active" | "completed";
}
export interface QuizAttempt {
  id: string; quizId: string; courseId: string; studentId: string;
  score: number; total: number; percent: number; passed: boolean; date: string;
}
export interface Certificate {
  id: string; code: string; studentId: string; courseId: string;
  instructorName: string; issuedAt: string; template: "classic" | "modern";
}
export interface Article {
  id: string; slug: string; title: string; excerpt: string; content: string;
  cover?: string; hue: number; categoryId: string; tags: string[]; authorId: string;
  status: ContentStatus; publishedAt: string; seoTitle: string; seoDesc: string; views: number;
}
export interface NewsItem {
  id: string; slug: string; title: string; excerpt: string; content: string;
  hue: number; categoryId: string; authorId: string; status: ContentStatus;
  publishedAt: string; seoTitle: string; seoDesc: string; views: number;
}
export interface Tutorial {
  id: string; slug: string; title: string; description: string; content: string;
  hue: number; categoryId: string; tags: string[]; authorId: string; youtubeId?: string;
  status: ContentStatus; publishedAt: string; views: number;
}
export interface Program {
  id: string; slug: string; title: string; description: string; hue: number;
  categoryId: string; duration: string; courseIds: string[]; status: ContentStatus;
}
export interface Page {
  id: string; slug: string; title: string; content: string; status: ContentStatus;
  seoTitle: string; seoDesc: string;
}
export type SectionType = "hero" | "featured" | "latest" | "categories" | "tutorials" |
  "articles" | "news" | "programs" | "instructors" | "testimonials" | "stats" | "cta";
export interface HomeSection {
  id: string; type: SectionType; title: string; subtitle: string;
  enabled: boolean; order: number; settings: Record<string, string>;
}
export interface MenuItem { id: string; label: string; url: string; children: MenuItem[]; }
export interface Menu { id: string; name: string; location: "header" | "footer"; items: MenuItem[]; }
export interface MediaItem { id: string; name: string; type: string; size: number; url: string; date: string; }
export interface Payment {
  id: string; invoice: string; studentId: string; courseId: string; provider: Provider;
  mode: "sandbox" | "production"; method: string; amount: number; fee: number;
  status: "pending" | "paid" | "failed" | "expired"; date: string;
}
export interface WalletTx {
  id: string; instructorId: string; type: "earning" | "withdrawal";
  amount: number; note: string; date: string; paymentId?: string;
}
export interface Withdrawal {
  id: string; instructorId: string; amount: number; bank: string; account: string; holder: string;
  status: "pending" | "processing" | "approved" | "rejected" | "completed"; date: string; note?: string;
}
export interface Notice { id: string; userId: string; title: string; body: string; date: string; read: boolean; }
export interface ActivityLog { id: string; userId: string; userName: string; action: string; detail: string; date: string; }
export interface Testimonial { id: string; name: string; role: string; text: string; rating: number; }

export type ProductIcon = "tshirt" | "keyboard" | "mouse" | "book" | "bottle" | "backpack" | "mousepad" | "sticker";
export interface Product {
  id: string; slug: string; name: string; category: string; price: number; weight: number; // gram
  stock: number; sales: number; description: string; hue: number; icon: ProductIcon;
  status: "published" | "draft"; createdAt: string;
}
export interface OrderItem { productId: string; name: string; price: number; qty: number; weight: number; icon: ProductIcon; hue: number; }
export interface Order {
  id: string; invoice: string; userId: string; items: OrderItem[];
  subtotal: number; shippingCost: number; total: number;
  courier: string; courierService: string; eta: string;
  address: { name: string; phone: string; address: string; province: string; city: string };
  payment: { provider: Provider; method: string; mode: "sandbox" | "production" } | null;
  status: "pending_payment" | "processing" | "packed" | "shipped" | "completed" | "cancelled";
  date: string;
}

export interface DB {
  version: number; installed: boolean; installedAt?: string; locked: boolean;
  settings: Settings; gateways: PaymentGateway[]; activeGateway: Provider;
  integrations: Integrations; users: User[]; roles: RolePerm[];
  categories: { course: Category[]; article: Category[]; news: Category[]; tutorial: Category[]; program: Category[] };
  courses: Course[]; quizzes: Quiz[]; enrollments: Enrollment[]; attempts: QuizAttempt[];
  certificates: Certificate[]; articles: Article[]; news: NewsItem[]; tutorials: Tutorial[];
  programs: Program[]; pages: Page[]; homeSections: HomeSection[]; menus: Menu[];
  media: MediaItem[]; payments: Payment[]; walletTx: WalletTx[]; withdrawals: Withdrawal[];
  notifications: Notice[]; logs: ActivityLog[]; testimonials: Testimonial[];
  orgUnits: OrgUnit[]; orgMembers: OrgMember[];
  products: Product[]; orders: Order[];
}

// ─── helpers ────────────────────────────────────────────────────────────────
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

// ─── tema warna runtime ─────────────────────────────────────────────────────
export function hexToHsl(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0; const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60); if (h < 0) h += 360;
  }
  return [h, Math.round(s * 100), Math.round(l * 100)];
}
export function isValidHex(v: string) { return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v); }
/** Mengubah satu warna menjadi skala 50–950 (warna input ≈ 500). */
export function shadeScale(hex: string): Record<string, string> {
  const [h, s, l] = hexToHsl(hex);
  const cl = (x: number) => Math.max(3, Math.min(97, x));
  const st = (ll: number, ss = s) => `hsl(${h} ${Math.round(Math.max(18, Math.min(96, ss)))}% ${cl(ll)}%)`;
  return {
    50: st(l + 54, s * 0.5 + 30), 100: st(l + 45, s * 0.65 + 20), 200: st(l + 34), 300: st(l + 20), 400: st(l + 9),
    500: st(l), 600: st(l - 8), 700: st(l - 14), 800: st(l - 20), 900: st(l - 26), 950: st(l - 34, s * 0.8),
  };
}
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const fmtIDR = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
export const fmtNum = (n: number) => new Intl.NumberFormat("id-ID").format(n);
export const fmtDate = (iso: string, lang: Lang = "id") =>
  new Date(iso).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" });
export const fmtDateTime = (iso: string, lang: Lang = "id") =>
  new Date(iso).toLocaleString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
export const ago = (iso: string) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}d lalu`; if (s < 3600) return `${Math.floor(s / 60)}m lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)}j lalu`; return `${Math.floor(s / 86400)}h lalu`;
};
export const ytId = (url: string) => {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : /^[\w-]{6,}$/.test(url.trim()) ? url.trim() : "";
};
export const ytThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const PLATFORM_FEE = 0.15;
export const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString();

export const PERMISSIONS = [
  "manage_settings", "manage_users", "manage_roles", "manage_content", "manage_courses",
  "manage_students", "manage_instructors", "manage_payments", "manage_withdrawals",
  "manage_integrations", "manage_cms", "manage_media", "view_reports",
] as const;

// ─── seed ───────────────────────────────────────────────────────────────────
const IMG = {
  web: "https://image.qwenlm.ai/generated-images/7f74ef22-6683-4ca7-9c23-283e1c589743/_result.png",
  net: "https://image.qwenlm.ai/generated-images/e138da0d-c424-4aa0-849a-18e662ad3c09/_result.png",
  data: "https://image.qwenlm.ai/generated-images/b8155a4a-81fd-4173-8a0e-ca76521e963f/_result.png",
  uiux: "https://image.qwenlm.ai/generated-images/d2a10d92-5568-4ae5-83be-0978e5364b53/_result.png",
  lab: "https://image.qwenlm.ai/generated-images/94980cb3-c216-445f-82ed-f14d0517df3a/_result.png",
};
export { IMG };

export const SEED_PRODUCTS: Product[] = [
  { id: "pd1", slug: "hoodie-code-and-coffee", name: "Hoodie KMSIT “Code & Coffee”", category: "Apparel", price: 245000, weight: 600, stock: 40, sales: 0, hue: 168, icon: "tshirt", status: "published", createdAt: daysAgo(30), description: "Hoodie fleece premium 330gsm dengan bordir logo terminal KMSIT. Hangat untuk ngoding sampai pagi — tersedia ukuran S sampai XXL (tulis ukuran di catatan pesanan)." },
  { id: "pd2", slug: "keyboard-mechanical-tkl", name: "Keyboard Mechanical TKL KMSIT Edition", category: "Gadget", price: 585000, weight: 1100, stock: 15, sales: 0, hue: 204, icon: "keyboard", status: "published", createdAt: daysAgo(26), description: "Tenkeyless hot-swappable, switch linear pre-lubed, keycap PBT double-shot dengan aksen teal. Kabel USB-C coiled disertakan." },
  { id: "pd3", slug: "mouse-wireless-silent", name: "Mouse Wireless Silent KMSIT", category: "Gadget", price: 165000, weight: 120, stock: 60, sales: 0, hue: 32, icon: "mouse", status: "published", createdAt: daysAgo(22), description: "Klik senyap 90%, sensor 1600 DPI, baterai 12 bulan. Teman terbaik lab komputer dan perpustakaan." },
  { id: "pd4", slug: "buku-roadmap-web-developer", name: "Buku “Roadmap Web Developer 2025”", category: "Buku", price: 98000, weight: 450, stock: 100, sales: 0, hue: 340, icon: "book", status: "published", createdAt: daysAgo(18), description: "240 halaman full color: urutan belajar dari HTML sampai deployment, lengkap dengan latihan dan checklist mingguan. Ditulis tim akademik KMSIT." },
  { id: "pd5", slug: "tumbler-developer-750", name: "Tumbler Developer 750ml", category: "Aksesori", price: 89000, weight: 380, stock: 75, sales: 0, hue: 260, icon: "bottle", status: "published", createdAt: daysAgo(14), description: "Stainless steel double-wall, menjaga kopi tetap panas 6 jam. Grafir laser `while(alive) { drink(); code(); }`." },
  { id: "pd6", slug: "ransel-laptop-15", name: "Ransel Laptop 15” Anti-Air", category: "Aksesori", price: 329000, weight: 900, stock: 25, sales: 0, hue: 120, icon: "backpack", status: "published", createdAt: daysAgo(10), description: "Kompartemen laptop empuk, port USB eksternal, bahan anti-air. Siap menemani kelas offline di lab." },
  { id: "pd7", slug: "mousepad-xl-deskmat", name: "Deskmat XL Terminal 80×30", category: "Aksesori", price: 75000, weight: 500, stock: 90, sales: 0, hue: 12, icon: "mousepad", status: "published", createdAt: daysAgo(6), description: "Mousepad extended 80×30cm dengan motif grid terminal & shortcut vim. Base karet anti-slip." },
  { id: "pd8", slug: "sticker-pack-terminal", name: "Sticker Pack Terminal (24 pcs)", category: "Aksesori", price: 35000, weight: 60, stock: 150, sales: 0, hue: 200, icon: "sticker", status: "published", createdAt: daysAgo(3), description: "24 sticker vinyl tahan air: logo shell, maskot KMSIT, dan joke `It works on my machine`. Cocok untuk laptop & tumbler." },
];

export function buildSeedDB(superAdmin: { name: string; email: string; password: string }): DB {
  // PRODUCTION: hanya Super Admin yang dibuat saat instalasi.
  // Admin / Instruktur / Siswa lain dibuat manual oleh Super Admin atau lewat registrasi publik.
  const uSuper: User = { id: "u-super", name: superAdmin.name, email: superAdmin.email, password: superAdmin.password, role: "super_admin", color: "#0e8a75", joined: new Date().toISOString(), status: "active" };
  const users = [uSuper];

  const cat = (id: string, name: string, color: string): Category => ({ id, name, slug: slugify(name), color });

  const cWeb = "c-web", cNet = "c-net", cData = "c-data", cUi = "c-ui";
  const qzHtml = "qz-html", qzPy = "qz-py", qzNet = "qz-net";

  const courses: Course[] = [
    {
      id: cWeb, slug: "fullstack-web-development-bootcamp", title: "Full-Stack Web Development Bootcamp",
      description: "Kuasai HTML, CSS, JavaScript, React, dan Node.js dari nol sampai deploy aplikasi production.",
      longDescription: "<p>Bootcamp intensif yang membawa kamu dari nol hingga mampu membangun aplikasi web full-stack. Kurikulum disusun berdasarkan kebutuhan industri: fundamental web, JavaScript modern, React, REST API dengan Node.js, database MySQL, hingga deployment.</p><h3>Yang akan kamu kuasai</h3><ul><li>Fundamental HTML, CSS, dan JavaScript ES2023</li><li>React + React Router dan manajemen state</li><li>REST API, autentikasi, dan keamanan dasar</li><li>MySQL, migrasi, dan optimasi query</li><li>Git workflow dan deployment ke production</li></ul><blockquote>Kelas ini dilengkapi quiz di tiap modul, sertifikat digital, dan sesi live via Zoom setiap Sabtu.</blockquote>",
      thumbnail: IMG.web, categoryId: "cc-web", instructorId: "u-super", price: 450000, level: "Pemula",
      status: "published", rating: 4.8, tags: ["html", "css", "javascript", "react"], certificateEnabled: true, createdAt: daysAgo(200),
      modules: [
        { id: "m-w1", title: "Fundamental Web", lessons: [
          { id: "l-w1", title: "Cara Kerja Web & Setup Tools", type: "video", youtubeId: "pQN-pnXPaVg", duration: "18:24", free: true },
          { id: "l-w2", title: "HTML Semantik Modern", type: "video", youtubeId: "pQN-pnXPaVg", duration: "32:10" },
          { id: "l-w3", title: "Panduan CSS Layout: Flexbox & Grid", type: "text", duration: "12 mnt", content: "<h3>Flexbox vs Grid</h3><p>Flexbox unggul untuk layout satu dimensi (baris <em>atau</em> kolom), sedangkan Grid untuk dua dimensi. Pada modul ini kita membedah keduanya dengan studi kasus layout dashboard.</p><pre><code>.grid-shell {\n  display: grid;\n  grid-template-columns: 240px 1fr;\n  gap: 1rem;\n}</code></pre><ul><li>Mulai dari struktur, baru dekorasi</li><li>Gunakan <code>minmax()</code> dan <code>auto-fit</code> untuk responsif tanpa media query</li></ul>" },
          { id: "l-w4", title: "Quiz: Fundamental Web", type: "quiz", duration: "10 mnt" },
        ]},
        { id: "m-w2", title: "JavaScript & React", lessons: [
          { id: "l-w5", title: "JavaScript Modern (ES2023)", type: "video", youtubeId: "PkZNo7MFNFg", duration: "45:02" },
          { id: "l-w6", title: "React: Komponen & Hooks", type: "video", youtubeId: "w7ejDZ8SWv8", duration: "38:47" },
          { id: "l-w7", title: "Cheatsheet Hooks (PDF)", type: "file", fileName: "react-hooks-cheatsheet.pdf", duration: "5 mnt" },
        ]},
        { id: "m-w3", title: "Backend & Deploy", lessons: [
          { id: "l-w8", title: "REST API dengan Node.js", type: "video", youtubeId: "PkZNo7MFNFg", duration: "41:18" },
          { id: "l-w9", title: "MySQL: Skema & Migrasi", type: "video", youtubeId: "HXV3zeQKqGY", duration: "29:55" },
          { id: "l-w10", title: "Quiz Akhir: Full-Stack", type: "quiz", duration: "15 mnt" },
        ]},
      ],
    },
    {
      id: cNet, slug: "jaringan-komputer-mikrotik", title: "Jaringan Komputer & Mikrotik Dasar",
      description: "Fundamental jaringan, subnetting, routing, dan konfigurasi Mikrotik untuk persiapan MTCNA.",
      longDescription: "<p>Kelas jaringan komputer terstruktur: dari OSI layer, IP addressing, subnetting, VLAN, routing statis & dinamis, hingga hands-on konfigurasi Mikrotik RouterOS. Cocok untuk persiapan sertifikasi MTCNA.</p><ul><li>Simulasi packet tracer di setiap modul</li><li>Lab virtual Mikrotik (CHR) gratis</li><li>Live session troubleshooting via Zoom</li></ul>",
      thumbnail: IMG.net, categoryId: "cc-net", instructorId: "u-super", price: 275000, level: "Menengah",
      status: "published", rating: 4.7, tags: ["network", "mikrotik", "mtcna"], certificateEnabled: true, createdAt: daysAgo(150),
      modules: [
        { id: "m-n1", title: "Fundamental Jaringan", lessons: [
          { id: "l-n1", title: "OSI Layer & TCP/IP", type: "video", youtubeId: "qiQR5rTSshw", duration: "24:30", free: true },
          { id: "l-n2", title: "IP Address & Subnetting", type: "video", youtubeId: "qiQR5rTSshw", duration: "35:12" },
          { id: "l-n3", title: "Quiz: Subnetting", type: "quiz", duration: "10 mnt" },
        ]},
        { id: "m-n2", title: "Mikrotik RouterOS", lessons: [
          { id: "l-n4", title: "Setup CHR & Winbox", type: "video", youtubeId: "qiQR5rTSshw", duration: "21:44" },
          { id: "l-n5", title: "DHCP, NAT & Firewall Filter", type: "video", youtubeId: "qiQR5rTSshw", duration: "33:08" },
          { id: "l-n6", title: "Panduan Lab VLAN (PDF)", type: "file", fileName: "lab-vlan-mikrotik.pdf", duration: "8 mnt" },
        ]},
      ],
    },
    {
      id: cData, slug: "data-science-python", title: "Data Science dengan Python",
      description: "Pandas, visualisasi data, statistik praktis, dan machine learning dasar dengan studi kasus nyata.",
      longDescription: "<p>Mulai dari Python dasar, manipulasi data dengan Pandas, visualisasi dengan Matplotlib, statistik deskriptif, hingga pengenalan scikit-learn. Semua materi menggunakan dataset riil UMKM Indonesia.</p><ul><li>20+ notebook latihan</li><li>Project akhir: analisis data penjualan</li><li>Sertifikat digital terverifikasi</li></ul>",
      thumbnail: IMG.data, categoryId: "cc-data", instructorId: "u-super", price: 350000, level: "Menengah",
      status: "published", rating: 4.9, tags: ["python", "pandas", "ml"], certificateEnabled: true, createdAt: daysAgo(90),
      modules: [
        { id: "m-d1", title: "Python & Pandas", lessons: [
          { id: "l-d1", title: "Python Dasar untuk Data", type: "video", youtubeId: "rfscVS0vtbw", duration: "40:15", free: true },
          { id: "l-d2", title: "DataFrame & Data Cleaning", type: "video", youtubeId: "rfscVS0vtbw", duration: "36:27" },
          { id: "l-d3", title: "Quiz: Pandas", type: "quiz", duration: "10 mnt" },
        ]},
        { id: "m-d2", title: "Visualisasi & ML Dasar", lessons: [
          { id: "l-d4", title: "Visualisasi dengan Matplotlib", type: "video", youtubeId: "rfscVS0vtbw", duration: "28:40" },
          { id: "l-d5", title: "Intro scikit-learn", type: "video", youtubeId: "rfscVS0vtbw", duration: "34:52" },
        ]},
      ],
    },
    {
      id: cUi, slug: "uiux-design-figma", title: "UI/UX Design dengan Figma",
      description: "Design thinking, wireframing, design system, dan prototyping — gratis untuk semua member.",
      longDescription: "<p>Kelas gratis pengantar UI/UX: design thinking, riset pengguna ringan, wireframe, design system sederhana, dan prototyping interaktif di Figma.</p><ul><li>Template Figma gratis</li><li>Review portofolio di sesi live Google Meet</li></ul>",
      thumbnail: IMG.uiux, categoryId: "cc-design", instructorId: "u-super", price: 0, level: "Pemula",
      status: "published", rating: 4.6, tags: ["figma", "uiux", "design"], certificateEnabled: false, createdAt: daysAgo(45),
      modules: [
        { id: "m-u1", title: "Dasar UI/UX", lessons: [
          { id: "l-u1", title: "Design Thinking 101", type: "video", youtubeId: "jwCmIBJ8Jtc", duration: "16:20", free: true },
          { id: "l-u2", title: "Wireframe ke Hi-Fi", type: "video", youtubeId: "jwCmIBJ8Jtc", duration: "27:33", free: true },
          { id: "l-u3", title: "Design System Mini", type: "text", duration: "10 mnt", free: true, content: "<p>Design system kecil yang konsisten mempercepat kerja tim. Mulai dari 4 token warna, 2 font, dan 8 komponen inti.</p><ul><li>Token: brand, netral, aksen, semantik</li><li>Komponen: button, input, card, nav, modal, toast, table, avatar</li></ul>" },
        ]},
      ],
    },
  ];

  const quizzes: Quiz[] = [
    {
      id: qzHtml, courseId: cWeb, lessonId: "l-w4", title: "Quiz: Fundamental Web", timeLimit: 10, passingGrade: 70, attemptLimit: 3, randomize: true,
      questions: [
        { id: "qh1", type: "single", text: "Tag HTML mana yang paling tepat untuk konten navigasi utama?", options: ["<nav>", "<menu>", "<section>", "<aside>"], correct: [0], points: 20 },
        { id: "qh2", type: "boolean", text: "CSS Grid hanya bisa membuat layout satu dimensi.", options: ["Benar", "Salah"], correct: [1], points: 20 },
        { id: "qh3", type: "multiple", text: "Pilih SEMUA yang merupakan CSS layout system:", options: ["Flexbox", "Grid", "Float", "jQuery"], correct: [0, 1, 2], points: 30 },
        { id: "qh4", type: "single", text: "Atribut HTML untuk teks alternatif gambar adalah…", options: ["alt", "title", "src", "aria"], correct: [0], points: 15 },
        { id: "qh5", type: "boolean", text: "HTTPS mengenkripsi komunikasi antara browser dan server.", options: ["Benar", "Salah"], correct: [0], points: 15 },
      ],
    },
    {
      id: "qzPy", courseId: cData, lessonId: "l-d3", title: "Quiz: Pandas", timeLimit: 10, passingGrade: 70, attemptLimit: 2, randomize: false,
      questions: [
        { id: "qp1", type: "single", text: "Method Pandas untuk membaca file CSV adalah…", options: ["read_csv()", "open_csv()", "load_csv()", "csv.read()"], correct: [0], points: 25 },
        { id: "qp2", type: "single", text: "Untuk melihat 5 baris pertama DataFrame digunakan…", options: [".head()", ".top()", ".first(5)", ".preview()"], correct: [0], points: 25 },
        { id: "qp3", type: "boolean", text: "df.groupby() mengembalikan hasil yang sudah terurut otomatis.", options: ["Benar", "Salah"], correct: [1], points: 25 },
        { id: "qp4", type: "multiple", text: "Pilih semua struktur data Pandas:", options: ["Series", "DataFrame", "Array2D", "Tensor"], correct: [0, 1], points: 25 },
      ],
    },
    {
      id: "qzNet", courseId: cNet, lessonId: "l-n3", title: "Quiz: Subnetting", timeLimit: 8, passingGrade: 75, attemptLimit: 3, randomize: true,
      questions: [
        { id: "qn1", type: "single", text: "Berapa jumlah host usable pada subnet /30?", options: ["2", "4", "6", "30"], correct: [0], points: 25 },
        { id: "qn2", type: "single", text: "Subnet mask 255.255.255.0 sama dengan notasi…", options: ["/24", "/16", "/8", "/32"], correct: [0], points: 25 },
        { id: "qn3", type: "boolean", text: "Alamat 192.168.1.1 termasuk kelas publik.", options: ["Benar", "Salah"], correct: [1], points: 25 },
        { id: "qn4", type: "multiple", text: "Pilih protokol yang bekerja di layer transport:", options: ["TCP", "UDP", "IP", "HTTP"], correct: [0, 1], points: 25 },
      ],
    },
  ];

  // PRODUCTION: data transaksional dimulai KOSONG — tumbuh dari aktivitas nyata.
  const enrollments: Enrollment[] = [];
  const attempts: QuizAttempt[] = [];
  const certificates: Certificate[] = [];
  const payments: Payment[] = [];
  const walletTx: WalletTx[] = [];
  const withdrawals: Withdrawal[] = [];

  const articles: Article[] = [
    {
      id: "ar1", slug: "roadmap-web-developer-2025", title: "Roadmap Web Developer 2025: Dari Nol Sampai Siap Kerja",
      excerpt: "Urutan belajar yang realistis: fundamental, framework, backend, lalu spesialisasi — lengkap dengan estimasi waktu.",
      content: "<p>Banyak pemula gagal bukan karena kurang pintar, tapi karena urutannya acak. Roadmap ini disusun dari pengalaman melatih 700+ siswa KMSIT.</p><h3>Tahap 1 — Fundamental (4–6 minggu)</h3><p>HTML semantik, CSS modern (Flexbox/Grid), dan JavaScript dasar. Jangan sentuh framework dulu.</p><h3>Tahap 2 — JavaScript Lanjut (4 minggu)</h3><p>DOM, async/await, fetch, dan ES modules. Fondasi ini menentukan seberapa cepat kamu menguasai React.</p><h3>Tahap 3 — Framework & Backend (8 minggu)</h3><p>React di frontend, Node.js + MySQL di backend. Bangun satu aplikasi CRUD utuh.</p><blockquote>Konsistensi 2 jam/hari mengalahkan 14 jam di akhir pekan.</blockquote>",
      hue: 168, categoryId: "ca-web", tags: ["roadmap", "karir", "web"], authorId: "u-super", status: "published",
      publishedAt: daysAgo(6), seoTitle: "Roadmap Web Developer 2025", seoDesc: "Urutan belajar web development yang realistis untuk pemula.", views: 1284,
    },
    {
      id: "ar2", slug: "7-kesalahan-belajar-coding", title: "7 Kesalahan Klasik Saat Belajar Coding (dan Cara Menghindarinya)",
      excerpt: "Tutorial hell, gonta-ganti bahasa, dan perfeksionisme — jebakan yang membuat progres mandek.",
      content: "<p>Dari ribuan jam mentoring, pola kesalahan ini terus berulang.</p><ol><li><strong>Tutorial hell</strong> — menonton tanpa membangun. Solusi: aturan 1:2, satu jam nonton, dua jam coding.</li><li><strong>Gonta-ganti bahasa</strong> — kuasai satu bahasa sampai bisa membuat proyek.</li><li><strong>Takut error</strong> — error adalah kurikulum tersembunyi.</li><li><strong>Belajar sendirian</strong> — bergabung dengan komunitas mempercepat 2x lipat.</li><li><strong>Perfeksionisme</strong> — rilis versi jelek dulu, perbaiki kemudian.</li><li><strong>Mengabaikan Git</strong> — commit kecil setiap hari.</li><li><strong>Tidak membaca dokumentasi</strong> — dokumentasi adalah sumber kebenaran.</li></ol>",
      hue: 32, categoryId: "ca-karir", tags: ["mindset", "coding"], authorId: "u-super", status: "published",
      publishedAt: daysAgo(12), seoTitle: "Kesalahan Belajar Coding", seoDesc: "7 kesalahan klasik pemula programming.", views: 862,
    },
    {
      id: "ar3", slug: "mysql-indexing-dasar", title: "MySQL Indexing untuk Pemula: Query 40x Lebih Cepat",
      excerpt: "Kapan membuat index, jenis-jenis index, dan cara membaca EXPLAIN tanpa pusing.",
      content: "<p>Query lambat jarang disebabkan hardware — biasanya karena table scan.</p><pre><code>EXPLAIN SELECT * FROM orders WHERE user_id = 1024;</code></pre><p>Jika kolom <code>type</code> menunjukkan <code>ALL</code>, itu table scan. Tambahkan index:</p><pre><code>ALTER TABLE orders ADD INDEX idx_user (user_id);</code></pre><h3>Aturan praktis</h3><ul><li>Index kolom yang sering muncul di WHERE dan JOIN</li><li>Jangan over-index: setiap index memperlambat INSERT</li><li>Gunakan composite index dengan urutan selektivitas tinggi dulu</li></ul>",
      hue: 204, categoryId: "ca-db", tags: ["mysql", "database", "performance"], authorId: "u-super", status: "published",
      publishedAt: daysAgo(3), seoTitle: "MySQL Indexing Dasar", seoDesc: "Panduan index MySQL untuk query cepat.", views: 540,
    },
  ];
  const news: NewsItem[] = [
    { id: "nw1", slug: "kmsit-buka-lab-komputer-baru", title: "KMSIT Buka Lab Komputer Baru Berkapasitas 40 Workstation", excerpt: "Lab baru dilengkapi PC dual-monitor dan jaringan 10 Gbps untuk kelas offline jaringan & data.", hue: 168, categoryId: "cn-kampus", authorId: "u-super", status: "published", publishedAt: daysAgo(4), seoTitle: "Lab Komputer Baru KMSIT", seoDesc: "KMSIT membuka lab komputer baru.", views: 930, content: "<p>Per 1 Februari, lab komputer KMSIT resmi beroperasi dengan 40 workstation Ryzen 7, dual monitor, dan backbone 10 Gbps. Lab ini diprioritaskan untuk kelas jaringan, Mikrotik, dan praktikum data.</p><p>Jadwal open lab: Senin–Jumat 09.00–21.00 WIB.</p>" },
    { id: "nw2", slug: "kemitraan-sertifikasi-mtcna", title: "KMSIT Jalin Kemitraan Program Persiapan Sertifikasi MTCNA", excerpt: "Lulusan kelas jaringan kini mendapat voucher diskon 30% ujian MTCNA resmi.", hue: 204, categoryId: "cn-kerjasama", authorId: "u-super", status: "published", publishedAt: daysAgo(9), seoTitle: "Kemitraan MTCNA", seoDesc: "Kemitraan sertifikasi jaringan.", views: 615, content: "<p>KMSIT resmi bekerja sama dengan lembaga pelatihan resmi Mikrotik. Lulusan kelas Jaringan Komputer & Mikrotik Dasar berhak atas voucher diskon 30% untuk ujian MTCNA.</p>" },
    { id: "nw3", slug: "wisuda-batch-12", title: "128 Lulusan Batch 12 Diwisuda, 62% Langsung Terserap Industri", excerpt: "Tingkat serapan kerja tertinggi sejak program bootcamp berjalan.", hue: 32, categoryId: "cn-kampus", authorId: "u-super", status: "published", publishedAt: daysAgo(16), seoTitle: "Wisuda Batch 12", seoDesc: "Wisuda 128 lulusan KMSIT.", views: 1450, content: "<p>Wisuda batch 12 meluluskan 128 siswa dari program web development, jaringan, dan data. Sebanyak 62% lulusan telah menerima tawaran kerja dalam 60 hari setelah lulus.</p>" },
  ];
  const tutorials: Tutorial[] = [
    { id: "tu1", slug: "install-ubuntu-server-vps", title: "Cara Install & Setup Ubuntu Server di VPS", description: "Dari SSH pertama sampai firewall UFW dan user non-root.", hue: 262, categoryId: "ct-server", tags: ["linux", "vps"], authorId: "u-super", youtubeId: "qiQR5rTSshw", status: "published", publishedAt: daysAgo(5), views: 720, content: "<h3>1. SSH pertama</h3><pre><code>ssh root@IP_VPS</code></pre><h3>2. Buat user non-root</h3><pre><code>adduser kmsit\nusermod -aG sudo kmsit</code></pre><h3>3. Firewall UFW</h3><pre><code>ufw allow OpenSSH\nufw enable</code></pre><p>Server siap dipakai. Lanjutkan dengan install Nginx dan SSL gratis.</p>" },
    { id: "tu2", slug: "react-router-dasar", title: "React Router dalam 15 Menit", description: "Routing, dynamic params, dan nested layout di React.", hue: 168, categoryId: "ct-frontend", tags: ["react", "routing"], authorId: "u-super", youtubeId: "w7ejDZ8SWv8", status: "published", publishedAt: daysAgo(11), views: 1105, content: "<pre><code>import { BrowserRouter, Routes, Route } from 'react-router-dom';\n\n&lt;BrowserRouter&gt;\n  &lt;Routes&gt;\n    &lt;Route path=\"/courses/:slug\" element={&lt;Detail/&gt;} /&gt;\n  &lt;/Routes&gt;\n&lt;/BrowserRouter&gt;</code></pre><p>Gunakan <code>useParams()</code> untuk membaca <code>:slug</code> dan <code>useNavigate()</code> untuk redirect.</p>" },
    { id: "tu3", slug: "git-branching-workflow", title: "Git Branching Workflow untuk Tim Kecil", description: "Strategi branch sederhana: main, develop, dan feature branch.", hue: 32, categoryId: "ct-tools", tags: ["git", "workflow"], authorId: "u-super", status: "published", publishedAt: daysAgo(18), views: 689, content: "<ul><li><code>main</code> — selalu deployable</li><li><code>develop</code> — integrasi fitur</li><li><code>feature/nama-fitur</code> — satu fitur, satu branch</li></ul><pre><code>git checkout -b feature/payment\ngit push -u origin feature/payment</code></pre><p>Wajib code review sebelum merge ke develop.</p>" },
  ];
  const programs: Program[] = [
    { id: "pr1", slug: "program-fullstack-bootcamp", title: "Program Full-Stack Bootcamp 12 Minggu", description: "Jalur intensif jadi web developer: HTML sampai deployment + magang partner.", hue: 168, categoryId: "cp-bootcamp", duration: "12 minggu", courseIds: [cWeb, cData], status: "published" },
    { id: "pr2", slug: "program-network-academy", title: "Network Academy: Zero to MTCNA", description: "Persiapan sertifikasi jaringan internasional dalam 8 minggu.", hue: 204, categoryId: "cp-sertifikasi", duration: "8 minggu", courseIds: [cNet], status: "published" },
  ];

  const pages: Page[] = [
    {
      id: "pg1", slug: "about-us", title: "Tentang KMSIT Computer", status: "published", seoTitle: "Tentang Kami", seoDesc: "KMSIT Computer adalah lembaga pendidikan komputer.",
      content: "<p><strong>KMSIT Computer</strong> adalah lembaga pendidikan teknologi informasi yang berdiri sejak 2016. Kami menggabungkan kelas online berbasis LMS dengan praktik langsung di lab, didukung instruktur praktisi industri.</p><h3>Visi</h3><p>Menjadi pusat pendidikan teknologi terdepan yang mencetak talenta digital siap kerja di tingkat Asia Tenggara.</p><h3>Misi</h3><ul><li>Kurikulum berbasis kebutuhan industri yang diperbarui setiap kuartal</li><li>Pembelajaran hybrid: LMS online + lab praktik + live class</li><li>Sertifikat digital terverifikasi untuk setiap kelulusan</li><li>Penyaluran kerja melalui jaringan 40+ partner industri</li></ul><h3>Sejarah</h3><p>Berawal dari kursus komputer kecil dengan 12 siswa, KMSIT kini melayani 4.800+ siswa aktif dengan 30+ kelas dan tingkat kepuasan 4,8/5.</p>",
    },
    { id: "pg2", slug: "faq", title: "Pertanyaan Umum (FAQ)", status: "published", seoTitle: "FAQ", seoDesc: "Pertanyaan umum seputar KMSIT.", content: "<h3>Apakah kelas bisa diakses selamanya?</h3><p>Ya, sekali membeli kelas kamu mendapat akses selamanya termasuk pembaruan materi.</p><h3>Bagaimana cara mendapat sertifikat?</h3><p>Selesaikan seluruh lesson dan lulus quiz akhir dengan nilai minimal sesuai passing grade. Sertifikat digital terbit otomatis dan dapat diverifikasi publik.</p><h3>Metode pembayaran apa yang tersedia?</h3><p>QRIS, virtual account, dan kartu kredit melalui payment gateway Tripay, Xendit, atau Stripe.</p>" },
  ];

  const homeSections: HomeSection[] = [
    { id: "hs1", type: "hero", title: "Belajar Teknologi, Naik Level.", subtitle: "Kelas online + lab praktik dengan instruktur praktisi. Quiz, sertifikat digital terverifikasi, dan penyaluran kerja.", enabled: true, order: 1, settings: {} },
    { id: "hs2", type: "stats", title: "Statistik", subtitle: "", enabled: true, order: 2, settings: {} },
    { id: "hs3", type: "featured", title: "Kelas Unggulan", subtitle: "Kurikulum berbasis kebutuhan industri, diperbarui setiap kuartal.", enabled: true, order: 3, settings: {} },
    { id: "hs4", type: "categories", title: "Jelajahi Bidang", subtitle: "Pilih jalur belajarmu.", enabled: true, order: 4, settings: {} },
    { id: "hs5", type: "tutorials", title: "Tutorial Terbaru", subtitle: "Panduan praktis langsung dari instruktur.", enabled: true, order: 5, settings: {} },
    { id: "hs6", type: "articles", title: "Artikel & Insight", subtitle: "Bacaan pilihan untuk mempercepat karirmu.", enabled: true, order: 6, settings: {} },
    { id: "hs7", type: "news", title: "Berita Kampus", subtitle: "Kabar terbaru dari KMSIT.", enabled: true, order: 7, settings: {} },
    { id: "hs8", type: "programs", title: "Program Intensif", subtitle: "Jalur belajar terstruktur dengan target karir jelas.", enabled: true, order: 8, settings: {} },
    { id: "hs9", type: "instructors", title: "Instruktur Praktisi", subtitle: "Belajar langsung dari orang yang mengerjakannya setiap hari.", enabled: true, order: 9, settings: {} },
    { id: "hs10", type: "testimonials", title: "Kata Mereka", subtitle: "Cerita alumni KMSIT.", enabled: true, order: 10, settings: {} },
    { id: "hs11", type: "cta", title: "Mulai Belajar Hari Ini", subtitle: "Daftar gratis dan ikuti kelas pertamamu dalam 5 menit.", enabled: true, order: 11, settings: {} },
  ];

  const menus: Menu[] = [
    { id: "mn1", name: "Menu Utama", location: "header", items: [
      { id: "mi1", label: "Beranda", url: "/", children: [] },
      { id: "mi2", label: "Kelas", url: "/courses", children: [] },
      { id: "mi3", label: "Program", url: "/programs", children: [] },
      { id: "mi4", label: "Konten", url: "#", children: [
        { id: "mi4a", label: "Artikel", url: "/articles", children: [] },
        { id: "mi4b", label: "Berita", url: "/news", children: [] },
        { id: "mi4c", label: "Tutorial", url: "/tutorials", children: [] },
      ]},
      { id: "mi5", label: "Tentang", url: "/about", children: [] },
    ]},
    { id: "mn2", name: "Menu Footer", location: "footer", items: [
      { id: "mf1", label: "Tentang Kami", url: "/about", children: [] },
      { id: "mf2", label: "FAQ", url: "/page/faq", children: [] },
      { id: "mf3", label: "Verifikasi Sertifikat", url: "/verify-certificate", children: [] },
      { id: "mf4", label: "Kebijakan Privasi", url: "/page/faq", children: [] },
    ]},
  ];

  const media: MediaItem[] = [
    { id: "md1", name: "lab-komputer.png", type: "image/png", size: 412000, url: IMG.lab, date: daysAgo(30) },
    { id: "md2", name: "cover-webdev.png", type: "image/png", size: 388000, url: IMG.web, date: daysAgo(60) },
  ];

  const notifications: Notice[] = [
    { id: "nt0", userId: "u-super", title: "Instalasi selesai", body: "Website berhasil di-install dan installer dikunci. Selamat mengelola!", date: new Date().toISOString(), read: false },
  ];
  const logs: ActivityLog[] = [
    { id: "lg0", userId: "u-super", userName: superAdmin.name, action: "site_installed", detail: "Website di-install: 15 migrasi, 8 seeder, Super Admin dibuat", date: new Date().toISOString() },
    { id: "lg1", userId: "u-super", userName: superAdmin.name, action: "content_seeded", detail: "Konten starter (kelas, artikel, berita, tutorial) dimuat", date: new Date().toISOString() },
  ];
  const testimonials: Testimonial[] = [
    { id: "ts1", name: "Andi Wijaya", role: "Frontend Developer — Tokopedia", text: "Kurikulumnya paling terstruktur dari semua bootcamp yang saya coba. Quiz-nya bikin materi benar-benar nempel.", rating: 5 },
    { id: "ts2", name: "Rina Kartika", role: "Junior Network Engineer", text: "Lulus kelas Mikrotik langsung dapat voucher MTCNA. Sekarang kerja di ISP lokal.", rating: 5 },
    { id: "ts3", name: "Gilang Prasetyo", role: "Data Analyst Intern", text: "Instruktur responsif banget. Sertifikatnya bisa diverifikasi online, HR langsung percaya.", rating: 4 },
  ];

  // Struktur organisasi — dikelola via CMS (Dashboard → CMS → Struktur Organisasi)
  const orgUnits: OrgUnit[] = [
    { id: "ou1", name: "Dewan Pengurus", tagline: "Pimpinan & tata kelola lembaga", level: "board", order: 1 },
    { id: "ou2", name: "Divisi Akademik", tagline: "Kurikulum, instruktur, dan penjaminan mutu", level: "division", order: 2 },
    { id: "ou3", name: "Divisi Teknologi & Sistem Informasi", tagline: "Platform LMS, infrastruktur, dan keamanan", level: "division", order: 3 },
    { id: "ou4", name: "Divisi Operasional & Kemitraan", tagline: "Lab, administrasi, dan hubungan industri", level: "division", order: 4 },
  ];
  const orgMembers: OrgMember[] = [
    { id: "om1", unitId: "ou1", name: "Hendra Gunawan", position: "Ketua Umum", order: 1 },
    { id: "om2", unitId: "ou1", name: "Lestari Widuri", position: "Wakil Ketua", order: 2 },
    { id: "om3", unitId: "ou1", name: "Agus Salim", position: "Sekretaris", order: 3 },
    { id: "om4", unitId: "ou1", name: "Ratna Dewi", position: "Bendahara", order: 4 },
    { id: "om5", unitId: "ou2", name: "Mirza Hakim", position: "Kepala Divisi", order: 1 },
    { id: "om6", unitId: "ou2", name: "Salsabila Putri", position: "Pengembang Kurikulum", order: 2 },
    { id: "om7", unitId: "ou2", name: "Dimas Anggara", position: "Penjaminan Mutu", order: 3 },
    { id: "om8", unitId: "ou3", name: "Yusuf Maulana", position: "Kepala Divisi", order: 1 },
    { id: "om9", unitId: "ou3", name: "Karina Ayu", position: "Pengembang Sistem", order: 2 },
    { id: "om10", unitId: "ou3", name: "Bagus Wicaksono", position: "Infrastruktur & Jaringan", order: 3 },
    { id: "om11", unitId: "ou4", name: "Tania Rahma", position: "Kepala Divisi", order: 1 },
    { id: "om12", unitId: "ou4", name: "Reza Fahlevi", position: "Hubungan Industri", order: 2 },
  ];

  return {
    version: 2, installed: true, installedAt: new Date().toISOString(), locked: true,
    settings: {
      siteName: "KMSIT Computer", slogan: "Belajar Teknologi, Naik Level.",
      description: "Platform LMS & CMS untuk kelas online, tutorial, artikel, berita, quiz, dan sertifikat digital.",
      email: "halo@kmsit.id", phone: "(021) 555-0199", whatsapp: "6281234567890",
      address: "Jl. Pendidikan Teknologi No. 12, Jakarta Selatan", timezone: "Asia/Jakarta",
      logoUrl: "", faviconUrl: "", mapLat: "-6.2614927", mapLng: "106.8106253", mapLabel: "KMSIT Computer — Kampus Utama",
      brandColor: "#17a58c", accentColor: "#e8a33d",
      language: "id", currency: "IDR", maintenanceMode: false, registrationOpen: true,
      footerText: "© 2025 KMSIT Computer. Seluruh hak cipta dilindungi.",
      social: { instagram: "https://instagram.com/kmsit", youtube: "https://youtube.com/@kmsit", facebook: "https://facebook.com/kmsit", github: "https://github.com/kmsit" },
      seo: { title: "KMSIT Computer — LMS & CMS Platform", description: "Kelas online komputer dengan sertifikat digital terverifikasi.", keywords: "kursus komputer, lms, bootcamp, sertifikasi, kmsit" },
    },
    gateways: [
      { provider: "tripay", enabled: true, mode: "sandbox", apiKey: "DEV-TRIPAY-xxxx", secretKey: "sk_sandbox_xxxx", merchantId: "T7789", webhookUrl: "/api/payments/webhook/tripay" },
      { provider: "xendit", enabled: true, mode: "sandbox", apiKey: "xnd_development_xxxx", secretKey: "", merchantId: "", webhookUrl: "/api/payments/webhook/xendit" },
      { provider: "stripe", enabled: false, mode: "sandbox", apiKey: "pk_test_xxxx", secretKey: "sk_test_xxxx", merchantId: "", webhookUrl: "/api/payments/webhook/stripe" },
    ],
    activeGateway: "tripay",
    integrations: {
      youtube: { enabled: true, channelId: "UC-kmsit-computer", apiKey: "" },
      zoom: { enabled: true, accountId: "", clientId: "", clientSecret: "" },
      gmeet: { enabled: false, clientId: "", clientSecret: "" },
      rajaongkir: { enabled: true, apiKey: "", originProvinceId: "6", originCityId: "152", couriers: ["jne", "pos", "tiki"] },
    },
    users,
    roles: [
      { role: "super_admin", label: "Super Admin", permissions: [...PERMISSIONS] },
      { role: "admin", label: "Admin", permissions: ["manage_content", "manage_courses", "manage_students", "manage_instructors", "manage_media", "manage_cms", "view_reports", "manage_payments"] },
      { role: "instructor", label: "Instruktur", permissions: ["manage_courses", "view_reports"] },
      { role: "student", label: "Siswa", permissions: [] },
    ],
    categories: {
      course: [cat("cc-web", "Web Development", "#0e8a75"), cat("cc-net", "Jaringan", "#3e8fc4"), cat("cc-data", "Data Science", "#dd8f22"), cat("cc-design", "Desain", "#c04f7e")],
      article: [cat("ca-web", "Web Dev", "#0e8a75"), cat("ca-karir", "Karir", "#dd8f22"), cat("ca-db", "Database", "#3e8fc4")],
      news: [cat("cn-kampus", "Kampus", "#0e8a75"), cat("cn-kerjasama", "Kerja Sama", "#3e8fc4")],
      tutorial: [cat("ct-frontend", "Frontend", "#0e8a75"), cat("ct-server", "Server", "#8a5cc0"), cat("ct-tools", "Tools", "#dd8f22")],
      program: [cat("cp-bootcamp", "Bootcamp", "#0e8a75"), cat("cp-sertifikasi", "Sertifikasi", "#3e8fc4")],
    },
    courses, quizzes, enrollments, attempts, certificates, articles, news, tutorials, programs, pages,
    homeSections, menus, media, payments, walletTx, withdrawals, notifications, logs, testimonials,
    orgUnits, orgMembers,
    products: SEED_PRODUCTS.map((p) => ({ ...p })),
    orders: [] as Order[],
  };
}

// ─── persistence ────────────────────────────────────────────────────────────
const DB_KEY = "kmsit_db_v1";
const SESSION_KEY = "kmsit_session_v1";
export const LOCK_KEY = "kmsit_installed_lock";

const SETTINGS_DEFAULTS: Record<string, unknown> = {
  logoUrl: "", faviconUrl: "", brandColor: "#17a58c", accentColor: "#e8a33d",
  mapLat: "-6.2614927", mapLng: "106.8106253", mapLabel: "",
};
export function loadDB(): DB | null {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return null;
    const db = JSON.parse(raw) as DB;
    if (!db || typeof db.version !== "number" || db.version < 1) return null;
    // Migrasi ringan: isi field baru dengan default agar install lama tetap jalan
    db.settings = { ...SETTINGS_DEFAULTS, ...db.settings } as DB["settings"];
    if (!db.orgUnits) db.orgUnits = [];
    if (!db.orgMembers) db.orgMembers = [];
    if (!db.products || db.products.length === 0) db.products = SEED_PRODUCTS.map((p) => ({ ...p }));
    if (!db.orders) db.orders = [];
    if (!db.integrations.rajaongkir) {
      db.integrations.rajaongkir = { enabled: true, apiKey: "", originProvinceId: "6", originCityId: "152", couriers: ["jne", "pos", "tiki"] };
    }
    const headerMenu = db.menus.find((m) => m.location === "header");
    if (headerMenu && !headerMenu.items.some((i) => i.label === "Shop")) {
      const about = headerMenu.items.findIndex((i) => i.label === "Tentang" || i.label === "About");
      const item = { id: uid(), label: "Shop", url: "/shop", children: [] };
      about >= 0 ? headerMenu.items.splice(about, 0, item) : headerMenu.items.push(item);
    }
    db.version = 2;
    return db;
  } catch { return null; }
}
export function saveDB(db: DB) { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* storage full */ } }
export function loadSession(): string | null { return localStorage.getItem(SESSION_KEY); }
export function saveSession(id: string | null) { id ? localStorage.setItem(SESSION_KEY, id) : localStorage.removeItem(SESSION_KEY); }
export function wipeAll() { localStorage.removeItem(DB_KEY); localStorage.removeItem(SESSION_KEY); localStorage.removeItem(LOCK_KEY); }

// ─── derived helpers ────────────────────────────────────────────────────────
export const courseLessons = (c: Course) => c.modules.flatMap((m) => m.lessons);
export const courseProgress = (c: Course, e?: Enrollment) => {
  const total = courseLessons(c).length;
  if (!total || !e) return 0;
  return Math.round((e.completedLessons.length / total) * 100);
};
export const walletBalance = (db: DB, instructorId: string) => {
  const txs = db.walletTx.filter((t) => t.instructorId === instructorId);
  const total = txs.reduce((s, t) => s + t.amount, 0);
  const pendingWd = db.withdrawals.filter((w) => w.instructorId === instructorId && (w.status === "pending" || w.status === "processing" || w.status === "approved")).reduce((s, w) => s + w.amount, 0);
  const withdrawn = txs.filter((t) => t.type === "withdrawal").reduce((s, t) => s + Math.abs(t.amount), 0);
  return { total: Math.max(0, total), available: Math.max(0, total - pendingWd), pending: pendingWd, withdrawn };
};
