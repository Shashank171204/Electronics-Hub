import { motion } from "framer-motion";

/**
 * Attractive empty state: glowing icon medallion, title, helpful copy and an
 * optional action button. Used whenever a query returns no results
 * (catalog, cart, orders, logged-out guards).
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass mx-auto flex w-full max-w-md flex-col items-center rounded-3xl px-8 py-14 text-center"
    >
      {/* Icon inside a soft gradient glow */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/40 to-violet-500/40 blur-xl" />
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-gradient-to-tr from-cyan-500/20 to-violet-500/20">
          <Icon className="h-7 w-7 text-cyan-300" />
        </div>
      </div>

      <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
