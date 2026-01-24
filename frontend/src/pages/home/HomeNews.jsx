import { useEffect, useState } from "react";
import { getNews } from "../../utils/newsApi";

const HomeNews = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    getNews("gaming", 20).then(setNews);
  }, []);

  return (
    <div className="home-news">
      <h2>📰 Latest Gaming News</h2>

      <ul>
        {news.map((n, i) => (
          <li key={i}>
            <a href={n.url} target="_blank" rel="noreferrer">
              {n.title}
            </a>
          </li>
        ))}
        
      </ul>
    </div>
  );
};

export default HomeNews;
