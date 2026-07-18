import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LineChart, Loader2, LogIn, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authApi } from "../services/authApi";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname ?? "/";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { identifier: "", password: "" } });

  async function onSubmit({ identifier, password }) {
    setLoading(true);
    try {
      const { token, user } = await authApi.login(identifier, password);
      login(token, user);
      showToast(`Welcome back, ${user.name.split(" ")[0]}!`, "success");
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-skyline-500 shadow-glow">
            <LineChart size={26} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-400">Sign in to access your portfolio history</p>
        </div>

        <div className="glass-panel p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Identifier */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Email or Phone Number
              </label>
              <div className="relative">
                <Phone size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register("identifier", { required: "Email or phone is required" })}
                  placeholder="you@email.com or +91 9876543210"
                  className="auth-input pl-10"
                />
              </div>
              {errors.identifier && <p className="mt-1 text-xs text-rose-400">{errors.identifier.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", { required: "Password is required" })}
                  placeholder="••••••••"
                  className="auth-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
