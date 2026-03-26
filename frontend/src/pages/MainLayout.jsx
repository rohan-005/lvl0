import Sidebar from "../ui_components/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = ({ user, loadingProfile, getAvatarUrl }) => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        user={user}
        loadingProfile={loadingProfile}
        getAvatarUrl={getAvatarUrl}
      />

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;