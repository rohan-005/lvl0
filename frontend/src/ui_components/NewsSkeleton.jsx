import React from "react";

export const NewsItemSkeleton = () => (
  <div
    style={{
      padding: "12px",
      backgroundColor: "var(--bg-card)",
      border: "1px solid var(--border-subtle)",
      marginBottom: "8px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    }}
  >
    <div style={{ width: "30%", height: "12px", backgroundColor: "var(--bg-secondary)", animation: "hp-pulse 1.4s ease-in-out infinite" }} />
    <div style={{ width: "85%", height: "16px", backgroundColor: "var(--bg-secondary)", animation: "hp-pulse 1.4s ease-in-out infinite" }} />
    <div style={{ width: "65%", height: "12px", backgroundColor: "var(--bg-secondary)", animation: "hp-pulse 1.4s ease-in-out infinite" }} />
  </div>
);

export const NewsFeedSkeleton = ({ count = 3 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
    {Array.from({ length: count }).map((_, i) => (
      <NewsItemSkeleton key={i} />
    ))}
  </div>
);

export default NewsFeedSkeleton;
