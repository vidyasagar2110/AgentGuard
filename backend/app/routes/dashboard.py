from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.models.transaction import Transaction
from app.services.behavior_analyzer import analyze_agent_behavior


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

    return {
        "total_agents": total_agents,
        "active_agents": active_agents,
        "monitored_agents": monitored_agents,
        "restricted_agents": restricted_agents,
        "suspended_agents": suspended_agents,
        "total_transactions": total_transactions,
        "blocked_transactions": blocked_transactions,
        "review_transactions": review_transactions,
        "allowed_transactions": allowed_transactions
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