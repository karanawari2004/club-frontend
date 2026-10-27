import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "../src/pages/Login";
import Admin from "../src/pages/Admin";
import Report from "../src/pages/Report";
import api from "./api";

function AppRoutes() {
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let isActive = true;

    api.get("/session")
      .then(({ data }) => {
        if (isActive) setUser(data.user);
      })
      .catch(() => {
        if (isActive) setUser(null);
      })
      .finally(() => {
        if (isActive) setIsCheckingSession(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await api.post("/logout");
      setUser(null);
      setAuthError("");
    } catch {
      setAuthError("Unable to sign out. Please try again.");
    }
  }

  if (isCheckingSession) {
    return <div className="auth-loading" role="status">Checking session...</div>;
  }

  return (
    <>
      {authError && <div className="auth-error" role="alert">{authError}</div>}
      <Routes>
        <Route
          path="/"
          element={
            user
              ? <Navigate to="/admin" replace />
              : <Login onLogin={setUser} />
          }
        />

        <Route
          path="/admin"
          element={
            user
              ? <Admin onLogout={handleLogout} />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="/report"
          element={
            user
              ? <Report onLogout={handleLogout} />
              : <Navigate to="/" replace />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}