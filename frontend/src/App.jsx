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
import AgentDetails from "./pages/AgentDetails";
import TransactionDetails from "./pages/TransactionDetails";
import SecurityEventDetails from "./pages/SecurityEventDetails";


function Layout() {
  const location = useLocation();

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

          {/* MAIN */}
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


          {/* SECURITY */}
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


        {/* Sidebar Footer */}
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


      {/* Main Content */}
      <main className="main-content">

        <Routes>

          {/* Dashboard */}
          <Route
            path="/"
            element={<Dashboard />}
          />


          {/* Agents */}
          <Route
            path="/agents"
            element={<AgentsPage />}
          />


          {/* Agent Details */}
          <Route
            path="/agents/:agentId"
            element={<AgentDetails />}
          />


          {/* Transactions */}
          <Route
            path="/transactions"
            element={<Transactions />}
          />


          {/* Transaction Details */}
          <Route
            path="/transactions/:transactionId"
            element={<TransactionDetails />}
          />


          {/* Security Events */}
          <Route
            path="/security-events"
            element={<SecurityEvents />}
          />


          {/* Security Event Details */}
          <Route
            path="/security-events/:eventId"
            element={<SecurityEventDetails />}
          />


          {/* Audit Logs */}
          <Route
            path="/audit-logs"
            element={<AuditLogs />}
          />

        </Routes>


        {/* Footer */}
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