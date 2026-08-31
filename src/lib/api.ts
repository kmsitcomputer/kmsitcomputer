// ─── HTTP Client → Laravel REST API → MySQL ─────────────────────────────────
// Base URL dibaca dari .env Vite (VITE_API_URL). Bila kosong/tak terjangkau,
// aplikasi otomatis memakai mode lokal tertanam sehingga situs tetap berfungsi.

const RAW_URL = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");
export const API_URL = RAW_URL ? `${RAW_URL}/api` : "";
export const apiConfigured = () => API_URL !== "";

const TOKEN_KEY = "kmsit_api_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function request<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown; auth?: boolean; timeout?: number } = {},
): Promise<T> {
  if (!apiConfigured()) throw new ApiError(0, "API tidak dikonfigurasi (VITE_API_URL kosong).");
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), opts.timeout ?? 12000);
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
  if (opts.auth !== false && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: ctrl.signal,
    });
    const text = await res.text();
    let data: unknown = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (res.status === 401) { setToken(null); window.dispatchEvent(new Event("kmsit:unauthorized")); }
    if (!res.ok) {
      const msg = (data as { message?: string })?.message ?? `HTTP ${res.status}`;
      throw new ApiError(res.status, msg);
    }
    return data as T;
  } finally {
    window.clearTimeout(timer);
  }
}

export const api = {
  get: <T = unknown>(p: string, auth = true) => request<T>(p, { auth }),
  post: <T = unknown>(p: string, body?: unknown, auth = true) => request<T>(p, { method: "POST", body, auth }),
  put: <T = unknown>(p: string, body?: unknown) => request<T>(p, { method: "PUT", body }),
  del: <T = unknown>(p: string) => request<T>(p, { method: "DELETE" }),
};

/** Pengecekan kesehatan Laravel + MySQL (endpoint /api/health). */
export async function checkApiHealth(): Promise<{ online: boolean; detail: string }> {
  if (!apiConfigured()) return { online: false, detail: "VITE_API_URL belum diset (.env frontend)." };
  try {
    const r = await request<{ status: string; db?: string; app?: string }>("/health", { auth: false, timeout: 6000 });
    if (r.status === "ok" && r.db !== "mysql" && r.db !== undefined)
      return { online: true, detail: `API aktif tetapi driver "${r.db}" — wajib mysql.` };
    return { online: r.status === "ok", detail: r.status === "ok" ? `${r.app ?? "Laravel"} · driver ${r.db ?? "?"}` : "Respons tidak valid." };
  } catch (e) {
    return { online: false, detail: e instanceof ApiError ? `${e.message} — cek CORS & URL backend.` : "Backend tidak terjangkau." };
  }
}
