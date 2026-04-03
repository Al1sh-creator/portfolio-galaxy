"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import Lenis from "lenis";
import { Feather, Code2, Sparkles, Sprout, CloudRain } from "lucide-react";

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

const Fireflies = () => {
   const [particles, setParticles] = useState<any[]>([]);
   useEffect(() => {
     const p = Array.from({ length: 15 }).map((_, i) => ({
       id: i,
       left: Math.random() * 100 + "vw",
       size: Math.random() * 3 + 1 + "px",
       duration: Math.random() * 10 + 8 + "s",
       delay: Math.random() * 8 + "s",
     }));
     setParticles(p);
   }, []);
   return (
     <div className="fixed inset-0 pointer-events-none z-[40] overflow-hidden">
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
      }, 50);
      return () => clearInterval(interval);
   }, [onComplete]);

   return (
      <motion.div 
         initial={{ opacity: 1 }}
         exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
         className="fixed inset-0 z-[200] bg-[#1a1419] flex items-center justify-center pointer-events-none"
      >
         <div className="text-center">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="text-[var(--color-primary)] text-sm tracking-[0.5em] uppercase mb-4"
            >
               Initializing
            </motion.div>
            <div className="text-6xl md:text-8xl font-serif text-[#fdfae7] font-light">
               <span className="tabular-nums">{Math.min(100, count)}</span><span className="text-[var(--color-secondary)]">%</span>
            </div>
         </div>
         {/* Split screens */}
         <motion.div 
            initial={{ height: "50%" }}
            exit={{ height: "0%", transition: { duration: 1.5, ease: [0.76, 0, 0.24, 1] } }}
            className="absolute top-0 left-0 w-full bg-[#2a1f28] z-[-1]"
         />
         <motion.div 
            initial={{ height: "50%" }}
            exit={{ height: "0%", transition: { duration: 1.5, ease: [0.76, 0, 0.24, 1] } }}
            className="absolute bottom-0 left-0 w-full bg-[#2a1f28] z-[-1]"
         />
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
         // Check if hovering over clickable or interactive element
         if (target.closest('button') || target.closest('.group') || target.tagName.toLowerCase() === 'a') {
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
         className="fixed top-0 left-0 z-[1000] pointer-events-none mix-blend-screen flex items-center justify-center rounded-full"
         style={{ x: springX, y: springY }}
      >
         <motion.div 
            animate={{ 
               width: isHovering ? 60 : 24, 
               height: isHovering ? 60 : 24,
               backgroundColor: isHovering ? "transparent" : "var(--color-secondary)",
               border: isHovering ? "1px solid var(--color-primary-container)" : "0px solid transparent",
               opacity: isHovering ? 0.8 : 0.5,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-full shadow-[0_0_15px_var(--color-secondary)] flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
         >
            {isHovering && <span className="text-[10px] text-[var(--color-primary-container)] tracking-widest font-bold">VIEW</span>}
         </motion.div>
      </motion.div>
   );
};

export default function Home() {
  const [loading, setLoading] = useState(true);

  // Smooth Scrolling
  useEffect(() => {
    if (loading) return; // Wait to init smooth scroll until after preloader
    const lenis = new Lenis({
      duration: 0.7,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
    });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, [loading]);

  // Mouse Parallax Trackers
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
       const x = (e.clientX / window.innerWidth - 0.5) * 40; // Max 20px shift
       const y = (e.clientY / window.innerHeight - 0.5) * 40;
       mouseX.set(x);
       mouseY.set(y);
    };
    if (!loading) window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [loading, mouseX, mouseY]);

  // Spring physics for smooth ambient parallax
  const parallaxX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const parallaxY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  const heroWrapperRef = useRef(null);
  const timelineWrapperRef = useRef(null);
  const skillsWrapperRef = useRef(null);

  // SCROLL MAPS
  const { scrollYProgress: heroProgress } = useScroll({ target: heroWrapperRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(heroProgress, [0, 0.5, 0.9], [1, 2, 80]);
  const heroTextOpacity = useTransform(heroProgress, [0, 0.3, 0.6], [1, 0.8, 0]);
  const heroBgY = useTransform(heroProgress, [0, 1], ["0%", "20%"]);

  const { scrollYProgress: timelineProgress } = useScroll({ target: timelineWrapperRef, offset: ["start start", "end end"] });
  const timelineX = useTransform(timelineProgress, [0, 1], ["0%", "-35vw"]);
  const creatureScrollY = useTransform(timelineProgress, [0, 1], ["0px", "-100px"]);

  const { scrollYProgress: skillsProgress } = useScroll({ target: skillsWrapperRef, offset: ["start end", "start start"] });
  const clipMaskSize = useTransform(skillsProgress, [0.1, 0.6], ["circle(0% at center)", "circle(150% at center)"]);
  const libBgScale = useTransform(skillsProgress, [0, 1], [1.3, 1]);

  return (
    <main className="relative bg-[#2a1f28] text-[#fdfae7] selection:bg-[var(--color-secondary)] selection:text-[#2a1f28] min-h-screen">
      
      {/* 1. Cinematic Preloader */}
      <AnimatePresence>
         {loading && <Preloader onComplete={() => window.scrollTo(0, 0) || setLoading(false)} />}
      </AnimatePresence>

      {/* 2. Magnetic Cursor */}
      {!loading && <CustomCursor />}

      <Fireflies />
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vh] light-leak pointer-events-none z-10" />

      {/* --- HERO DIVING SECTION --- */}
      <section ref={heroWrapperRef} className="relative w-full h-[150vh]">
         {/* Mouse-bound background parallax added to hero container */}
         <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
            
            <motion.div style={{ y: heroBgY, x: parallaxX, willChange: 'transform' }} className="absolute inset-[-5%] z-0 w-[110%] h-[110%]">
               <img src="/hero.png" alt="Hero" className="w-full h-full object-cover opacity-60 pointer-events-none" />
               <div className="absolute inset-0 bg-gradient-to-b from-[#2a1f28]/60 via-transparent to-[#2a1f28]" />
            </motion.div>

            <motion.div 
               style={{ scale: heroScale, opacity: heroTextOpacity, y: parallaxY, willChange: 'transform, opacity' }} 
               className="relative z-20 flex flex-col items-center text-center transform-origin-center mt-[-10vh]"
            >
               <CloudRain className="w-10 h-10 mb-8 text-[var(--color-secondary)] mx-auto opacity-80" strokeWidth={1} />
               <h1 className="text-6xl md:text-9xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-[#fdfae7] to-[var(--color-primary)] font-light tracking-wide animate-breathe leading-[0.9]">
                 Arcane <br /> <span className="italic font-serif opacity-90">Laboratory</span>
               </h1>
               <p className="text-xl md:text-3xl font-light tracking-widest uppercase mt-12 opacity-80 mix-blend-screen">
                  Scroll to Dive Deep
               </p>
            </motion.div>
         </div>
      </section>

      {/* --- HORIZONTAL TIMELINE --- */}
      <section ref={timelineWrapperRef} className="relative w-full h-[180vh] z-20">
         <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center bg-[#211820]">
            
            <motion.div 
              style={{ y: creatureScrollY, x: parallaxX, willChange: 'transform' }} 
              className="absolute left-[10vw] top-[20vh] w-[400px] h-[500px] pointer-events-none opacity-30"
            >
               <img src="/creature.png" alt="Companion" className="w-full h-full object-cover rounded-[3rem]" />
               <div className="absolute inset-0 bg-gradient-to-tr from-[#211820] to-transparent" />
            </motion.div>

            <motion.div 
               style={{ x: timelineX, y: parallaxY, willChange: 'transform' }} 
               className="flex items-center gap-16 md:gap-32 pl-[10vw] pr-[20vw] w-max z-20"
            >
               <div className="w-[300px] md:w-[400px] shrink-0">
                  <h2 className="text-6xl md:text-7xl font-serif text-[var(--color-primary)] font-light mb-6">The Log</h2>
                  <p className="text-[var(--color-secondary)]/70 text-2xl italic font-serif">A chronicle tracked in horizontal time.</p>
                  <div className="w-full h-[1px] bg-[var(--color-primary)]/30 mt-12 flex items-center">
                     <div className="w-4 h-4 bg-[var(--color-secondary)] rounded-full" />
                  </div>
               </div>

               {/* Timeline Cards */}
               <div onMouseEnter={playCrystalChime} className="ghibli-glass w-[350px] md:w-[450px] shrink-0 p-8 md:p-12 relative overflow-hidden group transition-transform duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/0 to-[var(--color-primary)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <span className="text-[var(--color-secondary)] text-sm tracking-widest uppercase block mb-4">Chapter I</span>
                  <h3 className="text-3xl md:text-4xl font-serif mb-6 text-[#fdfae7]">The Awakening</h3>
                  <p className="text-[#fdfae7]/80 md:text-xl leading-relaxed md:leading-loose font-light">
                    Every journey begins softly. Building worlds from nothing is an act of quiet magic. The logic of the web reveals itself through patience.
                  </p>
               </div>

               <div onMouseEnter={playCrystalChime} className="ghibli-glass w-[350px] md:w-[450px] shrink-0 p-8 md:p-12 relative overflow-hidden group transition-transform duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-secondary)]/0 to-[var(--color-secondary)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <span className="text-[var(--color-primary-container)] text-sm tracking-widest uppercase block mb-4">Chapter II</span>
                  <h3 className="text-3xl md:text-4xl font-serif mb-6 text-[#fdfae7]">Kinetic Interfaces</h3>
                  <p className="text-[#fdfae7]/80 md:text-xl leading-relaxed md:leading-loose font-light">
                    The interface breathes. The DOM becomes a canvas for kinetic motion, mapped horizontally to the viewer's command.
                  </p>
               </div>
            </motion.div>
         </div>
      </section>

      {/* --- MASK REVEAL SKILLS --- */}
      <section ref={skillsWrapperRef} className="relative w-full h-[120vh]">
         <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
            
            <motion.div 
               style={{ clipPath: clipMaskSize, scale: libBgScale, x: parallaxX, y: parallaxY, willChange: 'transform, clip-path' }} 
               className="absolute inset-[-5%] z-0 bg-[#2a1f28] w-[110%] h-[110%]"
            >
               <img src="/library.png" alt="Archive" className="w-full h-full object-cover opacity-30 pointer-events-none" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#2a1f28] to-transparent" />
            </motion.div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center pt-20">
               <motion.h2 
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ margin: "-100px" }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
                 className="text-6xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] mb-12 drop-shadow-xl text-center"
               >
                 The Grand Archive
               </motion.h2>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-5xl">
                  <motion.div 
                    onMouseEnter={playCrystalChime}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="ghibli-glass p-8 md:p-12 text-left group hover:-translate-y-2 transition-transform duration-500"
                  >
                     <Sparkles className="w-10 h-10 text-[var(--color-primary)] mb-6 opacity-80" />
                     <h3 className="text-3xl md:text-4xl font-serif mb-4 md:mb-6 text-[#fdfae7]">Cinematic UX</h3>
                     <p className="text-[#fdfae7]/70 md:text-xl font-light mb-8 leading-relaxed">Framer Motion, Lenis Scroll, and WebGL mapping scroll states into 3D environments.</p>
                  </motion.div>

                  <motion.div 
                    onMouseEnter={playCrystalChime}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="ghibli-glass p-8 md:p-12 text-left group hover:-translate-y-2 transition-transform duration-500"
                  >
                     <Sprout className="w-10 h-10 text-[var(--color-secondary)] mb-6 opacity-80" />
                     <h3 className="text-3xl md:text-4xl font-serif mb-4 md:mb-6 text-[#fdfae7]">React Core</h3>
                     <p className="text-[#fdfae7]/70 md:text-xl font-light mb-8 leading-relaxed">Structuring deep component trees to elegantly handle complex, overlapping state logic.</p>
                  </motion.div>
               </div>
            </div>
         </div>
      </section>

      {/* --- THE GRAND FINALE FOOTER --- */}
      <footer className="relative w-full min-h-[80vh] bg-black flex flex-col items-center justify-center text-center overflow-hidden z-20">
         <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="flex flex-col items-center z-10 px-4"
         >
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] opacity-10 blur-[50px] absolute" />
            <Sparkles className="w-8 h-8 text-[var(--color-secondary)] opacity-50 mb-8" />
            <h2 className="text-5xl md:text-7xl font-serif font-light text-[#fdfae7] mb-8">Ready to weave the next chapter?</h2>
            <p className="text-xl text-[#fdfae7]/50 font-light mb-16 max-w-xl">
               Let's collaborate on creating digital experiences that feel human, magical, and unforgettable.
            </p>
            <button 
               onMouseEnter={playCrystalChime}
               className="ghibli-button"
            >
               Connect Now
            </button>
         </motion.div>
      </footer>

    </main>
  );
}
