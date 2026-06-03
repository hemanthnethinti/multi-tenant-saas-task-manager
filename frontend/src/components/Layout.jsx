import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { logout } from "../services/api.jsx";

function Layout({ children }) {
  const { user, logoutUser, isSuperAdmin, isTenantAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      // ignore
    }
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-logo">TaskFlow</h1>
            <nav className="main-nav">
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/projects" className="nav-link">
                Projects
              </Link>
              {(isTenantAdmin || isSuperAdmin) && (
                <Link to="/users" className="nav-link">
                  Users
                </Link>
              )}
            </nav>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.fullName || user?.email}</span>
              {user?.tenant && (
                <span className="user-tenant">{user.tenant.name}</span>
              )}
              <span className="user-role">{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}

export default Layout;
