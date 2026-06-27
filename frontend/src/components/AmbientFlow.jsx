import React from 'react';

// Ultra-lightweight, purely CSS-driven ambient background.
// Adapted for Midnight Glass Theme
const AmbientFlow = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-transparent pointer-events-none">
      
      {/* 
        The solid white/slate background has been completely removed.
        This allows the body's animated linear-gradient (from index.css) to shine through perfectly!
      */}
      
      {/* Emerald Glow (Top Left) */}
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] max-w-[50rem] max-h-[50rem] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.15)_0%,rgba(0,0,0,0)_70%)] mix-blend-screen"></div>
      
      {/* Teal Glow (Bottom Right) */}
      <div className="absolute bottom-[-20%] right-[-10%] w-[90vw] h-[90vw] max-w-[56rem] max-h-[56rem] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.12)_0%,rgba(0,0,0,0)_70%)] mix-blend-screen"></div>
      
      {/* Blue Glow (Center Left) */}
      <div className="absolute top-[30%] left-[-20%] w-[60vw] h-[60vw] max-w-[37rem] max-h-[37rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,rgba(0,0,0,0)_70%)] mix-blend-screen"></div>

    </div>
  );
};

export default AmbientFlow;