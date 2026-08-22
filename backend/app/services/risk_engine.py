from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.policy import AgentPolicy
from app.models.transaction import Transaction


def evaluate_transaction(
    db: Session,
    policy: AgentPolicy,
    amount: int,
    category: str
) -> dict:

    reasons = []
    risk_score = 0
    hard_block = False

    normalized_category = category.strip().lower()

    blocked_categories = {
        item.strip().lower()
        for item in (policy.blocked_categories or "").split(",")
        if item.strip()
    }

    allowed_categories = {
        item.strip().lower()
        for item in (policy.allowed_categories or "").split(",")
        if item.strip()
    }

    # Rule 1: Maximum transaction amount
    if amount > policy.max_transaction_amount:
        risk_score += 60
        hard_block = True
        reasons.append(
            "Transaction exceeds maximum transaction limit"
        )

    # Rule 2: Blocked category
    if normalized_category in blocked_categories:
        risk_score += 80
        hard_block = True
        reasons.append(
            "Transaction category is blocked"
        )

    # Rule 3: Allowed category
    if (
        allowed_categories
        and normalized_category not in allowed_categories
    ):
        risk_score += 40
        reasons.append(
            "Transaction category is not in the allowed categories"
        )

    # Rule 4: Daily spending limit
    start_of_day = datetime.now(timezone.utc).replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    daily_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.agent_id == policy.agent_id,
            Transaction.evaluated_at >= start_of_day,
            Transaction.decision != "BLOCK"
        )
        .all()
    )

    spent_today = sum(
        transaction.amount
        for transaction in daily_transactions
    )

    if spent_today + amount > policy.daily_spending_limit:
        risk_score += 70
        hard_block = True
        reasons.append(
            "Transaction would exceed daily spending limit"
        )

    # Rule 5: Approval threshold
    requires_approval = (
        amount >= policy.approval_threshold
    )

    if requires_approval and not hard_block:
        reasons.append(
            "Transaction requires approval"
        )

    risk_score = min(risk_score, 100)

    # Final decision
    if hard_block:
        decision = "BLOCK"
    elif requires_approval or risk_score >= 30:
        decision = "REVIEW"
    else:
        decision = "ALLOW"

    return {
        "decision": decision,
        "risk_score": risk_score,
        "reasons": reasons,
    }