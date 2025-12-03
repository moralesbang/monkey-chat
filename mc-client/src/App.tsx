import { Routes, Route } from "react-router-dom";
import Scenarios from "@/pages/Scenarios";
import Session from "@/pages/Session";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Scenarios />} />
      <Route path="/session/:scenarioId" element={<Session />} />
    </Routes>
  );
}

export default App;
