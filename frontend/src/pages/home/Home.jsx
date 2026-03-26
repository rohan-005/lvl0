import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/home.css";
import Button from "../../ui_components/Button";
import HomeNews from "./HomeNews";
import { fetchTrendingGames } from "../../utils/gamesApi";

/* ─── Nav icon helpers ─── */

/* ─── Main Component ─── */
const Home = () => {
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [trendingGames, setTrendingGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const guestUser = {
    name: "Guest",
    role: "guest",
    email: null,
    accountType: null,
    isVerified: false,
  };

  const getAvatarUrl = (u) => {
    const seed = u?.email || u?.name || "guest";
    let style = "identicon";
    if (u?.accountType === "developer") style = "bottts-neutral";
    else if (u?.accountType === "gamer") style = "pixel-art";
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
  };

  useEffect(() => {
    fetchTrendingGames()
      .then((res) => setTrendingGames(res.data.results))
      .finally(() => setLoadingGames(false));
  }, []);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUser(guestUser);
          return;
        }
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          localStorage.removeItem("token");
          setUser(guestUser);
          return;
        }
        const data = await res.json();
        setUser({
          name: data.name,
          email: data.email,
          role: data.role,
          accountType: data.accountType,
          isVerified: data.isVerified,
        });
      } catch {
        setUser(guestUser);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetch_();
  }, []);

  const trendingGenres = ["RPG", "FPS", "INDIE", "SIM", "HORROR"];
  const activeDiscussions = [
    "Best Soulslike combat?",
    "Unity vs Unreal 2026",
    "AI-driven NPC behavior",
  ];

  return (
    <div className="hp-root">
      {/* ── EXPANDABLE SIDEBAR ── */}
      
      {/* ── MAIN BODY ── */}
      <div className={`hp-body`}>
        {/* ── TOP ROW ── */}
        <div className="hp-top-row">
          {/* MAIN FEED — large card */}
          <section className="hp-card hp-main-feed">
            <div className="hp-card-header">
              <div className="hp-section-pills">
                <span className="hp-pill active">Feed</span>
                <span className="hp-pill">Trending</span>
                <span className="hp-pill">New</span>
                <span className="hp-pill">Following</span>
              </div>
            </div>

            <div className="hp-feed-body">
              <HomeNews />
            </div>

            <div className="hp-card-footer">
              <a href="/news" className="hp-view-all">
                View all news →
              </a>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <aside className="hp-right-panel">
            {/* User Identity */}
            <div className="hp-card hp-identity-card">
              <h3 className="hp-panel-title">IDENTITY</h3>
              {loadingProfile ? (
                <div className="hp-skeleton-row" />
              ) : (
                <div className="hp-identity-body">
                  <div className="hp-identity-row">
                    <img
                      src={getAvatarUrl(user)}
                      alt="avatar"
                      className="hp-avatar-md"
                    />
                    <div className="hp-identity-info">
                      <p className="hp-user-name">{user?.name}</p>
                      <p className="hp-user-role">
                        {user?.role === "guest"
                          ? "Guest"
                          : user?.accountType?.toUpperCase()}
                      </p>
                      {!user?.isVerified && user?.role !== "guest" && (
                        <p className="hp-status-warn">⚠ UNVERIFIED</p>
                      )}
                    </div>
                  </div>
                  <div className="hp-identity-actions">
                    {user?.role === "guest" ? (
                      <Button onClick={() => navigate("/auth")}>LOGIN</Button>
                    ) : (
                      <>
                        <Button onClick={() => navigate("/profile")}>
                          PROFILE
                        </Button>
                        <Button onClick={() => navigate("/auth")}>
                          LOGOUT
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Trending Genres */}
            <div className="hp-card hp-trending-card">
              <h3 className="hp-panel-title">TRENDING</h3>
              <div className="hp-genre-list">
                {trendingGenres.map((g) => (
                  <span key={g} className="hp-genre-tag">
                    #{g}
                  </span>
                ))}
              </div>
            </div>

            {/* Active Discussions */}
            <div className="hp-card hp-discussions-card">
              <h3 className="hp-panel-title">DISCUSSIONS</h3>
              {activeDiscussions.map((d, i) => (
                <div key={i} className="hp-discussion-item">
                  <span className="hp-discussion-arrow">›</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="hp-bottom-row">
          {/* NEWS CARD */}
          <div className="hp-card hp-bottom-card">
            <div className="hp-card-header">
              <h3 className="hp-panel-title">NEWS</h3>
            </div>
            <div className="hp-bottom-news-list">
              {/* latest headlines placeholder from HomeNews data — static preview tiles */}
              <p className="hp-dim-text">Latest gaming headlines</p>
              <a
                href="/news"
                className="hp-view-all"
                style={{ marginTop: "auto" }}
              >
                View all →
              </a>
            </div>
          </div>

          {/* GAMES CARD */}
          <div className="hp-card hp-bottom-card">
            <div className="hp-card-header">
              <h3 className="hp-panel-title">FEATURED GAMES</h3>
            </div>
            <div className="hp-games-mini-list">
              {loadingGames
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="hp-skeleton-row" />
                  ))
                : trendingGames.slice(0, 4).map((game) => (
                    <div
                      key={game.id}
                      className="hp-game-mini-item"
                      onClick={() => navigate(`/games/${game.id}`)}
                    >
                      <span className="hp-game-name">{game.name}</span>
                      <span className="hp-game-meta">⭐ {game.rating}</span>
                    </div>
                  ))}
            </div>
            <div className="hp-bottom-card-footer">
              <a href="/games" className="hp-view-all">
                Browse all →
              </a>
              <div className="hp-toggle-pill" />
            </div>
          </div>

          {/* EXPLORE CARD */}
          <div className="hp-card hp-bottom-card">
            <div className="hp-card-header">
              <h3 className="hp-panel-title">EXPLORE</h3>
              <div className="hp-toggle-switch">
                <div className="hp-toggle-knob" />
              </div>
            </div>
            <div className="hp-explore-links">
              {[
                "Games",
                "Genres",
                "Communities",
                "Dev Labs",
                "Challenges",
                "Leaderboard",
              ].map((item) => (
                <span key={item} className="hp-explore-tag">
                  {item}
                </span>
              ))}
            </div>
            <div className="hp-bottom-card-footer">
              <span className="hp-dim-text">Discover more →</span>
              <div className="hp-big-circle" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
