import React from "react";

export const GameCardSkeleton = () => (
  <div 
    style={{
      backgroundColor: "var(--bg-card)",
      border: "2px solid var(--border-main)",
      boxShadow: "3px 3px 0px var(--border-main)",
      padding: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      borderRadius: "0px",
    }}
  >
    <div 
      style={{
        width: "100%",
        height: "160px",
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-subtle)",
        animation: "hp-pulse 1.4s ease-in-out infinite",
      }} 
    />
    <div 
      style={{
        width: "75%",
        height: "18px",
        backgroundColor: "var(--bg-secondary)",
        animation: "hp-pulse 1.4s ease-in-out infinite",
      }} 
    />
    <div 
      style={{
        width: "45%",
        height: "14px",
        backgroundColor: "var(--bg-secondary)",
        animation: "hp-pulse 1.4s ease-in-out infinite",
      }} 
    />
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
