from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogResponse


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"]
)


@router.get(
    "",
    response_model=list[AuditLogResponse]
)
def get_audit_logs(
    action: str | None = None,
    entity_type: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)

    if action:
        query = query.filter(
            AuditLog.action == action.upper()
        )

    if entity_type:
        query = query.filter(
            AuditLog.entity_type == entity_type.upper()
        )

    return (
        query
        .order_by(
            AuditLog.created_at.desc()
        )
        .all()
    )


@router.get(
    "/agent/{agent_id}",
    response_model=list[AuditLogResponse]
)
def get_agent_audit_logs(
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
        db.query(AuditLog)
        .filter(
            AuditLog.agent_id == agent_id
        )
        .order_by(
            AuditLog.created_at.desc()
        )
        .all()
    )


@router.get(
    "/{log_id}",
    response_model=AuditLogResponse
)
def get_audit_log(
    log_id: int,
    db: Session = Depends(get_db)
):
    audit_log = db.get(
        AuditLog,
        log_id
    )

    if not audit_log:
        raise HTTPException(
            status_code=404,
            detail="Audit log not found"
        )

    return audit_log