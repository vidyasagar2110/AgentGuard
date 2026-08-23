from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.models.security_event import SecurityEvent
from app.schemas.security_event import SecurityEventResponse


router = APIRouter(
    prefix="/security-events",
    tags=["Security Events"]
)


@router.get(
    "",
    response_model=list[SecurityEventResponse]
)
def get_security_events(
    severity: str | None = None,
    event_type: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(SecurityEvent)

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

        query = query.filter(
            SecurityEvent.severity == severity
        )

    if event_type:
        event_type = event_type.upper()

        query = query.filter(
            SecurityEvent.event_type == event_type
        )

    return (
        query
        .order_by(SecurityEvent.created_at.desc())
        .all()
    )


@router.get(
    "/agent/{agent_id}",
    response_model=list[SecurityEventResponse]
)
def get_agent_security_events(
    agent_id: int,
    db: Session = Depends(get_db)
):
    agent = db.get(
        Agent,
        agent_id
    )

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    return (
        db.query(SecurityEvent)
        .filter(
            SecurityEvent.agent_id == agent_id
        )
        .order_by(SecurityEvent.created_at.desc())
        .all()
    )


@router.get(
    "/{event_id}",
    response_model=SecurityEventResponse
)
def get_security_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    event = db.get(
        SecurityEvent,
        event_id
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Security event not found"
        )

    return event