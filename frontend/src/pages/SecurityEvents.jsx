import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function SecurityEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/security-events`);

      if (!response.ok) {
        throw new Error("Failed to fetch security events");
      }

      const data = await response.json();

      const eventData = Array.isArray(data)
        ? data
        : data.value || [];

      setEvents(eventData);
    } catch (err) {
      console.error("Security events error:", err);
      setError("Unable to load security events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const high = events.filter(
    (event) => event.severity === "HIGH"
  ).length;

  const medium = events.filter(
    (event) => event.severity === "MEDIUM"
  ).length;

  const low = events.filter(
    (event) => event.severity === "LOW"
  ).length;

  const blocked = events.filter(
    (event) => event.event_type === "TRANSACTION_BLOCKED"
  ).length;

  const review = events.filter(
    (event) => event.event_type === "TRANSACTION_REVIEW"
  ).length;

  const anomalies = events.filter(
    (event) => event.event_type === "ANOMALY_DETECTED"
  ).length;

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

  const formatEventType = (type) => {
    if (!type) return "UNKNOWN";

    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading security events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <div className="error-icon">!</div>

        <h3>Security Event Loading Error</h3>

        <p>{error}</p>

        <button onClick={fetchEvents}>
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
            SECURITY MONITORING
          </p>

          <h2>
            Security Events
          </h2>

          <p className="subtitle">
            Monitor security incidents and risk-engine activity.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchEvents}
        >
          ↻ Refresh
        </button>

      </div>


      {/* STATISTICS */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-header">
            <span className="stat-title">
              Total Events
            </span>

            <div className="stat-icon purple">
              ⚠
            </div>
          </div>

          <div className="stat-value">
            {events.length}
          </div>

          <div className="stat-details">
            <span>
              Recorded security events
            </span>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-header">
            <span className="stat-title">
              High Severity
            </span>

            <div className="stat-icon red">
              !
            </div>
          </div>

          <div className="stat-value danger-text">
            {high}
          </div>

          <div className="stat-details">
            <span className="danger-text">
              Requires attention
            </span>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-header">
            <span className="stat-title">
              Medium Severity
            </span>

            <div className="stat-icon yellow">
              !
            </div>
          </div>

          <div className="stat-value review-number">
            {medium}
          </div>

          <div className="stat-details">
            <span>
              Monitoring required
            </span>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-header">
            <span className="stat-title">
              Low Severity
            </span>

            <div className="stat-icon green">
              ✓
            </div>
          </div>

          <div className="stat-value positive">
            {low}
          </div>

          <div className="stat-details">
            <span className="positive">
              Normal activity
            </span>
          </div>

        </div>

      </div>


      {/* EVENT TYPE SUMMARY */}

      <section className="panel security-events-summary">

        <div className="panel-header">

          <div>
            <h3>
              Event Classification
            </h3>

            <p>
              Security activity categorized by event type.
            </p>
          </div>

          <span className="security-badge">
            Live Monitoring
          </span>

        </div>


        <div className="security-grid">

          <div className="security-item high">

            <span>
              Transactions Blocked
            </span>

            <strong>
              {blocked}
            </strong>

          </div>


          <div className="security-item medium">

            <span>
              Transactions in Review
            </span>

            <strong>
              {review}
            </strong>

          </div>


          <div className="security-item low">

            <span>
              Anomalies Detected
            </span>

            <strong>
              {anomalies}
            </strong>

          </div>

        </div>

      </section>


      {/* SECURITY EVENT TABLE */}

      <section className="panel">

        <div className="panel-header">

          <div>
            <h3>
              Security Event History
            </h3>

            <p>
              Latest events generated by the AgentGuard security engine.
            </p>
          </div>

          <span className="security-badge">
            {events.length} Events
          </span>

        </div>


        <div className="transaction-table-wrapper">

          {events.length === 0 ? (

            <div className="empty-state">
              <h3>No security events</h3>

              <p>
                No security events have been recorded.
              </p>
            </div>

          ) : (

            <table className="transaction-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Event</th>
                  <th>Severity</th>
                  <th>Agent</th>
                  <th>Transaction</th>
                  <th>Message</th>
                  <th>Created At</th>
                </tr>

              </thead>


              <tbody>

                {events.map((event) => (

                  <tr key={event.id}>

                    <td>
                      <span className="transaction-id">
                        #{event.id}
                      </span>
                    </td>


                    <td>
                      <strong>
                        {formatEventType(event.event_type)}
                      </strong>
                    </td>


                    <td>

                      <span
                        className={`severity-badge ${getSeverityClass(
                          event.severity
                        )}`}
                      >
                        {event.severity || "N/A"}
                      </span>

                    </td>


                    <td>
                      <span className="agent-reference">
                        Agent {event.agent_id}
                      </span>
                    </td>


                    <td>

                      <span className="transaction-id">
                        {event.transaction_id
                          ? `#${event.transaction_id}`
                          : "—"}
                      </span>

                    </td>


                    <td className="event-message">
                      {event.message}
                    </td>


                    <td className="date-cell">
                      {formatDate(event.created_at)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </section>


      {/* EVENT DETAILS */}

      <section className="panel">

        <div className="panel-header">

          <div>
            <h3>
              Recent Security Activity
            </h3>

            <p>
              Detailed messages from the latest security events.
            </p>
          </div>

        </div>


        <div className="security-activity-list">

          {events.map((event) => (

            <div
              className="security-activity"
              key={`activity-${event.id}`}
            >

              <div
                className={`activity-indicator ${getSeverityClass(
                  event.severity
                )}`}
              >
                !
              </div>


              <div className="activity-content">

                <div className="activity-header">

                  <strong>
                    {formatEventType(event.event_type)}
                  </strong>

                  <span
                    className={`severity-badge ${getSeverityClass(
                      event.severity
                    )}`}
                  >
                    {event.severity || "N/A"}
                  </span>

                </div>


                <p>
                  {event.message}
                </p>


                <span className="activity-meta">
                  Agent {event.agent_id}
                  {" • "}
                  {event.transaction_id
                    ? `Transaction #${event.transaction_id}`
                    : "No transaction"}
                  {" • "}
                  {formatDate(event.created_at)}
                </span>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default SecurityEvents;