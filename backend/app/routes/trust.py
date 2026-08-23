from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.schemas.trust import AgentTrustScore
from app.services.trust_score import calculate_trust_score


router = APIRouter(
    prefix="/trust",
    tags=["Trust"]
)


@router.get(
    "/agent/{agent_id}",
    response_model=AgentTrustScore
)
def get_agent_trust_score(
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

    return calculate_trust_score(
        db=db,
        agent_id=agent_id
    )