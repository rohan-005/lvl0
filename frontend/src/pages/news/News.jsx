/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import { getNews } from "../../utils/newsApi";
import { getNewsImage } from "../../utils/newsImage";
import StaggeredMenu from "../../ui_components/StaggeredMenu";
import "../../css/news.css";

/* =====================
   NAVBAR CONFIG
   ===================== */
const menuItems = [
  { label: "Home", ariaLabel: "Go to home page", link: "/home" },
  { label: "News", ariaLabel: "Learn about us", link: "/news" },
  { label: "Communities", ariaLabel: "View our services", link: "/services" },
  { label: "Games Data", ariaLabel: "Get in touch", link: "/contact" },
  { label: "Profile", ariaLabel: "Get in touch", link: "/profile" },
];

const socialItems = [
  { label: "Twitter", link: "https://twitter.com" },
  { label: "GitHub", link: "https://github.com" },
  { label: "LinkedIn", link: "https://linkedin.com" },
];

/* =====================
   QUICK FILTER TAGS
   ===================== */
const QUICK_TAGS = [
  "All",
  "RPG",
  "FPS",
  "Indie",
  "Unreal Engine 5",
  "Esports",
  "Nintendo",
  "PlayStation",
  "Xbox",
  "VR",
  "Tech",
];

const NewsSkeleton = () => (
  <div className="news-grid">
    {Array.from({ length: 50 }).map((_, i) => (
      <div key={i} className="news-card skeleton-card">
        <div className="skeleton-img"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
      </div>
    ))}
  </div>
);

const News = () => {
  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const [savedIds, setSavedIds] = useState(() => {
    const saved = localStorage.getItem("gamingNews_saved");
    return saved ? JSON.parse(saved) : [];
  });

  /* =====================
     FETCH NEWS
     ===================== */
  const fetchNews = async (searchQuery = "Gaming") => {
    setLoading(true);
    try {
      const data = await getNews(searchQuery, 30);
      setArticles(data || []);
    } catch (err) {
      console.error("Failed to fetch news", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  /* =====================
     FILTERED ARTICLES
     ===================== */
  const displayedArticles = useMemo(() => {
    if (showSavedOnly) {
      return articles.filter((a) => savedIds.includes(a.url));
    }
    return articles;
  }, [articles, savedIds, showSavedOnly]);

  /* =====================
     ACTION HANDLERS
     ===================== */
  const handleTagClick = (tag) => {
    setActiveTag(tag);
    setShowSavedOnly(false);
    if (tag === "All") {
      fetchNews("Gaming");
      setQuery("");
    } else {
      fetchNews(tag);
      setQuery(tag);
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    setActiveTag("Custom");
    fetchNews(query);
  };

  const toggleSave = (url) => {
    const updated = savedIds.includes(url)
      ? savedIds.filter((id) => id !== url)
      : [...savedIds, url];

    setSavedIds(updated);
    localStorage.setItem("gamingNews_saved", JSON.stringify(updated));
  };

  const shareArticle = (url, type) => {
    if (type === "copy") {
      navigator.clipboard.writeText(url);
      alert("Link copied!");
    } else if (type === "twitter") {
      window.open(`https://twitter.com/intent/tweet?url=${url}`, "_blank");
    }
  };

  return (
    <>
      {/* =====================
          NEWS PAGE CONTENT
         ===================== */}
      <div className="news-page">
        <div className="navbar-wrapper text-[1.5rem]">
          <StaggeredMenu items={menuItems} socialItems={socialItems} />
        </div>
        <div className="news-header">
          <div className="lvl0-logo">
            lvl<span className="underscore">_</span>0
          </div>

          <div className="view-controls">
            <button
              className={`control-btn ${showSavedOnly ? "active" : ""}`}
              onClick={() => setShowSavedOnly(!showSavedOnly)}
            >
              ♥ Saved ({savedIds.length})
            </button>

            <div className="divider"></div>

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
              type="text"
              placeholder="Search the metaverse..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch}>🔍</button>
          </div>

          <div className="tags-scroller">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                className={`tag-chip ${activeTag === tag ? "active" : ""}`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <NewsSkeleton />
        ) : (
          <div
            className={`news-grid ${viewMode === "list" ? "list-view" : ""}`}
          >
            {displayedArticles.map((n, i) => {
              const isSaved = savedIds.includes(n.url);
              return (
                <div key={i} className="news-card">
                  <div className="card-image-wrapper">
                    <img
                      src={getNewsImage(n.urlToImage)}
                      alt={n.title}
                      className="news-image"
                    />
                  </div>

                  <div className="news-content">
                    <div className="news-header-row">
                      <span className="news-date">
                        {new Date(n.publishedAt).toLocaleDateString()}
                      </span>
                      <button
                        className={`save-btn ${isSaved ? "saved" : ""}`}
                        onClick={() => toggleSave(n.url)}
                      >
                        {isSaved ? "♥" : "♡"}
                      </button>
                    </div>

                    <h3>{n.title}</h3>
                    {viewMode === "list" && <p>{n.description}</p>}

                    <div className="news-actions">
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noreferrer"
                        className="read-btn"
                      >
                        Read
                      </a>

                      <div className="share-row">
                        <button onClick={() => shareArticle(n.url, "copy")}>
                          🔗
                        </button>
                        <button onClick={() => shareArticle(n.url, "twitter")}>
                          🐦
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default News;
