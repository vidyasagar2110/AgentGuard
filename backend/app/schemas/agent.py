from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict


class AgentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    MONITORED = "MONITORED"
    RESTRICTED = "RESTRICTED"
    SUSPENDED = "SUSPENDED"


class AgentCreate(BaseModel):
    name: str
    description: str | None = None


class AgentStatusUpdate(BaseModel):
    status: AgentStatus


class AgentResponse(BaseModel):
    id: int
    name: str
    description: str | None
    status: AgentStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)