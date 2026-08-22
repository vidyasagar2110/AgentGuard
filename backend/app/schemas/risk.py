from pydantic import BaseModel, Field, field_validator


class RiskAssessmentRequest(BaseModel):
    agent_id: int = Field(gt=0)
    amount: int = Field(gt=0, le=10_000_000)
    category: str = Field(min_length=1, max_length=100)

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Category cannot be empty")

        return value


class RiskAssessmentResponse(BaseModel):
    agent_id: int
    amount: int
    category: str
    decision: str
    risk_score: int
    agent_risk_level: str
    agent_risk_score: int
    anomaly_detected: bool
    anomaly_severity: str | None
    reasons: list[str]