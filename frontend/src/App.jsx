import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

import Landing from "./pages/Landing";
import AuthPage from "./pages/auth/AuthPage";
import OTPVerification from "./pages/auth/OTPVerification";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import News from "./pages/news/News";
import Games from "./pages/games/Games";
import GameDetails from "./pages/games/GamesDetails";

import Communities from "./pages/communities/Communities";

import MainLayout from "./pages/MainLayout";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#111F35",
                color: "#F63049",
                border: "1px solid #F63049",
              },
            }}
          />

          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify-email" element={<OTPVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* PROTECTED / MAIN LAYOUT */}
            <Route element={<MainLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/news" element={<News />} />
              <Route path="/games" element={<Games />} />
              <Route path="/games/:id" element={<GameDetails />} />
              {/* NEW COMMUNITIES ROUTE */}
              <Route path="/services" element={<Communities />} />
            </Route>
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;