from datetime import datetime

from pydantic import BaseModel


class SecurityEventResponse(BaseModel):
    id: int
    agent_id: int
    transaction_id: int | None
    event_type: str
    severity: str
    message: str
    created_at: datetime