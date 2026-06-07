import React from 'react';

// Ultra-lightweight, purely CSS-driven ambient background.
// Zero Javascript calculations, 100% GPU accelerated, zero frame drops!
const AmbientFlow = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-50 pointer-events-none">
      
      {/* Base soft background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-orange-50/50 via-slate-50 to-emerald-50/50"></div>
      
      {/* THE TRICK: Instead of using expensive 'blur-[100px]' on divs, 
        we use CSS radial-gradients that fade to transparent. 
        This gives the exact same glowing orb effect but renders instantly.
      */}
      
      {/* Orange Glow (Top Left) */}
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] max-w-200 max-h-200 rounded-full bg-[radial-gradient(circle,rgba(251,146,60,0.15)_0%,rgba(255,255,255,0)_70%)]"></div>
      
      {/* Emerald Glow (Bottom Right) */}
      <div className="absolute bottom-[-20%] right-[-10%] w-[90vw] h-[90vw] max-w-225 max-h-225 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.12)_0%,rgba(255,255,255,0)_70%)]"></div>
      
      {/* Blue Glow (Center Left) */}
      <div className="absolute top-[30%] left-[-20%] w-[60vw] h-[60vw] max-w-150 max-h-150 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,rgba(255,255,255,0)_70%)]"></div>

    </div>
  );
};

export default AmbientFlow;