from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TransactionEvaluate(BaseModel):
    agent_id: int = Field(gt=0)
    amount: int = Field(gt=0)
    category: str = Field(
        min_length=1,
        max_length=100
    )


class TransactionResponse(BaseModel):
    id: int
    agent_id: int
    amount: int
    category: str
    decision: str
    risk_score: int
    reasons: list[str]

    # Machine Learning
    ml_anomaly_detected: bool
    ml_score: float | None
    ml_label: str | None
    ml_reason: str | None

    evaluated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class RiskFactor(BaseModel):
    type: str
    severity: str
    message: str


class TransactionExplanation(BaseModel):
    transaction_id: int
    decision: str
    risk_score: int
    summary: str
    ai_explanation: str | None = None
    risk_factors: list[RiskFactor]
    evaluated_at: datetime