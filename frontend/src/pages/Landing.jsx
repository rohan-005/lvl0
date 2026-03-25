/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import "../css/Landingcss.css";
import Buttons from "../ui_components/Button";

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
  },
  end: {
    top: "32px",
    left: "48px",
    x: 0,
    y: 0,
    scale: 0.85,
    transition: { duration: 1.5 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.8 },
  }),
};

/* SCATTERED POSITIONS */
const positions = [
  "top-[10%] left-[55%]",
  "top-[20%] left-[75%]",
  "top-[45%] left-[60%]",
  "top-[55%] left-[80%]",
  "top-[70%] left-[55%]",
  "top-[75%] left-[75%]",
];

/* CARDS */
const cards = [
  {
    title: "Genres",
    desc: "Explore playstyles",
    points: ["FPS / RPG / Strategy", "Smart filters"],
    color: "#00ff77",
  },
  {
    title: "Games",
    desc: "Original lvl0 titles",
    points: ["Indie builds", "Frequent updates"],
    color: "#7cffc4",
  },
  {
    title: "Stats",
    desc: "Track performance",
    points: ["Win rate", "Insights"],
    color: "#6affff",
  },
  {
    title: "Communities",
    desc: "Join players",
    points: ["Discussions", "Niche groups"],
    color: "#9dff8f",
  },
  {
    title: "Leaderboards",
    desc: "Global ranking",
    points: ["Skill based", "Seasonal"],
    color: "#b6ff9a",
  },
  {
    title: "News",
    desc: "Stay updated",
    points: ["Curated", "No noise"],
    color: "#8fffce",
  },
];

const Landing = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="landing-root">
      {/* LOGO */}
      <motion.div
        className="lvl0-logo-home"
        variants={logoVariants}
        initial="start"
        animate="end"
        onAnimationComplete={() => setShow(true)}
      >
        lvl<span className="underscore">_</span>0
      </motion.div>

      {/* HERO */}
      {show && (
        <div className="hero">
          <motion.h1 initial="hidden" animate="show" variants={fadeUp}>
            The Operating System
            <br />
            for Gamers
          </motion.h1>

          <motion.p
            className="hero-sub"
            initial="hidden"
            animate="show"
            variants={fadeUp}
            custom={0.2}
          >
            Communities, stats, games, and insights — all unified.
          </motion.p>

          <motion.div
            className="auth-buttons"
            initial="hidden"
            animate="show"
            variants={fadeUp}
            custom={0.4}
          >
            <Buttons variant="primary" onClick={() => navigate("/auth")}>
              Get Started
            </Buttons>

            <Buttons variant="secondary" onClick={() => navigate("/auth")}>
              Explore
            </Buttons>
          </motion.div>
        </div>
      )}

      {/* EXTRA CONTENT SECTION */}
      {show && (
        <motion.div
          className="info-strip"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0.6}
        >
          <span>Built for gamers</span>
          <span>Powered by MERN</span>
          <span>Scalable architecture</span>
        </motion.div>
      )}

      {/* CARDS */}
      {show && (
        <DraggableCardContainer className="cards-layer">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              className={`card-wrapper ${positions[i]}`}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.5 + i * 0.1}
            >
              <DraggableCardBody
                className="text-card"
                style={{ borderColor: c.color }}
              >
                <h3 style={{ color: c.color }}>{c.title}</h3>
                <p className="card-desc">{c.desc}</p>

                <ul className="card-points">
                  {c.points.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </DraggableCardBody>
            </motion.div>
          ))}
        </DraggableCardContainer>
      )}
    </div>
  );
};

export default Landing;