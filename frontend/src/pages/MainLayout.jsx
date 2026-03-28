import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "../ui_components/AppSidebar";
import "../css/appSidebar.css";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <AppSidebar 
        open={sidebarOpen} 
        onToggle={() => setSidebarOpen(o => !o)} 
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        activePath={location.pathname} 
      />
      <div className="app-page-body">
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;