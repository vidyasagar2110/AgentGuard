import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [overview, setOverview] = useState(null);
  const [riskSummary, setRiskSummary] = useState(null);
  const [riskAgents, setRiskAgents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [securitySummary, setSecuritySummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        overviewResponse,
        riskSummaryResponse,
        riskAgentsResponse,
        recentActivityResponse,
        securitySummaryResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/dashboard/overview`),
        fetch(`${API_URL}/dashboard/risk-summary`),
        fetch(`${API_URL}/dashboard/risk-agents`),
        fetch(`${API_URL}/dashboard/recent-activity?limit=10`),
        fetch(`${API_URL}/dashboard/security-summary`),
      ]);

      if (
        !overviewResponse.ok ||
        !riskSummaryResponse.ok ||
        !riskAgentsResponse.ok ||
        !recentActivityResponse.ok ||
        !securitySummaryResponse.ok
      ) {
        throw new Error("Failed to fetch dashboard data");
      }

      const [
        overviewData,
        riskSummaryData,
        riskAgentsData,
        recentActivityData,
        securitySummaryData,
      ] = await Promise.all([
        overviewResponse.json(),
        riskSummaryResponse.json(),
        riskAgentsResponse.json(),
        recentActivityResponse.json(),
        securitySummaryResponse.json(),
      ]);

      setOverview(overviewData);
      setRiskSummary(riskSummaryData);
      setRiskAgents(riskAgentsData);
      setRecentActivity(recentActivityData);
      setSecuritySummary(securitySummaryData);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to AgentGuard API. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading AgentGuard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-screen">
          <div className="error-icon">!</div>

          <h2>Connection Error</h2>

          <p>{error}</p>

          <button onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const agents = overview.agents;
  const transactions = overview.transactions;
  const security = overview.security;
  const audit = overview.audit;

  return (
    <div className="app">

      {/* ================================
          SIDEBAR
          ================================ */}

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

            <button className="nav-item active">
              <span>▦</span>
              Dashboard
            </button>

            <button className="nav-item">
              <span>◉</span>
              Agents
            </button>

            <button className="nav-item">
              <span>↔</span>
              Transactions
            </button>

          </div>

          <div className="nav-section">

            <span className="nav-label">
              SECURITY
            </span>

            <button className="nav-item">
              <span>⚠</span>
              Security Events
            </button>

            <button className="nav-item">
              <span>▤</span>
              Audit Logs
            </button>

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


      {/* ================================
          MAIN CONTENT
          ================================ */}

      <main className="main-content">

        {/* Header */}

        <header className="topbar">

          <div>

            <p className="eyebrow">
              SECURITY OPERATIONS
            </p>

            <h2>
              Dashboard
            </h2>

            <p className="subtitle">
              Monitor your AI agents, transactions and security posture.
            </p>

          </div>

          <button
            className="refresh-button"
            onClick={fetchDashboardData}
          >
            ↻ Refresh
          </button>

        </header>


        {/* ================================
            OVERVIEW CARDS
            ================================ */}

        <section className="stats-grid">

          {/* Agents */}

          <div className="stat-card">

            <div className="stat-header">

              <span className="stat-title">
                Total Agents
              </span>

              <span className="stat-icon blue">
                ◉
              </span>

            </div>

            <div className="stat-value">
              {agents.total}
            </div>

            <div className="stat-details">

              <span className="positive">
                {agents.active} active
              </span>

              <span>
                {agents.monitored} monitored
              </span>

            </div>

          </div>


          {/* Transactions */}

          <div className="stat-card">

            <div className="stat-header">

              <span className="stat-title">
                Transactions
              </span>

              <span className="stat-icon purple">
                ↔
              </span>

            </div>

            <div className="stat-value">
              {transactions.total}
            </div>

            <div className="stat-details">

              <span className="positive">
                {transactions.allowed} allowed
              </span>

              <span className="danger-text">
                {transactions.blocked} blocked
              </span>

            </div>

          </div>


          {/* Security */}

          <div className="stat-card">

            <div className="stat-header">

              <span className="stat-title">
                Security Events
              </span>

              <span className="stat-icon red">
                ⚠
              </span>

            </div>

            <div className="stat-value">
              {security.total_events}
            </div>

            <div className="stat-details">

              <span className="danger-text">
                {security.high} high
              </span>

              <span>
                {security.medium} medium
              </span>

            </div>

          </div>


          {/* Audit */}

          <div className="stat-card">

            <div className="stat-header">

              <span className="stat-title">
                Audit Logs
              </span>

              <span className="stat-icon green">
                ▤
              </span>

            </div>

            <div className="stat-value">
              {audit.total_logs}
            </div>

            <div className="stat-details">

              <span>
                Recorded activities
              </span>

            </div>

          </div>

        </section>


        {/* ================================
            AGENT STATUS + TRANSACTIONS
            ================================ */}

        <section className="dashboard-grid">

          {/* Agent Status */}

          <div className="panel">

            <div className="panel-header">

              <div>

                <h3>
                  Agent Status
                </h3>

                <p>
                  Current agent lifecycle distribution
                </p>

              </div>

            </div>

            <div className="status-list">

              <div className="status-row">

                <div className="status-name">

                  <span className="status-indicator active-dot"></span>

                  Active

                </div>

                <strong>
                  {agents.active}
                </strong>

              </div>


              <div className="status-row">

                <div className="status-name">

                  <span className="status-indicator monitored-dot"></span>

                  Monitored

                </div>

                <strong>
                  {agents.monitored}
                </strong>

              </div>


              <div className="status-row">

                <div className="status-name">

                  <span className="status-indicator restricted-dot"></span>

                  Restricted

                </div>

                <strong>
                  {agents.restricted}
                </strong>

              </div>


              <div className="status-row">

                <div className="status-name">

                  <span className="status-indicator suspended-dot"></span>

                  Suspended

                </div>

                <strong>
                  {agents.suspended}
                </strong>

              </div>

            </div>

          </div>


          {/* Transaction Decisions */}

          <div className="panel">

            <div className="panel-header">

              <div>

                <h3>
                  Transaction Decisions
                </h3>

                <p>
                  Risk engine decision breakdown
                </p>

              </div>

            </div>

            <div className="decision-list">

              <div className="decision-card allowed">

                <span>
                  Allowed
                </span>

                <strong>
                  {transactions.allowed}
                </strong>

              </div>


              <div className="decision-card review">

                <span>
                  Review
                </span>

                <strong>
                  {transactions.review}
                </strong>

              </div>


              <div className="decision-card blocked">

                <span>
                  Blocked
                </span>

                <strong>
                  {transactions.blocked}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* ================================
            SECURITY OVERVIEW
            ================================ */}

        <section className="panel security-panel">

          <div className="panel-header">

            <div>

              <h3>
                Security Overview
              </h3>

              <p>
                Current security event severity
              </p>

            </div>

            <span className="security-badge">
              Monitoring Active
            </span>

          </div>


          <div className="security-grid">

            <div className="security-item high">

              <span>
                HIGH
              </span>

              <strong>
                {security.high}
              </strong>

            </div>


            <div className="security-item medium">

              <span>
                MEDIUM
              </span>

              <strong>
                {security.medium}
              </strong>

            </div>


            <div className="security-item low">

              <span>
                LOW
              </span>

              <strong>
                {security.low}
              </strong>

            </div>

          </div>

        </section>


        {/* ================================
            RISK INTELLIGENCE
            ================================ */}

        <section className="dashboard-grid">

          {/* Risk Summary */}

          <div className="panel">

            <div className="panel-header">

              <div>

                <h3>
                  Risk Intelligence
                </h3>

                <p>
                  Current agent risk distribution
                </p>

              </div>

            </div>


            {riskSummary && (

              <div className="security-grid">

                <div className="security-item high">

                  <span>
                    HIGH RISK
                  </span>

                  <strong>
                    {riskSummary.high_risk}
                  </strong>

                </div>


                <div className="security-item medium">

                  <span>
                    MEDIUM RISK
                  </span>

                  <strong>
                    {riskSummary.medium_risk}
                  </strong>

                </div>


                <div className="security-item low">

                  <span>
                    LOW RISK
                  </span>

                  <strong>
                    {riskSummary.low_risk}
                  </strong>

                </div>

              </div>

            )}

          </div>


          {/* Recent Activity */}

          <div className="panel">

            <div className="panel-header">

              <div>

                <h3>
                  Recent Security Activity
                </h3>

                <p>
                  Latest events and audit activity
                </p>

              </div>

            </div>


            <div className="activity-list">

              {recentActivity.length === 0 ? (

                <p>
                  No recent activity.
                </p>

              ) : (

                recentActivity.slice(0, 5).map(
                  (activity, index) => (

                    <div
                      className="activity-row"
                      key={`${activity.source}-${activity.id}-${index}`}
                    >

                      <div className="activity-info">

                        <strong>
                          {activity.activity_type}
                        </strong>

                        <p>
                          {activity.message}
                        </p>

                      </div>


                      {activity.severity && (

                        <span
                          className={`activity-severity ${activity.severity.toLowerCase()}`}
                        >
                          {activity.severity}
                        </span>

                      )}

                    </div>

                  )
                )

              )}

            </div>

          </div>

        </section>


        {/* ================================
            SECURITY STATISTICS
            ================================ */}

        <section className="panel">

          <div className="panel-header">

            <div>

              <h3>
                Security Statistics
              </h3>

              <p>
                Security engine activity breakdown
              </p>

            </div>

            <span className="security-badge">
              Live Intelligence
            </span>

          </div>


          {securitySummary && (

            <div className="security-stats-grid">

              <div className="security-stat">

                <span>
                  Total Events
                </span>

                <strong>
                  {securitySummary.total_events}
                </strong>

              </div>


              <div className="security-stat danger">

                <span>
                  Blocked
                </span>

                <strong>
                  {securitySummary.blocked_events}
                </strong>

              </div>


              <div className="security-stat warning">

                <span>
                  Review
                </span>

                <strong>
                  {securitySummary.review_events}
                </strong>

              </div>


              <div className="security-stat anomaly">

                <span>
                  Anomalies
                </span>

                <strong>
                  {securitySummary.anomaly_events}
                </strong>

              </div>

            </div>

          )}

        </section>


        {/* ================================
            RISK AGENTS
            ================================ */}

        <section className="panel">

          <div className="panel-header">

            <div>

              <h3>
                Risk Agents
              </h3>

              <p>
                Agents ranked by current risk score
              </p>

            </div>

          </div>


          <div className="risk-table">

            <div className="risk-table-header">

              <span>
                Agent
              </span>

              <span>
                Risk Score
              </span>

              <span>
                Risk Level
              </span>

              <span>
                Trust Score
              </span>

              <span>
                Blocked
              </span>

              <span>
                Review
              </span>

            </div>


            {riskAgents.length === 0 ? (

              <p>
                No agents available.
              </p>

            ) : (

              riskAgents.map((agent) => (

                <div
                  className="risk-table-row"
                  key={agent.agent_id}
                >

                  <span>
                    <strong>
                      {agent.agent_name}
                    </strong>
                  </span>


                  <span className="risk-score">
                    {agent.risk_score}
                  </span>


                  <span>

                    <strong
                      className={`risk-level ${agent.risk_level.toLowerCase()}`}
                    >
                      {agent.risk_level}
                    </strong>

                  </span>


                  <span>
                    {agent.trust_score}
                  </span>


                  <span className="danger-text">
                    {agent.blocked_transactions}
                  </span>


                  <span>
                    {agent.review_transactions}
                  </span>

                </div>

              ))

            )}

          </div>

        </section>


        {/* ================================
            FOOTER
            ================================ */}

        <footer className="footer">

          AgentGuard Security Platform

          <span>
            •
          </span>

          API v0.3.0

        </footer>

      </main>

    </div>
  );
}

export default App;