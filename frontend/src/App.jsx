import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";

import "./App.css";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import SecurityEvents from "./pages/SecurityEvents";
import AuditLogs from "./pages/AuditLogs";
import AgentsPage from "./AgentsPage";
const API_URL = "http://127.0.0.1:8000";


function Layout() {
  const location = useLocation();

  const isDashboard = location.pathname === "/";

  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            AG
          </div>

          <div>
            <h1>AgentGuard</h1>
            <span>Risk & Security</span>
          </div>
        </div>

        <nav className="navigation">

          <div className="nav-section">

            <span className="nav-label">
              MAIN
            </span>

            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span>◆</span>
              Dashboard
            </NavLink>

            <NavLink
              to="/agents"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span>◉</span>
              Agents
            </NavLink>

            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span>↔</span>
              Transactions
            </NavLink>

          </div>


          <div className="nav-section">

            <span className="nav-label">
              SECURITY
            </span>

            <NavLink
              to="/security-events"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span>⚠</span>
              Security Events
            </NavLink>

            <NavLink
              to="/audit-logs"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span>▤</span>
              Audit Logs
            </NavLink>

          </div>

        </nav>


        <div className="sidebar-footer">

          <div className="system-status">
            <span className="status-dot"></span>
            API Connected
          </div>

          <span className="version">
            AgentGuard v0.3.0
          </span>

        </div>

      </aside>


      {/* Main content */}
      <main className="main-content">

        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />

         <Route
  path="/agents"
  element={<AgentsPage />}
/>

          <Route
            path="/transactions"
            element={<Transactions />}
          />

          <Route
            path="/security-events"
            element={<SecurityEvents />}
          />

          <Route
            path="/audit-logs"
            element={<AuditLogs />}
          />

        </Routes>


        <footer className="footer">
          AgentGuard Security Platform
          <span>•</span>
          API v0.3.0
        </footer>

      </main>

    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}


export default App;