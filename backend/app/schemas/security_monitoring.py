from datetime import datetime

from pydantic import BaseModel


class SecurityActivityResponse(BaseModel):
    id: int
    source: str
    agent_id: int | None
    transaction_id: int | None
    activity_type: str
    severity: str | None
    message: str
    created_at: datetime