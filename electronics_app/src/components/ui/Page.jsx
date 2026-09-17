import { motion } from "framer-motion";
import { pageVariants } from "./motionVariants";

/**
 * Wraps every route so the <AnimatePresence> in App.jsx can play a page
 * transition (fade + slide-up on enter, fade + slide-down on exit) whenever
 * the URL changes. Pages just render <Page className="...">…</Page>.
 */
export default function Page({ children, className = "" }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
