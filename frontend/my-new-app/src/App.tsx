import { Routes, Route } from 'react-router-dom';
import Lobby from './features/Lobby/Lobby';
import WorkBenchComp from './features/WorkBench/WorkBenchComp';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      {/* Wrap WorkBenchComp with a function to pass the initialCode prop */}
      <Route
        path="/codeblock/:id"
        element={<WorkBenchComp initialCode='// Write your solution here' />}
      />
    </Routes>
  );
}

export default App;
