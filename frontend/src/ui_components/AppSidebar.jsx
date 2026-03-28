/**
 * AppSidebar — shared collapsible navigation sidebar.
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   <AppSidebar open={open} onToggle={() => setOpen(o => !o)} activePath="/news" />
 *   <div className={`app-page-body${open ? " sidebar-open" : ""}`}>…</div>
 *
 * Requires app-sidebar.css (imported below).
 */
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/appSidebar.css";

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const NewsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a4 4 0 0 1-4 4z" /><line x1="10" y1="7" x2="18" y2="7" /><line x1="10" y1="11" x2="18" y2="11" /><line x1="10" y1="15" x2="14" y2="15" />
  </svg>
);
const GamesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" /><line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><circle cx="16" cy="11" r="1" fill="currentColor" /><circle cx="18" cy="13" r="1" fill="currentColor" />
  </svg>
);
const CommunityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const NAV_ITEMS = [
  { icon: HomeIcon,      label: "Home",       link: "/home"     },
  { icon: NewsIcon,      label: "News",        link: "/news"     },
  { icon: GamesIcon,     label: "Games",       link: "/games"    },
  { icon: CommunityIcon, label: "Communities", link: "/communities" },
  { icon: ProfileIcon,   label: "Profile",     link: "/profile"  },
];

const AppSidebar = ({ open, onToggle, activePath, onMouseEnter, onMouseLeave }) => {
  const navigate  = useNavigate();
  const ref       = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) onToggle();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onToggle]);

  return (
    <aside 
      ref={ref} 
      className={`app-sidebar${open ? " open" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Logo + toggle */}
      <button className="app-sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
        <span className="app-logo-text">lvl<span className="app-underscore">_</span>0</span>
        <svg className="app-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <nav className="app-sidebar-nav">
        {NAV_ITEMS.map(({ icon: Icon, label, link }) => (
          <button
            key={label}
            className={`app-nav-item${activePath === link ? " active" : ""}`}
            onClick={() => { navigate(link); if (open) onToggle(); }}
            title={label}
          >
            <span className="app-nav-icon"><Icon /></span>
            <span className="app-nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AppSidebar;
