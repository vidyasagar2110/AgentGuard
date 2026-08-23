from sqlalchemy.orm import Session

from app.models.agent import Agent
from app.services.anomaly_detector import detect_agent_anomalies
from app.services.behavior_analyzer import analyze_agent_behavior
from app.services.trust_score import calculate_trust_score


def build_agent_risk_profile(
    db: Session,
    agent_id: int
) -> dict:

    agent = db.get(
        Agent,
        agent_id
    )

    if not agent:
        raise ValueError(
            "Agent not found"
        )

    behavior = analyze_agent_behavior(
        db=db,
        agent_id=agent_id
    )

    trust = calculate_trust_score(
        db=db,
        agent_id=agent_id
    )

    anomalies = detect_agent_anomalies(
        db=db,
        agent_id=agent_id
    )

    reasons = list(
        behavior["reasons"]
    )

    if anomalies["anomalies_detected"] > 0:
        reasons.append(
            f'{anomalies["anomalies_detected"]} transaction anomalies detected'
        )

    return {
        "agent_id": agent.id,
        "agent_name": agent.name,
        "agent_status": agent.status,

        "trust_score": trust["trust_score"],
        "trust_status": trust["status"],

        "risk_score": behavior["risk_score"],
        "risk_level": behavior["risk_level"],

        "total_transactions": behavior["total_transactions"],
        "allowed_transactions": behavior["allowed_transactions"],
        "review_transactions": behavior["review_transactions"],
        "blocked_transactions": behavior["blocked_transactions"],

        "total_spending": behavior["total_spending"],
        "average_transaction": behavior["average_transaction"],
        "maximum_transaction": behavior["maximum_transaction"],

        "block_rate": behavior["block_rate"],
        "review_rate": behavior["review_rate"],

        "anomalies_detected": anomalies["anomalies_detected"],

        "recommendation": trust["recommendation"],
        "reasons": reasons
    }