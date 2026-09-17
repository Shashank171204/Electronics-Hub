/**
 * Shared Framer Motion variants.
 * Keeping them in one place means every page/list animates with the same
 * "feel": a soft ease-out curve and a 60–80ms stagger between siblings.
 */

// The signature easing curve used across the app (fast start, gentle landing)
export const EASE = [0.22, 1, 0.36, 1];

/**
 * Whole-page transition: fades in while sliding up 24px on mount,
 * and fades / slightly slides out on route change (driven by the
 * <AnimatePresence> in App.jsx).
 */
export const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.22, ease: "easeIn" } },
};

/**
 * Container variant for staggered lists/grids.
 * `staggerChildren` = seconds between each child appearing,
 * `delayChildren`   = pause before the first child starts.
 */
export const staggerContainer = (stagger = 0.07, delay = 0.05) => ({
  initial: {},
  animate: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/** Child variant paired with `staggerContainer`: fade + slide up. */
export const fadeUpItem = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};
