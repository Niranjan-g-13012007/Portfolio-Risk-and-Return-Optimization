import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  BookOpen, Calendar, CheckCircle, Eye, EyeOff, Key, Loader2,
  Mail, Phone, Save, Shield, User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authApi } from "../services/authApi";

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <span className="section-label">Account</span>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">My Profile</h1>
        <p className="mt-1 text-slate-400">Manage your account information and security settings.</p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Avatar card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel flex flex-col items-center p-8 text-center"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-skyline-500 text-3xl font-bold text-white shadow-glow">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <h2 className="font-display text-lg font-semibold text-white">{user?.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{user?.email}</p>

          <div className="divider-glow my-6 w-full" />

          {/* Stats */}
          <div className="grid w-full grid-cols-1 gap-3">
            <Stat icon={BookOpen} label="Saved Portfolios" value={user?.total_portfolios ?? 0} />
            <Stat
              icon={Calendar}
              label="Member Since"
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
            />
            <Stat
              icon={CheckCircle}
              label="Last Login"
              value={user?.last_login ? new Date(user.last_login).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
            />
          </div>
        </motion.div>

        {/* Edit + password forms */}
        <div className="space-y-6 lg:col-span-2">
          <EditProfileForm user={user} onRefresh={refreshProfile} showToast={showToast} />
          <ChangePasswordForm showToast={showToast} />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-2.5 text-sm text-slate-400">
        <Icon size={14} className="text-slate-600" />
        {label}
      </div>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function EditProfileForm({ user, onRefresh, showToast }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "" },
  });

  async function onSubmit(data) {
    setLoading(true);
    try {
      await authApi.updateProfile(data);
      await onRefresh();
      showToast("Profile updated successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <div className="glass-panel p-6">
        <div className="mb-5 flex items-center gap-2">
          <User size={16} className="text-emerald-400" />
          <h3 className="font-display font-semibold text-white">Personal Information</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Full Name</label>
            <input {...register("name", { required: true, minLength: 2 })} className="auth-input" />
            {errors.name && <p className="mt-1 text-xs text-rose-400">Name must be at least 2 characters</p>}
          </div>

          {/* Email — read only */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Mail size={13} className="text-slate-600" />
              Email Address
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-600">Cannot change</span>
            </label>
            <input
              value={user?.email ?? ""}
              readOnly
              className="auth-input cursor-not-allowed opacity-50"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Phone size={13} className="text-slate-500" />
              Phone Number
            </label>
            <input
              {...register("phone", { required: true, pattern: { value: /^\+?[0-9]{7,15}$/, message: "Invalid phone number" } })}
              className="auth-input"
            />
            {errors.phone && <p className="mt-1 text-xs text-rose-400">{errors.phone.message}</p>}
          </div>

          <button type="submit" disabled={loading || !isDirty} className="btn-primary !py-3">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Changes</>}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

function ChangePasswordForm({ showToast }) {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({ current: false, new: false });
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  async function onSubmit({ current_password, new_password }) {
    setLoading(true);
    try {
      await authApi.changePassword(current_password, new_password);
      showToast("Password changed successfully", "success");
      reset();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div className="glass-panel p-6">
        <div className="mb-5 flex items-center gap-2">
          <Key size={16} className="text-emerald-400" />
          <h3 className="font-display font-semibold text-white">Change Password</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Current Password</label>
            <div className="relative">
              <input
                type={show.current ? "text" : "password"}
                {...register("current_password", { required: "Required" })}
                placeholder="Enter current password"
                className="auth-input pr-12"
              />
              <button type="button" onClick={() => setShow((s) => ({ ...s, current: !s.current }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {show.current ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.current_password && <p className="mt-1 text-xs text-rose-400">{errors.current_password.message}</p>}
          </div>

          {/* New password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">New Password</label>
            <div className="relative">
              <input
                type={show.new ? "text" : "password"}
                {...register("new_password", {
                  required: "Required",
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]).{8,}$/,
                    message: "Must be ≥8 chars with uppercase, lowercase, digit, and special character",
                  },
                })}
                placeholder="New strong password"
                className="auth-input pr-12"
              />
              <button type="button" onClick={() => setShow((s) => ({ ...s, new: !s.new }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {show.new ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.new_password && <p className="mt-1 text-xs text-rose-400">{errors.new_password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-secondary !py-3">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Updating…</> : <><Shield size={15} /> Update Password</>}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
