import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";

export default function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.body.classList.toggle("light-mode", !isDark);
  }, [isDark]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isDark={isDark} onToggleTheme={() => setIsDark((d) => !d)} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analysis" element={<Analysis />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
