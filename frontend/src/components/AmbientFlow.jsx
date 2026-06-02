import React from 'react';
import { motion } from 'framer-motion';

const AmbientFlow = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-50/10">
      
      {/* Blob 1: Soft Orange (Top Left) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.5, // Cranked up from 0.15
          x: [0, 80, -40, 0],
          y: [0, 60, -60, 0],
          scale: [1, 1.1, 0.9, 1],
          rotate: [0, 90, 180, 360]
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-[#FF8C42] rounded-full mix-blend-multiply filter blur-[100px]"
      />

      {/* Blob 2: Mint Green (Top Right) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.6, // Cranked up from 0.25
          x: [0, -100, 50, 0],
          y: [0, -80, 40, 0],
          scale: [1, 1.2, 0.8, 1],
          rotate: [360, 180, 90, 0]
        }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        className="absolute top-[5%] right-[-10%] w-175 h-175 bg-[#E0F2F1] rounded-full mix-blend-multiply filter blur-[120px]"
      />

      {/* Blob 3: Soft Orange (Bottom Center/Left) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.4, // Cranked up from 0.12
          x: [0, 60, -80, 0],
          y: [0, -100, 40, 0],
          scale: [1, 0.9, 1.1, 1],
          rotate: [0, -90, -180, -360]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] left-[20%] w-125 h-125 bg-[#FF8C42] rounded-full mix-blend-multiply filter blur-[100px]"
      />

      {/* Blob 4: Mint Green (Bottom Right) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.5, // Cranked up from 0.15
          x: [0, -50, 30, 0],
          y: [0, 40, -40, 0],
          scale: [1, 1.1, 0.9, 1]
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[10%] right-[10%] w-100 h-100 bg-[#E0F2F1] rounded-full mix-blend-multiply filter blur-[80px]"
      />
    </div>
  );
};

export default AmbientFlow;