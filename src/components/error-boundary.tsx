import { Component } from "react";

interface EBState { error: Error | null; }

/** Production error boundary — menampilkan halaman pemulihan alih-alih layar putih. */
export class ErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
  state: EBState = { error: null };
  static getDerivedStateFromError(error: Error): EBState { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-ink-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-lg w-full rounded-2xl border border-ink-800 bg-ink-900/90 backdrop-blur p-8 shadow-pop">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-bad-500/15 text-bad-500 flex items-center justify-center font-display font-bold text-lg">!</span>
            <div>
              <p className="font-mono text-[11px] text-bad-500 uppercase tracking-wider">runtime exception</p>
              <h1 className="font-display text-xl font-bold">Terjadi kesalahan tak terduga</h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-300 leading-relaxed">
            Aplikasi berhasil memulihkan diri dari crash. Data Anda aman — muat ulang untuk melanjutkan.
          </p>
          <details className="mt-4 rounded-lg bg-ink-950 border border-ink-800 p-3">
            <summary className="cursor-pointer text-[12px] font-mono text-ink-400">detail error (untuk developer)</summary>
            <pre className="mt-2 text-[11px] font-mono text-bad-500/90 whitespace-pre-wrap break-words">{this.state.error.message}</pre>
          </details>
          <div className="mt-6 flex gap-2">
            <button onClick={() => window.location.reload()}
              className="grow h-11 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold transition-colors">Muat Ulang Aplikasi</button>
            <button onClick={() => { this.setState({ error: null }); window.location.hash = "#/"; }}
              className="h-11 px-4 rounded-lg border border-ink-700 text-sm font-bold text-ink-200 hover:bg-ink-800 transition-colors">Ke Beranda</button>
          </div>
        </div>
      </div>
    );
  }
}
