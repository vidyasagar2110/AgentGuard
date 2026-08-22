from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class PolicyCreate(BaseModel):
    max_transaction_amount: int = Field(gt=0)
    daily_spending_limit: int = Field(gt=0)
    approval_threshold: int = Field(gt=0)
    allowed_categories: list[str] = Field(default_factory=list)
    blocked_categories: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_limits(self):
        if self.approval_threshold > self.max_transaction_amount:
            raise ValueError(
                "Approval threshold cannot exceed maximum transaction amount"
            )

        if self.max_transaction_amount > self.daily_spending_limit:
            raise ValueError(
                "Maximum transaction amount cannot exceed daily spending limit"
            )

        return self


class PolicyResponse(BaseModel):
    id: int
    agent_id: int
    max_transaction_amount: int
    daily_spending_limit: int
    approval_threshold: int
    allowed_categories: list[str]
    blocked_categories: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PolicyUpdate(PolicyCreate):
    pass