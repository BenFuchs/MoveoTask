import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../stylesheets/General.module.css'

const Lobby = () => {
  const codeBlocks = [
    { id: 'Async%2FAwait%20Example', title: 'Async/Await Example' },
    { id: 'For%20Loop%20Example', title: 'For Loop Example' },
    { id: 'Simple%20Function', title: 'Simple Function Example' },
    { id: 'Promise%20Handling%20Example', title: 'Promise Handling Example' },
  ];

  return (
    <div className={styles.lobbyContainer}>
      <h1 className={styles.title}>Choose a Code Block</h1>
      <div className={styles.cardsContainer}>
        {codeBlocks.map((block) => (
          <div key={block.id} className={styles.card}>
            <h2 className={styles.cardTitle}>{block.title}</h2>
            <Link
              to={`/codeblock/${block.id}`}
              className={styles.linkButton}
            >
              Open
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lobby;
