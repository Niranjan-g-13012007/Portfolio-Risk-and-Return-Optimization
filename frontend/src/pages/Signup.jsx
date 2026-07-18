import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check, Eye, EyeOff, LineChart, Loader2, Mail, Phone, Shield, UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authApi } from "../services/authApi";

const STRENGTH_RULES = [
  { label: "Minimum 8 characters",      test: (p) => p.length >= 8 },
  { label: "Uppercase letter",           test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter",           test: (p) => /[a-z]/.test(p) },
  { label: "Number",                     test: (p) => /\d/.test(p) },
  { label: "Special character",          test: (p) => /[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(p) },
];

export default function Signup() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password", "");
  const strength = STRENGTH_RULES.filter((r) => r.test(password)).length;

  async function onSubmit({ name, email, phone, password, confirm }) {
    if (password !== confirm) {
      showToast("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await authApi.signup({ name, email, phone, password });
      login(token, user);
      showToast("Account created! Welcome to OptiVest 🎉", "success");
      navigate("/");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const strengthColor = ["", "bg-rose-500", "bg-amber-500", "bg-amber-400", "bg-emerald-400", "bg-emerald-500"][strength];
  const strengthLabel = ["", "Very weak", "Weak", "Fair", "Good", "Strong"][strength];

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
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
          <h1 className="font-display text-2xl font-semibold text-white">Create your account</h1>
          <p className="mt-1.5 text-sm text-slate-400">Start saving and comparing your portfolios</p>
        </div>

        <div className="glass-panel p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Full Name</label>
              <input
                {...register("name", { required: "Full name is required", minLength: { value: 2, message: "At least 2 characters" } })}
                placeholder="Niranjan G"
                className="auth-input"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register("email", { required: "Email is required", pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Invalid email" } })}
                  placeholder="you@email.com"
                  className="auth-input pl-10"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register("phone", { required: "Phone number is required", pattern: { value: /^\+?[0-9]{7,15}$/, message: "Invalid phone number" } })}
                  placeholder="+91 9876543210"
                  className="auth-input pl-10"
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-rose-400">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", { required: "Password is required" })}
                  placeholder="Create a strong password"
                  className="auth-input pr-12"
                />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-white/10"}`} />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {STRENGTH_RULES.map((rule) => {
                      const ok = rule.test(password);
                      return (
                        <div key={rule.label} className={`flex items-center gap-1.5 text-[11px] ${ok ? "text-emerald-400" : "text-slate-500"}`}>
                          <Check size={10} className={ok ? "opacity-100" : "opacity-0"} />
                          <span>{rule.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Confirm Password</label>
              <div className="relative">
                <Shield size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  {...register("confirm", { required: "Please confirm your password" })}
                  placeholder="Repeat password"
                  className="auth-input pl-10"
                />
              </div>
              {errors.confirm && <p className="mt-1 text-xs text-rose-400">{errors.confirm.message}</p>}
            </div>

            <button type="submit" disabled={loading || strength < 4} className="btn-primary w-full !py-3.5 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
