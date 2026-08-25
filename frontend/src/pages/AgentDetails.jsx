import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function AgentDetails() {
  const { agentId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState(null);
  const [anomalyReport, setAnomalyReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAgentData = async () => {
    try {
      setLoading(true);
      setError("");

      const [profileResponse, anomalyResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/agents/${agentId}/risk-profile`),
        fetch(`${API_BASE_URL}/agents/${agentId}/anomalies`),
      ]);

      if (!profileResponse.ok) {
        throw new Error("Failed to load agent profile");
      }

      if (!anomalyResponse.ok) {
        throw new Error("Failed to load anomaly data");
      }

      const profileData = await profileResponse.json();
      const anomalyData = await anomalyResponse.json();

      setProfile(profileData);
      setAnomalyReport(anomalyData);
    } catch (err) {
      console.error(err);
      setError("Unable to load agent intelligence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentData();
  }, [agentId]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) {
      return "₹0";
    }

    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  const formatCategory = (category) => {
    if (!category) return "—";

    return (
      category.charAt(0).toUpperCase() +
      category.slice(1).toLowerCase()
    );
  };

  const getSeverityClass = (severity) => {
    if (severity === "HIGH") return "severity-high";
    if (severity === "MEDIUM") return "severity-medium";
    return "severity-low";
  };

  const getSeverityIcon = (severity) => {
    if (severity === "HIGH") return "!";
    if (severity === "MEDIUM") return "!";
    return "✓";
  };

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

        <button onClick={loadAgentData}>
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const anomalies = anomalyReport?.anomalies || [];

  const highAnomalies = anomalies.filter(
    (anomaly) => anomaly.severity === "HIGH"
  ).length;

  const mediumAnomalies = anomalies.filter(
    (anomaly) => anomaly.severity === "MEDIUM"
  ).length;

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
            onClick={loadAgentData}
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
            {anomalyReport?.anomalies_detected ??
              profile.anomalies_detected}
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

            <span>
              Total Spending
            </span>

            <strong>
              {formatCurrency(profile.total_spending)}
            </strong>

          </div>


          <div className="behavior-item">

            <span>
              Average Transaction
            </span>

            <strong>
              {formatCurrency(profile.average_transaction)}
            </strong>

          </div>


          <div className="behavior-item">

            <span>
              Maximum Transaction
            </span>

            <strong>
              {formatCurrency(profile.maximum_transaction)}
            </strong>

          </div>


          <div className="behavior-item">

            <span>
              Blocked Transactions
            </span>

            <strong className="danger-number">
              {profile.blocked_transactions}
            </strong>

          </div>


          <div className="behavior-item">

            <span>
              Review Transactions
            </span>

            <strong className="warning-number">
              {profile.review_transactions}
            </strong>

          </div>


          <div className="behavior-item">

            <span>
              Allowed Transactions
            </span>

            <strong className="success-number">
              {profile.allowed_transactions}
            </strong>

          </div>

        </div>

      </section>


      {/* ANOMALY INTELLIGENCE */}

      <section className="panel anomaly-panel">

        <div className="panel-header">

          <div>

            <h3>
              Anomaly Intelligence
            </h3>

            <p>
              Transactions that deviate from the agent's
              historical behavior.
            </p>

          </div>

          <span className="security-badge">
            {anomalyReport?.anomalies_detected || 0} Detected
          </span>

        </div>


        <div className="anomaly-summary">

          <div className="anomaly-summary-card">

            <span>
              Baseline Average
            </span>

            <strong>
              {formatCurrency(
                anomalyReport?.baseline_average
              )}
            </strong>

          </div>


          <div className="anomaly-summary-card">

            <span>
              High Severity
            </span>

            <strong className="danger-number">
              {highAnomalies}
            </strong>

          </div>


          <div className="anomaly-summary-card">

            <span>
              Medium Severity
            </span>

            <strong className="warning-number">
              {mediumAnomalies}
            </strong>

          </div>

        </div>


        {anomalies.length === 0 ? (

          <div className="empty-state">
            No transaction anomalies detected.
          </div>

        ) : (

          <div className="anomaly-list">

            {anomalies.map((anomaly) => (

              <div
                className={`anomaly-item ${getSeverityClass(
                  anomaly.severity
                )}`}
                key={anomaly.transaction_id}
              >

                <div className="anomaly-icon">
                  {getSeverityIcon(anomaly.severity)}
                </div>


                <div className="anomaly-content">

                  <div className="anomaly-header">

                    <div>

                      <button
                        className="anomaly-transaction-link"
                        onClick={() =>
                          navigate(
                            `/transactions/${anomaly.transaction_id}`
                          )
                        }
                      >
                        Transaction #{anomaly.transaction_id}
                      </button>

                      <span className="anomaly-type">
                        {anomaly.anomaly_type.replace(
                          /_/g,
                          " "
                        )}
                      </span>

                    </div>


                    <span
                      className={`severity-badge ${getSeverityClass(
                        anomaly.severity
                      )}`}
                    >
                      {anomaly.severity}
                    </span>

                  </div>


                  <div className="anomaly-details">

                    <span>
                      {formatCurrency(anomaly.amount)}
                    </span>

                    <span>
                      {formatCategory(anomaly.category)}
                    </span>

                  </div>


                  <p>
                    {anomaly.reason}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* RISK METRICS */}

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

            <span>
              Block Rate
            </span>

            <strong>
              {profile.block_rate}%
            </strong>

          </div>


          <div className="metric-card warning-metric">

            <span>
              Review Rate
            </span>

            <strong>
              {profile.review_rate}%
            </strong>

          </div>


          <div className="metric-card success-metric">

            <span>
              Allow Rate
            </span>

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
              Recommendation generated by the AgentGuard
              risk engine.
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
              AgentGuard recommends continued monitoring
              based on the current risk and behavioral
              profile.
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