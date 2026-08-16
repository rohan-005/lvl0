/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Landingcss.css";
import HeroCanvas from "../ui_components/HeroCanvas";
import { fetchGames } from "../utils/gamesApi";
import { getNews } from "../utils/newsApi";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { loginAsGuest } = useAuth();

  const [featuredGames, setFeaturedGames] = useState([]);
  const [newsPreview, setNewsPreview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [gamesRes, newsRes] = await Promise.all([
          fetchGames({ ordering: "-added", page_size: 4 }),
          getNews(null, 3),
        ]);
        setFeaturedGames(gamesRes.data.results || []);
        setNewsPreview(newsRes || []);
      } catch (err) {
        console.error("Landing data load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleGuestAccess = () => {
    loginAsGuest();
    navigate("/home");
  };

  return (
    <div className="landing-page-root">
      
      {/* ════════════════════════════════════════
         1. TOP NAVIGATION HEADER
      ════════════════════════════════════════ */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand" onClick={() => navigate("/")}>
            <span className="brand-logo-text">lvl<span className="brand-underscore">_</span>0</span>
            <span className="brand-tag">PLATFORM</span>
          </div>

          <div className="landing-nav-links">
            <button className="nav-link-item" onClick={() => { handleGuestAccess(); navigate("/games"); }}>
              Games
            </button>
            <button className="nav-link-item" onClick={() => { handleGuestAccess(); navigate("/news"); }}>
              News
            </button>
            <button className="nav-link-item" onClick={() => { handleGuestAccess(); navigate("/communities"); }}>
              Communities
            </button>
          </div>

          <div className="landing-nav-actions">
            <button className="sharp-button nav-btn-guest" onClick={handleGuestAccess}>
              GUEST MODE
            </button>
            <button className="sharp-button nav-btn-login" onClick={() => navigate("/auth")}>
              LOGIN
            </button>
            <button className="sharp-button nav-btn-register" onClick={() => navigate("/auth")}>
              REGISTER
            </button>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════
         2. FULL-SCREEN HERO SECTION (100vw, 100vh)
      ════════════════════════════════════════ */}
      <header className="landing-hero-fullwidth">
        <HeroCanvas />

        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <span className="badge-pulse-dot" />
            <span>GAMING & DEV ECOSYSTEM</span>
          </div>

          <h1 className="landing-hero-title">
            The Operating System <br />
            for Gamers & Developers
          </h1>

          <p className="landing-hero-sub">
            Discover games, curated news, and real-time community channels — all unified in one sharp editorial platform.
          </p>

          <div className="landing-hero-ctas">
            <button className="sharp-button hero-cta-main" onClick={() => navigate("/games")}>
              EXPLORE GAMES
            </button>
            <button className="sharp-button hero-cta-sec" onClick={() => navigate("/news")}>
              READ NEWS
            </button>
          </div>

          {/* Stats Bar */}
          <div className="landing-hero-stats-bar">
            <div className="landing-stat">
              <span className="stat-num">500K+</span>
              <span className="stat-label">Games Indexed</span>
            </div>
            <div className="stat-sep" />
            <div className="landing-stat">
              <span className="stat-num">24/7</span>
              <span className="stat-label">Live Gaming Feed</span>
            </div>
            <div className="stat-sep" />
            <div className="landing-stat">
              <span className="stat-num">REAL-TIME</span>
              <span className="stat-label">Community Hubs</span>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════
         3. PRODUCT IDENTITY & FEATURE PILLARS
      ════════════════════════════════════════ */}
      <section className="landing-fullwidth-section sec-cream">
        <div className="landing-section-container">
          <div className="section-title-block">
            <span className="section-kicker">CORE PLATFORM</span>
            <h2 className="section-heading">BUILT FOR PLAYERS & CREATORS</h2>
          </div>

          <div className="pillars-grid">
            <div className="sharp-card pillar-card">
              <div className="pillar-num">01</div>
              <h3 className="pillar-title">GAME DISCOVERY</h3>
              <p className="pillar-desc">
                Browse through over 500,000 titles with smart genre filters, ratings, screenshots, and system metadata.
              </p>
              <button className="pillar-link" onClick={() => navigate("/games")}>Explore Database →</button>
            </div>

            <div className="sharp-card pillar-card">
              <div className="pillar-num">02</div>
              <h3 className="pillar-title">CURATED NEWS</h3>
              <p className="pillar-desc">
                Stay updated with clean, signal-over-noise coverage spanning game releases, dev logs, esports, and indie news.
              </p>
              <button className="pillar-link" onClick={() => navigate("/news")}>Read Headlines →</button>
            </div>

            <div className="sharp-card pillar-card">
              <div className="pillar-num">03</div>
              <h3 className="pillar-title">LIVE COMMUNITIES</h3>
              <p className="pillar-desc">
                Connect directly with fellow gamers and indie developers across category-specific chat channels.
              </p>
              <button className="pillar-link" onClick={() => navigate("/communities")}>Join Chat Rooms →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
         4. FEATURED GAMES DISCOVERY PREVIEW
      ════════════════════════════════════════ */}
      <section className="landing-fullwidth-section sec-parchment">
        <div className="landing-section-container">
          <div className="section-header-flex">
            <div>
              <span className="section-kicker">DATABASE PREVIEW</span>
              <h2 className="section-heading">TRENDING TITLES</h2>
            </div>
            <button className="sharp-button btn-outline-sm" onClick={() => navigate("/games")}>
              VIEW ALL GAMES →
            </button>
          </div>

          <div className="landing-games-grid">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="sharp-card game-skeleton-box" />
              ))
            ) : (
              featuredGames.map((game) => (
                <div
                  key={game.id}
                  className="sharp-card landing-game-card"
                  onClick={() => navigate(`/games/${game.id}`)}
                >
                  <div className="game-img-holder">
                    {game.background_image ? (
                      <img src={game.background_image} alt={game.name} />
                    ) : (
                      <div className="no-img">NO COVER ART</div>
                    )}
                    <span className="game-rating-tag">★ {game.rating?.toFixed(1) || "N/A"}</span>
                  </div>
                  <div className="game-card-details">
                    <h4>{game.name}</h4>
                    <div className="game-card-sub flex-justify">
                      <span>{game.released || "TBA"}</span>
                      <span className="accent-text">{game.genres?.[0]?.name || "Game"}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
         5. NEWS & COMMUNITY DUAL PREVIEW
      ════════════════════════════════════════ */}
      <section className="landing-fullwidth-section sec-cream">
        <div className="landing-section-container">
          <div className="dual-preview-grid">
            
            {/* News Column */}
            <div className="sharp-card dual-preview-card">
              <div className="card-top-bar">
                <span className="card-kicker">EDITORIAL</span>
                <h3>LATEST GAMING HEADLINES</h3>
              </div>
              <div className="news-preview-list">
                {newsPreview.map((n, i) => (
                  <a key={i} href={n.url} target="_blank" rel="noreferrer" className="news-preview-row">
                    <span className="news-bullet-icon">▪</span>
                    <div className="news-row-text">
                      <span className="news-row-title">{n.title}</span>
                      <span className="news-row-src">{n.source?.name || "Gaming News"}</span>
                    </div>
                  </a>
                ))}
              </div>
              <div className="card-bottom-bar">
                <button className="pillar-link" onClick={() => navigate("/news")}>Full News Feed →</button>
              </div>
            </div>

            {/* Community Column */}
            <div className="sharp-card dual-preview-card">
              <div className="card-top-bar">
                <span className="card-kicker">DISCUSSIONS</span>
                <h3>ACTIVE COMMUNITIES</h3>
              </div>
              <div className="comm-preview-list">
                <div className="comm-row" onClick={() => navigate("/communities")}>
                  <span className="comm-hash">#</span>
                  <div className="comm-text">
                    <span className="comm-title">rpg-lounge</span>
                    <span className="comm-sub">Discuss builds, lore & strategies</span>
                  </div>
                  <span className="comm-tag">🎮 Gamer</span>
                </div>
                <div className="comm-row" onClick={() => navigate("/communities")}>
                  <span className="comm-hash">#</span>
                  <div className="comm-text">
                    <span className="comm-title">indie-devs</span>
                    <span className="comm-sub">Showcase progress & seek dev feedback</span>
                  </div>
                  <span className="comm-tag">💻 Dev</span>
                </div>
                <div className="comm-row" onClick={() => navigate("/communities")}>
                  <span className="comm-hash">#</span>
                  <div className="comm-text">
                    <span className="comm-title">fps-competitive</span>
                    <span className="comm-sub">Tournament discussion & squad calls</span>
                  </div>
                  <span className="comm-tag">🎮 Gamer</span>
                </div>
              </div>
              <div className="card-bottom-bar">
                <button className="pillar-link" onClick={() => navigate("/communities")}>Explore Chat Rooms →</button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
         6. LOGIN / REGISTER CALLOUT BANNER
      ════════════════════════════════════════ */}
      <section className="landing-fullwidth-section sec-dark-banner">
        <div className="landing-section-container">
          <div className="banner-content">
            <div className="banner-text">
              <span className="banner-kicker">STEP UP TO LVL_0</span>
              <h2>READY TO JOIN THE PLATFORM?</h2>
              <p>
                Create your account in seconds to save game collections, participate in dev chat rooms, and unlock full community features.
              </p>
            </div>
            <div className="banner-ctas">
              <button className="sharp-button banner-btn-main" onClick={() => navigate("/auth")}>
                GET STARTED NOW
              </button>
              <button className="sharp-button banner-btn-sec" onClick={() => navigate("/auth")}>
                SIGN IN
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
         7. FOOTER
      ════════════════════════════════════════ */}
      <footer className="landing-footer">
        <div className="landing-section-container footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">lvl<span className="brand-underscore">_</span>0</span>
            <p className="footer-tagline">The Operating System for Gamers & Developers</p>
          </div>
          <div className="footer-links">
            <a href="/games">Games</a>
            <a href="/news">News</a>
            <a href="/communities">Communities</a>
            <a href="/auth">Account</a>
          </div>
        </div>
        <div className="footer-copy">
          © {new Date().getFullYear()} lvl_0 Platform. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default Landing;