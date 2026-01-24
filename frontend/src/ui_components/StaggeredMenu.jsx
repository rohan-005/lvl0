/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StaggeredMenu({ items, socialItems }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  const menuVariants = {
    closed: { x: "100%", transition: { duration: 0.5 } },
    open: { x: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    closed: { opacity: 0, x: 50 },
    open: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1 + 0.3, duration: 0.4 },
    }),
  };

  return (
    <>
      {/* MENU BUTTON */}
      <button
        className="nav-toggle-btn"
        aria-label="Toggle Menu"
        onClick={toggleMenu}
        style={{ zIndex: 100001 }}
      >
        <div style={{ position: "relative", width: 24, height: 24 }}>
          <span
            className="hamburger-line"
            style={{
              top: isOpen ? "11px" : "4px",
              transform: isOpen ? "rotate(45deg)" : "rotate(0)",
            }}
          />
          <span
            className="hamburger-line"
            style={{
              top: "11px",
              opacity: isOpen ? 0 : 1,
            }}
          />
          <span
            className="hamburger-line"
            style={{
              top: isOpen ? "11px" : "18px",
              transform: isOpen ? "rotate(-45deg)" : "rotate(0)",
            }}
          />
        </div>
      </button>

      {/* MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            style={{
              position: "fixed",
              inset: 0,
              background: "#0f1012",
              zIndex: 100000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <nav style={{ textAlign: "center" }}>
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={itemVariants}
                  style={{ margin: "20px 0" }}
                >
                  <a
                    href={item.link}
                    onClick={toggleMenu}
                    style={{
                      fontSize: "2rem",
                      color: "#fff",
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    {item.label}
                  </a>
                </motion.div>
              ))}

              <div
                style={{
                  marginTop: "10vh",
                  display: "flex",
                  gap: 24,
                  justifyContent: "center",
                }}
              >
                {socialItems.map((social, i) => (
                  <motion.div
                    key={i}
                    custom={items.length + i}
                    variants={itemVariants}
                  >
                    <a
                      href={social.link}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#FFA500",
                        textDecoration: "none",
                      }}
                    >
                      {social.label}
                    </a>
                  </motion.div>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
