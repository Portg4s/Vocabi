export const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const feedbackVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
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
