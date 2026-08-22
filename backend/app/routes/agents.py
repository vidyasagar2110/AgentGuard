from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.schemas.agent import (
    AgentCreate,
    AgentResponse,
    AgentStatusUpdate
)


router = APIRouter(
    prefix="/agents",
    tags=["Agents"]
)


@router.post(
    "",
    response_model=AgentResponse,
    status_code=201
)
def create_agent(
    agent_data: AgentCreate,
    db: Session = Depends(get_db)
):
    existing_agent = (
        db.query(Agent)
        .filter(Agent.name == agent_data.name)
        .first()
    )

    if existing_agent:
        raise HTTPException(
            status_code=409,
            detail="Agent with this name already exists"
        )

    agent = Agent(
        name=agent_data.name,
        description=agent_data.description
    )

    db.add(agent)
    db.commit()
    db.refresh(agent)

    return agent


@router.get(
    "",
    response_model=list[AgentResponse]
)
def get_agents(
    db: Session = Depends(get_db)
):
    return db.query(Agent).order_by(Agent.id).all()


@router.get(
    "/{agent_id}",
    response_model=AgentResponse
)
def get_agent(
    agent_id: int,
    db: Session = Depends(get_db)
):
    agent = db.get(Agent, agent_id)

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    return agent


@router.patch(
    "/{agent_id}/status",
    response_model=AgentResponse
)
def update_agent_status(
    agent_id: int,
    status_data: AgentStatusUpdate,
    db: Session = Depends(get_db)
):
    agent = db.get(Agent, agent_id)

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    agent.status = status_data.status.value

    db.commit()
    db.refresh(agent)

    return agent