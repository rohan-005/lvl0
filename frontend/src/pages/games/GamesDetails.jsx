import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchGameDetails,
  fetchGameStores,
  fetchSimilarGames,
} from "../../utils/gamesApi";
import "../../css/games.css";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

/* =====================
   NAV
   ===================== */
// const menuItems = [
//   { label: "Home", link: "/home" },
//   { label: "News", link: "/news" },
//   { label: "Games Data", link: "/games" },
//   { label: "Profile", link: "/profile" },
// ];

const RATING_COLORS = {
  exceptional: "#00ff77",
  recommended: "#4f46e5",
  meh: "#f59e0b",
  skip: "#ef4444",
};

const GameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [stores, setStores] = useState([]);
  const [similarGames, setSimilarGames] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Reviews */
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem(`reviews_${id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [g, s, sim] = await Promise.all([
          fetchGameDetails(id),
          fetchGameStores(id),
          fetchSimilarGames(id),
        ]);

        setGame(g.data);
        setStores(s.data?.results || []);
        setSimilarGames(sim.data?.results || []);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [id]);

  /* SAVE REVIEW */
  const submitReview = () => {
    if (!comment.trim()) return;

    const newReview = {
      rating,
      comment,
      date: new Date().toLocaleDateString(),
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updated));
    setComment("");
    setRating(5);
  };

  if (loading) {
    return (
      <div className="details-loader">
        <div className="spinner" />
        <p>Loading game data…</p>
      </div>
    );
  }

  if (!game) return null;

  const ratingData =
    Array.isArray(game.ratings) && game.ratings.length
      ? game.ratings.map((r) => ({
          name: r.title.toUpperCase(),
          value: r.count,
          percent: r.percent,
          color: RATING_COLORS[r.title] || "#888",
        }))
      : [];

  return (
    <>
      <div className="game-details-page">
        {/* HEADER */}
        <div className="details-header">
          <div className="lvl0-logo">
            lvl<span className="underscore">_</span>0
          </div>

          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        <div className="bento-grid">
          
          {/* 1. HERO (Top Left 2x1) */}
          <div 
            className="bento-card bento-hero" 
            style={{ backgroundImage: `url(${game.background_image})`, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="hero-bento-overlay">
              <h1>{game.name}</h1>
              <p>⭐ {game.rating} · 🎯 Metacritic {game.metacritic || "N/A"}</p>
            </div>
          </div>

          {/* 2. CHART & STATS (Top Right 2x1) */}
          <div className="bento-card bento-chart">
            <h3>PLAYER RATINGS & STATS</h3>
            
            <div className="quick-stats-row">
              <div className="stat-box"><span>PLAYTIME</span><strong>{game.playtime || 0}h</strong></div>
              <div className="stat-box"><span>ADDED BY</span><strong>{game.added ? game.added.toLocaleString() : 0}</strong></div>
              <div className="stat-box"><span>ACHIEVEMENTS</span><strong>{game.parent_achievements_count || game.achievements_count || "N/A"}</strong></div>
            </div>

            {ratingData.length ? (
              <div className="bento-ratings-layout">
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie 
                        data={ratingData} 
                        dataKey="value" 
                        innerRadius={50} 
                        outerRadius={80}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                          const rad = Math.PI / 180;
                          const radius = outerRadius + 20;
                          const x = cx + radius * Math.cos(-midAngle * rad);
                          const y = cy + radius * Math.sin(-midAngle * rad);
                          return (
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11px" fontWeight="bold">
                              {`${name} ${percent ? percent.toFixed(1) + '%' : ''}`}
                            </text>
                          );
                        }}
                        labelLine={false}
                      >
                        {ratingData.map((r, i) => <Cell key={i} fill={r.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="rating-legend">
                  {ratingData.map((r, i) => (
                    <div key={i} className="legend-row">
                      <span className="legend-dot" style={{ background: r.color }} />
                      <span className="legend-label">{r.name} <em>({r.value})</em></span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="dim-text" style={{marginTop:"20px"}}>No rating data</p>
            )}
          </div>

          {/* 3. INFO STACK (Bottom Left Col 1) */}
          <div className="bento-bottom-left-stack">
            <div className="bento-card bento-platforms">
              <h3>PLATFORMS</h3>
              <div className="platform-chips">
                {game.platforms.slice(0, 5).map((p, i) => (
                  <span key={i} className="platform-chip">{p.platform.name}</span>
                ))}
              </div>
            </div>
            <div className="bento-card bento-stores">
              <h3>STORES</h3>
              <div className="store-links">
                {stores.slice(0, 3).map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noreferrer">{s.store?.name || "Store"}</a>
                ))}
              </div>
            </div>
          </div>

          {/* 4. ABOUT (Bottom Middle Col 2) */}
          <div className="bento-card bento-about">
            <h3>ABOUT</h3>
            <div className="bento-description" dangerouslySetInnerHTML={{ __html: game.description }} />
          </div>

          {/* 5. SIMILAR GAMES (Bottom Right Col 3-4) */}
          <div className="bento-card bento-similar">
            <h3>SIMILAR GAMES</h3>
            <div className="similar-bento-scroll">
              {similarGames.map(g => (
                <div key={g.id} className="similar-bento-card" onClick={() => navigate(`/games/${g.id}`)}>
                  <img src={g.background_image} alt={g.name} />
                  <p>{g.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. REVIEWS (Full Width Bottom) */}
          <div className="bento-card bento-reviews">
            <h3>USER REVIEWS</h3>
            <div className="review-flex">
              
              <div className="review-form">
                <div className="star-rating-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star} 
                      className={`star ${rating >= star ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                  <span className="rating-text">{rating} Stars</span>
                </div>
                <textarea placeholder="Write your thoughts on this game…" value={comment} onChange={(e) => setComment(e.target.value)} />
                <button className="submit-review-btn" onClick={submitReview}>Post Review</button>
              </div>

              <div className="review-list">
                {reviews.length === 0 && <div className="empty-reviews">No reviews yet. Be the first to share your thoughts!</div>}
                {reviews.map((r, i) => (
                  <div key={i} className="review-card">
                    <div className="review-header">
                      <div className="review-avatar">U</div>
                      <div className="review-meta">
                        <span className="review-stars">
                          <span className="stars-active">{"★".repeat(r.rating)}</span>
                          <span className="stars-inactive">{"★".repeat(5 - r.rating)}</span>
                        </span>
                        <span className="review-date">{r.date}</span>
                      </div>
                    </div>
                    <p className="review-body">{r.comment}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

        <div className="rawg-credit">
          Game data powered by <span>RAWG.io</span>
        </div>
      </div>
    </>
  );
};

export default GameDetails;
