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
from app.services.security_event_service import create_security_event
from app.services.audit_log_service import create_audit_log


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

    # -----------------------------------------
    # 1. FIND AGENT
    # -----------------------------------------

    agent = db.get(
        Agent,
        transaction_data.agent_id
    )

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    # -----------------------------------------
    # 2. CHECK AGENT STATUS
    # -----------------------------------------

    if agent.status in {"RESTRICTED", "SUSPENDED"}:
        raise HTTPException(
            status_code=403,
            detail=(
                f"Agent is {agent.status} "
                "and cannot process transactions"
            )
        )

    # -----------------------------------------
    # 3. ASSESS TRANSACTION RISK
    # -----------------------------------------

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

    # -----------------------------------------
    # 4. CREATE TRANSACTION
    # -----------------------------------------

    transaction = Transaction(
        agent_id=transaction_data.agent_id,
        amount=transaction_data.amount,
        category=transaction_data.category,

        decision=result["decision"],

        risk_score=result["risk_score"],

        reasons=(
            ",".join(result["reasons"])
            if result["reasons"]
            else None
        ),

        # -------------------------------------
        # MACHINE LEARNING RESULTS
        # -------------------------------------

        ml_anomaly_detected=result.get(
            "ml_anomaly_detected",
            False
        ),

        ml_score=result.get(
            "ml_score"
        ),

        ml_label=result.get(
            "ml_label"
        ),

        ml_reason=result.get(
            "ml_reason"
        ),
    )

    db.add(transaction)

    db.flush()

    # -----------------------------------------
    # 5. AUDIT LOG
    # -----------------------------------------

    create_audit_log(
        db=db,
        action="TRANSACTION_EVALUATED",
        entity_type="TRANSACTION",
        entity_id=transaction.id,
        agent_id=transaction.agent_id,
        transaction_id=transaction.id,
        details=(
            f"Decision: {transaction.decision}, "
            f"Risk Score: {transaction.risk_score}"
        )
    )

    # -----------------------------------------
    # 6. SECURITY EVENT - DECISION
    # -----------------------------------------

    if result["decision"] == "BLOCK":

        create_security_event(
            db=db,
            agent_id=transaction.agent_id,
            transaction_id=transaction.id,
            event_type="TRANSACTION_BLOCKED",
            severity="HIGH",
            message=(
                "Transaction was blocked by "
                "the risk assessment engine"
            )
        )

    elif result["decision"] == "REVIEW":

        create_security_event(
            db=db,
            agent_id=transaction.agent_id,
            transaction_id=transaction.id,
            event_type="TRANSACTION_REVIEW",
            severity="MEDIUM",
            message=(
                "Transaction requires additional "
                "review before approval"
            )
        )

    # -----------------------------------------
    # 7. SECURITY EVENT - STATISTICAL ANOMALY
    # -----------------------------------------

    if result.get("anomaly_detected"):

        anomaly_severity = (
            result.get("anomaly_severity")
            or "MEDIUM"
        )

        create_security_event(
            db=db,
            agent_id=transaction.agent_id,
            transaction_id=transaction.id,
            event_type="ANOMALY_DETECTED",
            severity=anomaly_severity,
            message=(
                "Transaction anomaly detected "
                "by the risk assessment engine"
            )
        )

    # -----------------------------------------
    # 8. SECURITY EVENT - ML ANOMALY
    # -----------------------------------------

    if result.get("ml_anomaly_detected"):

        ml_severity = (
            result.get("ml_label")
            or "MEDIUM"
        )

        create_security_event(
            db=db,
            agent_id=transaction.agent_id,
            transaction_id=transaction.id,
            event_type="ML_ANOMALY_DETECTED",
            severity=ml_severity,
            message=(
                "Transaction anomaly detected "
                "by Isolation Forest"
            )
        )

    # -----------------------------------------
    # 9. SAVE TRANSACTION
    # -----------------------------------------

    db.commit()

    db.refresh(transaction)

    # -----------------------------------------
    # 10. RETURN COMPLETE TRANSACTION
    # -----------------------------------------

    return {
        "id": transaction.id,

        "agent_id": transaction.agent_id,

        "amount": transaction.amount,

        "category": transaction.category,

        "decision": transaction.decision,

        "risk_score": transaction.risk_score,

        "reasons": result["reasons"],

        # Machine Learning
        "ml_anomaly_detected": bool(
            transaction.ml_anomaly_detected
        ),

        "ml_score": transaction.ml_score,

        "ml_label": transaction.ml_label,

        "ml_reason": transaction.ml_reason,

        "evaluated_at": transaction.evaluated_at,
    }