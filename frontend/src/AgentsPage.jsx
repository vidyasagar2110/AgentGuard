import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/dashboard/risk-agents`
      );

      if (!response.ok) {
        throw new Error("Failed to load agents");
      }

      const data = await response.json();
      setAgents(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load agent data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading agents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <div className="error-icon">!</div>
        <h2>Unable to load agents</h2>
        <p>{error}</p>
        <button onClick={loadAgents}>Retry</button>
      </div>
    );
  }

  const highRisk = agents.filter(
    (agent) => agent.risk_level === "HIGH"
  ).length;

  const monitored = agents.filter(
    (agent) => agent.trust_status === "MONITORED"
  ).length;

  const trusted = agents.filter(
    (agent) => agent.trust_status === "TRUSTED"
  ).length;

  return (
    <div className="page-content">

      <div className="page-header">
        <div>
          <p className="eyebrow">AGENT MANAGEMENT</p>

          <h2>Agents</h2>

          <p className="subtitle">
            Monitor registered AI agents and their security posture.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadAgents}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="agent-summary">

        <div className="summary-card">
          <span>Total Agents</span>
          <strong>{agents.length}</strong>
        </div>

        <div className="summary-card">
          <span>High Risk</span>
          <strong className="danger-number">
            {highRisk}
          </strong>
        </div>

        <div className="summary-card">
          <span>Monitored</span>
          <strong className="warning-number">
            {monitored}
          </strong>
        </div>

        <div className="summary-card">
          <span>Trusted</span>
          <strong className="success-number">
            {trusted}
          </strong>
        </div>

      </div>

      <div className="panel">

        <div className="panel-header">
          <div>
            <h3>Registered Agents</h3>
            <p>Current risk and trust assessment</p>
          </div>
        </div>

        {agents.length === 0 ? (
          <div className="empty-state">
            No agents registered.
          </div>
        ) : (
          <div className="table-wrapper">

            <table className="agents-table">

              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Trust Score</th>
                  <th>Status</th>
                  <th>Transactions</th>
                  <th>Blocked</th>
                  <th>Review</th>
                </tr>
              </thead>

              <tbody>

                {agents.map((agent) => (
                  <tr key={agent.agent_id}>

                    <td>
                      <div className="agent-name">

                        <div className="agent-avatar">
                          AG
                        </div>

                        <div>
                          <strong>
                            {agent.agent_name}
                          </strong>

                          <small>
                            ID: {agent.agent_id}
                          </small>
                        </div>

                      </div>
                    </td>

                    <td>
                      <strong>
                        {agent.risk_score}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`risk-badge ${agent.risk_level.toLowerCase()}`}
                      >
                        {agent.risk_level}
                      </span>
                    </td>

                    <td>
                      <div className="trust-score">

                        <strong>
                          {agent.trust_score}
                        </strong>

                        <div className="trust-bar">
                          <div
                            style={{
                              width: `${agent.trust_score}%`,
                            }}
                          ></div>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${agent.trust_status.toLowerCase()}`}
                      >
                        {agent.trust_status}
                      </span>
                    </td>

                    <td>
                      {agent.total_transactions}
                    </td>

                    <td>
                      <span className="blocked-count">
                        {agent.blocked_transactions}
                      </span>
                    </td>

                    <td>
                      {agent.review_transactions}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default AgentsPage;