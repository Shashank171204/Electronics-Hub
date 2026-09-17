import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LogIn, PackageCheck, ShoppingBag } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { appContext } from "../appContext";
import Page from "./ui/Page";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";
import { OrderRowSkeleton } from "./ui/Skeleton";
import { staggerContainer, fadeUpItem } from "./ui/motionVariants";

export default function Orders() {
  const API = import.meta.env.VITE_API_URL ?? "";
  const { orders, setOrders, user } = useContext(appContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(Boolean(user.email));

  useEffect(() => {
    // Fetch once per page mount (same as the original) — the empty dep array
    // is intentional, so the exhaustive-deps warning is suppressed.
    // Unchanged endpoint: /api/order/showorder/{email} — but it is now
    // skipped when logged out (the original would have called .../undefined)
    if (!user.email) return;
    const fetchOrders = async () => {
      try {
        const url = `${API}/api/order/showorder/${user.email}`;
        const result = await axios.get(url);
        setOrders(result.data);
      } catch (err) {
        console.log(err);
        toast.error("Couldn't load your orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetch once per page mount, as before

  const formatTotal = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <Page className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          History
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          My <span className="text-gradient">Orders</span>
        </h1>
      </div>

      {!user.email ? (
        /* Logged-out guard with a clear next step */
        <EmptyState
          icon={LogIn}
          title="Sign in to view your orders"
          description="Log in with your account to see your purchase history in one place."
          action={
            <Button onClick={() => navigate("/login")}>
              Go to login <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />
      ) : loading ? (
        <div className="space-y-4">
          <OrderRowSkeleton />
          <OrderRowSkeleton />
          <OrderRowSkeleton />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="When you place an order it will show up here with the date and total."
          action={
            <Button onClick={() => navigate("/")}>
              Browse products <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />
      ) : (
        /* Staggered order list — cards cascade in 80ms apart */
        <motion.div
          variants={staggerContainer(0.08)}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {orders.map((value) => (
            <motion.div
              key={value._id}
              variants={fadeUpItem}
              whileHover={{ scale: 1.01 }}
              className="glass flex flex-wrap items-center gap-4 rounded-2xl p-5 transition-colors duration-300 hover:bg-white/[0.06]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-gradient-to-tr from-cyan-500/20 to-violet-500/20">
                <PackageCheck className="h-5 w-5 text-cyan-300" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-sm font-semibold text-white">
                  Order #{String(value._id).slice(-6).toUpperCase()}
                </h3>
                <p className="mt-0.5 text-sm text-slate-400">
                  {formatDate(value.createdAt)}
                </p>
              </div>
              <span className="glass rounded-full px-3 py-1 text-xs font-medium text-slate-300">
                {Object.keys(value.items).length}{" "}
                {Object.keys(value.items).length === 1 ? "item" : "items"}
              </span>
              <p className="font-display text-base font-bold text-cyan-300">
                {formatTotal(value.total)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </Page>
  );
}
