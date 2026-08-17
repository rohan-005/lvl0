/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchGames } from "../../utils/gamesApi";
import { GameGridSkeleton } from "../../ui_components/GameSkeleton";
import "../../css/games.css";

/* =====================
   TAGS
   ===================== */
const QUICK_TAGS = [
  "All",
  "RPG",
  "Action",
  "Indie",
  "Shooter",
  "Adventure",
  "Strategy",
  "Multiplayer",
];

const Games = () => {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [visibleCount, setVisibleCount] = useState(12);

  /* =====================
     FETCH GAMES
     ===================== */
  const loadGames = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchGames({
        page_size: 40,
        ...params,
      });
      setGames(res.data?.results || []);
      setVisibleCount(12);
    } catch (err) {
      setError("Unable to load games right now.");
      toast.error("Unable to load games right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const displayedGames = useMemo(
    () => games.slice(0, visibleCount),
    [games, visibleCount]
  );

  return (
    <div className="news-page">
      {/* HEADER */}
      <div className="news-header">
        <div className="lvl0-logo">
          lvl<span className="underscore">_</span>0
        </div>

        <div className="view-controls">
          <button
            className={`control-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            aria-label="Grid View"
          >
            ⊞
          </button>
          <button
            className={`control-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-label="List View"
          >
            ☰
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="news-search-container">
        <div className="news-search">
          <input
            placeholder="Search games..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && loadGames({ search: query })
            }
          />
          <button onClick={() => loadGames({ search: query })}>🔍</button>
        </div>

        <div className="tags-scroller">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              className={`tag-chip ${activeTag === tag ? "active" : ""}`}
              onClick={() => {
                setActiveTag(tag);
                tag === "All"
                  ? loadGames()
                  : loadGames({ genres: tag.toLowerCase() });
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT STATES */}
      {loading ? (
        <GameGridSkeleton count={12} />
      ) : error ? (
        <div 
          className="sharp-card"
          style={{
            padding: "40px 20px",
            textAlign: "center",
            margin: "20px 0",
            backgroundColor: "var(--bg-card)",
            border: "2px solid var(--border-main)"
          }}
        >
          <p style={{ color: "var(--danger)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px" }}>
            {error}
          </p>
          <button className="sharp-button" onClick={() => loadGames()}>
            RETRY
          </button>
        </div>
      ) : displayedGames.length === 0 ? (
        <div 
          className="sharp-card"
          style={{
            padding: "40px 20px",
            textAlign: "center",
            margin: "20px 0",
            backgroundColor: "var(--bg-card)",
            border: "2px solid var(--border-main)"
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", fontWeight: "600" }}>
            No games found matching your search.
          </p>
        </div>
      ) : (
        <>
          <div
            className={`news-grid ${
              viewMode === "list" ? "list-view" : ""
            }`}
          >
            {displayedGames.map((g) => (
              <div
                key={g.id}
                className="news-card clickable"
                onClick={() => navigate(`/games/${g.id}`)}
              >
                <div className="card-image-wrapper">
                  <img
                    src={g.background_image}
                    alt={g.name}
                    className="news-image"
                    loading="lazy"
                  />
                </div>

                <div className="news-content">
                  <span className="news-date">
                    ⭐ {g.rating || "N/A"} · 🎮 {g.playtime || 0}h
                  </span>

                  <h3>{g.name}</h3>

                  <div className="news-actions">
                    <span className="read-btn">View Stats</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < games.length && (
            <div className="load-more-wrapper">
              <button
                className="load-more-btn"
                onClick={() => setVisibleCount((p) => p + 12)}
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}

      <div className="rawg-credit">
        Game data powered by <span>RAWG.io</span>
      </div>
    </div>
  );
};

export default Games;
