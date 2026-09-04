from sqlalchemy.orm import Session

from app.models.policy import AgentPolicy
from app.models.transaction import Transaction
from app.services.risk_engine import evaluate_transaction
from app.services.behavior_analyzer import analyze_agent_behavior
from app.services.ml_anomaly_detector import detect_ml_anomaly


def assess_transaction_risk(
    db: Session,
    agent_id: int,
    amount: int,
    category: str
) -> dict:

    policy = (
        db.query(AgentPolicy)
        .filter(AgentPolicy.agent_id == agent_id)
        .first()
    )

    if not policy:
        raise ValueError(
            "No policy found for this agent"
        )

    # -----------------------------------------
    # 1. POLICY RISK
    # -----------------------------------------

    policy_result = evaluate_transaction(
        db=db,
        policy=policy,
        amount=amount,
        category=category
    )

    # -----------------------------------------
    # 2. AGENT BEHAVIOR
    # -----------------------------------------

    behavior = analyze_agent_behavior(
        db=db,
        agent_id=agent_id
    )

    # -----------------------------------------
    # 3. EXISTING STATISTICAL ANOMALY
    # -----------------------------------------

    historical_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.agent_id == agent_id
        )
        .order_by(Transaction.evaluated_at.asc())
        .all()
    )

    anomaly_detected = False
    anomaly_severity = None
    anomaly_reason = None

    if historical_transactions:

        historical_amounts = [
            float(transaction.amount)
            for transaction in historical_transactions
        ]

        historical_average = (
            sum(historical_amounts)
            / len(historical_amounts)
        )

        if historical_average > 0:

            ratio = amount / historical_average

            if ratio >= 4:
                anomaly_detected = True
                anomaly_severity = "HIGH"
                anomaly_reason = (
                    "Transaction amount is significantly "
                    "above the agent's historical average"
                )

            elif ratio >= 2.5:
                anomaly_detected = True
                anomaly_severity = "MEDIUM"
                anomaly_reason = (
                    "Transaction amount is substantially "
                    "above the agent's historical average"
                )

    # -----------------------------------------
    # 4. MACHINE LEARNING ANOMALY DETECTION
    # -----------------------------------------

    ml_result = detect_ml_anomaly(
        db=db,
        agent_id=agent_id,
        amount=amount
    )

    # -----------------------------------------
    # 5. COMBINE RISK SIGNALS
    # -----------------------------------------

    final_risk_score = policy_result["risk_score"]

    reasons = list(
        policy_result["reasons"]
    )

    # Agent behavioral risk
    if behavior["risk_level"] == "HIGH":

        final_risk_score += 20

        reasons.append(
            "Agent has high behavioral risk"
        )

    elif behavior["risk_level"] == "MEDIUM":

        final_risk_score += 10

        reasons.append(
            "Agent has elevated behavioral risk"
        )

    # Statistical anomaly
    if anomaly_detected:

        if anomaly_severity == "HIGH":
            final_risk_score += 30

        elif anomaly_severity == "MEDIUM":
            final_risk_score += 15

        reasons.append(
            anomaly_reason
        )

    # -----------------------------------------
    # 6. ML RISK SIGNAL
    # -----------------------------------------

    ml_risk_contribution = 0

    if ml_result["ml_available"]:

        if ml_result["ml_label"] == "HIGH":
            ml_risk_contribution = 25

        elif ml_result["ml_label"] == "MEDIUM":
            ml_risk_contribution = 10

        elif ml_result["ml_label"] == "LOW":
            ml_risk_contribution = 0

        if ml_result["ml_anomaly"]:

            final_risk_score += ml_risk_contribution

            reasons.append(
                "ML anomaly detection identified unusual "
                "transaction behavior"
            )

    # -----------------------------------------
    # 7. LIMIT SCORE
    # -----------------------------------------

    final_risk_score = min(
        final_risk_score,
        100
    )

    # -----------------------------------------
    # 8. FINAL DECISION
    # -----------------------------------------

    if policy_result["decision"] == "BLOCK":

        decision = "BLOCK"

    elif final_risk_score >= 70:

        decision = "BLOCK"

    elif final_risk_score >= 30:

        decision = "REVIEW"

    else:

        decision = "ALLOW"

    # -----------------------------------------
    # 9. RETURN COMPLETE ASSESSMENT
    # -----------------------------------------

    return {
        "agent_id": agent_id,
        "amount": amount,
        "category": category,

        "decision": decision,

        "risk_score": final_risk_score,

        "agent_risk_level": behavior[
            "risk_level"
        ],

        "agent_risk_score": behavior[
            "risk_score"
        ],

        # Existing anomaly detection
        "anomaly_detected": anomaly_detected,
        "anomaly_severity": anomaly_severity,

        # Machine learning
        "ml_anomaly_detected": bool(
            ml_result["ml_anomaly"]
        ),

        "ml_available": ml_result[
            "ml_available"
        ],

        "ml_score": ml_result[
            "ml_score"
        ],

        "ml_label": ml_result[
            "ml_label"
        ],

        "ml_reason": ml_result[
            "reason"
        ],

        "reasons": reasons
    }