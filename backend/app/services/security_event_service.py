from sqlalchemy.orm import Session

from app.models.security_event import SecurityEvent


def create_security_event(
    db: Session,
    agent_id: int,
    transaction_id: int | None,
    event_type: str,
    severity: str,
    message: str
) -> SecurityEvent:

    event = SecurityEvent(
        agent_id=agent_id,
        transaction_id=transaction_id,
        event_type=event_type,
        severity=severity,
        message=message
    )

    db.add(event)
    db.flush()

    return event