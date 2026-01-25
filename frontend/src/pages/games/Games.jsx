import { useEffect, useState } from "react";
import { fetchGames } from "../../utils/gamesApi";

const Games = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchGames({ page_size: 20 })
      .then(res => setGames(res.data.results))
      .catch(console.error);
  }, []);

  return (
    <div className="games-page">
      <h2>Games Library</h2>

      <div className="games-grid">
        {games.map(game => (
          <div key={game.id} className="game-card">
            <img src={game.background_image} alt={game.name} />
            <h4>{game.name}</h4>
            <p>⭐ {game.rating}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Games;
