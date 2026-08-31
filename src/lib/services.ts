// ─── Service layer — kontrak endpoint React ↔ Laravel ↔ MySQL ───────────────
// Setiap fungsi memetakan 1:1 ke routes/api.php di folder backend/.
// Dipakai otomatis oleh store saat Mode API aktif (VITE_API_URL menjangkau
// /api/health). Semua fungsi melempar ApiError bila gagal — caller menangani.

import { api, setToken } from "./api";

export interface ApiUser {
  id: string; name: string; email: string; role: string; token?: string;
  color?: string; status?: string;
}

export const AuthApi = {
  login: async (email: string, password: string) => {
    const r = await api.post<{ user: ApiUser; token: string }>("/auth/login", { email, password }, false);
    setToken(r.token);
    return r.user;
  },
  register: async (name: string, email: string, password: string) => {
    const r = await api.post<{ user: ApiUser; token: string }>("/auth/register", { name, email, password }, false);
    setToken(r.token);
    return r.user;
  },
  google: async (name: string, email: string, idToken?: string) => {
    const r = await api.post<{ user: ApiUser; token: string }>("/auth/google", { name, email, id_token: idToken }, false);
    setToken(r.token);
    return r.user;
  },
  me: () => api.get<{ user: ApiUser }>("/auth/me").then((r) => r.user),
  logout: () => api.post("/auth/logout", undefined).finally(() => setToken(null)),
  updateProfile: (body: Record<string, unknown>) => api.put("/auth/profile", body),
  updatePassword: (body: { current: string; password: string }) => api.put("/auth/password", body),
};

export const InstallApi = {
  run: (payload: { admin: { name: string; email: string; password: string }; site: Record<string, string>; database: Record<string, string> }) =>
    api.post("/install", payload, false),
};

export const PublicApi = {
  settings: () => api.get("/public/settings", false),
  menus: () => api.get("/public/menus", false),
  homeSections: () => api.get("/public/home-sections", false),
  courses: (params = "") => api.get(`/public/courses${params}`, false),
  course: (slug: string) => api.get(`/public/courses/${slug}`, false),
  articles: (params = "") => api.get(`/public/articles${params}`, false),
  article: (slug: string) => api.get(`/public/articles/${slug}`, false),
  news: (params = "") => api.get(`/public/news${params}`, false),
  newsItem: (slug: string) => api.get(`/public/news/${slug}`, false),
  tutorials: (params = "") => api.get(`/public/tutorials${params}`, false),
  tutorial: (slug: string) => api.get(`/public/tutorials/${slug}`, false),
  programs: () => api.get("/public/programs", false),
  page: (slug: string) => api.get(`/public/pages/${slug}`, false),
  org: () => api.get("/public/org-structure", false),
  verifyCertificate: (code: string) => api.get(`/public/certificates/verify/${code}`, false),
};

export const LmsApi = {
  enroll: (courseId: string) => api.post(`/courses/${courseId}/enroll`),
  myEnrollments: () => api.get("/enrollments"),
  completeLesson: (lessonId: string) => api.post(`/lessons/${lessonId}/complete`),
  startQuiz: (quizId: string) => api.get(`/quizzes/${quizId}/start`),
  submitQuiz: (quizId: string, answers: Record<string, number[]>) => api.post(`/quizzes/${quizId}/submit`, { answers }),
  myAttempts: () => api.get("/attempts"),
  myCertificates: () => api.get("/my-certificates"),
  myPayments: () => api.get("/my-payments"),
};

export const CheckoutApi = {
  create: (body: { courseId: string; method: string }) => api.post<{ payment_id: string; checkout_url?: string }>("/checkout", body),
  status: (paymentId: string) => api.get<{ status: string }>(`/checkout/${paymentId}/status`),
};

export const WalletApi = {
  show: () => api.get("/instructor-wallet"),
  transactions: () => api.get("/instructor-wallet/transactions"),
  requestWithdrawal: (body: { amount: number; bank: string; account: string }) => api.post("/withdrawals", body),
  mine: () => api.get("/withdrawals"),
};

export const AdminApi = {
  users: {
    list: () => api.get("/admin/users"),
    create: (body: Record<string, unknown>) => api.post("/admin/users", body),
    update: (id: string, body: Record<string, unknown>) => api.put(`/admin/users/${id}`, body),
    remove: (id: string) => api.del(`/admin/users/${id}`),
  },
  courses: {
    create: (body: Record<string, unknown>) => api.post("/admin/courses", body),
    update: (id: string, body: Record<string, unknown>) => api.put(`/admin/courses/${id}`, body),
    remove: (id: string) => api.del(`/admin/courses/${id}`),
  },
  quizzes: {
    create: (body: Record<string, unknown>) => api.post("/admin/quizzes", body),
    update: (id: string, body: Record<string, unknown>) => api.put(`/admin/quizzes/${id}`, body),
    remove: (id: string) => api.del(`/admin/quizzes/${id}`),
  },
  content: {
    save: (kind: "articles" | "news" | "tutorials" | "programs" | "pages", body: Record<string, unknown>, id?: string) =>
      id ? api.put(`/admin/${kind}/${id}`, body) : api.post(`/admin/${kind}`, body),
    remove: (kind: string, id: string) => api.del(`/admin/${kind}/${id}`),
  },
  payments: {
    list: () => api.get("/admin/payments"),
    confirm: (id: string) => api.post(`/admin/payments/${id}/confirm`),
    transactions: () => api.get("/admin/transactions"),
  },
  withdrawals: {
    list: () => api.get("/admin/withdrawals"),
    update: (id: string, body: { status: string; note?: string }) => api.put(`/admin/withdrawals/${id}`, body),
  },
  cms: {
    reorderSections: (order: string[]) => api.put("/admin/home-sections/reorder", { order }),
    saveSection: (body: Record<string, unknown>, id?: string) =>
      id ? api.put(`/admin/home-sections/${id}`, body) : api.post("/admin/home-sections", body),
    orgUnits: {
      save: (body: Record<string, unknown>, id?: string) => (id ? api.put(`/admin/org-units/${id}`, body) : api.post("/admin/org-units", body)),
      remove: (id: string) => api.del(`/admin/org-units/${id}`),
    },
    orgMembers: {
      save: (body: Record<string, unknown>, id?: string) => (id ? api.put(`/admin/org-members/${id}`, body) : api.post("/admin/org-members", body)),
      remove: (id: string) => api.del(`/admin/org-members/${id}`),
    },
  },
};

export const SuperAdminApi = {
  settings: () => api.get("/super-admin/settings"),
  saveSettings: (body: Record<string, string>) => api.put("/super-admin/settings", body),
  roles: () => api.get("/super-admin/roles"),
  syncPermissions: (roleId: string, permissions: string[]) => api.put(`/super-admin/roles/${roleId}/permissions`, { permissions }),
  gateways: () => api.get("/super-admin/gateways"),
  saveGateway: (id: string, body: Record<string, unknown>) => api.put(`/super-admin/gateways/${id}`, body),
  activityLogs: () => api.get("/super-admin/activity-logs"),
  syncLocalSnapshot: (snapshot: unknown) => api.post("/super-admin/system/sync", { snapshot }),
};

export const NotificationApi = {
  list: () => api.get("/notifications"),
  readAll: () => api.put("/notifications/read-all"),
};
