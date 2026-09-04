from sqlalchemy.orm import Session
from sklearn.ensemble import IsolationForest

from app.models.transaction import Transaction


MINIMUM_TRAINING_SAMPLES = 5


def detect_ml_anomaly(
    db: Session,
    agent_id: int,
    amount: float,
) -> dict:
    """
    Detect whether a transaction amount is anomalous
    compared with the agent's historical normal behavior.

    Isolation Forest provides an additional ML signal.
    It does not directly make the final security decision.
    """

    # -------------------------------------------------
    # 1. LOAD HISTORICAL TRANSACTIONS
    # -------------------------------------------------

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.agent_id == agent_id,
            Transaction.decision != "BLOCK",
        )
        .order_by(Transaction.evaluated_at.asc())
        .all()
    )

    historical_amounts = [
        float(transaction.amount)
        for transaction in transactions
    ]

    # -------------------------------------------------
    # 2. CHECK TRAINING DATA
    # -------------------------------------------------

    if len(historical_amounts) < MINIMUM_TRAINING_SAMPLES:
        return {
            "ml_available": False,
            "ml_anomaly": False,
            "ml_score": 0.0,
            "ml_label": "INSUFFICIENT_DATA",
            "reason": (
                "Insufficient historical normal transactions "
                "for ML anomaly detection"
            ),
        }

    # -------------------------------------------------
    # 3. TRAIN ISOLATION FOREST
    # -------------------------------------------------

    training_data = [
        [transaction_amount]
        for transaction_amount in historical_amounts
    ]

    model = IsolationForest(
        n_estimators=100,
        contamination="auto",
        random_state=42,
    )

    model.fit(training_data)

    # -------------------------------------------------
    # 4. PREDICT CURRENT TRANSACTION
    # -------------------------------------------------

    current_data = [[float(amount)]]

    prediction = model.predict(current_data)[0]

    raw_score = float(
        model.decision_function(current_data)[0]
    )

    is_anomaly = prediction == -1

    # -------------------------------------------------
    # 5. CONVERT MODEL SCORE
    # -------------------------------------------------

    # Isolation Forest:
    # higher decision_function = more normal
    # lower decision_function = more anomalous
    #
    # Convert this into a 0-100 suspiciousness score.

    anomaly_score = max(
        0.0,
        min(
            100.0,
            (0.5 - raw_score) * 100,
        ),
    )

    # -------------------------------------------------
    # 6. CLASSIFY ML SIGNAL
    # -------------------------------------------------

    if anomaly_score >= 70:
        label = "HIGH"

    elif anomaly_score >= 40:
        label = "MEDIUM"

    else:
        label = "LOW"

    # -------------------------------------------------
    # 7. EXPLANATION
    # -------------------------------------------------

    if is_anomaly:
        reason = (
            "Isolation Forest identified the transaction "
            "amount as statistically unusual compared with "
            "this agent's historical normal behavior"
        )

    else:
        reason = (
            "Isolation Forest did not identify the transaction "
            "amount as statistically unusual compared with "
            "this agent's historical normal behavior"
        )

    # -------------------------------------------------
    # 8. RETURN ML RESULT
    # -------------------------------------------------

    return {
        "ml_available": True,
        "ml_anomaly": bool(is_anomaly),
        "ml_score": round(anomaly_score, 2),
        "ml_label": label,
        "reason": reason,
    }