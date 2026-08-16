/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_CONFIG } from "../../config/apiConfig";
import "../../css/home.css";
import Button from "../../ui_components/Button";
import HomeNews from "./HomeNews";
import { useAuth } from "../../context/AuthContext";
import { fetchGames } from "../../utils/gamesApi";
import HeroCanvas from "../../ui_components/HeroCanvas";
import { GameCardSkeleton, GameMiniSkeleton } from "../../ui_components/GameSkeleton";

/* ═══════════════ CONSTANTS & FILTERS ═══════════════ */
const FEED_FILTERS = ["All", "Gaming", "Dev", "Esports", "Indie"];

const GENRE_FILTERS = [
  { label: "All",    id: null },
  { label: "RPG",    id: 5   },
  { label: "FPS",    id: 2   },
  { label: "Indie",  id: 51  },
  { label: "Sim",    id: 14  },
  { label: "Horror", id: 19  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user, isGuest, loading: loadingProfile } = useAuth();

  const getAvatarUrl = (u) => {
    if (isGuest || !u) {
      return `https://api.dicebear.com/7.x/identicon/svg?seed=guest`;
    }
    const seed = u.email || u.name || "user";
    let style = "identicon";
    if (u.accountType === "developer") style = "bottts-neutral";
    else if (u.accountType === "gamer") style = "pixel-art";
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
  };

  /* ── State ── */
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [activeGenre, setActiveGenre] = useState(GENRE_FILTERS[0]);
  const [activeFeed, setActiveFeed] = useState("All");

  const [trendingRooms, setTrendingRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [newsHeadlines, setNewsHeadlines] = useState([]);

  /* ── Fetch Games ── */
  const loadGames = async (genreId) => {
    setLoadingGames(true);
    try {
      const params = { ordering: "-added", page_size: 6 };
      if (genreId) params.genres = genreId;
      const { data } = await fetchGames(params);
      setGames(data.results || []);
    } catch (err) {
      console.error("Failed to load games:", err);
      setGames([]);
    } finally {
      setLoadingGames(false);
    }
  };

  useEffect(() => {
    loadGames(activeGenre.id);
  }, [activeGenre]);

  /* ── Fetch Trending Communities ── */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_CONFIG.GATEWAY_URL}/api/chat/rooms`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setTrendingRooms(res.data.slice(0, 6));
      } catch (err) {
        console.error("Failed to load trending rooms:", err);
      } finally {
        setLoadingRooms(false);
      }
    })();
  }, []);

  return (
    <div className="hp-new-container">
      
      {/* ════════════════════════════════════════
         1. CINEMATIC ANIMATED HERO SECTION
      ════════════════════════════════════════ */}
      <header className="hp-hero-section">
        <HeroCanvas />

        <div className="hp-hero-overlay">
          <div className="hp-hero-badge">
            <span className="badge-pulse" />
            <span>LVL_0 DISCOVERY PLATFORM</span>
          </div>

          <h1 className="hp-hero-title">
            Discover. Play. Connect.
          </h1>

          <p className="hp-hero-subtitle">
            Explore games, news and communities in one unified platform.
          </p>

          <div className="hp-hero-actions">
            <button className="sharp-button hp-cta-primary" onClick={() => navigate("/games")}>
              EXPLORE GAMES
            </button>
            <button className="sharp-button hp-cta-secondary" onClick={() => navigate("/news")}>
              READ NEWS
            </button>
          </div>

          <div className="hp-hero-stats">
            <div className="stat-box">
              <span className="stat-val">500,000+</span>
              <span className="stat-lbl">GAMES INDEXED</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-box">
              <span className="stat-val">LIVE</span>
              <span className="stat-lbl">NEWS FEED</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-box">
              <span className="stat-val">REAL-TIME</span>
              <span className="stat-lbl">COMMUNITIES</span>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════
         MAIN CONTENT AREA
      ════════════════════════════════════════ */}
      <main className="hp-content-wrap">

        {/* ════════════════════════════════════════
           2. FEATURED GAMES SHOWCASE
        ════════════════════════════════════════ */}
        <section className="hp-section hp-games-showcase">
          <div className="hp-section-header">
            <div className="hp-section-title-wrap">
              <span className="section-tag">SHOWCASE</span>
              <h2 className="hp-section-title">FEATURED GAMES</h2>
            </div>

            <div className="hp-genre-pills">
              {GENRE_FILTERS.map((g) => (
                <button
                  key={g.label}
                  className={`hp-genre-pill${activeGenre.label === g.label ? " active" : ""}`}
                  onClick={() => setActiveGenre(g)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hp-games-grid">
            {loadingGames
              ? Array.from({ length: 6 }).map((_, i) => <GameCardSkeleton key={i} />)
              : games.map((game) => (
                  <article
                    key={game.id}
                    className="sharp-card hp-game-card"
                    onClick={() => navigate(`/games/${game.id}`)}
                  >
                    <div className="game-card-img-wrap">
                      {game.background_image ? (
                        <img src={game.background_image} alt={game.name} className="game-card-img" />
                      ) : (
                        <div className="game-card-img-placeholder">NO ARTWORK</div>
                      )}
                      <span className="game-card-rating">
                        ★ {game.rating?.toFixed(1) || "N/A"}
                      </span>
                    </div>

                    <div className="game-card-info">
                      <h3 className="game-card-name">{game.name}</h3>
                      <div className="game-card-meta">
                        <span>Released: {game.released || "TBA"}</span>
                        <span className="game-card-genre">
                          {game.genres?.slice(0, 2).map((g) => g.name).join(", ") || "Game"}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
          </div>

          <div className="hp-section-footer">
            <button className="hp-link-btn" onClick={() => navigate("/games")}>
              VIEW ALL GAMES →
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════════
           3. EDITORIAL MAGAZINE & COMMUNITY GRID
        ════════════════════════════════════════ */}
        <div className="hp-editorial-grid">

          {/* LEFT COLUMN: LIVE NEWS FEED */}
          <section className="sharp-card hp-news-column">
            <div className="hp-card-title-bar">
              <div>
                <span className="card-sub-tag">LIVE FEED</span>
                <h2 className="card-main-title">GAMING & DEV NEWS</h2>
              </div>
              <a href="/news" className="hp-link-btn">ALL NEWS →</a>
            </div>

            <div className="hp-filter-strip">
              {FEED_FILTERS.map((f) => (
                <button
                  key={f}
                  className={`hp-filter-pill${activeFeed === f ? " active" : ""}`}
                  onClick={() => setActiveFeed(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="hp-news-feed-container">
              <HomeNews
                filter={activeFeed === "All" ? null : activeFeed}
                onHeadlines={setNewsHeadlines}
              />
            </div>
          </section>

          {/* RIGHT COLUMN: SIDEBAR PANELS */}
          <aside className="hp-side-column">

            {/* IDENTITY / GUEST CARD */}
            <div className="sharp-card hp-side-card hp-identity-card">
              <div className="card-header-sm">
                <span className="card-sub-tag">USER PROFILE</span>
                <span className="status-badge">{isGuest ? "GUEST MODE" : user?.accountType?.toUpperCase() || "MEMBER"}</span>
              </div>

              {loadingProfile ? (
                <div className="hp-identity-skeleton">Loading identity...</div>
              ) : (
                <div className="hp-identity-body">
                  <div className="identity-user-row">
                    <img src={getAvatarUrl(user)} alt="User avatar" className="user-avatar" />
                    <div className="user-details">
                      <h4 className="user-name">{isGuest ? "Guest Explorer" : user?.name}</h4>
                      <p className="user-role">{isGuest ? "Browsing Read-Only" : user?.email}</p>
                    </div>
                  </div>

                  <div className="identity-actions">
                    {isGuest ? (
                      <>
                        <button className="sharp-button btn-sm" onClick={() => navigate("/auth")}>
                          LOGIN
                        </button>
                        <button className="sharp-button btn-sm btn-outline" onClick={() => navigate("/auth")}>
                          REGISTER
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="sharp-button btn-sm" onClick={() => navigate("/profile")}>
                          PROFILE
                        </button>
                        <button className="sharp-button btn-sm btn-outline" onClick={() => navigate("/auth")}>
                          LOGOUT
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* TRENDING COMMUNITIES */}
            <div className="sharp-card hp-side-card hp-community-card">
              <div className="card-header-sm">
                <span className="card-sub-tag">COMMUNITIES</span>
                <a href="/communities" className="hp-link-sm">VIEW ALL →</a>
              </div>

              <div className="hp-community-list">
                {loadingRooms ? (
                  Array.from({ length: 4 }).map((_, i) => <GameMiniSkeleton key={i} />)
                ) : trendingRooms.length > 0 ? (
                  trendingRooms.map((room) => (
                    <div
                      key={room._id}
                      className="community-row-item"
                      onClick={() => navigate("/communities")}
                    >
                      <div className="room-icon-tag">#</div>
                      <div className="room-info">
                        <span className="room-name">{room.name.toLowerCase()}</span>
                        <span className="room-desc">{room.description || "Active community room"}</span>
                      </div>
                      <span className="room-badge">
                        {room.category === "gamer" ? "🎮 Gamer" : "💻 Dev"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="empty-msg">No active public communities found.</p>
                )}
              </div>
            </div>

            {/* QUICK HEADLINES MINI STRIP */}
            <div className="sharp-card hp-side-card hp-quick-news-card">
              <div className="card-header-sm">
                <span className="card-sub-tag">HEADLINES</span>
                <span className="card-count">{newsHeadlines.length}</span>
              </div>
              <div className="quick-news-list">
                {newsHeadlines.slice(0, 3).map((n, i) => (
                  <a key={i} href={n.url} target="_blank" rel="noreferrer" className="quick-news-item">
                    <span className="news-bullet">▪</span>
                    <span className="news-title-text">{n.title}</span>
                  </a>
                ))}
              </div>
            </div>

          </aside>
        </div>

        {/* ════════════════════════════════════════
           4. GUEST CONVERSION BANNER (IF GUEST)
        ════════════════════════════════════════ */}
        {isGuest && (
          <section className="sharp-card hp-conversion-banner">
            <div className="conversion-content">
              <div className="conversion-text">
                <span className="conversion-tag">JOIN THE COMMUNITY</span>
                <h2>UNLOCK THE FULL LVL_0 EXPERIENCE</h2>
                <p>
                  Create your free account today to join live developer & gamer discussions, save game lists, and participate in community feeds.
                </p>
                <div className="conversion-features">
                  <span>✓ Live Chat Rooms</span>
                  <span>✓ Custom Game Collections</span>
                  <span>✓ Verified Dev Badges</span>
                </div>
              </div>
              <div className="conversion-actions">
                <button className="sharp-button btn-lg" onClick={() => navigate("/auth")}>
                  CREATE FREE ACCOUNT
                </button>
                <button className="sharp-button btn-lg btn-outline" onClick={() => navigate("/auth")}>
                  SIGN IN
                </button>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default Home;
