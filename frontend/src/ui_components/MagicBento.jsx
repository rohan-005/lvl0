import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

const MOBILE_BREAKPOINT = 768;
const GLOW_COLOR = "132, 0, 255";

const useIsMobile = () => {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return mobile;
};

const MagicBento = ({ cards }) => {
  const gridRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;

    const cards = gridRef.current.querySelectorAll(".bento-card");

    cards.forEach(card => {
      const onMove = e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);

        gsap.to(card, {
          rotateX: ((y / rect.height) - 0.5) * -8,
          rotateY: ((x / rect.width) - 0.5) * 8,
          duration: 0.2
        });
      };

      const onLeave = () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3
        });
      };

      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
    });
  }, [isMobile]);

  return (
    <>
      <style>{`
        .bento-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(4, 1fr);
        }

        @media (max-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
        }

        .bento-card {
          position: relative;
          background: #060010;
          border-radius: 18px;
          padding: 20px;
          min-height: 200px;
          color: white;
          border: 1px solid rgba(255,255,255,0.08);
          transform-style: preserve-3d;
          transition: box-shadow 0.3s;
          overflow: hidden;
        }

        .bento-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            250px circle at var(--x, 50%) var(--y, 50%),
            rgba(${GLOW_COLOR}, 0.25),
            transparent 60%
          );
          opacity: 0;
          transition: opacity 0.3s;
        }

        .bento-card:hover::after {
          opacity: 1;
        }

        .bento-card:hover {
          box-shadow: 0 15px 40px rgba(${GLOW_COLOR}, 0.25);
        }

        .bento-label {
          font-size: 13px;
          opacity: 0.7;
        }

        .bento-title {
          font-size: 18px;
          margin: 6px 0;
        }

        .bento-desc {
          font-size: 13px;
          opacity: 0.85;
          line-height: 1.4;
        }
      `}</style>

      <div ref={gridRef} className="bento-grid">
        {cards.map((card, i) => (
          <div key={i} className="bento-card">
            <span className="bento-label">{card.label}</span>
            <h3 className="bento-title">{card.title}</h3>
            <p className="bento-desc">{card.description}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default MagicBento;
