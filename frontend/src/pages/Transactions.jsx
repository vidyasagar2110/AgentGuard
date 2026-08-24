import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/transactions`);

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();

      // Backend may return either:
      // 1. An array directly
      // 2. { value: [...] }
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

  const allowed = transactions.filter(
    (transaction) => transaction.decision === "ALLOW"
  ).length;

  const review = transactions.filter(
    (transaction) => transaction.decision === "REVIEW"
  ).length;

  const blocked = transactions.filter(
    (transaction) => transaction.decision === "BLOCK"
  ).length;

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getDecisionClass = (decision) => {
    if (decision === "ALLOW") return "decision-allow";
    if (decision === "REVIEW") return "decision-review";
    return "decision-block";
  };

  const getRiskClass = (score) => {
    if (score >= 70) return "risk-high";
    if (score >= 40) return "risk-medium";
    return "risk-low";
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

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

  return (
    <div>

      {/* PAGE HEADER */}

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
        >
          ↻ Refresh
        </button>

      </div>


      {/* STATISTICS */}

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


      {/* TRANSACTION HISTORY */}

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
            {transactions.length} Records
          </span>

        </div>


        <div className="transaction-table-wrapper">

          {transactions.length === 0 ? (

            <div className="empty-state">
              <h3>No transactions found</h3>
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

                    <td>
                      <span className="transaction-id">
                        #{transaction.id}
                      </span>
                    </td>


                    <td>
                      <span className="agent-reference">
                        Agent {transaction.agent_id}
                      </span>
                    </td>


                    <td>
                      <strong className="amount">
                        {formatAmount(transaction.amount)}
                      </strong>
                    </td>


                    <td>
                      <span className="category-badge">
                        {transaction.category || "—"}
                      </span>
                    </td>


                    <td>

                      <span
                        className={`decision-badge ${getDecisionClass(
                          transaction.decision
                        )}`}
                      >
                        {transaction.decision}
                      </span>

                    </td>


                    <td>

                      <span
                        className={`risk-score ${getRiskClass(
                          transaction.risk_score
                        )}`}
                      >
                        {transaction.risk_score}
                      </span>

                    </td>


                    <td className="date-cell">
                      {formatDate(transaction.evaluated_at)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </section>


      {/* RISK ASSESSMENT DETAILS */}

      <section className="panel transaction-reasons-panel">

        <div className="panel-header">

          <div>

            <h3>
              Risk Assessment Details
            </h3>

            <p>
              Reasons generated by the transaction risk engine.
            </p>

          </div>

        </div>


        <div className="transaction-details-list">

          {transactions.slice(0, 5).map((transaction) => (

            <div
              className="transaction-detail"
              key={transaction.id}
            >

              <div className="transaction-detail-header">

                <div>

                  <strong>
                    Transaction #{transaction.id}
                  </strong>

                  <span>
                    {transaction.category || "Unknown"} •{" "}
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


              {transaction.reasons &&
              transaction.reasons.length > 0 ? (

                <ul className="reason-list">

                  {transaction.reasons.map(
                    (reason, index) => (
                      <li key={index}>
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

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default Transactions;