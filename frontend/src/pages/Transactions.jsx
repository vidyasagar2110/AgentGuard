import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./../App.css";

const API_URL = "http://127.0.0.1:8000";

function Transactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH TRANSACTIONS
  // ============================================================

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/transactions`);

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();

      const transactionData = Array.isArray(data)
        ? data
        : data.value || [];

      setTransactions(transactionData);
    } catch (err) {
      console.error("Transaction fetch error:", err);
      setError("Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ============================================================
  // TRANSACTION STATISTICS
  // ============================================================

  const allowed = transactions.filter(
    (transaction) => transaction.decision === "ALLOW"
  ).length;

  const review = transactions.filter(
    (transaction) => transaction.decision === "REVIEW"
  ).length;

  const blocked = transactions.filter(
    (transaction) => transaction.decision === "BLOCK"
  ).length;

  // ============================================================
  // FORMATTERS
  // ============================================================

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatCategory = (category) => {
    if (!category) return "—";

    return (
      category.charAt(0).toUpperCase() +
      category.slice(1).toLowerCase()
    );
  };

  // ============================================================
  // DECISION / RISK HELPERS
  // ============================================================

  const getDecisionClass = (decision) => {
    if (decision === "ALLOW") return "decision-allow";
    if (decision === "REVIEW") return "decision-review";
    return "decision-block";
  };

  const getRiskClass = (score) => {
    const numericScore = Number(score) || 0;

    if (numericScore >= 70) return "risk-high";
    if (numericScore >= 40) return "risk-medium";

    return "risk-low";
  };

  // ============================================================
  // ML HELPERS
  // ============================================================

  const getMLLabelClass = (label) => {
    if (label === "HIGH") return "risk-high";
    if (label === "MEDIUM") return "risk-medium";

    return "risk-low";
  };

  const getMLStatus = (transaction) => {
    if (transaction.ml_available === false) {
      return "INSUFFICIENT DATA";
    }

    if (transaction.ml_anomaly_detected === true) {
      return "ANOMALY DETECTED";
    }

    if (transaction.ml_available === true) {
      return "NORMAL";
    }

    return "NOT AVAILABLE";
  };

  const getMLStatusClass = (transaction) => {
    if (transaction.ml_available === false) {
      return "ml-status-unavailable";
    }

    if (transaction.ml_anomaly_detected === true) {
      return "ml-status-anomaly";
    }

    if (transaction.ml_available === true) {
      return "ml-status-normal";
    }

    return "ml-status-unavailable";
  };

  const getMLDetection = (transaction) => {
    if (transaction.ml_anomaly_detected === true) {
      return "Anomaly";
    }

    if (transaction.ml_available === true) {
      return "Normal";
    }

    return "—";
  };


  const transactionPolishStyles = `
    .transaction-reasons-panel {
      margin-top: 24px;
    }

    .transaction-details-list {
      display: flex;
      flex-direction: column;
    }

    .transaction-detail {
      padding: 24px 0;
      border-top: 1px solid #1f2937;
    }

    .transaction-detail:first-child {
      border-top: 0;
    }

    .transaction-detail-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 14px;
    }

    .transaction-detail-header > div:first-child {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    .transaction-detail-header > div:first-child > strong {
      display: block;
      line-height: 1.35;
    }

    .transaction-detail-header > div:first-child > span {
      display: block;
      color: #718096;
      line-height: 1.5;
    }

    .reason-list {
      margin: 0 0 22px;
      padding-left: 22px;
      line-height: 1.65;
    }

    .reason-list li {
      margin: 3px 0;
    }

    .no-reasons {
      margin: 0 0 22px;
      color: #718096;
    }

    .ml-analysis {
      display: block;
      width: 100%;
      box-sizing: border-box;
      margin-top: 18px;
      padding: 20px;
      border: 1px solid #263247;
      border-radius: 10px;
      background: rgba(17, 24, 39, 0.55);
    }

    .ml-analysis-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 18px;
    }

    .ml-eyebrow {
      display: block;
      margin-bottom: 6px;
      color: #718096;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
    }

    .ml-analysis-header h4 {
      margin: 0;
      line-height: 1.35;
    }

    .ml-status {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      min-height: 30px;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }

    .ml-status-normal {
      color: #22c55e;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.28);
    }

    .ml-status-anomaly {
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.28);
    }

    .ml-status-unavailable {
      color: #94a3b8;
      background: rgba(148, 163, 184, 0.10);
      border: 1px solid rgba(148, 163, 184, 0.22);
    }

    .ml-analysis-grid {
      display: grid !important;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      width: 100%;
      box-sizing: border-box;
    }

    .ml-metric {
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-start;
      justify-content: flex-start;
      min-width: 0;
      min-height: 105px;
      box-sizing: border-box;
      padding: 14px;
      border: 1px solid #263247;
      border-radius: 8px;
      background: #0b111b;
    }

    .ml-metric-label,
    .ml-metric-description,
    .ml-explanation-label {
      display: block;
    }

    .ml-metric-label {
      display: block !important;
      width: 100%;
      margin-bottom: 8px;
      color: #718096;
      font-size: 11px;
      font-weight: 600;
      line-height: 1.4;
    }

    .ml-metric-value {
      display: block !important;
      width: 100%;
      margin: 0 0 7px;
      font-size: 20px;
      line-height: 1.2;
    }

    .ml-metric .risk-score {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      margin-bottom: 7px;
      padding: 4px 9px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 800;
    }

    .ml-metric-description {
      display: block !important;
      width: 100%;
      margin-top: auto;
      color: #64748b;
      font-size: 10px;
      line-height: 1.45;
    }

    .ml-explanation {
      display: block;
      width: 100%;
      box-sizing: border-box;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid #1f2937;
    }

    .ml-explanation-label {
      margin-bottom: 7px;
      color: #94a3b8;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .ml-explanation p {
      display: block !important;
      margin: 0;
      color: #8fa3bf;
      font-size: 12px;
      line-height: 1.65;
      white-space: normal;
      overflow-wrap: anywhere;
    }

    @media (max-width: 800px) {
      .ml-analysis-grid {
        grid-template-columns: 1fr;
      }

      .transaction-detail-header,
      .ml-analysis-header {
        flex-direction: column;
      }

      .ml-status {
        align-self: flex-start;
      }
    }
  `;

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {
    return (
      <div className="page-error">
        <div className="error-icon">!</div>

        <h3>Transaction Loading Error</h3>

        <p>{error}</p>

        <button onClick={fetchTransactions}>
          Retry
        </button>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div>
      <style>{transactionPolishStyles}</style>

      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <div className="page-topbar">

        <div>
          <p className="eyebrow">
            TRANSACTION MONITORING
          </p>

          <h2>
            Transactions
          </h2>

          <p className="subtitle">
            Monitor AI agent payment transactions and risk decisions.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchTransactions}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>


      {/* ========================================================
          STATISTICS
      ======================================================== */}

      <div className="stats-grid">

        {/* TOTAL */}

        <div className="stat-card">

          <div className="stat-header">

            <span className="stat-title">
              Total Transactions
            </span>

            <div className="stat-icon purple">
              ↔
            </div>

          </div>

          <div className="stat-value">
            {transactions.length}
          </div>

          <div className="stat-details">
            <span>
              Evaluated transactions
            </span>
          </div>

        </div>


        {/* ALLOWED */}

        <div className="stat-card">

          <div className="stat-header">

            <span className="stat-title">
              Allowed
            </span>

            <div className="stat-icon green">
              ✓
            </div>

          </div>

          <div className="stat-value positive">
            {allowed}
          </div>

          <div className="stat-details">
            <span className="positive">
              Approved
            </span>
          </div>

        </div>


        {/* REVIEW */}

        <div className="stat-card">

          <div className="stat-header">

            <span className="stat-title">
              Review
            </span>

            <div className="stat-icon yellow">
              !
            </div>

          </div>

          <div className="stat-value review-number">
            {review}
          </div>

          <div className="stat-details">
            <span>
              Requires approval
            </span>
          </div>

        </div>


        {/* BLOCKED */}

        <div className="stat-card">

          <div className="stat-header">

            <span className="stat-title">
              Blocked
            </span>

            <div className="stat-icon red">
              ×
            </div>

          </div>

          <div className="stat-value danger-text">
            {blocked}
          </div>

          <div className="stat-details">
            <span className="danger-text">
              Rejected
            </span>
          </div>

        </div>

      </div>


      {/* ========================================================
          TRANSACTION HISTORY
      ======================================================== */}

      <section className="panel transactions-panel">

        <div className="panel-header">

          <div>

            <h3>
              Transaction History
            </h3>

            <p>
              Latest transactions evaluated by the AgentGuard risk engine.
            </p>

          </div>

          <span className="security-badge">
            {transactions.length}{" "}
            {transactions.length === 1 ? "Record" : "Records"}
          </span>

        </div>


        <div className="transaction-table-wrapper">

          {transactions.length === 0 ? (

            <div className="empty-state">

              <h3>
                No transactions found
              </h3>

              <p>
                No transaction records are currently available.
              </p>

            </div>

          ) : (

            <table className="transaction-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Agent</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Decision</th>
                  <th>Risk Score</th>
                  <th>Evaluated At</th>
                </tr>

              </thead>


              <tbody>

                {transactions.map((transaction) => (

                  <tr key={transaction.id}>

                    {/* TRANSACTION ID */}

                    <td>

                      <button
                        className="transaction-id transaction-link"
                        onClick={() =>
                          navigate(
                            `/transactions/${transaction.id}`
                          )
                        }
                        title={`View transaction ${transaction.id}`}
                      >
                        #{transaction.id}
                      </button>

                    </td>


                    {/* AGENT */}

                    <td>

                      <span className="agent-reference">
                        Agent {transaction.agent_id}
                      </span>

                    </td>


                    {/* AMOUNT */}

                    <td>

                      <strong className="amount">
                        {formatAmount(transaction.amount)}
                      </strong>

                    </td>


                    {/* CATEGORY */}

                    <td>

                      <span className="category-badge">
                        {formatCategory(transaction.category)}
                      </span>

                    </td>


                    {/* DECISION */}

                    <td>

                      <span
                        className={`decision-badge ${getDecisionClass(
                          transaction.decision
                        )}`}
                      >
                        {transaction.decision}
                      </span>

                    </td>


                    {/* RISK SCORE */}

                    <td>

                      <span
                        className={`risk-score ${getRiskClass(
                          transaction.risk_score
                        )}`}
                      >
                        {transaction.risk_score ?? "—"}
                      </span>

                    </td>


                    {/* DATE */}

                    <td className="date-cell">

                      {formatDate(
                        transaction.evaluated_at
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </section>


      {/* ========================================================
          RISK ASSESSMENT DETAILS
      ======================================================== */}

      <section className="panel transaction-reasons-panel">

        <div className="panel-header">

          <div>

            <h3>
              Risk Assessment Details
            </h3>

            <p>
              Policy, behavioral, statistical, and machine-learning risk signals.
            </p>

          </div>

        </div>


        <div className="transaction-details-list">

          {transactions.slice(0, 5).map((transaction) => (

            <div
              className="transaction-detail"
              key={transaction.id}
            >

              {/* ==================================================
                  TRANSACTION HEADER
              ================================================== */}

              <div className="transaction-detail-header">

                <div>

                  <strong>
                    Transaction #{transaction.id}
                  </strong>

                  <span>
                    {formatCategory(transaction.category)}{" "}
                    •{" "}
                    {formatAmount(transaction.amount)}
                  </span>

                </div>


                <span
                  className={`decision-badge ${getDecisionClass(
                    transaction.decision
                  )}`}
                >
                  {transaction.decision}
                </span>

              </div>


              {/* ==================================================
                  EXISTING RISK REASONS
              ================================================== */}

              {transaction.reasons &&
              transaction.reasons.length > 0 ? (

                <ul className="reason-list">

                  {transaction.reasons.map(
                    (reason, index) => (

                      <li key={`${transaction.id}-reason-${index}`}>
                        {reason}
                      </li>

                    )
                  )}

                </ul>

              ) : (

                <p className="no-reasons">
                  No risk reasons were recorded.
                </p>

              )}


              {/* ==================================================
                  MACHINE LEARNING ANALYSIS
              ================================================== */}

              <div className="ml-analysis">

                <div className="ml-analysis-header">

                  <div>

                    <span className="ml-eyebrow">
                      MACHINE LEARNING
                    </span>

                    <h4>
                      Isolation Forest Analysis
                    </h4>

                  </div>


                  <span
                    className={`ml-status ${getMLStatusClass(
                      transaction
                    )}`}
                  >
                    {getMLStatus(transaction)}
                  </span>

                </div>


                {/* ML METRICS */}

                <div className="ml-analysis-grid">

                  {/* ML SCORE */}

                  <div className="ml-metric">

                    <span className="ml-metric-label">
                      ML Anomaly Score
                    </span>

                    <strong className="ml-metric-value">

                      {transaction.ml_score !== undefined &&
                      transaction.ml_score !== null
                        ? Number(transaction.ml_score).toFixed(2)
                        : "—"}

                    </strong>

                    <span className="ml-metric-description">
                      0 = normal • 100 = highly unusual
                    </span>

                  </div>


                  {/* ML LABEL */}

                  <div className="ml-metric">

                    <span className="ml-metric-label">
                      ML Risk Level
                    </span>

                    {transaction.ml_label ? (

                      <span
                        className={`risk-score ${getMLLabelClass(
                          transaction.ml_label
                        )}`}
                      >
                        {transaction.ml_label}
                      </span>

                    ) : (

                      <strong className="ml-metric-value">
                        —
                      </strong>

                    )}

                    <span className="ml-metric-description">
                      Isolation Forest classification
                    </span>

                  </div>


                  {/* ML ANOMALY */}

                  <div className="ml-metric">

                    <span className="ml-metric-label">
                      Detection
                    </span>

                    <strong className="ml-metric-value">
                      {getMLDetection(transaction)}
                    </strong>

                    <span className="ml-metric-description">
                      Statistical behavior signal
                    </span>

                  </div>

                </div>


                {/* ML EXPLANATION */}

                <div className="ml-explanation">

                  <span className="ml-explanation-label">
                    ML Explanation
                  </span>

                  <p>

                    {transaction.ml_reason
                      ? transaction.ml_reason
                      : "ML analysis details will appear here when this transaction is assessed through the ML risk pipeline."}

                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default Transactions;