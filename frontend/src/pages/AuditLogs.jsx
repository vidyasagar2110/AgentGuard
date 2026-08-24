import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/audit-logs`);

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const data = await response.json();

      const logData = Array.isArray(data)
        ? data
        : data.value || [];

      setLogs(logData);
    } catch (err) {
      console.error("Audit logs error:", err);
      setError("Unable to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const transactionLogs = logs.filter(
    (log) => log.entity_type === "TRANSACTION"
  ).length;

  const agentLogs = logs.filter(
    (log) => log.entity_type === "AGENT"
  ).length;

  const formatAction = (action) => {
    if (!action) return "UNKNOWN";

    return action
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getActionClass = (action) => {
    if (action === "TRANSACTION_EVALUATED") {
      return "audit-transaction";
    }

    if (action === "AGENT_STATUS_CHANGED") {
      return "audit-agent";
    }

    return "audit-default";
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading audit logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <div className="error-icon">!</div>

        <h3>Audit Log Loading Error</h3>

        <p>{error}</p>

        <button onClick={fetchLogs}>
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
            AUDIT & COMPLIANCE
          </p>

          <h2>
            Audit Logs
          </h2>

          <p className="subtitle">
            Track important actions and decisions recorded by AgentGuard.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchLogs}
        >
          ↻ Refresh
        </button>

      </div>


      {/* STATISTICS */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-header">
            <span className="stat-title">
              Total Audit Logs
            </span>

            <div className="stat-icon purple">
              ▤
            </div>
          </div>

          <div className="stat-value">
            {logs.length}
          </div>

          <div className="stat-details">
            <span>
              Recorded activities
            </span>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-header">
            <span className="stat-title">
              Transaction Logs
            </span>

            <div className="stat-icon blue">
              ↔
            </div>
          </div>

          <div className="stat-value">
            {transactionLogs}
          </div>

          <div className="stat-details">
            <span>
              Transaction evaluations
            </span>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-header">
            <span className="stat-title">
              Agent Logs
            </span>

            <div className="stat-icon green">
              ◉
            </div>
          </div>

          <div className="stat-value positive">
            {agentLogs}
          </div>

          <div className="stat-details">
            <span className="positive">
              Agent activity
            </span>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-header">
            <span className="stat-title">
              Latest Activity
            </span>

            <div className="stat-icon red">
              !
            </div>
          </div>

          <div className="stat-value">
            {logs.length > 0 ? "Live" : "—"}
          </div>

          <div className="stat-details">
            <span>
              Audit monitoring
            </span>
          </div>

        </div>

      </div>


      {/* AUDIT LOG TABLE */}

      <section className="panel">

        <div className="panel-header">

          <div>
            <h3>
              Audit History
            </h3>

            <p>
              Chronological record of important AgentGuard actions.
            </p>
          </div>

          <span className="security-badge">
            {logs.length} Logs
          </span>

        </div>


        <div className="transaction-table-wrapper">

          {logs.length === 0 ? (

            <div className="empty-state">

              <h3>
                No audit logs
              </h3>

              <p>
                No audit activity has been recorded yet.
              </p>

            </div>

          ) : (

            <table className="transaction-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Agent</th>
                  <th>Transaction</th>
                  <th>Details</th>
                  <th>Created At</th>
                </tr>

              </thead>


              <tbody>

                {logs.map((log) => (

                  <tr key={log.id}>

                    <td>
                      <span className="transaction-id">
                        #{log.id}
                      </span>
                    </td>


                    <td>

                      <span
                        className={`audit-action ${getActionClass(
                          log.action
                        )}`}
                      >
                        {formatAction(log.action)}
                      </span>

                    </td>


                    <td>
                      <span className="category-badge">
                        {log.entity_type}
                      </span>
                    </td>


                    <td>
                      <span className="agent-reference">
                        Agent {log.agent_id}
                      </span>
                    </td>


                    <td>

                      <span className="transaction-id">
                        {log.transaction_id
                          ? `#${log.transaction_id}`
                          : "—"}
                      </span>

                    </td>


                    <td className="event-message">
                      {log.details || "—"}
                    </td>


                    <td className="date-cell">
                      {formatDate(log.created_at)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </section>


      {/* AUDIT TIMELINE */}

      <section className="panel audit-timeline-panel">

        <div className="panel-header">

          <div>
            <h3>
              Recent Audit Activity
            </h3>

            <p>
              Detailed view of the latest recorded actions.
            </p>
          </div>

        </div>


        <div className="audit-timeline">

          {logs.map((log) => (

            <div
              className="audit-timeline-item"
              key={`timeline-${log.id}`}
            >

              <div
                className={`audit-timeline-icon ${getActionClass(
                  log.action
                )}`}
              >
                {log.entity_type === "TRANSACTION"
                  ? "↔"
                  : "◉"}
              </div>


              <div className="audit-timeline-content">

                <div className="audit-timeline-header">

                  <strong>
                    {formatAction(log.action)}
                  </strong>

                  <span className="audit-time">
                    {formatDate(log.created_at)}
                  </span>

                </div>


                <p>
                  {log.details || "No additional details available."}
                </p>


                <span className="activity-meta">
                  Agent {log.agent_id}
                  {" • "}
                  {log.entity_type}
                  {" #"}
                  {log.entity_id}
                  {log.transaction_id
                    ? ` • Transaction #${log.transaction_id}`
                    : ""}
                </span>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default AuditLogs;