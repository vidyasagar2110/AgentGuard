import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function AgentDetails() {
  const { agentId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/agents/${agentId}/risk-profile`
      );

      if (!response.ok) {
        throw new Error("Failed to load agent profile");
      }

      const data = await response.json();

      setProfile(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load agent intelligence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [agentId]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading agent intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <div className="error-icon">!</div>

        <h2>Unable to load agent</h2>

        <p>{error}</p>

        <button onClick={loadProfile}>
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="page-content">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <p className="eyebrow">
            AGENT INTELLIGENCE
          </p>

          <h2>
            {profile.agent_name}
          </h2>

          <p className="subtitle">
            Detailed risk, trust and behavioral assessment.
          </p>

        </div>

        <div className="agent-detail-actions">

          <button
            className="refresh-button"
            onClick={loadProfile}
          >
            ↻ Refresh
          </button>

          <button
            className="back-button"
            onClick={() => navigate("/agents")}
          >
            ← Back to Agents
          </button>

        </div>

      </div>


      {/* AGENT STATUS */}

      <div className="agent-profile-banner">

        <div className="agent-profile-main">

          <div className="large-agent-avatar">
            AG
          </div>

          <div>

            <h3>
              {profile.agent_name}
            </h3>

            <p>
              Agent ID: {profile.agent_id}
            </p>

          </div>

        </div>


        <div className="profile-status-group">

          <span
            className={`risk-badge ${
              profile.risk_level.toLowerCase()
            }`}
          >
            {profile.risk_level} RISK
          </span>

          <span
            className={`status-badge ${
              profile.agent_status.toLowerCase()
            }`}
          >
            {profile.agent_status}
          </span>

        </div>

      </div>


      {/* RISK / TRUST */}

      <div className="agent-intelligence-grid">

        <div className="intelligence-card">

          <span className="intelligence-label">
            Risk Score
          </span>

          <strong className="danger-number large-number">
            {profile.risk_score}
          </strong>

          <span className="intelligence-description">
            Current calculated risk
          </span>

        </div>


        <div className="intelligence-card">

          <span className="intelligence-label">
            Trust Score
          </span>

          <strong className="success-number large-number">
            {profile.trust_score}
          </strong>

          <div className="large-trust-bar">
            <div
              style={{
                width: `${profile.trust_score}%`,
              }}
            ></div>
          </div>

          <span className="intelligence-description">
            Current trust level
          </span>

        </div>


        <div className="intelligence-card">

          <span className="intelligence-label">
            Transactions
          </span>

          <strong className="large-number">
            {profile.total_transactions}
          </strong>

          <span className="intelligence-description">
            Evaluated transactions
          </span>

        </div>


        <div className="intelligence-card">

          <span className="intelligence-label">
            Anomalies
          </span>

          <strong className="warning-number large-number">
            {profile.anomalies_detected}
          </strong>

          <span className="intelligence-description">
            Detected anomalies
          </span>

        </div>

      </div>


      {/* BEHAVIOR STATISTICS */}

      <section className="panel">

        <div className="panel-header">

          <div>
            <h3>
              Behavioral Intelligence
            </h3>

            <p>
              Transaction behavior and spending patterns.
            </p>
          </div>

        </div>


        <div className="behavior-grid">

          <div className="behavior-item">
            <span>Total Spending</span>
            <strong>
              ₹{profile.total_spending.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="behavior-item">
            <span>Average Transaction</span>
            <strong>
              ₹{profile.average_transaction.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="behavior-item">
            <span>Maximum Transaction</span>
            <strong>
              ₹{profile.maximum_transaction.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="behavior-item">
            <span>Blocked Transactions</span>
            <strong className="danger-number">
              {profile.blocked_transactions}
            </strong>
          </div>

          <div className="behavior-item">
            <span>Review Transactions</span>
            <strong className="warning-number">
              {profile.review_transactions}
            </strong>
          </div>

          <div className="behavior-item">
            <span>Allowed Transactions</span>
            <strong className="success-number">
              {profile.allowed_transactions}
            </strong>
          </div>

        </div>

      </section>


      {/* RATES */}

      <section className="panel">

        <div className="panel-header">

          <div>
            <h3>
              Risk Metrics
            </h3>

            <p>
              Current transaction decision rates.
            </p>
          </div>

        </div>


        <div className="metrics-grid">

          <div className="metric-card danger-metric">
            <span>Block Rate</span>

            <strong>
              {profile.block_rate}%
            </strong>
          </div>

          <div className="metric-card warning-metric">
            <span>Review Rate</span>

            <strong>
              {profile.review_rate}%
            </strong>
          </div>

          <div className="metric-card success-metric">
            <span>Allow Rate</span>

            <strong>
              {(
                100 -
                profile.block_rate -
                profile.review_rate
              ).toFixed(2)}%
            </strong>
          </div>

        </div>

      </section>


      {/* RECOMMENDATION */}

      <section className="panel recommendation-panel">

        <div className="panel-header">

          <div>
            <h3>
              Security Recommendation
            </h3>

            <p>
              Recommendation generated by the AgentGuard risk engine.
            </p>
          </div>

          <span className="security-badge">
            {profile.trust_status}
          </span>

        </div>


        <div className="recommendation-content">

          <div className="recommendation-icon">
            !
          </div>

          <div>

            <strong>
              {profile.recommendation}
            </strong>

            <p>
              AgentGuard recommends continued monitoring based
              on the current risk and behavioral profile.
            </p>

          </div>

        </div>

      </section>


      {/* RISK REASONS */}

      <section className="panel">

        <div className="panel-header">

          <div>
            <h3>
              Risk Assessment Reasons
            </h3>

            <p>
              Factors contributing to the current risk score.
            </p>
          </div>

        </div>


        <div className="risk-reasons">

          {profile.reasons.map((reason, index) => (

            <div
              className="risk-reason"
              key={index}
            >

              <span>
                {index + 1}
              </span>

              <p>
                {reason}
              </p>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default AgentDetails;