import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/home.css";
import Button from "../../ui_components/Button";


const Home = () => {
  /* =====================
     STATE
     ===================== */
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const navigate = useNavigate();

  const guestUser = {
    name: "Guest",
    role: "guest",
    email: null,
    accountType: null,
    isVerified: false,
  };

  /* =====================
     MOCK DATA
     ===================== */
  const exploreLinks = [
    "Games",
    "Genres",
    "Communities",
    "Dev Labs",
    "Challenges",
    "Leaderboard",
  ];

  const newsFeed = [
    {
      id: 1,
      title: "Cyberpunk 2 Pre-Production",
      desc: "CDPR confirms Unreal Engine 5 pipeline.",
      tag: "NEWS",
    },
    {
      id: 2,
      title: "Indie Gems 2026",
      desc: "Small studios redefining creativity.",
      tag: "INDIE",
    },
    {
      id: 3,
      title: "RTX 6090 Review",
      desc: "Performance leap or marketing hype?",
      tag: "TECH",
    },
  ];

  const featuredGames = [
    { id: 1, name: "Echoes of Eleria", genre: "Adventure" },
    { id: 2, name: "Fractured Realms", genre: "RPG" },
  ];

  const trendingGenres = ["RPG", "FPS", "INDIE", "SIM", "HORROR"];
  const activeDiscussions = [
    "Best Soulslike combat?",
    "Unity vs Unreal 2026",
    "AI-driven NPC behavior",
  ];

  const getAvatarUrl = (user) => {
    const seed = user?.email || user?.name || "guest";
    let style = "identicon";

    if (user?.accountType === "developer") style = "bottts-neutral";
    else if (user?.accountType === "gamer") style = "pixel-art";

    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
  };

  /* =====================
     AUTH
     ===================== */
  useEffect(() => {
    const fetchProfile = async () => {
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

    fetchProfile();
  }, []);

  /* =====================
     UI
     ===================== */
  return (
    <div className="dashboard-root">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="lvl0-logo">
          lvl<span className="underscore">_</span>0
        </div>

        {/* MOBILE AVATAR */}
        {!loadingProfile && (
          <img
            src={user.avatar}
            alt="avatar"
            className="mobile-header-avatar"
            onClick={() => setShowMobileProfile(true)}
          />
        )}
      </header>

      {/* MOBILE PROFILE MODAL */}
      {showMobileProfile && (
        <div className="mobile-profile-modal">
          <div
            className="modal-backdrop"
            onClick={() => setShowMobileProfile(false)}
          />

          <div className="modal-card">
            <button
              className="modal-close"
              onClick={() => setShowMobileProfile(false)}
            >
              ✕
            </button>

            <div className="glass-panel modal-profile-card">
              <h3 className="panel-title">IDENTITY</h3>

              <div className="profile-content">
                <img
                  src={getAvatarUrl(user)}
                  alt="User Avatar"
                  className="avatar-img"
                />

                <p className="user-name">{user.name}</p>

                {user.role === "guest" ? (
                  <button className="btn primary small">INIT_LOGIN</button>
                ) : (
                  <>
                    <p className="user-role">
                      class: {user.accountType === "developer" ? "DEVELOPER" : "GAMER"}
                    </p>

                    {!user.isVerified && (
                      <p className="status-warning">⚠ UNVERIFIED</p>
                    )}

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
          </div>
        </div>
      )}
      <div className="dashboard-layout">
        {/* LEFT SIDEBAR (DESKTOP ONLY) */}
        <aside className="sidebar left-sidebar">
          <div className="glass-panel">
            <h3 className="panel-title">IDENTITY</h3>

            {loadingProfile ? (
              <p className="dim-text">Loading data...</p>
            ) : (
              <div className="profile-content">
                <img
                  src={getAvatarUrl(user)}
                  alt="User Avatar"
                  className="avatar-img"
                />

                <p className="user-name">{user.name}</p>

                {user.role === "guest" ? (
                  <button className="btn primary small">INIT_LOGIN</button>
                ) : (
                  <>
                    <p className="user-role">
                      class:{" "}
                      {user.accountType === "developer"
                        ? "DEVELOPER"
                        : "GAMER"}
                    </p>

                    {!user.isVerified && (
                      <p className="status-warning">⚠ UNVERIFIED</p>
                    )}

                    <Button onClick={() => navigate("/profile")}>
                      PROFILE
                    </Button>
                    <Button onClick={() => navigate("/auth")}>
                      LOGOUT
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="glass-panel">
            <h3 className="panel-title">EXPLORE</h3>
            {exploreLinks.map((item, i) => (
              <div key={i} className="nav-item">
                {item}
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN FEED */}
        <main className="main-feed">
          <div className="section-header">
            <h2 className="section-title">NEWS_FEED</h2>
            <div className="divider"></div>
          </div>

          {newsFeed.map((news) => (
            <div key={news.id} className="glass-panel news-card">
              <div className="news-header">
                <h3>{news.title}</h3>
                <span className="tag">{news.tag}</span>
              </div>

              <p className="dim-text">{news.desc}</p>
            </div>
          ))}

          <div className="section-header" style={{ marginTop: "32px" }}>
            <h2 className="section-title">FEATURED_GAMES</h2>
            <div className="divider"></div>
          </div>

          <div className="games-grid">
            {featuredGames.map((game) => (
              <div key={game.id} className="glass-panel game-card">
                <h4>{game.name}</h4>
                <p className="dim-text genre">{game.genre}</p>
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT SIDEBAR (DESKTOP ONLY) */}
        <aside className="sidebar right-sidebar">
          <div className="glass-panel">
            <h3 className="panel-title">TRENDING</h3>
            {trendingGenres.map((g, i) => (
              <p key={i} className="list-link">
                #{g}
              </p>
            ))}
          </div>

          <div className="glass-panel">
            <h3 className="panel-title">DISCUSSIONS</h3>
            {activeDiscussions.map((d, i) => (
              <div key={i} className="discussion-item">
                <span className="arrow">{">"}</span> {d}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
