import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function TransactionDetails() {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadExplanation = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/transactions/${transactionId}/explanation`
      );

      if (!response.ok) {
        throw new Error("Failed to load transaction explanation");
      }

      const data = await response.json();
      setExplanation(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load transaction explanation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExplanation();
  }, [transactionId]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getSeverityClass = (severity) => {
    if (severity === "HIGH") return "severity-high";
    if (severity === "MEDIUM") return "severity-medium";
    return "severity-low";
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading transaction intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <div className="error-icon">!</div>

        <h2>Unable to load transaction</h2>

        <p>{error}</p>

        <button onClick={loadExplanation}>
          Retry
        </button>
      </div>
    );
  }

  if (!explanation) {
    return null;
  }

  return (
    <div className="page-content">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <p className="eyebrow">
            TRANSACTION INTELLIGENCE
          </p>

          <h2>
            Transaction #{explanation.transaction_id}
          </h2>

          <p className="subtitle">
            Detailed risk assessment and decision explanation.
          </p>
        </div>

        <div className="agent-detail-actions">

          <button
            className="refresh-button"
            onClick={loadExplanation}
          >
            ↻ Refresh
          </button>

          <button
            className="back-button"
            onClick={() => navigate("/transactions")}
          >
            ← Back to Transactions
          </button>

        </div>

      </div>


      {/* DECISION SUMMARY */}

      <section className="panel transaction-explanation-summary">

        <div className="explanation-summary-content">

          <div>
            <span className="intelligence-label">
              Decision
            </span>

            <span
              className={`decision-badge ${
                explanation.decision === "ALLOW"
                  ? "decision-allow"
                  : explanation.decision === "REVIEW"
                  ? "decision-review"
                  : "decision-block"
              }`}
            >
              {explanation.decision}
            </span>
          </div>


          <div>
            <span className="intelligence-label">
              Risk Score
            </span>

            <strong
              className={
                explanation.risk_score >= 70
                  ? "danger-number large-number"
                  : explanation.risk_score >= 40
                  ? "warning-number large-number"
                  : "success-number large-number"
              }
            >
              {explanation.risk_score}
            </strong>
          </div>


          <div>
            <span className="intelligence-label">
              Evaluated At
            </span>

            <strong>
              {formatDate(explanation.evaluated_at)}
            </strong>
          </div>

        </div>


        <div className="transaction-summary-message">

         <div
  className={`recommendation-icon ${
    explanation.decision === "ALLOW"
      ? "icon-allow"
      : explanation.decision === "REVIEW"
      ? "icon-review"
      : "icon-block"
  }`}
>
  {explanation.decision === "ALLOW"
    ? "✓"
    : explanation.decision === "REVIEW"
    ? "!"
    : "×"}
</div>

          <div>
            <strong>
              {explanation.summary}
            </strong>

            <p>
              AgentGuard generated this explanation based
              on the transaction's risk signals.
            </p>
          </div>

        </div>

      </section>


      {/* RISK FACTORS */}

      <section className="panel">

        <div className="panel-header">

          <div>
            <h3>
              Risk Factors
            </h3>

            <p>
              Signals that contributed to the transaction decision.
            </p>
          </div>

          <span className="security-badge">
            {explanation.risk_factors.length} Factors
          </span>

        </div>


        <div className="risk-factor-list">

          {explanation.risk_factors.length === 0 ? (

            <div className="empty-state">
              No risk factors were recorded.
            </div>

          ) : (

            explanation.risk_factors.map((factor, index) => (

              <div
                className="risk-factor-item"
                key={index}
              >

                <div className="risk-factor-number">
                  {index + 1}
                </div>


                <div className="risk-factor-content">

                  <div className="risk-factor-header">

                    <strong>
                      {factor.type}
                    </strong>

                    <span
                      className={`severity-badge ${getSeverityClass(
                        factor.severity
                      )}`}
                    >
                      {factor.severity}
                    </span>

                  </div>

                  <p>
                    {factor.message}
                  </p>

                </div>

              </div>

            ))
          )}

        </div>

      </section>

    </div>
  );
}

export default TransactionDetails;