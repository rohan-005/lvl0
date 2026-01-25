import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import StaggeredMenu from "../../ui_components/StaggeredMenu";
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
          color: RATING_COLORS[r.title] || "#888",
        }))
      : [];

  return (
    <>
      {/* <StaggeredMenu items={menuItems} /> */}

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

        {/* HERO */}
        <div
          className="game-hero"
          style={{ backgroundImage: `url(${game.background_image})` }}
        >
          <div className="hero-overlay">
            <h1>{game.name}</h1>
            <p>
              ⭐ {game.rating} · 🎯 Metacritic {game.metacritic || "N/A"}
            </p>
          </div>
        </div>

        {/* ABOUT */}
        <section className="glass-section">
          <h3 className="section-title">ABOUT</h3>
          <div
            className="description"
            dangerouslySetInnerHTML={{ __html: game.description }}
          />
        </section>

        {/* RATINGS */}
        <section className="glass-section">
          <h3 className="section-title">PLAYER RATINGS</h3>

          {ratingData.length ? (
            <div className="ratings-layout">
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={ratingData}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={100}
                    >
                      {ratingData.map((r, i) => (
                        <Cell key={i} fill={r.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="rating-legend">
                {ratingData.map((r, i) => (
                  <div key={i} className="legend-row">
                    <span
                      className="legend-dot"
                      style={{ background: r.color }}
                    />
                    <span className="legend-label">{r.name}</span>
                    <span className="legend-value">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="dim-text">No rating data available</p>
          )}
        </section>

        {/* AVAILABLE ON */}
        <section className="glass-section">
          <h3 className="section-title">AVAILABLE ON</h3>

          <div className="platform-chips">
            {game.platforms.map((p, i) => (
              <span key={i} className="platform-chip">
                {p.platform.name}
              </span>
            ))}
          </div>
        </section>

        {/* SIMILAR GAMES */}
        <section className="glass-section">
          <h3 className="section-title">SIMILAR GAMES</h3>

          <div className="similar-scroll">
            {similarGames.map((g) => (
              <div
                key={g.id}
                className="similar-card"
                onClick={() => navigate(`/games/${g.id}`)}
              >
                <img src={g.background_image} alt={g.name} />
                <p>{g.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* REVIEWS */}
        <section className="glass-section">
          <h3 className="section-title">USER REVIEWS</h3>

          <div className="review-form">
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} ★
                </option>
              ))}
            </select>

            <textarea
              placeholder="Write your thoughts…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button onClick={submitReview}>Submit</button>
          </div>

          {reviews.length === 0 && <p className="dim-text">No reviews yet</p>}

          {reviews.map((r, i) => (
            <div key={i} className="review-card">
              <strong>{r.rating} ★</strong>
              <p>{r.comment}</p>
              <span className="review-date">{r.date}</span>
            </div>
          ))}
        </section>

        <div className="rawg-credit">
          Game data powered by <span>RAWG.io</span>
        </div>
      </div>
    </>
  );
};

export default GameDetails;
