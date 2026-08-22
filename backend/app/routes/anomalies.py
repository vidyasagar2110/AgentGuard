from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.schemas.anomaly import AgentAnomalyReport
from app.services.anomaly_detector import detect_agent_anomalies


router = APIRouter(
    prefix="/agents",
    tags=["Anomaly Detection"]
)


@router.get(
    "/{agent_id}/anomalies",
    response_model=AgentAnomalyReport
)
def get_agent_anomalies(
    agent_id: int,
    db: Session = Depends(get_db)
):

    agent = db.get(Agent, agent_id)

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    return detect_agent_anomalies(
        db,
        agent_id
    )