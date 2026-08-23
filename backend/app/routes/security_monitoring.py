from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.models.audit_log import AuditLog
from app.models.security_event import SecurityEvent
from app.schemas.security_monitoring import SecurityActivityResponse


router = APIRouter(
    prefix="/security-monitoring",
    tags=["Security Monitoring"]
)


def build_security_activity(
    security_event: SecurityEvent
) -> dict:
    return {
        "id": security_event.id,
        "source": "SECURITY_EVENT",
        "agent_id": security_event.agent_id,
        "transaction_id": security_event.transaction_id,
        "activity_type": security_event.event_type,
        "severity": security_event.severity,
        "message": security_event.message,
        "created_at": security_event.created_at,
    }


def build_audit_activity(
    audit_log: AuditLog
) -> dict:
    return {
        "id": audit_log.id,
        "source": "AUDIT_LOG",
        "agent_id": audit_log.agent_id,
        "transaction_id": audit_log.transaction_id,
        "activity_type": audit_log.action,
        "severity": None,
        "message": audit_log.details or "",
        "created_at": audit_log.created_at,
    }


@router.get(
    "",
    response_model=list[SecurityActivityResponse]
)
def get_security_monitoring(
    agent_id: int | None = None,
    severity: str | None = None,
    event_type: str | None = None,
    db: Session = Depends(get_db)
):
    if severity:
        severity = severity.upper()

        if severity not in {
            "LOW",
            "MEDIUM",
            "HIGH"
        }:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid severity. "
                    "Use LOW, MEDIUM, or HIGH"
                )
            )

    if event_type:
        event_type = event_type.upper()

    if agent_id is not None:
        agent = db.get(
            Agent,
            agent_id
        )

        if not agent:
            raise HTTPException(
                status_code=404,
                detail="Agent not found"
            )

    security_query = db.query(SecurityEvent)

    if agent_id is not None:
        security_query = security_query.filter(
            SecurityEvent.agent_id == agent_id
        )

    if severity:
        security_query = security_query.filter(
            SecurityEvent.severity == severity
        )

    if event_type:
        security_query = security_query.filter(
            SecurityEvent.event_type == event_type
        )

    security_events = security_query.all()

    activities = []

    activities.extend(
        build_security_activity(event)
        for event in security_events
    )

    if not severity and not event_type:
        audit_query = db.query(AuditLog)

        if agent_id is not None:
            audit_query = audit_query.filter(
                AuditLog.agent_id == agent_id
            )

        audit_logs = audit_query.all()

        activities.extend(
            build_audit_activity(log)
            for log in audit_logs
        )

    activities.sort(
        key=lambda activity: activity["created_at"],
        reverse=True
    )

    return activities