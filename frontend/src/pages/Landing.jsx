/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import "../css/Landingcss.css";

const logoVariants = {
  start: {
    top: "50%",
    left: "50%",
    x: "-50%",
    y: "-50%",
    scale: 1.6,
    opacity: 1,
  },
  end: {
    top: "32px",
    left: "48px",
    x: 0,
    y: 0,
    scale: 0.85,
    transition: {
      duration: 2,
      ease: [0.77, 0, 0.175, 1],
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
};

const Landing = () => {
  const [showContent, setShowContent] = useState(false);

  return (
    <div className="landing-root">
      {/* LOGO */}
      <motion.div
        className="lvl0-logo"
        variants={logoVariants}
        initial="start"
        animate="end"
        onAnimationComplete={() => setShowContent(true)}
        whileHover={{
          scale: 0.9,
          textShadow: "0 0 14px rgba(138,255,193,0.8)",
        }}
      >
        lvl<span className="underscore">_</span>0
      </motion.div>

      {/* LEFT CONTENT */}
      {showContent && (
        <motion.div
          className="left-content"
          variants={contentVariants}
          initial="hidden"
          animate="show"
        >
          <p className="headline">
            A unified gaming ecosystem.
          </p>

          <p className="vision-text">
            Discover <span>genre-focused communities</span>, curated
            <span> gaming news</span>, detailed <span>game data</span>, and
            performance <span>statistics</span> — with original
            <span> in-house games</span> launching soon.
          </p>

          <p className="tech-line">
            Built on the <code>MERN</code> stack. Designed to scale.
          </p>

          <div className="auth-buttons">
            <motion.button
              className="btn primary"
              whileHover={{ scale: 1.08, boxShadow: "0 0 25px rgba(138,255,193,0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>

            <motion.button
              className="btn secondary"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              Register
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Landing;
