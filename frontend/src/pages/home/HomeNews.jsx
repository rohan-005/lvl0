import { useEffect, useState } from "react";
import { getNews } from "../../utils/newsApi";
import { getNewsImage } from "../../utils/newsImage";
import "../../css/homeNews.css";

const HomeNewsSkeleton = () => {
  return (
    <div className="home-news-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="news-card skeleton-card">
          <div className="skeleton-img"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      ))}
    </div>
  );
};

const HomeNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews(null, 12).then((data) => {
      setNews(data);
      setLoading(false);
    });
  }, []);

  return (
    <section className="home-news">
      <div className="home-news-header">
        <h2>📰 Gaming & Dev News</h2>
        <a href="/news" className="view-all">
          View all →
        </a>
      </div>

      {loading ? (
        <HomeNewsSkeleton />
      ) : (
        <div className="home-news-grid">
          {news.map((n, i) => (
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
                  {n.title.toLowerCase().includes("unity") && (
                    <span className="tag dev">Unity</span>
                  )}
                  {n.title.toLowerCase().includes("unreal") && (
                    <span className="tag dev">Unreal</span>
                  )}
                </div>

                <h3 className="news-title">{n.title}</h3>

                <p className="news-desc">
                  {n.description || "Read more about this update..."}
                </p>

                <div className="news-meta">
                  <span>{n.source?.name}</span>
                  <span>•</span>
                  <span>
                    {new Date(n.publishedAt).toLocaleDateString()}
                  </span>
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
