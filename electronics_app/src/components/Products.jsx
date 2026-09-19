import { useContext } from "react";
import { motion } from "framer-motion";
import { PackageOpen, RefreshCw, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { appContext } from "../appContext";
import Page from "./ui/Page";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";
import QuantityStepper from "./ui/QuantityStepper";
import { ProductCardSkeleton } from "./ui/Skeleton";
import { staggerContainer, fadeUpItem } from "./ui/motionVariants";

export default function Products() {
  const {
    products,
    productsLoading,
    refetchProducts,
    searchQuery,
    setSearchQuery,
    searchProducts,
    cart,
    setCart,
  } = useContext(appContext);

  // ---- Cart handlers: exact same state updates as the original ----
  const addToCart = (id) => {
    !cart[id] && setCart({ ...cart, [id]: 1 });
  };
  const increment = (id) => {
    setCart({ ...cart, [id]: cart[id] + 1 });
  };
  const decrement = (id) => {
    setCart({ ...cart, [id]: cart[id] - 1 });
  };

  return (
    <Page className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page heading with a gradient accent word */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Catalog
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Fresh <span className="text-gradient">Tech Drops</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            Hand-picked electronics with premium build quality, delivered to
            your door.
          </p>
        </div>
        {products.length > 0 && (
          <span className="glass rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-300">
            {products.length} products
          </span>
        )}
      </div>

      {/* 1 · API in flight → shimmering skeleton cards (no layout jump) */}
      {productsLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        /* 2 · API returned nothing → friendly empty state with a retry action */
        <EmptyState
          icon={PackageOpen}
          title={searchQuery ? `No matches for "${searchQuery}"` : "No products yet"}
          description={
            searchQuery
              ? "We couldn't find any products matching your search query. Try checking for typos or searching a different term."
              : "The catalog is empty right now. Try refreshing, or check back soon."
          }
          action={
            searchQuery ? (
              <Button
                variant="glass"
                onClick={() => {
                  setSearchQuery("");
                  searchProducts("");
                }}
              >
                Clear Search
              </Button>
            ) : (
              <Button variant="glass" onClick={refetchProducts}>
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
            )
          }
        />
      ) : (
        /* 3 · Data → staggered grid. The container cascades its children in
               via `staggerChildren` (70ms apart, 50ms initial delay) so the
               cards arrive in a smooth wave instead of all at once. */
        <motion.div
          variants={staggerContainer(0.07, 0.05)}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {products.map((value) => (
            <motion.article
              key={value._id}
              variants={fadeUpItem}
              whileHover={{ y: -6 }} /* card lifts 6px on hover */
              className="glass group flex flex-col overflow-hidden rounded-2xl shadow-xl shadow-black/20 transition-shadow duration-300 hover:shadow-[0_24px_60px_-24px_rgba(34,211,238,0.35)]"
            >
              {/* Product image — zooms subtly inside a clipped frame on hover */}
              <div className="relative aspect-square overflow-hidden bg-white/[0.03]">
                <img
                  src={value.url}
                  alt={value.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                />
                {/* Price chip floats over the image */}
                <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-night-950/70 px-3 py-1 text-sm font-bold text-cyan-300 backdrop-blur-md">
                  ₹{Number(value.price).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Card body — line-clamped text keeps every card the same height */}
              <div className="flex flex-1 flex-col gap-1 p-5">
                <h3 className="line-clamp-1 font-display text-lg font-semibold text-white">
                  {value.name}
                </h3>
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
                  {value.desc}
                </p>

                {/* Action row: quantity stepper when in cart, CTA otherwise */}
                <div className="mt-auto pt-4">
                  {cart[value._id] > 0 ? (
                    <QuantityStepper
                      quantity={cart[value._id]}
                      onIncrement={() => increment(value._id)}
                      onDecrement={() => decrement(value._id)}
                    />
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => {
                        addToCart(value._id);
                        toast.success(`${value.name} added to cart`);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </Button>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </Page>
  );
}
