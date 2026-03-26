import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "./Button";


/* ================= ICONS ================= */
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const NewsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a4 4 0 0 1-4 4z" />
    <line x1="10" y1="7" x2="18" y2="7" />
    <line x1="10" y1="11" x2="18" y2="11" />
    <line x1="10" y1="15" x2="14" y2="15" />
  </svg>
);

const GamesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M8 12h8M12 8v8" />
  </svg>
);

const CommunityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/* ================= NAV ITEMS ================= */
const navItems = [
  { icon: HomeIcon, label: "Home", link: "/home" },
  { icon: NewsIcon, label: "News", link: "/news" },
  { icon: GamesIcon, label: "Games", link: "/games" },
  { icon: CommunityIcon, label: "Communities", link: "/services" },
  { icon: ProfileIcon, label: "Profile", link: "/profile" },
];

/* ================= COMPONENT ================= */
const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <aside
      className={`hp-sidebar ${open ? "open" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* LOGO */}
      <div className="hp-sidebar-toggle">
        <span className="hp-logo-text">
          lvl<span className="hp-underscore">_</span>0
        </span>
        <span className="hp-chevron">
          <ChevronIcon />
        </span>
      </div>

      {/* NAV */}
      <nav className="hp-nav">
        {navItems.map(({ icon: Icon, label, link }) => (
          <button
            key={label}
            className={`hp-nav-item ${
              location.pathname === link ? "active" : ""
            }`}
            onClick={() => navigate(link)}
            title={label}
          >
            <span className="hp-nav-icon">
              <Icon />
            </span>
            <span className="hp-nav-label">{label}</span>
          </button>
        ))}
      </nav>

      {/* USER + LOGOUT */}
      <div className="hp-sidebar-bottom">
        {/* {!loadingProfile && user && ( */}
          <>
            {/* PROFILE */}
            {/* <button
              className="hp-avatar-btn"
              onClick={() => navigate("/profile")}
              title="Profile"
            >
              <img
                src={getAvatarUrl(user)}
                alt="avatar"
                className="hp-avatar-sm"
              />
              <span className="hp-nav-label">{user?.name}</span>
            </button> */}

            {/* LOGOUT */}
            {/* {user.role !== "guest" && ( */}
              <div className="hp-logout">
                <Button onClick={handleLogout}>LOGOUT</Button>
              </div>
            {/* )} */}
          </>
        {/* )} */}
      </div>
    </aside>
  );
};

export default Sidebar;