from pydantic import BaseModel


class Anomaly(BaseModel):
    transaction_id: int
    amount: float
    category: str
    severity: str
    anomaly_type: str
    reason: str


class AgentAnomalyReport(BaseModel):
    agent_id: int
    total_transactions: int
    baseline_average: float
    anomalies_detected: int
    anomalies: list[Anomaly]