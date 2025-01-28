import { Link } from 'react-router-dom';
import styles from '../../stylesheets/General.module.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Titles {
  id: string;
  title: string;
}

const Lobby = () => {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const [titles, settitles] = useState<Titles[]>([]);
  const [codeBlocks, setCodeBlocks] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    const fetchCodeBlocks = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}api/codeblocks`);
        const fetchedTitles = response.data;
        settitles(fetchedTitles);        // Process the fetched titles into codeBlocks
        const processedBlocks = processTitles(fetchedTitles);
        setCodeBlocks(processedBlocks);
      } catch (error) {
        console.error('Error fetching code blocks:', error);
      }
    };
    fetchCodeBlocks();
  }, [SERVER_URL]);

  console.log(titles);

    // Function to process titles into codeBlocks
    const processTitles = (titles: Titles[]) => {
      return titles.map((item) => ({
        id: encodeURIComponent(item.title), // Replaces spaces and special characters with URL-safe strings
        title: item.title,
      }));
    };

  return (
    <div className={styles.lobbyContainer}>
      <h1 className={styles.title}>Choose a Code Block</h1>
      <div className={styles.cardsContainer}>
        {codeBlocks.map((block) => (
          <div key={block.id} className={styles.card}>
            <h2 className={styles.cardTitle}>{block.title}</h2>
            <div className={styles.buttonContainer}>
              <Link
                to={`/codeblock/${block.id}`}
                className={styles.linkButton}
              >
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lobby;
