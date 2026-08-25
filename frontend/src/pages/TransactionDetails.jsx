import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function TransactionDetails() {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [explanation, setExplanation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [explanationLoading, setExplanationLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransaction = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/transactions/${transactionId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load transaction");
      }

      const data = await response.json();

      setTransaction(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load transaction.");
    } finally {
      setLoading(false);
    }
  };

  const loadExplanation = async () => {
    try {
      setExplanationLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/transactions/${transactionId}/explanation`
      );

      if (!response.ok) {
        throw new Error("Failed to load explanation");
      }

      const data = await response.json();

      setExplanation(data);
    } catch (err) {
      console.error(err);
      setExplanation(null);
    } finally {
      setExplanationLoading(false);
    }
  };

  const loadData = async () => {
    await Promise.all([
      loadTransaction(),
      loadExplanation(),
    ]);
  };

  useEffect(() => {
    loadData();
  }, [transactionId]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getDecisionClass = (decision) => {
    if (decision === "BLOCK") return "decision-block";
    if (decision === "REVIEW") return "decision-review";
    return "decision-allow";
  };

  const getSeverityClass = (severity) => {
    if (severity === "HIGH") return "severity-high";
    if (severity === "MEDIUM") return "severity-medium";
    return "severity-low";
  };

  const getFactorIcon = (type) => {
    if (type === "POLICY") return "◆";
    if (type === "BEHAVIOR") return "◉";
    if (type === "ANOMALY") return "⚠";
    return "!";
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading transaction...</p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="page-error">
        <div className="error-icon">!</div>

        <h2>Unable to load transaction</h2>

        <p>{error || "Transaction not found."}</p>

        <button onClick={loadData}>
          Retry
        </button>
      </div>
    );
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
            Transaction #{transaction.id}
          </h2>

          <p className="subtitle">
            Detailed risk assessment and decision explanation.
          </p>
        </div>

        <div className="agent-detail-actions">

          <button
            className="refresh-button"
            onClick={loadData}
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


      {/* TRANSACTION SUMMARY */}

      <section className="panel transaction-summary">

        <div className="transaction-summary-grid">

          <div>
            <span className="intelligence-label">
              Decision
            </span>

            <div
              className={`decision-display ${getDecisionClass(
                transaction.decision
              )}`}
            >
              {transaction.decision}
            </div>
          </div>


          <div>
            <span className="intelligence-label">
              Risk Score
            </span>

            <div className="risk-score-large">
              {transaction.risk_score}
            </div>
          </div>


          <div>
            <span className="intelligence-label">
              Evaluated At
            </span>

            <strong>
              {formatDate(transaction.evaluated_at)}
            </strong>
          </div>

        </div>


        <div className="transaction-summary-message">

          <div className="summary-icon">
            {transaction.decision === "BLOCK"
              ? "×"
              : transaction.decision === "REVIEW"
              ? "!"
              : "✓"}
          </div>

          <div>

            <strong>
              {transaction.decision === "BLOCK"
                ? "Transaction blocked due to one or more high-risk signals"
                : transaction.decision === "REVIEW"
                ? "Transaction requires additional review before approval"
                : "Transaction passed the current risk assessment"}
            </strong>

            <p>
              AgentGuard generated this assessment based on
              the transaction's risk signals.
            </p>

          </div>

        </div>

      </section>


      {/* AI / LOCAL EXPLANATION */}

      <section className="panel explanation-panel">

        <div className="panel-header">

          <div>

            <h3>
              Explainability
            </h3>

            <p>
              Human-readable explanation of the security decision.
            </p>

          </div>

          <span className="explanation-source-badge">
            {explanation
              ? "LOCAL EXPLAINER"
              : "UNAVAILABLE"}
          </span>

        </div>


        {explanationLoading ? (

          <div className="explanation-loading">
            <div className="spinner"></div>
            <span>
              Generating explanation...
            </span>
          </div>

        ) : explanation?.ai_explanation ? (

          <div className="explanation-content">

            <div className="explanation-icon">
              ✦
            </div>

            <p>
              {explanation.ai_explanation}
            </p>

          </div>

        ) : (

          <div className="explanation-empty">
            Explanation is currently unavailable.
          </div>

        )}

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

          <span className="factor-count">
            {explanation?.risk_factors?.length || 0} Factors
          </span>

        </div>


        <div className="risk-factor-list">

          {explanation?.risk_factors?.map(
            (factor, index) => (

              <div
                className="risk-factor-card"
                key={`${factor.type}-${index}`}
              >

                <div className="risk-factor-number">
                  {index + 1}
                </div>

                <div className="risk-factor-icon">
                  {getFactorIcon(factor.type)}
                </div>

                <div className="risk-factor-content">

                  <div className="risk-factor-heading">

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

            )
          )}

        </div>

      </section>


      {/* TRANSACTION INFORMATION */}

      <section className="panel">

        <div className="panel-header">

          <div>

            <h3>
              Transaction Information
            </h3>

            <p>
              Core transaction details.
            </p>

          </div>

        </div>


        <div className="event-details-grid">

          <div className="event-detail-card">

            <span>
              Transaction ID
            </span>

            <strong>
              #{transaction.id}
            </strong>

          </div>


          <div className="event-detail-card">

            <span>
              Agent ID
            </span>

            <strong>
              #{transaction.agent_id}
            </strong>

          </div>


          <div className="event-detail-card">

            <span>
              Amount
            </span>

            <strong>
              ₹{Number(transaction.amount).toLocaleString("en-IN")}
            </strong>

          </div>


          <div className="event-detail-card">

            <span>
              Category
            </span>

            <strong>
              {transaction.category}
            </strong>

          </div>


          <div className="event-detail-card">

            <span>
              Decision
            </span>

            <strong
              className={getDecisionClass(
                transaction.decision
              )}
            >
              {transaction.decision}
            </strong>

          </div>


          <div className="event-detail-card">

            <span>
              Evaluated At
            </span>

            <strong>
              {formatDate(transaction.evaluated_at)}
            </strong>

          </div>

        </div>

      </section>

    </div>
  );
}

export default TransactionDetails;