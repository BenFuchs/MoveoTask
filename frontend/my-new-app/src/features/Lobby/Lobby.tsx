import React from 'react';
import { Link } from 'react-router-dom';

const Lobby = () => {
  const codeBlocks = [
    { id: 'Async%2FAwait%20Example', title: 'Async/Await Example' },
    { id: 'For%20Loop%20Example', title: 'For Loop Example' },
    { id: 'Simple%20Function', title: 'Simple Function Example' },
    { id: 'Promise%20Handling%20Example', title: 'Promise Handling Example' },
  ];

  return (
    <div className="lobby-container">
      <h1 className="text-2xl font-bold text-center my-6">Choose a Code Block</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {codeBlocks.map((block) => (
          <div
            key={block.id}
            className="card bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow"
          >
            <h2 className="text-lg font-semibold mb-4">{block.title}</h2>
            <Link
              to={`/codeblock/${block.id}`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
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
