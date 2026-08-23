from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: int | None = None,
    agent_id: int | None = None,
    transaction_id: int | None = None,
    details: str | None = None
) -> AuditLog:

    audit_log = AuditLog(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        agent_id=agent_id,
        transaction_id=transaction_id,
        details=details
    )

    db.add(audit_log)
    db.flush()

    return audit_log