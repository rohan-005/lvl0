import React from "react";

export const GameCardSkeleton = () => (
  <div 
    className="news-card game-skeleton-card"
    style={{
      backgroundColor: "var(--bg-card)",
      border: "2px solid var(--border-main)",
      boxShadow: "3px 3px 0px var(--border-main)",
      padding: "0",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      borderRadius: "0px",
      marginBottom: "20px",
      breakInside: "avoid"
    }}
  >
    <div 
      style={{
        width: "100%",
        height: "190px",
        backgroundColor: "var(--bg-secondary)",
        borderBottom: "2px solid var(--border-main)",
        animation: "hp-pulse 1.4s ease-in-out infinite"
      }} 
    />
    <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div 
        style={{
          width: "40%",
          height: "12px",
          backgroundColor: "var(--bg-secondary)",
          animation: "hp-pulse 1.4s ease-in-out infinite"
        }} 
      />
      <div 
        style={{
          width: "80%",
          height: "18px",
          backgroundColor: "var(--bg-secondary)",
          animation: "hp-pulse 1.4s ease-in-out infinite"
        }} 
      />
      <div 
        style={{
          width: "30%",
          height: "14px",
          backgroundColor: "var(--bg-secondary)",
          marginTop: "6px",
          animation: "hp-pulse 1.4s ease-in-out infinite"
        }} 
      />
    </div>
  </div>
);

export const GameGridSkeleton = ({ count = 12 }) => (
  <div className="news-grid">
    {Array.from({ length: count }).map((_, i) => (
      <GameCardSkeleton key={i} />
    ))}
  </div>
);

export const GameMiniSkeleton = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "8px",
      backgroundColor: "var(--bg-card)",
      border: "1px solid var(--border-subtle)",
      marginBottom: "6px",
    }}
  >
    <div
      style={{
        width: "36px",
        height: "26px",
        backgroundColor: "var(--bg-secondary)",
        animation: "hp-pulse 1.4s ease-in-out infinite",
        flexShrink: 0,
      }}
    />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ width: "70%", height: "12px", backgroundColor: "var(--bg-secondary)", animation: "hp-pulse 1.4s ease-in-out infinite" }} />
      <div style={{ width: "30%", height: "10px", backgroundColor: "var(--bg-secondary)", animation: "hp-pulse 1.4s ease-in-out infinite" }} />
    </div>
  </div>
);

export const GameDetailsSkeleton = () => (
  <div className="game-details-skeleton" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
    <div style={{ width: "100%", height: "280px", backgroundColor: "var(--bg-secondary)", border: "2px solid var(--border-main)", animation: "hp-pulse 1.4s ease-in-out infinite" }} />
    <div style={{ width: "60%", height: "28px", backgroundColor: "var(--bg-secondary)", animation: "hp-pulse 1.4s ease-in-out infinite" }} />
    <div style={{ width: "90%", height: "16px", backgroundColor: "var(--bg-secondary)", animation: "hp-pulse 1.4s ease-in-out infinite" }} />
  </div>
);

export default GameGridSkeleton;
