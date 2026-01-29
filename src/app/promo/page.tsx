'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from 'framer-motion';

// Staggered text animation component
function AnimatedText({
  children,
  className = '',
  delay = 0
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const words = children.split(' ');

  return (
    <motion.span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.08,
            ease: [0.25, 0.4, 0.25, 1],
          }}
          style={{ display: 'inline-block', marginRight: '0.3em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Fade up animation wrapper
function FadeUp({
  children,
  delay = 0,
  className = ''
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// Glassmorphism card component
function GlassCard({
  children,
  className = '',
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className={`glass-card ${className}`}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
  );
}

export default function PromoPage() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  // Scroll-linked animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Smooth spring animations
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Parallax transforms
  const phoneY = useTransform(heroScroll, [0, 1], [0, 150]);
  const phoneRotate = useTransform(heroScroll, [0, 1], [0, -5]);
  const phoneScale = useTransform(heroScroll, [0, 0.5], [1, 0.9]);
  const ribbonX = useTransform(heroScroll, [0, 1], [0, -100]);
  const textY = useTransform(heroScroll, [0, 1], [0, 50]);
  const opacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

  const features = [
    {
      title: 'Auto Level Detection',
      description: 'Your strength level calculated automatically. Progress from Beginner to Advanced.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 20V10M18 20V4M6 20v-4" />
        </svg>
      ),
    },
    {
      title: 'Smart Rest Timer',
      description: 'Full-screen countdown with per-exercise memory. Never guess rest times again.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      ),
    },
    {
      title: 'PR Celebrations',
      description: 'Hit a new max? We celebrate with you. Every personal record tracked and remembered.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      ),
    },
    {
      title: 'Muscle Heatmap',
      description: 'Visualize your strength balance across all body parts with beautiful color coding.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      title: '40+ Exercises',
      description: 'Complete coverage across Chest, Back, Shoulders, Legs, Arms, and Core.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      ),
    },
    {
      title: 'Privacy First',
      description: 'All data stored locally on your device. No account required, no tracking.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
  ];

  return (
    <div ref={containerRef} className="promo-page">
      {/* Progress bar */}
      <motion.div
        className="progress-bar"
        style={{ scaleX: smoothProgress }}
      />

      {/* Navigation */}
      <motion.nav
        className="nav"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <a href="/" className="nav-logo">
          <span className="logo-rep">REP</span>
          <span className="logo-pit">PIT</span>
        </a>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <motion.a
            href="#download"
            className="nav-cta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Download
          </motion.a>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="hero">
        {/* Animated gradient orbs */}
        <div className="orb-container">
          <motion.div
            className="orb orb-1"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="orb orb-2"
            animate={{
              x: [0, -20, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="orb orb-3"
            style={{ x: ribbonX }}
          />
        </div>

        <div className="hero-content">
          <motion.div
            className="hero-text"
            style={{ y: textY, opacity }}
          >
            <motion.span
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="badge-dot" />
              Now in Closed Testing
            </motion.span>

            <h1 className="hero-title">
              <AnimatedText delay={0.4}>Track your lifts.</AnimatedText>
              <br />
              <span className="title-gradient">
                <AnimatedText delay={0.6}>Build your strength.</AnimatedText>
              </span>
            </h1>

            <motion.p
              className="hero-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              The intelligent strength tracker that adapts to you.
              Automatic level detection, smart progression, and beautiful
              visualizations — all stored privately on your device.
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <motion.a
                href="#download"
                className="cta-primary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>Download Now</span>
                <motion.span
                  className="cta-arrow"
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                >
                  →
                </motion.span>
              </motion.a>
              <span className="cta-subtext">Free forever • No account needed</span>
            </motion.div>
          </motion.div>

          {/* Phone Mockup with Parallax */}
          <motion.div
            className="hero-device"
            style={{
              y: phoneY,
              rotate: phoneRotate,
              scale: phoneScale,
            }}
            initial={{ opacity: 0, y: 60, rotateY: -15 }}
            animate={{ opacity: 1, y: 0, rotateY: -12 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="device-wrapper">
              {/* Glow effect behind phone */}
              <div className="device-glow" />

              {/* iPhone Frame */}
              <div className="iphone-frame">
                <div className="iphone-notch">
                  <div className="notch-camera" />
                </div>
                <div className="iphone-screen">
                  {/* App Content */}
                  <div className="app-content">
                    <div className="app-header">
                      <div className="app-logo">
                        <span className="green">REP</span>
                        <span className="orange">PIT</span>
                      </div>
                      <div className="header-actions">
                        <span className="unit-badge">kg</span>
                      </div>
                    </div>

                    <div className="level-card">
                      <div className="level-top">
                        <span className="level-label">Your Level</span>
                        <span className="level-value">Intermediate</span>
                      </div>
                      <div className="level-bar">
                        <motion.div
                          className="level-fill"
                          initial={{ width: 0 }}
                          animate={{ width: '65%' }}
                          transition={{ duration: 1.5, delay: 1.2, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="level-hint">65% to Advanced</span>
                    </div>

                    <div className="stats-grid">
                      {[
                        { value: '24', label: 'Workouts' },
                        { value: '12', label: 'PRs' },
                        { value: '6', label: 'Parts' },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          className="stat-card"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 1.4 + i * 0.1 }}
                        >
                          <span className="stat-value">{stat.value}</span>
                          <span className="stat-label">{stat.label}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="exercise-row">
                      <div className="exercise-info">
                        <span className="exercise-name">Bench Press</span>
                        <span className="exercise-detail">Last: 80kg × 8</span>
                      </div>
                      <motion.span
                        className="pr-badge"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                      >
                        PR!
                      </motion.span>
                    </div>

                    <div className="heatmap-preview">
                      <span className="heatmap-title">Muscle Balance</span>
                      <div className="heatmap-grid">
                        <div className="heat hot" />
                        <div className="heat warm" />
                        <div className="heat medium" />
                        <div className="heat cool" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* iPhone buttons */}
                <div className="iphone-button-right" />
                <div className="iphone-button-left-1" />
                <div className="iphone-button-left-2" />
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              className="float-card float-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="float-icon green-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              </div>
              <span>PR Achieved!</span>
            </motion.div>

            <motion.div
              className="float-card float-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.7 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="float-icon orange-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10M18 20V4M6 20v-4" />
                </svg>
              </div>
              <span>Level Up!</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="features-header">
          <FadeUp>
            <span className="section-tag">Features</span>
          </FadeUp>
          <h2 className="section-title">
            <AnimatedText>Everything you need to</AnimatedText>
            <br />
            <span className="title-gradient">
              <AnimatedText delay={0.2}>track your progress</AnimatedText>
            </span>
          </h2>
        </div>

        <div className="features-grid">
          {features.map((feature, i) => (
            <GlassCard key={feature.title} delay={i * 0.1}>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-content">
          {[
            { number: '40+', label: 'Exercises', sub: 'Across 6 body parts' },
            { number: '5', label: 'Profiles', sub: 'For family & partners' },
            { number: '100%', label: 'Private', sub: 'Data stays on device' },
            { number: '0', label: 'Accounts', sub: 'No signup required' },
          ].map((stat, i) => (
            <FadeUp key={stat.label} delay={i * 0.1} className="stat-block">
              <motion.span
                className="stat-number"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {stat.number}
              </motion.span>
              <span className="stat-title">{stat.label}</span>
              <span className="stat-sub">{stat.sub}</span>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="download">
        <div className="download-glow" />
        <FadeUp className="download-content">
          <span className="section-tag">Get Started</span>
          <h2 className="download-title">
            <AnimatedText>Start tracking</AnimatedText>
            <br />
            <span className="title-gradient">
              <AnimatedText delay={0.2}>today</AnimatedText>
            </span>
          </h2>
          <p className="download-desc">
            Available on Android and Web. iOS coming soon.
          </p>
          <div className="download-buttons">
            <motion.a
              href="#"
              className="store-button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div className="store-info">
                <span className="store-pre">Get it on</span>
                <span className="store-name">Google Play</span>
              </div>
            </motion.a>
            <motion.a
              href="/"
              className="store-button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
              </svg>
              <div className="store-info">
                <span className="store-pre">Use on</span>
                <span className="store-name">Web App</span>
              </div>
            </motion.a>
          </div>
        </FadeUp>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-rep">REP</span>
            <span className="logo-pit">PIT</span>
          </div>
          <p className="footer-tagline">Track Your Reps. Build Your Strength.</p>
          <div className="footer-links">
            <a href="/">Web App</a>
            <span>·</span>
            <a href="#features">Features</a>
            <span>·</span>
            <a href="#download">Download</a>
          </div>
          <p className="footer-copy">© 2025 REPPIT</p>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: #09090b;
          color: #fafafa;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
      `}</style>

      <style jsx>{`
        /* ========== VARIABLES ========== */
        .promo-page {
          --bg: #09090b;
          --bg-elevated: #18181b;
          --bg-card: rgba(24, 24, 27, 0.6);
          --border: rgba(255, 255, 255, 0.08);
          --text: #fafafa;
          --text-secondary: rgba(250, 250, 250, 0.7);
          --text-muted: rgba(250, 250, 250, 0.4);
          --green: #22c55e;
          --orange: #f97316;
          --green-glow: rgba(34, 197, 94, 0.2);
          --orange-glow: rgba(249, 115, 22, 0.2);
        }

        /* ========== PROGRESS BAR ========== */
        .progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--green), var(--orange));
          transform-origin: left;
          z-index: 1000;
        }

        /* ========== NAVIGATION ========== */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem clamp(1.5rem, 5vw, 4rem);
          z-index: 100;
          background: linear-gradient(to bottom, rgba(9, 9, 11, 0.9) 0%, transparent 100%);
          backdrop-filter: blur(12px);
        }

        .nav-logo {
          font-size: 1.25rem;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: -0.02em;
        }

        .logo-rep { color: var(--green); }
        .logo-pit { color: var(--orange); }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-link:hover { color: var(--text); }

        .nav-cta {
          background: var(--green);
          color: #000;
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
        }

        /* ========== HERO ========== */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 8rem clamp(1.5rem, 5vw, 4rem) 4rem;
          overflow: hidden;
        }

        .orb-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: var(--green-glow);
          top: -20%;
          left: 10%;
          opacity: 0.6;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: var(--orange-glow);
          bottom: -10%;
          right: 5%;
          opacity: 0.5;
        }

        .orb-3 {
          width: 800px;
          height: 200px;
          background: linear-gradient(90deg, transparent, var(--orange), transparent);
          top: 40%;
          left: -10%;
          opacity: 0.3;
          border-radius: 100px;
        }

        .hero-content {
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          align-items: center;
        }

        .hero-text {
          max-width: 560px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 600;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .title-gradient {
          background: linear-gradient(135deg, var(--orange) 0%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.0625rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 2rem;
        }

        .hero-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cta-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: var(--green);
          color: #000;
          padding: 0.875rem 1.75rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9375rem;
          text-decoration: none;
          width: fit-content;
        }

        .cta-subtext {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        /* ========== DEVICE MOCKUP ========== */
        .hero-device {
          position: relative;
          display: flex;
          justify-content: center;
          perspective: 1000px;
        }

        .device-wrapper {
          position: relative;
          transform-style: preserve-3d;
        }

        .device-glow {
          position: absolute;
          inset: -40px;
          background: radial-gradient(ellipse at center, var(--green-glow) 0%, transparent 60%);
          filter: blur(40px);
          opacity: 0.6;
        }

        .iphone-frame {
          position: relative;
          width: 280px;
          height: 580px;
          background: linear-gradient(145deg, #2a2a2e 0%, #1a1a1e 100%);
          border-radius: 48px;
          padding: 14px;
          box-shadow:
            0 50px 100px -20px rgba(0, 0, 0, 0.5),
            0 30px 60px -30px rgba(0, 0, 0, 0.6),
            inset 0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .iphone-notch {
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 28px;
          background: #000;
          border-radius: 20px;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notch-camera {
          width: 10px;
          height: 10px;
          background: #1a1a1e;
          border-radius: 50%;
          border: 2px solid #2a2a2e;
        }

        .iphone-screen {
          width: 100%;
          height: 100%;
          background: #0f0f12;
          border-radius: 36px;
          overflow: hidden;
        }

        .iphone-button-right {
          position: absolute;
          right: -2px;
          top: 120px;
          width: 3px;
          height: 80px;
          background: #2a2a2e;
          border-radius: 0 2px 2px 0;
        }

        .iphone-button-left-1 {
          position: absolute;
          left: -2px;
          top: 100px;
          width: 3px;
          height: 30px;
          background: #2a2a2e;
          border-radius: 2px 0 0 2px;
        }

        .iphone-button-left-2 {
          position: absolute;
          left: -2px;
          top: 150px;
          width: 3px;
          height: 60px;
          background: #2a2a2e;
          border-radius: 2px 0 0 2px;
        }

        /* App Content in Phone */
        .app-content {
          padding: 50px 16px 16px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .app-logo {
          font-size: 1rem;
          font-weight: 700;
        }

        .app-logo .green { color: var(--green); }
        .app-logo .orange { color: var(--orange); }

        .unit-badge {
          background: var(--bg-elevated);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .level-card {
          background: linear-gradient(135deg, var(--bg-elevated) 0%, rgba(34, 197, 94, 0.1) 100%);
          padding: 14px;
          border-radius: 16px;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .level-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .level-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .level-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #f39c12;
        }

        .level-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .level-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--green), var(--orange));
          border-radius: 3px;
        }

        .level-hint {
          font-size: 0.6rem;
          color: var(--text-muted);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .stat-card {
          background: var(--bg-elevated);
          padding: 12px 8px;
          border-radius: 12px;
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--green);
        }

        .stat-label {
          font-size: 0.55rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .exercise-row {
          background: var(--bg-elevated);
          padding: 12px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .exercise-name {
          display: block;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .exercise-detail {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .pr-badge {
          background: linear-gradient(135deg, #eab308, var(--orange));
          color: #000;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 700;
        }

        .heatmap-preview {
          flex: 1;
          background: var(--bg-elevated);
          border-radius: 12px;
          padding: 12px;
        }

        .heatmap-title {
          display: block;
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .heatmap-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          height: calc(100% - 24px);
        }

        .heat {
          border-radius: 8px;
          min-height: 35px;
        }

        .heat.hot { background: var(--orange); opacity: 0.8; }
        .heat.warm { background: #eab308; opacity: 0.7; }
        .heat.medium { background: var(--green); opacity: 0.7; }
        .heat.cool { background: #06b6d4; opacity: 0.6; }

        /* Floating cards */
        .float-card {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 0.8125rem;
          font-weight: 500;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .float-1 {
          top: 15%;
          right: -30px;
        }

        .float-2 {
          bottom: 25%;
          left: -40px;
        }

        .float-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .green-icon { background: var(--green); color: #000; }
        .orange-icon { background: var(--orange); color: #000; }

        /* Scroll indicator */
        .scroll-indicator {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          color: var(--text-muted);
        }

        /* ========== FEATURES ========== */
        .features {
          padding: 8rem clamp(1.5rem, 5vw, 4rem);
          max-width: 1200px;
          margin: 0 auto;
        }

        .features-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-tag {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--green);
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 600;
          letter-spacing: -0.025em;
          line-height: 1.15;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        :global(.glass-card) {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2rem;
          transition: border-color 0.3s;
        }

        :global(.glass-card:hover) {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--green-glow), var(--orange-glow));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--green);
          margin-bottom: 1.25rem;
        }

        .feature-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .feature-desc {
          font-size: 0.9375rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* ========== STATS ========== */
        .stats-section {
          padding: 6rem clamp(1.5rem, 5vw, 4rem);
          background: var(--bg-elevated);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .stats-content {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .stat-block {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 600;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, var(--green) 0%, var(--orange) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-title {
          display: block;
          font-size: 1rem;
          font-weight: 500;
          margin-top: 0.5rem;
        }

        .stat-sub {
          display: block;
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        /* ========== DOWNLOAD ========== */
        .download {
          position: relative;
          padding: 10rem clamp(1.5rem, 5vw, 4rem);
          text-align: center;
        }

        .download-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--green-glow) 0%, transparent 60%);
          pointer-events: none;
        }

        .download-content {
          position: relative;
          max-width: 500px;
          margin: 0 auto;
        }

        .download-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 600;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 1rem 0;
        }

        .download-desc {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
        }

        .download-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .store-button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 14px;
          color: var(--text);
          text-decoration: none;
          transition: border-color 0.2s;
        }

        .store-button:hover {
          border-color: var(--green);
        }

        .store-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .store-pre {
          font-size: 0.625rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .store-name {
          font-size: 1rem;
          font-weight: 600;
        }

        /* ========== FOOTER ========== */
        .footer {
          padding: 4rem clamp(1.5rem, 5vw, 4rem);
          border-top: 1px solid var(--border);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-brand {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .footer-tagline {
          color: var(--text-secondary);
          font-size: 0.9375rem;
          margin-bottom: 1.5rem;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .footer-links a {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: var(--text);
        }

        .footer-links span {
          color: var(--text-muted);
        }

        .footer-copy {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1024px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 4rem;
          }

          .hero-text {
            max-width: 100%;
            order: 1;
          }

          .hero-device {
            order: 2;
          }

          .hero-actions {
            align-items: center;
          }

          .float-card {
            display: none;
          }

          .stats-content {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .nav-links {
            display: none;
          }

          .hero {
            padding-top: 6rem;
          }

          .iphone-frame {
            width: 240px;
            height: 500px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .stats-content {
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}