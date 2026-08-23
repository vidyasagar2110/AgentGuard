from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.profile import AgentRiskProfile
from app.services.risk_profile import build_agent_risk_profile


router = APIRouter(
    prefix="/agents",
    tags=["Agent Risk Profile"]
)


@router.get(
    "/{agent_id}/risk-profile",
    response_model=AgentRiskProfile
)
def get_agent_risk_profile(
    agent_id: int,
    db: Session = Depends(get_db)
):
    try:
        return build_agent_risk_profile(
            db=db,
            agent_id=agent_id
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )