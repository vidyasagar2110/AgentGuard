from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.schemas.behavior import AgentRiskProfile
from app.schemas.trust import AgentTrustScore
from app.services.behavior_analyzer import analyze_agent_behavior
from app.services.trust_score import calculate_trust_score

router = APIRouter(
    prefix="/agents",
    tags=["Agent Behavior"]
)


@router.get(
    "/{agent_id}/risk-profile",
    response_model=AgentRiskProfile
)
def get_agent_risk_profile(
    agent_id: int,
    db: Session = Depends(get_db)
):

    agent = db.get(Agent, agent_id)

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    return analyze_agent_behavior(
        db,
        agent_id
    )
@router.get(
    "/{agent_id}/trust-score",
    response_model=AgentTrustScore
)
def get_agent_trust_score(
    agent_id: int,
    db: Session = Depends(get_db)
):

    agent = db.get(Agent, agent_id)

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    return calculate_trust_score(
        db,
        agent_id
    )