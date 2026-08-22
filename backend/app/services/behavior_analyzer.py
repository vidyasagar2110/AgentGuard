from sqlalchemy.orm import Session

from app.models.transaction import Transaction


def analyze_agent_behavior(
    db: Session,
    agent_id: int
) -> dict:

    transactions = (
        db.query(Transaction)
        .filter(Transaction.agent_id == agent_id)
        .order_by(Transaction.evaluated_at.desc())
        .all()
    )

    total_transactions = len(transactions)

    if total_transactions == 0:
        return {
            "agent_id": agent_id,
            "risk_level": "LOW",
            "risk_score": 0,
            "total_transactions": 0,
            "allowed_transactions": 0,
            "review_transactions": 0,
            "blocked_transactions": 0,
            "total_spending": 0,
            "average_transaction": 0,
            "maximum_transaction": 0,
            "block_rate": 0,
            "review_rate": 0,
            "reasons": [
                "No transaction history available"
            ]
        }

    allowed_transactions = sum(
        1
        for transaction in transactions
        if transaction.decision == "ALLOW"
    )

    review_transactions = sum(
        1
        for transaction in transactions
        if transaction.decision == "REVIEW"
    )

    blocked_transactions = sum(
        1
        for transaction in transactions
        if transaction.decision == "BLOCK"
    )

    total_spending = sum(
        transaction.amount
        for transaction in transactions
        if transaction.decision != "BLOCK"
    )

    average_transaction = (
        total_spending / max(
            allowed_transactions + review_transactions,
            1
        )
    )

    maximum_transaction = max(
        transaction.amount
        for transaction in transactions
    )

    block_rate = (
        blocked_transactions / total_transactions
    ) * 100

    review_rate = (
        review_transactions / total_transactions
    ) * 100

    risk_score = 0
    reasons = []

    # Block rate
    if block_rate >= 30:
        risk_score += 40
        reasons.append(
            "High rate of blocked transactions"
        )
    elif block_rate >= 15:
        risk_score += 25
        reasons.append(
            "Elevated rate of blocked transactions"
        )

    # Review rate
    if review_rate >= 30:
        risk_score += 20
        reasons.append(
            "High rate of transactions requiring review"
        )
    elif review_rate >= 15:
        risk_score += 10
        reasons.append(
            "Elevated rate of transactions requiring review"
        )

    # Large transactions
    if average_transaction > 7000:
        risk_score += 20
        reasons.append(
            "Average transaction amount is high"
        )

    # Repeated blocked behavior
    if blocked_transactions >= 3:
        risk_score += 20
        reasons.append(
            "Repeated policy violations detected"
        )

    risk_score = min(risk_score, 100)

    if risk_score >= 70:
        risk_level = "HIGH"
    elif risk_score >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    if not reasons:
        reasons.append(
            "No significant abnormal behavior detected"
        )

    return {
        "agent_id": agent_id,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "total_transactions": total_transactions,
        "allowed_transactions": allowed_transactions,
        "review_transactions": review_transactions,
        "blocked_transactions": blocked_transactions,
        "total_spending": total_spending,
        "average_transaction": round(
            average_transaction,
            2
        ),
        "maximum_transaction": maximum_transaction,
        "block_rate": round(block_rate, 2),
        "review_rate": round(review_rate, 2),
        "reasons": reasons
    }