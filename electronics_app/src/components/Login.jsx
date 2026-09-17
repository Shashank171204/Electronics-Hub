import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Eye, EyeOff, LogIn, Lock, Mail } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { appContext } from "../appContext";
import Page from "./ui/Page";
import Button from "./ui/Button";
import Field from "./ui/Field";

export default function Login() {
  const Navigate = useNavigate();
  const { user, setUser } = useContext(appContext);
  const [msg, setMsg] = useState();
  const [loading, setLoading] = useState(false);
  // NEW: show/hide password toggle
  const [showPass, setShowPass] = useState(false);
  const API = import.meta.env.VITE_API_URL ?? "";

  const handleSubmit = async () => {
    // Unchanged endpoint + payload (the whole `user` object is POSTed,
    // exactly like before — the server reads email/pass out of it)
    setLoading(true);
    try {
      const url = `${API}/api/user/login`;
      await axios.post(url, user);
      toast.success(`Welcome back${user.name ? `, ${user.name}` : ""}!`);
      Navigate("/");
    } catch (err) {
      console.log(err);
      setMsg("Invalid credentials"); // inline error (kept from the original)
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="mx-auto flex w-full max-w-md flex-col px-4 py-12 sm:py-16">
      {/* Centered glass card */}
      <div className="glass rounded-3xl p-8 sm:p-10">
        {/* Gradient icon medallion */}
        <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-500 shadow-lg shadow-cyan-500/30">
          <LogIn className="h-6 w-6 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Log in to place orders and track your purchases.
        </p>

        {/* Inline error — expands/collapses with AnimatePresence
            (replaces the old sliding red text) */}
        <AnimatePresence initial={false}>
          {msg && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" /> {msg}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 space-y-4">
          {/* Same context bindings as the original ({ ...user, email }) */}
          <Field
            icon={Mail}
            label="Email"
            type="text"
            placeholder="Email address"
            value={user.email ?? ""}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Field
            icon={Lock}
            label="Password"
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={user.pass ?? ""}
            onChange={(e) => setUser({ ...user, pass: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            trailing={
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label="Toggle password visibility"
                className="text-slate-500 transition-colors hover:text-slate-300"
              >
                {showPass ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />
        </div>

        {/* Full-width CTA with an inline spinner while the request runs */}
        <Button
          className="mt-7 w-full"
          loading={loading}
          onClick={handleSubmit}
        >
          {loading ? "Signing in…" : "Log In"}
        </Button>

        <p className="mt-6 text-center text-sm text-slate-400">
          New user?{" "}
          <Link
            to="/register"
            className="font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
          >
            Create an account
          </Link>
        </p>
      </div>
    </Page>
  );
}
