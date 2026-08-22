from pydantic import BaseModel


class AgentTrustScore(BaseModel):
    agent_id: int
    trust_score: int
    risk_score: int
    risk_level: str
    status: str
    recommendation: str