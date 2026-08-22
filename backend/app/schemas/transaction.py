from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TransactionEvaluate(BaseModel):
    agent_id: int = Field(gt=0)
    amount: int = Field(gt=0)
    category: str = Field(min_length=1, max_length=100)


class TransactionResponse(BaseModel):
    id: int
    agent_id: int
    amount: int
    category: str
    decision: str
    risk_score: int
    reasons: list[str]
    evaluated_at: datetime

    model_config = ConfigDict(from_attributes=True)