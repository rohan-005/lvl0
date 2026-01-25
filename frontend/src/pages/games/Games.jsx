/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGames } from "../../utils/gamesApi";
import StaggeredMenu from "../../ui_components/StaggeredMenu";
import "../../css/games.css";

/* =====================
   NAVBAR CONFIG
   ===================== */
const menuItems = [
  { label: "Home", ariaLabel: "Go to home page", link: "/home" },
  { label: "News", ariaLabel: "Go to news page", link: "/news" },
  { label: "Communities", ariaLabel: "View communities", link: "/services" },
  { label: "Games Data", ariaLabel: "View games data", link: "/games" },
  { label: "Profile", ariaLabel: "View profile", link: "/profile" },
];

const socialItems = [
  { label: "Twitter", link: "https://twitter.com" },
  { label: "GitHub", link: "https://github.com" },
  { label: "LinkedIn", link: "https://linkedin.com" },
];

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

/* =====================
   SKELETON
   ===================== */
const GamesSkeleton = () => (
  <div className="news-grid">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="news-card skeleton-card">
        <div className="skeleton-img" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    ))}
  </div>
);

const Games = () => {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [visibleCount, setVisibleCount] = useState(12);

  /* =====================
     FETCH
     ===================== */
  const loadGames = async (params = {}) => {
    setLoading(true);
    try {
      const res = await fetchGames({
        page_size: 40,
        ...params,
      });
      setGames(res.data?.results || []);
      setVisibleCount(12);
    } catch (err) {
      console.error("Games fetch failed", err);
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
    <>
      <StaggeredMenu items={menuItems} socialItems={socialItems} />

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
            >
              ⊞
            </button>
            <button
              className={`control-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              ☰
            </button>
          </div>
        </div>

        {/* SEARCH */}
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

        {/* CONTENT */}
        {loading ? (
          <GamesSkeleton />
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
    </>
  );
};

export default Games;
