import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import "../../css/auth.css";

export default function AuthPage() {
  const [mode, setMode] = useState("login");

  return (
    <div className="auth-root">
      <div className={`auth-container ${mode === "register" ? "right-panel-active" : ""}`}>
        
        <Register />
        <Login />

        {/* OVERLAY */}
        <div className="overlay-container">
          <div className="overlay">
            
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back</h1>
              <p>Login to continue your journey</p>
              <button className="ghost" onClick={() => setMode("login")}>
                Login
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Hello Gamer</h1>
              <p>Create your lvl0 identity</p>
              <button className="ghost" onClick={() => setMode("register")}>
                Register
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
