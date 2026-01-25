import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  fetchGameDetails,
  fetchGameScreenshots,
  fetchGameStores
} from "../../utils/gamesApi";

const GameDetails = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    fetchGameDetails(id).then(res => setGame(res.data));
    fetchGameStores(id).then(res => setStores(res.data.results));
  }, [id]);

  if (!game) return null;

  return (
    <div className="game-details">
      <h1>{game.name}</h1>
      <p dangerouslySetInnerHTML={{ __html: game.description }} />

      <h3>Platforms</h3>
      {game.platforms.map(p => p.platform.name).join(", ")}

      <h3>Available On</h3>
      {stores.map(s => (
        <a key={s.id} href={`https://${s.store.domain}`} target="_blank">
          {s.store.name}
        </a>
      ))}
    </div>
  );
};

export default GameDetails;
