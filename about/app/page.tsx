"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, ArrowLeft, User, Sparkles, Terminal, Compass } from "lucide-react";
import Head from "next/head";

export default function AboutPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden font-sans bg-[#030108] text-[#f0e6d2]">
      {/* Dynamic Background Glow */}
      <div 
        className="ambient-glow bg-[var(--color-secondary)] w-[600px] h-[600px] transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePosition.x - 300}px, ${mousePosition.y - 300}px)`,
          opacity: 0.15
        }}
      />
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#ccff00]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-8 py-8 mix-blend-difference pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
          <a 
            href="http://127.0.0.1:8080" 
            className="group flex flex-col gap-1 text-[#f0e6d2]/50 hover:text-[var(--color-secondary)] transition-all duration-500"
          >
            <span className="text-[10px] tracking-[0.3em] uppercase opacity-40">Return to</span>
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ x: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.div>
              <span className="text-sm font-bold tracking-widest uppercase italic">The Galaxy</span>
            </div>
          </a>
          
          <div className="hidden md:flex flex-col items-end opacity-40">
            <span className="text-[10px] tracking-[0.3em] uppercase mb-1">Sector</span>
            <span className="text-xs font-serif italic text-white">About Me</span>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 min-h-screen flex flex-col xl:flex-row items-center xl:items-start gap-16">
        
        {/* Left Column: Hero Intro */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -50 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="flex-1 flex flex-col justify-center sticky top-32"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-[var(--color-secondary)]" />
            <span className="text-[var(--color-secondary)] tracking-[0.3em] uppercase text-sm font-bold">Identity Profile</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif font-light leading-tight mb-4">
            Hello, I'm <br />
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
              ALISH
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/50 tracking-widest uppercase mb-8">
            अलिश | અલિશ
          </p>

          <div className="glass-panel p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <User className="w-32 h-32" />
            </div>
            <span className="inline-block px-3 py-1 bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] text-xs tracking-widest uppercase rounded-full mb-4 border border-[var(--color-secondary)]/30">
              Meaning: Noble
            </span>
            <p className="text-lg leading-relaxed text-gray-300 relative z-10">
              "A polymathic seeker of elegance in complexity—from the laws of logic and chemistry to the pulse of hardware. Whether on the field or in the lab, I am a perpetual student of the game, mastering new worlds through play and relentless curiosity."
            </p>
          </div>
        </motion.div>

        {/* Right Column: Traits & Philosophy */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          className="flex-1 w-full space-y-8"
        >
          {/* Card 1 */}
          <div className="glass-panel p-8 md:p-10 transform transition-all duration-500 hover:-translate-y-2 hover:border-[var(--color-secondary)]/30">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-[var(--color-secondary)]/10 rounded-2xl">
                <Terminal className="w-8 h-8 text-[var(--color-secondary)]" />
              </div>
              <div>
                <h3 className="text-2xl font-serif mb-3 text-white">Creative Developer</h3>
                <p className="text-gray-400 leading-relaxed font-light">
                  Bridging the gap between engineering and art. I specialize in building highly interactive, visually striking digital experiences using modern web technologies, WebGL, and precise mathematical motion.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 md:p-10 transform transition-all duration-500 hover:-translate-y-2 hover:border-purple-500/30">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-purple-500/10 rounded-2xl">
                <Compass className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-serif mb-3 text-white">Polymathic Explorer</h3>
                <p className="text-gray-400 leading-relaxed font-light">
                  My curiosity spans far beyond the screen. I draw inspiration from diverse fields—architecture, physics, astronomy, and organic systems—to inform fluid, natural logic in my code and designs.
                </p>
              </div>
            </div>
          </div>

          {/* Setup / Metrics Array */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-6 flex flex-col justify-center items-center text-center group">
              <span className="text-4xl font-serif text-[var(--color-secondary)] mb-2 group-hover:scale-110 transition-transform">01</span>
              <span className="text-xs tracking-widest text-gray-500 uppercase">Primary Focus</span>
              <span className="mt-1 text-sm font-bold text-gray-300">Spatial Interfaces</span>
            </div>
            <div className="glass-panel p-6 flex flex-col justify-center items-center text-center group">
              <span className="text-4xl font-serif text-purple-400 mb-2 group-hover:scale-110 transition-transform">02</span>
              <span className="text-xs tracking-widest text-gray-500 uppercase">Core Stack</span>
              <span className="mt-1 text-sm font-bold text-gray-300">Next.js & Three.js</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
