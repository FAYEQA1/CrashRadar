import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import HomePage from "./pages/HomePage";
import MonitorPage from "./pages/MonitorPage";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/monitor" element={<MonitorPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/history" element={<HistoryPage />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;