/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { getNews } from "../../utils/newsApi";
import { getNewsImage } from "../../utils/newsImage";
import "../../css/news.css";

const SUGGESTIONS = [
  "Unity",
  "Unreal Engine",
  "Game Development",
  "Indie Games",
  "Esports",
  "Open Source",
  "Programming",
  "AI in Games",
];

const NewsSkeleton = () => (
  <div className="news-grid">
    {Array.from({ length: 6 }).map((_, i) => (
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
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchNews = async (searchQuery = query) => {
    setLoading(true);
    const data = await getNews(searchQuery, 50);
    setArticles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchNews();
      setShowSuggestions(false);
    }
  };

  const shareArticle = (url, type) => {
    if (type === "copy") {
      navigator.clipboard.writeText(url);
      alert("Link copied!");
    }

    if (type === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?url=${url}`,
        "_blank"
      );
    }

    if (type === "whatsapp") {
      window.open(
        `https://wa.me/?text=${url}`,
        "_blank"
      );
    }
  };

  return (
    <div className="news-page">
      <h1>🎮 Gaming & Dev News</h1>

      {/* SEARCH */}
      <div className="news-search">
        <input
          type="text"
          placeholder="Search gaming, dev, engines, communities..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => setShowSuggestions(true)}
        />

        <button onClick={() => fetchNews()}>Search</button>

        {showSuggestions && query.length === 0 && (
          <div className="search-suggestions">
            {SUGGESTIONS.map((s) => (
              <div
                key={s}
                className="suggestion"
                onClick={() => {
                  setQuery(s);
                  fetchNews(s);
                  setShowSuggestions(false);
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONTENT */}
      {loading ? (
        <NewsSkeleton />
      ) : (
        <div className="news-grid">
          {articles.map((n, i) => (
            <div key={i} className="news-card">
              <img
                src={getNewsImage(n.urlToImage)}
                alt=""
                className="news-image"
              />

              <div className="news-content">
                <h3>{n.title}</h3>
                <p>{n.description}</p>

                <div className="news-meta">
                  <span>{n.source?.name}</span>
                  <span>•</span>
                  <span>
                    {new Date(n.publishedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="news-actions">
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noreferrer"
                    className="read-more"
                  >
                    Read →
                  </a>

                  <div className="share-buttons">
                    <button onClick={() => shareArticle(n.url, "copy")}>
                      📋
                    </button>
                    <button onClick={() => shareArticle(n.url, "twitter")}>
                      🐦
                    </button>
                    <button onClick={() => shareArticle(n.url, "whatsapp")}>
                      💬
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;
