import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter = ({ value, duration = 2, suffix = '', decimals = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hasTriggered, setHasTriggered] = useState(false);

  // We use a spring for smooth number animation
  const springValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  // Transform the spring value to a string with the correct number of decimals
  const displayValue = useTransform(springValue, (current) => current.toFixed(decimals));

  useEffect(() => {
    if (isInView && !hasTriggered) {
      springValue.set(value);
      setHasTriggered(true);
    }
  }, [isInView, value, springValue, hasTriggered]);

  return (
    <motion.span ref={ref} className="inline-flex items-center">
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </motion.span>
  );
};

export default AnimatedCounter;
