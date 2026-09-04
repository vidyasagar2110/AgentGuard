from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent import Agent
from app.models.transaction import Transaction
from app.schemas.transaction import (
    TransactionResponse,
    TransactionExplanation,
)
from app.services.explanation_service import generate_ai_explanation


router = APIRouter(
    prefix="/transactions",
    tags=["Transaction History"]
)


# ============================================================
# TRANSACTION RESPONSE FORMATTER
# ============================================================

def transaction_to_response(
    transaction: Transaction
) -> dict:

    reasons = (
        [
            reason.strip()
            for reason in transaction.reasons.split(",")
            if reason.strip()
        ]
        if transaction.reasons
        else []
    )

    return {
        "id": transaction.id,

        "agent_id": transaction.agent_id,

        "amount": transaction.amount,

        "category": transaction.category,

        "decision": transaction.decision,

        "risk_score": transaction.risk_score,

        "reasons": reasons,

        # -----------------------------------------
        # MACHINE LEARNING
        # -----------------------------------------

        "ml_anomaly_detected": bool(
            transaction.ml_anomaly_detected
        ),

        "ml_score": (
            transaction.ml_score
            if transaction.ml_score is not None
            else 0.0
        ),

        "ml_label": (
            transaction.ml_label
            if transaction.ml_label
            else "NOT_AVAILABLE"
        ),

        "ml_reason": (
            transaction.ml_reason
            if transaction.ml_reason
            else (
                "ML analysis was not available "
                "when this transaction was evaluated"
            )
        ),

        "evaluated_at": transaction.evaluated_at,
    }


# ============================================================
# GET ALL TRANSACTIONS
# ============================================================

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

    # -----------------------------------------
    # FILTER BY AGENT
    # -----------------------------------------

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

    # -----------------------------------------
    # FILTER BY DECISION
    # -----------------------------------------

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

    # -----------------------------------------
    # FETCH
    # -----------------------------------------

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


# ============================================================
# AGENT TRANSACTION SUMMARY
# ============================================================

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

    total_transactions = len(
        transactions
    )

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


# ============================================================
# GET AGENT TRANSACTIONS
# ============================================================

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


# ============================================================
# GET SINGLE TRANSACTION
# ============================================================

@router.get(
    "/{transaction_id}",
    response_model=TransactionResponse
)
def get_transaction(
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

    return transaction_to_response(
        transaction
    )


# ============================================================
# TRANSACTION EXPLANATION
# ============================================================

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

    # --------------------------------------------------------
    # CLASSIFY RISK FACTORS
    # --------------------------------------------------------

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

        elif "ml anomaly" in reason_lower:

            factor_type = "MACHINE_LEARNING"
            severity = "MEDIUM"

        else:

            factor_type = "RISK"
            severity = "MEDIUM"

        risk_factors.append({
            "type": factor_type,
            "severity": severity,
            "message": reason
        })

    # --------------------------------------------------------
    # ADD ML RISK FACTOR
    # --------------------------------------------------------

    if transaction.ml_anomaly_detected:

        risk_factors.append({
            "type": "MACHINE_LEARNING",
            "severity": (
                transaction.ml_label
                if transaction.ml_label
                in {"LOW", "MEDIUM", "HIGH"}
                else "MEDIUM"
            ),
            "message": (
                transaction.ml_reason
                or (
                    "Isolation Forest identified "
                    "unusual transaction behavior"
                )
            )
        })

    # --------------------------------------------------------
    # GENERATE DECISION SUMMARY
    # --------------------------------------------------------

    if transaction.decision == "BLOCK":

        summary = (
            "Transaction blocked due to one or more "
            "high-risk signals"
        )

    elif transaction.decision == "REVIEW":

        summary = (
            "Transaction requires additional review "
            "before approval"
        )

    else:

        summary = (
            "Transaction passed the current "
            "risk assessment"
        )

    # --------------------------------------------------------
    # GENERATE AI EXPLANATION
    # --------------------------------------------------------

    ai_explanation = generate_ai_explanation(
        decision=transaction.decision,
        risk_score=transaction.risk_score,
        risk_factors=risk_factors,
    )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "transaction_id": transaction.id,

        "decision": transaction.decision,

        "risk_score": transaction.risk_score,

        "summary": summary,

        "ai_explanation": ai_explanation,

        "risk_factors": risk_factors,

        "evaluated_at": transaction.evaluated_at,
    }