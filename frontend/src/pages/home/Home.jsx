/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/home.css";
import Button from "../../ui_components/Button";
import HomeNews from "./HomeNews";
import { useAuth } from "../../context/AuthContext";
import { fetchGames } from "../../utils/gamesApi";

/* ═══════════════ NAV ICONS ═══════════════ */
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const NewsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a4 4 0 0 1-4 4z" /><line x1="10" y1="7" x2="18" y2="7" /><line x1="10" y1="11" x2="18" y2="11" /><line x1="10" y1="15" x2="14" y2="15" />
  </svg>
);
const GamesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" /><line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><circle cx="16" cy="11" r="1" fill="currentColor" /><circle cx="18" cy="13" r="1" fill="currentColor" />
  </svg>
);
const CommunityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const NAV_ITEMS = [
  { icon: HomeIcon,      label: "Home",       link: "/home"     },
  { icon: NewsIcon,      label: "News",        link: "/news"     },
  { icon: GamesIcon,     label: "Games",       link: "/games"    },
  { icon: CommunityIcon, label: "Communities", link: "/communities" },
  { icon: ProfileIcon,   label: "Profile",     link: "/profile"  },
];

/* ═══════════════ FEED FILTERS ═══════════════ */
const FEED_FILTERS = ["All", "Gaming", "Dev", "Esports", "Indie"];
const GENRE_FILTERS = [
  { label: "All",    id: null },
  { label: "RPG",    id: 5   },
  { label: "FPS",    id: 2   },
  { label: "Indie",  id: 51  },
  { label: "Sim",    id: 14  },
  { label: "Horror", id: 19  },
];
const EXPLORE_LINKS = [
  { label: "Games",       link: "/games"    },
  { label: "Genres",      link: "/games"    },
  { label: "Communities", link: "/communities" },
  { label: "Dev Labs",    link: "/communities" },
  { label: "Leaderboard", link: "/games"    },
];

/* ═══════════════ NOTE ═══════════════
   RAWG direct fetch removed — ERR_CERT_AUTHORITY_INVALID in this env.
   Production: backend proxies RAWG, so mock is only a dev fallback.
═════════════════════════════════════*/

/* ═══════════════ MAIN COMPONENT ═══════════════ */
const Home = () => {
  const navigate = useNavigate();

  /* ── Auth ── */
  const { user, loading: loadingProfile } = useAuth();

  const getAvatarUrl = (u) => {
    const seed = u?.email || u?.name || "guest";
    let style  = "identicon";
    if (u?.accountType === "developer") style = "bottts-neutral";
    else if (u?.accountType === "gamer") style = "pixel-art";
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
  };

  /* ── Games ── */
  const [games,        setGames]       = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [activeGenre,  setActiveGenre] = useState(GENRE_FILTERS[0]);

  /* ── Feed filter ── */
  const [activeFeed, setActiveFeed] = useState("All");

  /* ── Trending Communities ── */
  const [trendingRooms, setTrendingRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  /* ── News mini strip (bottom card) — pulled from HomeNews via prop ── */
  const [newsHeadlines, setNewsHeadlines] = useState([]);

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

  useEffect(() => { loadGames(activeGenre.id); }, [activeGenre]);

  /* ── Fetch trending rooms ── */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || "https://lvl0.onrender.com"}/api/chat/rooms`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        // Select top 5 rooms as "trending"
        setTrendingRooms(res.data.slice(0, 5));
      } catch (err) {
        console.error("Failed to load trending rooms:", err);
      } finally {
        setLoadingRooms(false);
      }
    })();
  }, []);

  /* ═══════════ RENDER ═══════════ */
  return (
    <div className="hp-root">
      {/* ══ MAIN BODY ══ */}
      <div className="hp-body">

        {/* ── TOP ROW: Feed + Right Panel ── */}
        <div className="hp-top-row">

          {/* MAIN NEWS FEED */}
          <section className="hp-card hp-main-feed">
            <div className="hp-card-header">
              <div className="hp-section-pills">
                {FEED_FILTERS.map(f => (
                  <span
                    key={f}
                    className={`hp-pill${activeFeed === f ? " active" : ""}`}
                    onClick={() => setActiveFeed(f)}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="hp-feed-body">
              <HomeNews
                filter={activeFeed === "All" ? null : activeFeed}
                onHeadlines={setNewsHeadlines}
              />
            </div>

            <div className="hp-card-footer">
              <a href="/news" className="hp-view-all">View all news →</a>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <aside className="hp-right-panel">

            {/* Identity */}
            <div className="hp-card hp-identity-card">
              <div className="hp-card-header" style={{ padding: "10px 14px 8px" }}>
                <h3 className="hp-panel-title">IDENTITY</h3>
              </div>
              {loadingProfile ? (
                <div className="hp-identity-body"><div className="hp-skeleton-row" /></div>
              ) : (
                <div className="hp-identity-body">
                  <div className="hp-identity-row">
                    <img src={getAvatarUrl(user)} alt="avatar" className="hp-avatar-md" />
                    <div className="hp-identity-info">
                      <p className="hp-user-name">{user?.name}</p>
                      <p className="hp-user-role">{user?.role === "guest" ? "Guest" : user?.accountType?.toUpperCase()}</p>
                      {!user?.isVerified && user?.role !== "guest" && <p className="hp-status-warn">⚠ UNVERIFIED</p>}
                    </div>
                  </div>
                  <div className="hp-identity-actions">
                    {user?.role === "guest"
                      ? <Button onClick={() => navigate("/auth")}>LOGIN</Button>
                      : <>
                          <Button onClick={() => navigate("/profile")}>PROFILE</Button>
                          <Button onClick={() => navigate("/auth")}>LOGOUT</Button>
                        </>
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Trending Genres — filter games */}
            <div className="hp-card hp-trending-card">
              <div className="hp-card-header" style={{ padding: "10px 14px 8px" }}>
                <h3 className="hp-panel-title">TRENDING</h3>
              </div>
              <div className="hp-genre-list">
                {GENRE_FILTERS.map(g => (
                  <span
                    key={g.label}
                    className={`hp-genre-tag${activeGenre.label === g.label ? " active" : ""}`}
                    onClick={() => setActiveGenre(g)}
                    title={`Filter games by ${g.label}`}
                  >
                    {g.label === "All" ? "All" : `#${g.label}`}
                  </span>
                ))}
              </div>
            </div>

            {/* Trending Communities */}
            <div className="hp-card hp-discussions-card">
              <div className="hp-card-header" style={{ padding: "10px 14px 8px" }}>
                <h3 className="hp-panel-title">COMMUNITIES 🔥</h3>
              </div>
              <div className="hp-discussions-body">
                {loadingRooms ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="hp-discussion-item" style={{ minHeight: "24px", opacity: 0.5 }}>
                      <div className="hp-skeleton-row" style={{ width: "80%", height: "12px" }} />
                    </div>
                  ))
                ) : trendingRooms.length > 0 ? (
                  trendingRooms.map((room) => (
                    <div 
                      key={room._id} 
                      className="hp-discussion-item" 
                      onClick={() => navigate("/communities")}
                      style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <div>
                        <span className="hp-discussion-arrow" style={{ color: "var(--accent)", marginRight: "8px" }}>#</span>
                        <span style={{ fontWeight: 600 }}>{room.name.toLowerCase()}</span>
                      </div>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px" }}>
                        {room.category === "gamer" ? "🎮 Gamer" : "💻 Dev"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="hp-discussion-item">
                    <span>No active communities.</span>
                  </div>
                )}
              </div>
            </div>

          </aside>
        </div>

        {/* ── BOTTOM ROW: 3 Cards ── */}
        <div className="hp-bottom-row">

          {/* NEWS MINI CARD */}
          <div className="hp-card hp-bottom-card">
            <div className="hp-card-header">
              <h3 className="hp-panel-title">LATEST NEWS</h3>
              <a href="/news" className="hp-view-all">All →</a>
            </div>
            <div className="hp-bottom-news-list">
              {newsHeadlines.length > 0
                ? newsHeadlines.slice(0, 3).map((n, i) => (
                    <a key={i} href={n.url} target="_blank" rel="noreferrer" className="hp-news-mini-item">
                      <span className="hp-news-mini-title">{n.title}</span>
                      <span className="hp-news-mini-src">{n.source?.name}</span>
                    </a>
                  ))
                : <p className="hp-dim-text" style={{ padding: "8px 0" }}>Latest gaming headlines</p>
              }
            </div>
          </div>

          {/* FEATURED GAMES CARD */}
          <div className="hp-card hp-bottom-card">
            <div className="hp-card-header">
              <h3 className="hp-panel-title">
                GAMES
                {activeGenre.id && <span className="hp-genre-badge">#{activeGenre.label}</span>}
              </h3>
              <a href="/games" className="hp-view-all">All →</a>
            </div>
            <div className="hp-games-mini-list">
              {loadingGames
                ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="hp-skeleton-row" />)
                : games.length === 0
                  ? <p className="hp-dim-text">No games found</p>
                  : games.slice(0, 4).map(game => (
                      <div key={game.id} className="hp-game-mini-item" onClick={() => navigate(`/games/${game.id}`)}>
                        {game.background_image && (
                          <img src={game.background_image} alt={game.name} className="hp-game-thumb" />
                        )}
                        <span className="hp-game-name">{game.name}</span>
                        <span className="hp-game-meta">⭐ {game.rating?.toFixed(1) || "—"}</span>
                      </div>
                    ))
              }
            </div>
            <div className="hp-bottom-card-footer">
              <a href="/games" className="hp-view-all">Browse all →</a>
            </div>
          </div>

          

        </div>
      </div>
    </div>
  );
};

export default Home;
