from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionResponse


router = APIRouter(
    prefix="/transactions",
    tags=["Transaction History"]
)


def transaction_to_response(
    transaction: Transaction
) -> dict:
    return {
        "id": transaction.id,
        "agent_id": transaction.agent_id,
        "amount": transaction.amount,
        "category": transaction.category,
        "decision": transaction.decision,
        "risk_score": transaction.risk_score,
        "reasons": (
            [
                reason.strip()
                for reason in transaction.reasons.split(",")
                if reason.strip()
            ]
            if transaction.reasons
            else []
        ),
        "evaluated_at": transaction.evaluated_at,
    }


@router.get(
    "",
    response_model=list[TransactionResponse]
)
def get_transactions(
    db: Session = Depends(get_db)
):
    transactions = (
        db.query(Transaction)
        .order_by(Transaction.evaluated_at.desc())
        .all()
    )

    return [
        transaction_to_response(transaction)
        for transaction in transactions
    ]


@router.get(
    "/agent/{agent_id}",
    response_model=list[TransactionResponse]
)
def get_agent_transactions(
    agent_id: int,
    db: Session = Depends(get_db)
):
    agent = db.get(Agent, agent_id)

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    transactions = (
        db.query(Transaction)
        .filter(Transaction.agent_id == agent_id)
        .order_by(Transaction.evaluated_at.desc())
        .all()
    )

    return [
        transaction_to_response(transaction)
        for transaction in transactions
    ]