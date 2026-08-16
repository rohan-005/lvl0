import React, { useEffect, useRef } from "react";

const HeroCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    // Mouse interactive target
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Generate nodes
    const nodeCount = Math.min(Math.floor(width / 25), 45);
    const nodes = Array.from({ length: nodeCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2.5 + 1,
      shape: Math.random() > 0.5 ? "square" : "dot",
      alpha: Math.random() * 0.6 + 0.2,
    }));

    // Render loop
    const render = () => {
      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Atmospheric radial gradient behind hero
      const grad = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        10,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      grad.addColorStop(0, "rgba(168, 61, 50, 0.15)");
      grad.addColorStop(0.4, "rgba(58, 41, 34, 0.12)");
      grad.addColorStop(1, "rgba(43, 33, 28, 0.0)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Grid lines background (sharp tactical gaming vibe)
      ctx.strokeStyle = "rgba(106, 85, 72, 0.08)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render & update nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.strokeStyle = `rgba(168, 61, 50, ${0.25 * (1 - dist / 110)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        // Draw node
        ctx.fillStyle = `rgba(168, 61, 50, ${n.alpha})`;
        if (n.shape === "square") {
          ctx.fillRect(n.x - n.size, n.y - n.size, n.size * 2, n.size * 2);
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

export default HeroCanvas;
