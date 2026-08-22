from pydantic import BaseModel


class AgentRiskProfile(BaseModel):
    agent_id: int
    risk_level: str
    risk_score: int
    total_transactions: int
    allowed_transactions: int
    review_transactions: int
    blocked_transactions: int
    total_spending: int
    average_transaction: float
    maximum_transaction: int
    block_rate: float
    review_rate: float
    reasons: list[str]