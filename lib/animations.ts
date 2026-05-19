import type { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export const item: Variants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export const slideLeft: Variants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48, transition: { duration: 0.22 } }),
};

export const menuVariant: Variants = {
  hidden:  { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.22, ease: "easeOut" } },
  exit:    { opacity: 0, height: 0,      transition: { duration: 0.16 } },
};

export const faqVariant: Variants = {
  hidden:  { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.28, ease: "easeOut" } },
  exit:    { opacity: 0, height: 0,      transition: { duration: 0.2  } },
};

// Pro card breathe — apply as animate prop directly
export const breatheAnimate = {
  boxShadow: [
    "0 0 0px 0px rgba(249,115,22,0)",
    "0 0 52px 6px rgba(249,115,22,0.20)",
    "0 0 0px 0px rgba(249,115,22,0)",
  ],
  transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const },
};

// Blob hero — apply as animate prop directly
export const blobAnimate = {
  scale: [1, 1.18, 0.92, 1.07, 1],
  x:     [0,  34,  -18,   12,  0],
  y:     [0, -18,   30,   -8,  0],
  transition: { duration: 16, repeat: Infinity, ease: "easeInOut" as const },
};

export const blobAnimate2 = {
  scale: [1, 1.25, 0.88, 1.12, 1],
  x:     [0, -22,   28,  -10,  0],
  y:     [0,  28,  -18,   10,  0],
  transition: { duration: 20, repeat: Infinity, ease: "easeInOut" as const },
};
