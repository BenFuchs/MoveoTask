import  { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa'; 
import Lobby from './features/Lobby/Lobby';
import WorkBenchComp from './features/WorkBench/WorkBenchComp';
import './App.css'; 
import axios from 'axios';

const App=()=> {
  const [theme, setTheme] = useState('light'); 
  const location = useLocation();
  // const SERVER_URL = process.env.REACT_APP_SERVER_URL;

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const isWorkbenchPage = location.pathname.startsWith('/codeblock'); 


  const pingServer = () => {
    const serverUrl = `https://moveo-codelingo-backend.onrender.com/ping`;
  
    axios.get(serverUrl)
      .then(response => {
        console.log('Ping successful:', response.data);
      })
      .catch(error => {
        console.error('Ping failed:', error.message);
      });
  };
  
  setInterval(pingServer, 10 * 60 * 1000);

  return (
    <div>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? <FaSun /> : <FaMoon />} 
      </button>

      {isWorkbenchPage && (
        <Link to="/" className="back-to-lobby">
          Back to Lobby
        </Link>
      )}

      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route
          path="/codeblock/:id"
          element={<WorkBenchComp initialCode="// Write your solution here" theme={theme} />}
        />
      </Routes>
    </div>
  );
}

export default App;
