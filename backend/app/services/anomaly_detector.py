from sqlalchemy.orm import Session

from app.models.transaction import Transaction


def detect_agent_anomalies(
    db: Session,
    agent_id: int
) -> dict:

    transactions = (
        db.query(Transaction)
        .filter(Transaction.agent_id == agent_id)
        .order_by(Transaction.evaluated_at.asc())
        .all()
    )

    total_transactions = len(transactions)

    if total_transactions == 0:
        return {
            "agent_id": agent_id,
            "total_transactions": 0,
            "baseline_average": 0,
            "anomalies_detected": 0,
            "anomalies": []
        }

    anomalies = []
    historical_amounts = []

    for transaction in transactions:

        amount = float(transaction.amount)

        if historical_amounts:
            baseline_average = (
                sum(historical_amounts)
                / len(historical_amounts)
            )

            ratio = amount / baseline_average

            if ratio >= 4:
                anomalies.append({
                    "transaction_id": transaction.id,
                    "amount": amount,
                    "category": transaction.category,
                    "severity": "HIGH",
                    "anomaly_type": "AMOUNT_ANOMALY",
                    "reason": (
                        "Transaction amount is significantly "
                        "above the agent's previous historical average"
                    )
                })

            elif ratio >= 2.5:
                anomalies.append({
                    "transaction_id": transaction.id,
                    "amount": amount,
                    "category": transaction.category,
                    "severity": "MEDIUM",
                    "anomaly_type": "AMOUNT_ANOMALY",
                    "reason": (
                        "Transaction amount is substantially "
                        "above the agent's previous historical average"
                    )
                })

        historical_amounts.append(amount)

    baseline_average = (
        sum(historical_amounts)
        / len(historical_amounts)
    )

    return {
        "agent_id": agent_id,
        "total_transactions": total_transactions,
        "baseline_average": round(
            baseline_average,
            2
        ),
        "anomalies_detected": len(anomalies),
        "anomalies": anomalies
    }