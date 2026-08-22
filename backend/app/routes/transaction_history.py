from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.models.transaction import Transaction
from app.schemas.transaction import (
    TransactionResponse,
    TransactionExplanation
)


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
    agent_id: int | None = None,
    decision: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)

    if agent_id is not None:
        if agent_id <= 0:
            raise HTTPException(
                status_code=400,
                detail="Agent ID must be greater than 0"
            )

        agent = db.get(
            Agent,
            agent_id
        )

        if not agent:
            raise HTTPException(
                status_code=404,
                detail="Agent not found"
            )

        query = query.filter(
            Transaction.agent_id == agent_id
        )

    if decision:
        decision = decision.upper()

        if decision not in {
            "ALLOW",
            "REVIEW",
            "BLOCK"
        }:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid decision. "
                    "Use ALLOW, REVIEW, or BLOCK"
                )
            )

        query = query.filter(
            Transaction.decision == decision
        )

    transactions = (
        query
        .order_by(
            Transaction.evaluated_at.desc()
        )
        .all()
    )

    return [
        transaction_to_response(transaction)
        for transaction in transactions
    ]


@router.get(
    "/agent/{agent_id}/summary"
)
def get_agent_transaction_summary(
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

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.agent_id == agent_id
        )
        .all()
    )

    total_transactions = len(transactions)

    total_spending = sum(
        transaction.amount
        for transaction in transactions
    )

    allowed = sum(
        1
        for transaction in transactions
        if transaction.decision == "ALLOW"
    )

    reviews = sum(
        1
        for transaction in transactions
        if transaction.decision == "REVIEW"
    )

    blocked = sum(
        1
        for transaction in transactions
        if transaction.decision == "BLOCK"
    )

    average_transaction = (
        total_spending / total_transactions
        if total_transactions
        else 0
    )

    return {
        "agent_id": agent_id,
        "total_transactions": total_transactions,
        "total_spending": total_spending,
        "average_transaction": round(
            average_transaction,
            2
        ),
        "allowed_transactions": allowed,
        "review_transactions": reviews,
        "blocked_transactions": blocked
    }


@router.get(
    "/agent/{agent_id}",
    response_model=list[TransactionResponse]
)
def get_agent_transactions(
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

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.agent_id == agent_id
        )
        .order_by(
            Transaction.evaluated_at.desc()
        )
        .all()
    )

    return [
        transaction_to_response(transaction)
        for transaction in transactions
    ]


@router.get(
    "/{transaction_id}/explanation",
    response_model=TransactionExplanation
)
def get_transaction_explanation(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    transaction = db.get(
        Transaction,
        transaction_id
    )

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    risk_factors = []

    reasons = (
        [
            reason.strip()
            for reason in transaction.reasons.split(",")
            if reason.strip()
        ]
        if transaction.reasons
        else []
    )

    for reason in reasons:

        reason_lower = reason.lower()

        if (
            "maximum" in reason_lower
            or "blocked" in reason_lower
            or "daily spending" in reason_lower
            or "allowed categories" in reason_lower
        ):
            factor_type = "POLICY"
            severity = "HIGH"

        elif "behavioral" in reason_lower:
            factor_type = "BEHAVIOR"
            severity = "HIGH"

        elif "historical average" in reason_lower:
            factor_type = "ANOMALY"
            severity = "HIGH"

        else:
            factor_type = "RISK"
            severity = "MEDIUM"

        risk_factors.append({
            "type": factor_type,
            "severity": severity,
            "message": reason
        })

    if transaction.decision == "BLOCK":
        summary = (
            "Transaction blocked due to one or more high-risk signals"
        )

    elif transaction.decision == "REVIEW":
        summary = (
            "Transaction requires additional review before approval"
        )

    else:
        summary = (
            "Transaction passed the current risk assessment"
        )

    return {
        "transaction_id": transaction.id,
        "decision": transaction.decision,
        "risk_score": transaction.risk_score,
        "summary": summary,
        "risk_factors": risk_factors,
        "evaluated_at": transaction.evaluated_at,
    }