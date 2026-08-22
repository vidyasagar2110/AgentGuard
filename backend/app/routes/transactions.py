from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.models.transaction import Transaction
from app.schemas.transaction import (
    TransactionEvaluate,
    TransactionResponse,
)
from app.services.risk_aggregator import assess_transaction_risk


router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


@router.post(
    "/evaluate",
    response_model=TransactionResponse,
    status_code=201
)
def evaluate(
    transaction_data: TransactionEvaluate,
    db: Session = Depends(get_db)
):

    agent = db.get(
        Agent,
        transaction_data.agent_id
    )

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    if agent.status in {"RESTRICTED", "SUSPENDED"}:
        raise HTTPException(
            status_code=403,
            detail=f"Agent is {agent.status} and cannot process transactions"
    )
    try:
        result = assess_transaction_risk(
            db=db,
            agent_id=transaction_data.agent_id,
            amount=transaction_data.amount,
            category=transaction_data.category
        )
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    transaction = Transaction(
        agent_id=transaction_data.agent_id,
        amount=transaction_data.amount,
        category=transaction_data.category,
        decision=result["decision"],
        risk_score=result["risk_score"],
        reasons=",".join(result["reasons"])
        if result["reasons"]
        else None,
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return {
        "id": transaction.id,
        "agent_id": transaction.agent_id,
        "amount": transaction.amount,
        "category": transaction.category,
        "decision": transaction.decision,
        "risk_score": transaction.risk_score,
        "reasons": result["reasons"],
        "evaluated_at": transaction.evaluated_at,
    }