// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";

import Navbar from "./components/Navbar";
// import Dashboard from "./pages/Dashboard"; // ⬅️ removed
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import PostPage from "./pages/PostPage";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {
  const location = useLocation();
  const { theme } = useThemeStore();
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  // Run once on mount; avoids hook-identity issues in some setups
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While checking auth, show loader
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div data-theme={theme}>
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* Root -> always redirect to posts or login */}
        <Route
          path="/"
          element={<Navigate to={authUser ? "/posts" : "/login"} replace />}
        />

        {/* Auth */}
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/posts" replace />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/posts" replace />} />

        {/* App pages */}
        <Route path="/posts" element={authUser ? <PostPage /> : <Navigate to="/login" replace />} />
        <Route path="/chathome" element={authUser ? <HomePage /> : <Navigate to="/login" replace />} />
        <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
