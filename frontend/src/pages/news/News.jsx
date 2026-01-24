/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { getNews } from "../../utils/newsApi";
import "../../css/news.css";

const News = () => {
  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState("gaming");
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    const data = await getNews(query, 30);
    setArticles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="news-page">
      <h1>🎮 Gaming Industry News</h1>

      <div className="news-search">
        <input
          type="text"
          placeholder="Search gaming news..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={fetchNews}>Search</button>
      </div>

      {loading ? (
        <p className="loading">Loading news...</p>
      ) : (
        <div className="news-grid">
          {articles.map((n, i) => (
            <a
              key={i}
              href={n.url}
              target="_blank"
              rel="noreferrer"
              className="news-card"
            >
              {n.urlToImage && <img src={n.urlToImage} alt="" />}
              <h3>{n.title}</h3>
              <p>{n.description}</p>
              <span>{new Date(n.publishedAt).toDateString()}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;
