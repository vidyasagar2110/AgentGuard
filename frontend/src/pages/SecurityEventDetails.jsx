import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function SecurityEventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/security-events/${eventId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load security event");
      }

      const data = await response.json();
      setEvent(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load security event.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [eventId]);

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

  const formatEventType = (eventType) => {
    if (!eventType) return "Unknown";

    return eventType
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading security event...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <div className="error-icon">!</div>

        <h2>Unable to load security event</h2>

        <p>{error}</p>

        <button onClick={loadEvent}>Retry</button>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="page-content security-event-page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <p className="eyebrow">SECURITY INTELLIGENCE</p>

          <h2>Security Event #{event.id}</h2>

          <p className="subtitle">
            Detailed security event investigation and context.
          </p>
        </div>

        <div className="agent-detail-actions">
          <button
            className="refresh-button"
            onClick={loadEvent}
          >
            ↻ Refresh
          </button>

          <button
            className="back-button"
            onClick={() => navigate("/security-events")}
          >
            ← Back to Security Events
          </button>
        </div>
      </div>

      {/* EVENT SUMMARY */}
      <section className="panel security-event-summary">

        <div className="event-summary-header">

          <div className="security-event-icon">
            ⚠
          </div>

          <div className="event-summary-info">
            <span className="intelligence-label">
              Event Type
            </span>

            <h3>
              {formatEventType(event.event_type)}
            </h3>
          </div>

          <span
            className={`severity-badge ${getSeverityClass(
              event.severity
            )}`}
          >
            {event.severity}
          </span>

        </div>

        <div className="event-message">
          <span className="intelligence-label">
            Security Message
          </span>

          <p>{event.message}</p>
        </div>

      </section>

      {/* EVENT DETAILS */}
      <section className="panel">

        <div className="panel-header">
          <div>
            <h3>Event Details</h3>

            <p>
              Context associated with this security event.
            </p>
          </div>
        </div>

        <div className="event-details-grid">

          <div className="event-detail-card">
            <span>Event ID</span>
            <strong>#{event.id}</strong>
          </div>

          <div className="event-detail-card">
            <span>Agent ID</span>
            <strong>#{event.agent_id}</strong>
          </div>

          <div className="event-detail-card">
            <span>Transaction ID</span>
            <strong>#{event.transaction_id}</strong>
          </div>

          <div className="event-detail-card">
            <span>Severity</span>

            <strong
              className={`detail-severity ${getSeverityClass(
                event.severity
              )}`}
            >
              {event.severity}
            </strong>
          </div>

          <div className="event-detail-card">
            <span>Event Type</span>

            <strong>
              {formatEventType(event.event_type)}
            </strong>
          </div>

          <div className="event-detail-card">
            <span>Created At</span>

            <strong>
              {formatDate(event.created_at)}
            </strong>
          </div>

        </div>

      </section>

      {/* RELATED TRANSACTION */}
      <section className="panel">

        <div className="panel-header">
          <div>
            <h3>Related Transaction</h3>

            <p>
              Investigate the transaction associated with this event.
            </p>
          </div>
        </div>

        <div className="security-event-action">

          <div className="related-transaction-info">
            <span className="intelligence-label">
              Transaction
            </span>

            <strong>
              #{event.transaction_id}
            </strong>
          </div>

          <button
            className="transaction-action-button"
            onClick={() =>
              navigate(
                `/transactions/${event.transaction_id}`
              )
            }
          >
            View Transaction →
          </button>

        </div>

      </section>

    </div>
  );
}

export default SecurityEventDetails;