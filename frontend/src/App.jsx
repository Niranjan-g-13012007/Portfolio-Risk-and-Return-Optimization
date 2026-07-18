import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Compare from "./pages/Compare";

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
          <Route path="/"        element={<Home />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/compare"  element={<Compare />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/signup"  element={<Signup />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
