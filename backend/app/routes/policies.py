from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.models.policy import AgentPolicy
from app.schemas.policy import (
    PolicyCreate,
    PolicyResponse,
    PolicyUpdate,
)


router = APIRouter(
    prefix="/agents/{agent_id}/policy",
    tags=["Policies"]
)


def serialize_categories(value: list[str]) -> str | None:
    if not value:
        return None

    return ",".join(
        category.strip()
        for category in value
        if category.strip()
    ) or None


def deserialize_categories(value: str | None) -> list[str]:
    if not value:
        return []

    return [
        category.strip()
        for category in value.split(",")
        if category.strip()
    ]


def policy_to_response(policy: AgentPolicy) -> dict:
    return {
        "id": policy.id,
        "agent_id": policy.agent_id,
        "max_transaction_amount": policy.max_transaction_amount,
        "daily_spending_limit": policy.daily_spending_limit,
        "approval_threshold": policy.approval_threshold,
        "allowed_categories": deserialize_categories(
            policy.allowed_categories
        ),
        "blocked_categories": deserialize_categories(
            policy.blocked_categories
        ),
        "created_at": policy.created_at,
        "updated_at": policy.updated_at,
    }


@router.post(
    "",
    response_model=PolicyResponse,
    status_code=201
)
def create_policy(
    agent_id: int,
    policy_data: PolicyCreate,
    db: Session = Depends(get_db)
):
    agent = db.get(Agent, agent_id)

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    existing_policy = (
        db.query(AgentPolicy)
        .filter(AgentPolicy.agent_id == agent_id)
        .first()
    )

    if existing_policy:
        raise HTTPException(
            status_code=409,
            detail="Policy already exists for this agent"
        )

    policy = AgentPolicy(
        agent_id=agent_id,
        max_transaction_amount=policy_data.max_transaction_amount,
        daily_spending_limit=policy_data.daily_spending_limit,
        approval_threshold=policy_data.approval_threshold,
        allowed_categories=serialize_categories(
            policy_data.allowed_categories
        ),
        blocked_categories=serialize_categories(
            policy_data.blocked_categories
        ),
    )

    db.add(policy)
    db.commit()
    db.refresh(policy)

    return policy_to_response(policy)


@router.get(
    "",
    response_model=PolicyResponse
)
def get_policy(
    agent_id: int,
    db: Session = Depends(get_db)
):
    policy = (
        db.query(AgentPolicy)
        .filter(AgentPolicy.agent_id == agent_id)
        .first()
    )

    if not policy:
        raise HTTPException(
            status_code=404,
            detail="Policy not found"
        )

    return policy_to_response(policy)


@router.put(
    "",
    response_model=PolicyResponse
)
def update_policy(
    agent_id: int,
    policy_data: PolicyUpdate,
    db: Session = Depends(get_db)
):
    policy = (
        db.query(AgentPolicy)
        .filter(AgentPolicy.agent_id == agent_id)
        .first()
    )

    if not policy:
        raise HTTPException(
            status_code=404,
            detail="Policy not found"
        )

    policy.max_transaction_amount = (
        policy_data.max_transaction_amount
    )

    policy.daily_spending_limit = (
        policy_data.daily_spending_limit
    )

    policy.approval_threshold = (
        policy_data.approval_threshold
    )

    policy.allowed_categories = serialize_categories(
        policy_data.allowed_categories
    )

    policy.blocked_categories = serialize_categories(
        policy_data.blocked_categories
    )

    db.commit()
    db.refresh(policy)

    return policy_to_response(policy)