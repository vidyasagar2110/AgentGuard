from sqlalchemy.orm import Session

from app.services.behavior_analyzer import analyze_agent_behavior


def calculate_trust_score(
    db: Session,
    agent_id: int
) -> dict:

    profile = analyze_agent_behavior(
        db,
        agent_id
    )

    risk_score = profile["risk_score"]
    trust_score = 100 - risk_score

    if risk_score >= 80:
        status = "RESTRICTED"
        recommendation = (
            "Agent requires human oversight"
        )
    elif risk_score >= 50:
        status = "MONITORED"
        recommendation = (
            "Agent should be monitored closely"
        )
    else:
        status = "TRUSTED"
        recommendation = (
            "Agent behavior is within acceptable limits"
        )

    return {
        "agent_id": agent_id,
        "trust_score": trust_score,
        "risk_score": risk_score,
        "risk_level": profile["risk_level"],
        "status": status,
        "recommendation": recommendation
    }