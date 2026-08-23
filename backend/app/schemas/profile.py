from pydantic import BaseModel


class AgentRiskProfile(BaseModel):
    agent_id: int
    agent_name: str
    agent_status: str

    trust_score: int
    trust_status: str

    risk_score: int
    risk_level: str

    total_transactions: int
    allowed_transactions: int
    review_transactions: int
    blocked_transactions: int

    total_spending: int
    average_transaction: float
    maximum_transaction: int

    block_rate: float
    review_rate: float

    anomalies_detected: int

    recommendation: str
    reasons: list[str]