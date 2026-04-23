"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import Lenis from "lenis";
import { Code2, Sparkles, Terminal, Sword, Zap, BrainCircuit } from "lucide-react";

// --- HOOKS & SFX ---
const playCrystalChime = () => {
   try {
     const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
     if (!AudioContext) return;
     const ctx = new AudioContext();
     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     osc.type = "sine";
     const basePitch = 1200 + Math.random() * 400;
     osc.frequency.setValueAtTime(basePitch, ctx.currentTime);
     gain.gain.setValueAtTime(0, ctx.currentTime);
     gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.1);
     gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.0);
     osc.connect(gain);
     gain.connect(ctx.destination);
     osc.start();
     osc.stop(ctx.currentTime + 2.0);
   } catch (e) {}
};

const playGlitchSound = () => {
   try {
     const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
     if (!AudioContext) return;
     const ctx = new AudioContext();
     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     osc.type = "sawtooth";
     osc.frequency.setValueAtTime(100 + Math.random() * 50, ctx.currentTime);
     osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
     gain.gain.setValueAtTime(0.1, ctx.currentTime);
     gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
     osc.connect(gain);
     gain.connect(ctx.destination);
     osc.start();
     osc.stop(ctx.currentTime + 0.2);
   } catch (e) {}
};

const Fireflies = () => {
   const [particles, setParticles] = useState<any[]>([]);
   useEffect(() => {
     const p = Array.from({ length: 25 }).map((_, i) => ({
       id: i,
       left: Math.random() * 100 + "vw",
       size: Math.random() * 4 + 1 + "px",
       duration: Math.random() * 10 + 8 + "s",
       delay: Math.random() * 8 + "s",
     }));
     setParticles(p);
   }, []);
   return (
     <div className="fixed inset-0 pointer-events-none z-[40] overflow-hidden mix-blend-screen">
       {particles.map((p) => (
         <div 
           key={p.id} className="firefly"
           style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.duration, animationDelay: p.delay }}
         />
       ))}
     </div>
   );
}

// --- COMPONENTS ---
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
   const [count, setCount] = useState(0);

   useEffect(() => {
      const interval = setInterval(() => {
         setCount(prev => {
            if (prev >= 100) {
               clearInterval(interval);
               setTimeout(onComplete, 800);
               return 100;
            }
            return prev + Math.floor(Math.random() * 10) + 1;
         });
      }, 40);
      return () => clearInterval(interval);
   }, [onComplete]);

   return (
      <motion.div 
         initial={{ opacity: 1 }}
         exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
         className="fixed inset-0 z-[200] bg-black flex items-center justify-center pointer-events-none halftone-bg"
      >
         <div className="text-center relative z-10">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="text-[var(--color-neon-green)] text-sm tracking-[0.5em] uppercase mb-4 font-mono font-bold"
            >
               System Boot // Loading Lore
            </motion.div>
            <div className="text-7xl md:text-9xl font-serif text-white font-black cyber-glitch-text" data-text={`${Math.min(100, count)}%`}>
               {Math.min(100, count)}<span className="text-[var(--color-neon-pink)]">%</span>
            </div>
         </div>
      </motion.div>
   );
};

const CustomCursor = () => {
   const mouseX = useMotionValue(-100);
   const mouseY = useMotionValue(-100);
   
   const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
   const springX = useSpring(mouseX, springConfig);
   const springY = useSpring(mouseY, springConfig);

   const [isHovering, setIsHovering] = useState(false);

   useEffect(() => {
      const moveCursor = (e: MouseEvent) => {
         mouseX.set(e.clientX - 12);
         mouseY.set(e.clientY - 12);
      };
      
      const handleMouseOver = (e: MouseEvent) => {
         const target = e.target as HTMLElement;
         if (target.closest('button') || target.closest('.group') || target.closest('.manga-panel') || target.tagName.toLowerCase() === 'a') {
            setIsHovering(true);
         } else {
            setIsHovering(false);
         }
      };

      window.addEventListener("mousemove", moveCursor);
      window.addEventListener("mouseover", handleMouseOver);
      return () => {
         window.removeEventListener("mousemove", moveCursor);
         window.removeEventListener("mouseover", handleMouseOver);
      };
   }, [mouseX, mouseY]);

   return (
      <motion.div 
         className="fixed top-0 left-0 z-[1000] pointer-events-none mix-blend-difference flex items-center justify-center rounded-full"
         style={{ x: springX, y: springY }}
      >
         <motion.div 
            animate={{ 
               width: isHovering ? 60 : 24, 
               height: isHovering ? 60 : 24,
               backgroundColor: isHovering ? "transparent" : "var(--color-neon-green)",
               border: isHovering ? "2px solid var(--color-neon-green)" : "0px solid transparent",
               opacity: isHovering ? 0.8 : 0.5,
               borderRadius: isHovering ? "0%" : "50%",
               rotate: isHovering ? 45 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="shadow-[0_0_15px_var(--color-neon-green)] flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
         >
            {isHovering && <span className="text-[10px] text-white tracking-widest font-mono font-bold -rotate-45">INSPECT</span>}
         </motion.div>
      </motion.div>
   );
};

const Marquee = ({ text, color }: { text: string, color: string }) => (
  <div className={`w-[120%] -ml-[10%] overflow-hidden py-4 border-y-4 border-black z-30 relative transform origin-center my-16 shadow-2xl`} style={{ backgroundColor: color }}>
    <div className="animate-marquee whitespace-nowrap text-black font-mono font-black tracking-[0.3em] uppercase text-2xl md:text-4xl">
      {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </div>
  </div>
);

const dialogueLines = [
  "System initializing... Welcome to my domain.",
  "I am Alish. A polymathic seeker of elegance in complexity.",
  "From the laws of logic to the pulse of hardware, I master new worlds.",
  "Skill Tree loaded. Inspect my unlocked abilities.",
  "The interface breathes. The DOM becomes a canvas for kinetic motion.",
  "Ready to weave the next chapter? Let's connect."
];

const DialogueBox = ({ progress }: { progress: number }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const totalLines = dialogueLines.length;
    const index = Math.min(Math.floor(progress * totalLines), totalLines - 1);
    if (index !== lineIndex) {
      setLineIndex(index);
      setDisplayedText("");
      playGlitchSound();
    }
  }, [progress, lineIndex]);

  useEffect(() => {
    let i = 0;
    const line = dialogueLines[lineIndex];
    const timer = setInterval(() => {
      if (i < line.length) {
        setDisplayedText(line.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [lineIndex]);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[95vw] max-w-3xl z-[100] pointer-events-none">
      <div className="manga-panel bg-black/95 p-4 md:p-6 relative flex items-start gap-4 md:gap-6 pointer-events-auto hover:scale-[1.02] transition-transform">
        <div className="w-16 h-16 md:w-24 md:h-24 bg-[var(--color-neon-purple)] border-2 border-[var(--color-neon-green)] rounded-sm overflow-hidden shrink-0 relative">
           <div className="absolute inset-0 bg-black/20 mix-blend-overlay z-10" />
           <img src="/hero.png" className="w-full h-full object-cover scale-150 origin-top" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1 md:mb-2">
            <h4 className="text-[var(--color-neon-green)] font-mono font-bold tracking-widest text-sm md:text-base cyber-glitch-text" data-text="ALISH_SYS">ALISH_SYS</h4>
            <span className="text-xs font-mono text-[var(--color-neon-pink)] animate-pulse">REC •</span>
          </div>
          <p className="text-base md:text-xl font-serif text-white leading-relaxed h-[3rem] md:h-[4rem]">{displayedText}<span className="inline-block w-2 h-5 bg-white ml-1 animate-pulse" /></p>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [loading, setLoading] = useState(true);

  // Smooth Scrolling
  useEffect(() => {
    if (loading) return;
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
    });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, [loading]);

  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => setProgress(v));
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <main className="relative bg-[#050505] text-[#fdfae7] min-h-screen pb-40 halftone-bg">
      
      {/* 1. Cinematic Preloader */}
      <AnimatePresence>
         {loading && <Preloader onComplete={() => { window.scrollTo(0, 0); setLoading(false); }} />}
      </AnimatePresence>

      {/* 2. Magnetic Cursor & Fireflies */}
      {!loading && <CustomCursor />}
      <Fireflies />
      
      {/* 3. Navigation Bridge */}
      <nav className="fixed top-0 w-full z-[100] px-6 py-6 mix-blend-difference pointer-events-none">
         <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
            <a 
               href="https://portfolio-galaxy-five.vercel.app/" 
               className="group flex flex-col gap-1 text-white hover:text-[var(--color-neon-green)] transition-colors duration-300 font-sans"
            >
               <span className="text-[10px] tracking-[0.3em] uppercase opacity-60 font-mono">Return to</span>
               <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 rotate-180" />
                  <span className="text-sm font-black tracking-widest uppercase cyber-glitch-text" data-text="THE_COSMOS">THE_COSMOS</span>
               </div>
            </a>
            
            <div className="hidden md:flex flex-col items-end">
               <span className="text-[10px] tracking-[0.3em] uppercase mb-1 font-mono text-[var(--color-neon-pink)]">Lvl. 99</span>
               <span className="text-xs font-serif italic text-white cyber-glitch-text" data-text="Arcane Laboratory">Arcane Laboratory</span>
            </div>
         </div>
      </nav>

      {/* --- Visual Novel Narrator --- */}
      {!loading && <DialogueBox progress={progress} />}

      <div className="w-full max-w-5xl mx-auto px-6 pt-32 flex flex-col gap-24 md:gap-40 z-10 relative">
        
        {/* --- SCROLLYTELLING MANGA PANELS --- */}
        <section className="relative w-full min-h-[80vh] flex flex-col justify-center items-center">
            <motion.div 
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="w-full relative"
            >
                <h1 className="text-7xl md:text-[10rem] font-serif font-black leading-none text-transparent -ml-2 cyber-glitch-text text-white drop-shadow-[4px_4px_0_var(--color-neon-purple)]" data-text="LORE">
                  LORE
                </h1>
                <div className="absolute top-1/2 left-1/4 text-[15rem] font-black text-white/5 tracking-tighter whitespace-nowrap pointer-events-none -z-10 font-sans">
                  主人公
                </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: -50, rotate: -2 }}
               whileInView={{ opacity: 1, x: 0, rotate: -2 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="manga-panel w-[90%] md:w-[60%] self-start mt-12 p-8 relative overflow-hidden group"
               onMouseEnter={playCrystalChime}
            >
               <div className="absolute inset-0 bg-[url('/creature.png')] bg-cover bg-center opacity-20 group-hover:opacity-40 transition-opacity mix-blend-luminosity grayscale group-hover:grayscale-0" />
               <div className="relative z-10">
                 <h2 className="text-3xl font-black font-sans uppercase tracking-widest text-[var(--color-neon-green)] mb-4">Chapter 01: Awakening</h2>
                 <p className="text-xl font-serif text-white/90 leading-relaxed font-light">
                   Every journey begins softly. Building worlds from nothing is an act of quiet magic. The logic of the web reveals itself through patience.
                 </p>
               </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: 50, rotate: 2 }}
               whileInView={{ opacity: 1, x: 0, rotate: 2 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.6, delay: 0.4 }}
               className="manga-panel w-[90%] md:w-[60%] self-end -mt-12 p-8 relative overflow-hidden group"
               onMouseEnter={playGlitchSound}
            >
               <div className="absolute inset-0 bg-[url('/library.png')] bg-cover bg-center opacity-20 group-hover:opacity-40 transition-opacity mix-blend-luminosity grayscale group-hover:grayscale-0" />
               <div className="relative z-10">
                 <h2 className="text-3xl font-black font-sans uppercase tracking-widest text-[var(--color-neon-pink)] mb-4">Chapter 02: Kinetic Flow</h2>
                 <p className="text-xl font-serif text-white/90 leading-relaxed font-light">
                   The interface breathes. The DOM becomes a canvas for kinetic motion, mapping thoughts directly into user interactions.
                 </p>
               </div>
            </motion.div>
        </section>

        <div className="-rotate-3">
          <Marquee text="/// UNLOCKED ABILITIES /// SKILL TREE ACTIVATED" color="var(--color-neon-purple)" />
        </div>

        {/* --- RPG SKILL TREE --- */}
        <section className="relative w-full min-h-screen py-20 flex flex-col items-center">
            <h2 className="text-5xl md:text-7xl font-black font-sans uppercase tracking-widest mb-16 text-white cyber-glitch-text" data-text="SKILL TREE">
              SKILL TREE
            </h2>
            
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[25rem] font-black text-white/5 pointer-events-none -z-10 font-sans tracking-tighter">
              魔法
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   whileHover={{ scale: 1.05 }}
                   onMouseEnter={playCrystalChime}
                   className="manga-panel p-8 group border-[var(--color-neon-green)]"
                >
                   <div className="flex items-center gap-4 mb-6">
                     <div className="p-3 bg-[var(--color-neon-green)]/20 rounded-sm">
                       <Sword className="w-8 h-8 text-[var(--color-neon-green)] group-hover:rotate-12 transition-transform" />
                     </div>
                     <h3 className="text-3xl font-black font-sans uppercase tracking-widest text-white">Cinematic UX</h3>
                   </div>
                   <p className="text-lg font-serif text-white/70 leading-relaxed group-hover:text-white transition-colors">
                     Framer Motion, Lenis Scroll, and WebGL mapping scroll states into 3D environments to craft immersive narratives.
                   </p>
                </motion.div>

                <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   whileHover={{ scale: 1.05 }}
                   onMouseEnter={playGlitchSound}
                   className="manga-panel p-8 group border-[var(--color-neon-pink)]"
                >
                   <div className="flex items-center gap-4 mb-6">
                     <div className="p-3 bg-[var(--color-neon-pink)]/20 rounded-sm">
                       <BrainCircuit className="w-8 h-8 text-[var(--color-neon-pink)] group-hover:scale-110 transition-transform" />
                     </div>
                     <h3 className="text-3xl font-black font-sans uppercase tracking-widest text-white">React Core</h3>
                   </div>
                   <p className="text-lg font-serif text-white/70 leading-relaxed group-hover:text-white transition-colors">
                     Structuring deep component trees to elegantly handle complex, overlapping state logic and scalable architectures.
                   </p>
                </motion.div>
                
                <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   whileHover={{ scale: 1.05 }}
                   onMouseEnter={playCrystalChime}
                   className="manga-panel p-8 group border-[var(--color-neon-purple)] md:col-span-2"
                >
                   <div className="flex items-center gap-4 mb-6">
                     <div className="p-3 bg-[var(--color-neon-purple)]/20 rounded-sm">
                       <Zap className="w-8 h-8 text-[var(--color-neon-purple)] group-hover:animate-pulse transition-transform" />
                     </div>
                     <h3 className="text-3xl font-black font-sans uppercase tracking-widest text-white">Fullstack Arcana</h3>
                   </div>
                   <p className="text-lg font-serif text-white/70 leading-relaxed group-hover:text-white transition-colors">
                     Bridging the gap between robust backend systems and striking frontend experiences. From Next.js architecture down to custom shader magic.
                   </p>
                </motion.div>
            </div>
        </section>

        <div className="rotate-2">
          <Marquee text="/// NEXT CHAPTER /// END OF LOG ///" color="var(--color-neon-green)" />
        </div>

        {/* --- THE GRAND FINALE FOOTER --- */}
        <footer className="relative w-full min-h-[60vh] flex flex-col items-center justify-center text-center">
           <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center z-10"
           >
              <Terminal className="w-12 h-12 text-[var(--color-neon-pink)] mb-8 animate-pulse" />
              <h2 className="text-5xl md:text-8xl font-black font-sans uppercase tracking-tighter text-white mb-8 cyber-glitch-text" data-text="CONNECT">CONNECT</h2>
              <p className="text-xl font-serif text-white/60 mb-12 max-w-xl">
                 Let's collaborate on creating digital experiences that feel human, magical, and unforgettable.
              </p>
              <button 
                 onMouseEnter={playCrystalChime}
                 className="ghibli-button hover:scale-105"
              >
                 Initialize Contact
              </button>
           </motion.div>
        </footer>

      </div>
    </main>
  );
}
