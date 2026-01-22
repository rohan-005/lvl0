import { useEffect, useState } from "react";
import "../../css/home.css";

const Home = () => {
  /* =====================
     STATE
     ===================== */
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  /* =====================
     GUEST USER
     ===================== */
  const guestUser = {
    name: "Guest",
    role: "guest",
    email: null,
    accountType: null,
    isVerified: false,
  };

  /* =====================
     STATIC CONTENT
     ===================== */
  const exploreLinks = [
    "Games",
    "Communities",
    "Dev Labs",
    "Challenges",
    "Leaderboard",
  ];

  /* =====================
     FETCH PROFILE
     ===================== */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUser(guestUser);
          return;
        }

        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          setUser(guestUser);
          return;
        }

        const data = await res.json();

        setUser({
          name: data.name,
          email: data.email,
          role: data.role,
          accountType: data.accountType,
          isVerified: data.isVerified,
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
        setUser(guestUser);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  /* =====================
     UI
     ===================== */
  return (
    <div className="home">
      <div className="home-layout">

        {/* LEFT SIDEBAR */}
        <aside className="sidebar left">
          <div className="card logo-card">lvl_0</div>

          {/* PROFILE */}
          <div className="card">
            <h4>Profile</h4>

            {loadingProfile ? (
              <p className="dim">Loading...</p>
            ) : (
              <>
                <p className="username">{user.name}</p>

                {user.role === "guest" ? (
                  <p className="dim">Login to unlock features</p>
                ) : (
                  <>
                    <p className="dim">{user.email}</p>

                    {user.accountType && (
                      <p className="dim">
                        {user.accountType === "developer"
                          ? "🛠 Developer"
                          : "🎮 Gamer"}
                      </p>
                    )}

                    {!user.isVerified && (
                      <p className="warning">Email not verified</p>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* EXPLORE */}
          <div className="card">
            <h4>Explore</h4>
            {exploreLinks.map((item, i) => (
              <p key={i} className="link-item">{item}</p>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Home;
