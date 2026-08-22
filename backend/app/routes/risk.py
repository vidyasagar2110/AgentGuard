from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.schemas.risk import (
    RiskAssessmentRequest,
    RiskAssessmentResponse
)
from app.services.risk_aggregator import assess_transaction_risk


router = APIRouter(
    prefix="/risk",
    tags=["Risk Assessment"]
)


@router.post(
    "/assess",
    response_model=RiskAssessmentResponse
)
def assess_risk(
    request: RiskAssessmentRequest,
    db: Session = Depends(get_db)
):

    agent = db.get(
        Agent,
        request.agent_id
    )

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    try:
        return assess_transaction_risk(
            db=db,
            agent_id=request.agent_id,
            amount=request.amount,
            category=request.category
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )