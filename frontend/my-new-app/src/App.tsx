import  { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa'; 
import Lobby from './features/Lobby/Lobby';
import WorkBenchComp from './features/WorkBench/WorkBenchComp';
import './App.css'; 

function App() {
  const [theme, setTheme] = useState('light'); 
  const location = useLocation();

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const isWorkbenchPage = location.pathname.startsWith('/codeblock'); 

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
          element={<WorkBenchComp initialCode="// Write your solution here" />}
        />
      </Routes>
    </div>
  );
}

export default App;
