import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  UserRoundCheck,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { appContext } from "../appContext";
import Page from "./ui/Page";
import Button from "./ui/Button";
import Field from "./ui/Field";

export default function Register() {
  const { user, setUser } = useContext(appContext);
  const [msg, setMsg] = useState();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const Navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL ?? "";

  const handleSubmit = async () => {
    // Light client-side validation before touching the API
    if (!user.name || !user.email || !user.pass) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(user.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (user.pass.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Unchanged endpoint + payload shape ({ name, email, pass })
    setLoading(true);
    try {
      const url = `${API}/api/user/register`;
      await axios.post(url, user);
      toast.success("Account created! Please log in.");
      Navigate("/login");
    } catch (err) {
      console.log(err);
      setMsg("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="mx-auto flex w-full max-w-md flex-col px-4 py-12 sm:py-16">
      {/* Centered glass card */}
      <div className="glass rounded-3xl p-8 sm:p-10">
        <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-500 shadow-lg shadow-cyan-500/30">
          <UserRoundCheck className="h-6 w-6 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Join Electronics Hub to start ordering premium tech.
        </p>

        {/* Inline error — expands/collapses with AnimatePresence */}
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

        {/* Same context bindings as the original ({ ...user, name/email/pass }) */}
        <div className="mt-6 space-y-4">
          <Field
            icon={User}
            label="Name"
            type="text"
            placeholder="Enter name"
            value={user.name ?? ""}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
          />
          <Field
            icon={Mail}
            label="Email"
            type="text"
            placeholder="Email address"
            value={user.email ?? ""}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
          <Field
            icon={Lock}
            label="Password"
            type={showPass ? "text" : "password"}
            placeholder="New password (min. 6 characters)"
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

        <Button
          className="mt-7 w-full"
          loading={loading}
          onClick={handleSubmit}
        >
          {loading ? "Creating account…" : "Create Account"}
        </Button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already a member?{" "}
          <Link
            to="/login"
            className="font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
          >
            Log In
          </Link>
        </p>
      </div>
    </Page>
  );
}
