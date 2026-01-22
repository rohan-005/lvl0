import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import "../../css/auth.css";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="auth-root">
      <div
        className={`auth-container ${isRegister ? "right-panel-active" : ""}`}
      >
        {/* LOGIN FORM */}
        <div className="form-container sign-in-container">
          <Login onSwitch={() => setIsRegister(true)} />
        </div>

        {/* REGISTER FORM */}
        <div className="form-container sign-up-container">
          <Register onSwitch={() => setIsRegister(false)} />
        </div>

        {/* OVERLAY (DESKTOP ONLY) */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back</h1>
              <p>Login to continue your lvl0 journey</p>
              <button
                type="button"
                className="ghost"
                onClick={() => setIsRegister(false)}
              >
                Login
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Hello Gamer</h1>
              <p>Create your lvl0 identity</p>
              <button
                type="button"
                className="ghost"
                onClick={() => setIsRegister(true)}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
