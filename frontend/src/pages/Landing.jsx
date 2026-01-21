/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import "../css/Landingcss.css";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "../ui_components/BounceCard";

/* Animations */
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
    transition: { duration: 2, ease: [0.77, 0, 0.175, 1] },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 1 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 30, rotate: 0 },
  enter: (rotate) => ({
    opacity: 1,
    y: 0,
    rotate,
    transition: {
      delay: 0.6,
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* Cards */
const cards = [
  { title: "Genres", sub: "Playstyle discovery", desc: "Browse games by mechanics and genres.", color: "#00ff77", pos: "top-[6%] left-[10%]", rot: -6 },
  { title: "In-House Games", sub: "Original content", desc: "Exclusive games built by lvl_0.", color: "#7cffc4", pos: "top-[10%] left-[45%]", rot: 6 },
  { title: "Stats", sub: "Insights & metrics", desc: "Track trends and performance.", color: "#6affff", pos: "top-[4%] left-[70%]", rot: 10 },
  { title: "News", sub: "Verified updates", desc: "Curated gaming news.", color: "#9dff8f", pos: "top-[42%] left-[20%]", rot: -8 },
  { title: "Communities", sub: "Genre discussions", desc: "Focused gaming communities.", color: "#8fffce", pos: "top-[45%] left-[50%]", rot: 4 },
  { title: "Leaderboards", sub: "Global rankings", desc: "Compete with players worldwide.", color: "#b6ff9a", pos: "top-[40%] left-[75%]", rot: 8 },
  // { title: "Profiles", sub: "Player identity", desc: "Custom profiles and stats.", color: "#5fffd2", pos: "top-[70%] left-[30%]", rot: -6 },
  // { title: "Tournaments", sub: "Competitive play", desc: "Join hosted competitions.", color: "#86ffc9", pos: "top-[72%] left-[60%]", rot: 6 },
];

const Landing = () => {
  const [show, setShow] = useState(false);

  return (
    <div className="landing-root">
      {/* LOGO */}
      <motion.div
        className="lvl0-logo"
        variants={logoVariants}
        initial="start"
        animate="end"
        onAnimationComplete={() => setShow(true)}
      >
        lvl<span className="underscore">_</span>0
      </motion.div>

      {/* LEFT CONTENT */}
      {show && (
        <motion.div className="left-content" variants={contentVariants} initial="hidden" animate="show">
          <p className="headline">A unified gaming ecosystem.</p>

          <p className="vision-text">
            Discover <span>genre-focused communities</span>, curated
            <span> gaming news</span>, detailed <span>game data</span>, and
            performance <span>statistics</span> — with original
            <span> in-house games</span>.
          </p>

          <p className="tech-line">
            Built on the <code>MERN</code> stack. Designed to scale.
          </p>

          <div className="auth-buttons">
            <button className="btn primary">Login</button>
            <button className="btn secondary">Register</button>
          </div>
        </motion.div>
      )}

      {/* CARDS */}
      {show && (
        <div className="cards-layer">
          <DraggableCardContainer className="cards-container">
            {cards.map((c, i) => (
              <motion.div
                key={i}
                className={`card-wrapper ${c.pos}`}
                variants={cardVariants}
                initial="initial"
                animate="enter"
                custom={c.rot}
              >
                <DraggableCardBody className="text-card" style={{ borderColor: c.color }}>
                  <h3 style={{ color: c.color }}>{c.title}</h3>
                  <span className="card-sub">{c.sub}</span>
                  <p>{c.desc}</p>
                </DraggableCardBody>
              </motion.div>
            ))}
          </DraggableCardContainer>
        </div>
      )}
    </div>
  );
};

export default Landing;
