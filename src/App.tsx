import { HashRouter, Routes, Route, Navigate, useParams, Link } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { AppProvider, useApp } from "./lib/store";
import { PublicShell, DashShell, dashMenu, roleBase } from "./components/shell";
import { ToastHost, Btn } from "./components/ui";
import { fmtDate } from "./lib/db";
import {
  HomePage, CoursesPage, CourseDetailPage, ArticlesPage, NewsPage, TutorialsPage,
  ArticleDetail, NewsDetail, TutorialDetail, ProgramsPage, ProgramDetail, AboutPage, CustomPage,
  VerifyCertificatePage, MaintenancePage,
} from "./pages/public";
import { LoginPage, RegisterPage, ForgotPage } from "./pages/auth";
import { InstallPage } from "./pages/install";
import { LearnPlayer, CertificatePage } from "./pages/learn";
import { SuperAdminOverview, AdminOverview, InstructorOverview, StudentOverview } from "./pages/dash";
import { ContentManager, PagesManager, ProgramsManager, HomeCMS, AboutCMS, MenuManager, MediaManager } from "./pages/dash-content";
import { CoursesManager, QuizManager, StudentsManager, InstructorsManager, CertificatesManager, MyCoursesPage, GradesPage, StudentPaymentsPage } from "./pages/dash-lms";
import { PaymentsManager, TransactionsManager, WithdrawalsManager, WalletPage, GatewayPage } from "./pages/dash-money";
import { WebsiteSettings, SeoSettings, LanguageSettings, UsersManager, RolesManager, SystemPage, ActivityPage, IntegrationsPage } from "./pages/dash-system";
import { Award } from "lucide-react";

function InstallGate({ children }: { children: React.ReactNode }) {
  const { db } = useApp();
  if (!db) return <Navigate to="/install" replace />;
  return <>{children}</>;
}
function PublicGate({ children }: { children: React.ReactNode }) {
  const { db, user } = useApp();
  if (!db) return <Navigate to="/install" replace />;
  if (db.settings.maintenanceMode && (!user || (user.role !== "super_admin" && user.role !== "admin"))) return <MaintenancePage />;
  return <>{children}</>;
}
function RoleRedirect() {
  const { db, user } = useApp();
  if (!db) return <Navigate to="/install" replace />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleBase(user.role)} replace />;
}
function LoginGate({ children }: { children: React.ReactNode }) {
  const { db, user } = useApp();
  if (!db) return <Navigate to="/install" replace />;
  if (user) return <Navigate to={roleBase(user.role)} replace />;
  return <>{children}</>;
}

function AccessDenied() {
  const { user } = useApp();
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <span className="mx-auto w-14 h-14 rounded-2xl bg-bad-500/12 text-bad-500 flex items-center justify-center"><ShieldX size={26} /></span>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 dark:text-white">403 — Akses ditolak</h1>
      <p className="mt-2 text-sm text-ink-400 leading-relaxed">Role <b>{user?.role}</b> tidak memiliki permission untuk halaman ini. Authorization diverifikasi di backend (Policy & Gate).</p>
      {user && <Link to={roleBase(user.role)} className="inline-block mt-6"><Btn variant="outline" size="sm">Kembali ke dashboard saya</Btn></Link>}
    </div>
  );
}

const roleSlug: Record<string, string> = { super_admin: "super-admin", admin: "admin", instructor: "instructor", student: "student" };

function DashArea() {
  const { db, user } = useApp();
  const { role } = useParams();
  if (!db) return <Navigate to="/install" replace />;
  if (!user) return <Navigate to="/login" replace />;
  if (roleSlug[user.role] !== role) return <Navigate to={roleBase(user.role)} replace />;
  const allowed = new Set(dashMenu(user.role).flatMap((g) => g.items.map((i) => i.to)));
  const Guard = ({ seg, children }: { seg: string; children: React.ReactNode }) =>
    allowed.has(seg) ? <>{children}</> : <AccessDenied />;
  const overview = user.role === "super_admin" ? <SuperAdminOverview /> : user.role === "admin" ? <AdminOverview /> : user.role === "instructor" ? <InstructorOverview /> : <StudentOverview />;
  return (
    <Routes>
      <Route index element={overview} />
      <Route path="articles" element={<Guard seg="articles"><ContentManager kind="articles" /></Guard>} />
      <Route path="news" element={<Guard seg="news"><ContentManager kind="news" /></Guard>} />
      <Route path="tutorials" element={<Guard seg="tutorials"><ContentManager kind="tutorials" /></Guard>} />
      <Route path="pages" element={<Guard seg="pages"><PagesManager /></Guard>} />
      <Route path="media" element={<Guard seg="media"><MediaManager /></Guard>} />
      <Route path="courses" element={<Guard seg="courses"><CoursesManager /></Guard>} />
      <Route path="quizzes" element={<Guard seg="quizzes"><QuizManager /></Guard>} />
      <Route path="students" element={<Guard seg="students"><StudentsManager /></Guard>} />
      <Route path="instructors" element={<Guard seg="instructors"><InstructorsManager /></Guard>} />
      <Route path="certificates" element={<Guard seg="certificates">{user.role === "student" ? <StudentCertificates /> : <CertificatesManager />}</Guard>} />
      <Route path="programs" element={<Guard seg="programs"><ProgramsManager /></Guard>} />
      <Route path="home-cms" element={<Guard seg="home-cms"><HomeCMS /></Guard>} />
      <Route path="about-cms" element={<Guard seg="about-cms"><AboutCMS /></Guard>} />
      <Route path="menus" element={<Guard seg="menus"><MenuManager /></Guard>} />
      <Route path="payments" element={<Guard seg="payments">{user.role === "student" ? <StudentPaymentsPage /> : <PaymentsManager />}</Guard>} />
      <Route path="transactions" element={<Guard seg="transactions"><TransactionsManager /></Guard>} />
      <Route path="withdrawals" element={<Guard seg="withdrawals"><WithdrawalsManager /></Guard>} />
      <Route path="wallet" element={<Guard seg="wallet"><WalletPage /></Guard>} />
      <Route path="my-courses" element={<Guard seg="my-courses"><MyCoursesPage /></Guard>} />
      <Route path="grades" element={<Guard seg="grades"><GradesPage /></Guard>} />
      <Route path="youtube" element={<Guard seg="youtube"><IntegrationsPage kind="youtube" /></Guard>} />
      <Route path="zoom" element={<Guard seg="zoom"><IntegrationsPage kind="zoom" /></Guard>} />
      <Route path="gmeet" element={<Guard seg="gmeet"><IntegrationsPage kind="gmeet" /></Guard>} />
      <Route path="gateway" element={<Guard seg="gateway"><GatewayPage /></Guard>} />
      <Route path="website" element={<Guard seg="website"><WebsiteSettings /></Guard>} />
      <Route path="seo" element={<Guard seg="seo"><SeoSettings /></Guard>} />
      <Route path="language" element={<Guard seg="language"><LanguageSettings /></Guard>} />
      <Route path="users" element={<Guard seg="users"><UsersManager /></Guard>} />
      <Route path="roles" element={<Guard seg="roles"><RolesManager /></Guard>} />
      <Route path="system" element={<Guard seg="system"><SystemPage /></Guard>} />
      <Route path="activity" element={<Guard seg="activity"><ActivityPage /></Guard>} />
      <Route path="*" element={<AccessDenied />} />
    </Routes>
  );
}

function StudentCertificates() {
  const { db, user } = useApp();
  if (!db || !user) return null;
  const certs = db.certificates.filter((c) => c.studentId === user.id);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div><h1 className="font-display text-[22px] font-bold text-ink-900 dark:text-white tracking-tight">Sertifikat Saya</h1><p className="text-[13.5px] text-ink-400 mt-0.5">{certs.length} sertifikat digital terverifikasi</p></div>
      </div>
      {certs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 dark:border-ink-700 py-14 text-center">
          <Award size={22} className="mx-auto text-ink-300" />
          <p className="mt-3 font-display font-semibold text-ink-700 dark:text-ink-100">Belum ada sertifikat</p>
          <p className="text-sm text-ink-400 mt-1">Selesaikan kelas dan lulus quiz akhir untuk mendapat sertifikat.</p>
          <Link to="/courses" className="inline-block mt-4"><Btn size="sm">Cari Kelas</Btn></Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {certs.map((c) => {
            const course = db.courses.find((x) => x.id === c.courseId);
            return (
              <Link key={c.id} to={`/certificate/${c.code}`} className="group rounded-xl border border-accent-400/40 bg-card dark:bg-ink-900 p-5 hover:shadow-pop transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl bg-accent-500/15 text-accent-600 dark:text-accent-300 flex items-center justify-center"><Award size={20} /></span>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-ink-900 dark:text-white leading-snug">{course?.title}</p>
                    <p className="text-[11.5px] font-mono text-ink-400 mt-0.5">{c.code} · {fmtDate(c.issuedAt)}</p>
                  </div>
                </div>
                <p className="mt-3 text-[12px] font-bold text-brand-600 dark:text-brand-300 group-hover:underline underline-offset-2">Lihat & unduh sertifikat →</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <p className="font-mono text-brand-600 dark:text-brand-300 text-sm">404 · page not found</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink-900 dark:text-white">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-ink-400">URL yang kamu tuju tidak ada atau sudah dipindahkan.</p>
      <Link to="/" className="inline-block mt-6"><Btn>Kembali ke beranda</Btn></Link>
    </div>
  );
}

function Shell() {
  const { db } = useApp();
  return (
    <>
      <Routes>
        <Route path="/install" element={<InstallPage />} />
        <Route path="/login" element={<LoginGate><LoginPage /></LoginGate>} />
        <Route path="/register" element={<LoginGate><RegisterPage /></LoginGate>} />
        <Route path="/forgot" element={<LoginGate><ForgotPage /></LoginGate>} />
        <Route path="/certificate/:code" element={<InstallGate><CertificatePage /></InstallGate>} />
        <Route path="/learn/:courseId" element={<InstallGate><LearnPlayer /></InstallGate>} />
        <Route path="/learn/:courseId/:lessonId" element={<InstallGate><LearnPlayer /></InstallGate>} />
        <Route path="/verify-certificate" element={<InstallGate><PublicShell><VerifyCertificatePage /></PublicShell></InstallGate>} />
        <Route path="/verify-certificate/:id" element={<InstallGate><PublicShell><VerifyCertificatePage /></PublicShell></InstallGate>} />
        <Route element={<InstallGate><PublicGate><PublicShell /></PublicGate></InstallGate>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/tutorials" element={<TutorialsPage />} />
          <Route path="/tutorials/:slug" element={<TutorialDetail />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/programs/:slug" element={<ProgramDetail />} />
          <Route path="/page/:slug" element={<CustomPage />} />
        </Route>
        <Route path="/dashboard" element={<RoleRedirect />} />
        <Route path="/dashboard/:role/*" element={<InstallGate><DashShell><DashArea /></DashShell></InstallGate>} />
        <Route path="*" element={db ? <PublicShell><NotFound /></PublicShell> : <Navigate to="/install" replace />} />
      </Routes>
      <ToastHost />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </AppProvider>
  );
}
