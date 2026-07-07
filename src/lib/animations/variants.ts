import type { Variants } from "motion/react";

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.34, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(4px)",
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

export const revealContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.03,
    },
  },
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.32, ease: "easeOut" },
  },
};

export const pressable: Variants = {
  rest: { scale: 1, y: 0 },
  tap: { scale: 0.985, y: 1 },
};

export const feedbackVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
};

export const successPulse = {
  scale: [1, 1.03, 1],
  boxShadow: [
    "0 0 0 rgba(46, 204, 113, 0)",
    "0 0 32px rgba(46, 204, 113, 0.28)",
    "0 0 0 rgba(46, 204, 113, 0)",
  ],
};

export const errorShake = {
  x: [0, -8, 8, -6, 6, 0],
};
