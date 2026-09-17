import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LogIn, ShoppingCart, Trash2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { appContext } from "../appContext";
import Page from "./ui/Page";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";
import QuantityStepper from "./ui/QuantityStepper";
import { staggerContainer, fadeUpItem } from "./ui/motionVariants";

export default function Cart() {
  const { products, cart, setCart, user } = useContext(appContext);
  const Navigate = useNavigate();
  // NEW: shows a spinner on the Place Order button while the POST is in flight
  const [placing, setPlacing] = useState(false);
  const API = import.meta.env.VITE_API_URL ?? "";

  // ---- Same state updates as the original ----
  const handleDelete = (id) => {
    setCart({ ...cart, [id]: 0 });
    toast("Removed from cart", { icon: "🗑️" });
  };
  const increment = (id) => setCart({ ...cart, [id]: cart[id] + 1 });
  const decrement = (id) => setCart({ ...cart, [id]: cart[id] - 1 });

  const placeOrder = async () => {
    // Unchanged endpoint + payload shape: { email, items, total }
    const order = {
      email: user.email,
      items: cart,
      total: orderValue,
    };
    setPlacing(true);
    try {
      const url = `${API}/api/order/neworder`;
      await axios.post(url, order);
      setCart({});
      toast.success("Order placed successfully! 🎉");
      Navigate("/orders");
    } catch (err) {
      console.log(err);
      toast.error("Couldn't place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  // Total is now derived state (same reduce, same value) — always in sync
  // with cart/products and it removes the old setState-in-effect.
  const orderValue = products.reduce(
    (sum, value) => sum + value.price * (cart[value._id] ?? 0),
    0
  );

  // Rows to render — removed items are set to 0 (not deleted) by the
  // original logic, so we filter on positive quantity.
  const cartItems = products.filter((value) => (cart[value._id] ?? 0) > 0);
  const itemCount = cartItems.reduce((sum, v) => sum + cart[v._id], 0);

  return (
    <Page className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Checkout
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your <span className="text-gradient">Cart</span>
          </h1>
        </div>
        {cartItems.length > 0 && (
          <span className="glass rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-300">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {cartItems.length === 0 ? (
        /* Empty cart — icon + helpful copy + shortcut back to the catalog */
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore the catalog and find something you'll love."
          action={
            <Button onClick={() => Navigate("/")}>
              Browse products <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Cart rows — stagger in on mount; removed rows slide out while
              the survivors reflow smoothly thanks to `layout` */}
          <motion.div
            variants={staggerContainer(0.06)}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            <AnimatePresence initial={false}>
              {cartItems.map((value) => (
                <motion.div
                  key={value._id}
                  layout
                  variants={fadeUpItem}
                  exit={{ opacity: 0, x: -32, transition: { duration: 0.25 } }}
                  className="glass flex flex-wrap items-center gap-4 rounded-2xl p-4"
                >
                  <img
                    src={value.url}
                    alt={value.name}
                    className="h-16 w-16 rounded-xl object-cover sm:h-20 sm:w-20"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display font-semibold text-white">
                      {value.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-400">
                      ₹{Number(value.price).toLocaleString("en-IN")} each
                    </p>
                  </div>

                  <QuantityStepper
                    size="sm"
                    quantity={cart[value._id]}
                    onIncrement={() => increment(value._id)}
                    onDecrement={() => decrement(value._id)}
                  />

                  {/* Row total */}
                  <p className="hidden w-24 text-right font-semibold text-cyan-300 sm:block">
                    ₹{Number(value.price * cart[value._id]).toLocaleString("en-IN")}
                  </p>

                  {/* Remove — tactile press + danger tint */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(value._id)}
                    aria-label={`Remove ${value.name}`}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-rose-400/20 bg-rose-500/10 text-rose-300 transition-colors hover:bg-rose-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Sticky order summary (slides in after the rows) */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="glass rounded-2xl p-6 lg:sticky lg:top-24"
          >
            <h2 className="font-display text-lg font-semibold text-white">
              Order Summary
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <dt>Items</dt>
                <dd className="text-slate-200">{itemCount}</dd>
              </div>
              <div className="flex justify-between text-slate-400">
                <dt>Subtotal</dt>
                <dd className="text-slate-200">
                  ₹{Number(orderValue).toLocaleString("en-IN")}
                </dd>
              </div>
              <div className="flex justify-between text-slate-400">
                <dt>Shipping</dt>
                <dd className="font-medium text-emerald-300">FREE</dd>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 font-display text-base font-semibold text-white">
                <dt>Total</dt>
                <dd className="text-cyan-300">
                  ₹{Number(orderValue).toLocaleString("en-IN")}
                </dd>
              </div>
            </dl>

            {user.email ? (
              <>
                {/* Same placeOrder flow; the button shows a spinner while the
                    POST is in flight (the original had none) */}
                <Button
                  className="mt-6 w-full"
                  loading={placing}
                  onClick={placeOrder}
                >
                  {placing ? "Placing order…" : "Place Order"}
                </Button>
                <p className="mt-3 truncate text-center text-xs text-slate-500">
                  Ordering as {user.email}
                </p>
              </>
            ) : (
              <Button
                variant="glass"
                className="mt-6 w-full"
                onClick={() => Navigate("/login")}
              >
                <LogIn className="h-4 w-4" /> Login to Order
              </Button>
            )}
          </motion.aside>
        </div>
      )}
    </Page>
  );
}
