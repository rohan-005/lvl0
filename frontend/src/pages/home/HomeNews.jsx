import { useEffect, useState } from "react";
import { getNews } from "../../utils/newsApi";
import { getNewsImage } from "../../utils/newsImage";
import "../../css/homeNews.css";

const HomeNewsSkeleton = () => (
  <div className="home-news-grid">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="news-card skeleton-card">
        <div className="skeleton-img" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    ))}
  </div>
);

/**
 * @param {string|null} filter   — keyword to filter articles (e.g. "Gaming", "Dev")
 * @param {Function}    onHeadlines — callback to push raw article list up to parent
 */
const HomeNews = ({ filter = null, onHeadlines }) => {
  const [news,    setNews]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNews(filter, 20).then((data) => {
      setNews(data);
      setLoading(false);
      if (onHeadlines) onHeadlines(data);
    });
  }, [filter]);

  /* Client-side keyword filter for finer cuts */
  const displayed = filter && filter !== "All"
    ? news.filter(n =>
        n.title?.toLowerCase().includes(filter.toLowerCase()) ||
        n.description?.toLowerCase().includes(filter.toLowerCase())
      ).concat(news.filter(n =>
        !n.title?.toLowerCase().includes(filter.toLowerCase()) &&
        !n.description?.toLowerCase().includes(filter.toLowerCase())
      )).slice(0, 12)   // show filtered first, then rest to fill grid
    : news.slice(0, 12);

  return (
    <section className="home-news">
      {loading ? (
        <HomeNewsSkeleton />
      ) : (
        <div className="home-news-grid">
          {displayed.map((n, i) => (
            <a
              key={i}
              href={n.url}
              target="_blank"
              rel="noreferrer"
              className="news-card"
            >
              <img
                src={getNewsImage(n.urlToImage)}
                alt=""
                className="news-image"
              />
              <div className="news-content">
                <div className="news-tags">
                  <span className="tag">Gaming</span>
                  {n.title?.toLowerCase().includes("unity")  && <span className="tag dev">Unity</span>}
                  {n.title?.toLowerCase().includes("unreal") && <span className="tag dev">Unreal</span>}
                  {n.title?.toLowerCase().includes("indie")  && <span className="tag dev">Indie</span>}
                  {n.title?.toLowerCase().includes("esport") && <span className="tag dev">Esports</span>}
                </div>
                <h3 className="news-title">{n.title}</h3>
                <p  className="news-desc">{n.description || "Read more about this update..."}</p>
                <div className="news-meta">
                  <span>{n.source?.name}</span>
                  <span>•</span>
                  <span>{new Date(n.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};

export default HomeNews;
