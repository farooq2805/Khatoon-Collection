import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { user, ready, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (ready && user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message || "Incorrect email or password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-900 p-12 text-white lg:flex">
        <div>
          <div className="font-serif text-3xl tracking-wide">Khatoon</div>
          <div className="text-[11px] uppercase tracking-[0.4em] text-brand-200/70">Collection</div>
        </div>
        <div>
          <p className="max-w-md font-serif text-3xl leading-snug">Run your store from one calm, clear place.</p>
          <p className="mt-4 max-w-md text-sm text-brand-200/80">Orders, customers, abandoned checkouts and your catalogue, in real time.</p>
        </div>
        <div className="text-xs text-brand-200/50">khatooncollection.in</div>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="font-serif text-3xl text-brand-900">Khatoon</div>
            <div className="text-[11px] uppercase tracking-[0.4em] text-brand-500">Collection · Admin</div>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-brand-900">Sign in</h1>
          <p className="mt-1 text-sm text-neutral-500">Use your store admin account.</p>

          <div className="mt-8 space-y-4">
            <label className="block">
              <span className="label">Email</span>
              <input className="input mt-1.5" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="block">
              <span className="label">Password</span>
              <input className="input mt-1.5" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button className="btn-primary mt-6 w-full py-2.5" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
          </button>
          <a href="/forgot-password" className="mt-4 block text-center text-sm text-brand-500 hover:underline">
            Forgot password?
          </a>
        </form>
      </div>
    </div>
  );
}
