from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.models.audit_log import AuditLog
from app.models.security_event import SecurityEvent
from app.models.transaction import Transaction
from app.services.behavior_analyzer import analyze_agent_behavior
from app.services.trust_score import calculate_trust_score


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/overview")
def get_dashboard_overview(
    db: Session = Depends(get_db)
):
    total_agents = (
        db.query(Agent)
        .count()
    )

    active_agents = (
        db.query(Agent)
        .filter(
            Agent.status == "ACTIVE"
        )
        .count()
    )

    monitored_agents = (
        db.query(Agent)
        .filter(
            Agent.status == "MONITORED"
        )
        .count()
    )

    restricted_agents = (
        db.query(Agent)
        .filter(
            Agent.status == "RESTRICTED"
        )
        .count()
    )

    suspended_agents = (
        db.query(Agent)
        .filter(
            Agent.status == "SUSPENDED"
        )
        .count()
    )

    total_transactions = (
        db.query(Transaction)
        .count()
    )

    blocked_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.decision == "BLOCK"
        )
        .count()
    )

    review_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.decision == "REVIEW"
        )
        .count()
    )

    allowed_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.decision == "ALLOW"
        )
        .count()
    )

    total_security_events = (
        db.query(SecurityEvent)
        .count()
    )

    high_security_events = (
        db.query(SecurityEvent)
        .filter(
            SecurityEvent.severity == "HIGH"
        )
        .count()
    )

    medium_security_events = (
        db.query(SecurityEvent)
        .filter(
            SecurityEvent.severity == "MEDIUM"
        )
        .count()
    )

    low_security_events = (
        db.query(SecurityEvent)
        .filter(
            SecurityEvent.severity == "LOW"
        )
        .count()
    )

    total_audit_logs = (
        db.query(AuditLog)
        .count()
    )

    return {
        "agents": {
            "total": total_agents,
            "active": active_agents,
            "monitored": monitored_agents,
            "restricted": restricted_agents,
            "suspended": suspended_agents
        },
        "transactions": {
            "total": total_transactions,
            "allowed": allowed_transactions,
            "review": review_transactions,
            "blocked": blocked_transactions
        },
        "security": {
            "total_events": total_security_events,
            "high": high_security_events,
            "medium": medium_security_events,
            "low": low_security_events
        },
        "audit": {
            "total_logs": total_audit_logs
        }
    }


@router.get("/high-risk-agents")
def get_high_risk_agents(
    db: Session = Depends(get_db)
):
    agents = (
        db.query(Agent)
        .order_by(Agent.id)
        .all()
    )

    high_risk_agents = []

    for agent in agents:

        behavior = analyze_agent_behavior(
            db=db,
            agent_id=agent.id
        )

        if behavior["risk_level"] in {
            "HIGH",
            "MEDIUM"
        }:
            high_risk_agents.append({
                "agent_id": agent.id,
                "agent_name": agent.name,
                "risk_score": behavior["risk_score"],
                "risk_level": behavior["risk_level"],
                "total_transactions": behavior[
                    "total_transactions"
                ]
            })

    high_risk_agents.sort(
        key=lambda item: item["risk_score"],
        reverse=True
    )

    return high_risk_agents



@router.get("/risk-summary")
def get_risk_summary(
    db: Session = Depends(get_db)
):
    agents = (
        db.query(Agent)
        .order_by(Agent.id)
        .all()
    )

    summary = {
        "total_agents": len(agents),
        "high_risk": 0,
        "medium_risk": 0,
        "low_risk": 0
    }

    for agent in agents:
        behavior = analyze_agent_behavior(
            db=db,
            agent_id=agent.id
        )

        risk_level = behavior["risk_level"]

        if risk_level == "HIGH":
            summary["high_risk"] += 1

        elif risk_level == "MEDIUM":
            summary["medium_risk"] += 1

        elif risk_level == "LOW":
            summary["low_risk"] += 1

    return summary

@router.get("/risk-agents")
def get_risk_agents(
    db: Session = Depends(get_db)
):
    agents = (
        db.query(Agent)
        .order_by(Agent.id)
        .all()
    )

    risk_agents = []

    for agent in agents:
        behavior = analyze_agent_behavior(
            db=db,
            agent_id=agent.id
        )

        trust = calculate_trust_score(
            db=db,
            agent_id=agent.id
        )

        risk_agents.append({
            "agent_id": agent.id,
            "agent_name": agent.name,
            "risk_score": behavior["risk_score"],
            "risk_level": behavior["risk_level"],
            "trust_score": trust["trust_score"],
            "trust_status": trust["status"],
            "total_transactions": behavior[
                "total_transactions"
            ],
            "blocked_transactions": behavior[
                "blocked_transactions"
            ],
            "review_transactions": behavior[
                "review_transactions"
            ]
        })

    risk_agents.sort(
        key=lambda item: item["risk_score"],
        reverse=True
    )

    return risk_agents


@router.get("/recent-activity")
def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    security_events = (
        db.query(SecurityEvent)
        .order_by(
            SecurityEvent.created_at.desc()
        )
        .limit(limit)
        .all()
    )

    audit_logs = (
        db.query(AuditLog)
        .order_by(
            AuditLog.created_at.desc()
        )
        .limit(limit)
        .all()
    )

    activities = []

    for event in security_events:
        activities.append({
            "id": event.id,
            "source": "SECURITY_EVENT",
            "agent_id": event.agent_id,
            "transaction_id": event.transaction_id,
            "activity_type": event.event_type,
            "severity": event.severity,
            "message": event.message,
            "created_at": event.created_at
        })

    for log in audit_logs:
        activities.append({
            "id": log.id,
            "source": "AUDIT_LOG",
            "agent_id": log.agent_id,
            "transaction_id": log.transaction_id,
            "activity_type": log.action,
            "severity": None,
            "message": log.details or "",
            "created_at": log.created_at
        })

    activities.sort(
        key=lambda activity: activity["created_at"],
        reverse=True
    )

    return activities[:limit]

@router.get("/security-summary")
def get_security_summary(
    db: Session = Depends(get_db)
):
    total_events = (
        db.query(SecurityEvent)
        .count()
    )

    high_events = (
        db.query(SecurityEvent)
        .filter(
            SecurityEvent.severity == "HIGH"
        )
        .count()
    )

    medium_events = (
        db.query(SecurityEvent)
        .filter(
            SecurityEvent.severity == "MEDIUM"
        )
        .count()
    )

    low_events = (
        db.query(SecurityEvent)
        .filter(
            SecurityEvent.severity == "LOW"
        )
        .count()
    )

    blocked_events = (
        db.query(SecurityEvent)
        .filter(
            SecurityEvent.event_type == "TRANSACTION_BLOCKED"
        )
        .count()
    )

    review_events = (
        db.query(SecurityEvent)
        .filter(
            SecurityEvent.event_type == "TRANSACTION_REVIEW"
        )
        .count()
    )

    anomaly_events = (
        db.query(SecurityEvent)
        .filter(
            SecurityEvent.event_type == "ANOMALY_DETECTED"
        )
        .count()
    )

    return {
        "total_events": total_events,
        "high_events": high_events,
        "medium_events": medium_events,
        "low_events": low_events,
        "blocked_events": blocked_events,
        "review_events": review_events,
        "anomaly_events": anomaly_events
    }